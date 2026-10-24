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
  them: the landscape, the physical sky, the sun, volumetric clouds, the haze, the walker's start.
- **The lakes** — `AHotBrookWaterSurface`: each lake's shoreline (`Import/lakes.json`, the 0.25-m depth line) pushed 12 m out under the banks, triangulated
  and laid at its level (Upper 128.93 m, Lower 128.23 m) with `M_LakeWater` (Single Layer Water: the tea-coloured water's
  absorption and scattering, Lumen's reflections). Unreal's Water plugin bodies were tried first and dropped: built headless they
  crashed the build and never drew in the game.
- **The ground** — `M_Ground`: Quixel Megascans forest floors (needles and moss, broadleaf litter, moss carpets), rocky floor on
  slopes, mud at the water's edge, and past ~900 m the aerial photos' canopy (the trees stream only within ~1.2 km).
- **The forest** — `AHotBrookForest`: the ~1.9 M trees of `Import/trees.bin` (`ue/export/export_forest.mjs`), streamed in 200-m
  tiles about the walker, each species drawn with its Quixel Megaplants look-alike (`Import/forest_meshes.json`, written by
  `Scripts/make_forest_meshes.py`): red spruce and balsam fir the Norway spruce, white pine the Baltic pine, cedar the Japanese
  cypress, paper birch the silver birch, aspen, red maple the Norway maple, beech, alder, hazel, willow, the snags the dead pine,
  the young hardwoods the maple, beech and rowan saplings. Megaplants are skinned meshes: their branches sway in the Dynamic Wind
  plugin's GPU wind, set from the sim's wind speed and direction. Each trunk has a hidden collider.
- **The forest's stocking** — `ue/export/export_forest.mjs` stocks the woods as the Forest Inventory measures Maine's
  (docs/research_notes/Maine forest structure/): ~3,000 stems a hectare over 2 m at full stocking (most of them young fir and maple
  under the canopy), by height class, ~55 snags; each tree drawn with the variant of its species nearest its height; the small
  ones drawn only near (under 6 m to 300 m, under 12 m to 600 m).
- **The ground cover** — `AHotBrookGroundCover`: ferns, forbs (wood anemone), lowbush blueberry and lingonberry (bilberry), grasses
  in the open and on the shore, the shore's low shrub band, mushrooms, stones, mossy boulders and outcrops, fallen logs — each at
  the cover the Forest Inventory measures (ferns ~15 %, forbs ~22 %, low shrubs ~17 %; less under closed spruce–fir), in patches,
  by the stand about it (the forest's own trees) and the water's nearness; streamed in 32-m cells in three rings (80/160/400 m).
  Its meshes: the Megascans scans (`Scripts/import_megascans.py` → `Import/megascans_meshes.json`) and the Megaplants' small
  plants (`make_forest_meshes.py` → `Import/groundcover_meshes.json`).
- **The live link** — `node ue/link/simhost.mjs` runs the sim at real time and streams it to `AHotBrookLink`
  (ws://127.0.0.1:8771; snapshot "HBS2"): the clock (the sun placed for the date and hour), the weather and wind, the fish near
  the walker, the forest's large animals.
- **The forest's animals** — `AHotBrookAnimals`: every deer, black bear and moose the sim has, at its place and heading, playing
  the gait nearest its speed (the bear walks slow to sprints; its clips' own travel locked so the sim moves it) or the idle for what
  it does (grazing, browsing, drinking, fishing, bedded; a denned bear isn't drawn), scaled to its length; her young at heel at their
  age's length (forest3's); a bull moose's antlers from mid-May to about New Year. The deer are the Animal Variety Pack's; the bear
  and moose are the human's own models (`Scripts/import_animals.py`; never committed or shared), recoloured for Maine by
  `ue/export/recolor_animals.py` (the bear a black bear with a tan muzzle; the moose darker). `-hbshot` takes `nearbear`,
  `neardeer`, `nearmoose` (and `nearfish`) to frame the nearest one.
- **The fish** — `AHotBrookFish`: each fish the sim has near the walker drawn as its species' model, scaled to its length and
  deepened by its condition, at its place, heading and pitch, eased between the snapshots; its tail beating at the browser's rate
  for its speed (`M_HB_Fish`'s swim wave, its phase per fish in the instance's custom data); a school as up to 24 of its fish
  ~3 lengths apart by day, ~8 at night. Redbreast borrow the pumpkinseed, fallfish and alewife the dace.
- **The lakes' wildlife** — `AHotBrookWildlife`: every fish-eater the sim has on the lakes now (fish3 `_wildN` through the link —
  none out of season, the open-water birds gone from a frozen lake), each lake its share (by area, or by shore), each with the
  browser's life for it (render3/wild3view.js): loons swim the open water and dive every minute or two (one dives where the sim says
  a loon took a fish, and comes up there), resting on the water at night; herons stand in the shallows and step slowly between
  spots; belted KINGFISHERS sit on a dead pole leaning from the wooded bank out over the edge, fly out, hover and plunge head first,
  and come back; OSPREYS circle 18–30 m up, hover and plunge feet first and carry the fish off over the woods; the bald eagles soar
  on few beats and glide down to snatch a fish, and carry it off; common and hooded MERGANSERS swim the shallows in a group (a pair in
  spring, the hens and young after), each diving now and then; river OTTERS swim and porpoise along the shore, dive for half a minute
  and haul out to eat; MINK bound along the water's edge at night and swim a little. Near the walker, at the sim's densities: the
  SNAPPING TURTLES walking the shallows' bed (1 a hectare) and the BULLFROGS afloat at the edge (10 a km; in with a plop when the
  walker comes close). The birds in flight beat their wings (their clips held level for a glide), the otter swims its clip.
  The shore's FALLEN TREES (the ground cover's dead pine laid from the wooded bank out into the water, ~1 to 70 m) and the PAINTED
  TURTLES basking on them on sunny warm days (sliding off when the walker comes within 6 m); the GREEN FROGS at the water's edge
  (HERP3's 0.3 a metre of shore; the bullfrog scan made small), in with a plop at 2 m.
  `hb.AllLife 1` brings every kind out whatever the season or hour. `-hbshot` takes `near<kind>` for loon, heron, kingfisher, osprey,
  eagle, cmerganser, hmerganser, otter, mink, snapper, bullfrog, painted, frog.
- **The anglers** — `AHotBrookAnglers`: the sim's anglers (fish3 WILD3 'angler', 'iceAngler': their seasons and hours through the link)
  at the browser's numbers (Upper ~1.2 boats out by day, Lower ~0.35; ~1.2 and ~0.3 ice camps). A 14-ft aluminium skiff with its
  outboard down sets out from a camp's dock to a bass spot (1.2–3.5 m of water, 3–25 m off the shore), drifts there on the wind; the
  angler (Nathan) on the stern seat turned to the shore casting every half minute and reeling in, a fish on when the sim's anglers
  take one, a new spot every 15–30 min, home at dusk. On safe ice (≥ 20 cm): a pop-up shelter over the deep basin's perch holes, a
  sled, the jigger on a bucket over his hole, five tip-ups on the 1–3-m water toward the shore — a flag up when the sim's ice anglers
  take a fish. Their gear is built by build_camps.py (`boat_skiff_running`, `ice_*`). `hb.AllLife 2` pitches the ice camps even on
  open water (a look in summer). `-hbshot` takes `nearangler`, `neariceangler`.
- **The second batch of models** (the wanted list of 2026-10-24) — `ue/export/convert_creatures.py` (Blender 5.1): the animated ones
  (OSU's ospreys, kingfishers and loon, UC Davis's eagle, the otter's swim) as one skinned mesh on one armature with its clip, every
  loose part bound rigidly to the bone it hung from, turned to face +X (sized in the game); the scans (the merganser hen, the ferret
  repainted as a mink, the snapping and painted turtles, the bullfrog and its tadpole) welded, cut to a triangle budget, levelled by
  their principal axes, sized and set on their base. `ue/export/convert_people.py`: the two anglers seated (each limb bone turned
  about its joint to point where the pose wants — a man on a thwart or a bucket, the rod before his belly) with clips sit / cast /
  reel (summer) and sit / jig (the ice), the rod 2.1 m. `Scripts/import_creatures.py` brings them in (Interchange; textures ≤ 2048;
  the turtles and frogs by Nanite; the painted turtle's colour from its vertices) and writes `Import/creatures_meshes.json`.
- **The models** — downloaded from Sketchfab to `G:\HotBrookUE\Import\sketchfab` (never committed); `ue/export/convert_models.py`
  (Blender 5.1) lays each on its axes (a fish's length on +X, back up), cuts it to ~12,000 triangles (birds 24,000, the canoe
  30,000), sizes it (a fish 1 m long; a bird, a boat to its real size) and writes `Import/models/<name>.glb` with three views to
  check it by; `Scripts/import_models.py` brings them in (`/Game/HotBrook/Models`) and makes `M_HB_Fish`. The loon's Collada
  file went through trimesh + pycollada to a .glb first (Blender 5 reads no Collada).
- **The walker** — `HotBrookCharacter`: first person at 1.65 m; W A S D / arrows, mouse, Shift to run, Space to jump; wading,
  swimming past chest depth (the head riding the water: a slow swell and a breaststroke's rhythm), diving with C / Ctrl; on the ice
  in winter.
- **The canoe** — `AHotBrookBoat`: a 5-m canoe waiting in the shallows nearest the start. **E** beside it gets in (the stern seat)
  and out (onto the shore within ~8 m, else over the side); W / S paddle, A / D turn, Shift strokes harder. ~1.4 m/s at a steady
  pace (~2 m/s hard), gliding and slowing on the hull's drag, the keel holding it straight, drifting with the sim's wind, running
  aground where the water is shallower than it draws (kept within the lakes' drawn outlines). `-hbpaddle=N` paddles it N seconds
  for a test (speed and heading logged, a picture from the seat).
- **The camps** — `AHotBrookCamps`: the dataset's 67 camps, houses, trailers, sheds and a garage and their 54 docks (src/w3/true/
  camps3d.js, laid out as the browser's view does — `ue/export/export_camps.mjs` → `Import/camps.json`), each built true size by
  `ue/export/build_camps.py` (block or fieldstone foundation, lap / board / log / trailer siding with corner boards, a gable roof of
  painted steel or shingles with its overhangs, fascia and ridge cap, windows with frames, sills, muntins and some shutters — bigger
  to the water, a slider onto the deck — the door with a landing and steps, porch roofs, decks with railings and stairs, brick or
  stone chimneys and stove pipes; docks of boards on posts or aluminium on legs, an L or a T at some), imported with their
  materials by `Scripts/import_camps.py` (Nanite; their triangles their collision — the walker climbs steps, walks decks and docks).
  A building's floor stands over its highest corner (≤ 2.6 m over its lowest); a dock ~0.35 m over the lake, in from May 25 to
  October 15 (`hb.DocksIn 1` / `0` forces them). The ROADS (75 km: camp roads with their wheel tracks and grassy crown, the town's
  gravel, Route 169 paved) are strips draped on the ground. The forest's export already clears trees off the lots, roads, paths
  and beaches; `Import/cleared.bin` (export_camps.mjs) keeps the ground cover off them too. The BOATS at the docks while they are in (44, as the
  browser's layout has them): 14-ft aluminium skiffs (plain or painted green) and the pontoon boat tied alongside, riding the water
  with a slow bob; canoes turned over and kayaks on the docks or the banks — the hulls lofted by build_camps.py, the canoe the
  Sketchfab one. OUT OF SEASON each dock's sections lie stacked on its bank (up to four) with its skiff turned over beside them
  (camps3view's D.store, D.flip). The LIGHTS by night: a camp lived in that day (camps3.js occupied — the same draw as the browser's:
  a seasonal camp the month's share, weekends twice the weekdays; a year-round home most days) has its windows lit, each window by its
  own draw, from dusk to its bedtime, and its porch lamp (some all night). The nine mapped LAWNS mown grass (ambientCG Grass004, CC0),
  their ground cleared of trees and ground cover. `hb.Hour <0–24>` shows the view at another hour (the sun, the lights) for a look.
- **The snow** — the land under snow while the lakes are frozen (the browser's rule): `MPC_HB_Season` 'Snow', which AHotBrookLink
  eases on when the sim's ice passes 10 cm and off when it is gone; the ground (M_Ground) and the camps (roofs, decks, the stacked
  docks, the roads) whiten where they face up. `hb.Snow 1` / `0` forces it.
- **The water plants** — the sim's weed beds (src/w3/plants3.js: each species' shoots per bed cell) laid about the walker by
  `ue/link/weeds.mjs` as the browser lays them (plants3view's blend between the water model's columns, its clumps) and sent as
  "HBP1"; `AHotBrookWeeds` draws each 5-m cell's share of a full stand: the fragrant water-lily's clumps and the yellow pond-lily's
  pads on the surface, watershield's, floating pondweed's and bur-reed's small leaves, the pondweeds from the bed up to just under the
  surface, the reeds (bulrush, pickerelweed — also for bogbean and arrowhead —, horsetail, the sedges) from the bed through it, and
  the mussels on the bed within ~25 m. Only in the lakes' drawn water (the brook isn't drawn yet). `hb.Weeds <n>` multiplies the
  stands for a look (6: the beds near full, as in August, while the lakes are in spring). The flowers come by the date: the
  fragrant water-lily's mid-June to mid-September, pickerelweed's purple spikes July to September (half the plants at the height of
  it, the rest their leaves only); `hb.WeedsDate <0–1>` shows another date's. The plants come from
  `ue/export/convert_plants.py` (Valery.Li's lilies and pondweed — their FBX files are Y-down —, the grass tufts; every leaf a
  cut-out, glTF MASK) and `ue/export/build_reeds.py` (the reeds, procedural), imported by `HB_SET=plants Scripts/import_creatures.py`
  with Nanite.
- **Materials in the game** — a material not marked for Nanite or instanced meshes draws as Unreal's grey default in `-game` (the
  editor marks it itself): `Scripts/fix_usage.py` marks ours and copies Interchange's glTF masters into `/Game/HotBrook/Interchange`
  with the marks, re-parenting the imported models' materials to them (`import_creatures.py` runs it after each import).
- **The start** — `Import/start.json` `{"x", "y", "yaw"}` (sim metres, UE degrees; outside the repo) or `-hbstart=X,Y,Yaw`: where
  the walker starts (the nearest dry ground to it); the level's own start without either.
- **Under the water** — `M_HB_Underwater` (`Scripts/make_underwater_material.py`), a post-process `AHotBrookWaterSurface` turns on
  while the camera is under the surface: the light reaching each thing dimmed by the water above it (per colour, the browser's Kd:
  tea water loses blue first), what the eye sees of it dimmed along the path (M_LakeWater's absorption + scattering), and the
  water's own light filling in — bright toward the surface, dark below — in the scene's exposure. Visibility a few metres, as in
  the lakes.
- **Coordinates** — the sim's metres (x east, y north, heights above sea level) to Unreal's cm: X east, Y south, Z up, heights
  less 110 m (`HotBrookCoords.h`).
- **Checking the view** — run the game with `-hbshot="X,Y,Yaw,Pitch,Name;…"` (sim metres, degrees) and `-hbwait=<s>`: it stands at
  each spot and saves `Saved/Screenshots/<Name>.png`, then quits.

Engine: **UE 5.8** (`G:\Program Files\EpicGames\UE_5.8`; Megaplants need 5.8's Procedural Vegetation Editor, Dynamic Wind and
Nanite Foliage — `ue/retarget.ps1` moved the project), built with Visual Studio 2026's MSVC 14.51.
Build: `Engine\Build\BatchFiles\Build.bat HotBrookEditor Win64 Development -Project=G:\HotBrookUE\HotBrook.uproject -MaxParallelActions=3`
(more parallel compiles ran the page file out of memory).

## The Fab content (in the human's library; never committed)
- Added to the project from the Epic launcher (Fab → My Library → the pack's **+** → Add to Project → HotBrook): the Megaplants
  packs (5.8 only) into `Content/Megaplant_Library`, the Animal Variety Pack (its 5.5 version), a few rock and shrub packs.
  If an add doesn't land, the launcher's copy is in `VaultCache\<pack>\data\Content`. The launcher's cache lives on G:
  (`G:\EpicVaultCache`; `C:\ProgramData\Epic\EpicGamesLauncher\VaultCache` is a junction to it — it had filled 32 GB of C:).
- Megascans surfaces download as JPEGs to `VaultCache\FabLibrary\<listing>\texture-set\`: `python -I ue/export/megascans_surfaces.py`
  makes 2048² copies in `Import/surfaces`, and `make_ground_material.py` imports them.
- The first load of new plant packs builds their Nanite data for a long while (tens of minutes); it is cached after.

## The models' credits (Creative Commons; the files themselves are never committed)
| In the world as | Model | By | Licence |
|---|---|---|---|
| smallmouth bass | [Smallmouth bass](https://sketchfab.com/models/015389aed3414793b3e9e4a0c25169d1) | faerbogdan99 | CC BY 4.0 |
| chain pickerel | [Chain pickerel](https://sketchfab.com/models/dbffc5fa6b6f44d99692cb7c7719de4e) | faerbogdan99 | CC BY 4.0 |
| brown bullhead | [Channel catfish](https://sketchfab.com/models/038752a9cd3445feb074a569671c27f1) | faerbogdan99 | CC BY 4.0 |
| blacknose dace, fallfish, alewife | [Common dace](https://sketchfab.com/models/cdc4f59efaa04fe391a5cff9b89c4ca3) | faerbogdan99 | CC BY 4.0 |
| great blue heron | [Great blue heron](https://sketchfab.com/models/52cffc22bf2441468739ac3ba6d599aa) | faerbogdan99 | CC BY 4.0 |
| yellow perch | [European perch](https://sketchfab.com/models/fecae0f415b2400aadf298374797f8fc) | animalica | CC BY 4.0 |
| white sucker | [Hog Sucker](https://sketchfab.com/models/1d67736a2fdd4151ac57d5082dd50514) | Grand Rapids Public Museum | CC BY 4.0 |
| banded killifish | [Northern Studfish](https://sketchfab.com/models/536261fbba2b49de8e31fe0c625cf55b) | MTSUichthyology | CC BY 4.0 |
| white perch | [Yellow Bass](https://sketchfab.com/models/908d991cc9da4441be7e9293be18a1f9) | MTSUichthyology | CC BY 4.0 |
| pumpkinseed, redbreast | [Model 38 – Pumpkinseed Sunfish](https://sketchfab.com/models/e8cbd8d90e47463b831ceed70bc146cb) | DigitalLife3D | CC BY-NC 4.0 |
| common loon | [Common Loon](https://sketchfab.com/models/24374cff63c345cba6fff9e80feb2c17) | Innovation Studio | CC BY 4.0 |
| bald eagle | [Bald Eagle Flying Bird Model](https://sketchfab.com/models/30434fd1272f464a8540750a78a5087f) | Pigcraft | CC BY 4.0 |
| canoe | [Cruising Canoe](https://sketchfab.com/models/982bd54e6278492484d3154d09dbe59d) | gogiart | CC BY 4.0 |
| osprey | [Osprey](https://sketchfab.com/3d-models/osprey-3b36672f100746cea2196bff6af040e6), [Osprey - in Flight](https://sketchfab.com/3d-models/osprey-in-flight-909d68cc4f9249a2878a37c618467f31) | OSU.Multimedia | CC BY 4.0 |
| belted kingfisher | [Belted Kingfisher](https://sketchfab.com/3d-models/belted-kingfisher-e0b0a20456b14a5b95743a0ba9971c84), [Belted Kingfisher - in Flight](https://sketchfab.com/3d-models/belted-kingfisher-in-flight-14286cc021d34a5798c9e46319717551) | OSU.Multimedia | CC BY 4.0 |
| common loon (in flight) | [Common Loon](https://sketchfab.com/3d-models/common-loon-c9663fb0a6ed4cc7aa60045459d4fa54), [Common Loon - in Flight](https://sketchfab.com/3d-models/common-loon-in-flight-55f2f4b8d84e48a482167368cf6f83ca) | OSU.Multimedia | CC BY 4.0 |
| bald eagle (in flight) | [Bald Eagle](https://sketchfab.com/3d-models/bald-eagle-8874cfcf83a54575ba8068376f8a63a8) | UC Davis TERC | CC BY 4.0 |
| common and hooded mergansers | [Hooded Merganser Duck Female](https://sketchfab.com/3d-models/hooded-merganser-duck-female-a9c6a0916b2e4ba3a9c9fe49508acd46) | Grand Rapids Public Museum | CC BY 4.0 |
| river otter | [Model 96A - North American Otter](https://sketchfab.com/3d-models/model-96a-north-american-otter-57b88c7e30c74b588f28102177849397) | DigitalLife3D | CC BY-NC 4.0 |
| mink (repainted) | [Ferret](https://sketchfab.com/3d-models/ferret-a5c717c20b08461aa1d9ce462f3e019e) | sdpm | CC BY 4.0 |
| snapping turtle | [Snapping Turtle](https://sketchfab.com/3d-models/snapping-turtle-794f3bd346d04b1ea13ea33ed1a02e16) | RISD Nature Lab | CC BY 4.0 |
| painted turtle | [Midland Painted Turtle](https://sketchfab.com/3d-models/midland-painted-turtle-1c1b0558403d47d5bf0b387dc79b4783) | Grand Rapids Public Museum | CC BY 4.0 |
| bullfrog, tadpole | [CC0 American Bullfrog](https://sketchfab.com/3d-models/cc0-american-bullfrog-l-catesbeianus-12244c1e4f3a4bfdbc217acba90e8baa), [its tadpole](https://sketchfab.com/3d-models/cc0-american-bullfrog-l-catesbeianus-8816b4762a3f4f2f865c4af32c3a6222) | ffish.asia | CC0 |
| the ice angler | [Rigged Game Character 1](https://sketchfab.com/3d-models/rigged-game-character-1-0bbafaaffefe477eae9ec20f67cf4883) | evan4129 | CC BY 4.0 |
| the summer angler | [Nathan Animated 003 - Walking 3D Man](https://sketchfab.com/3d-models/nathan-animated-003-walking-3d-man-143a2b1ea5eb4385ae90a73657aca3bc) | Renderpeople | CC BY 4.0 |
| the anglers' rod | [Fishing Rod, Rigged and Animated](https://sketchfab.com/3d-models/fishing-rod-rigged-and-animated-78991bf44cf54acb8660bef317d72c7a) | ergin3d | CC BY 4.0 |
| fragrant water-lily, the small floating leaves | [Water Lily (Nymphaea Odorata)](https://sketchfab.com/3d-models/4c793ce129424a1aa8e05aef5838e269) | Valery.Li | CC BY 4.0 |
| yellow pond-lily | [Lake Lily Med](https://sketchfab.com/3d-models/e0a4bb88649d458793ec83aafcfe9915) | Valery.Li | CC BY 4.0 |
| the pondweeds | [Pond Weed](https://sketchfab.com/3d-models/b34ed521c5bb45ca9191b6213e1830d6) | Valery.Li | CC BY 4.0 |
| the sedges (a grass tuft) | [Grass](https://sketchfab.com/3d-models/f2f2bddb2728483a9105c5f5114eb15e) | Cosmic_dust | CC BY 4.0 |

The camps' textures (`Import/textures`, CC0 — no attribution required, listed with thanks): from [Poly Haven](https://polyhaven.com) —
brown_planks_05 (lap siding), old_planks_02 (board siding), wood_trunk_wall (logs), box_profile_metal_sheet (steel roofs, its colour
made neutral), plank_flooring_03 (decks and docks), concrete_block_wall, red_brick, rock_wall_15 (fieldstone), rocky_trail (the
roads); from [ambientCG](https://ambientcg.com) — RoofingTiles003 (shingle roofs), PaintedWood009C (trim, doors), Metal050C
(aluminium), Grass004 (the lawns).

The bear and the moose the human downloaded are not listed: they are for the human's own use only and are never committed,
published or shared.

## Running it (at the PC — Remote Desktop caps everything at ~30 fps)
1. The live simulation: from the repo folder, `node ue/link/simhost.mjs` (ws://127.0.0.1:8771). It starts the lakes in ~15 s and
   keeps them running at real time; leave it open.
2. The world: double-click `G:\HotBrookUE\HotBrook.uproject` (opens the editor; press Play), or straight into the game:
   `"G:\Program Files\EpicGames\UE_5.8\Engine\Binaries\Win64\UnrealEditor.exe" G:\HotBrookUE\HotBrook.uproject -game -windowed -ResX=1920 -ResY=1080`
3. Walk: mouse to look, W A S D, Shift to run, Space to jump (and to come up when diving), C / Ctrl to dive; Esc / Alt-F4 to quit.

## Rebuilding after a change
- C++: `"G:\Program Files\EpicGames\UE_5.8\Engine\Build\BatchFiles\Build.bat" HotBrookEditor Win64 Development -Project=G:\HotBrookUE\HotBrook.uproject -MaxParallelActions=3`
- the world data: `HB_WORLD=true node ue/export/export_world.mjs`, `python -I ue/export/canopy_raw.py src/w3/true/canopy3.jpg G:/HotBrookUE/Import/canopy.bin`,
  `python -I ue/export/canopy_texture.py G:/HotBrookUE/Import/canopy.bin G:/HotBrookUE/Import/canopy_rgba.png`,
  `HB_WORLD=true node ue/export/export_forest.mjs`, `python -I ue/export/megascans_surfaces.py`
- the scans: `import_megascans.py` (Nanite meshes and their materials from the launcher's downloads; HB_REIMPORT=1 to redo),
  `check_megascans.py` (what each wears); `fix_megaplants.py` mends packs whose materials point outside them (Baltic Pine's bark)
- the materials and the tree mapping (`UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=pythonscript -script=G:/HotBrookUE/Scripts/<name>.py`):
  `make_ground_material.py`, `make_water_material.py`, `make_forest_meshes.py` (`inspect_megaplants.py` lists the plant meshes)
- the camps: `HB_WORLD=true node ue/export/export_camps.mjs`, `python -I ue/export/build_camps.py` (needs numpy; Pillow to measure the
  textures), then `import_camps.py` (the textures in `Import/textures` with their `manifest.json`)
- the wildlife and the people: `"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" -b --disable-autoexec -P ue/export/convert_creatures.py`
  and `… -P ue/export/convert_people.py` (from `Import/sketchfab/<name>/`, unzipped; `-- <name> …` for some), then `import_creatures.py`
  (`HB_ONLY=a,b` for some)
- the level: `UnrealEditor-Cmd.exe G:\HotBrookUE\HotBrook.uproject -run=HotBrookBuild`
- all of it on another engine version: `powershell -File ue\retarget.ps1 -Version 5.8`
