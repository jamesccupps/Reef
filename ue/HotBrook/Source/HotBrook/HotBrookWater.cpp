#include "HotBrookWater.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "HotBrookCoords.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UHotBrookWater::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	// the heightmap (Import/heightmap.r16 + .json: export_world.mjs)
	{
		FString Text; TArray<uint8> Raw; TSharedPtr<FJsonObject> J;
		const FString Dir = FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"));
		if (FFileHelper::LoadFileToString(Text, *(Dir / TEXT("heightmap.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid()
			&& FFileHelper::LoadFileToArray(Raw, *(Dir / TEXT("heightmap.r16")))) {
			HX = J->GetIntegerField(TEXT("nx")); HY = J->GetIntegerField(TEXT("ny")); HX0 = J->GetNumberField(TEXT("x0")); HYN = J->GetNumberField(TEXT("yNorth")); HCell = J->GetNumberField(TEXT("cell"));
			if (Raw.Num() == HX * HY * 2) { Heights.SetNumUninitialized(HX * HY); FMemory::Memcpy(Heights.GetData(), Raw.GetData(), Raw.Num()); } else HX = HY = 0;
		}
	}
	// Import/water.bin: "HBW1", int32 nx, ny, float x0, y0, cell (m), then nx*ny float32 surface heights (m; < -1e5 on land)
	TArray<uint8> Bytes;
	const FString Path = FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("water.bin"));
	if (!FFileHelper::LoadFileToArray(Bytes, *Path) || Bytes.Num() < 24 || FMemory::Memcmp(Bytes.GetData(), "HBW1", 4) != 0) return;
	const uint8* B = Bytes.GetData() + 4;
	int32 nx, ny; float x0, y0, cell;
	FMemory::Memcpy(&nx, B, 4); FMemory::Memcpy(&ny, B + 4, 4); FMemory::Memcpy(&x0, B + 8, 4); FMemory::Memcpy(&y0, B + 12, 4); FMemory::Memcpy(&cell, B + 16, 4);
	if ((int64)nx * ny * 4 + 24 > Bytes.Num()) return;
	NX = nx; NY = ny; X0 = x0; Y0 = y0; Cell = cell;
	Surface.SetNumUninitialized(NX * NY); FMemory::Memcpy(Surface.GetData(), B + 20, NX * NY * 4);
}

int32 UHotBrookWater::IndexAt(const FVector& P) const
{
	if (!NX) return -1;
	const FVector2D M = HotBrookCoords::ToSim(P);
	const int32 q = FMath::FloorToInt((M.X - X0) / Cell), r = FMath::FloorToInt((M.Y - Y0) / Cell);
	return q >= 0 && q < NX && r >= 0 && r < NY ? r * NX + q : -1;
}

bool UHotBrookWater::SurfaceAt(const FVector& P, float& OutZ) const
{
	const int32 i = IndexAt(P); if (i < 0) return false;
	const float s = Surface[i]; if (s < -1e5f) return false;
	OutZ = HotBrookCoords::HeightToUE(s); return true;
}

float UHotBrookWater::IceAt(const FVector& P) const
{
	const int32 i = IndexAt(P); return i >= 0 && Ice.IsValidIndex(i) ? Ice[i] : 0.f;
}

bool UHotBrookWater::GroundAt(const FVector& P, float& OutZ) const
{
	if (!HX) return false;
	const FVector2D M = HotBrookCoords::ToSim(P);
	const double u = (M.X - HX0) / HCell, v = (HYN - M.Y) / HCell;
	if (u < 0 || v < 0 || u >= HX - 1 || v >= HY - 1) return false;
	const int32 i = (int32)u, j = (int32)v; const double a = u - i, b = v - j;
	const auto H = [&](int32 q, int32 r) { return (Heights[r * HX + q] - 32768.0) / 128.0 + HotBrookCoords::Datum; };
	const double h = H(i, j) * (1 - a) * (1 - b) + H(i + 1, j) * a * (1 - b) + H(i, j + 1) * (1 - a) * b + H(i + 1, j + 1) * a * b;
	OutZ = HotBrookCoords::HeightToUE(h); return true;
}
