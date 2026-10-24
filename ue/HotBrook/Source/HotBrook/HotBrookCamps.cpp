#include "HotBrookCamps.h"
#include "HotBrookLink.h"
#include "HotBrookWater.h"
#include "HotBrookCoords.h"
#include "HAL/IConsoleManager.h"
#include "Components/StaticMeshComponent.h"
#include "ProceduralMeshComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/HierarchicalInstancedStaticMeshComponent.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Materials/MaterialParameterCollection.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"
#include "Dom/JsonObject.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookCamps, Log, All);

static TAutoConsoleVariable<int32> CVarOccupied(TEXT("hb.Occupied"), -1, TEXT("the camps lived in: -1 by the calendar (camps3.js), 0 none, 1 every one (a look at their lights)"));
static TAutoConsoleVariable<int32> CVarDocksIn(TEXT("hb.DocksIn"), -1, TEXT("the camps' docks: -1 by the date (in May 25 - Oct 15), 0 out, 1 in"));

// (camps3.js: the docks are in from May 25 to October 15 — the year's fraction from March 1)
static constexpr float DOCK_IN = (31 + 30 + 24) / 365.f, DOCK_OUT = (31 + 30 + 31 + 30 + 31 + 31 + 30 + 14) / 365.f;
// (camps3.js: the share of seasonal camps lived in on a day, by month from March; a year-round home's)
static constexpr float OCC_MONTH[12] = { 0, 0, 0.1f, 0.4f, 0.75f, 0.75f, 0.35f, 0.1f, 0, 0, 0, 0 }, OCC_YEARROUND = 0.85f;
// (camps3.js / camps3view.js hash(a, b): the same draw as the browser's, so the same camps are lived in)
static double JsHash(int32 A, int32 B)
{
	uint32 H = ((uint32)A ^ 0x9e3779b9u) * 0x85ebca6bu ^ ((uint32)B + 0x6b43a9b5u) * 0xc2b2ae35u;
	H ^= H >> 15; H *= 0x2c1b3c6du; H ^= H >> 12; return H / 4294967296.0;
}

AHotBrookCamps::AHotBrookCamps()
{
	PrimaryActorTick.bCanEverTick = true;   // (the boats' bob; the date — a dock's season — once a second)
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root")); RootComponent->SetMobility(EComponentMobility::Static);
}

UStaticMeshComponent* AHotBrookCamps::Stand(const FString& Name, FVector At, bool bMovable, const FString& Path, float Yaw, bool bFlip, float Pitch, float Roll)
{
	UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, Path.IsEmpty() ? *FString::Printf(TEXT("/Game/HotBrook/Camps/Meshes/SM_%s.SM_%s"), *Name, *Name) : *Path);
	if (!M) return nullptr;
	Held.AddUnique(M);
	UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this);
	C->SetStaticMesh(M); C->SetMobility(bMovable ? EComponentMobility::Movable : EComponentMobility::Static); C->SetupAttachment(RootComponent);
	if (bMovable) { C->bAffectDistanceFieldLighting = false; C->bAffectDynamicIndirectLighting = false; }   // (moving: out of Lumen's scene)
	C->SetCollisionProfileName(TEXT("BlockAll"));
	if (bFlip) { const FBoxSphereBounds Bd = M->GetBounds(); At.Z += Bd.Origin.Z + Bd.BoxExtent.Z; }   // (upside down, resting on its gunwales)
	C->SetWorldLocationAndRotation(At, FRotator(Pitch, Yaw, (bFlip ? 180.f : 0.f) + Roll)); C->RegisterComponent();
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
	for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Link = *It; break; }
	TSharedPtr<FJsonObject> CJ; { FString T2; if (FFileHelper::LoadFileToString(T2, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("camps.json")))) FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(T2), CJ); }
	TMap<FString, TSharedPtr<FJsonObject>> ById, DockByJ;
	if (CJ.IsValid()) {
		for (const TSharedPtr<FJsonValue>& V : CJ->GetArrayField(TEXT("buildings"))) ById.Add(V->AsObject()->GetStringField(TEXT("id")), V->AsObject());
		for (const TSharedPtr<FJsonValue>& V : CJ->GetArrayField(TEXT("docks"))) DockByJ.Add(FString::Printf(TEXT("dock_%d"), (int32)V->AsObject()->GetNumberField(TEXT("j"))), V->AsObject());
	}
	// the buildings: the floor over the highest corner, at most 2.6 m over the lowest (camps3view's place())
	struct FFoot { FVector2D C, U, V; int32 Ci = -1; bool bHome = false; };   // (each box of a building — its centre and half-axes, the sim's metres; bHome a home's first)
	const auto InFoot = [](const FFoot& F, const FVector2D& P, double M) { const FVector2D D = P - F.C; const double u = F.U.Size(), v = F.V.Size();
		return FMath::Abs(FVector2D::DotProduct(D, F.U) / FMath::Max(u, 1e-3)) <= u + M && FMath::Abs(FVector2D::DotProduct(D, F.V) / FMath::Max(v, 1e-3)) <= v + M; };
	TArray<FFoot> Feet;
	for (const auto& KV : J->GetObjectField(TEXT("buildings"))->Values) {
		const TSharedPtr<FJsonObject> B = KV.Value->AsObject(); const TArray<TSharedPtr<FJsonValue>>& A = B->GetArrayField(TEXT("anchor"));
		float GMin = 1e9f, GMax = -1e9f;
		for (const TSharedPtr<FJsonValue>& P : B->GetArrayField(TEXT("probes"))) {
			const TArray<TSharedPtr<FJsonValue>>& Q = P->AsArray(); float G = 0;
			if (W->GroundAt(FVector(Q[0]->AsNumber() * 100.0, -Q[1]->AsNumber() * 100.0, 0.0), G)) { GMin = FMath::Min(GMin, G); GMax = FMath::Max(GMax, G); }
		}
		if (GMin > GMax) { Missing++; continue; }
		const float F = FMath::Min(GMax + 30.f, GMin + 260.f);
		UStaticMeshComponent* C = Stand(FString(KV.Key), FVector(A[0]->AsNumber() * 100.0, -A[1]->AsNumber() * 100.0, F));
		if (!C) { Missing++; continue; }
		NBuild++;
		// (a home — not a shed or a garage: its windows lit by night when it is lived in; its porch lamp)
		const TSharedPtr<FJsonObject>* Bi = ById.Find(FString(KV.Key)); const FString Type = B->GetStringField(TEXT("type"));
		{ const TArray<TSharedPtr<FJsonValue>>& Pr = B->GetArrayField(TEXT("probes"));   // (each box: its corners −u−v, −u+v, +u−v, +u+v, then its centre)
			const auto Q = [&](int32 i) { const TArray<TSharedPtr<FJsonValue>>& XY = Pr[i]->AsArray(); return FVector2D(XY[0]->AsNumber(), XY[1]->AsNumber()); };
			for (int32 b = 0; b + 4 < Pr.Num(); b += 5) {
				FFoot Ft; Ft.C = Q(b + 4); Ft.U = (Q(b + 2) - Q(b)) / 2; Ft.V = (Q(b + 1) - Q(b)) / 2;
				Ft.bHome = b == 0 && Bi && (*Bi)->GetBoolField(TEXT("home")) && Type != TEXT("shed") && Type != TEXT("garage");
				if (Bi) Ft.Ci = (int32)(*Bi)->GetNumberField(TEXT("ci"));
				Feet.Add(Ft);
			}
		}
		if (Bi && (*Bi)->GetBoolField(TEXT("home")) && Type != TEXT("shed") && Type != TEXT("garage")) {
			FHome H; H.Ci = (int32)(*Bi)->GetNumberField(TEXT("ci")); H.bYr = (*Bi)->GetBoolField(TEXT("yr")); H.bAll = (*Bi)->GetBoolField(TEXT("lampAll"));
			H.K = 0.7f + 0.6f * (float)JsHash(H.Ci, 9);
			for (int32 i = 0; i < C->GetNumMaterials(); i++) if (UMaterialInterface* Mi = C->GetMaterial(i)) if (Mi->GetName().Contains(TEXT("Glass"))) { H.Glass = C->CreateDynamicMaterialInstance(i); break; }
			const TArray<TSharedPtr<FJsonValue>>* Lp = nullptr;
			if ((*Bi)->TryGetArrayField(TEXT("lamp"), Lp) && Lp->Num() >= 3) { H.Lamp = FVector((*Lp)[0]->AsNumber() * 100.0, -(*Lp)[1]->AsNumber() * 100.0, F + (*Lp)[2]->AsNumber() * 100.0); H.bLamp = true; }
			Homes.Add(H);
		}
	}
	// the docks: their deck ~0.35 m over the lake two metres out from where they meet the water
	for (const auto& KV : J->GetObjectField(TEXT("docks"))->Values) {
		const TSharedPtr<FJsonObject> D = KV.Value->AsObject(); const TArray<TSharedPtr<FJsonValue>>& A = D->GetArrayField(TEXT("anchor")), &Dir = D->GetArrayField(TEXT("dir"));
		const FVector Mid((A[0]->AsNumber() + Dir[0]->AsNumber() * 2.0) * 100.0, -(A[1]->AsNumber() + Dir[1]->AsNumber() * 2.0) * 100.0, 0.0);
		float S = 0; if (!W->SurfaceAt(Mid, S)) { Missing++; continue; }
		if (UStaticMeshComponent* C = Stand(FString(KV.Key), FVector(A[0]->AsNumber() * 100.0, -A[1]->AsNumber() * 100.0, S + 35.f))) Docks.Add(C); else Missing++;
	}
	// the boats: alongside (afloat), on the dock's deck or on the bank — a canoe turned over, as one is stored. The pontoon boat is the
	// BoatUS Foundation's (Import/vehicles: convert_creatures.py HB_SET=vehicles); at one long dock (7 m or more) in five the skiff is
	// their 20-ft bass boat instead — hauled out, not turned over on the bank, in the off-season
	const auto Vehicle = [](const TCHAR* N) { return FString::Printf(TEXT("/Game/HotBrook/Vehicles/%s/SM_%s.SM_%s"), N, N, N); };
	TSet<FString> BassDocks;
	if (const TArray<TSharedPtr<FJsonValue>>* BA; J->TryGetArrayField(TEXT("boats"), BA))
		for (const TSharedPtr<FJsonValue>& V : *BA) {
			const TSharedPtr<FJsonObject> B = V->AsObject(); const FString Mesh = B->GetStringField(TEXT("mesh")), On = B->GetStringField(TEXT("on"));
			const TArray<TSharedPtr<FJsonValue>>& XY = B->GetArrayField(TEXT("xy")); const double X = XY[0]->AsNumber(), Yy = XY[1]->AsNumber();
			const FVector P0(X * 100.0, -Yy * 100.0, 0.0); float S = 0, G = 0; bool bFlip = false; B->TryGetBoolField(TEXT("flip"), bFlip);
			const bool bFloat = On == TEXT("water");
			float Z;
			if (On == TEXT("bank")) { if (!W->GroundAt(P0, G)) { Missing++; continue; } Z = G; }
			else { if (!W->SurfaceAt(P0, S)) { if (!W->GroundAt(P0, G)) { Missing++; continue; } S = G; } Z = bFloat ? S : S + 35.f; }
			const FString Dk = B->GetStringField(TEXT("dock")); const TSharedPtr<FJsonObject>* DkJ = DockByJ.Find(Dk);
			const bool bBass = Mesh.StartsWith(TEXT("boat_skiff")) && DkJ && (*DkJ)->GetNumberField(TEXT("len")) >= 7.0 && JsHash(FCString::Atoi(*Dk.Mid(5)), 41) < 0.2;
			const FString Path = Mesh == TEXT("canoe") ? FString(TEXT("/Game/HotBrook/Models/canoe/SM_canoe.SM_canoe")) : Mesh == TEXT("boat_pontoon") ? Vehicle(TEXT("pontoon")) : bBass ? Vehicle(TEXT("bass_boat")) : FString();
			const float Yaw = -FMath::RadiansToDegrees(B->GetNumberField(TEXT("yaw")));
			UStaticMeshComponent* C = Stand(Mesh, FVector(P0.X, P0.Y, Z), bFloat, Path, Yaw, bFlip);
			if (C && bBass) BassDocks.Add(Dk);
			if (!C && Path.StartsWith(TEXT("/Game/HotBrook/Vehicles/"))) C = Stand(Mesh, FVector(P0.X, P0.Y, Z), bFloat, FString(), Yaw, bFlip);   // (not imported: the procedural one)
			if (!C) { Missing++; continue; }
			Boats.Add(C); BoatAt.Add({ C->GetComponentLocation(), Yaw, FMath::FRand() * 6.28f, bFloat, On == TEXT("bank") });
		}
	// out of season: each dock's sections stacked on the bank (up to four: 2.4 m of deck each, as wide as the dock), its skiff turned
	// over beside them; a canoe kept on the dock's deck turned over on the bank by them
	TMap<FString, FString> SkiffOf, DeckCanoe;
	if (const TArray<TSharedPtr<FJsonValue>>* BA; J->TryGetArrayField(TEXT("boats"), BA))
		for (const TSharedPtr<FJsonValue>& V : *BA) {
			const TSharedPtr<FJsonObject> B = V->AsObject(); const FString Mesh = B->GetStringField(TEXT("mesh")), Dk = B->GetStringField(TEXT("dock"));
			if (Mesh.StartsWith(TEXT("boat_skiff")) && !BassDocks.Contains(Dk)) SkiffOf.Add(Dk, Mesh);
			else if (B->GetStringField(TEXT("on")) == TEXT("deck")) DeckCanoe.Add(Dk, Mesh);
		}
	for (const auto& KV : DockByJ) {
		const TSharedPtr<FJsonObject> D = KV.Value; const bool bAlu = D->GetBoolField(TEXT("alu")); const double Len = D->GetNumberField(TEXT("len")), Hw = D->GetNumberField(TEXT("hw"));
		const TArray<TSharedPtr<FJsonValue>>& St = D->GetArrayField(TEXT("store")), & Fl = D->GetArrayField(TEXT("flip")), & Dir = D->GetArrayField(TEXT("dir"));
		const FVector Sp(St[0]->AsNumber() * 100.0, -St[1]->AsNumber() * 100.0, 0.0); float G = 0; if (!W->GroundAt(Sp, G)) continue;
		const int32 Ns = FMath::Min(4, FMath::CeilToInt((Len + 1.2) / 3.0)), Jn = (int32)D->GetNumberField(TEXT("j"));
		for (int32 k = 0; k < Ns; k++) {
			const float Yaw = -FMath::RadiansToDegrees(St[2]->AsNumber() + (JsHash(Jn, k) - 0.5) * 0.12);
			if (UStaticMeshComponent* C = Stand(bAlu ? TEXT("dock_section_alu") : TEXT("dock_section_wood"), FVector(Sp.X, Sp.Y, G + 2.f + k * 16.f), false, FString(), Yaw)) {
				C->SetWorldScale3D(FVector(1.0, 2.0 * Hw, 1.0)); Stored.Add(C);
			}
		}
		if (const FString* Sk = SkiffOf.Find(KV.Key)) {
			const FVector Fp(Fl[0]->AsNumber() * 100.0, -Fl[1]->AsNumber() * 100.0, 0.0); float Gf = 0;
			if (W->GroundAt(Fp, Gf)) if (UStaticMeshComponent* C = Stand(*Sk, FVector(Fp.X, Fp.Y, Gf), false, FString(), -FMath::RadiansToDegrees(Fl[2]->AsNumber()), true)) Stored.Add(C);
		}
		if (const FString* Cn = DeckCanoe.Find(KV.Key)) {
			const FVector2D Mid((St[0]->AsNumber() + Fl[0]->AsNumber()) / 2 - Dir[0]->AsNumber() * 1.5, (St[1]->AsNumber() + Fl[1]->AsNumber()) / 2 - Dir[1]->AsNumber() * 1.5);
			const FVector Cp(Mid.X * 100.0, -Mid.Y * 100.0, 0.0); float Gc = 0; const bool bCanoe = *Cn == TEXT("canoe");
			if (W->GroundAt(Cp, Gc)) if (UStaticMeshComponent* C = Stand(*Cn, FVector(Cp.X, Cp.Y, Gc), false, bCanoe ? FString(TEXT("/Game/HotBrook/Models/canoe/SM_canoe.SM_canoe")) : FString(), -FMath::RadiansToDegrees(St[2]->AsNumber()), bCanoe)) Stored.Add(C);
		}
	}
	for (UStaticMeshComponent* C : Stored) C->SetVisibility(false);
	// a side-by-side UTV (the human's download, Import/vehicles 'utv') parked in a quarter of the camps' yards, all year: beside the
	// home's first box, 2.2 m off a wall and along it, where its footprint is the camp's cleared ground (no trees), dry, within 40 cm
	// of level and its wheels and middle 0.6 m clear of every box of every building (a porch, a deck, a shed); laid on the ground
	// under its wheels
	int32 NUtv = 0; TSet<int32> UtvCamps;
	for (const FFoot& Ft : Feet) {
		if (!Ft.bHome || Ft.Ci < 0 || UtvCamps.Contains(Ft.Ci) || JsHash(Ft.Ci, 31) >= 0.25) continue;
		const FVector2D Un = Ft.U.GetSafeNormal(), Vn = Ft.V.GetSafeNormal(); const double Hu = Ft.U.Size(), Hv = Ft.V.Size();
		for (const auto& [Dir, Off] : { TPair<FVector2D, double>(Vn, Hv), TPair<FVector2D, double>(-Vn, Hv), TPair<FVector2D, double>(Un, Hu), TPair<FVector2D, double>(-Un, Hu) }) {
			const FVector2D Along(-Dir.Y, Dir.X), P = Ft.C + Dir * (Off + 2.2) + Along * ((JsHash(Ft.Ci, 33) - 0.5) * 2.0);
			bool bOk = true; float Gc[4]; FVector Wh[4];
			for (int32 k = 0; k < 4 && bOk; k++) {   // (its wheels: ±1.4 m along, ±0.7 across)
				const FVector2D Q = P + Along * ((k & 1) ? 1.4 : -1.4) + Dir * ((k & 2) ? 0.7 : -0.7); const FVector Qu(Q.X * 100.0, -Q.Y * 100.0, 0.0); float S;
				bOk = W->ClearedAt(Qu) && !W->SurfaceAt(Qu, S) && W->GroundAt(Qu, Gc[k]); Wh[k] = FVector(Qu.X, Qu.Y, Gc[k]);
			}
			if (!bOk || FMath::Max(FMath::Max(Gc[0], Gc[1]), FMath::Max(Gc[2], Gc[3])) - FMath::Min(FMath::Min(Gc[0], Gc[1]), FMath::Min(Gc[2], Gc[3])) > 40.f) continue;
			for (const FFoot& O : Feet) {
				if (InFoot(O, P, 0.6)) { bOk = false; break; }
				for (int32 k = 0; k < 4 && bOk; k++) if (InFoot(O, P + Along * ((k & 1) ? 1.4 : -1.4) + Dir * ((k & 2) ? 0.7 : -0.7), 0.6)) bOk = false;
				if (!bOk) break;
			}
			if (!bOk) continue;
			// (its front toward +Along, or turned round; laid on the plane of the ground under its wheels)
			const FVector Fwd = ((Wh[1] + Wh[3]) - (Wh[0] + Wh[2])) * (JsHash(Ft.Ci, 35) < 0.5 ? 0.5 : -0.5), Side = (Wh[2] + Wh[3]) - (Wh[0] + Wh[1]);
			FVector Up = FVector::CrossProduct(Fwd, Side).GetSafeNormal(); if (Up.Z < 0) Up = -Up;
			const FRotator R = FRotationMatrix::MakeFromXZ(Fwd, Up).Rotator();
			if (!Stand(TEXT("utv"), (Wh[0] + Wh[1] + Wh[2] + Wh[3]) / 4.0, false, Vehicle(TEXT("utv")), R.Yaw, false, R.Pitch, R.Roll)) break;
			UE_LOG(LogHotBrookCamps, Display, TEXT("camps: a UTV at (%.1f, %.1f)"), P.X, P.Y);
			UtvCamps.Add(Ft.Ci); NUtv++; break;
		}
	}
	if (NUtv) UE_LOG(LogHotBrookCamps, Display, TEXT("camps: %d UTVs parked in the yards"), NUtv);
	LayRoads();
	if (CJ.IsValid()) LayLawns(CJ);
	UE_LOG(LogHotBrookCamps, Display, TEXT("camps: %d buildings (%d homes), %d docks, %d boats standing; %d things stored on the banks out of season%s"), NBuild, Homes.Num(), Docks.Num(), Boats.Num(), Stored.Num(), Missing ? *FString::Printf(TEXT(" (%d not: no mesh or no ground)"), Missing) : TEXT(""));
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
	if (T > LightsAt) { LightsAt = T + 0.5; Lights(); }
	if (T < SeasonAt) return;
	SeasonAt = T + 1.0;   // (the season: once a second)
	if (LawnGrass.Num()) {   // (the lawns' grass under the snow: hidden while it lies — MPC_HB_Season 'Snow', AHotBrookLink's)
		static UMaterialParameterCollection* Season = LoadObject<UMaterialParameterCollection>(nullptr, TEXT("/Game/HotBrook/Materials/MPC_HB_Season.MPC_HB_Season"));
		const bool bShow = !Season || UKismetMaterialLibrary::GetScalarParameterValue(this, Season, TEXT("Snow")) < 0.5f;
		if (bShow != bGrassShown) { bGrassShown = bShow; for (UHierarchicalInstancedStaticMeshComponent* C : LawnGrass) if (C) C->SetVisibility(bShow); }
	}
	float Yf = 0.3f; for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Yf = It->YearFrac; break; }
	const int32 Force = CVarDocksIn.GetValueOnGameThread(), In = Force >= 0 ? (Force ? 1 : 0) : (Yf >= DOCK_IN && Yf < DOCK_OUT ? 1 : 0);
	if (In == DocksIn) return;
	DocksIn = In;
	for (UStaticMeshComponent* C : Docks) { C->SetVisibility(In == 1); C->SetCollisionEnabled(In ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision); }
	for (int32 i = 0; i < Boats.Num(); i++) {
		UStaticMeshComponent* C = Boats[i]; const bool bBank = BoatAt[i].bBank;   // (a canoe or kayak kept on the bank stays all year)
		const bool bShow = In == 1 || bBank;
		C->SetVisibility(bShow); C->SetCollisionEnabled(bShow ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision);
	}
	for (UStaticMeshComponent* C : Stored) { C->SetVisibility(In == 0); C->SetCollisionEnabled(In == 0 ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision); }
}

void AHotBrookCamps::Lights()
{
	// by night (the sun under ~9°), in the camps lived in today, until each one's bedtime (camps3view lights())
	if (!Link || !Homes.Num()) return;
	const float Sun = Link->Daylight, Tod = Link->TimeOfDay, Yf = Link->YearFrac;
	const float N = FMath::Clamp((0.16f - Sun) / 0.12f, 0.f, 1.f);
	const int32 Day = (int32)FMath::FloorToDouble(Link->SimTime / 86400.0);
	if (Day != OccDay) {
		OccDay = Day; Occ.SetNumZeroed(Homes.Num());
		const int32 M = FMath::Min(11, FMath::FloorToInt(Yf * 12.f)), Wk = ((Day % 7) + 7) % 7; const bool bWeekend = Wk == 0 || Wk == 6;
		const float Share = FMath::Min(0.98f, OCC_MONTH[M] * (bWeekend ? 14.f / 9.f : 7.f / 9.f));
		for (int32 i = 0; i < Homes.Num(); i++) Occ[i] = JsHash(Homes[i].Ci + 1, Day) < (Homes[i].bYr ? OCC_YEARROUND : Share) ? 1 : 0;
	}
	const int32 Force = CVarOccupied.GetValueOnGameThread();   // (hb.Occupied: every camp lived in, or none — a look)
	const auto Awake = [&](int32 Seed, bool bEarly) { const double Bed = 0.91 + 0.12 * JsHash(Seed, 21); return Tod >= 0.5 ? Tod < Bed : (Bed > 1.0 && Tod < Bed - 1.0) || (bEarly && Tod > 0.22); };
	for (int32 i = 0; i < Homes.Num(); i++) {
		FHome& H = Homes[i]; const bool bOcc = Force >= 0 ? Force != 0 : Occ.IsValidIndex(i) && Occ[i];
		const bool bWin = N > 0.f && bOcc && Awake(H.Ci * 3, JsHash(H.Ci, 23) < 0.3);
		if (H.Glass) H.Glass->SetScalarParameterValue(TEXT("LampOn"), bWin ? 6.f * N * H.K : 0.f);
		const bool bLamp = H.bLamp && N > 0.3f && bOcc && (H.bAll || Awake(H.Ci * 3 + 1, false));
		if (bLamp && !H.Light) {
			UPointLightComponent* L = NewObject<UPointLightComponent>(this); L->SetupAttachment(RootComponent); L->SetMobility(EComponentMobility::Movable);
			L->SetIntensityUnits(ELightUnits::Lumens); L->SetIntensity(450.f); L->SetAttenuationRadius(900.f); L->SetLightColor(FLinearColor(1.f, 0.66f, 0.38f));
			L->SetCastShadows(false); L->SetSourceRadius(4.f); L->SetWorldLocation(H.Lamp); L->RegisterComponent(); H.Light = L;
		}
		if (H.Light) H.Light->SetVisibility(bLamp);
	}
}

void AHotBrookCamps::LayLawns(const TSharedPtr<FJsonObject>& J)
{
	// each mapped lawn a disc of its area (a ragged edge), mown grass draped on the ground — on the land only (export_camps.mjs's discs;
	// their ground already cleared of trees and the ground cover); and on it the grass itself (Cosmic_dust's lawn patch, 35 cm, ~8 a
	// square metre, Nanite, drawn within 45 m) with a fringe of taller unmown tufts along its edge — hidden under the winter's snow
	const TArray<TSharedPtr<FJsonValue>>* LA = nullptr; if (!J->TryGetArrayField(TEXT("lawns"), LA) || !LA->Num()) return;
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	Lawns = NewObject<UProceduralMeshComponent>(this); Lawns->SetupAttachment(RootComponent); Lawns->SetMobility(EComponentMobility::Static);
	Lawns->bAffectDistanceFieldLighting = false; Lawns->SetCollisionEnabled(ECollisionEnabled::NoCollision); Lawns->RegisterComponent();
	UMaterialInterface* Mat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Camps/Materials/MI_HB_Lawn.MI_HB_Lawn"));
	const double Step = 1.0; int32 Sec = 0; double Area = 0;   // (a metre: the landscape's own 2-m grid followed closely enough)
	const auto Grass = [&](const TCHAR* N, float CullM) -> UHierarchicalInstancedStaticMeshComponent* {
		UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HotBrook/Plants/%s/SM_%s.SM_%s"), N, N, N)); if (!M) return nullptr; Held.AddUnique(M);
		UHierarchicalInstancedStaticMeshComponent* C = NewObject<UHierarchicalInstancedStaticMeshComponent>(this); C->SetStaticMesh(M); C->SetMobility(EComponentMobility::Static);
		C->SetCollisionEnabled(ECollisionEnabled::NoCollision); C->SetCullDistances(0, (int32)(CullM * 100.f)); C->bAffectDistanceFieldLighting = false; C->SetCastShadow(false);
		C->SetupAttachment(RootComponent); C->RegisterComponent(); LawnGrass.Add(C); return C; };
	UHierarchicalInstancedStaticMeshComponent* Mown = Grass(TEXT("grass_lawn"), 45.f), *Tuft = Grass(TEXT("grass_tuft_b"), 60.f);
	TArray<FTransform> MownT, TuftT;
	for (const TSharedPtr<FJsonValue>& LV : *LA) {
		const TSharedPtr<FJsonObject> L = LV->AsObject(); const double X0 = L->GetNumberField(TEXT("x")), Y0 = L->GetNumberField(TEXT("y")), R = L->GetNumberField(TEXT("r"));
		const int32 Nh = FMath::CeilToInt(R * 1.2 / Step), Nd = 2 * Nh + 1; const double Ph = X0 * 0.37 + Y0 * 0.11;
		TArray<int32> Idx; Idx.Init(-1, Nd * Nd);
		TArray<FVector> V, Nr; TArray<FVector2D> UV; TArray<FLinearColor> Col; TArray<FProcMeshTangent> Tn; TArray<int32> I;
		for (int32 r = 0; r < Nd; r++) for (int32 q = 0; q < Nd; q++) {
			double X = X0 + (q - Nh) * Step, Y = Y0 + (r - Nh) * Step; const double A = FMath::Atan2(Y - Y0, X - X0), Dc = FMath::Sqrt(FMath::Square(X - X0) + FMath::Square(Y - Y0));
			const double Edge = R * (0.92 + 0.08 * FMath::Sin(3.0 * A + Ph) + 0.06 * FMath::Sin(7.0 * A + 2.0 * Ph));   // (its edge ragged, not a circle)
			// (the points just outside drawn in onto the edge — a smooth rim, not the grid's steps — and sunk there into the ground)
			const bool bRim = Dc > Edge; if (Dc > Edge + Step * 1.5) continue;
			if (bRim) { X = X0 + (X - X0) * Edge / Dc; Y = Y0 + (Y - Y0) * Edge / Dc; }
			const FVector P = HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum); float G = 0, S = 0;
			if (W->SurfaceAt(P, S) || !W->GroundAt(P, G)) continue;
			float Gx = 0, Gy = 0; W->GroundAt(P + FVector(100, 0, 0), Gx); W->GroundAt(P + FVector(0, 100, 0), Gy);
			Idx[r * Nd + q] = V.Num();
			V.Add(FVector(P.X, P.Y, G + (bRim ? -3.f : 8.f))); Nr.Add(FVector(-(Gx - G) / 100.f, -(Gy - G) / 100.f, 1.f).GetSafeNormal()); UV.Add(FVector2D(X, -Y)); Col.Add(FLinearColor::White); Tn.Add(FProcMeshTangent(1, 0, 0));
		}
		for (int32 r = 0; r + 1 < Nd; r++) for (int32 q = 0; q + 1 < Nd; q++) {
			const int32 a = Idx[r * Nd + q], b = Idx[r * Nd + q + 1], c = Idx[(r + 1) * Nd + q], e = Idx[(r + 1) * Nd + q + 1];
			if (a < 0 || b < 0 || c < 0 || e < 0) continue;
			I.Append({ a, b, e, a, e, c }); Area += Step * Step;   // (wound to face up: as the roads, their cross product down in UE's frame)
		}
		if (!I.Num()) continue;
		Lawns->CreateMeshSection_LinearColor(Sec, V, I, Nr, UV, Col, Tn, false); if (Mat) Lawns->SetMaterial(Sec, Mat); Sec++;
		// the grass: jittered on a 35-cm grid inside the ragged edge, its base in the lawn's sheet (8 cm over the ground); the tufts every
		// ~0.8 m along the edge, a little either side of it
		FRandomStream Rs((int32)(X0 * 131.0 + Y0 * 17.0));
		for (double gy = -R; gy <= R; gy += 0.35) for (double gx = -R; gx <= R; gx += 0.35) {
			const double X = X0 + gx + Rs.FRandRange(-0.15, 0.15), Y = Y0 + gy + Rs.FRandRange(-0.15, 0.15), A = FMath::Atan2(Y - Y0, X - X0), Dc = FMath::Sqrt(FMath::Square(X - X0) + FMath::Square(Y - Y0));
			const double Edge = R * (0.92 + 0.08 * FMath::Sin(3.0 * A + Ph) + 0.06 * FMath::Sin(7.0 * A + 2.0 * Ph)); if (Dc > Edge - 0.2) continue;
			const FVector P = HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum); float G = 0, S = 0; if (W->SurfaceAt(P, S) || !W->GroundAt(P, G)) continue;
			MownT.Add(FTransform(FRotator(0.f, Rs.FRand() * 360.f, 0.f), FVector(P.X, P.Y, G + 5.f), FVector(Rs.FRandRange(0.9f, 1.3f), Rs.FRandRange(0.9f, 1.3f), Rs.FRandRange(0.8f, 1.2f))));
		}
		for (double a = 0; a < 2 * PI; a += 0.8 / FMath::Max(1.0, R)) {
			const double Edge = R * (0.92 + 0.08 * FMath::Sin(3.0 * a + Ph) + 0.06 * FMath::Sin(7.0 * a + 2.0 * Ph)) + Rs.FRandRange(-0.4, 0.6);
			const FVector P = HotBrookCoords::ToUE(X0 + Edge * FMath::Cos(a), Y0 + Edge * FMath::Sin(a), HotBrookCoords::Datum); float G = 0, S = 0; if (W->SurfaceAt(P, S) || !W->GroundAt(P, G)) continue;
			TuftT.Add(FTransform(FRotator(0.f, Rs.FRand() * 360.f, 0.f), FVector(P.X, P.Y, G), FVector(Rs.FRandRange(0.7f, 1.2f))));
		}
	}
	if (Mown && MownT.Num()) Mown->AddInstances(MownT, false, true);
	if (Tuft && TuftT.Num()) Tuft->AddInstances(TuftT, false, true);
	UE_LOG(LogHotBrookCamps, Display, TEXT("lawns: %d, %.0f m2; %d grass patches, %d tufts at their edges"), Sec, Area, MownT.Num(), TuftT.Num());
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
