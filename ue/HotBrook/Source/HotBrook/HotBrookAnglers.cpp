#include "HotBrookAnglers.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "HotBrookWildlife.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Animation/AnimSequence.h"
#include "Engine/StaticMesh.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "GameFramework/PlayerController.h"
#include "HAL/IConsoleManager.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookAnglers, Log, All);

// (wild3view ANGLERS: boats and ice camps out at a time on [Upper, Lower] in their seasons, by day)
static constexpr float BOATS_OUT[2] = { 1.2f, 0.35f }, CAMPS_OUT[2] = { 1.2f, 0.3f };
static float Hash01(int32 A, int32 B, int32 C = 0) { return (HashCombine(HashCombine(GetTypeHash(A), GetTypeHash(B * 7919 + 13)), GetTypeHash(C * 104729 + 7)) % 100000) / 100000.f; }
static TSharedPtr<FJsonObject> ReadJson(const FString& Rel)
{
	FString Text; TSharedPtr<FJsonObject> J;
	if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), Rel)) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J)) return J;
	return nullptr;
}

AHotBrookAnglers::AHotBrookAnglers()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookAnglers::BeginPlay()
{
	Super::BeginPlay();
	for (TActorIterator<AHotBrookWildlife> It(GetWorld()); It; ++It) { Wild = *It; break; }
	// the lakes (Import/lakes.json) — Upper the higher — and the camps' docks on each (Import/camps/camps_parts.json): where boats set out
	if (TSharedPtr<FJsonObject> J = ReadJson(TEXT("Import/lakes.json"))) {
		for (const TSharedPtr<FJsonValue>& V : J->GetArrayField(TEXT("lakes"))) {
			const TSharedPtr<FJsonObject> O = V->AsObject(); FLake L; L.Level = (float)O->GetNumberField(TEXT("level")); L.Box.Init();
			for (const TSharedPtr<FJsonValue>& Q : O->GetArrayField(TEXT("pts"))) { const TArray<TSharedPtr<FJsonValue>>& XY = Q->AsArray(); const FVector2D P(XY[0]->AsNumber(), XY[1]->AsNumber()); L.Pts.Add(P); L.Box += P; }
			if (L.Pts.Num() > 2) Lakes.Add(L);
		}
		if (Lakes.Num()) { int32 Hi = 0; for (int32 l = 1; l < Lakes.Num(); l++) if (Lakes[l].Level > Lakes[Hi].Level) Hi = l; Lakes[Hi].bUpper = true; }
	}
	if (TSharedPtr<FJsonObject> J = ReadJson(TEXT("Import/camps/camps_parts.json"))) {
		const TSharedPtr<FJsonObject>* D = nullptr;
		if (J->TryGetObjectField(TEXT("docks"), D)) for (const auto& KV : (*D)->Values) {
			const TSharedPtr<FJsonObject> O = KV.Value->AsObject(); const TArray<TSharedPtr<FJsonValue>>& A = O->GetArrayField(TEXT("anchor")), & Dir = O->GetArrayField(TEXT("dir"));
			const FVector2D At(A[0]->AsNumber(), A[1]->AsNumber()), Dv(Dir[0]->AsNumber(), Dir[1]->AsNumber()); const double Len = O->GetNumberField(TEXT("len"));
			const FVector2D Off = At + Dv * (Len + 3.0);   // (past the dock's end)
			for (FLake& L : Lakes) if (InLake(L, Off)) { L.Docks.Add(Off); L.DockDir.Add(Dv); break; }
		}
	}
	// the people (Import/creatures_meshes.json: the meshes and their clips) and their things
	const TSharedPtr<FJsonObject> M = ReadJson(TEXT("Import/creatures_meshes.json"));
	const auto Person = [&](const TCHAR* Name, FPerson& P, const TCHAR* Hand, float Pelvis, float Scale) {
		const TSharedPtr<FJsonObject>* E = nullptr; if (!M || !M->TryGetObjectField(Name, E)) return;
		P.Mesh = LoadObject<USkeletalMesh>(nullptr, *(*E)->GetStringField(TEXT("mesh"))); P.Hand = Hand; P.Pelvis = Pelvis; P.Scale = Scale;
		const TSharedPtr<FJsonObject>* C = nullptr;
		if ((*E)->TryGetObjectField(TEXT("clips"), C)) for (const auto& KV : (*C)->Values) if (UAnimSequence* A = LoadObject<UAnimSequence>(nullptr, *KV.Value->AsString())) { P.Clips.Add(FString(KV.Key), A); Held.Add(A); }
		Held.Add(P.Mesh);
	};
	Person(TEXT("angler_summer"), Summer, TEXT("rp_nathan_animated_003_walking_hand_r"), 94.4f, 1.f);   // (Nathan: 1.87 m, his hip 0.944 m up)
	Person(TEXT("angler_winter"), Winter, TEXT("hand_r"), 81.7f, 1.1f);   // (the scan stands 1.59 m: a man of 1.75 in his boots)
	const auto Mesh = [&](const TCHAR* N) { UStaticMesh* S = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HotBrook/Camps/Meshes/SM_%s.SM_%s"), N, N)); if (S) Held.Add(S); return S; };
	Skiff = Mesh(TEXT("boat_skiff_running")); Bucket = Mesh(TEXT("ice_bucket_white")); Sled = Mesh(TEXT("ice_sled")); Hole = Mesh(TEXT("ice_hole"));
	Tipup = Mesh(TEXT("ice_tipup")); TipupFlag = Mesh(TEXT("ice_tipup_flag"));
	for (const TCHAR* N : { TEXT("ice_shelter_red"), TEXT("ice_shelter_blue"), TEXT("ice_shelter_black") }) if (UStaticMesh* S = Mesh(N)) Shelters.Add(S);
	if (M) { const TSharedPtr<FJsonObject>* E = nullptr; if (M->TryGetObjectField(TEXT("rod"), E)) { RodMesh = LoadObject<UStaticMesh>(nullptr, *(*E)->GetStringField(TEXT("mesh"))); Held.Add(RodMesh); } }
	Held.Remove(nullptr);
	int32 ND = 0; for (const FLake& L : Lakes) ND += L.Docks.Num();
	UE_LOG(LogHotBrookAnglers, Display, TEXT("anglers: %d lakes, %d docks to set out from; summer %s (%d clips), winter %s (%d clips), skiff %s, ice camp %s"), Lakes.Num(), ND,
		Summer.Mesh ? TEXT("in") : TEXT("missing"), Summer.Clips.Num(), Winter.Mesh ? TEXT("in") : TEXT("missing"), Winter.Clips.Num(), Skiff ? TEXT("in") : TEXT("missing"), Shelters.Num() ? TEXT("in") : TEXT("missing"));
}

bool AHotBrookAnglers::InLake(const FLake& L, const FVector2D& P) const
{
	if (!L.Box.IsInside(P)) return false;
	bool bIn = false;
	for (int32 i = 0, j = L.Pts.Num() - 1; i < L.Pts.Num(); j = i++) {
		const FVector2D& a = L.Pts[i], & b = L.Pts[j];
		if ((a.Y > P.Y) != (b.Y > P.Y) && P.X < (b.X - a.X) * (P.Y - a.Y) / (b.Y - a.Y) + a.X) bIn = !bIn;
	}
	return bIn;
}

float AHotBrookAnglers::Depth(const FVector2D& P) const
{
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>(); float S = 0, G = 0;
	const FVector Q = HotBrookCoords::ToUE(P.X, P.Y, HotBrookCoords::Datum);
	return W && W->SurfaceAt(Q, S) && W->GroundAt(Q, G) ? (S - G) / 100.f : -1.f;
}

float AHotBrookAnglers::ShoreDist(const FLake& L, const FVector2D& P) const
{
	double Best = 1e18;
	for (int32 i = 0; i < L.Pts.Num(); i++) {
		const FVector2D& a = L.Pts[i], & b = L.Pts[(i + 1) % L.Pts.Num()]; const FVector2D ab = b - a;
		const double t = FMath::Clamp(FVector2D::DotProduct(P - a, ab) / FMath::Max(1e-9, ab.SizeSquared()), 0.0, 1.0);
		Best = FMath::Min(Best, FVector2D::DistSquared(P, a + ab * t));
	}
	return (float)FMath::Sqrt(Best);
}

bool AHotBrookAnglers::Spot(int32 Lake, FVector2D& Out, const FVector2D* Near) const
{
	// a bass spot: 1.2–3.5 m of water, 3–25 m off the shore (wild3view's SPOTS); near the last one when moving on
	const FLake& L = Lakes[Lake];
	for (int32 t = 0; t < 300; t++) {
		const FVector2D Q = Near ? *Near + FVector2D(FMath::FRandRange(-120.f, 120.f), FMath::FRandRange(-120.f, 120.f)) : FVector2D(FMath::FRandRange(L.Box.Min.X, L.Box.Max.X), FMath::FRandRange(L.Box.Min.Y, L.Box.Max.Y));
		if (!InLake(L, Q)) continue;
		const float D = Depth(Q); if (D < 1.2f || D > 3.5f) continue;
		const float S = ShoreDist(L, Q); if (S < 3.f || S > 25.f) continue;
		Out = Q; return true;
	}
	return false;
}

USkeletalMeshComponent* AHotBrookAnglers::NewMan(const FPerson& P)
{
	USkeletalMeshComponent* C = NewObject<USkeletalMeshComponent>(this);
	C->SetSkeletalMesh(P.Mesh); C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	C->bAffectDistanceFieldLighting = false; C->bAffectDynamicIndirectLighting = false;
	C->VisibilityBasedAnimTickOption = EVisibilityBasedAnimTickOption::OnlyTickPoseWhenRendered;
	C->SetupAttachment(RootComponent); C->RegisterComponent();
	return C;
}

UStaticMeshComponent* AHotBrookAnglers::NewStatic(UStaticMesh* M)
{
	UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
	C->SetStaticMesh(M); C->SetMobility(EComponentMobility::Movable); C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	C->bAffectDistanceFieldLighting = false; C->bAffectDynamicIndirectLighting = false;
	C->SetupAttachment(RootComponent); C->RegisterComponent();
	return C;
}

void AHotBrookAnglers::Play(USkeletalMeshComponent* C, FString& Now, const FPerson& P, const TCHAR* Clip, bool bLoop)
{
	if (!C || Now == Clip) return;
	const TObjectPtr<UAnimSequence>* A = P.Clips.Find(Clip); if (!A) return;
	C->PlayAnimation(*A, bLoop); Now = Clip;
}

void AHotBrookAnglers::HoldRod(USkeletalMeshComponent* Man, const FPerson& P, UStaticMeshComponent* Rod, float PitchDeg, float Reach)
{
	// the rod in his right hand: its grip in the fist, a third of a metre of butt behind it, pointing the way he faces raised by Pitch
	if (!Man || !Rod) return;
	const FVector Hand = Man->GetSocketLocation(P.Hand);
	const FRotator Facing = Man->GetComponentRotation();
	const FVector Dir = FRotator(PitchDeg, Facing.Yaw, 0.f).Vector();   // (the men face +X in their own frame, as every skinned model here)
	Rod->SetWorldLocationAndRotation(Hand - Dir * 35.f * Reach, Dir.Rotation()); Rod->SetWorldScale3D(FVector(Reach));
}

void AHotBrookAnglers::Census()
{
	if (!Wild || !Lakes.Num()) return;
	const IConsoleVariable* CV = IConsoleManager::Get().FindConsoleVariable(TEXT("hb.AllLife")); const int32 All = CV ? CV->GetInt() : 0; const bool bAll = All != 0;   // (2: the ice camps too, on open water — a look in summer)
	const int32 Day = FMath::FloorToInt(Wild->Year() * 365.f);
	const float Ice = Wild->Ice();
	// the boats: in their season (the sim's angler count), by day, on open water; each lake its number (a fraction on that share of days)
	const bool bBoats = (Wild->Count(11) > 0.f && Wild->Activity(11) >= 0.5f && Ice < 0.05f) || bAll;
	const bool bCamps = (Wild->Count(12) > 0.f && Wild->Activity(12) >= 0.5f && Ice >= 0.2f) || (bAll && Ice >= 0.05f) || All == 2;
	for (int32 l = 0; l < Lakes.Num(); l++) {
		const int32 k = Lakes[l].bUpper ? 0 : 1;
		const float WantB = bBoats ? BOATS_OUT[k] : 0.f, WantC = bCamps ? CAMPS_OUT[k] : 0.f;
		const int32 NB = FMath::FloorToInt(WantB) + (Hash01(Day, 11, l) < WantB - FMath::FloorToFloat(WantB) ? 1 : 0) + (bAll && WantB > 0 ? 1 : 0);
		const int32 NC = FMath::FloorToInt(WantC) + (Hash01(Day, 12, l) < WantC - FMath::FloorToFloat(WantC) ? 1 : 0) + (bAll && WantC > 0 ? 1 : 0);
		int32 HaveB = 0; for (const FBoat& B : Boats) HaveB += B.Lake == l && B.State != 3;
		for (; HaveB < NB; HaveB++) Launch(l);
		for (FBoat& B : Boats) if (B.Lake == l && HaveB > NB && B.State != 3) { B.State = 3; HaveB--; }   // (heading home)
		int32 HaveC = 0; for (const FCamp& C : Camps) HaveC += C.Lake == l;
		for (; HaveC < NC; HaveC++) Pitch(l);
		for (int32 i = Camps.Num() - 1; i >= 0 && HaveC > NC; i--) if (Camps[i].Lake == l) {
			FCamp& C = Camps[i];
			for (UStaticMeshComponent* X : { C.Shelter.Get(), C.Bucket.Get(), C.Sled.Get(), C.Hole.Get(), C.Rod.Get() }) if (X) X->DestroyComponent();
			for (UStaticMeshComponent* X : C.TipC) if (X) X->DestroyComponent(); if (C.Man) C.Man->DestroyComponent();
			Camps.RemoveAt(i); HaveC--;
		}
	}
}

void AHotBrookAnglers::Launch(int32 Lake)
{
	if (!Skiff || !Summer.Mesh) return;
	FLake& L = Lakes[Lake]; FBoat B; B.Lake = Lake;
	// from one of the lake's docks (the day's draw), else from open water by the shore
	if (L.Docks.Num()) { const int32 i = FMath::RandRange(0, L.Docks.Num() - 1); B.Home = L.Docks[i]; B.Heading = FMath::Atan2(L.DockDir[i].Y, L.DockDir[i].X); }
	else if (!Spot(Lake, B.Home)) return;
	B.P = B.Home; if (!Spot(Lake, B.Goal, &B.P) && !Spot(Lake, B.Goal)) return;
	B.Hull = NewStatic(Skiff); B.Man = NewMan(Summer);
	if (RodMesh) B.Rod = NewStatic(RodMesh);
	B.State = 0; Boats.Add(B);
}

void AHotBrookAnglers::Pitch(int32 Lake)
{
	if (!Shelters.Num() || !Winter.Mesh) return;
	FLake& L = Lakes[Lake];
	// over the perch holes: the deepest of a few hundred spots in the lake (the day's), the tip-ups along the 1–3-m water nearest it
	FVector2D Best(0, 0); float BestD = -1.f;
	for (int32 t = 0; t < 300; t++) { const FVector2D Q(FMath::FRandRange(L.Box.Min.X, L.Box.Max.X), FMath::FRandRange(L.Box.Min.Y, L.Box.Max.Y)); if (!InLake(L, Q)) continue; const float D = Depth(Q); if (D > BestD) { BestD = D; Best = Q; } }
	if (BestD < 1.f) return;
	FCamp C; C.Lake = Lake; C.P = Best + FVector2D(FMath::FRandRange(-20.f, 20.f), FMath::FRandRange(-20.f, 20.f)); if (!InLake(L, C.P)) C.P = Best;
	C.Heading = FMath::FRandRange(0.f, 2.f * PI);
	for (int32 t = 0; t < 600 && C.Tips.Num() < 5; t++) {
		const FVector2D Q = C.P + FVector2D(FMath::FRandRange(-200.f, 200.f), FMath::FRandRange(-200.f, 200.f));
		if (!InLake(L, Q)) continue; const float D = Depth(Q); if (D < 1.f || D > 3.f) continue;
		bool bFar = true; for (const FVector2D& T : C.Tips) bFar &= FVector2D::Distance(T, Q) > 15.0;
		if (bFar) C.Tips.Add(Q);
	}
	C.Shelter = NewStatic(Shelters[FMath::RandRange(0, Shelters.Num() - 1)]);
	C.Bucket = NewStatic(Bucket); C.Sled = NewStatic(Sled); C.Hole = NewStatic(Hole); C.Man = NewMan(Winter);
	if (RodMesh) C.Rod = NewStatic(RodMesh);
	for (int32 i = 0; i < C.Tips.Num(); i++) C.TipC.Add(NewStatic(Tipup));
	Camps.Add(C);
}

void AHotBrookAnglers::Strike(FBoat& B)
{
	// a fish on: reeling it in a while (the smallmouth let go, a perch kept — the sim decided which)
	B.FishOn = GetWorld()->GetTimeSeconds() + FMath::FRandRange(12.f, 30.f);
}

void AHotBrookAnglers::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!Lakes.Num()) return;
	const UWorld* World = GetWorld(); const double Now = World->GetTimeSeconds();
	const UHotBrookWater* W = World->GetSubsystem<UHotBrookWater>();
	if (Now - CensusAt > 2.0) { CensusAt = Now; Census(); }
	const APlayerController* PC = World->GetFirstPlayerController(); const APawn* Pw = PC ? PC->GetPawn() : nullptr;
	const FVector2D Me = Pw ? HotBrookCoords::ToSim(Pw->GetActorLocation()) : FVector2D::ZeroVector;
	// the fish the sim's anglers took: a fish on for the nearest boat (open water) or a flag up at the nearest camp (the ice)
	if (Wild) {
		for (const FVector& T : Wild->AnglerTakes) {
			const FVector2D P(T.X, T.Y); const bool bIce = T.Z > 11.5f;
			if (!bIce) { FBoat* Best = nullptr; double BD = 400.0; for (FBoat& B : Boats) { const double D = FVector2D::Distance(B.P, P); if (D < BD && B.State == 1) { BD = D; Best = &B; } } if (Best) Strike(*Best); }
			else { FCamp* Best = nullptr; double BD = 500.0; for (FCamp& C : Camps) { const double D = FVector2D::Distance(C.P, P); if (D < BD) { BD = D; Best = &C; } } if (Best && Best->Tips.Num()) { Best->Flag = FMath::RandRange(0, Best->Tips.Num() - 1); Best->FlagUntil = Now + FMath::FRandRange(40.f, 90.f); } }
		}
		Wild->AnglerTakes.Reset();
	}
	const float WindFrom = 3.93f;   // (the drift: the prevailing wind's way when the link's isn't to hand)
	for (int32 i = Boats.Num() - 1; i >= 0; i--) {
		FBoat& B = Boats[i]; const FLake& L = Lakes[B.Lake]; const float Surf = HotBrookCoords::HeightToUE(L.Level);
		// 0 motoring out to the spot; 1 fishing it, drifting; 2 moving on to the next; 3 home to the dock, and gone
		if (B.State == 0 || B.State == 2 || B.State == 3) {
			const FVector2D G = B.State == 3 ? B.Home : B.Goal, Dv = G - B.P; const double D = Dv.Size();
			const float Want = FMath::Atan2(Dv.Y, Dv.X); B.Heading += FMath::Clamp(FMath::FindDeltaAngleRadians(B.Heading, Want), -0.6f * Dt, 0.6f * Dt);
			B.Speed = FMath::FInterpTo(B.Speed, D > 15.0 ? 4.5f : FMath::Max(0.8f, (float)D * 0.3f), Dt, 0.8f);
			const FVector2D Q = B.P + FVector2D(FMath::Cos(B.Heading), FMath::Sin(B.Heading)) * B.Speed * Dt;
			if (InLake(L, Q) || D < 6.0) B.P = Q; else B.Heading += 0.5f * Dt;
			if (D < 2.0) {
				if (B.State == 3) { if (B.Hull) B.Hull->DestroyComponent(); if (B.Man) B.Man->DestroyComponent(); if (B.Rod) B.Rod->DestroyComponent(); Boats.RemoveAt(i); continue; }
				B.State = 1; B.Speed = 0; B.Until = Now + FMath::FRandRange(900.f, 1800.f); B.ClipAt = Now + FMath::FRandRange(5.f, 20.f);
				B.Side = ShoreDist(L, B.P + FVector2D(-FMath::Sin(B.Heading), FMath::Cos(B.Heading)) * 10.f) < ShoreDist(L, B.P - FVector2D(-FMath::Sin(B.Heading), FMath::Cos(B.Heading)) * 10.f) ? 1.f : -1.f;   // (the shore's side: cast toward it)
			}
		} else if (B.State == 1) {
			// drifting on the wind (a few cm a second), the angler casting toward the shore every half minute or so and reeling it back
			B.P += FVector2D(-FMath::Sin(WindFrom), -FMath::Cos(WindFrom)) * 0.04f * Dt; B.Speed = 0;
			if (Now > B.Until) { FVector2D G; if (Spot(B.Lake, G, &B.P)) { B.Goal = G; B.State = 2; } else B.Until = Now + 600.0; }
		}
		const bool bShow = FVector2D::Distance(B.P, Me) < DrawRadius;
		if (B.Hull) B.Hull->SetVisibility(bShow); if (B.Man) B.Man->SetVisibility(bShow); if (B.Rod) B.Rod->SetVisibility(bShow && B.State == 1);
		if (!bShow) continue;
		float S = Surf; if (W) W->SurfaceAt(HotBrookCoords::ToUE(B.P.X, B.P.Y, HotBrookCoords::Datum), S);
		const float Ph = (float)(Now * 1.3 + i * 2.1), Run = FMath::Clamp(B.Speed / 4.5f, 0.f, 1.f);
		const FRotator HullR(4.f * Run + 0.6f * FMath::Sin(Ph * 0.8f), -FMath::RadiansToDegrees(B.Heading), 0.8f * FMath::Sin(Ph));
		const FVector At(B.P.X * 100.0, -B.P.Y * 100.0, S - 3.f + 1.5f * FMath::Sin(Ph * 1.1f));
		B.Hull->SetWorldLocationAndRotation(At, HullR);
		// the angler on the stern thwart (x −1.6 m, its top 0.24 m over the water), his hips a hand over it; turned to the shore to fish
		B.Turn = FMath::FInterpTo(B.Turn, B.State == 1 ? 70.f * B.Side : 0.f, Dt, 1.5f);
		const FVector Seat = At + HullR.RotateVector(FVector(-160.f, 0.f, 34.f - Summer.Pelvis));
		// (turned on the seat toward the shore: the shore's side on his left (B.Side 1) a turn to the left — UE's yaw down)
		B.Man->SetWorldLocationAndRotation(Seat, FRotator(HullR.Pitch, HullR.Yaw - B.Turn, HullR.Roll));
		float RodPitch = 30.f;
		if (B.State == 1) {
			if (Now < B.FishOn) { Play(B.Man, B.Clip, Summer, TEXT("reel"), true); RodPitch = 55.f + 8.f * FMath::Sin(Now * 3.0); }
			else if (Now > B.ClipAt) {
				const double T = Now - B.ClipAt;
				if (T < 1.2) { Play(B.Man, B.Clip, Summer, TEXT("cast"), false); RodPitch = T < 0.4 ? FMath::Lerp(30.f, 100.f, (float)T / 0.4f) : T < 0.6 ? FMath::Lerp(100.f, 10.f, (float)(T - 0.4) / 0.2f) : 10.f; }
				else if (T < 9.0) { Play(B.Man, B.Clip, Summer, TEXT("reel"), true); RodPitch = 20.f; }
				else { Play(B.Man, B.Clip, Summer, TEXT("sit"), true); B.ClipAt = Now + FMath::FRandRange(15.f, 40.f); }
			} else Play(B.Man, B.Clip, Summer, TEXT("sit"), true);
		} else Play(B.Man, B.Clip, Summer, TEXT("sit"), true);
		HoldRod(B.Man, Summer, B.Rod, RodPitch, 1.f);
	}
	for (FCamp& C : Camps) {
		const FLake& L = Lakes[C.Lake]; const float Ice = HotBrookCoords::HeightToUE(L.Level) + 2.f;
		const bool bShow = FVector2D::Distance(C.P, Me) < DrawRadius;
		const FVector2D Fw(FMath::Cos(C.Heading), FMath::Sin(C.Heading)), Sd(-Fw.Y, Fw.X);
		const auto UE = [&](const FVector2D& P, float Z) { return FVector(P.X * 100.0, -P.Y * 100.0, Ice + Z); };
		const float Yaw = -FMath::RadiansToDegrees(C.Heading);
		// the shelter; beside it the sled; before its door the jigger on his bucket over his hole
		const FVector2D Door = C.P + Fw * 1.6, BucketP = Door + Sd * 0.6, HoleP = BucketP + Fw * 0.65;
		C.Shelter->SetWorldLocationAndRotation(UE(C.P, 0.f), FRotator(0.f, Yaw, 0.f));
		C.Sled->SetWorldLocationAndRotation(UE(C.P - Sd * 1.6 + Fw * 0.4, 0.f), FRotator(0.f, Yaw + 80.f, 0.f));
		C.Bucket->SetWorldLocationAndRotation(UE(BucketP, 0.f), FRotator::ZeroRotator);
		C.Hole->SetWorldLocationAndRotation(UE(HoleP, 0.f), FRotator::ZeroRotator);
		if (C.Man) {
			C.Man->SetWorldLocationAndRotation(UE(BucketP, 39.f + 10.f - Winter.Pelvis * Winter.Scale), FRotator(0.f, Yaw, 0.f)); C.Man->SetWorldScale3D(FVector(Winter.Scale));
			Play(C.Man, C.Clip, Winter, TEXT("jig"), true);
			const float J = C.Man->GetPosition(); const float Lift = J < 0.2f ? J / 0.2f : J < 0.4f ? 1.f - (J - 0.2f) / 0.2f : 0.f;
			HoldRod(C.Man, Winter, C.Rod, -25.f + 18.f * Lift, 0.36f);
		}
		for (int32 t = 0; t < C.TipC.Num(); t++) {
			const bool bFlag = t == C.Flag && Now < C.FlagUntil;
			if (C.TipC[t]->GetStaticMesh() != (bFlag ? TipupFlag : Tipup)) C.TipC[t]->SetStaticMesh(bFlag ? TipupFlag.Get() : Tipup.Get());
			C.TipC[t]->SetWorldLocationAndRotation(UE(C.Tips[t], 0.f), FRotator(0.f, Yaw + 37.f * t, 0.f)); C.TipC[t]->SetVisibility(bShow);
		}
		for (UPrimitiveComponent* X : TArray<UPrimitiveComponent*>{ C.Shelter.Get(), C.Bucket.Get(), C.Sled.Get(), C.Hole.Get(), C.Rod.Get(), C.Man.Get() }) if (X) X->SetVisibility(bShow);
	}
}

bool AHotBrookAnglers::Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw) const
{
	double Best = 1e18;
	// (by their places — one out of sight isn't moved, its components left where they were)
	const auto At = [&](const FVector2D& P, int32 Lake) { return FVector(P.X * 100.0, -P.Y * 100.0, Lakes.IsValidIndex(Lake) ? HotBrookCoords::HeightToUE(Lakes[Lake].Level) : 0.f); };
	if (Kind == 0) for (const FBoat& B : Boats) { const double D = FVector2D::DistSquared(B.P, From); if (D < Best) { Best = D; OutP = At(B.P, B.Lake); OutYaw = -FMath::RadiansToDegrees(B.Heading); } }
	else for (const FCamp& C : Camps) { const double D = FVector2D::DistSquared(C.P, From); if (D < Best) { Best = D; OutP = At(C.P, C.Lake); OutYaw = -FMath::RadiansToDegrees(C.Heading); } }
	return Best < 1e18;
}
