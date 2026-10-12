// inspector.js — browser-only live neural-net visualizer for the selected fish.
const OUT = 5, OUT_LABELS = ['Turn', 'Thrust', 'Strike', 'Flee', 'Hide'];

export class Inspector {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  }
  _fit() {
    const r = this.canvas.getBoundingClientRect(), dpr = this.dpr;
    const w = Math.max(220, r.width | 0), h = Math.max(200, r.height | 0);
    if (this.canvas.width !== w * dpr) { this.canvas.width = w * dpr; this.canvas.height = h * dpr; }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.W = w; this.H = h;
  }
  draw(agent) {
    this._fit();
    const ctx = this.ctx, Wd = this.W, Hd = this.H;
    ctx.clearRect(0, 0, Wd, Hd);
    if (!agent) { ctx.fillStyle = '#5b7d86'; ctx.font = '11px "Space Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('select a fish to inspect its brain', Wd / 2, Hd / 2); return; }

    const sp = agent.sp, IN = sp.shape.in, HID = sp.shape.hid, g = agent.lw || agent.g, act = agent.act;   // show the LIVE plastic policy (lifetime learning), falling back to the genotype
    const padL = 96, padR = 64, padT = 16, padB = 14;
    const colX = [padL, (Wd - padL - padR) / 2 + padL, Wd - padR];
    const yOf = (i, n) => padT + (Hd - padT - padB) * (n === 1 ? 0.5 : i / (n - 1));

    // genome offsets: W1[hid*in] B1[hid] W2[out*hid] B2[out]
    const W1 = 0, W2 = HID * IN + HID;
    const wcol = (w, a) => { const m = Math.min(1, Math.abs(w) * 0.6) * (0.25 + 0.75 * Math.abs(a)); return w >= 0 ? `rgba(120,255,205,${m})` : `rgba(255,110,150,${m})`; };

    // synapses input->hidden
    ctx.lineWidth = 1;
    for (let j = 0; j < HID; j++) {
      const hy = yOf(j, HID), hx = colX[1];
      for (let i = 0; i < IN; i++) {
        const w = g[W1 + j * IN + i]; if (Math.abs(w) < 0.05) continue;
        ctx.strokeStyle = wcol(w, act.in[i]); ctx.beginPath(); ctx.moveTo(colX[0], yOf(i, IN)); ctx.lineTo(hx, hy); ctx.stroke();
      }
    }
    // synapses hidden->output
    for (let k = 0; k < OUT; k++) {
      const oy = yOf(k, OUT), ox = colX[2];
      for (let j = 0; j < HID; j++) {
        const w = g[W2 + k * HID + j]; if (Math.abs(w) < 0.05) continue;
        ctx.strokeStyle = wcol(w, act.h[j]); ctx.beginPath(); ctx.moveTo(colX[1], yOf(j, HID)); ctx.lineTo(ox, oy); ctx.stroke();
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
    for (let j = 0; j < HID; j++) node(ctx, colX[1], yOf(j, HID), 4, act.h[j]);
    // outputs
    ctx.textAlign = 'left';
    // raw outputs: turn ∈ −1..1; thrust/strike/flee/hide ∈ 0..1 (mapped to −1..1 for the node fill)
    const raw = [act.turn, act.thrust, act.strike || 0, act.flee || 0, act.hide || 0];
    for (let k = 0; k < OUT; k++) {
      const y = yOf(k, OUT); node(ctx, colX[2], y, 5, k === 0 ? raw[0] : raw[k] * 2 - 1);
      ctx.fillStyle = '#cfe8d8'; ctx.fillText(OUT_LABELS[k], colX[2] + 10, y - 6);
      ctx.fillStyle = '#7f9da6'; ctx.fillText(raw[k].toFixed(2), colX[2] + 10, y + 6);
    }

    // header
    ctx.textAlign = 'left'; ctx.fillStyle = '#cfe8d8'; ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(sp.name.toUpperCase(), 6, 8);
    ctx.font = '9px "Space Mono", monospace'; ctx.fillStyle = '#6f9aa3';
    ctx.fillText(`gen ${agent.gen} · ${IN}\u2192${HID}\u21922 · ate ${agent.eaten}`, 6, Hd - 6);
  }
}

function node(ctx, x, y, r, a) {
  const v = Math.max(-1, Math.min(1, a));
  const col = v >= 0 ? [120, 255, 205] : [255, 110, 150];
  const lum = 0.25 + 0.75 * Math.abs(v);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
  ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${lum})`; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(180,220,255,0.35)'; ctx.stroke();
}
