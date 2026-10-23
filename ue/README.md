# Hot Brook Lakes in Unreal Engine 5 — the first-person world

The human (2026-10-23): the first-person view must be "videogame quality and realistic even if it has to run a completely
different set of textures or engine". So the simulation stays the pure JavaScript core it is (`src/`), and this Unreal Engine 5
project draws the world in the first person, fed live by it. The browser view, the data page and the gate are unchanged.

- **The project** lives at `G:\HotBrookUE` (`ue/setup.ps1` makes it): its `Source`, `Config` and `Scripts` are directory
  junctions back to `ue/HotBrook/` here (the code stays versioned); `Content` (the assets — Fab/Megascans packs may not be put in
  this public repository), `Import`, the builds and the caches stay on G:.
- **The world** — `HB_WORLD=true node ue/export/export_world.mjs` writes `G:\HotBrookUE\Import`: the ground and the lake beds as a
  2-m heightmap (the 2017 lidar, the 1949 soundings), the water's surface grid, the lakes' shorelines and the brook, the camps.
- **The level** — `UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=HotBrookBuild` makes `/Game/Maps/HotBrook` from
  them: the landscape, the lakes as Unreal water bodies, the physical sky, the sun, volumetric clouds, the haze, the walker's start.
- **The walker** — `HotBrookCharacter`: first person at 1.65 m; W A S D / arrows, mouse, Shift to run, Space to jump; wading,
  swimming past chest depth, diving with C / Ctrl; on the ice in winter.
- **Coordinates** — the sim's metres (x east, y north, heights above sea level) to Unreal's cm: X east, Y south, Z up, heights
  less 110 m (`HotBrookCoords.h`).
- **Checking the view** — run the game with `-hbshot="X,Y,Yaw,Pitch,Name;…"` (sim metres, degrees): it stands at each spot and
  saves `Saved/Screenshots/<Name>.png`, then quits.

Engine: UE 5.6 (installed at `G:\Program Files\EpicGames\UE_5.6`), built with Visual Studio 2026's MSVC 14.51 (UE 5.6 accepts it).
Build: `Engine\Build\BatchFiles\Build.bat HotBrookEditor Win64 Development -Project=G:\HotBrookUE\HotBrook.uproject -MaxParallelActions=3`
(more parallel compiles ran the page file out of memory).
