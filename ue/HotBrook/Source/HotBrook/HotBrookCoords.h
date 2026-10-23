// HotBrookCoords — the sim's metres (x east, y north, heights above its datum: the elevations of the lidar model) to Unreal's
// centimetres (X east, Y south — UE is left-handed with Y to the right of X — and Z up), and back. One rule everywhere: the
// exporter (ue/export/export_world.mjs) writes in the sim's metres and these place them.
#pragma once
#include "CoreMinimal.h"

namespace HotBrookCoords
{
	// (the heights: the model's elevations less this datum, so the lakes sit near Z = 0 — Upper's surface is ~119 m above sea level)
	constexpr double Datum = 110.0;
	inline FVector ToUE(double X, double Y, double H) { return FVector(X * 100.0, -Y * 100.0, (H - Datum) * 100.0); }
	inline FVector2D ToSim(const FVector& P) { return FVector2D(P.X / 100.0, -P.Y / 100.0); }
	inline float HeightToUE(double H) { return (float)((H - Datum) * 100.0); }
	inline double HeightToSim(double Z) { return Z / 100.0 + Datum; }
}
