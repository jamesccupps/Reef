// envshare3.js — the water model's state in SHARED MEMORY (docs/TRUE_SCALE.md T5) — pure, DOM-free. The sim's worker holds the
// water model (Env3 and its chem, plants and littoral parts) and steps it; the shards' workers each build a replica of it and
// adopt its arrays — every typed array reachable from it, moved onto SharedArrayBuffers — so the fish in every shard read and
// write the one water. A typed array referenced from several places moves everywhere at once. The scalars (the clock, the
// light, the weather, the turbidity…) are copied over after each of the water's steps.
// (env.G — the columns' geometry — is static and each replica builds its own.)

// every reference to a typed array reachable from root: [{arr, refs: [[obj, key], …], path}], the path the first one found
// (the traversal follows Object.keys: two models built alike list theirs alike)
function arraysOf(root) {
  const seen = new Set(), byArr = new Map(), out = [];
  const walk = (o, path) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    const keys = Array.isArray(o) ? o.keys() : Object.keys(o);
    for (const k of keys) {
      if (o === root && k === 'G') continue;
      const v = o[k], p = path + '/' + k;
      if (ArrayBuffer.isView(v) && !(v instanceof DataView)) { let e = byArr.get(v); if (!e) { e = { arr: v, refs: [], path: p }; byArr.set(v, e); out.push(e); } e.refs.push([o, k]); }
      else if (v && typeof v === 'object') walk(v, p);
    }
  };
  walk(root, '');
  return out;
}
// move every typed array of root onto shared memory (the sim's worker, once, before any step): returns the list for the shards
export function shareArrays(root) {
  const list = [];
  for (const e of arraysOf(root)) {
    const T = e.arr.constructor, sab = new SharedArrayBuffer(e.arr.byteLength), s = new T(sab);
    s.set(e.arr); for (const [o, k] of e.refs) o[k] = s;
    list.push({ path: e.path, type: T.name, sab, length: e.arr.length });
  }
  return list;
}
// a replica takes the shared arrays (a shard's worker, after building its own model alike); returns how many it could not place
export function adoptArrays(root, list) {
  const mine = new Map(arraysOf(root).map(e => [e.path, e])); let missed = 0;
  for (const d of list) {
    const e = mine.get(d.path); if (!e || e.arr.constructor.name !== d.type || e.arr.length !== d.length) { missed++; continue; }
    const s = new e.arr.constructor(d.sab); for (const [o, k] of e.refs) o[k] = s;
  }
  return missed;
}
// the scalars of root's objects (numbers, booleans, strings), by path — what the shards copy after each water step
export function scalarsOf(root) {
  const seen = new Set(), out = [];
  const walk = (o, path) => {
    if (!o || typeof o !== 'object' || seen.has(o) || ArrayBuffer.isView(o)) return; seen.add(o);
    if (Array.isArray(o)) { if (o.length > 64) return;   // (a long list is structure built once — the through-flow's lists per column — not state)
      for (let i = 0; i < o.length; i++) { const v = o[i]; if (v !== null && typeof v === 'object') walk(v, path + '/' + i); else if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') out.push([path + '/' + i, v]); } return; }
    for (const k of Object.keys(o)) {
      if (k === 'G') continue;   // (the columns' geometry, wherever it is held: static)
      if (Object.getOwnPropertyDescriptor(o, k).get) continue;   // (a getter is derived — chem3's inflows' `in` — not state, and can't be set)
      const v = o[k], p = path + '/' + k;
      if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') out.push([p, v]);
      else if (v && typeof v === 'object') walk(v, p);
    }
  };
  walk(root, '');
  return out;
}
export function setScalars(root, list) {
  for (const [path, v] of list) {
    const ks = path.split('/').slice(1); let o = root;
    for (let i = 0; i < ks.length - 1 && o; i++) o = o[ks[i]];
    if (o && typeof o === 'object') o[ks[ks.length - 1]] = v;
  }
}
