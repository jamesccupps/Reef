#include "HotBrookCamps.h"
#include "HotBrookLink.h"
#include "HotBrookWater.h"
#include "HotBrookCoords.h"
#include "HAL/IConsoleManager.h"
#include "Components/StaticMeshComponent.h"
#include "ProceduralMeshComponent.h"
#include "Materials/MaterialInterface.h"
#include "Dom/JsonObject.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookCamps, Log, All);

static TAutoConsoleVariable<int32> CVarDocksIn(TEXT("hb.DocksIn"), -1, TEXT("the camps' docks: -1 by the date (in May 25 - Oct 15), 0 out, 1 in"));

// (camps3.js: the docks are in from May 25 to October 15 — the year's fraction from March 1)
static constexpr float DOCK_IN = (31 + 30 + 24) / 365.f, DOCK_OUT = (31 + 30 + 31 + 30 + 31 + 31 + 30 + 14) / 365.f;

AHotBrookCamps::AHotBrookCamps()
{
	PrimaryActorTick.bCanEverTick = true;   // (the boats' bob; the date — a dock's season — once a second)
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root")); RootComponent->SetMobility(EComponentMobility::Static);
}

UStaticMeshComponent* AHotBrookCamps::Stand(const FString& Name, FVector At, bool bMovable, const FString& Path, float Yaw, bool bFlip)
{
	UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, Path.IsEmpty() ? *FString::Printf(TEXT("/Game/HotBrook/Camps/Meshes/SM_%s.SM_%s"), *Name, *Name) : *Path);
	if (!M) return nullptr;
	Held.AddUnique(M);
	UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
	C->SetStaticMesh(M); C->SetMobility(bMovable ? EComponentMobility::Movable : EComponentMobility::Static); C->SetupAttachment(RootComponent);
	if (bMovable) { C->bAffectDistanceFieldLighting = false; C->bAffectDynamicIndirectLighting = false; }   // (moving: out of Lumen's scene)
	C->SetCollisionProfileName(TEXT("BlockAll"));
	if (bFlip) { const FBoxSphereBounds Bd = M->GetBounds(); At.Z += Bd.Origin.Z + Bd.BoxExtent.Z; }   // (upside down, resting on its gunwales)
	C->SetWorldLocationAndRotation(At, FRotator(0.f, Yaw, bFlip ? 180.f : 0.f)); C->RegisterComponent();
	return C;
}

void AHotBrookCamps::BeginPlay()
{
	Super::BeginPlay();
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	FString Text; TSharedPtr<FJsonObject> J;
	if (!W || !W->IsLoaded() || !FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("camps"), TEXT("camps_parts.json")))
		|| !FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) || !J.IsValid()) {
		UE_LOG(LogHotBrookCamps, Warning, TEXT("no camps (Import/camps/camps_parts.json: ue/export/build_camps.py, then Scripts/import_camps.py)")); return;
	}
	int32 Missing = 0;
	// the buildings: the floor over the highest corner, at most 2.6 m over the lowest (camps3view's place())
	for (const auto& KV : J->GetObjectField(TEXT("buildings"))->Values) {
		const TSharedPtr<FJsonObject> B = KV.Value->AsObject(); const TArray<TSharedPtr<FJsonValue>>& A = B->GetArrayField(TEXT("anchor"));
		float GMin = 1e9f, GMax = -1e9f;
		for (const TSharedPtr<FJsonValue>& P : B->GetArrayField(TEXT("probes"))) {
			const TArray<TSharedPtr<FJsonValue>>& Q = P->AsArray(); float G = 0;
			if (W->GroundAt(FVector(Q[0]->AsNumber() * 100.0, -Q[1]->AsNumber() * 100.0, 0.0), G)) { GMin = FMath::Min(GMin, G); GMax = FMath::Max(GMax, G); }
		}
		if (GMin > GMax) { Missing++; continue; }
		const float F = FMath::Min(GMax + 30.f, GMin + 260.f);
		if (Stand(FString(KV.Key), FVector(A[0]->AsNumber() * 100.0, -A[1]->AsNumber() * 100.0, F))) NBuild++; else Missing++;
	}
	// the docks: their deck ~0.35 m over the lake two metres out from where they meet the water
	for (const auto& KV : J->GetObjectField(TEXT("docks"))->Values) {
		const TSharedPtr<FJsonObject> D = KV.Value->AsObject(); const TArray<TSharedPtr<FJsonValue>>& A = D->GetArrayField(TEXT("anchor")), &Dir = D->GetArrayField(TEXT("dir"));
		const FVector Mid((A[0]->AsNumber() + Dir[0]->AsNumber() * 2.0) * 100.0, -(A[1]->AsNumber() + Dir[1]->AsNumber() * 2.0) * 100.0, 0.0);
		float S = 0; if (!W->SurfaceAt(Mid, S)) { Missing++; continue; }
		if (UStaticMeshComponent* C = Stand(FString(KV.Key), FVector(A[0]->AsNumber() * 100.0, -A[1]->AsNumber() * 100.0, S + 35.f))) Docks.Add(C); else Missing++;
	}
	// the boats: alongside (afloat), on the dock's deck or on the bank — a canoe turned over, as one is stored
	if (const TArray<TSharedPtr<FJsonValue>>* BA; J->TryGetArrayField(TEXT("boats"), BA))
		for (const TSharedPtr<FJsonValue>& V : *BA) {
			const TSharedPtr<FJsonObject> B = V->AsObject(); const FString Mesh = B->GetStringField(TEXT("mesh")), On = B->GetStringField(TEXT("on"));
			const TArray<TSharedPtr<FJsonValue>>& XY = B->GetArrayField(TEXT("xy")); const double X = XY[0]->AsNumber(), Yy = XY[1]->AsNumber();
			const FVector P0(X * 100.0, -Yy * 100.0, 0.0); float S = 0, G = 0; bool bFlip = false; B->TryGetBoolField(TEXT("flip"), bFlip);
			const bool bFloat = On == TEXT("water");
			float Z;
			if (On == TEXT("bank")) { if (!W->GroundAt(P0, G)) { Missing++; continue; } Z = G; }
			else { if (!W->SurfaceAt(P0, S)) { if (!W->GroundAt(P0, G)) { Missing++; continue; } S = G; } Z = bFloat ? S : S + 35.f; }
			const FString Path = Mesh == TEXT("canoe") ? FString(TEXT("/Game/HotBrook/Models/canoe/SM_canoe.SM_canoe")) : FString();
			const float Yaw = -FMath::RadiansToDegrees(B->GetNumberField(TEXT("yaw")));
			UStaticMeshComponent* C = Stand(Mesh, FVector(P0.X, P0.Y, Z), bFloat, Path, Yaw, bFlip);
			if (!C) { Missing++; continue; }
			Boats.Add(C); BoatAt.Add({ C->GetComponentLocation(), Yaw, FMath::FRand() * 6.28f, bFloat });
		}
	LayRoads();
	UE_LOG(LogHotBrookCamps, Display, TEXT("camps: %d buildings, %d docks, %d boats standing%s"), NBuild, Docks.Num(), Boats.Num(), Missing ? *FString::Printf(TEXT(" (%d not: no mesh or no ground)"), Missing) : TEXT(""));
}

void AHotBrookCamps::Tick(float Dt)
{
	Super::Tick(Dt);
	// the boats afloat ride the water: a slow heave, pitch and roll (each its own phase)
	const double T = GetWorld()->GetTimeSeconds();
	if (DocksIn == 1)
		for (int32 i = 0; i < Boats.Num(); i++) if (BoatAt[i].bFloat) {
			const FBoat& B = BoatAt[i]; const float p = B.Phase;
			Boats[i]->SetWorldLocationAndRotation(B.At + FVector(0, 0, 1.6f * FMath::Sin(T * 1.05 + p)), FRotator(0.7f * FMath::Sin(T * 0.83 + p * 1.3), B.Yaw, 1.4f * FMath::Sin(T * 0.97 + p * 0.7)));
		}
	if (T < SeasonAt) return;
	SeasonAt = T + 1.0;   // (the season: once a second)
	float Yf = 0.3f; for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Yf = It->YearFrac; break; }
	const int32 Force = CVarDocksIn.GetValueOnGameThread(), In = Force >= 0 ? (Force ? 1 : 0) : (Yf >= DOCK_IN && Yf < DOCK_OUT ? 1 : 0);
	if (In == DocksIn) return;
	DocksIn = In;
	for (UStaticMeshComponent* C : Docks) { C->SetVisibility(In == 1); C->SetCollisionEnabled(In ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision); }
	for (UStaticMeshComponent* C : Boats) { C->SetVisibility(In == 1); C->SetCollisionEnabled(In ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision); }
}

void AHotBrookCamps::LayRoads()
{
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	FString Text; TSharedPtr<FJsonObject> J;
	if (!FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("camps.json"))) || !FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) || !J.IsValid()) return;
	Roads = NewObject<UProceduralMeshComponent>(this); Roads->SetupAttachment(RootComponent); Roads->SetMobility(EComponentMobility::Static);
	Roads->SetCastShadow(false); Roads->bAffectDistanceFieldLighting = false; Roads->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Roads->RegisterComponent();
	UMaterialInterface* Mat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Camps/Materials/MI_HB_Road.MI_HB_Road"));
	int32 NSec = 0; double Km = 0;
	for (const TSharedPtr<FJsonValue>& RV : J->GetArrayField(TEXT("roads"))) {
		const TSharedPtr<FJsonObject> R = RV->AsObject(); const FString Kind = R->GetStringField(TEXT("kind"));
		const bool bCrown = R->GetBoolField(TEXT("crown")), bPaved = Kind == TEXT("paved");
		const double Wd = R->GetNumberField(TEXT("width"));
		// the cross-section (m from the middle) and each line's tint: the verges, the wheel tracks, the crown
		TArray<double> Off; TArray<FLinearColor> Tint;
		const FLinearColor Track = bPaved ? FLinearColor(0.32f, 0.32f, 0.34f) : FLinearColor(0.95f, 0.93f, 0.9f), Crown(0.62f, 0.78f, 0.45f), Verge(0.8f, 0.85f, 0.7f);
		if (bCrown) { Off = { -Wd / 2 - 0.3, -Wd / 2, -0.55, -0.2, 0.2, 0.55, Wd / 2, Wd / 2 + 0.3 }; Tint = { Verge, Track, Track, Crown, Crown, Track, Track, Verge }; }
		else { Off = { -Wd / 2 - 0.3, -Wd / 2, 0.0, Wd / 2, Wd / 2 + 0.3 }; Tint = { Verge, Track, Track, Track, Verge }; }
		const int32 NA = Off.Num();
		// the line resampled every 2 m, its way smoothed through the corners
		TArray<FVector2D> P; for (const TSharedPtr<FJsonValue>& Q : R->GetArrayField(TEXT("pts"))) { const TArray<TSharedPtr<FJsonValue>>& A = Q->AsArray(); P.Add(FVector2D(A[0]->AsNumber(), A[1]->AsNumber())); }
		TArray<FVector2D> S;
		for (int32 k = 1; k < P.Num(); k++) { const double L = FVector2D::Distance(P[k - 1], P[k]); const int32 n = FMath::Max(1, FMath::CeilToInt(L / 2.0)); for (int32 j = 0; j < n; j++) S.Add(FMath::Lerp(P[k - 1], P[k], (double)j / n)); }
		if (P.Num()) S.Add(P.Last());
		TArray<FVector> V; TArray<int32> I; TArray<FVector> N; TArray<FVector2D> UV; TArray<FLinearColor> C; TArray<FProcMeshTangent> T;
		auto Flush = [&]() { if (I.Num()) { Roads->CreateMeshSection_LinearColor(NSec, V, I, N, UV, C, T, false); if (Mat) Roads->SetMaterial(NSec, Mat); NSec++; } V.Reset(); I.Reset(); N.Reset(); UV.Reset(); C.Reset(); T.Reset(); };
		double Along = 0; bool bPrev = false;
		for (int32 k = 0; k < S.Num(); k++) {
			const FVector2D D = (S[FMath::Min(k + 1, S.Num() - 1)] - S[FMath::Max(k - 1, 0)]).GetSafeNormal(), Sd(-D.Y, D.X);
			if (k) Along += FVector2D::Distance(S[k - 1], S[k]);
			// (broken where the water is: a road's crossing of the brook, a line drawn past the shore)
			float Wz; if (W->SurfaceAt(HotBrookCoords::ToUE(S[k].X, S[k].Y, HotBrookCoords::Datum), Wz)) { if (bPrev) Flush(); bPrev = false; continue; }
			const int32 b = V.Num();
			// (the ground's slope there: the strip lit as the ground under it is)
			float Gx0 = 0, Gx1 = 0, Gy0 = 0, Gy1 = 0;
			W->GroundAt(HotBrookCoords::ToUE(S[k].X - 1.0, S[k].Y, HotBrookCoords::Datum), Gx0); W->GroundAt(HotBrookCoords::ToUE(S[k].X + 1.0, S[k].Y, HotBrookCoords::Datum), Gx1);
			W->GroundAt(HotBrookCoords::ToUE(S[k].X, S[k].Y - 1.0, HotBrookCoords::Datum), Gy0); W->GroundAt(HotBrookCoords::ToUE(S[k].X, S[k].Y + 1.0, HotBrookCoords::Datum), Gy1);
			const FVector Up = FVector(-(Gx1 - Gx0) / 200.0, (Gy1 - Gy0) / 200.0, 1.0).GetSafeNormal();
			for (int32 a = 0; a < NA; a++) {
				const FVector2D Q = S[k] + Sd * Off[a]; float G = 0; W->GroundAt(HotBrookCoords::ToUE(Q.X, Q.Y, HotBrookCoords::Datum), G);
				const bool bEdge = a == 0 || a == NA - 1;
				V.Add(FVector(Q.X * 100.0, -Q.Y * 100.0, G + (bEdge ? 1.f : 6.f))); UV.Add(FVector2D(Off[a], Along)); C.Add(Tint[a]);
				N.Add(Up); T.Add(FProcMeshTangent(FVector(D.X, -D.Y, 0.0), false));
			}
			if (bPrev) for (int32 a = 0; a + 1 < NA; a++) { const int32 p0 = b - NA + a, p1 = p0 + 1, q0 = b + a, q1 = q0 + 1; I.Append({ p0, q0, p1, p1, q0, q1 }); }
			bPrev = true;
		}
		Flush(); Km += Along / 1000.0;
	}
	UE_LOG(LogHotBrookCamps, Display, TEXT("roads: %d strips, %.1f km"), NSec, Km);
}
