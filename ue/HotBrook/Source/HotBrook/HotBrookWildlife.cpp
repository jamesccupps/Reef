#include "HotBrookWildlife.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookWildlife, Log, All);

AHotBrookWildlife::AHotBrookWildlife()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookWildlife::BeginPlay()
{
	Super::BeginPlay();
	// the lakes (Import/lakes.json: each one's shoreline, the sim's metres, and its level)
	FString Text; TSharedPtr<FJsonObject> J;
	if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("lakes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid()) {
		for (const TSharedPtr<FJsonValue>& V : J->GetArrayField(TEXT("lakes"))) {
			const TSharedPtr<FJsonObject> O = V->AsObject(); FLake L; L.Level = (float)O->GetNumberField(TEXT("level")); L.Box.Init();
			for (const TSharedPtr<FJsonValue>& Q : O->GetArrayField(TEXT("pts"))) { const TArray<TSharedPtr<FJsonValue>>& XY = Q->AsArray(); const FVector2D P(XY[0]->AsNumber(), XY[1]->AsNumber()); L.Pts.Add(P); L.Box += P; }
			for (int32 i = 0; i < L.Pts.Num(); i++) { const FVector2D& a = L.Pts[i], & b = L.Pts[(i + 1) % L.Pts.Num()]; L.Area += 0.5 * (a.X * b.Y - b.X * a.Y); L.Shore += FVector2D::Distance(a, b); }
			L.Area = FMath::Abs(L.Area); if (L.Pts.Num() > 2) Lakes.Add(L);
		}
	}
	for (const auto& [K, Name] : { TPair<int32, const TCHAR*>(Loon, TEXT("common_loon")), TPair<int32, const TCHAR*>(Heron, TEXT("great_blue_heron")), TPair<int32, const TCHAR*>(Eagle, TEXT("bald_eagle")) })
		if (UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HotBrook/Models/%s/SM_%s.SM_%s"), Name, Name, Name))) Mesh.Add(K, M);
	UE_LOG(LogHotBrookWildlife, Display, TEXT("wildlife: %d lakes, %d bird models"), Lakes.Num(), Mesh.Num());
}

bool AHotBrookWildlife::InLake(const FLake& L, const FVector2D& P) const
{
	if (!L.Box.IsInside(P)) return false;
	bool bIn = false;
	for (int32 i = 0, j = L.Pts.Num() - 1; i < L.Pts.Num(); j = i++) {
		const FVector2D& a = L.Pts[i], & b = L.Pts[j];
		if ((a.Y > P.Y) != (b.Y > P.Y) && P.X < (b.X - a.X) * (P.Y - a.Y) / (b.Y - a.Y) + a.X) bIn = !bIn;
	}
	return bIn;
}

float AHotBrookWildlife::Depth(const FVector2D& P, float* OutSurf, float* OutGround) const
{
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>(); float S = 0, G = 0;
	const FVector Q = HotBrookCoords::ToUE(P.X, P.Y, HotBrookCoords::Datum);
	if (!W || !W->SurfaceAt(Q, S) || !W->GroundAt(Q, G)) return -1.f;
	if (OutSurf) *OutSurf = S; if (OutGround) *OutGround = G;
	return (S - G) / 100.f;
}

bool AHotBrookWildlife::Fits(int32 Kind, const FVector2D& P) const
{
	const float D = Depth(P);
	return Kind == Loon ? D >= 1.5f : Kind == Heron ? D >= 0.05f && D <= 0.35f : D > 0.f;   // (a loon in open water; a heron wading to its knees)
}

bool AHotBrookWildlife::Pick(int32 Kind, int32 Lake, FVector2D& Out, const FVector2D* Near, float Within) const
{
	if (!Lakes.IsValidIndex(Lake)) return false;
	const FLake& L = Lakes[Lake];
	for (int32 t = 0; t < 400; t++) {
		const FVector2D Q = Near ? *Near + FVector2D(FMath::FRandRange(-1.f, 1.f), FMath::FRandRange(-1.f, 1.f)) * Within
			: FVector2D(FMath::FRandRange(L.Box.Min.X, L.Box.Max.X), FMath::FRandRange(L.Box.Min.Y, L.Box.Max.Y));
		if (InLake(L, Q) && Fits(Kind, Q)) { Out = Q; return true; }
	}
	return false;
}

void AHotBrookWildlife::Update(const float* Counts, const float* Act, int32 NKinds, const float* Taken, int32 NTaken, float YearFrac)
{
	for (int32 k = 0; k < FMath::Min(NKinds, 16); k++) { N[k] = Counts[k]; ActNow[k] = Act[k]; }
	YearNow = YearFrac;
	for (int32 i = 0; i < NTaken; i++) { const float* r = Taken + i * 6; const int32 K = (int32)r[3]; if (K == Loon || K == Heron || K == Eagle) this->Taken(K, FVector2D(r[0], r[1])); }
}

void AHotBrookWildlife::Census()
{
	// each lake's share of each kind (by area; the herons by shore), a fraction present on that share of days (the day's hash)
	const int32 Day = FMath::FloorToInt(YearNow * 365.f);
	double A = 0, Sh = 0; for (const FLake& L : Lakes) { A += L.Area; Sh += L.Shore; }
	for (const int32 K : { (int32)Loon, (int32)Heron, (int32)Eagle }) {
		if (!Mesh.Contains(K)) continue;
		for (int32 l = 0; l < Lakes.Num(); l++) {
			const double Want = N[K] * (K == Heron ? Lakes[l].Shore / FMath::Max(1.0, Sh) : Lakes[l].Area / FMath::Max(1.0, A));
			const uint32 H = HashCombine(HashCombine(GetTypeHash(Day), GetTypeHash(K)), GetTypeHash(l));
			const int32 W = FMath::FloorToInt(Want) + ((H % 10000) / 10000.0 < Want - FMath::FloorToDouble(Want) ? 1 : 0);
			int32 Have = 0; for (const FBird& B : Birds) Have += B.Kind == K && B.Lake == l;
			for (; Have < W; Have++) Spawn(K, l);
			for (int32 i = Birds.Num() - 1; i >= 0 && Have > W; i--) if (Birds[i].Kind == K && Birds[i].Lake == l) { Birds[i].C->DestroyComponent(); Birds.RemoveAt(i); Have--; }
		}
	}
}

void AHotBrookWildlife::Spawn(int32 Kind, int32 Lake)
{
	FVector2D P; if (!Pick(Kind, Lake, P)) return;
	const double Now = GetWorld()->GetTimeSeconds();
	FBird B; B.Kind = Kind; B.Lake = Lake; B.P = B.Goal = B.Centre = B.From = P; B.Heading = FMath::FRandRange(0.f, 2.f * PI);
	if (Kind == Loon) B.Until = Now + FMath::FRandRange(20.f, 90.f);
	else if (Kind == Heron) B.Until = Now + FMath::FRandRange(20.f, 120.f);
	else { B.Radius = FMath::FRandRange(60.f, 140.f); B.Ang = FMath::FRandRange(0.f, 2.f * PI); B.Alt = FMath::FRandRange(40.f, 90.f); B.Until = Now + FMath::FRandRange(40.f, 90.f); }
	UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
	C->SetStaticMesh(Mesh[Kind]); C->SetMobility(EComponentMobility::Movable); C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	C->SetupAttachment(RootComponent); C->RegisterComponent(); B.C = C;
	Birds.Add(B);
}

void AHotBrookWildlife::Taken(int32 Kind, const FVector2D& P)
{
	// the nearest of that kind (the sim's taker on that water) goes after it: a loon dives and comes up where the fish was; an eagle
	// stoops to it; a heron steps toward it
	const double Now = GetWorld()->GetTimeSeconds(); FBird* Best = nullptr; double BestD = Kind == Heron ? 80.0 : 500.0;
	for (FBird& B : Birds) if (B.Kind == Kind) { const double D = FVector2D::Distance(B.P, P); if (D < BestD) { BestD = D; Best = &B; } }
	if (!Best) return;
	FBird& B = *Best;
	if (Kind == Loon && B.State == 0) { B.State = 1; B.From = B.P; B.Goal = P; B.T0 = Now; B.Until = Now + FMath::Clamp(BestD / 1.2, 12.0, 60.0); }
	else if (Kind == Eagle && B.State == 0) { B.State = 1; B.From = B.P; B.Goal = P; B.T0 = Now; B.Hover = B.Alt; }
	else if (Kind == Heron) { FVector2D G; if (Pick(Heron, B.Lake, G, &P, 3.f)) { B.Goal = G; B.State = 1; } }
}

void AHotBrookWildlife::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!Lakes.Num()) return;
	const double Now = GetWorld()->GetTimeSeconds();
	if (Now - CensusAt > 1.0) { CensusAt = Now; Census(); }
	const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const APawn* Pw = PC ? PC->GetPawn() : nullptr;
	const FVector2D Me = Pw ? HotBrookCoords::ToSim(Pw->GetActorLocation()) : FVector2D::ZeroVector;
	for (FBird& B : Birds) {
		const FLake& L = Lakes[B.Lake]; const float Surf = HotBrookCoords::HeightToUE(L.Level), Act = ActNow[B.Kind];
		bool bShow = true; float Z = Surf, Pitch = 0, Roll = 0;
		if (B.Kind == Loon) {
			if (B.State == 0) {   // (afloat: paddling about, or still on the water at night; down for a fish every minute or two)
				const float V = Act < 0.1f ? 0.03f : 0.25f;
				B.Heading += FMath::FRandRange(-0.4f, 0.4f) * Dt;
				const FVector2D Q = B.P + FVector2D(FMath::Cos(B.Heading), FMath::Sin(B.Heading)) * V * Dt;
				if (InLake(L, Q) && Fits(Loon, Q)) B.P = Q; else B.Heading += PI * FMath::FRandRange(0.5f, 1.5f);
				if (Act >= 0.1f && Now > B.Until) { FVector2D G; B.State = 1; B.From = B.P; B.Goal = Pick(Loon, B.Lake, G, &B.P, 40.f) ? G : B.P; B.T0 = Now; B.Until = Now + FMath::FRandRange(25.f, 55.f); }
				Z = Surf - 12.f + 1.5f * FMath::Sin(Now * 1.3 + B.Radius);   // (riding low, as loons do)
			} else {   // (under: swimming to where it comes up)
				const float S = (float)FMath::Clamp((Now - B.T0) / FMath::Max(1.0, B.Until - B.T0), 0.0, 1.0);
				B.P = FMath::Lerp(B.From, B.Goal, S); bShow = false;
				if (S >= 1.f) { B.State = 0; B.Until = Now + FMath::FRandRange(40.f, 120.f); const FVector2D Dv = B.Goal - B.From; if (!Dv.IsNearlyZero()) B.Heading = FMath::Atan2(Dv.Y, Dv.X); }
			}
		} else if (B.Kind == Heron) {   // (standing still in the shallows, a slow step or two to the next spot; at night, still)
			if (B.State == 0 && Act > 0.2f && Now > B.Until) { FVector2D G; if (Pick(Heron, B.Lake, G, &B.P, 15.f)) { B.Goal = G; B.State = 1; } else B.Until = Now + 30.0; }
			if (B.State == 1) {
				const FVector2D Dv = B.Goal - B.P; const double D = Dv.Size();
				if (D < 0.2) { B.State = 0; B.Until = Now + FMath::FRandRange(20.f, 150.f); }
				else { B.Heading = FMath::Atan2(Dv.Y, Dv.X); B.P += Dv / D * FMath::Min(D, 0.15 * Dt); }
			}
			float S = 0, G = 0; if (Depth(B.P, &S, &G) >= 0.f) Z = G;
		} else {   // the eagles: circling high by day; stooping to the water for a fish; in the woods at night
			if (Act < 0.1f) bShow = false;
			if (B.State == 0) {
				if (Now > B.Until) { FVector2D G; if (Pick(Eagle, B.Lake, G)) B.Goal = G; B.Until = Now + FMath::FRandRange(40.f, 90.f); }
				B.Centre = FMath::Lerp(B.Centre, B.Goal, FMath::Min(1.f, 0.02f * Dt));   // (the circle drifts over the lake)
				B.Ang += 9.f / B.Radius * Dt; B.P = B.Centre + FVector2D(FMath::Cos(B.Ang), FMath::Sin(B.Ang)) * B.Radius; B.Heading = B.Ang + PI / 2;
				Z = Surf + B.Alt * 100.f; Roll = -25.f;
			} else if (B.State == 1) {   // (the stoop: 5 s down to the fish)
				const float S = (float)FMath::Clamp((Now - B.T0) / 5.0, 0.0, 1.0); const FVector2D Dv = B.Goal - B.From;
				B.P = FMath::Lerp(B.From, B.Goal, S); if (!Dv.IsNearlyZero()) B.Heading = FMath::Atan2(Dv.Y, Dv.X);
				Z = Surf + FMath::Lerp(B.Hover * 100.f, 60.f, S * S); Pitch = -30.f * (1.f - S);
				if (S >= 1.f) { B.State = 2; B.T0 = Now; B.Centre = B.Goal; B.Ang = B.Heading - PI / 2; }
			} else {   // (and up again, circling out from where it took it)
				const float S = (float)FMath::Clamp((Now - B.T0) / 10.0, 0.0, 1.0), R = FMath::Lerp(8.f, B.Radius, S);
				B.Ang += 9.f / R * Dt; B.P = B.Centre + FVector2D(FMath::Cos(B.Ang), FMath::Sin(B.Ang)) * R; B.Heading = B.Ang + PI / 2;
				Z = Surf + FMath::Lerp(60.f, B.Hover * 100.f, S); Pitch = 15.f * (1.f - S); Roll = -25.f;
				if (S >= 1.f) { B.State = 0; B.Goal = B.Centre; }
			}
		}
		bShow = bShow && FVector2D::Distance(B.P, Me) < DrawRadius;
		B.C->SetVisibility(bShow);
		if (bShow) B.C->SetWorldLocationAndRotation(FVector(B.P.X * 100.0, -B.P.Y * 100.0, Z), FRotator(Pitch, -FMath::RadiansToDegrees(B.Heading), Roll));
	}
}

bool AHotBrookWildlife::Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw) const
{
	double Best = 1e18;
	for (const FBird& B : Birds) {
		if (B.Kind != Kind || !B.C || !B.C->IsVisible()) continue;
		const double D = FVector2D::DistSquared(B.P, From); if (D >= Best) continue;
		Best = D; OutP = B.C->GetComponentLocation(); OutYaw = B.C->GetComponentRotation().Yaw;
	}
	return Best < 1e18;
}
