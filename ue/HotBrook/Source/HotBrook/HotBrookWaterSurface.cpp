#include "HotBrookWaterSurface.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "Components/PostProcessComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Engine/DirectionalLight.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "Camera/PlayerCameraManager.h"
#include "GameFramework/PlayerController.h"
#include "Materials/MaterialInstanceDynamic.h"
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
	PrimaryActorTick.bCanEverTick = true;
	Mesh = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("Lakes"));
	RootComponent = Mesh;
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision); Mesh->SetCastShadow(false);
	Under = CreateDefaultSubobject<UPostProcessComponent>(TEXT("Underwater"));
	Under->SetupAttachment(Mesh); Under->bUnbound = true; Under->Priority = 10.f; Under->BlendWeight = 0.f;
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
	// (the view from under the surface: off until the camera goes under)
	if (UMaterialInterface* UM = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Materials/M_HB_Underwater.M_HB_Underwater"))) {
		UnderMat = UMaterialInstanceDynamic::Create(UM, this); Under->Settings.WeightedBlendables.Array.Add(FWeightedBlendable(1.f, UnderMat));
	} else UE_LOG(LogHotBrookWater, Warning, TEXT("no M_HB_Underwater (Scripts/make_underwater_material.py): under the surface looks like air"));
	for (TActorIterator<ADirectionalLight> It(GetWorld()); It; ++It) { Sun = *It; break; }
	UMaterialInterface* Mat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Materials/M_LakeWater.M_LakeWater"));
	int32 Section = 0; TArray<TArray<FVector2D>> LakeP; TArray<double> LakeLv;   // (each lake's shoreline and level: for the brook's mouths)
	for (const TSharedPtr<FJsonValue>& V : J->GetArrayField(TEXT("lakes"))) {
		const TSharedPtr<FJsonObject> O = V->AsObject(); const double Level = O->GetNumberField(TEXT("level"));
		TArray<FVector2D> P;
		for (const TSharedPtr<FJsonValue>& Q : O->GetArrayField(TEXT("pts"))) { const TArray<TSharedPtr<FJsonValue>>& XY = Q->AsArray(); P.Add(FVector2D(XY[0]->AsNumber(), XY[1]->AsNumber())); }
		if (P.Num() > 3 && P[0].Equals(P.Last(), 0.01)) P.Pop();
		if (P.Num() < 3) continue;
		double A2 = 0; for (int32 i = 0; i < P.Num(); i++) { const FVector2D& a = P[i], & b = P[(i + 1) % P.Num()]; A2 += a.X * b.Y - b.X * a.Y; }
		if (A2 < 0) Algo::Reverse(P);   // (counter-clockwise in the sim's x east, y north)
		LakeP.Add(P); LakeLv.Add(Level);
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
	// THE BROOK: the water grid's wet cells within 20 m of its course (lakes.json's brook path) outside the lakes' outlines, and the ring
	// of cells about them (under its banks — the ground hides it there, as the lakes' pushed-out shores); each cell corner at the mean
	// level of the brook's cells that share it — a ring corner (no brook cell shares it) at the level of those about it but 5 cm under
	// the ground there, so the waterline falls where the bank rises, not on a cell's edge where the ground beside the brook lies low —,
	// and where a lake's surface reaches over it (within BankOverlap + 2 m of that lake's shoreline) 3 cm under that lake's level
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	const TSharedPtr<FJsonObject>* BO = nullptr; const TArray<TSharedPtr<FJsonValue>>* BP = nullptr;
	if (W && W->IsLoaded() && J->TryGetObjectField(TEXT("brook"), BO) && (*BO)->TryGetArrayField(TEXT("path"), BP) && BP->Num() >= 2) {
		TArray<FVector2D> Path; FBox2D PB(ForceInit);
		for (const TSharedPtr<FJsonValue>& Q : *BP) { const TArray<TSharedPtr<FJsonValue>>& XY = Q->AsArray(); Path.Add(FVector2D(XY[0]->AsNumber(), XY[1]->AsNumber())); PB += Path.Last(); }
		const auto ToPoly = [](const FVector2D& M, const TArray<FVector2D>& Pl, bool bClosed) { double D = 1e18; const int32 N = Pl.Num();
			for (int32 i = 0; i + (bClosed ? 0 : 1) < N; i++) D = FMath::Min(D, FMath::PointDistToSegment(FVector(M, 0.0), FVector(Pl[i], 0.0), FVector(Pl[(i + 1) % N], 0.0))); return D; };
		int32 GX, GY; float GX0, GY0, GC; W->Grid(GX, GY, GX0, GY0, GC);
		const auto InLakeM = [&](double X, double Y) { return W->InLake(HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum)); };
		TMap<FIntPoint, float> Wet;
		PB = PB.ExpandBy(25.0);
		for (int32 r = FMath::Max(0, FMath::FloorToInt((PB.Min.Y - GY0) / GC)); r <= FMath::Min(GY - 1, FMath::FloorToInt((PB.Max.Y - GY0) / GC)); r++)
			for (int32 q = FMath::Max(0, FMath::FloorToInt((PB.Min.X - GX0) / GC)); q <= FMath::Min(GX - 1, FMath::FloorToInt((PB.Max.X - GX0) / GC)); q++) {
				const double X = GX0 + (q + 0.5) * GC, Y = GY0 + (r + 0.5) * GC; float S;
				if (W->CellSurface(q, r, S) && !InLakeM(X, Y) && ToPoly(FVector2D(X, Y), Path, false) < 20.0) Wet.Add(FIntPoint(q, r), S);
			}
		TSet<FIntPoint> Cells;
		for (const TPair<FIntPoint, float>& KV : Wet) for (int32 dr = -1; dr <= 1; dr++) for (int32 dq = -1; dq <= 1; dq++) {
			const FIntPoint N(KV.Key.X + dq, KV.Key.Y + dr);
			if (Wet.Contains(N) || !InLakeM(GX0 + (N.X + 0.5) * GC, GY0 + (N.Y + 0.5) * GC)) Cells.Add(N);
		}
		TMap<FIntPoint, int32> Vi; TArray<FVector> Verts; TArray<FVector> Norms; TArray<FVector2D> UV; TArray<FProcMeshTangent> Tan; TArray<FLinearColor> Col; TArray<int32> Tri;
		const auto Corner = [&](const FIntPoint& K) -> int32 {
			if (const int32* I = Vi.Find(K)) return *I;
			double Sum = 0; int32 N = 0;
			const bool bRing = !Wet.Contains(K) && !Wet.Contains(K - FIntPoint(1, 0)) && !Wet.Contains(K - FIntPoint(0, 1)) && !Wet.Contains(K - FIntPoint(1, 1));
			for (int32 Reach = 1; Reach <= 3 && !N; Reach++)   // (the cells sharing it; for a ring corner, the brook's nearest about it)
				for (int32 dr = -Reach; dr < Reach; dr++) for (int32 dq = -Reach; dq < Reach; dq++) if (const float* S = Wet.Find(FIntPoint(K.X + dq, K.Y + dr))) { Sum += *S; N++; }
			const double X = GX0 + K.X * GC, Y = GY0 + K.Y * GC; double Z = N ? Sum / N : LakeLv.Num() ? LakeLv[0] : 0.0; float G;
			if (bRing && W->GroundAt(HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum), G)) Z = FMath::Min(Z, G / 100.0 + HotBrookCoords::Datum - 0.05);
			for (int32 l = 0; l < LakeP.Num(); l++) if (ToPoly(FVector2D(X, Y), LakeP[l], true) < BankOverlap + 2.0) Z = FMath::Min(Z, LakeLv[l] - 0.03);
			Verts.Add(HotBrookCoords::ToUE(X, Y, Z)); Norms.Add(FVector::UpVector); UV.Add(FVector2D(X, Y) / 10.0); Tan.Add(FProcMeshTangent(1, 0, 0)); Col.Add(FLinearColor::White);
			return Vi.Add(K, Verts.Num() - 1);
		};
		for (const FIntPoint& K : Cells) {
			const int32 a = Corner(K), b = Corner(K + FIntPoint(1, 0)), c = Corner(K + FIntPoint(0, 1)), d = Corner(K + FIntPoint(1, 1));
			Tri.Append({ a, d, b, a, c, d });   // (counter-clockwise in the sim's x east, y north: wound for UE's up-facing, as the lakes')
		}
		if (Tri.Num()) {
			Mesh->CreateMeshSection_LinearColor(Section, Verts, Tri, Norms, UV, Col, Tan, false);
			if (Mat) Mesh->SetMaterial(Section, Mat);
			UE_LOG(LogHotBrookWater, Display, TEXT("the brook: %d wet cells and %d under its banks, %d triangles"), Wet.Num(), Cells.Num() - Wet.Num(), Tri.Num() / 3);
			Section++;
		}
	}
}

void AHotBrookWaterSurface::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!UnderMat) return;
	const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	if (!PC || !PC->PlayerCameraManager || !W) return;
	const FVector C = PC->PlayerCameraManager->GetCameraLocation();
	float S = 0; const bool bUnder = W->SurfaceAt(C, S) && C.Z < S - 1.f;   // (under the ice too)
	Under->BlendWeight = bUnder ? 1.f : 0.f;
	if (!bUnder) return;
	// the daylight on the water: the sun's on a level surface and the sky's (~a quarter of the sun's at noon, the light of dusk after
	// the sun is down), in the scene's own units — the sun light's intensity and colour
	FLinearColor E = FLinearColor::Black;
	if (Sun) {
		const UDirectionalLightComponent* L = Cast<UDirectionalLightComponent>(Sun->GetLightComponent());
		const float SinAlt = -Sun->GetActorForwardVector().Z, I = L ? L->Intensity : 10.f;
		const FLinearColor Col = L ? L->GetLightColor() : FLinearColor::White;
		E = Col * (I * FMath::Max(0.f, SinAlt)) + FLinearColor(0.75f, 0.85f, 1.f) * (0.25f * I * FMath::SmoothStep(-0.12f, 0.15f, SinAlt));
	}
	UnderMat->SetScalarParameterValue(TEXT("SurfaceZ"), S);
	UnderMat->SetVectorParameterValue(TEXT("SunLux"), E);
}
