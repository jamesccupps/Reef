#include "HotBrookAnimals.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "Components/SkeletalMeshComponent.h"
#include "Animation/AnimSequence.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookAnimals, Log, All);

AHotBrookAnimals::AHotBrookAnimals()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

static UAnimSequence* Anim(const TCHAR* Name)
{
	return LoadObject<UAnimSequence>(nullptr, *FString::Printf(TEXT("/Game/AnimalVarietyPack/DeerStagAndDoe/Animations/%s.%s"), Name, Name));
}

// (a gait's ground speed, cm/s: its root-motion twin's travel over a cycle — the in-place clip played at speed / this)
static float GaitSpeed(const TCHAR* RootMotionName, float Fallback)
{
	UAnimSequence* S = Anim(RootMotionName); if (!S) return Fallback;
	const float L = S->GetPlayLength(); if (L <= 0.f) return Fallback;
	const float D = S->ExtractRootMotionFromRange(0.0, L, FAnimExtractContext()).GetTranslation().Size2D();
	return D > 1.f ? D / L : Fallback;
}

void AHotBrookAnimals::BeginPlay()
{
	Super::BeginPlay();
	Stag.Mesh = LoadObject<USkeletalMesh>(nullptr, TEXT("/Game/AnimalVarietyPack/DeerStagAndDoe/Meshes/SK_DeerStag.SK_DeerStag"));
	Doe.Mesh = LoadObject<USkeletalMesh>(nullptr, TEXT("/Game/AnimalVarietyPack/DeerStagAndDoe/Meshes/SK_DeerDoe.SK_DeerDoe"));
	if (!Stag.Mesh || !Doe.Mesh) { UE_LOG(LogHotBrookAnimals, Warning, TEXT("the deer models aren't in the project (AnimalVarietyPack): no deer drawn")); return; }
	// (the models' length nose to tail: they face along +Y)
	Stag.Length = Stag.Mesh->GetBounds().BoxExtent.Y * 2.f; Doe.Length = Doe.Mesh->GetBounds().BoxExtent.Y * 2.f;
	Stag.Walk = Anim(TEXT("ANIM_DeerStag_Walk")); Stag.Run = Anim(TEXT("ANIM_DeerStag_Run")); Stag.Graze = Anim(TEXT("ANIM_DeerStag_IdleGraze"));
	Stag.Browse = Anim(TEXT("ANIM_DeerStag_IdleChew")); Stag.Idle = Anim(TEXT("ANIM_DeerStag_IdleLookAround")); Stag.Rest = Anim(TEXT("ANIM_DeerStag_Rest"));
	Doe.Walk = Anim(TEXT("ANIM_DeerDoe_Walk")); Doe.Run = Anim(TEXT("ANIM_DeerDoe_Run")); Doe.Graze = Anim(TEXT("ANIM_DeerDoe_IdleGraze"));
	Doe.Browse = Anim(TEXT("ANIM_DeerDoe_IdleChew")); Doe.Idle = Anim(TEXT("ANIM_DeerDoe_IdleLookAround")); Doe.Rest = Anim(TEXT("ANIM_DeerDoe_IdleRest"));
	Stag.WalkSpeed = GaitSpeed(TEXT("ANIM_DeerStag_Walk_RM"), 130.f); Stag.RunSpeed = GaitSpeed(TEXT("ANIM_DeerStag_Run_RM"), 700.f);
	Doe.WalkSpeed = GaitSpeed(TEXT("ANIM_DeerDoe_Walk_RM"), 120.f); Doe.RunSpeed = GaitSpeed(TEXT("ANIM_DeerDoe_Run_RM"), 650.f);
	bLoaded = true;
	UE_LOG(LogHotBrookAnimals, Display, TEXT("deer: stag %.0f cm (walk %.0f, run %.0f cm/s), doe %.0f cm (walk %.0f, run %.0f cm/s)"), Stag.Length, Stag.WalkSpeed, Stag.RunSpeed, Doe.Length, Doe.WalkSpeed, Doe.RunSpeed);
}

UAnimSequence* AHotBrookAnimals::Pick(const FLook& L, int32 Act, float Speed) const
{
	// moving: the run past ~2.5 m/s, else the walk; still: the head down to graze or drink, chewing at a browse, lying when bedded
	if (Speed > 250.f) return L.Run;
	if (Speed > 15.f) return L.Walk;
	switch (Act) { case 1: case 3: return L.Graze; case 2: return L.Browse; case 6: case 7: return L.Rest; default: return L.Idle; }
}

void AHotBrookAnimals::Play(USkeletalMeshComponent* C, TObjectPtr<UAnimSequence>& Playing, UAnimSequence* A, float Rate)
{
	if (!A) return;
	if (Playing != A) { C->PlayAnimation(A, true); Playing = A; }
	C->SetPlayRate(Rate);
}

void AHotBrookAnimals::Update(const float* R, int32 N)
{
	if (!bLoaded) return;
	const double Now = GetWorld()->GetTimeSeconds();
	SnapDt = FMath::Clamp(Now - LastSnap, 0.02, 0.5); LastSnap = Now;
	for (auto& KV : Views) KV.Value.bSeen = false;
	for (int32 i = 0; i < N; i++) {
		const float* r = R + i * 8; if ((int32)r[1] != 1) continue;   // (the deer; the moose and the bears have no models yet)
		const int32 Id = (int32)r[0]; const FVector2D P(r[2], r[3]);
		FView* V = Views.Find(Id);
		if (!V) {
			V = &Views.Add(Id); V->From = V->To = P; V->Heading = r[4]; V->Yaw = -FMath::RadiansToDegrees(r[4]);
			const bool bStag = r[7] >= 1.8f; const FLook& L = bStag ? Stag : Doe;
			V->Body = NewObject<USkeletalMeshComponent>(this); V->Body->SetSkeletalMesh(L.Mesh); V->Body->SetCollisionEnabled(ECollisionEnabled::NoCollision);
			V->Body->SetupAttachment(RootComponent); V->Body->RegisterComponent();
		}
		V->bSeen = true; V->From = FMath::Lerp(V->From, V->To, FMath::Clamp((Now - V->T0) / FMath::Max(0.001, V->T1 - V->T0), 0.0, 1.0)); V->To = P;
		V->T0 = Now; V->T1 = Now + SnapDt; V->Heading = r[4]; V->Act = (int32)r[5]; V->Len = FMath::Max(0.5f, r[7]);
		V->Speed = FVector2D::Distance(V->From, V->To) * 100.f / SnapDt;
		// a fawn at the doe's heel while she has young
		const bool bYoung = r[6] > 0.f && r[7] < 1.8f;
		if (bYoung && !V->Young) { V->Young = NewObject<USkeletalMeshComponent>(this); V->Young->SetSkeletalMesh(Doe.Mesh); V->Young->SetCollisionEnabled(ECollisionEnabled::NoCollision); V->Young->SetupAttachment(RootComponent); V->Young->RegisterComponent(); }
		if (!bYoung && V->Young) { V->Young->DestroyComponent(); V->Young = nullptr; }
	}
	TArray<int32> Gone; for (const auto& KV : Views) if (!KV.Value.bSeen) Gone.Add(KV.Key);
	for (int32 Id : Gone) { FView& V = Views[Id]; if (V.Body) V.Body->DestroyComponent(); if (V.Young) V.Young->DestroyComponent(); Views.Remove(Id); }
}

void AHotBrookAnimals::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!bLoaded) return;
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const APawn* Pw = PC ? PC->GetPawn() : nullptr;
	const FVector2D Me = Pw ? HotBrookCoords::ToSim(Pw->GetActorLocation()) : FVector2D::ZeroVector;
	const double Now = GetWorld()->GetTimeSeconds();
	for (auto& KV : Views) {
		FView& V = KV.Value;
		const FVector2D P = FMath::Lerp(V.From, V.To, FMath::Clamp((Now - V.T0) / FMath::Max(0.001, V.T1 - V.T0), 0.0, 1.0));
		const bool bNear = FVector2D::Distance(P, Me) < DrawRadius;
		V.Body->SetVisibility(bNear); if (V.Young) V.Young->SetVisibility(bNear);
		if (!bNear) continue;
		const bool bStag = V.Len >= 1.8f; const FLook& L = bStag ? Stag : Doe;
		// the heading turned smoothly (the model faces +Y: UE's yaw less 90°; the sim's angle is counter-clockwise from east, UE's Y south)
		const float Want = -FMath::RadiansToDegrees(V.Heading); V.Yaw += FMath::FindDeltaAngleDegrees(V.Yaw, Want) * FMath::Min(1.f, Dt * 4.f);
		float G = 0; W->GroundAt(HotBrookCoords::ToUE(P.X, P.Y, HotBrookCoords::Datum), G);
		const float S = V.Len * 100.f / L.Length;
		V.Body->SetWorldLocationAndRotation(FVector(P.X * 100.0, -P.Y * 100.0, G), FRotator(0.f, V.Yaw - 90.f, 0.f)); V.Body->SetWorldScale3D(FVector(S));
		UAnimSequence* A = Pick(L, V.Act, V.Speed);
		Play(V.Body, V.Playing, A, A == L.Walk ? FMath::Clamp(V.Speed / (L.WalkSpeed * S), 0.4f, 2.f) : A == L.Run ? FMath::Clamp(V.Speed / (L.RunSpeed * S), 0.5f, 1.8f) : 1.f);
		if (V.Young) {   // (the fawn ~1.5 m behind and beside her, half her length, doing as she does)
			const FVector2D Back = FVector2D(FMath::Cos(V.Heading), FMath::Sin(V.Heading)) * -1.5f + FVector2D(-FMath::Sin(V.Heading), FMath::Cos(V.Heading)) * 0.6f;
			float Gy = 0; W->GroundAt(HotBrookCoords::ToUE(P.X + Back.X, P.Y + Back.Y, HotBrookCoords::Datum), Gy);
			const float SY = S * 0.55f;
			V.Young->SetWorldLocationAndRotation(FVector((P.X + Back.X) * 100.0, -(P.Y + Back.Y) * 100.0, Gy), FRotator(0.f, V.Yaw - 90.f, 0.f)); V.Young->SetWorldScale3D(FVector(SY));
			Play(V.Young, V.YoungPlaying, Pick(Doe, V.Act, V.Speed), A == L.Walk ? FMath::Clamp(V.Speed / (Doe.WalkSpeed * SY), 0.4f, 2.5f) : 1.f);
		}
	}
}
