#include "HotBrookBoat.h"
#include "HotBrookWater.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookBoat, Log, All);

AHotBrookBoat::AHotBrookBoat()
{
	PrimaryActorTick.bCanEverTick = true;
	Hull = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Hull")); RootComponent = Hull;
	Hull->SetMobility(EComponentMobility::Movable); Hull->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AHotBrookBoat::BeginPlay()
{
	Super::BeginPlay();
	if (UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HotBrook/Models/canoe/SM_canoe.SM_canoe"))) Hull->SetStaticMesh(M);
	else UE_LOG(LogHotBrookBoat, Warning, TEXT("no canoe model (Scripts/import_models.py): no boat"));
}

float AHotBrookBoat::DepthAt(const FVector& P, float* OutSurf) const
{
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>(); float S = 0, G = 0;
	if (!W || !W->SurfaceAt(P, S) || !W->GroundAt(P, G) || !W->InLake(P)) return -1.f;   // (on the lakes, within their drawn water)
	if (OutSurf) *OutSurf = S;
	return (S - G) / 100.f;
}

bool AHotBrookBoat::Place()
{
	// drawn up in the shallows (35–80 cm) nearest where the walker is, lying along the shore (across the way the bed deepens)
	const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const APawn* Pw = PC ? PC->GetPawn() : nullptr;
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	if (!Pw || !W || !W->IsLoaded() || !Hull->GetStaticMesh()) return false;
	const FVector C = Pw->GetActorLocation();
	for (float R = 0.f; R < 40000.f; R += 200.f)
		for (int32 k = 0, n = FMath::Max(1, (int32)(R / 150.f)); k < n; k++) {
			const float A = 2.f * PI * k / n; const FVector P = C + FVector(FMath::Cos(A), FMath::Sin(A), 0) * R; float S = 0;
			const float D = DepthAt(P, &S); if (D < 0.35f || D > 0.8f) continue;
			const float Gx = DepthAt(P + FVector(300, 0, 0)) - DepthAt(P - FVector(300, 0, 0)), Gy = DepthAt(P + FVector(0, 300, 0)) - DepthAt(P - FVector(0, 300, 0));
			YawDeg = FMath::RadiansToDegrees(FMath::Atan2(Gy, Gx)) + 90.f;
			const FVector Ends = FRotator(0, YawDeg, 0).Vector() * 220.f;
			if (DepthAt(P + Ends) < 0.15f || DepthAt(P - Ends) < 0.15f) continue;   // (its whole length afloat)
			SetActorLocationAndRotation(FVector(P.X, P.Y, S - 7.f), FRotator(0, YawDeg, 0));
			UE_LOG(LogHotBrookBoat, Display, TEXT("the canoe is in %.2f m of water, %.0f m from the walker"), D, R / 100.f);
			return true;
		}
	return false;
}

FVector AHotBrookBoat::SeatLocation() const
{
	return GetActorTransform().TransformPosition(FVector(-170.f, 0.f, 32.f));   // (the stern seat of a 5-m canoe)
}

bool AHotBrookBoat::LandingSpot(float Within, FVector& Out) const
{
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>(); if (!W) return false;
	const FVector C = GetActorLocation();
	for (float R = 150.f; R <= Within; R += 50.f)
		for (int32 k = 0; k < 24; k++) {
			const float A = 2.f * PI * k / 24.f; const FVector P = C + FVector(FMath::Cos(A), FMath::Sin(A), 0) * R; float S = 0, G = 0;
			if (!W->GroundAt(P, G)) continue;
			const bool bWet = W->SurfaceAt(P, S) && S > G;
			if (!bWet || (S - G) < 30.f) { Out = FVector(P.X, P.Y, G + 95.f); return true; }   // (dry ground, or water no deeper than a shin)
		}
	return false;
}

void AHotBrookBoat::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!bPlaced) { bPlaced = Place(); if (!bPlaced) return; }
	T += Dt;
	if (AutoFwd != 0.f || AutoTurn != 0.f) { InFwd = AutoFwd; InTurn = AutoTurn; }
	const FVector2D Fw(FMath::Cos(FMath::DegreesToRadians(YawDeg)), FMath::Sin(FMath::DegreesToRadians(YawDeg))), Sd(-Fw.Y, Fw.X);
	// the strokes (cm/s²): ~1.5 m/s at a steady pace against the water's drag, ~2 m/s stroking hard
	const float Thrust = bOccupied ? FMath::Clamp(InFwd, -1.f, 1.f) * (bInHard ? 144.f : 90.f) * (InFwd < 0.f ? 0.6f : 1.f) : 0.f;
	float vF = FVector2D::DotProduct(Vel, Fw) + Thrust * Dt, vS = FVector2D::DotProduct(Vel, Sd);
	vF -= (0.25f * vF + 0.0025f * vF * FMath::Abs(vF)) * Dt;   // (the hull's drag: skin friction and wave making)
	vS -= vS * FMath::Min(1.f, 3.f * Dt);                       // (the keel: a sideways slide dies within a second)
	Vel = Fw * vF + Sd * vS;
	// the wind's drift (~2 % of its speed: a canoe's windage), downwind — the sim's wind blows from WindFrom (clockwise from north;
	// UE X east, Y south)
	const float Down = WindFrom + PI; Vel += FVector2D(FMath::Sin(Down), -FMath::Cos(Down)) * (WindSpeed * 2.f - FVector2D::DotProduct(Vel, FVector2D(FMath::Sin(Down), -FMath::Cos(Down)))) * FMath::Min(1.f, 0.05f * Dt);
	// the turn: a sweep stroke (~25°/s, ~35° hard), easing in and out
	YawRate = FMath::Lerp(YawRate, bOccupied ? FMath::Clamp(InTurn, -1.f, 1.f) * (bInHard ? 35.f : 25.f) : 0.f, FMath::Min(1.f, 2.f * Dt));
	YawDeg += YawRate * Dt;
	// moving, unless it would run aground: its middle shallower than its draft and a little, or its bow or stern (2.2 m out, where the
	// hull rises) on the bank
	FVector P = GetActorLocation() + FVector(Vel.X, Vel.Y, 0) * Dt; float S = 0;
	const FVector Ends = FVector(Fw.X, Fw.Y, 0) * 220.f;
	if (DepthAt(P, &S) < 0.18f || DepthAt(P + Ends) < 0.08f || DepthAt(P - Ends) < 0.08f) { Vel = FVector2D::ZeroVector; P = GetActorLocation(); DepthAt(P, &S); }
	// afloat: ~12 cm deep loaded, ~7 empty; a slow bob and rock, a little roll with each stroke
	const float Draft = bOccupied ? 12.f : 7.f, Stroke = bOccupied && FMath::Abs(InFwd) > 0.1f ? 1.5f * FMath::Sin(T * 2.0 * PI * 0.55) : 0.f;
	P.Z = S - Draft + 1.2f * FMath::Sin(T * 1.1);
	SetActorLocationAndRotation(P, FRotator(0.6f * FMath::Sin(T * 0.7), YawDeg, 1.0f * FMath::Sin(T * 0.9 + 1.0) + Stroke));
	InFwd = InTurn = 0.f;
}
