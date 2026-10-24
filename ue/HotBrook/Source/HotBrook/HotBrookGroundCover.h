// HotBrookGroundCover — what grows and lies on the forest floor and the shores near the walker: ferns, lowbush blueberry and
// lingonberry, wood anemone, grasses, mushrooms, stones, the glacial boulders and mossy outcrops of Maine's till, the shore's rocks.
// Not data the sim holds plant by plant, so it is set out by rules the way such floors are: each kind at its density a square metre
// where it grows, in patches (ferns and blueberry in colonies tens of metres across, not evenly), by where it is — under conifers or
// hardwoods (the forest's own trees counted about each cell, AHotBrookForest), in the open (clearings, the camps' edges, the shore's
// grass), within a few metres of the water (the shore's rocks and grass), never in the water. Every cell lays out the same way
// every time (its own seeded stream). Streamed in cells (32 m; the far ring 128 m) in three rings — the small plants and stones near (~80 m), the ferns
// and shrubs farther (~160 m), the boulders far (~400 m) — each kind faded out at its own distance.
// Meshes: Import/megascans_meshes.json (Scripts/import_megascans.py — the scans: static Nanite meshes) and Import/groundcover_meshes.json
// (Scripts/make_forest_meshes.py — the Megaplants' small plants: skinned, bent by Dynamic Wind like the trees).
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookGroundCover.generated.h"

class UPrimitiveComponent;
class UStaticMesh;
class USkeletalMesh;
class UTransformProviderData;
class AHotBrookForest;
class UHotBrookWater;

UCLASS()
class HOTBROOK_API AHotBrookGroundCover : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookGroundCover();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	UPROPERTY(EditAnywhere, Category = "HotBrook") int32 CellsPerTick = 3;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float DensityScale = 1.f;   // (all kinds at once: a quality knob)
	struct FKind;   // (a kind of thing on the ground: its meshes, where and how thick it grows — the table in the .cpp)
	int32 LiveCells() const { return Live.Num(); }
	void TakeMakeStats(int32& OutMade, double& OutMs, int32& OutInstances) { OutMade = Made; OutMs = MakeMs; OutInstances = Instances; Made = 0; MakeMs = 0; }
private:
	struct FMesh { TObjectPtr<UStaticMesh> Static = nullptr; TObjectPtr<USkeletalMesh> Skel = nullptr; float Height = 100.f, Footprint = 1.f; };
	TArray<TArray<FMesh>> KindMeshes;   // (per kind of the table)
	UPROPERTY() TArray<TObjectPtr<UObject>> Held;   // (those meshes, held against the garbage collector: KindMeshes is unseen by it)
	TArray<float> KindDensity;          // (each kind's plants a square metre inside its patches, from its cover and its meshes' size)
	TMap<int64, TArray<TObjectPtr<UPrimitiveComponent>>> Live;   // (ring × cell → its components)
	UPROPERTY() TObjectPtr<UTransformProviderData> Wind = nullptr;
	TObjectPtr<AHotBrookForest> Forest = nullptr;
	TObjectPtr<UHotBrookWater> Water = nullptr;
	bool bReady = false;
	int32 Made = 0, Instances = 0; double MakeMs = 0;
	void LoadMeshes();
	void MakeCell(int32 Ring, int32 CX, int32 CY);
	void FreeCell(int64 Key);
	float NearWater(const FVector2D& Sim, float Within) const;   // (0 far … 1 at the water: how near within the distance)
	// THE SEASON on the ground: each component's kind (its index in the table, by component), what shows now — the herbs, ferns,
	// grasses, low berries and small stones under the snow while it lies; the mushrooms only from August to October
	TMap<TObjectPtr<UPrimitiveComponent>, int32> KindOfComp;
	float SnowK = 0.f, Yf = 0.3f; double NextSeason = 0; uint32 ShownKey = 0xFFFFFFFF;
	bool KindShown(int32 K) const;
};
