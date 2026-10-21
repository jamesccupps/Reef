// RUN A CPU JOB ON ANOTHER MACHINE (the gate, the CPU probes, the plants rebuilds — anything Node-only; the GPU runs stay local).
// Copies the working tree (git's tracked + untracked-not-ignored files, uncommitted edits included) to <host>:~/reef over ssh —
// only the files changed since the last copy, by hash — then runs the command there in cmd, streaming its output.
//   node tools/remote/run.mjs <host> [-e K=V ...] [--put file ...] [--full] [--sync-only] [--] <command...>
//   e.g. node tools/remote/run.mjs occ-server -e W3_ONLY=plants -- node test/w3.mjs
// --put sends a file from outside the repo (a probe) to .remote/put/<name> there (it stays, with every earlier one, until deleted
// from the local .remote/put/): it imports the sim as '../../src/...'
//   e.g. node tools/remote/run.mjs occ-server --put scratch/killi.mjs -e DAYS=120 -- node .remote/put/killi.mjs
// The gate's timing budgets are this desktop's: on a slower host pass -e W3_PERF_MUL=1.3 (test/w3.mjs) and -e REEF_PERF_MIN=… (headless);
// occ-server is ~15 % slower per core on the 3-D water's update, so its worth is the twelve threads beside the GPU runs, not speed.
// <host> is an ~/.ssh/config entry (key login). The host needs Windows OpenSSH server, the same Node as here, and tar (built in).
// The last copy's hashes are kept in .remote/<host>.json (git-ignored); --full sends everything again.
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..');
const SSH = process.platform === 'win32' ? 'C:\\Windows\\System32\\OpenSSH\\ssh.exe' : 'ssh';
const TAR = process.platform === 'win32' ? 'C:\\Windows\\System32\\tar.exe' : 'tar';
const REMOTE_DIR = 'reef';

const argv = process.argv.slice(2);
const host = argv.shift();
if (!host) { console.error('usage: node tools/remote/run.mjs <host> [-e K=V ...] [--full] [--sync-only] [--] <command...>'); process.exit(2); }
const env = [], put = []; let full = false, syncOnly = false; const cmd = [];
while (argv.length) {
  const a = argv.shift();
  if (cmd.length) { cmd.push(a); continue; }
  if (a === '-e') env.push(argv.shift());
  else if (a === '--put') put.push(argv.shift());
  else if (a === '--full') full = true;
  else if (a === '--sync-only') syncOnly = true;
  else if (a === '--') cmd.push(...argv.splice(0));
  else cmd.push(a);
}
for (const kv of env) if (!/^[A-Za-z_][A-Za-z0-9_]*=[^"&|<>^%\r\n]*$/.test(kv)) { console.error(`bad -e ${kv}`); process.exit(2); }

const run = (args, opts = {}) => new Promise((res) => {
  const p = spawn(SSH, ['-o', 'BatchMode=yes', host, ...args], { stdio: opts.stdio || 'inherit' });
  if (opts.input) opts.input(p.stdin);
  p.on('close', (c) => res(c ?? 1));
});

// --- the copy
for (const p of put) { const d = path.join(ROOT, '.remote', 'put'); fs.mkdirSync(d, { recursive: true }); fs.copyFileSync(p, path.join(d, path.basename(p))); }
const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: ROOT }).toString().split('\0').filter(Boolean)
  .filter(f => fs.existsSync(path.join(ROOT, f)) && fs.statSync(path.join(ROOT, f)).isFile())
  .concat(fs.existsSync(path.join(ROOT, '.remote', 'put')) ? fs.readdirSync(path.join(ROOT, '.remote', 'put')).map(n => `.remote/put/${n}`) : []);   // (every probe sent so far stays there — a run without --put must not delete the last one's)
const man = path.join(ROOT, '.remote', `${host}.json`);
const old = !full && fs.existsSync(man) ? JSON.parse(fs.readFileSync(man, 'utf8')) : {};
const now = {};
for (const f of files) now[f] = createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex');
const send = files.filter(f => old[f] !== now[f]);
const gone = Object.keys(old).filter(f => !(f in now));
const t0 = Date.now();
if (send.length || gone.length) {
  fs.mkdirSync(path.join(ROOT, '.remote'), { recursive: true });
  const list = path.join(ROOT, '.remote', `${host}.list`);
  const delf = '.remote_deleted.json';
  fs.writeFileSync(path.join(ROOT, '.remote', delf), JSON.stringify(gone));
  fs.writeFileSync(list, [...send, `.remote/${delf}`].join('\n') + '\n');
  // (cmd on the far side: make the folder, unpack, then delete what was deleted here — the if in parentheses: unbracketed, cmd's if
  // takes the whole && chain as its command and skips the copy once the folder exists)
  const del = `node -e "const fs=require('fs');for(const f of JSON.parse(fs.readFileSync('.remote/${delf}','utf8')))try{fs.unlinkSync(f)}catch{}"`;
  const code = await run([`(if not exist ${REMOTE_DIR} mkdir ${REMOTE_DIR})& cd ${REMOTE_DIR}&& tar -xf -&& ${del}`], {
    stdio: ['pipe', 'inherit', 'inherit'],
    input: (stdin) => { const t = spawn(TAR, ['-cf', '-', '-T', list], { cwd: ROOT, stdio: ['ignore', 'pipe', 'inherit'] }); t.stdout.pipe(stdin); },
  });
  if (code !== 0) { console.error(`copy to ${host} failed (${code})`); process.exit(code); }
  fs.writeFileSync(man, JSON.stringify(now));
  console.error(`[remote] copied ${send.length} files, removed ${gone.length}, to ${host}:~/${REMOTE_DIR} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} else console.error(`[remote] ${host}:~/${REMOTE_DIR} already up to date`);
if (syncOnly || !cmd.length) process.exit(0);

// --- the job
const pre = env.map(kv => `set "${kv}"&& `).join('');
const t1 = Date.now();
const code = await run([`cd ${REMOTE_DIR}&& ${pre}${cmd.join(' ')}`]);
console.error(`[remote] ${host} exit ${code} after ${((Date.now() - t1) / 60000).toFixed(1)} min`);
process.exit(code);
