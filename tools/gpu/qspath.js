// Set a value at a dotted path that comes from the page's URL (year.js: ?s3.<species>.<path>=v) — safely, because the GPU tools'
// pages are public on GitHub Pages (the same origin as everything else on jamesccupps.github.io): it walks only into objects' own
// properties and never through __proto__, constructor or prototype, so ?s3.__proto__.x=1 can't write onto Object.prototype (code
// scanning alert #2). Returns whether it set anything. Pure (no DOM): test/ui-check.mjs runs it.
export function setPath(root, path, value) {
  const keys = String(path).split('.'), last = keys.pop();
  let o = root;
  for (const q of keys) o = o && typeof o === 'object' && q !== '__proto__' && q !== 'constructor' && q !== 'prototype' && Object.hasOwn(o, q) ? o[q] : null;
  if (!o || typeof o !== 'object' || last === '__proto__' || last === 'constructor' || last === 'prototype') return false;
  o[last] = value;
  return true;
}
