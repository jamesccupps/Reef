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
	// whether a place is the brook's drawn water: a wet cell within 20 m of its course (lakes.json's brook path), outside the lakes'
	// outlines — what AHotBrookWaterSurface draws as the brook; and either (the water drawn there at all)
	bool InBrook(const FVector& P) const;
	bool Drawn(const FVector& P) const { return InLake(P) || InBrook(P); }
	// whether a place is the camps' cleared ground — a footprint or yard, a path to the water, a dock's foot, a road, a beach, the launch
	// (Import/cleared.bin, export_camps.mjs: the browser view's clearedAt) — where nothing grows on the ground
	bool ClearedAt(const FVector& P) const;
	// the ice's thickness there (m), from the live link (0 without one)
	float IceAt(const FVector& P) const;
	void SetIce(const TArray<float>& PerCell) { Ice = PerCell; }
	bool IsLoaded() const { return NX > 0; }
	// the grid itself (the sim's metres) and a cell's surface (m above sea level; false on land): for drawing the brook's water
	void Grid(int32& OutNX, int32& OutNY, float& OutX0, float& OutY0, float& OutCell) const { OutNX = NX; OutNY = NY; OutX0 = X0; OutY0 = Y0; OutCell = Cell; }
	bool CellSurface(int32 Q, int32 R, float& OutM) const { if (Q < 0 || R < 0 || Q >= NX || R >= NY) return false; const float S = Surface[R * NX + Q]; if (S < -1e5f) return false; OutM = S; return true; }
private:
	int32 NX = 0, NY = 0; float X0 = 0, Y0 = 0, Cell = 1;   // (the grid in the sim's metres: x east, y north)
	TArray<float> Surface;   // (m above the sim's datum, or a large negative on land)
	TArray<float> Ice;
	int32 HX = 0, HY = 0; double HX0 = 0, HYN = 0, HCell = 2; TArray<uint16> Heights;   // (the heightmap: row 0 north)
	int32 IndexAt(const FVector& P) const;
	TArray<TArray<FVector2D>> LakePts; TArray<FBox2D> LakeBox;   // (the sim's metres)
	TArray<FVector2D> BrookPath; FBox2D BrookBox = FBox2D(ForceInit);
	int32 CX = 0, CY = 0, CRow = 0; double CX0 = 0, CY0 = 0; TArray<uint8> Cleared;   // (1-m bits, rows from the south)
};
