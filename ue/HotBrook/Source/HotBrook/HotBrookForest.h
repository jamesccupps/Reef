// HotBrookForest — the forest about the lakes, every tree where ue/export/export_forest.mjs put it (Import/trees.bin: ~1.9 million,
// stocked as Maine's mixed woods from the aerial photos), each species drawn with its meshes (Import/forest_meshes.json: species →
// mesh paths, written by Scripts/make_forest_meshes.py — Quixel's Megaplants, or stand-ins until they are imported), scaled to the
// tree's height and turned. A Megaplant is a skinned mesh whose branches Unreal's Dynamic Wind bends (the plugin's GPU wind, driven
// by the sim's wind speed and direction from AHotBrookLink); its instances go in an instanced skinned component, a plain mesh's in an
// instanced static one. The trunks block the walker through a hidden cylinder each. Streamed in 200-m tiles about the walker: a
// tile's instanced meshes made when it comes within LoadRadius, freed past UnloadRadius — a few hundred thousand trees in the world
// at a time, not two million.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookForest.generated.h"

class UInstancedStaticMeshComponent;
class UPrimitiveComponent;
class UStaticMesh;
class USkeletalMesh;
class UTransformProviderData;

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
	UPROPERTY(EditAnywhere, Category = "HotBrook") int32 TilesPerTick = 2;        // (tiles made a frame: no hitch as the walker moves)
	// the trees' shadows: Rigid lets the virtual shadow maps keep them cached while the wind bends the branches (Auto redraws every
	// shadow page each frame — ~28 ms on the RTX 3060 in the woods); the sun's own moves still redraw them
	UPROPERTY(EditAnywhere, Category = "HotBrook") EShadowCacheInvalidationBehavior TreeShadowCache = EShadowCacheInvalidationBehavior::Rigid;
	// the wind in the branches: the sim's wind (m/s, and the bearing it blows FROM: 0 north, clockwise, radians) — AHotBrookLink sets it
	void SetWind(float SpeedMs, float FromBearing);
private:
	struct FTree { float X, Y, Z; uint8 Sp, Turn; uint16 HDm; };
	struct FMeshInfo { TObjectPtr<UStaticMesh> Mesh = nullptr; TObjectPtr<USkeletalMesh> Skel = nullptr; float Height = 100.f; bool bStandIn = false; };
	TArray<FTree> Trees;
	TArray<int32> TileStart, TileOrder;   // (the trees sorted by tile: a counting sort)
	int32 TX = 0, TY = 0; double TX0 = 0, TY0 = 0; static constexpr double Tile = 200.0;
	TMap<int32, TArray<FMeshInfo>> Meshes;   // species → its meshes (variants)
	TMap<int32, TArray<TObjectPtr<UPrimitiveComponent>>> Live;   // tile → its components
	UPROPERTY() TObjectPtr<UTransformProviderData> Wind = nullptr;   // (the Dynamic Wind provider every skinned tree uses)
	UPROPERTY() TObjectPtr<UStaticMesh> TrunkShape = nullptr;
	float WindMs = 3.f, WindFrom = 3.93f; double NextWind = 0;
	bool LoadTrees();
	void LoadMeshes();
	void MakeTile(int32 T);
	void FreeTile(int32 T);
	void PushWind();
};
