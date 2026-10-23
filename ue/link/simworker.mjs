// simworker.mjs — the browser's sim worker (src/w3/render3/sim3worker.js) in a Node worker thread, unchanged: a dedicated worker's
// globals (self, location — the true-size world —, onmessage, postMessage) on worker_threads, and its shards' Worker as Node threads
// (tools/w3_shard_host.mjs, as the gate's headless runs use them). Started by ue/link/simhost.mjs.
import { parentPort } from 'node:worker_threads';
const { nodeShardSpawner } = await import('../../tools/w3_shard_host.mjs');
const SEARCH = '?world=true';
globalThis.self = globalThis; globalThis.location = { search: SEARCH, pathname: '/w3.html', href: 'http://localhost/w3.html' + SEARCH }; globalThis.onmessage = null;
globalThis.postMessage = (m, tr) => parentPort.postMessage(m, tr);
// (sim3worker makes its shards with `new Worker(url, { type: 'module' })`: each one a Node thread running shard3worker.js)
globalThis.Worker = class { constructor() { return nodeShardSpawner(SEARCH)(); } };
parentPort.on('message', m => globalThis.onmessage && globalThis.onmessage({ data: m }));
await import('../../src/w3/render3/sim3worker.js');
