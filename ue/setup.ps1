# ue/setup.ps1 — makes the Unreal project at G:\HotBrookUE (or -Root) from this repo's ue/HotBrook: the .uproject copied, its
# Source, Config and Scripts LINKED (directory junctions: the code stays versioned in the repo), its Content (the heavy assets — Fab /
# Megascans packs may not go in the public repo), Intermediate, Binaries, Saved and DerivedDataCache on G: alone. Safe to run again.
#   powershell -File ue\setup.ps1 [-Root G:\HotBrookUE]
param([string]$Root = 'G:\HotBrookUE')
$src = Join-Path $PSScriptRoot 'HotBrook'
New-Item -ItemType Directory -Force $Root | Out-Null
Copy-Item (Join-Path $src 'HotBrook.uproject') $Root -Force
foreach ($d in 'Source', 'Config', 'Scripts') {
  $link = Join-Path $Root $d
  if (-not (Test-Path $link)) { New-Item -ItemType Junction -Path $link -Target (Join-Path $src $d) | Out-Null; "linked $link -> $(Join-Path $src $d)" }
}
foreach ($d in 'Content', 'Import') { New-Item -ItemType Directory -Force (Join-Path $Root $d) | Out-Null }
"project at $Root"
