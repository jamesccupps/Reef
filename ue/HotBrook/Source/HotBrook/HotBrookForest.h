// HotBrookForest — the forest about the lakes, every tree where ue/export/export_forest.mjs put it (Import/trees.bin: ~1.9 million,
// stocked as Maine's mixed woods from the aerial photos), each species drawn with its meshes (Import/forest_meshes.json: species →
// mesh paths, written by Scripts/make_forest_meshes.py — Quixel's Megaplants, or stand-ins until they are imported), scaled to the
// tree's height and turned. A Megaplant is a skinned mesh whose branches Unreal's Dynamic Wind bends (the plugin's GPU wind, driven
// by the sim's wind speed and direction from AHotBrookLink); its instances go in an instanced skinned component, a plain mesh's in an
// instanced static one. The trunks block the walker through a hidden cylinder each. Streamed in 200-m tiles about the walker: a
// tile's instanced meshes made when it comes within LoadRadius, freed past UnloadRadius — a few hundred thousand trees in the world
// at a time, not two million. THE LEAVES BY THE DATE (the hardwoods: birch, aspen, red maple, beech, alder, hazel, willows, the young
// hardwoods): their own green in summer; from the turning their twin (Scripts/make_season_foliage.py: the Megaplants master's Seasons,
// its two colours set here by the species and the day — green to the autumn's scarlet, gold or bronze to brown); from the fall to the
// leaf-out none (the leaves' slots masked away: bare branches) — each 200-m tile a few days either side of the date, so the hills turn
// and the leaves come down in patches. The dates are the browser view's (main3.js LEAF), by species. hb.LeafDate shows another date's.
// THE SNOW ON THE BOUGHS: while snow lies on the land the conifers (spruce, fir, pine, cedar, the young ones) wear their twin, its
// colours set so the switch's turned needles go white — mottled, the snow caught on them.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookForest.generated.h"

class UInstancedStaticMeshComponent;
class UPrimitiveComponent;
class UStaticMesh;
class USkeletalMesh;
class UTransformProviderData;
class UInstancedSkinnedMeshComponent;
class UMaterialInterface;
class UMaterialInstanceDynamic;

UCLASS()
class HOTBROOK_API AHotBrookForest : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookForest();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float LoadRadius = 1200.f;     // m
	UPROPERTY(EditAnywhere, Category = "HotBrook") float UnloadRadius = 1500.f;   // m
	UPROPERTY(EditAnywhere, Category = "HotBrook") float BudgetMs = 6.f;          // (the tiles made a tick: within this, one at least)
	UPROPERTY(EditAnywhere, Category = "HotBrook") float TrunkRadius = 150.f;     // m: the trunks have collision within this of the walker
	// the trees' shadows: Rigid lets the virtual shadow maps keep them cached while the wind bends the branches (Auto redraws every
	// shadow page each frame — ~28 ms on the RTX 3060 in the woods); the sun's own moves still redraw them
	UPROPERTY(EditAnywhere, Category = "HotBrook") EShadowCacheInvalidationBehavior TreeShadowCache = EShadowCacheInvalidationBehavior::Rigid;
	// the wind in the branches: the sim's wind (m/s, and the bearing it blows FROM: 0 north, clockwise, radians) — AHotBrookLink sets it
	void SetWind(float SpeedMs, float FromBearing);
	// the stand about a place (the sim's metres): the canopy trees within R m and how many of them are conifers (the ground cover's
	// sense of shade and of conifer or hardwood floor)
	void CanopyAt(const FVector2D& Sim, float R, int32& NCanopy, int32& NConifer) const;
	// (the streaming's own measure, for -hbstats: tiles live, tiles made and the ms spent making them since last asked)
	int32 LiveTiles() const { return Live.Num(); }
	void TakeMakeStats(int32& OutMade, double& OutMs) { OutMade = Made; OutMs = MakeMs; Made = 0; MakeMs = 0; }
private:
	struct FTree { float X, Y, Z; uint8 Sp, Turn; uint16 HDm; };
	struct FMeshInfo { TObjectPtr<UStaticMesh> Mesh = nullptr; TObjectPtr<USkeletalMesh> Skel = nullptr; float Height = 100.f; bool bStandIn = false; };
	TArray<FTree> Trees;
	TArray<int32> TileStart, TileOrder;   // (the trees sorted by tile: a counting sort)
	int32 TX = 0, TY = 0; double TX0 = 0, TY0 = 0; static constexpr double Tile = 200.0;
	TMap<int32, TArray<FMeshInfo>> Meshes;   // species → its meshes (variants)
	UPROPERTY() TArray<TObjectPtr<UObject>> Held;   // (those meshes, held against the garbage collector: Meshes is unseen by it)
	TMap<int32, TArray<TObjectPtr<UPrimitiveComponent>>> Live;   // tile → its components
	UPROPERTY() TObjectPtr<UTransformProviderData> Wind = nullptr;   // (the Dynamic Wind provider every skinned tree uses)
	UPROPERTY() TObjectPtr<UStaticMesh> TrunkShape = nullptr;
	float WindMs = 3.f, WindFrom = 3.93f; double NextWind = 0;
	int32 Made = 0; double MakeMs = 0;
	bool LoadTrees();
	void LoadMeshes();
	void MakeTile(int32 T);
	int32 VariantOf(const FTree& Tr, int32 Index, const TArray<FMeshInfo>& L) const;
	void MakeTrunks(int32 Cell);
	static constexpr double TrunkCell = 50.0;   // m (each cell inside one 200-m tile: 200 / 50)
	TMap<int32, TObjectPtr<UInstancedStaticMeshComponent>> Trunks;   // (trunk cell → its colliders)
	void FreeTile(int32 T);
	void PushWind();
	struct FSeason { TObjectPtr<UMaterialInstanceDynamic> MID; int32 Sp = 0; };
	TMap<UMaterialInterface*, FSeason> SeasonOf;   // (a hardwood's own foliage material → its twin's dynamic instance and its species)
	UPROPERTY() TArray<TObjectPtr<UObject>> SeasonHeld;
	UPROPERTY() TObjectPtr<UMaterialInterface> Bare = nullptr;
	float LeafYf = 0.3f, SnowK = 0.f; double NextLeaf = 0;   // (the date; the snow on the land, MPC_HB_Season's — the conifers' boughs carry it)
	void LoadSeasons();
	int32 LeafState(int32 Sp, int32 TileIx) const;   // (0 its own leaves, 1 the autumn's twin, 2 bare)
	void ApplyLeaves(UInstancedSkinnedMeshComponent* C, int32 TileIx);
	void UpdateLeaves();
};
