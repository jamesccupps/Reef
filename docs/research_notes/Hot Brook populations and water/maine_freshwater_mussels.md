# Freshwater mussels of Maine: which belong in the Hot Brook lakes

Source: MDIFW, *Freshwater Mussels of Maine* poster/pamphlet (text and photographs by Ethan Nedeau / Biodrawversity; MDIFW Endangered and Nongame Wildlife Fund). The human supplied the PDF on 2026-10-16. What follows is a summary for the sim, not a copy.

## The ten Maine species and their habitats

| Species | Status | Range | Habitat | Fish hosts | Size |
|---|---|---|---|---|---|
| **Eastern elliptio** (*Elliptio complanata*) | secure | statewide | lakes, ponds, rivers, streams of all sizes; tolerates poor water and marginal habitat; **Maine's most abundant** | yellow perch, American eel, alewife, smallmouth, sunfish | < 14 cm |
| **Eastern floater** (*Pyganodon cataracta*) | secure | statewide | mainly lakes and ponds; silt, mud, **dense vegetation, low dissolved O₂**; bog ponds, swamps | likely sunfish, bass, perch | < 16.5 cm; thin, fragile (muskrats, otters, raccoons eat them) |
| **Eastern lampmussel** (*Lampsilis radiata*) | secure | mainly Androscoggin, Kennebec, **Penobscot** watersheds; uncommon Downeast | lakes, ponds, rivers, streams | bass, perch, sunfish (a minnow-like mantle **lure**; glochidia in prey-like packets) | < 12.5 cm |
| **Yellow lampmussel** (*L. cariosa*) | **threatened** | **Penobscot**, St. George, lower Kennebec | large rivers and lakes | bass, white perch, yellow perch (lure with an eyespot) | < 12.5 cm; lives > 30 yr |
| **Tidewater mucket** (*Atlanticoncha ochracea*) | **threatened** | **Penobscot**, St. George, lower Kennebec | lakes, ponds, rivers | **white perch, banded killifish** | < 10 cm |
| **Triangle floater** (*Alasmidonta undulata*) | secure | statewide | mainly rivers and streams; the one *Alasmidonta* that occasionally lives in lakes | shiners, dace, suckers, perch, sunfish | < 7.5 cm |
| **Brook floater** (*A. varicosa*) | **threatened** | Kennebec, Penobscot, Midcoast and Downeast rivers | streams and rivers with stable channels and clean water | dace, shiners, **pumpkinseed**, slimy sculpin | < 9 cm |
| **Eastern pearlshell** (*Margaritifera margaritifera*) | secure | statewide | clean **cold** streams and rivers | **brook trout, Atlantic salmon** | < 15 cm; lives 100+ yr |
| **Creeper** (*Strophitus undulatus*) | uncommon | Androscoggin, Kennebec, Penobscot | rivers and streams only, never lakes | many: shiners, dace, suckers, perch, bass, sunfish, bullhead | < 9 cm |
| **Alewife floater** (*Utterbackiana implicata*) | secure | coastal watersheds | lakes, ponds, rivers on alewife/shad runs | alewife, American shad | < 16.5 cm |

## The life cycle (for the 7d model)

- Males release sperm and females filter it in. The embryos become **glochidia** in the female's gills (the marsupium).
- The glochidia attach to a host fish's fins or gills. They are released in mucous webs, in prey-like packets, or when a lure draws a fish close.
- They live encysted on the fish (which can carry them far) and then drop off as juveniles. The juveniles burrow and stay partly buried for life.
- Adults move little, but leave **trails** in shallow water. They live **10 to 100+ years**.

## What eats them

**Otters** (piles of empty shells at a feeding spot), **raccoons** and **muskrats**. The thin-shelled floaters are the easiest prey.

## Not in Maine

The zebra mussel is absent: most Maine lakes and rivers are too acidic and too low in calcium. The Asian clam is also absent, although Maine has suitable habitat for it.

## For the sim (src/w3/littoral3.js, stage 7d)

- **Hot Brook drains to the Penobscot** (Baskahegan Stream → Mattawamkeag). Its plausible species:
  - **eastern elliptio**: dominant everywhere; it is the sim's only mussel now;
  - **eastern floater**: in the soft, weedy coves and on the deeper mud. It is tolerant of low O₂, which the elliptio parameters (MU_DEEP 2/m², MU_ANOX) stand in for;
  - **eastern lampmussel**: Penobscot watershed;
  - possibly the **yellow lampmussel** and **tidewater mucket**: Penobscot; their hosts, white perch and banded killifish, are in Hot Brook;
  - in the brook: the **triangle floater**, and possibly the **brook floater** (pumpkinseed and dace hosts).
  - The **eastern pearlshell** needs cold streams with trout or salmon; Hot Brook's stream is warm.
- **Hosts:** the sim's MU_HOST50 counts all Hot Brook fish as hosts. Per species the hosts differ:
  - lampmussels: bass and perch;
  - tidewater mucket: white perch and killifish;
  - floaters: sunfish, perch, shiners, dace.

  A species split would tie each mussel's recruitment to its own hosts.
- **Predators:** the 7e otters (and the later raccoon and muskrat) should take mussels, the thin-shelled floaters first. The shell piles are a visible sign.
- **The view:** shells now draw as dark-brown ellipsoids (elliptio). The floaters are green, yellow or brown with a thin, larger shell; the lampmussels are yellow-green with green rays.
