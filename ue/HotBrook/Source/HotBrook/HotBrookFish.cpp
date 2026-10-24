#include "HotBrookFish.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookFish, Log, All);

// the model each species is drawn as, in src/w3/species3.js's order (redbreast as the pumpkinseed, fallfish and alewife as the dace)
static const TCHAR* MODEL[] = { TEXT("pumpkinseed"), TEXT("yellow_perch"), TEXT("white_sucker"), TEXT("brown_bullhead"), TEXT("white_perch"),
	TEXT("smallmouth_bass"), TEXT("chain_pickerel"), TEXT("pumpkinseed"), TEXT("blacknose_dace"), TEXT("banded_killifish"), TEXT("blacknose_dace"),
	TEXT("blacknose_dace") };
static constexpr int32 NSPECIES = UE_ARRAY_COUNT(MODEL);

static float AlphaOf(double T0, double T1, double Now) { return (float)FMath::Clamp((Now - T0) / FMath::Max(0.001, T1 - T0), 0.0, 1.0); }

AHotBrookFish::AHotBrookFish()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookFish::BeginPlay()
{
	Super::BeginPlay();
	TArray<FString> Missing;
	for (int32 s = 0; s < NSPECIES; s++) {
		UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HotBrook/Models/%s/SM_%s.SM_%s"), MODEL[s], MODEL[s], MODEL[s]));
		if (!M) { Missing.AddUnique(MODEL[s]); M = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere")); }
		UInstancedStaticMeshComponent* I = NewObject<UInstancedStaticMeshComponent>(this);
		I->SetStaticMesh(M); I->SetMobility(EComponentMobility::Movable); I->SetCollisionEnabled(ECollisionEnabled::NoCollision);
		I->SetCastShadow(true);   // (a fish's shadow on the sunlit bed, as the browser draws it)
		I->bAffectDistanceFieldLighting = false; I->bAffectDynamicIndirectLighting = false;   // (too small and quick for Lumen's scene)
		I->SetupAttachment(RootComponent); I->RegisterComponent(); I->SetNumCustomDataFloats(2); BySpecies.Add(I);
	}
	X.SetNum(NSPECIES); C.SetNum(NSPECIES);
	if (Missing.Num()) UE_LOG(LogHotBrookFish, Warning, TEXT("no model for %s (Scripts/import_models.py): drawn as spheres"), *FString::Join(Missing, TEXT(", ")));
}

void AHotBrookFish::Update(const uint8* B, int32 N, float Night)
{
	const double Now = GetWorld()->GetTimeSeconds();
	SnapDt = FMath::Clamp(Now - LastSnap, 0.02, 0.5); LastSnap = Now; NightNow = Night;
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>(); if (!W) return;
	for (auto& KV : Views) KV.Value.bSeen = false;
	for (int32 i = 0; i < N; i++) {
		const uint8* r = B + i * Stride;
		const auto F = [r](int32 k) { float v; FMemory::Memcpy(&v, r + k * 4, 4); return v; };
		uint32 Id; FMemory::Memcpy(&Id, r + 9 * 4, 4);
		float S = 0; FVector P = HotBrookCoords::ToUE(F(0), F(1), HotBrookCoords::Datum);
		if (!W->SurfaceAt(P, S)) continue;
		P.Z = S - F(2) * 100.f;
		// (the sim's yaw from east counter-clockwise; UE's Y is south, so its yaw turns the other way; pitch nose up in both)
		const float Yaw = -FMath::RadiansToDegrees(F(3)), Pitch = FMath::RadiansToDegrees(F(4));
		FView* V = Views.Find(Id);
		if (!V) { V = &Views.Add(Id); V->From = V->To = P; V->YawFrom = V->YawTo = Yaw; V->PitchFrom = V->PitchTo = Pitch; V->Phase = FMath::FRand() * 2.f * PI; }
		else {
			const float A = AlphaOf(V->T0, V->T1, Now);
			V->From = FMath::Lerp(V->From, V->To, A); V->YawFrom += FMath::FindDeltaAngleDegrees(V->YawFrom, V->YawTo) * A; V->PitchFrom = FMath::Lerp(V->PitchFrom, V->PitchTo, A);
			V->To = P; V->YawTo = Yaw; V->PitchTo = Pitch;
			if (FVector::DistSquared(V->From, V->To) > FMath::Square(500.f)) { V->From = V->To; V->YawFrom = Yaw; V->PitchFrom = Pitch; }   // (handed between the sim's shards: not swum)
		}
		V->T0 = Now; V->T1 = Now + SnapDt; V->bSeen = true; V->SurfZ = S;
		V->Lcm = FMath::Max(1.f, F(5)); V->Sp = FMath::Clamp((int32)F(6), 0, NSPECIES - 1); V->N = FMath::Max(1, FMath::RoundToInt(F(7)));
		V->Speed = FMath::Max(0.f, F(8)); V->bSchool = F(10) > 0.5f; V->BodyMul = FMath::Clamp(F(11), 0.6f, 1.6f);
	}
	TArray<uint32> Gone; for (const auto& KV : Views) if (!KV.Value.bSeen) Gone.Add(KV.Key);
	for (uint32 Id : Gone) Views.Remove(Id);
}

void AHotBrookFish::Tick(float Dt)
{
	Super::Tick(Dt);
	const double Now = GetWorld()->GetTimeSeconds();
	for (int32 s = 0; s < NSPECIES; s++) { X[s].Reset(); C[s].Reset(); }
	for (auto& KV : Views) {
		FView& V = KV.Value;
		const float A = AlphaOf(V.T0, V.T1, Now);
		const FVector P = FMath::Lerp(V.From, V.To, A);
		const float Yaw = V.YawFrom + FMath::FindDeltaAngleDegrees(V.YawFrom, V.YawTo) * A, Pitch = FMath::Lerp(V.PitchFrom, V.PitchTo, A);
		// the tail: the browser's beat for the fish's speed in body lengths a second (fish3view: 6–24 rad/s), its sweep fuller as it
		// speeds up (a fish holding station sculls; one cruising beats its whole tail)
		const float L = V.Lcm / 100.f, Bl = V.Speed / FMath::Max(0.01f, L);
		V.Phase = FMath::Fmod(V.Phase + (6.f + 18.f * FMath::Min(1.f, Bl / 4.f)) * Dt, 2.f * PI);
		const float Strength = 0.45f + 0.55f * FMath::Min(1.f, Bl / 1.5f);
		const FVector Scale(L, L * FMath::Sqrt(V.BodyMul), L * V.BodyMul);   // (the 1-m model: its length in metres; deeper when fat)
		const int32 M = V.bSchool && V.N > 1 ? FMath::Min(MembersMax, V.N) : 1;
		if (M == 1) { X[V.Sp].Add(FTransform(FRotator(Pitch, Yaw, 0.f), P, Scale)); C[V.Sp].Add(V.Phase); C[V.Sp].Add(Strength); continue; }
		// a school: its members in a flattened cloud about its place (each its own spot from the school's id and its number, drifting
		// slowly), heading about as the school does, a little out of step and of size
		const float R = (3.f + 5.f * NightNow) * L * FMath::Pow((float)M, 1.f / 3.f) * 0.55f * 100.f;
		const FRotator Head(0.f, Yaw, 0.f);
		for (int32 j = 0; j < M; j++) {
			FRandomStream H((int32)(KV.Key * 131u + j * 7919u));
			const float Ph = H.FRandRange(0.f, 2.f * PI), Dr = (float)Now * H.FRandRange(0.15f, 0.35f) + Ph;
			const FVector O(H.FRandRange(-1.f, 1.f) + 0.15f * FMath::Sin(Dr), H.FRandRange(-1.f, 1.f) + 0.15f * FMath::Cos(Dr * 1.3f), H.FRandRange(-0.35f, 0.35f));
			FVector Q = P + Head.RotateVector(O * R);
			Q.Z = FMath::Min(Q.Z, V.SurfZ - 30.f * L);   // (under the surface)
			X[V.Sp].Add(FTransform(FRotator(Pitch, Yaw + H.FRandRange(-12.f, 12.f), 0.f), Q, Scale * H.FRandRange(0.85f, 1.15f)));
			C[V.Sp].Add(V.Phase + Ph); C[V.Sp].Add(Strength);
		}
	}
	for (int32 s = 0; s < NSPECIES; s++) {
		UInstancedStaticMeshComponent* I = BySpecies[s]; const int32 N = X[s].Num();
		if (I->GetInstanceCount() != N) { I->ClearInstances(); if (N) I->AddInstances(X[s], false, true); }
		else if (N) I->BatchUpdateInstancesTransforms(0, X[s], true, false, true);
		// (the instances' own updates refresh them on the GPU; rebuilding the whole component each frame made Lumen recapture it)
		for (int32 k = 0; k < N; k++) I->SetCustomData(k, TArrayView<const float>(&C[s][k * 2], 2), false);
	}
}

bool AHotBrookFish::Nearest(const FVector& From, FVector& OutP, FRotator& OutR, float& OutL) const
{
	const double Now = GetWorld()->GetTimeSeconds(); double Best = 1e18;
	for (const auto& KV : Views) {
		const FView& V = KV.Value; const float A = AlphaOf(V.T0, V.T1, Now); const FVector P = FMath::Lerp(V.From, V.To, A);
		const double D = FVector::DistSquared(P, From); if (D >= Best) continue;
		Best = D; OutP = P; OutL = V.Lcm / 100.f;
		OutR = FRotator(FMath::Lerp(V.PitchFrom, V.PitchTo, A), V.YawFrom + FMath::FindDeltaAngleDegrees(V.YawFrom, V.YawTo) * A, 0.f);
	}
	return Best < 1e18;
}
