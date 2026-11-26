# The paper's v2.0 rewrite: tools and progress

The brief is the human's `PAPER_REWRITE_BRIEF.md` (26 Nov 2026, the audit of `main` at `f553f48`). The work is on the branch
`paper-v2`: nothing reaches the live site (`main` → GitHub Pages) until the human approves the merge.

## The tools

| Script | What it does |
|---|---|
| `ledger.mjs` | `docs/paper/references.md` → `docs/paper/source_ledger.csv`: one row per entry, its flags, the sections and code lines that cite it, its tier; fills the source-pass columns from `docs/paper/evidence/*.json`. Re-run after any change to the references, the parts or the evidence. Also writes `out/refs.json` (each entry with its citing sentences). |
| `meta.mjs` | Crossref's record for every DOI (the bibliographic check) and OpenAlex's free copies; a title search for entries without a DOI. Cached in `out/meta/` (git-ignored). Writes `out/meta.json`. |
| `show.mjs <key>…` | Everything about an entry, for a reader. |
| `getsrc.mjs <key> <url>…` | Fetch a full text into `docs/research_notes/fetched/v2/` (git-ignored) and extract it page by page. Honest user agent; stops at any login, paywall or bot check. |
| `findin.mjs <key> "<regex>"` | Search a fetched text by page. |
| `check_evidence.mjs [<key>…]` | Validate the evidence files (statuses, page-level locations, quotes ≤ 15 words, a tried-list for blocked entries). |
| `READER.md` | The brief every source-pass reader follows. |

## Tiers (the brief's order of work)

1. A model parameter's source: cited in §4, a Table 4.x, or a comment in the model's code.
2. Behind the abstract, §5.1 or §6 (and not already tier 1).
3. Flagged: abstract only, search summary, via, second-hand, not re-read, unverified, citation incomplete, sources disagree, n.d.
4. Everything else.

## Progress

| Phase | State |
|---|---|
| 1. Source pass: ledger skeleton, Crossref/OpenAlex check | done 2026-11-26 |
| 1. Source pass: reading (tier 1 → 4) | pilot (7 entries) done 2026-11-26; wave 1 (batches t1-01…t1-10, 54 entries) launched 2026-11-26 — `node tools/paper-v2/batches.mjs --tier 1` lists what is left |
| 1. Re-tally EMAP (§3.5.2) and CT DEEP electrofishing by script | — |
| 1. §3 read line by line against the ledger | — |
| 2. The twelve corrections and two framing fixes | — |
| 3. Reproducibility, replication (≥ 3 seeds), sensitivity screen, validation statement, parameter table | — |
| 4. Satellite and catchment data for the lakes themselves | — |
| 5. The eight literature additions | — |
| 6. Restructure: paper + companion report, PDFs, CITATION.cff, Zenodo metadata | — |
