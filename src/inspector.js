// inspector.js — browser-only live neural-net visualizer for the selected fish.
import { OUT } from './core.js';
const OUT_LABELS = ['Turn', 'Thrust', 'Strike', 'Flee', 'Hide'];
const DIM_SYN = 'rgba(140,165,175,0.07)';   // synapses of a masked (evolved-away) hidden unit: drawn faint, they carry nothing
const fmtInt = v => { const n = Number(v); return Number.isFinite(n) ? String(Math.trunc(n)) : '—'; };

export class Inspector {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
  }
  // re-read every frame: the ratio changes when the window moves to another monitor or the page is zoomed
  get dpr() { return Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2); }
  _fit() {
    const r = this.canvas.getBoundingClientRect(), dpr = this.dpr;
    const w = Math.max(220, r.width | 0), h = Math.max(200, r.height | 0);
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (this.canvas.width !== bw || this.canvas.height !== bh) { this.canvas.width = bw; this.canvas.height = bh; }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.W = w; this.H = h;
  }
  draw(agent) {
    this._fit();
    const ctx = this.ctx, Wd = this.W, Hd = this.H;
    ctx.clearRect(0, 0, Wd, Hd);
    if (!agent) { ctx.fillStyle = '#5b7d86'; ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('select a fish to inspect its brain', Wd / 2, Hd / 2); return; }

    const sp = agent.sp, IN = sp.shape.in, HID = sp.shape.hid, g = agent.lw || agent.g, act = agent.act;   // show the LIVE plastic policy (lifetime learning), falling back to the genotype
    // evolvable brain size: hidden units ≥ activeHid are MASKED by forward() (inert) — draw them and their synapses dimmed
    const AH = Number.isFinite(agent.activeHid) ? Math.max(0, Math.min(HID, agent.activeHid | 0)) : HID;
    const padL = 96, padR = 64, padT = 16, padB = 14;
    const colX = [padL, (Wd - padL - padR) / 2 + padL, Wd - padR];
    const yOf = (i, n) => padT + (Hd - padT - padB) * (n === 1 ? 0.5 : i / (n - 1));

    // genome offsets: W1[hid*in] B1[hid] W2[out*hid] B2[out]
    const W1 = 0, W2 = HID * IN + HID;
    const wcol = (w, a) => { const m = Math.min(1, Math.abs(w) * 0.6) * (0.25 + 0.75 * Math.abs(a)); return w >= 0 ? `rgba(120,255,205,${m})` : `rgba(255,110,150,${m})`; };

    // synapses input->hidden (masked units first, faint, so the live wiring draws on top)
    ctx.lineWidth = 1;
    for (const live of [false, true]) {
      for (let j = 0; j < HID; j++) {
        if ((j < AH) !== live) continue;
        const hy = yOf(j, HID), hx = colX[1];
        for (let i = 0; i < IN; i++) {
          const w = g[W1 + j * IN + i]; if (Math.abs(w) < 0.05) continue;
          ctx.strokeStyle = live ? wcol(w, act.in[i]) : DIM_SYN; ctx.beginPath(); ctx.moveTo(colX[0], yOf(i, IN)); ctx.lineTo(hx, hy); ctx.stroke();
        }
      }
      // synapses hidden->output
      for (let k = 0; k < OUT; k++) {
        const oy = yOf(k, OUT), ox = colX[2];
        for (let j = 0; j < HID; j++) {
          if ((j < AH) !== live) continue;
          const w = g[W2 + k * HID + j]; if (Math.abs(w) < 0.05) continue;
          ctx.strokeStyle = live ? wcol(w, act.h[j]) : DIM_SYN; ctx.beginPath(); ctx.moveTo(colX[1], yOf(j, HID)); ctx.lineTo(ox, oy); ctx.stroke();
        }
      }
    }

    // nodes
    ctx.font = '9px "Space Mono", monospace'; ctx.textBaseline = 'middle';
    // inputs with labels + value bars
    ctx.textAlign = 'right';
    for (let i = 0; i < IN; i++) {
      const y = yOf(i, IN), v = act.in[i];
      node(ctx, colX[0], y, 3.4, v);
      ctx.fillStyle = '#8fb6bf'; ctx.fillText(sp.inputLabels[i] || ('in' + i), colX[0] - 9, y);
      // value bar
      ctx.fillStyle = v >= 0 ? 'rgba(120,255,205,0.5)' : 'rgba(255,110,150,0.5)';
      ctx.fillRect(colX[0] + 6, y - 1, Math.max(-12, Math.min(12, v * 12)), 2);
    }
    // hidden
    for (let j = 0; j < HID; j++) { if (j < AH) node(ctx, colX[1], yOf(j, HID), 4, act.h[j]); else maskedNode(ctx, colX[1], yOf(j, HID), 4); }
    // outputs
    ctx.textAlign = 'left';
    // raw outputs: turn ∈ −1..1; thrust/strike/flee/hide ∈ 0..1 (mapped to −1..1 for the node fill)
    const raw = [act.turn, act.thrust, act.strike || 0, act.flee || 0, act.hide || 0];
    for (let k = 0; k < OUT; k++) {
      const y = yOf(k, OUT), r = Number(raw[k]) || 0; node(ctx, colX[2], y, 5, k === 0 ? r : r * 2 - 1);
      ctx.fillStyle = '#cfe8d8'; ctx.fillText(OUT_LABELS[k] || ('out' + k), colX[2] + 10, y - 6);
      ctx.fillStyle = '#7f9da6'; ctx.fillText(r.toFixed(2), colX[2] + 10, y + 6);
    }

    // header + footer: inputs → active/total hidden → outputs
    ctx.textAlign = 'left'; ctx.fillStyle = '#cfe8d8'; ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(sp.name.toUpperCase(), 6, 8);
    ctx.font = '9px "Space Mono", monospace'; ctx.fillStyle = '#6f9aa3';
    const hid = AH < HID ? `${AH}/${HID}` : `${HID}`;
    ctx.fillText(`gen ${fmtInt(agent.gen)} · ${IN}→${hid}→${OUT} · ate ${fmtInt(agent.eaten)}`, 6, Hd - 6);
  }
}

// a masked hidden unit: hollow + faint (no activation — forward() holds it at 0)
function maskedNode(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
  ctx.fillStyle = 'rgba(40,60,70,0.35)'; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(140,165,175,0.22)'; ctx.stroke();
}

function node(ctx, x, y, r, a) {
  const v = Math.max(-1, Math.min(1, a));
  const col = v >= 0 ? [120, 255, 205] : [255, 110, 150];
  const lum = 0.25 + 0.75 * Math.abs(v);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
  ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${lum})`; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(180,220,255,0.35)'; ctx.stroke();
}
