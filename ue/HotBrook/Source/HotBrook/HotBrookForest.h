// HotBrookForest — the forest about the lakes, every tree where ue/export/export_forest.mjs put it (Import/trees.bin: ~1.9 million,
// stocked as Maine's mixed woods from the aerial photos), each species drawn with its meshes (Import/forest_meshes.json: species →
// static mesh paths — Quixel's Megaplants, or stand-ins until they are imported), scaled to the tree's height and turned. Streamed in
// 200-m tiles about the walker: a tile's instanced meshes made when it comes within LoadRadius, freed past UnloadRadius — a few
// hundred thousand trees in the world at a time, not two million.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookForest.generated.h"

class UInstancedStaticMeshComponent;
class UStaticMesh;

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
private:
	struct FTree { float X, Y, Z; uint8 Sp, Turn; uint16 HDm; };
	struct FMeshInfo { TObjectPtr<UStaticMesh> Mesh = nullptr; float Height = 100.f; };
	TArray<FTree> Trees;
	TArray<int32> TileStart, TileOrder;   // (the trees sorted by tile: a counting sort)
	int32 TX = 0, TY = 0; double TX0 = 0, TY0 = 0; static constexpr double Tile = 200.0;
	TMap<int32, TArray<FMeshInfo>> Meshes;   // species → its meshes (variants)
	TMap<int32, TArray<TObjectPtr<UInstancedStaticMeshComponent>>> Live;   // tile → its components
	bool LoadTrees();
	void LoadMeshes();
	void MakeTile(int32 T);
	void FreeTile(int32 T);
};
