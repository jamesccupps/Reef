// w3_bench_shards.mjs — the true-size lakes' coarse blocks on one thread and in shards (docs/TRUE_SCALE.md T5):
//   HB_WORLD=true node tools/w3_bench_shards.mjs [blocks=4] [yf=0.4]
// Each mode starts from the same random state, runs the founding (with the season's young), one warm-up block, then `blocks`
// 29-min blocks with the water stepped after each; prints the seconds a block and the fish at the end.
const R = new URL('../src/', import.meta.url).href;
const { Env3 } = await import(R + 'w3/env3.js'); const { Fish3, KEYS3 } = await import(R + 'w3/fish3.js');
const { ShardPool } = await import(R + 'w3/shardpool3.js'); const { seed, getRandState, setRandState } = await import(R + 'core.js');
const { nodeShardSpawner } = await import('./w3_shard_host.mjs');
const N = +(process.argv[2] || 4), yf0 = +(process.argv[3] || 0.4), B = 1752;
seed(611); const st0 = getRandState();
{ // one thread
  setRandState(st0); const e = new Env3({ yf0 }), F = new Fish3(e, { young: true });
  F.step(B); e.step(B); const t = performance.now(); for (let i = 0; i < N; i++) { F.step(B); e.step(B); }
  const s = (performance.now() - t) / 1000 / N, n = F.cnt.reduce((a, v) => a + v, 0);
  console.log(`one thread: ${s.toFixed(2)} s a block (${(B / s).toFixed(0)}× real time), ${F.fish.length} agents, ${n.toFixed(0)} fish`);
}
{ // shards
  setRandState(st0); const e = new Env3({ yf0 });
  const P = await ShardPool.start(e, 2, st0, nodeShardSpawner(process.env.HB_WORLD === 'true' ? '?world=true' : ''));
  await P.step(B); e.step(B); P.envStepped();
  const t = performance.now(); for (let i = 0; i < N; i++) { await P.step(B); e.step(B); P.envStepped(); }
  const s = (performance.now() - t) / 1000 / N;
  console.log(`2 shards:   ${s.toFixed(2)} s a block (${(B / s).toFixed(0)}× real time), ${P.sum('agents')} agents, ${P.count().toFixed(0)} fish, handed over ${P.handed}`);
  P.stop();
}
