#include "HotBrookWildlife.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "HotBrookLink.h"
#include "Components/InstancedSkinnedMeshComponent.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "EngineUtils.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Animation/AnimSequence.h"
#include "Engine/StaticMesh.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "HAL/IConsoleManager.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookWildlife, Log, All);

static TAutoConsoleVariable<int32> CVarAllLife(TEXT("hb.AllLife"), 0, TEXT("1: every kind of the lakes' wildlife about whatever the season or the hour (for a look at one)"));

// (fish3 WILD3 rows the view keeps: the bullfrog's and snapper's densities — perKm 10, perHa 1 — and the mergansers' groups, wild3view GROUP)
static constexpr float SNAPPER_PER_HA = 1.f, BULLFROG_PER_KM = 10.f;
static int32 GroupOf(int32 Kind) { return Kind == 5 ? 5 : Kind == 6 ? 4 : 1; }
// (a hash of a few integers to 0–1: the day's or the place's draw, the same each time)
static float Hash01(int32 A, int32 B, int32 C = 0) { return (HashCombine(HashCombine(GetTypeHash(A), GetTypeHash(B * 7919 + 13)), GetTypeHash(C * 104729 + 7)) % 100000) / 100000.f; }

AHotBrookWildlife::AHotBrookWildlife()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

int32 AHotBrookWildlife::KindOf(const FString& Name)
{
	static const TCHAR* K[] = { TEXT("loon"), TEXT("heron"), TEXT("kingfisher"), TEXT("osprey"), TEXT("eagle"), TEXT("cmerganser"), TEXT("hmerganser"), TEXT("otter"), TEXT("mink"), TEXT("snapper"), TEXT("bullfrog") };
	for (int32 i = 0; i < UE_ARRAY_COUNT(K); i++) if (Name == K[i]) return i;
	return Name == TEXT("merganser") ? 6 : Name == TEXT("painted") ? 20 : Name == TEXT("frog") ? 21 : -1;
}

bool AHotBrookWildlife::AllLife() const { return CVarAllLife.GetValueOnGameThread() != 0; }

bool AHotBrookWildlife::LoadLook(int32 Key, const FString& Name, float Scale, float Glide, bool bBase)
{
	// (Import/creatures_meshes.json: the mesh, its bounds and its clips, as import_creatures.py brought them in)
	static TSharedPtr<FJsonObject> Manifest;
	if (!Manifest.IsValid()) {
		FString Text; TSharedPtr<FJsonObject> J;
		if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("creatures_meshes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J)) Manifest = J;
		else Manifest = MakeShared<FJsonObject>();
	}
	const TSharedPtr<FJsonObject>* E = nullptr;
	if (!Manifest->TryGetObjectField(Name, E)) return false;
	FLook L; L.Scale = Scale; L.Glide = Glide;
	const FString Mesh = (*E)->GetStringField(TEXT("mesh"));
	if ((*E)->GetBoolField(TEXT("skeletal"))) {
		L.SK = LoadObject<USkeletalMesh>(nullptr, *Mesh);
		const TSharedPtr<FJsonObject>* Clips = nullptr;
		if ((*E)->TryGetObjectField(TEXT("clips"), Clips)) for (const auto& KV : (*Clips)->Values) { L.Clip = LoadObject<UAnimSequence>(nullptr, *KV.Value->AsString()); if (L.Clip) break; }
		// (its middle — the bounds' centre — set on the place it is put: the clips swing about it)
		const TArray<TSharedPtr<FJsonValue>>& O = (*E)->GetArrayField(TEXT("origin_cm")), & Sz = (*E)->GetArrayField(TEXT("size_cm"));
		L.Offset = FVector(O[0]->AsNumber(), O[1]->AsNumber(), O[2]->AsNumber() - (bBase ? Sz[2]->AsNumber() * 0.5 : 0.0));   // (a perched one: its feet)
	} else L.SM = LoadObject<UStaticMesh>(nullptr, *Mesh);   // (a scan: on its base, its middle at the origin)
	if (!L.SK && !L.SM) return false;
	Held.Append({ L.SK, L.SM, L.Clip }); Held.Remove(nullptr);
	Looks.Add(Key, L);
	return true;
}

void AHotBrookWildlife::BeginPlay()
{
	Super::BeginPlay();
	// the lakes (Import/lakes.json: each one's shoreline, the sim's metres, and its level) — with each point's arc length along it and
	// the outward normal there (toward the land)
	FString Text; TSharedPtr<FJsonObject> J;
	if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("lakes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid()) {
		for (const TSharedPtr<FJsonValue>& V : J->GetArrayField(TEXT("lakes"))) {
			const TSharedPtr<FJsonObject> O = V->AsObject(); FLake L; L.Level = (float)O->GetNumberField(TEXT("level")); L.Box.Init();
			for (const TSharedPtr<FJsonValue>& Q : O->GetArrayField(TEXT("pts"))) { const TArray<TSharedPtr<FJsonValue>>& XY = Q->AsArray(); const FVector2D P(XY[0]->AsNumber(), XY[1]->AsNumber()); L.Pts.Add(P); L.Box += P; }
			for (int32 i = 0; i < L.Pts.Num(); i++) { const FVector2D& a = L.Pts[i], & b = L.Pts[(i + 1) % L.Pts.Num()]; L.Area += 0.5 * (a.X * b.Y - b.X * a.Y); L.Arc.Add(L.Shore); L.Shore += FVector2D::Distance(a, b); }
			if (L.Pts.Num() < 3) continue;
			for (int32 i = 0; i < L.Pts.Num(); i++) {
				const FVector2D d = (L.Pts[(i + 1) % L.Pts.Num()] - L.Pts[i]).GetSafeNormal(); FVector2D n = L.Area > 0 ? FVector2D(d.Y, -d.X) : FVector2D(-d.Y, d.X);
				const FVector2D Mid = (L.Pts[i] + L.Pts[(i + 1) % L.Pts.Num()]) * 0.5;
				if (InLake(L, Mid + n * 3.0) && !InLake(L, Mid - n * 3.0)) n = -n;   // (a fold of the line: the side that is land)
				L.Out.Add(n);
			}
			L.Area = FMath::Abs(L.Area); Lakes.Add(L);
		}
	}
	// the looks: the loon and heron scans; the rest from Import/creatures (sizes as the models are: the OSU birds, the otter at their own,
	// the eagle's file 237 times a real one's — 4.73 "m" of span for ~2.0 m)
	for (const auto& [K, Name] : { TPair<int32, const TCHAR*>(Loon, TEXT("common_loon")), TPair<int32, const TCHAR*>(Heron, TEXT("great_blue_heron")) })
		if (UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HotBrook/Models/%s/SM_%s.SM_%s"), Name, Name, Name))) { FLook L; L.SM = M; Looks.Add(K, L); Held.Add(M); }
	LoadLook(Kingfisher, TEXT("kingfisher_flight"), 1.f, 0.21f);
	LoadLook(100 + Kingfisher, TEXT("kingfisher_perched"), 1.f, -1.f, true);
	LoadLook(Osprey, TEXT("osprey_flight"), 1.05f, 0.21f);
	if (!LoadLook(Eagle, TEXT("eagle_flight"), 2.0f / 473.f, 0.333f))   // (the old still eagle if the animated one isn't in)
		if (UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HotBrook/Models/bald_eagle/SM_bald_eagle.SM_bald_eagle"))) { FLook L; L.SM = M; Looks.Add(Eagle, L); Held.Add(M); }
	LoadLook(CMerg, TEXT("hooded_merganser"), 0.62f / 0.45f);   // (no common merganser model: the hooded hen, larger — a common hen's 58–64 cm)
	LoadLook(HMerg, TEXT("hooded_merganser"), 1.f);
	LoadLook(Otter, TEXT("otter_swim"), 1.05f);
	LoadLook(Mink, TEXT("mink"), 1.f);
	LoadLook(Snapper, TEXT("snapping_turtle"), 1.f);
	LoadLook(Bullfrog, TEXT("bullfrog"), 1.f);
	LoadLook(Painted, TEXT("painted_turtle"), 1.f);
	LoadLook(Frog, TEXT("bullfrog"), 0.5f);   // (no green frog model: the bullfrog's scan at a green frog's 8–9 cm)
	for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Link = *It; break; }
	LayLogs();
	// (a kingfisher's limb: a leaning dead pole of the engine's cylinder in the log siding's grey wood)
	Limb = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	LimbMat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Camps/Materials/MI_HB_Siding_log.MI_HB_Siding_log"));
	Held.Append({ Limb, LimbMat }); Held.Remove(nullptr);
	TArray<FString> Have; for (const auto& KV : Looks) Have.Add(FString::FromInt(KV.Key));
	UE_LOG(LogHotBrookWildlife, Display, TEXT("wildlife: %d lakes, looks for kinds %s"), Lakes.Num(), *FString::Join(Have, TEXT(" ")));
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

void AHotBrookWildlife::ShoreAt(const FLake& L, double S, FVector2D& OutP, FVector2D& OutOut) const
{
	S = FMath::Fmod(S, L.Shore); if (S < 0) S += L.Shore;
	int32 Lo = 0, Hi = L.Arc.Num() - 1;
	while (Lo < Hi) { const int32 M = (Lo + Hi + 1) / 2; if (L.Arc[M] <= S) Lo = M; else Hi = M - 1; }
	const FVector2D& a = L.Pts[Lo], & b = L.Pts[(Lo + 1) % L.Pts.Num()]; const double Seg = FMath::Max(1e-6, FVector2D::Distance(a, b));
	OutP = a + (b - a) * ((S - L.Arc[Lo]) / Seg); OutOut = L.Out[Lo];
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
	// (each where it hunts — WILD3 z, b and wild3view's picks: a loon in open water; a heron wading to its knees; a kingfisher over water
	// under 60 cm; an osprey's circle over a metre or more; the mergansers 0.3–2.5 m; an otter 0.2–4 m; a mink's swim under a metre; a
	// snapper on a bed 0.3–3 m down; a bullfrog in the edge's few centimetres)
	const float D = Depth(P);
	switch (Kind) {
	case Loon: return D >= 1.5f;
	case Heron: return D >= 0.05f && D <= 0.35f;
	case Kingfisher: return D >= 0.08f && D <= 0.6f;
	case Osprey: return D >= 1.f;
	case CMerg: return D >= 0.5f && D <= 2.5f;
	case HMerg: return D >= 0.3f && D <= 1.5f;
	case Otter: return D >= 0.2f && D <= 4.f;
	case Mink: return D >= 0.1f && D <= 1.f;
	case Snapper: return D >= 0.3f && D <= 3.f;
	case Bullfrog: return D >= 0.04f && D <= 0.25f;
	default: return D > 0.f;
	}
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

void AHotBrookWildlife::Update(const float* Counts, const float* Act, int32 NK, const float* Taken, int32 NTaken, float YearFrac, float IceMean)
{
	for (int32 k = 0; k < FMath::Min(NK, 16); k++) { N[k] = Counts[k]; ActNow[k] = Act[k]; }
	YearNow = YearFrac; IceNow = IceMean;
	for (int32 i = 0; i < NTaken; i++) {
		const float* r = Taken + i * 6; const int32 K = (int32)r[3];
		if (K == 11 || K == 12) AnglerTakes.Add(FVector(r[0], r[1], K));
		else if (K < NKinds) this->Taken(K, FVector2D(r[0], r[1]));
	}
	if (AnglerTakes.Num() > 64) AnglerTakes.RemoveAt(0, AnglerTakes.Num() - 64);
}

UStaticMeshComponent* AHotBrookWildlife::NewStatic(UStaticMesh* M)
{
	UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
	C->SetStaticMesh(M); C->SetMobility(EComponentMobility::Movable); C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	C->bAffectDistanceFieldLighting = false; C->bAffectDynamicIndirectLighting = false;   // (small and moving: out of Lumen's scene)
	C->SetupAttachment(RootComponent); C->RegisterComponent();
	return C;
}

USkeletalMeshComponent* AHotBrookWildlife::NewSkinned(const FLook& L)
{
	USkeletalMeshComponent* C = NewObject<USkeletalMeshComponent>(this);
	C->SetSkeletalMesh(L.SK); C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	C->bAffectDistanceFieldLighting = false; C->bAffectDynamicIndirectLighting = false;
	C->VisibilityBasedAnimTickOption = EVisibilityBasedAnimTickOption::OnlyTickPoseWhenRendered;
	C->SetupAttachment(RootComponent); C->RegisterComponent();
	if (L.Clip) { C->PlayAnimation(L.Clip, true); C->SetPosition(FMath::FRandRange(0.f, L.Clip->GetPlayLength())); }   // (each its own phase)
	return C;
}

void AHotBrookWildlife::Wear(FBird& B, int32 Key)
{
	const FLook* L = Looks.Find(Key); if (!L || !L->SK || !B.K || B.Look == Key) return;
	B.K->SetSkeletalMesh(L->SK); if (L->Clip) B.K->PlayAnimation(L->Clip, true);
	B.Look = Key;
}

void AHotBrookWildlife::Place(FBird& B, const FVector& At, float Yaw, float Pitch, float Roll, bool bGlide)
{
	const FLook* L = Looks.Find(B.Look); if (!L) return;
	const FRotator R(Pitch, Yaw, Roll);
	USceneComponent* C = B.K ? (USceneComponent*)B.K.Get() : (USceneComponent*)B.S.Get(); if (!C) return;
	C->SetWorldLocationAndRotation(At - R.RotateVector(L->Offset * L->Scale), R); C->SetWorldScale3D(FVector(L->Scale));
	if (B.K && L->Clip) {
		// (a glide: the clip held where the wings are out level; else beating)
		if (bGlide && L->Glide >= 0.f) { if (B.K->GetPlayRate() != 0.f) { B.K->SetPlayRate(0.f); B.K->SetPosition(L->Glide, false); } }
		else if (B.K->GetPlayRate() == 0.f) B.K->SetPlayRate(1.f);
	}
}

void AHotBrookWildlife::Census()
{
	// each lake's share of each kind (by area; the herons, kingfishers, otters and mink by shore), a fraction present on that share of
	// days (the day's hash); a merganser group counts its birds; the mink and otters about as their activity (the hour's hash)
	const int32 Day = FMath::FloorToInt(YearNow * 365.f);
	const UWorld* W = GetWorld(); const int32 Hour = FMath::FloorToInt(W->GetTimeSeconds() / 600.0);
	const bool bAll = AllLife(), bFrozen = IceNow > 0.3f;
	static const float ALL[NKinds] = { 2, 1, 3, 1, 2, 5, 4, 1, 2, 0, 0 };   // (hb.AllLife: a few of each)
	double A = 0, Sh = 0; for (const FLake& L : Lakes) { A += L.Area; Sh += L.Shore; }
	for (int32 K = 0; K < NKinds; K++) {
		if (K == Snapper || K == Bullfrog || !Looks.Contains(K)) continue;
		const bool bShore = K == Heron || K == Kingfisher || K == Otter || K == Mink;
		const bool bOpen = K == Loon || K == Heron || K == Kingfisher || K == Osprey || K == CMerg || K == HMerg;   // (gone from a frozen lake)
		for (int32 l = 0; l < Lakes.Num(); l++) {
			float Count = bAll ? FMath::Max(N[K], ALL[K]) : N[K];
			if (bOpen && bFrozen && !bAll) Count = 0.f;
			if ((K == Mink || K == Otter) && !bAll) Count *= FMath::Clamp(ActNow[K] * (K == Otter ? 0.8f : 1.f), 0.f, 1.f) * (Hash01(Hour, K, l) < 0.85f ? 1.f : 0.f);
			const double Want = Count / GroupOf(K) * (bShore ? Lakes[l].Shore / FMath::Max(1.0, Sh) : Lakes[l].Area / FMath::Max(1.0, A));
			const int32 Wn = FMath::FloorToInt(Want) + (Hash01(Day, K, l) < Want - FMath::FloorToDouble(Want) ? 1 : 0);
			int32 Have = 0; for (const FBird& B : Birds) Have += B.Kind == K && B.Lake == l;
			for (; Have < Wn; Have++) Spawn(K, l);
			for (int32 i = Birds.Num() - 1; i >= 0 && Have > Wn; i--) if (Birds[i].Kind == K && Birds[i].Lake == l) { Despawn(Birds[i]); Birds.RemoveAt(i); Have--; }
		}
	}
}

void AHotBrookWildlife::Despawn(FBird& B)
{
	if (B.S) B.S->DestroyComponent(); if (B.K) B.K->DestroyComponent(); if (B.Prop) B.Prop->DestroyComponent();
	for (FMember& M : B.Members) if (M.C) M.C->DestroyComponent();
}

void AHotBrookWildlife::Spawn(int32 Kind, int32 Lake)
{
	const FLook* L = Looks.Find(Kind); if (!L || !Lakes.IsValidIndex(Lake)) return;
	const FLake& Lk = Lakes[Lake]; const double Now = GetWorld()->GetTimeSeconds();
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	FBird B; B.Kind = Kind; B.Lake = Lake; B.Look = Kind; B.Heading = FMath::FRandRange(0.f, 2.f * PI);
	FVector2D P = FVector2D::ZeroVector;
	if (Kind == Kingfisher) {
		// its perch: a dead pole leaning from the wooded bank out over the edge's water — not at a camp's cleared ground
		bool bOk = false;
		for (int32 t = 0; t < 60 && !bOk; t++) {
			FVector2D S, Out; ShoreAt(Lk, FMath::FRandRange(0.0, Lk.Shore), S, Out);
			const FVector2D Bank = S + Out * 1.8, Tip = S - Out * 1.2;
			const FVector BankU = HotBrookCoords::ToUE(Bank.X, Bank.Y, HotBrookCoords::Datum);
			float G = 0, Su = 0; if (!W || !W->GroundAt(BankU, G) || W->ClearedAt(BankU) || !Fits(Kingfisher, Tip) || !W->SurfaceAt(HotBrookCoords::ToUE(Tip.X, Tip.Y, HotBrookCoords::Datum), Su)) continue;
			if (G < Su + 20.f) continue;   // (a bank, not a marsh)
			const FVector Base(Bank.X * 100.0, -Bank.Y * 100.0, G - 30.f), Perch(Tip.X * 100.0, -Tip.Y * 100.0, Su + FMath::FRandRange(250.f, 330.f));
			const FVector Ax = (Perch - Base).GetSafeNormal(), End = Perch + Ax * 70.f;
			UStaticMeshComponent* C = NewStatic(Limb); if (LimbMat) C->SetMaterial(0, LimbMat);
			C->SetWorldLocationAndRotation((Base + End) * 0.5 - FVector(0, 0, 5.f), FRotationMatrix::MakeFromZ(Ax).Rotator());
			C->SetWorldScale3D(FVector(0.09f, 0.09f, FVector::Distance(Base, End) / 100.f));   // (the cylinder 1 m × 1 m: a pole ~9 cm thick)
			B.Prop = C; B.Perch = Perch; B.PerchYaw = -FMath::RadiansToDegrees(FMath::Atan2(-Out.Y, -Out.X)); P = Tip; bOk = true;   // (facing out over the water)
		}
		if (!bOk) return;
		B.Until = Now + FMath::FRandRange(5.f, 30.f); B.State = 0;
	} else if (Kind == Mink || Kind == Otter) {
		FVector2D S, Out; B.Arc = FMath::FRandRange(0.0, Lk.Shore); ShoreAt(Lk, B.Arc, S, Out);
		if (Kind == Mink) { P = S + Out * 0.4; B.State = 0; }
		else { if (!Pick(Otter, Lake, P, &S, 15.f)) return; B.State = 0; }
		B.Until = Now + FMath::FRandRange(8.f, 30.f); B.Ang = FMath::RandBool() ? 1.f : -1.f;   // (a mink's way along the shore)
	} else if (!Pick(Kind, Lake, P)) return;
	B.P = B.Goal = B.Centre = B.From = P;
	if (Kind == Loon) B.Until = Now + FMath::FRandRange(20.f, 90.f);
	else if (Kind == Heron) B.Until = Now + FMath::FRandRange(20.f, 120.f);
	else if (Kind == Eagle || Kind == Osprey) {
		B.Radius = Kind == Eagle ? FMath::FRandRange(60.f, 140.f) : FMath::FRandRange(15.f, 25.f); B.Ang = FMath::FRandRange(0.f, 2.f * PI);
		B.Alt = Kind == Eagle ? FMath::FRandRange(40.f, 90.f) : FMath::FRandRange(18.f, 30.f); B.Until = Now + FMath::FRandRange(40.f, 140.f);
	} else if (Kind == CMerg || Kind == HMerg) {
		// the group: a pair in spring (to late May), else the hens and the young of the year — five common, four hooded
		const int32 Nm = YearNow < 0.27f ? 2 : GroupOf(Kind);
		for (int32 m = 0; m < Nm; m++) {
			FMember M; M.Off = m == 0 ? FVector2D::ZeroVector : FVector2D(-0.8f - 0.55f * m + FMath::FRandRange(-0.3f, 0.3f), FMath::FRandRange(-1.5f, 1.5f));
			M.P = P + M.Off; M.Heading = B.Heading; M.Until = Now + FMath::FRandRange(10.f, 40.f); M.C = NewStatic(L->SM);
			B.Members.Add(M);
		}
		B.Until = 0;
	}
	if (Kind != CMerg && Kind != HMerg) {
		if (Kind == Kingfisher) { const FLook* Sit = Looks.Find(100 + Kingfisher); B.Look = Sit ? 100 + Kingfisher : Kingfisher; B.K = NewSkinned(Sit ? *Sit : *L); }
		else if (L->SK) B.K = NewSkinned(*L);
		else B.S = NewStatic(L->SM);
	}
	Birds.Add(B);
}

void AHotBrookWildlife::Taken(int32 Kind, const FVector2D& P)
{
	// the nearest of that kind (the sim's taker on that water) goes after it: a loon dives and comes up where the fish was; an eagle
	// or osprey stoops to it; a heron steps toward it; a kingfisher flies out and plunges; a merganser dives there; an otter or a mink
	// dives for it
	const double Now = GetWorld()->GetTimeSeconds(); FBird* Best = nullptr;
	double BestD = Kind == Heron ? 80.0 : Kind == Kingfisher ? 30.0 : Kind == Mink ? 40.0 : 500.0;
	for (FBird& B : Birds) if (B.Kind == Kind && !B.bAway) { const double D = FVector2D::Distance(B.P, P); if (D < BestD) { BestD = D; Best = &B; } }
	if (!Best) return;
	FBird& B = *Best;
	if (Kind == Loon && B.State == 0) { B.State = 1; B.From = B.P; B.Goal = P; B.T0 = Now; B.Until = Now + FMath::Clamp(BestD / 1.2, 12.0, 60.0); }
	else if ((Kind == Eagle || Kind == Osprey) && B.State == 0) { B.State = 1; B.From = B.P; B.Goal = P; B.T0 = Now; B.Hover = B.Alt; }
	else if (Kind == Heron) { FVector2D G; if (Pick(Heron, B.Lake, G, &P, 3.f)) { B.Goal = G; B.State = 1; } }
	else if (Kind == Kingfisher && B.State == 0) { B.Goal = P; B.State = 1; B.T0 = Now; B.From = B.P; }
	else if (Kind == CMerg || Kind == HMerg) {
		FMember* M = nullptr; double D2 = 1e18;
		for (FMember& Mm : B.Members) if (Mm.State == 0) { const double D = FVector2D::DistSquared(Mm.P, P); if (D < D2) { D2 = D; M = &Mm; } }
		if (M) { M->State = 1; M->Until = Now + FMath::FRandRange(8.f, 15.f); M->P = FMath::Lerp(M->P, P, 0.5); }
	} else if (Kind == Otter && B.State == 0) { B.State = 1; B.From = B.P; B.Goal = P; B.T0 = Now; B.Until = Now + FMath::Clamp(BestD / 1.0, 15.0, 40.0); }
	else if (Kind == Mink && B.State == 0) { B.State = 1; B.From = B.P; B.Goal = P; B.T0 = Now; }
}

void AHotBrookWildlife::Herpetology(const FVector2D& Me)
{
	// the snapping turtles (1 a hectare of the shallows' bed) and the bullfrogs (10 a km of the edge) near the walker, each cell its
	// expected share by its hash; kept by their places' keys while the walker moves; out only in their seasons (the sim's counts)
	const double Now = GetWorld()->GetTimeSeconds(); const bool bAll = AllLife();
	for (auto& KV : Herps) KV.Value.bSeen = false;
	const auto Keep = [&](int64 Key, int32 Kind, const FVector2D& P, float Heading, float Scale) {
		if (FHerp* H = Herps.Find(Key)) { H->bSeen = true; return; }
		const FLook* L = Looks.Find(Kind); if (!L || !L->SM) return;
		FHerp H; H.Kind = Kind; H.P = H.Home = P; H.Heading = Heading; H.Scale = Scale; H.Until = Now + FMath::FRandRange(5.f, 40.f); H.C = NewStatic(L->SM); H.bSeen = true;
		Herps.Add(Key, H);
	};
	const float R = 70.f;
	if (N[Snapper] > 0.f || bAll) {
		const float Cell = 15.f, Pr = SNAPPER_PER_HA * Cell * Cell / 1e4f * (bAll ? 8.f : 1.f);
		const int32 X0 = FMath::FloorToInt((Me.X - R) / Cell), X1 = FMath::FloorToInt((Me.X + R) / Cell), Y0 = FMath::FloorToInt((Me.Y - R) / Cell), Y1 = FMath::FloorToInt((Me.Y + R) / Cell);
		for (int32 y = Y0; y <= Y1; y++) for (int32 x = X0; x <= X1; x++) {
			if (Hash01(x, y, 901) >= Pr) continue;
			const FVector2D P((x + Hash01(x, y, 903)) * Cell, (y + Hash01(x, y, 905)) * Cell);
			if (FVector2D::Distance(P, Me) > R || !Fits(Snapper, P)) continue;
			Keep(((int64)x << 32) ^ (uint32)y ^ (1ll << 62), Snapper, P, Hash01(x, y, 907) * 2.f * PI, 0.75f + 0.45f * Hash01(x, y, 909));
		}
	}
	if (N[Bullfrog] > 0.f || bAll) {
		const float Seg = 10.f, Pr = BULLFROG_PER_KM * Seg / 1000.f * (bAll ? 8.f : 1.f);
		for (int32 l = 0; l < Lakes.Num(); l++) {
			const FLake& L = Lakes[l]; if (!L.Box.ExpandBy(R).IsInside(Me)) continue;
			for (int32 s = 0; s * Seg < L.Shore; s++) {
				if (Hash01(l, s, 911) >= Pr) continue;
				FVector2D S, Out; ShoreAt(L, (s + Hash01(l, s, 913)) * Seg, S, Out);
				if (FVector2D::Distance(S, Me) > R) continue;
				FVector2D P = S; bool bOk = false;
				for (float In = 0.f; In <= 2.5f && !bOk; In += 0.25f) { P = S - Out * In; bOk = Fits(Bullfrog, P); }
				if (!bOk) continue;
				Keep(((int64)l << 40) ^ s ^ (2ll << 60), Bullfrog, P, FMath::Atan2(-Out.Y, -Out.X) + (Hash01(l, s, 915) - 0.5f) * 1.5f, 0.8f + 0.3f * Hash01(l, s, 917));
			}
		}
	}
	// the painted turtles on the fallen trees near the walker: a sunny warm day, ice-out to mid-October; each tree's places where its top
	// is a hand's height over the water, 0.4 m apart, the first three — each taken by the day's draw (most on a clear day)
	const float Sun = Link ? Link->Daylight : 0.6f, Air = Link ? Link->Air : 15.f; const int32 Wx = Link ? Link->Weather : 0;
	const bool bBask = (YearNow > 0.08f && YearNow < 0.62f && Sun > 0.3f && Wx < 2 && (Air > 12.f || Sun > 0.6f) && IceNow < 0.05f) || bAll;
	if (bBask && Looks.Contains(Painted)) {
		const int32 Day = FMath::FloorToInt(YearNow * 365.f);
		for (int32 g = 0; g < Logs.Num(); g++) {
			const FLog& Lg = Logs[g]; if (FVector2D::Distance(Lg.From, Me) > 90.f) continue;
			int32 k = 0;
			for (float dd = 2.0f; dd < Lg.Len - 0.3f && k < 3; dd += 0.4f) {   // (out past the bank's shrubs)
				const float Top = (Lg.Rise - (Lg.Rise + Lg.Drop) * dd / Lg.Len + Lg.R) * 100.f; if (Top < 3.f || Top > 45.f) continue;
				if (Hash01(g * 4 + k, Day, 961) < (bAll ? 0.8f : Wx == 0 ? 0.3f : 0.18f)) {
					const FVector2D P = Lg.From + Lg.Dir * dd;
					const int64 Key = ((int64)g << 8) ^ k ^ (3ll << 60);
					Keep(Key, Painted, P, FMath::Atan2(Lg.Dir.Y, Lg.Dir.X) + (k % 2 ? PI : 0.f) + (Hash01(g, k, 963) - 0.5f), 0.75f + 0.45f * Hash01(g, k, 965));
					if (FHerp* H = Herps.Find(Key)) H->Z = Lg.Surf + Top - 1.f;
				}
				k++;
			}
		}
	}
	// the green and mink frogs at the water's edge within ~25 m (0.3 a metre of shore; a fifth of that on a camp's cleared bank)
	if ((YearNow > 0.2f && YearNow < 0.62f && IceNow < 0.05f) || bAll) {
		const UHotBrookWater* Wt = GetWorld()->GetSubsystem<UHotBrookWater>(); const float RF = 25.f;
		for (int32 l = 0; l < Lakes.Num(); l++) {
			const FLake& L = Lakes[l]; if (!L.Box.ExpandBy(RF).IsInside(Me)) continue;
			for (int32 i = 0; i < L.Pts.Num(); i++) {
				const FVector2D& a = L.Pts[i], & b = L.Pts[(i + 1) % L.Pts.Num()];
				if (FMath::PointDistToSegment(FVector(Me, 0), FVector(a, 0), FVector(b, 0)) > RF) continue;
				const int32 M0 = FMath::FloorToInt(L.Arc[i]), M1 = FMath::FloorToInt(L.Arc[i] + FVector2D::Distance(a, b));
				for (int32 m = M0; m <= M1; m++) {
					if (Hash01(l, m, 971) >= 0.3f) continue;
					FVector2D S, Out; ShoreAt(L, m + Hash01(l, m, 973), S, Out); if (FVector2D::Distance(S, Me) > RF) continue;
					if (Wt && Wt->ClearedAt(HotBrookCoords::ToUE(S.X + Out.X, S.Y + Out.Y, HotBrookCoords::Datum)) && Hash01(l, m, 975) > 0.2f) continue;
					Keep(((int64)l << 40) ^ m ^ (4ll << 60), Frog, S - Out * 0.1, FMath::Atan2(-Out.Y, -Out.X) + (Hash01(l, m, 977) - 0.5f) * 1.2f, 0.85f + 0.3f * Hash01(l, m, 979));
				}
			}
		}
	}
	TArray<int64> Gone; for (const auto& KV : Herps) if (!KV.Value.bSeen) Gone.Add(KV.Key);
	for (int64 K : Gone) { if (Herps[K].C) Herps[K].C->DestroyComponent(); Herps.Remove(K); }
}

void AHotBrookWildlife::LayLogs()
{
	// the shore's fallen trees, once: along each lake's wooded bank (not a camp's cleared ground), one to ~70 m (a 40-m stretch's draw),
	// from its root at the bank a hand or two over the water out across the shore — 4–8 m — into water, its top end sunk (shallows3view's
	// placeLogs); drawn as the ground cover's dead pine laid down (Import/groundcover_meshes.json "Log")
	FString Text; TSharedPtr<FJsonObject> J; UObject* Tree = nullptr;
	if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("groundcover_meshes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid()) {
		const TArray<TSharedPtr<FJsonValue>>* A = nullptr; if (J->TryGetArrayField(TEXT("Log"), A) && A->Num()) Tree = LoadObject<UObject>(nullptr, *(*A)[0]->AsString());
	}
	USkeletalMesh* Sk = Cast<USkeletalMesh>(Tree); UStaticMesh* St = Cast<UStaticMesh>(Tree);
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	if ((!Sk && !St) || !W) { UE_LOG(LogHotBrookWildlife, Display, TEXT("no fallen trees: the dead pine isn't in the project")); return; }
	Held.Add(Tree);
	const FBoxSphereBounds B = Sk ? Sk->GetBounds() : St->GetBounds(); const float H = FMath::Max(100.f, (float)(B.Origin.Z + B.BoxExtent.Z));
	UInstancedSkinnedMeshComponent* SC = nullptr; UInstancedStaticMeshComponent* IC = nullptr;
	if (Sk) { SC = NewObject<UInstancedSkinnedMeshComponent>(this); SC->SetSkinnedAssetAndUpdate(Sk); SC->SetCullDistances(0, 40000); }
	else { IC = NewObject<UInstancedStaticMeshComponent>(this); IC->SetStaticMesh(St); IC->SetMobility(EComponentMobility::Static); IC->SetCullDistances(0, 40000); }
	UPrimitiveComponent* C = SC ? (UPrimitiveComponent*)SC : (UPrimitiveComponent*)IC;
	C->SetCollisionEnabled(ECollisionEnabled::NoCollision); C->SetupAttachment(RootComponent); C->RegisterComponent();
	for (int32 l = 0; l < Lakes.Num(); l++) {
		const FLake& L = Lakes[l]; const float Surf = HotBrookCoords::HeightToUE(L.Level);
		for (int32 s = 0; s * 40.0 < L.Shore; s++) {
			if (Hash01(l, s, 951) > 0.55f) continue;
			FVector2D S, Out; ShoreAt(L, (s + Hash01(l, s, 953)) * 40.0, S, Out);
			const FVector2D Bank = S + Out * 0.6; const FVector BankU = HotBrookCoords::ToUE(Bank.X, Bank.Y, HotBrookCoords::Datum);
			float G = 0; if (!W->GroundAt(BankU, G) || G < Surf + 10.f || W->ClearedAt(BankU) || W->ClearedAt(HotBrookCoords::ToUE(S.X, S.Y, HotBrookCoords::Datum))) continue;
			const float A = FMath::Atan2(-Out.Y, -Out.X) + (Hash01(l, s, 955) - 0.5f) * 1.2f, Len = 4.f + 4.f * Hash01(l, s, 957);
			const FVector2D Dir(FMath::Cos(A), FMath::Sin(A)), End = Bank + Dir * Len;
			const float DE = Depth(End); if (DE < 0.1f) continue;   // (its far end in the water)
			FLog Lg; Lg.From = Bank; Lg.Dir = Dir; Lg.Len = Len; Lg.Rise = 0.12f + 0.15f * Hash01(l, s, 959); Lg.Drop = FMath::Min(DE, 0.25f * Len) + 0.05f; Lg.R = 0.0125f * Len; Lg.Surf = Surf;
			const float Th = FMath::RadiansToDegrees(FMath::Atan((Lg.Rise + Lg.Drop) / Len));
			const FQuat Q = FQuat(FRotator(-90.f - Th, -FMath::RadiansToDegrees(A), 0.f)) * FQuat(FVector::UpVector, Hash01(l, s, 967) * 2.f * PI);   // (laid down, turned about its own axis)
			const FTransform T(Q, FVector(Bank.X * 100.0, -Bank.Y * 100.0, Surf + Lg.Rise * 100.f), FVector(Len * 100.f / H));
			if (SC) SC->AddInstance(T, 0, true); else IC->AddInstance(T, true);
			Logs.Add(Lg);
		}
	}
	UE_LOG(LogHotBrookWildlife, Display, TEXT("the shore's fallen trees: %d"), Logs.Num());
}

void AHotBrookWildlife::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!Lakes.Num()) return;
	const UWorld* World = GetWorld(); const double Now = World->GetTimeSeconds();
	const UHotBrookWater* W = World->GetSubsystem<UHotBrookWater>();
	if (Now - CensusAt > 1.0) { CensusAt = Now; Census(); }
	const APlayerController* PC = World->GetFirstPlayerController(); const APawn* Pw = PC ? PC->GetPawn() : nullptr;
	const FVector2D Me = Pw ? HotBrookCoords::ToSim(Pw->GetActorLocation()) : FVector2D::ZeroVector;
	if (Now - HerpsAt > 1.0) { HerpsAt = Now; Herpetology(Me); }
	const bool bAll = AllLife();
	const auto Ground = [&](const FVector2D& P) { float G = 0; if (W) W->GroundAt(HotBrookCoords::ToUE(P.X, P.Y, HotBrookCoords::Datum), G); return G; };
	const auto Surface = [&](const FVector2D& P, float Fallback) { float S = Fallback; if (W) W->SurfaceAt(HotBrookCoords::ToUE(P.X, P.Y, HotBrookCoords::Datum), S); return S; };
	const auto Yaw = [](float Heading) { return -FMath::RadiansToDegrees(Heading); };
	const auto Toward = [](FBird& B, const FVector2D& G, float V, float Dt) {   // (along toward a goal at V m/s, turning to it; the distance left)
		const FVector2D Dv = G - B.P; const double D = Dv.Size(); if (D < 1e-3) return 0.0;
		B.Heading = FMath::Atan2(Dv.Y, Dv.X); B.P += Dv / D * FMath::Min(D, (double)V * Dt); return FMath::Max(0.0, D - V * Dt);
	};
	for (FBird& B : Birds) {
		const FLake& L = Lakes[B.Lake]; const float Surf = HotBrookCoords::HeightToUE(L.Level), Act = bAll ? 1.f : ActNow[B.Kind];
		bool bShow = true, bGlide = false; float Z = Surf, Pitch = 0, Roll = 0;
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
			Z = Ground(B.P);
		} else if (B.Kind == Kingfisher) {
			// 0 on its limb, watching; 1 out low over the water to a fish; 2 a hover; 3 the plunge, head first; 4 under and out; 5 back to the limb
			const FVector2D PerchP = HotBrookCoords::ToSim(B.Perch);
			if (Act < 0.05f) { B.State = 0; bShow = false; }   // (roosting off the lake at night)
			if (B.State == 0) {
				Wear(B, 100 + Kingfisher); B.P = PerchP; B.Heading = -FMath::DegreesToRadians(B.PerchYaw);
				if (Now > B.Until && Act >= 0.05f) {
					FVector2D G; B.Until = Now + FMath::FRandRange(15.f, 60.f) / FMath::Max(0.2f, Act);
					if (Pick(Kingfisher, B.Lake, G, &PerchP, 15.f)) { B.Goal = G; B.State = 1; B.T0 = Now; }
				}
				B.Z = B.Perch.Z;
			} else if (B.State == 1) {
				Wear(B, Kingfisher);
				const float Hz = Surface(B.Goal, Surf) + 450.f;
				const double D = Toward(B, B.Goal, 7.f, Dt); B.Z = FMath::FInterpTo(B.Z, Hz, Dt, 2.f);
				if (D < 0.3) { B.State = FMath::FRand() < 0.5f ? 2 : 3; B.T0 = Now; B.Hover = B.Z; }
			} else if (B.State == 2) { Pitch = 35.f; if (Now - B.T0 > 2.0) { B.State = 3; B.T0 = Now; B.Hover = B.Z; } }
			else if (B.State == 3) {
				const float F = (float)FMath::Min(1.0, (Now - B.T0) / 0.45); const float S = Surface(B.P, Surf);
				B.Z = FMath::Lerp(B.Hover, S - 12.f, F * F); Pitch = -80.f; bGlide = true;
				if (F >= 1.f) { B.State = 4; B.T0 = Now; }
			} else if (B.State == 4) {
				const float S = Surface(B.P, Surf), T = (float)(Now - B.T0); B.Z = S - 12.f + FMath::Max(0.f, T - 0.35f) * 300.f; Pitch = 50.f; bShow = T > 0.35f;
				if (T > 1.1f) { B.State = 5; }
			} else if (B.State == 5) {
				const double D = Toward(B, PerchP, 6.f, Dt); B.Z = FMath::FInterpTo(B.Z, B.Perch.Z, Dt, 3.f);
				if (D < 0.05 && FMath::Abs(B.Z - B.Perch.Z) < 15.f) { B.State = 0; B.Until = Now + FMath::FRandRange(15.f, 60.f); }
			}
			Z = B.Z;
			if (B.State == 0) {
				bShow = bShow && FVector2D::Distance(B.P, Me) < DrawRadius;
				if (B.K) { B.K->SetVisibility(bShow); if (bShow) Place(B, B.Perch, B.PerchYaw); }
				continue;
			}
		} else if (B.Kind == Osprey || B.Kind == Eagle) {
			// 0 circling high (the osprey low enough to watch the water; the eagle on few beats); 1 the stoop to a fish (the osprey's a
			// hover first); 2 off the water with it and away over the woods; 3 away (a perch out of sight), back in a few minutes
			const bool bOsp = B.Kind == Osprey;
			if (Act < 0.1f && B.State != 3) { B.State = 3; B.bAway = true; B.Until = Now + 60.0; }
			if (B.State == 0) {
				if (Now > B.Until) {
					FVector2D G; B.Until = Now + FMath::FRandRange(40.f, 140.f) / FMath::Max(0.1f, Act);
					if (bOsp && FMath::FRand() < 0.6f && Pick(Osprey, B.Lake, G, &B.Centre, 60.f)) { B.State = 1; B.From = B.P; B.Goal = G; B.T0 = Now; B.Hover = B.Alt; }
					else if (Pick(B.Kind, B.Lake, G)) B.Goal = G;
				}
				B.Centre = FMath::Lerp(B.Centre, B.Goal, FMath::Min(1.f, 0.02f * Dt));   // (the circle drifts over the lake)
				B.Ang += (bOsp ? 7.f : 9.f) / B.Radius * Dt; B.P = B.Centre + FVector2D(FMath::Cos(B.Ang), FMath::Sin(B.Ang)) * B.Radius; B.Heading = B.Ang + PI / 2;
				Z = Surf + B.Alt * 100.f; Roll = -20.f;
				bGlide = FMath::Fmod(Now + B.Radius, bOsp ? 5.0 : 9.0) > (bOsp ? 1.6 : 1.5);   // (a few beats now and then)
			} else if (B.State == 1) {   // (the osprey: over it, a hover, then down feet first; the eagle: a long glide down to the surface)
				const double T = Now - B.T0, Lead = bOsp ? 6.0 : 0.0, Hov = bOsp ? 2.5 : 0.0, Drop = bOsp ? 1.3 : 5.0;
				if (T < Lead) { const float S = (float)(T / Lead); B.P = FMath::Lerp(B.From, B.Goal, S); Z = Surf + FMath::Lerp(B.Hover, 14.f, S) * 100.f; const FVector2D Dv = B.Goal - B.From; if (!Dv.IsNearlyZero()) B.Heading = FMath::Atan2(Dv.Y, Dv.X); }
				else if (T < Lead + Hov) { B.P = B.Goal; Z = Surf + 1400.f; Pitch = 25.f; }
				else {
					const float S = (float)FMath::Clamp((T - Lead - Hov) / Drop, 0.0, 1.0);
					if (!bOsp) { const FVector2D Dv = B.Goal - B.From; B.P = FMath::Lerp(B.From, B.Goal, S); if (!Dv.IsNearlyZero()) B.Heading = FMath::Atan2(Dv.Y, Dv.X); }
					Z = Surf + FMath::Lerp((bOsp ? 14.f : B.Hover) * 100.f, bOsp ? -15.f : 60.f, S * S); Pitch = bOsp ? -70.f * (1.f - FMath::Max(0.f, S - 0.8f) * 5.f) : -30.f * (1.f - S); bGlide = true;
					if (S >= 1.f) { B.State = 2; B.T0 = Now; B.From = B.Goal = B.P; B.Z = Surf; }
				}
			} else if (B.State == 2) {   // (up again with it, heavy, and off over the nearest shore to a perch in the woods)
				const double T = Now - B.T0;
				if (T < (bOsp ? 1.4 : 0.0)) { Z = Surf - 5.f; Pitch = 15.f; bGlide = true; }   // (the osprey sits a moment in its splash)
				else {
					if (B.Goal == B.From || FVector2D::Distance(B.Goal, B.P) < 1.0) {
						FVector2D S, Out; double Best = 1e18; FVector2D BestS = B.P, BestO(1, 0);
						for (int32 k = 0; k < 64; k++) { ShoreAt(L, L.Shore * k / 64.0, S, Out); const double D = FVector2D::DistSquared(S, B.P); if (D < Best) { Best = D; BestS = S; BestO = Out; } }
						B.Goal = BestS + BestO * 250.0;
					}
					Toward(B, B.Goal, bOsp ? 7.f : 8.f, Dt); B.Z = FMath::FInterpTo(B.Z < Surf ? Surf : B.Z, Surf + 3500.f, Dt, 0.4f); Z = B.Z; Pitch = 12.f;
					if (FVector2D::Distance(B.P, B.Goal) < 5.0) { B.State = 3; B.bAway = true; B.Until = Now + FMath::FRandRange(120.f, 400.f); }
				}
			} else {   // (away; then back to circling over the lake)
				bShow = false;
				if (Now > B.Until && Act >= 0.1f) { FVector2D G; if (Pick(B.Kind, B.Lake, G)) { B.Centre = B.Goal = G; } B.State = 0; B.bAway = false; B.Z = 0; B.Until = Now + FMath::FRandRange(40.f, 140.f); }
			}
		} else if (B.Kind == CMerg || B.Kind == HMerg) {
			// the group: the leader swims to a goal along the shore (slowly, close together at night); each bird dives now and then and
			// comes up again about the group
			const bool bNight = Act < 0.1f;
			if (FVector2D::Distance(B.P, B.Goal) < 2.0 || Now > B.Until) { FVector2D G; B.Goal = Pick(B.Kind, B.Lake, G, &B.P, 30.f) ? G : B.P; B.Until = Now + 120.0; }
			{ const FVector2D Dv = B.Goal - B.P; const double D = Dv.Size(); if (D > 0.01) { const float Want = FMath::Atan2(Dv.Y, Dv.X); B.Heading += FMath::FindDeltaAngleRadians(B.Heading, Want) * FMath::Min(1.f, Dt); const FVector2D Q = B.P + FVector2D(FMath::Cos(B.Heading), FMath::Sin(B.Heading)) * (bNight ? 0.08f : 0.3f) * Dt; if (InLake(L, Q)) B.P = Q; } }
			const FLook* Lk = Looks.Find(B.Kind); const float H = Lk && Lk->SM ? Lk->SM->GetBounds().BoxExtent.Z * 2.f * Lk->Scale : 40.f;
			for (FMember& M : B.Members) {
				const float K = bNight ? 0.4f : 1.f, c = FMath::Cos(B.Heading), s = FMath::Sin(B.Heading);
				const FVector2D T = B.P + FVector2D(M.Off.X * c - M.Off.Y * s, M.Off.X * s + M.Off.Y * c) * K;
				if (M.State == 0) {
					const FVector2D Dv = T - M.P; const double D = Dv.Size();
					if (D > 0.15) { M.Heading = FMath::Atan2(Dv.Y, Dv.X); M.P += Dv / D * FMath::Min(D, (0.15 + D * 0.5) * Dt); }
					else M.Heading += FMath::FindDeltaAngleRadians(M.Heading, B.Heading) * FMath::Min(1.f, Dt);
					if (Now > M.Until && !bNight) { M.State = 1; M.Until = Now + FMath::FRandRange(10.f, 25.f); }
				} else {   // (under: up again about the group)
					if (Now > M.Until) { M.State = 0; M.P = T + FVector2D(FMath::FRandRange(-2.f, 2.f), FMath::FRandRange(-2.f, 2.f)); if (!InLake(L, M.P)) M.P = T; M.Until = Now + FMath::FRandRange(15.f, 50.f) / FMath::Max(0.2f, Act); }
				}
				const bool bVis = M.State == 0 && FVector2D::Distance(M.P, Me) < DrawRadius;
				M.C->SetVisibility(bVis);
				if (bVis) {
					const float S = Surface(M.P, Surf) - 0.36f * H + 0.6f * FMath::Sin(Now * 1.1 + M.Off.Y * 3.f);   // (a third of it under: riding the water)
					M.C->SetWorldLocationAndRotation(FVector(M.P.X * 100.0, -M.P.Y * 100.0, S), FRotator(0.f, Yaw(M.Heading), 0.f)); M.C->SetWorldScale3D(FVector(Lk ? Lk->Scale : 1.f));
				}
			}
			continue;
		} else if (B.Kind == Otter) {
			// 0 swimming the shallows near the shore (its back awash, porpoising); 1 under, swimming to where it comes up; 2 on the bank, eating
			if (IceNow > 0.3f && !bAll) { bShow = false; B.State = 1; B.Until = Now + 30.0; }   // (under the ice)
			if (B.State == 0) {
				if (FVector2D::Distance(B.P, B.Goal) < 1.0 || Now > B.Until + 60.0) { FVector2D G; B.Goal = Pick(Otter, B.Lake, G, &B.P, 30.f) ? G : B.P; }
				Toward(B, B.Goal, 0.7f, Dt);
				Z = Surface(B.P, Surf) - 8.f + 3.f * FMath::Max(0.f, FMath::Sin(Now * 1.3 + B.Radius));
				if (Now > B.Until) {
					B.Until = Now + FMath::FRandRange(15.f, 40.f);
					if (FMath::FRand() < 0.2f) {   // (out on the bank to eat what it caught)
						FVector2D S, Out; ShoreAt(L, B.Arc = B.Arc + FMath::FRandRange(-30.f, 30.f), S, Out); B.Goal = S + Out * 1.2; B.State = 2; B.T0 = 0;
					} else { FVector2D G; B.Goal = Pick(Otter, B.Lake, G, &B.P, 20.f) ? G : B.P; B.From = B.P; B.State = 1; B.T0 = Now; }
				}
			} else if (B.State == 1) {
				bShow = false; const float S = (float)FMath::Clamp((Now - B.T0) / FMath::Max(1.0, B.Until - B.T0), 0.0, 1.0); B.P = FMath::Lerp(B.From, B.Goal, S);
				if (Now > B.Until) { B.State = 0; B.Until = Now + FMath::FRandRange(15.f, 40.f); }
			} else {
				if (B.T0 == 0) { if (Toward(B, B.Goal, 0.8f, Dt) < 0.1) { B.T0 = Now; B.Hover = FMath::FRandRange(15.f, 35.f); } Z = FMath::Max(Ground(B.P), Surface(B.P, Surf) - 8.f); }
				else { Z = Ground(B.P); Pitch = 8.f; if (B.K) B.K->SetPlayRate(0.f); if (Now - B.T0 > B.Hover) { if (B.K) B.K->SetPlayRate(1.f); FVector2D G; B.Goal = Pick(Otter, B.Lake, G, &B.P, 15.f) ? G : B.P; B.State = 0; B.Until = Now + 20.0; } }
			}
		} else if (B.Kind == Mink) {
			// at the water's edge, bounding along it (a few steps, a pause); now and then a short swim and a dive in the shallows
			FVector2D S, Out;
			if (B.State == 0) {
				if (Now > B.Until) {
					B.Until = Now + FMath::FRandRange(6.f, 25.f);
					if (FMath::FRand() < 0.25f) { B.State = 1; B.From = B.P; FVector2D G; B.Goal = Pick(Mink, B.Lake, G, &B.P, 6.f) ? G : B.P; B.T0 = Now; }
					else if (FMath::FRand() < 0.3f) B.Ang = -B.Ang;
				}
				const bool bPause = FMath::Fmod(Now + B.Radius, 7.0) < 2.0;
				if (!bPause) B.Arc += B.Ang * 0.9 * Dt;
				ShoreAt(L, B.Arc, S, Out); const FVector2D T = S + Out * 0.4, Dv = T - B.P;
				if (Dv.Size() > 0.01) { B.Heading = FMath::Atan2(Dv.Y, Dv.X); B.P = T; }
				const float Bound = bPause ? 0.f : FMath::Abs(FMath::Sin(Now * 7.0)) * 6.f;
				Z = Ground(B.P) + Bound; Pitch = bPause ? 0.f : 10.f * FMath::Cos(Now * 7.0);
			} else {   // (out a few metres, under a moment, back to the bank)
				const double T = Now - B.T0;
				if (T < 6.0) { Toward(B, B.Goal, 0.4f, Dt); Z = Surface(B.P, Surf) - 9.f; bShow = !(T > 4.0 && T < 5.5); }
				else { ShoreAt(L, B.Arc, S, Out); if (Toward(B, S + Out * 0.4, 0.5f, Dt) < 0.1) { B.State = 0; B.Until = Now + FMath::FRandRange(6.f, 25.f); } Z = FMath::Max(Ground(B.P), Surface(B.P, Surf) - 9.f); }
			}
		}
		bShow = bShow && FVector2D::Distance(B.P, Me) < DrawRadius;
		USceneComponent* C = B.K ? (USceneComponent*)B.K.Get() : (USceneComponent*)B.S.Get();
		if (!C) continue;
		C->SetVisibility(bShow);
		if (bShow) Place(B, FVector(B.P.X * 100.0, -B.P.Y * 100.0, Z), Yaw(B.Heading), Pitch, Roll, bGlide);
	}
	// the herps near the walker: a snapper's slow walk on the bed to another spot now and then; a bullfrog afloat at the edge, in with a
	// plop when the walker comes within a few metres (back a minute later)
	const FVector MeU = Pw ? Pw->GetActorLocation() : FVector::ZeroVector;
	for (auto& KV : Herps) {
		FHerp& H = KV.Value; const FLook* Lk = Looks.Find(H.Kind); if (!Lk || !H.C) continue;
		float Zh = 0; bool bShow = true;
		if (H.Kind == Snapper) {
			if (Now > H.Until) { H.Until = Now + FMath::FRandRange(20.f, 90.f); const FVector2D G = H.Home + FVector2D(FMath::FRandRange(-3.f, 3.f), FMath::FRandRange(-3.f, 3.f)); if (Fits(Snapper, G)) { H.State = 1; H.Goal = G; H.Heading = FMath::Atan2(G.Y - H.P.Y, G.X - H.P.X); } }
			if (H.State == 1) { const FVector2D Dv = H.Goal - H.P; const double D = Dv.Size(); if (D < 0.05) H.State = 0; else H.P += Dv / D * FMath::Min(D, 0.08 * Dt); }
			Zh = Ground(H.P);
		} else if (H.Kind == Painted || H.Kind == Frog) {
			const float Dme = FVector::Dist2D(MeU, FVector(H.P.X * 100.0, -H.P.Y * 100.0, 0)) / 100.f;
			if (H.State == 0 && Dme < (H.Kind == Painted ? 6.f : 2.f)) { H.State = 1; H.Until = Now + (H.Kind == Painted ? 120.0 : 60.0); }
			if (H.State == 1) { bShow = false; if (Now > H.Until && Dme > 8.f) H.State = 0; }
			Zh = H.Kind == Painted ? H.Z : Surface(H.P, Ground(H.P)) - 1.f;
		} else {
			const float Dme = FVector::Dist2D(MeU, FVector(H.P.X * 100.0, -H.P.Y * 100.0, 0)) / 100.f;
			if (H.State == 0 && Dme < 3.f) { H.State = 1; H.Until = Now + 60.0; }
			if (H.State == 1) { bShow = false; if (Now > H.Until && Dme > 5.f) H.State = 0; }
			Zh = Surface(H.P, Ground(H.P)) - 3.5f * H.Scale;   // (afloat, its eyes and back out)
		}
		H.C->SetVisibility(bShow);
		if (bShow) { H.C->SetWorldLocationAndRotation(FVector(H.P.X * 100.0, -H.P.Y * 100.0, Zh), FRotator(0.f, Yaw(H.Heading), 0.f)); H.C->SetWorldScale3D(FVector(H.Scale * Lk->Scale)); }
	}
}

bool AHotBrookWildlife::Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw) const
{
	double Best = 1e18;
	for (const FBird& B : Birds) {
		if (B.Kind != Kind) continue;
		if (B.Members.Num()) {
			for (const FMember& M : B.Members) {
				if (!M.C || !M.C->IsVisible()) continue;
				const double D = FVector2D::DistSquared(M.P, From); if (D >= Best) continue;
				Best = D; OutP = M.C->GetComponentLocation(); OutYaw = M.C->GetComponentRotation().Yaw;
			}
			continue;
		}
		const USceneComponent* C = B.K ? (const USceneComponent*)B.K.Get() : (const USceneComponent*)B.S.Get();
		if (!C || !C->IsVisible()) continue;
		const double D = FVector2D::DistSquared(B.P, From); if (D >= Best) continue;
		Best = D; OutP = C->GetComponentLocation(); OutYaw = C->GetComponentRotation().Yaw;
	}
	for (const auto& KV : Herps) {
		const FHerp& H = KV.Value; if (H.Kind != Kind || !H.C || !H.C->IsVisible()) continue;
		const double D = FVector2D::DistSquared(H.P, From); if (D >= Best) continue;
		Best = D; OutP = H.C->GetComponentLocation(); OutYaw = H.C->GetComponentRotation().Yaw;
	}
	return Best < 1e18;
}
