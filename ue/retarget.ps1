# ue/retarget.ps1 — moves the HotBrook project to another installed engine version (default 5.8, for Quixel's Megaplants: they need
# 5.8's Procedural Vegetation Editor and Nanite Foliage): sets the .uproject's EngineAssociation, enables the plugins, rebuilds the C++
# against that engine, and re-makes the ground material and the level with it.
#   powershell -File ue\retarget.ps1 [-Version 5.8] [-Root G:\HotBrookUE]
param([string]$Version = '5.8', [string]$Root = 'G:\HotBrookUE')
$ErrorActionPreference = 'Stop'
$engine = "G:\Program Files\EpicGames\UE_$Version"
if (-not (Test-Path "$engine\Engine\Binaries\Win64\UnrealEditor-Cmd.exe")) { throw "UE $Version isn't installed at $engine" }
$up = Join-Path $PSScriptRoot 'HotBrook\HotBrook.uproject'
$j = Get-Content $up -Raw -Encoding UTF8 | ConvertFrom-Json
$j.EngineAssociation = $Version
$want = @('Water', 'Landmass', 'PythonScriptPlugin', 'EditorScriptingUtilities', 'PCG', 'ModelingToolsEditorMode', 'ProceduralMeshComponent')
if ([version]$Version -ge [version]'5.8') { $want += @('ProceduralVegetationEditor', 'DynamicWind') }
$j.Plugins = @($want | ForEach-Object { [pscustomobject]@{ Name = $_; Enabled = $true } })
($j | ConvertTo-Json -Depth 6) -replace "`r`n", "`n" | Set-Content $up -Encoding utf8
Copy-Item $up $Root -Force
"EngineAssociation $Version; plugins: $($want -join ', ')"
& "$engine\Engine\Build\BatchFiles\Build.bat" HotBrookEditor Win64 Development "-Project=$Root\HotBrook.uproject" -WaitMutex -NoHotReload -MaxParallelActions=3
if ($LASTEXITCODE -ne 0) { throw "build failed ($LASTEXITCODE)" }
& "$engine\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "$Root\HotBrook.uproject" -run=pythonscript "-script=$Root/Scripts/make_ground_material.py" -unattended -nopause -nosplash
& "$engine\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "$Root\HotBrook.uproject" -run=pythonscript "-script=$Root/Scripts/make_water_material.py" -unattended -nopause -nosplash
& "$engine\Engine\Binaries\Win64\UnrealEditor-Cmd.exe" "$Root\HotBrook.uproject" -run=HotBrookBuild -unattended -nopause -nosplash
"done: open $Root\HotBrook.uproject with UE $Version"
