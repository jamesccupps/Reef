// HotBrookCamps — the people's places at the lakes: every camp, house, trailer, garage and shed and every dock the dataset has
// (src/w3/true/camps3d.js, laid out as the browser's view lays them — ue/export/export_camps.mjs), each built true size from its
// parts (ue/export/build_camps.py) and imported with its materials (Scripts/import_camps.py: /Game/HotBrook/Camps/Meshes/SM_<name>).
// A building stands on the ground (the heightmap's) with its floor over its highest corner, at most 2.6 m over its lowest — a steep
// lot's downhill side on a tall foundation, as the browser stands them; a dock lies ~0.35 m over the lake from where it meets the
// water, in from late May to mid-October (camps3.js docksIn — the date from the live link) and out of the water otherwise. Their
// triangles are their collision: the walker climbs the steps and walks the decks and docks. And the ROADS (Import/camps.json): each a
// strip draped on the ground every 2 m in the gravel's texture — the camp roads with their two wheel tracks and a grassy crown between,
// the town's roads gravel all across, Route 169 paved — broken where the water is.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookCamps.generated.h"

class UStaticMesh;
class UStaticMeshComponent;
class UProceduralMeshComponent;

UCLASS()
class HOTBROOK_API AHotBrookCamps : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookCamps();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	int32 NumBuildings() const { return NBuild; }
	int32 NumDocks() const { return Docks.Num(); }
private:
	UPROPERTY() TArray<TObjectPtr<UStaticMesh>> Held;   // (the meshes, held against the garbage collector)
	UPROPERTY() TArray<TObjectPtr<UStaticMeshComponent>> Docks;
	UPROPERTY() TObjectPtr<UProceduralMeshComponent> Roads;
	int32 NBuild = 0, DocksIn = -1;
	UStaticMeshComponent* Stand(const FString& Name, const FVector& At);
	void LayRoads();
};
