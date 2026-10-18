// w3_shard_host.mjs — runs a shard of the 3-D lakes' fish (src/w3/render3/shard3worker.js) in a Node worker thread: the browser
// worker's globals (self, location, onmessage, postMessage) on worker_threads, so headless runs use the very code the page does.
// Spawned by nodeShardSpawner() below (src/w3/shardpool3.js drives it).
import { parentPort, workerData, isMainThread, Worker } from 'node:worker_threads';

export function nodeShardSpawner(search = '?world=true') {
  return () => {
    const w = new Worker(new URL(import.meta.url), { workerData: { search } });
    const ad = { postMessage: (m, tr) => w.postMessage(m, tr), onmessage: null, onerror: null, terminate: () => w.terminate() };
    w.on('message', m => ad.onmessage && ad.onmessage({ data: m })); w.on('error', e => ad.onerror && ad.onerror(e));
    return ad;
  };
}
if (!isMainThread && workerData && 'search' in workerData) {
  globalThis.self = globalThis; globalThis.location = { search: workerData.search }; globalThis.onmessage = null;   // (a browser worker's own globals)
  globalThis.postMessage = (m, tr) => parentPort.postMessage(m, tr);
  parentPort.on('message', m => globalThis.onmessage && globalThis.onmessage({ data: m }));
  await import('../src/w3/render3/shard3worker.js');
}
