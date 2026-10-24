// HotBrookWater — where the lakes' and the brook's water is, and its surface's height (UE cm), from the grid the world exporter
// writes (Import/water.bin: ue/export/export_world.mjs): the walker wades, swims and dives by it; the live link updates the ice.
#pragma once
#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "HotBrookWater.generated.h"

UCLASS()
class HOTBROOK_API UHotBrookWater : public UWorldSubsystem
{
	GENERATED_BODY()
public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	// the water's surface at a place (UE cm) if there is water there; false on land
	bool SurfaceAt(const FVector& P, float& OutZ) const;
	// the ground's height (UE cm) at a place, from the heightmap the landscape was made from (no wait on the landscape's collision)
	bool GroundAt(const FVector& P, float& OutZ) const;
	// whether a place lies within a lake's drawn outline (Import/lakes.json: the 0.25-m depth line AHotBrookWaterSurface draws from) —
	// the water grid's wet cells reach a little past it on low shores, where no surface is drawn
	bool InLake(const FVector& P) const;
	// the ice's thickness there (m), from the live link (0 without one)
	float IceAt(const FVector& P) const;
	void SetIce(const TArray<float>& PerCell) { Ice = PerCell; }
	bool IsLoaded() const { return NX > 0; }
private:
	int32 NX = 0, NY = 0; float X0 = 0, Y0 = 0, Cell = 1;   // (the grid in the sim's metres: x east, y north)
	TArray<float> Surface;   // (m above the sim's datum, or a large negative on land)
	TArray<float> Ice;
	int32 HX = 0, HY = 0; double HX0 = 0, HYN = 0, HCell = 2; TArray<uint16> Heights;   // (the heightmap: row 0 north)
	int32 IndexAt(const FVector& P) const;
	TArray<TArray<FVector2D>> LakePts; TArray<FBox2D> LakeBox;   // (the sim's metres)
};
