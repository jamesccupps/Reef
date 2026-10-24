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
	// the lakes' outlines (Import/lakes.json)
	{
		FString Text; TSharedPtr<FJsonObject> J;
		if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("lakes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid())
			for (const TSharedPtr<FJsonValue>& V : J->GetArrayField(TEXT("lakes"))) {
				TArray<FVector2D> Pts; FBox2D Box; Box.Init();
				for (const TSharedPtr<FJsonValue>& Q : V->AsObject()->GetArrayField(TEXT("pts"))) { const TArray<TSharedPtr<FJsonValue>>& XY = Q->AsArray(); Pts.Add(FVector2D(XY[0]->AsNumber(), XY[1]->AsNumber())); Box += Pts.Last(); }
				if (Pts.Num() > 2) { LakePts.Add(Pts); LakeBox.Add(Box); }
			}
	}
	// the cleared ground (Import/cleared.bin: export_camps.mjs — "HBC1", int32 nx, ny, float64 x0, y0, then bits by rows from the south)
	{
		TArray<uint8> Bits;
		if (FFileHelper::LoadFileToArray(Bits, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("cleared.bin"))) && Bits.Num() >= 28 && FMemory::Memcmp(Bits.GetData(), "HBC1", 4) == 0) {
			int32 nx, ny; double x0, y0; const uint8* B = Bits.GetData();
			FMemory::Memcpy(&nx, B + 4, 4); FMemory::Memcpy(&ny, B + 8, 4); FMemory::Memcpy(&x0, B + 12, 8); FMemory::Memcpy(&y0, B + 20, 8);
			const int32 RowB = (nx + 7) / 8;
			if ((int64)RowB * ny + 28 <= Bits.Num()) { CX = nx; CY = ny; CX0 = x0; CY0 = y0; CRow = RowB; Cleared.SetNumUninitialized(RowB * ny); FMemory::Memcpy(Cleared.GetData(), B + 28, RowB * ny); }
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

bool UHotBrookWater::InLake(const FVector& P) const
{
	const FVector2D M = HotBrookCoords::ToSim(P);
	for (int32 l = 0; l < LakePts.Num(); l++) {
		if (!LakeBox[l].IsInside(M)) continue;
		const TArray<FVector2D>& Pt = LakePts[l]; bool bIn = false;
		for (int32 i = 0, j = Pt.Num() - 1; i < Pt.Num(); j = i++)
			if ((Pt[i].Y > M.Y) != (Pt[j].Y > M.Y) && M.X < (Pt[j].X - Pt[i].X) * (M.Y - Pt[i].Y) / (Pt[j].Y - Pt[i].Y) + Pt[i].X) bIn = !bIn;
		if (bIn) return true;
	}
	return false;
}

bool UHotBrookWater::ClearedAt(const FVector& P) const
{
	if (!CX) return false;
	const FVector2D M = HotBrookCoords::ToSim(P);
	const int32 q = FMath::FloorToInt(M.X - CX0), r = FMath::FloorToInt(M.Y - CY0);
	return q >= 0 && q < CX && r >= 0 && r < CY && (Cleared[r * CRow + (q >> 3)] >> (q & 7) & 1);
}
