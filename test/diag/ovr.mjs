// shared overrides for the diagnostics: SET=KEY.PATH=value,... — config.js paths, or SP.<species>.<path> (species.js); a value
// ending in "/d" is a per-real-day rate (stored as an accessor returning v / BIOE.DAY, like the config's own getters)
export async function applySet(R) {
  const CFG = await import(R + 'config.js'), { SP } = await import(R + 'species.js');
  for (const kv of (process.env.SET || '').split(',').filter(Boolean)) {
    const [lhs, vs] = kv.split('='); const path = lhs.split('.'); let o = path[0] === 'SP' ? (path.shift(), SP) : CFG;
    while (path.length > 1) o = o[path.shift()];
    const k = path[0], perDay = vs.endsWith('/d'), v = parseFloat(vs);
    Object.defineProperty(o, k, perDay ? { get: () => v / CFG.BIOE.DAY, configurable: true, enumerable: true } : { value: v, writable: true, configurable: true, enumerable: true });
  }
}
