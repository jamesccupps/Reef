#!/bin/sh
# tools/paper-v2/runs/run_package.sh: the model package (stageR5, as §4 describes it) through two years at true scale on the GPU,
# one seed, founded on 20 May (yf 0.22) — the re-run of the headline arm (AM) for the paper's v2.0 (brief, Phase 2 item 4; Phase 3).
#   sh tools/paper-v2/runs/run_package.sh <seed> [debug-port]
# Needs the project's server on :8000 (npm run serve) and Chrome with WebGPU. Writes docs/paper/runs/package_2yr/seed<seed>.txt, headed
# by the commit, the date and the query, so the output says exactly what ran.
seed=$1; port=${2:-9335}
out=docs/paper/runs/package_2yr/seed$seed.txt
q="world=true&r5=1&seeds=$seed&yf=0.22&days=730&every=14"
commit=$(git rev-parse --short HEAD); dirty=$(git status --porcelain --untracked-files=no -- src tools/gpu | head -1)
node tools/gpu/year_cdp.mjs "$q" "$out.tmp" "$port"
{ echo "# commit $commit${dirty:+ (src or tools/gpu modified!)} · run $(date -u +%Y-%m-%dT%H:%MZ) · query $q"; cat "$out.tmp"; } > "$out" && rm "$out.tmp"
echo "done: $out"
