#include "HotBrookWaterSurface.h"
#include "HotBrookCoords.h"
#include "ProceduralMeshComponent.h"
#include "Algo/Reverse.h"
#include "Materials/MaterialInterface.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookWater, Log, All);

AHotBrookWaterSurface::AHotBrookWaterSurface()
{
	PrimaryActorTick.bCanEverTick = false;
	Mesh = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("Lakes"));
	RootComponent = Mesh;
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision); Mesh->SetCastShadow(false);
}

// ear clipping of a simple polygon (counter-clockwise), triangles as index triples
static void EarClip(const TArray<FVector2D>& P, TArray<int32>& Out)
{
	TArray<int32> V; for (int32 i = 0; i < P.Num(); i++) V.Add(i);
	const auto Cross = [](const FVector2D& A, const FVector2D& B, const FVector2D& C) { return (B.X - A.X) * (C.Y - A.Y) - (B.Y - A.Y) * (C.X - A.X); };
	int32 Guard = 0;
	while (V.Num() > 3 && Guard++ < 100000) {
		bool bCut = false;
		for (int32 k = 0; k < V.Num(); k++) {
			const int32 a = V[(k + V.Num() - 1) % V.Num()], b = V[k], c = V[(k + 1) % V.Num()];
			if (Cross(P[a], P[b], P[c]) <= 0) continue;   // (a reflex corner)
			bool bInside = false;
			for (int32 j : V) { if (j == a || j == b || j == c) continue; if (Cross(P[a], P[b], P[j]) >= 0 && Cross(P[b], P[c], P[j]) >= 0 && Cross(P[c], P[a], P[j]) >= 0) { bInside = true; break; } }
			if (bInside) continue;
			Out.Append({ a, c, b }); V.RemoveAt(k); bCut = true; break;   // (wound for UE's left-handed up-facing triangles)
		}
		if (!bCut) break;   // (a polygon that won't clip — self-touching: what is left goes undrawn)
	}
	if (V.Num() == 3) Out.Append({ V[0], V[2], V[1] });
}

void AHotBrookWaterSurface::BeginPlay()
{
	Super::BeginPlay();
	FString Text; TSharedPtr<FJsonObject> J;
	if (!FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("lakes.json"))) || !FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) || !J.IsValid()) {
		UE_LOG(LogHotBrookWater, Warning, TEXT("Import/lakes.json not read: no lakes drawn")); return;
	}
	UMaterialInterface* Mat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Materials/M_LakeWater.M_LakeWater"));
	int32 Section = 0;
	for (const TSharedPtr<FJsonValue>& V : J->GetArrayField(TEXT("lakes"))) {
		const TSharedPtr<FJsonObject> O = V->AsObject(); const double Level = O->GetNumberField(TEXT("level"));
		TArray<FVector2D> P;
		for (const TSharedPtr<FJsonValue>& Q : O->GetArrayField(TEXT("pts"))) { const TArray<TSharedPtr<FJsonValue>>& XY = Q->AsArray(); P.Add(FVector2D(XY[0]->AsNumber(), XY[1]->AsNumber())); }
		if (P.Num() > 3 && P[0].Equals(P.Last(), 0.01)) P.Pop();
		if (P.Num() < 3) continue;
		double A2 = 0; for (int32 i = 0; i < P.Num(); i++) { const FVector2D& a = P[i], & b = P[(i + 1) % P.Num()]; A2 += a.X * b.Y - b.X * a.Y; }
		if (A2 < 0) Algo::Reverse(P);   // (counter-clockwise in the sim's x east, y north)
		// (pushed out under the banks: each corner along the average of its edges' outward normals)
		TArray<FVector2D> Q; Q.SetNum(P.Num());
		for (int32 i = 0; i < P.Num(); i++) {
			const FVector2D& a = P[(i + P.Num() - 1) % P.Num()], & b = P[i], & c = P[(i + 1) % P.Num()];
			const FVector2D e1 = (b - a).GetSafeNormal(), e2 = (c - b).GetSafeNormal(), n = (FVector2D(e1.Y, -e1.X) + FVector2D(e2.Y, -e2.X)).GetSafeNormal();
			Q[i] = b + n * BankOverlap;
		}
		TArray<int32> Tri; EarClip(P, Tri);   // (clipped on the true shoreline — the pushed-out one can fold in narrow coves — then laid on the pushed-out corners)
		TArray<FVector> Verts; TArray<FVector> Norms; TArray<FVector2D> UV; TArray<FProcMeshTangent> Tan; TArray<FLinearColor> Col;
		for (const FVector2D& q : Q) { Verts.Add(HotBrookCoords::ToUE(q.X, q.Y, Level)); Norms.Add(FVector::UpVector); UV.Add(q / 10.0); Tan.Add(FProcMeshTangent(1, 0, 0)); Col.Add(FLinearColor::White); }
		Mesh->CreateMeshSection_LinearColor(Section, Verts, Tri, Norms, UV, Col, Tan, false);
		if (Mat) Mesh->SetMaterial(Section, Mat);
		UE_LOG(LogHotBrookWater, Display, TEXT("%s: %d corners, %d triangles at %.2f m"), *O->GetStringField(TEXT("name")), P.Num(), Tri.Num() / 3, Level);
		Section++;
	}
}
