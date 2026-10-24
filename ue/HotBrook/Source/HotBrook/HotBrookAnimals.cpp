#include "HotBrookAnimals.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "Components/SkeletalMeshComponent.h"
#include "Animation/AnimInstance.h"
#include "Animation/AnimSequence.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Materials/MaterialInterface.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookAnimals, Log, All);

static const TCHAR* DEER = TEXT("/Game/AnimalVarietyPack/DeerStagAndDoe");
static const TCHAR* BEAR = TEXT("/Game/HotBrook/Animals/bear");
static const TCHAR* MOOSE = TEXT("/Game/HotBrook/Animals/moose");

AHotBrookAnimals::AHotBrookAnimals()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

static UAnimSequence* Anim(const FString& Dir, const FString& Name)
{
	return LoadObject<UAnimSequence>(nullptr, *FString::Printf(TEXT("%s/%s.%s"), *Dir, *Name, *Name));
}

// (a gait's ground speed, cm/s: how far its root travels over a cycle — the deer's root-motion twins of their in-place clips, the
// bear's own clips; the in-place clip is played at the animal's speed / this)
static float Travel(UAnimSequence* S, float Fallback)
{
	if (!S) return Fallback; const float L = S->GetPlayLength(); if (L <= 0.f) return Fallback;
	const float D = S->ExtractRootMotionFromRange(0.0, L, FAnimExtractContext()).GetTranslation().Size();
	return D > 1.f ? D / L : Fallback;
}

void AHotBrookAnimals::BeginPlay()
{
	Super::BeginPlay();
	TArray<FString> Have;
	// the deer: the Animal Variety Pack's stag and doe (fawns: 0.7 m at birth in early June, +0.1 m a month — forest3 YLEN, FAWN_YF)
	const FString DA = FString(DEER) + TEXT("/Animations");
	Stag.Mesh = LoadObject<USkeletalMesh>(nullptr, *(FString(DEER) + TEXT("/Meshes/SK_DeerStag.SK_DeerStag")));
	Doe.Mesh = LoadObject<USkeletalMesh>(nullptr, *(FString(DEER) + TEXT("/Meshes/SK_DeerDoe.SK_DeerDoe")));
	if (Stag.Mesh && Doe.Mesh) {
		for (auto& [L, Who] : { TPair<FLook*, FString>(&Stag, TEXT("Stag")), TPair<FLook*, FString>(&Doe, TEXT("Doe")) }) {
			const FString P = TEXT("ANIM_Deer") + Who + TEXT("_");
			L->Mesh = Who == TEXT("Stag") ? Stag.Mesh : Doe.Mesh; L->Length = L->Mesh->GetBounds().BoxExtent.Y * 2.f;   // (they face along +Y)
			L->Gaits = { { Anim(DA, P + TEXT("Walk")), Travel(Anim(DA, P + TEXT("Walk_RM")), 125.f) }, { Anim(DA, P + TEXT("Run")), Travel(Anim(DA, P + TEXT("Run_RM")), 650.f) } };
			L->Graze = L->Drink = Anim(DA, P + TEXT("IdleGraze")); L->Browse = Anim(DA, P + TEXT("IdleChew")); L->Idle = Anim(DA, P + TEXT("IdleLookAround"));
			L->Rest = Anim(DA, P + (Who == TEXT("Stag") ? TEXT("Rest") : TEXT("IdleRest")));
			L->Y0 = 0.7f; L->YPerMonth = 0.1f; L->YMax = 1.5f; L->YBorn = 0.265f;
		}
		Have.Add(FString::Printf(TEXT("deer (stag %.0f cm, walk %.0f, run %.0f cm/s)"), Stag.Length, Stag.Gaits[0].Speed, Stag.Gaits[1].Speed));
	}
	// the black bear: walking slow to sprinting, eating, standing, lying (cubs born late January at 0.25 m, +0.065 m a month)
	Bear.Mesh = LoadObject<USkeletalMesh>(nullptr, *(FString(BEAR) + TEXT("/SK_bear.SK_bear")));
	if (Bear.Mesh) {
		const FString P = TEXT("Bear_Animated_Anim_");
		Bear.Length = Bear.Mesh->GetBounds().BoxExtent.Y * 2.f;
		for (const TCHAR* G : { TEXT("WalkSlow"), TEXT("Walk"), TEXT("Trot"), TEXT("Run"), TEXT("Sprint") }) if (UAnimSequence* A = Anim(BEAR, P + G)) Bear.Gaits.Add({ A, Travel(A, 100.f) });
		Bear.Graze = Bear.Browse = Bear.Drink = Anim(BEAR, P + TEXT("Stand_Eating_01")); Bear.Fish = Anim(BEAR, P + TEXT("Stand_Idle_02"));
		Bear.Idle = Anim(BEAR, P + TEXT("Stand_Idle_01")); Bear.Rest = Anim(BEAR, P + TEXT("Lying_Idle_01"));
		Bear.Y0 = 0.25f; Bear.YPerMonth = 0.065f; Bear.YMax = 1.3f; Bear.YBorn = 0.893f;
		Have.Add(FString::Printf(TEXT("bear (%.0f cm, %d gaits)"), Bear.Length, Bear.Gaits.Num()));
	}
	// the moose: an idle and a fast walk (in place: a ~1.75-m stride a second for its 3.2-m model); calves 1.0 m in late May, +0.17 m a month
	Moose.Mesh = LoadObject<USkeletalMesh>(nullptr, *(FString(MOOSE) + TEXT("/SK_moose.SK_moose")));
	if (Moose.Mesh) {
		const FString P = TEXT("MOOSE_DEMO_Anim_Moose_Moose_");
		Moose.Length = Moose.Mesh->GetBounds().BoxExtent.Y * 2.f;
		if (UAnimSequence* A = Anim(MOOSE, P + TEXT("WalkFast_F"))) Moose.Gaits.Add({ A, Travel(A, 175.f) });
		Moose.Idle = Anim(MOOSE, P + TEXT("Idle"));
		Moose.Y0 = 1.0f; Moose.YPerMonth = 0.17f; Moose.YMax = 2.3f; Moose.YBorn = 0.24f;
		for (const FSkeletalMaterial& M : Moose.Mesh->GetMaterials()) if (M.MaterialSlotName == TEXT("M_Moose_Antler")) MooseAntler = M.MaterialInterface;
		Invisible = LoadObject<UMaterialInterface>(nullptr, *(FString(TEXT("/Game/HotBrook/Animals")) + TEXT("/M_HB_Invisible.M_HB_Invisible")));
		Have.Add(FString::Printf(TEXT("moose (%.0f cm)"), Moose.Length));
	}
	bLoaded = Have.Num() > 0;
	UE_LOG(LogHotBrookAnimals, Display, TEXT("animals: %s"), Have.Num() ? *FString::Join(Have, TEXT(", ")) : TEXT("no models in the project: none drawn"));
}

const AHotBrookAnimals::FLook* AHotBrookAnimals::LookOf(int32 Kind, float Len) const
{
	const FLook* L = Kind == 1 ? (Len >= 1.8f ? &Stag : &Doe) : Kind == 0 ? &Bear : Kind == 2 ? &Moose : nullptr;
	return L && L->Mesh ? L : nullptr;
}

float AHotBrookAnimals::YoungLen(const FLook& L) const
{
	const float Months = FMath::Fmod(YearNow - L.YBorn + 2.f, 1.f) * 12.f;
	return FMath::Min(L.YMax, L.Y0 + L.YPerMonth * Months);
}

UAnimSequence* AHotBrookAnimals::Pick(const FLook& L, int32 Act, float Speed, float Scale, float& OutRate) const
{
	OutRate = 1.f;
	// moving: the gait whose own speed (at this size) is nearest its speed, played faster or slower to match
	if (Speed > 15.f && L.Gaits.Num()) {
		const FGait* Best = nullptr; float BestD = 1e9f;
		for (const FGait& G : L.Gaits) { if (!G.Anim) continue; const float D = FMath::Abs(FMath::Loge(Speed / FMath::Max(1.f, G.Speed * Scale))); if (D < BestD) { BestD = D; Best = &G; } }
		if (Best) { OutRate = FMath::Clamp(Speed / FMath::Max(1.f, Best->Speed * Scale), 0.5f, 2.f); return Best->Anim; }
	}
	// still: the head down to graze or drink, chewing at a browse, watching the riffle for fish, lying when bedded
	UAnimSequence* A = nullptr;
	switch (Act) { case 1: A = L.Graze; break; case 2: A = L.Browse; break; case 3: A = L.Drink; break; case 5: A = L.Fish; break; case 6: A = L.Rest; break; default: break; }
	return A ? A : L.Idle.Get();
}

void AHotBrookAnimals::Play(USkeletalMeshComponent* C, TObjectPtr<UAnimSequence>& Playing, UAnimSequence* A, float Rate)
{
	if (!A) return;
	if (Playing != A) {
		C->PlayAnimation(A, true); Playing = A;
		// (a clip whose root travels — the bear's gaits — is held in place: the body is moved here, by the sim)
		if (UAnimInstance* I = C->GetAnimInstance()) I->SetRootMotionMode(ERootMotionMode::IgnoreRootMotion);
	}
	C->SetPlayRate(Rate);
}

USkeletalMeshComponent* AHotBrookAnimals::NewBody(USkeletalMesh* Mesh)
{
	USkeletalMeshComponent* C = NewObject<USkeletalMeshComponent>(this);
	C->SetSkeletalMesh(Mesh); C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	C->bAffectDistanceFieldLighting = false; C->bAffectDynamicIndirectLighting = false;   // (moving: out of Lumen's scene)
	C->SetupAttachment(RootComponent); C->RegisterComponent();
	return C;
}

void AHotBrookAnimals::Update(const float* R, int32 N, float YearFrac)
{
	if (!bLoaded) return;
	const double Now = GetWorld()->GetTimeSeconds();
	SnapDt = FMath::Clamp(Now - LastSnap, 0.02, 0.5); LastSnap = Now; YearNow = YearFrac;
	for (auto& KV : Views) KV.Value.bSeen = false;
	for (int32 i = 0; i < N; i++) {
		const float* r = R + i * 8; const int32 Kind = (int32)r[1], Act = (int32)r[5];
		const FLook* L = LookOf(Kind, r[7]); if (!L || Act == 7) continue;   // (no model for it; a bear in its den)
		const int32 Id = (int32)r[0]; const FVector2D P(r[2], r[3]);
		FView* V = Views.Find(Id);
		if (!V) { V = &Views.Add(Id); V->From = V->To = P; V->Heading = r[4]; V->Yaw = -FMath::RadiansToDegrees(r[4]); V->Body = NewBody(L->Mesh); }
		V->bSeen = true; V->From = FMath::Lerp(V->From, V->To, FMath::Clamp((Now - V->T0) / FMath::Max(0.001, V->T1 - V->T0), 0.0, 1.0)); V->To = P;
		V->T0 = Now; V->T1 = Now + SnapDt; V->Heading = r[4]; V->Act = Act; V->Kind = Kind; V->Len = FMath::Max(0.5f, r[7]);
		V->Speed = FVector2D::Distance(V->From, V->To) * 100.f / SnapDt;
		// her young at heel while she has them
		const bool bYoung = r[6] > 0.f;
		if (bYoung && !V->Young) V->Young = NewBody(Kind == 1 ? Doe.Mesh.Get() : L->Mesh.Get());
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
	// (a bull moose carries his antlers from mid-May — growing in velvet — until he drops them about New Year; Maine moose: MDIFW)
	const bool bAntlerSeason = YearNow > 0.2f && YearNow < 0.84f;
	int32 AntlerSlot = INDEX_NONE;
	if (Moose.Mesh) AntlerSlot = Moose.Mesh->GetMaterials().IndexOfByPredicate([](const FSkeletalMaterial& M) { return M.MaterialSlotName == TEXT("M_Moose_Antler"); });
	for (auto& KV : Views) {
		FView& V = KV.Value;
		const FLook* L = LookOf(V.Kind, V.Len); if (!L) continue;
		const FVector2D P = FMath::Lerp(V.From, V.To, FMath::Clamp((Now - V.T0) / FMath::Max(0.001, V.T1 - V.T0), 0.0, 1.0));
		const bool bNear = FVector2D::Distance(P, Me) < DrawRadius;
		V.Body->SetVisibility(bNear); if (V.Young) V.Young->SetVisibility(bNear);
		if (!bNear) continue;
		// the heading turned smoothly (the models face +Y: UE's yaw less 90°; the sim's angle is counter-clockwise from east, UE's Y south)
		const float Want = -FMath::RadiansToDegrees(V.Heading); V.Yaw += FMath::FindDeltaAngleDegrees(V.Yaw, Want) * FMath::Min(1.f, Dt * 4.f);
		float G = 0; W->GroundAt(HotBrookCoords::ToUE(P.X, P.Y, HotBrookCoords::Datum), G);
		const float S = V.Len * 100.f / L->Length;
		V.Body->SetWorldLocationAndRotation(FVector(P.X * 100.0, -P.Y * 100.0, G), FRotator(0.f, V.Yaw - 90.f, 0.f)); V.Body->SetWorldScale3D(FVector(S));
		float Rate = 1.f; UAnimSequence* A = Pick(*L, V.Act, V.Speed, S, Rate); Play(V.Body, V.Playing, A, Rate);
		if (V.Kind == 2 && AntlerSlot != INDEX_NONE && Invisible) {
			const int32 Show = V.Len >= 2.85f && bAntlerSeason ? 1 : 0;   // (bulls 3.0 m, cows 2.7 m: forest3 LEN)
			if (V.AntlersShown != Show) { V.Body->SetMaterial(AntlerSlot, Show ? MooseAntler.Get() : Invisible.Get()); V.AntlersShown = Show; }
		}
		if (V.Young) {
			// (her young a little behind and beside her, its length for its age, doing as she does)
			const FLook& Y = V.Kind == 1 ? Doe : *L; const float YL = YoungLen(*L), SY = YL * 100.f / Y.Length;
			const FVector2D Fw(FMath::Cos(V.Heading), FMath::Sin(V.Heading)), Sd(-Fw.Y, Fw.X), Q = P - Fw * (0.8f * V.Len) + Sd * (0.35f * V.Len);
			float Gy = 0; W->GroundAt(HotBrookCoords::ToUE(Q.X, Q.Y, HotBrookCoords::Datum), Gy);
			V.Young->SetWorldLocationAndRotation(FVector(Q.X * 100.0, -Q.Y * 100.0, Gy), FRotator(0.f, V.Yaw - 90.f, 0.f)); V.Young->SetWorldScale3D(FVector(SY));
			float YR = 1.f; UAnimSequence* YA = Pick(Y, V.Act, V.Speed, SY, YR); Play(V.Young, V.YoungPlaying, YA, YR);
			if (V.Kind == 2 && AntlerSlot != INDEX_NONE && Invisible) V.Young->SetMaterial(AntlerSlot, Invisible.Get());   // (a calf has none)
		}
	}
}

bool AHotBrookAnimals::Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw, float& OutLen) const
{
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>(); const double Now = GetWorld()->GetTimeSeconds(); double Best = 1e18;
	for (const auto& KV : Views) {
		const FView& V = KV.Value; if (V.Kind != Kind) continue;
		const FVector2D P = FMath::Lerp(V.From, V.To, FMath::Clamp((Now - V.T0) / FMath::Max(0.001, V.T1 - V.T0), 0.0, 1.0));
		const double D = FVector2D::DistSquared(P, From); if (D >= Best) continue;
		float G = 0; if (W) W->GroundAt(HotBrookCoords::ToUE(P.X, P.Y, HotBrookCoords::Datum), G);
		Best = D; OutP = FVector(P.X * 100.0, -P.Y * 100.0, G); OutYaw = V.Yaw; OutLen = V.Len;   // (the way it faces)
	}
	return Best < 1e18;
}
