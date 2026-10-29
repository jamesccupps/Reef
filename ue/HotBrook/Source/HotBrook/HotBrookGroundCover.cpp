#include "HotBrookGroundCover.h"
#include "HotBrookCoords.h"
#include "HotBrookForest.h"
#include "HotBrookWater.h"
#include "HotBrookLink.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Materials/MaterialParameterCollection.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Components/InstancedSkinnedMeshComponent.h"
#include "Animation/TransformProviderData.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "GameFramework/PlayerController.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookGround, Log, All);

// THE KINDS — the floor of the mixed woods about the lakes as the Forest Inventory measures Maine's (docs/research_notes/Maine forest
// structure/forest_layers_and_crowns.md, FIA P2 vegetation): ferns ~15 % of the ground, forbs ~22 %, graminoids ~9 % (most in the
// open), low shrubs (0–0.6 m) ~17 %; under closed spruce–fir the herbs < 10 % (the conifer lean); downed logs ~580 a hectare (here
// the ~300 big enough to see from the path); the lakeshore's band of sweetgale and leatherleaf > 80 % cover, a few metres wide.
// Amount: for plants the share of the ground they cover at full weight (turned into plants a square metre by their meshes' size and
// the share of the floor their patches take); for stones, rocks and logs the count a square metre. Patches: the colonies' size (m)
// and the share of the floor in them. Weights: under a closed canopy, in the open, the lean to conifer (+1) or hardwood (−1)
// stands, within the shore band (m) of the water. The STONES by the sim's substrate (UHotBrookWater::SubstrateAt — the bed's boulder–
// cobble and gravel from each spot's wave exposure, the shore above the waterline as the water beside it): on a bank, a stone kind's
// shore weight × (0.2 + 2.5 × how stony the water there is), so a boulder shore is strewn and a sandy cove or a muck shore bare; and
// in the water, on a stony bed under 2.5 m, the stones and boulders (and the small stones 3–8 times their size), some breaking the
// surface — their material (import_megascans.py's M_MS_Rock) bare, grey-brown with algae, below the lake's level, mossy above it.
struct AHotBrookGroundCover::FKind
{
	const TCHAR* Source;   // ("MS:" a Megascans scan by its name in megascans_meshes.json, "MP:" a Megaplants plant in groundcover_meshes.json)
	int32 Ring; float Amount; bool bCover; float Patch, PatchCover, Forest, Open, Conifer, Shore, ShoreBand, ScaleMin, ScaleMax, CullM;
	bool bRock;            // (tilted to the ground, sunk a quarter into it, the walker can't pass the big ones)
	bool bLying;           // (laid down along the ground: the fallen logs; no wind)
	bool bWaterOnly = false;   // (only in the water: the shallows' boulders)
};
namespace { constexpr double RING_CELL[3] = { 32.0, 32.0, 128.0 }; constexpr float RING_M[3] = { 80.f, 160.f, 400.f }; }   // (the far ring's rocks are few: big cells, few components)

static const AHotBrookGroundCover::FKind KINDS[] = {
	//  source                ring amount  cover? patch pcov  forest open conif shore band  scale       cull   rock   lying
	{ TEXT("MS:LadyFern"),       1, 0.09f,   true, 20.f, 0.30f, 1.f, 0.5f, -0.6f, 0.3f, 10.f, 0.7f, 1.3f, 140.f, false, false },
	{ TEXT("MS:BeechFern"),      1, 0.06f,   true, 12.f, 0.25f, 1.f, 0.3f, -0.5f, 0.f,  0.f,  0.8f, 1.2f, 120.f, false, false },
	{ TEXT("MP:WoodAnemone"),    0, 0.15f,   true, 10.f, 0.35f, 1.f, 0.6f, -0.7f, 0.f,  0.f,  0.8f, 1.2f,  60.f, false, false },
	{ TEXT("MP:Bilberry"),       1, 0.10f,   true, 15.f, 0.30f, 0.7f, 1.f, 0.4f, 0.3f,  8.f,  0.8f, 1.3f, 120.f, false, false },
	{ TEXT("MP:Lingonberry"),    0, 0.04f,   true,  8.f, 0.20f, 0.6f, 0.6f, 0.8f, 0.f,  0.f,  1.3f, 2.0f,  60.f, false, false },
	{ TEXT("MS:WildGrassA"),     0, 0.015f,  true,  6.f, 0.50f, 1.f, 15.f, 0.f, 15.f,  4.f,  0.8f, 1.2f,  70.f, false, false },
	{ TEXT("MS:WildGrassB"),     0, 0.010f,  true,  6.f, 0.50f, 1.f, 15.f, 0.f, 15.f,  4.f,  0.8f, 1.2f,  70.f, false, false },
	{ TEXT("MS:WheatGrass"),     0, 0.005f,  true,  8.f, 0.40f, 1.f, 15.f, 0.f, 10.f,  4.f,  0.8f, 1.2f,  70.f, false, false },
	{ TEXT("MP:ShoreShrub"),     1, 0.05f,   true,  6.f, 0.80f, 0.f, 0.f,  0.f, 16.f,  3.f,  0.8f, 1.4f, 160.f, false, false },
	{ TEXT("MS:BoleteMushrooms"),0, 0.02f,  false,  5.f, 0.30f, 1.f, 0.f,  0.3f, 0.f,  0.f,  0.8f, 1.5f,  30.f, false, false },
	{ TEXT("MS:SmallStones"),    0, 0.3f,   false, 10.f, 0.50f, 1.f, 1.f,  0.f, 3.f,   4.f,  0.6f, 2.0f,  50.f, true,  false },
	{ TEXT("MP:Log"),            1, 0.03f,  false, 25.f, 0.70f, 1.f, 0.2f, 0.3f, 0.f,  0.f,  0.3f, 1.0f, 160.f, false, true  },
	{ TEXT("MS:MossyForestRock"),2, 0.012f, false, 40.f, 0.60f, 1.f, 0.5f, 0.f, 3.f,   8.f,  0.6f, 3.0f, 450.f, true,  false },
	{ TEXT("MS:MossyRocks"),     2, 0.0015f,false, 50.f, 0.50f, 1.f, 0.6f, 0.f, 4.f,   6.f,  0.6f, 1.5f, 350.f, true,  false },
	{ TEXT("MS:MossyEmbankment"),2, 0.0008f,false, 60.f, 0.50f, 1.f, 0.3f, 0.f, 2.f,   6.f,  0.7f, 1.4f, 300.f, true,  false },
	{ TEXT("MS:SmallStones"),    1, 0.0045f,false, 30.f, 0.55f, 0.f, 0.f,  0.f, 2.f,   0.f,  3.0f, 8.0f, 220.f, true,  false, true },   // (the shallows' boulders: ~3 a 100 m² on a stony bed)
};
static constexpr int32 NKINDS = UE_ARRAY_COUNT(KINDS);

// (a smooth value noise of the plane, 0–1, at a scale in metres: the patches)
static float ValueNoise(double X, double Y, double S, uint32 Seed)
{
	const double u = X / S, v = Y / S; const int32 i = FMath::FloorToInt(u), j = FMath::FloorToInt(v); const double a = u - i, b = v - j;
	const auto H = [Seed](int32 q, int32 r) { uint32 h = (uint32)q * 73856093u ^ (uint32)r * 19349663u ^ Seed * 83492791u; h ^= h >> 13; h *= 0x5bd1e995u; h ^= h >> 15; return (h & 0xFFFFFF) / 16777215.0; };
	const double sa = a * a * (3 - 2 * a), sb = b * b * (3 - 2 * b);
	return (float)FMath::Lerp(FMath::Lerp(H(i, j), H(i + 1, j), sa), FMath::Lerp(H(i, j + 1), H(i + 1, j + 1), sa), sb);
}

AHotBrookGroundCover::AHotBrookGroundCover()
{
	PrimaryActorTick.bCanEverTick = true; PrimaryActorTick.TickInterval = 0.2f;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	RootComponent->SetMobility(EComponentMobility::Static);
}

void AHotBrookGroundCover::LoadMeshes()
{
	// the two manifests: { name: { "kind", "meshes": [ { "path", … } ] } } (the scans) and { name: [ path, … ] } (the Megaplants' plants)
	TMap<FString, TArray<FString>> Paths;
	FString Text; TSharedPtr<FJsonObject> J;
	if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("megascans_meshes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid())
		for (const auto& KV : J->Values) for (const TSharedPtr<FJsonValue>& M : KV.Value->AsObject()->GetArrayField(TEXT("meshes"))) Paths.FindOrAdd(FString(TEXT("MS:")) + KV.Key).Add(M->AsObject()->GetStringField(TEXT("path")));
	J.Reset();
	if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("groundcover_meshes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid())
		for (const auto& KV : J->Values) for (const TSharedPtr<FJsonValue>& P : KV.Value->AsArray()) Paths.FindOrAdd(FString(TEXT("MP:")) + KV.Key).Add(P->AsString());
	KindMeshes.SetNum(NKINDS); KindDensity.Init(0.f, NKINDS); int32 NOk = 0;
	for (int32 k = 0; k < NKINDS; k++) {
		for (const FString& P : Paths.FindRef(KINDS[k].Source)) {
			UObject* A = LoadObject<UObject>(nullptr, *P); FMesh M;
			FBoxSphereBounds B;
			if (UStaticMesh* S = Cast<UStaticMesh>(A)) { B = S->GetBounds(); M.Static = S; }
			else if (USkeletalMesh* K = Cast<USkeletalMesh>(A)) { B = K->GetBounds(); M.Skel = K; }
			else continue;
			M.Height = FMath::Max(1.0, B.Origin.Z + B.BoxExtent.Z);
			M.Footprint = FMath::Max(0.005, 4.0 * B.BoxExtent.X * B.BoxExtent.Y / 1e4 * 0.5);   // (m² of ground under it: its box, half filled)
			KindMeshes[k].Add(M); Held.Add(A);
		}
		NOk += KindMeshes[k].Num() > 0;
		// (plants a square metre inside the patches: the cover over the patches' share and the mean plant's footprint at its mean scale)
		float Foot = 0; for (const FMesh& M : KindMeshes[k]) Foot += M.Footprint; Foot = KindMeshes[k].Num() ? Foot / KindMeshes[k].Num() : 1.f;
		const float S2 = FMath::Square(0.5f * (KINDS[k].ScaleMin + KINDS[k].ScaleMax));
		KindDensity[k] = KINDS[k].bCover ? KINDS[k].Amount / FMath::Max(0.05f, KINDS[k].PatchCover) / (Foot * S2) : KINDS[k].Amount / FMath::Max(0.05f, KINDS[k].PatchCover);
		if (KindMeshes[k].Num()) UE_LOG(LogHotBrookGround, Display, TEXT("  %s: %d meshes, %.2f a m2 in its patches"), KINDS[k].Source, KindMeshes[k].Num(), KindDensity[k]);
	}
	if (UClass* WC = FindObject<UClass>(nullptr, TEXT("/Script/DynamicWind.DynamicWindData"))) Wind = NewObject<UTransformProviderData>(this, WC);
	UE_LOG(LogHotBrookGround, Display, TEXT("ground cover: %d of %d kinds have meshes"), NOk, NKINDS);
}

void AHotBrookGroundCover::BeginPlay()
{
	Super::BeginPlay();
	Water = GetWorld()->GetSubsystem<UHotBrookWater>();
	for (TActorIterator<AHotBrookForest> It(GetWorld()); It; ++It) { Forest = *It; break; }
	LoadMeshes();
	bReady = Water && Water->IsLoaded();
	if (!bReady) UE_LOG(LogHotBrookGround, Warning, TEXT("no heightmap (Import/heightmap.r16): no ground cover"));
}

float AHotBrookGroundCover::NearWater(const FVector2D& S, float Within) const
{
	// (the nearest water among sixteen bearings at four distances — coarse, but the water grid is 5 m)
	float Z, Best = Within + 1.f;
	for (int32 d = 1; d <= 4; d++) {
		const float R = Within * d / 4.f; if (R >= Best) break;
		for (int32 a = 0; a < 16; a++) {
			const double t = a * PI / 8.0;
			if (Water->SurfaceAt(HotBrookCoords::ToUE(S.X + R * FMath::Cos(t), S.Y + R * FMath::Sin(t), HotBrookCoords::Datum), Z)) { Best = R; break; }
		}
	}
	return Best > Within ? 0.f : 1.f - Best / Within;
}

void AHotBrookGroundCover::MakeCell(int32 Ring, int32 CX, int32 CY)
{
	const int64 Key = ((int64)Ring << 48) | ((int64)(CY + 32768) << 24) | (int64)(CX + 32768);
	TArray<TObjectPtr<UPrimitiveComponent>>& Out = Live.Add(Key);
	const double CELL = RING_CELL[Ring], X0 = CX * CELL, Y0 = CY * CELL;
	// the cell's stand: canopy trees and conifers within ~24 m of its middle (the forest's own trees)
	int32 NCan = 0, NCon = 0; if (Forest) Forest->CanopyAt(FVector2D(X0 + CELL / 2, Y0 + CELL / 2), 24.f, NCan, NCon);
	const float Closed = FMath::Clamp(NCan / (PI * 24.f * 24.f / 1e4f) / 350.f, 0.f, 1.f);   // (a closed canopy at ~350 stems a hectare)
	const float ConShare = NCan ? (float)NCon / NCan : 0.5f;
	float Zc; const bool bNearAny = NearWater(FVector2D(X0 + CELL / 2, Y0 + CELL / 2), (float)CELL * 0.75f + 10.f) > 0.f || Water->SurfaceAt(HotBrookCoords::ToUE(X0 + CELL / 2, Y0 + CELL / 2, HotBrookCoords::Datum), Zc);
	TMap<int64, UPrimitiveComponent*> ByMesh;
	for (int32 k = 0; k < NKINDS; k++) {
		const FKind& K = KINDS[k]; if (K.Ring != Ring || !KindMeshes[k].Num()) continue;
		const float Lean = FMath::Max(0.f, 1.f + K.Conifer * (2.f * ConShare - 1.f));
		const float Stand = (K.Forest * Closed + K.Open * (1.f - Closed)) * Lean;
		const bool bWet = K.bRock && !FCString::Strstr(K.Source, TEXT("Embankment"));   // (a kind that lies on the bed too: not the embankments' slabs)
		const float WMax = Stand + (bNearAny ? K.Shore * (K.bRock ? 2.5f : 1.f) : 0.f); if (WMax <= 0.f) continue;
		FRandomStream R((int32)(CX * 92837111 ^ CY * 689287499 ^ (k + 1) * 283923481));
		// (the brook's riffles: its boulders five times the lakes' stony shallows' — a dozen a 100 m², breaking its surface all across the
		// reach below Upper's outlet, the human's photos — the extra ones kept only in the brook)
		const int32 Boost = K.bWaterOnly && Water->NearBrook(FBox2D(FVector2D(X0, Y0), FVector2D(X0 + CELL, Y0 + CELL)), 20.0) ? 5 : 1;
		const int32 N = FMath::FloorToInt(KindDensity[k] * DensityScale * CELL * CELL * WMax * Boost + R.FRand());
		for (int32 n = 0; n < N; n++) {
			const double X = X0 + R.FRand() * CELL, Y = Y0 + R.FRand() * CELL;
			// in a patch? (the patch noise above 1 − cover, its edge softened)
			const float Pn = ValueNoise(X, Y, K.Patch, k * 7919 + 13), In = FMath::SmoothStep(1.f - K.PatchCover - 0.05f, 1.f - K.PatchCover + 0.05f, Pn);
			if (R.FRand() > In) continue;
			float W = Stand; float WaterZ;
			const FVector At0 = HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum);
			FVector4f Sb(0.f); const bool bSub = K.bRock && Water->SubstrateAt(At0, Sb); const float Stony = Sb.X + 0.4f * Sb.Y;
			float Near = 0.f;   // (a stone's nearness to the water, for its material: 1 in it and at its edge, 0 six metres in)
			if (Water->SurfaceAt(At0, WaterZ)) {
				Near = 1.f;   // (in the water: only stones, where the sim's bed is stony, under 2.5 m)
				float Gw; if (!bWet || !bSub || !Water->GroundAt(At0, Gw) || WaterZ - Gw > 250.f) continue;
				if (Boost > 1 && !Water->InBrook(At0) && R.FRand() * Boost > 1.f) continue;
				W = K.Shore * 2.5f * FMath::SmoothStep(0.15f, 0.6f, Stony);   // (a boulder bed strewn, a sandy cove's or a muck bed's almost bare)
			} else {
				if (K.bWaterOnly) continue;
				if (Water->ClearedAt(At0)) continue;           // (nor on the camps' lots, paths and docks' feet, the roads, the beaches)
				if (K.Shore > 0.f && bNearAny) W += K.Shore * NearWater(FVector2D(X, Y), K.ShoreBand) * (bSub ? FMath::Clamp(0.2f + 2.5f * Stony, 0.f, 2.5f) : 1.f);
				if (K.bRock && bNearAny) Near = NearWater(FVector2D(X, Y), 6.f);
			}
			if (R.FRand() * WMax > W) continue;
			float G; if (!Water->GroundAt(At0, G)) continue;
			const FMesh& M = KindMeshes[k][R.RandHelper(KindMeshes[k].Num())];
			const float S = R.FRandRange(K.ScaleMin, K.ScaleMax);
			FRotator Rot(0.f, R.FRand() * 360.f, 0.f); FVector At(At0.X, At0.Y, G);
			if (K.bLying) {   // (laid along the ground on a random bearing, sunk to half its girth — and not across a road or a path)
				Rot = FRotator(-90.f + R.FRandRange(-4.f, 4.f), R.FRand() * 360.f, R.FRand() * 360.f);
				const FVector Half = FRotator(0.f, Rot.Yaw, 0.f).Vector() * (0.5f * M.Height * S);
				if (Water->ClearedAt(At0 + Half) || Water->ClearedAt(At0 - Half)) continue;
				At.Z -= 8.f * S;
			} else if (K.bRock) {   // (tilted to the slope, sunk a quarter of its height)
				float Gx, Gy; Water->GroundAt(At0 + FVector(100, 0, 0), Gx); Water->GroundAt(At0 + FVector(0, 100, 0), Gy);
				const FVector Nrm = FVector(-(Gx - G) / 100.f, -(Gy - G) / 100.f, 1.f).GetSafeNormal();
				Rot = FRotationMatrix::MakeFromZX(Nrm, FRotator(0, Rot.Yaw, 0).Vector()).Rotator();
				At.Z -= 0.25f * M.Height * S;
			}
			const int64 MK = (int64)k * 64 + KindMeshes[k].IndexOfByPredicate([&](const FMesh& E) { return &E == &M; });
			UPrimitiveComponent*& C = ByMesh.FindOrAdd(MK);
			if (!C) {
				const bool bBig = K.bRock && (K.Ring == 2 || K.bWaterOnly);   // (the walker can't pass the big ones, in the water too)
				if (M.Skel) {
					UInstancedSkinnedMeshComponent* SC = NewObject<UInstancedSkinnedMeshComponent>(this); SC->SetSkinnedAssetAndUpdate(M.Skel); if (Wind && !K.bLying) SC->SetTransformProvider(Wind);
					SC->SetCullDistances(0, (int32)(K.CullM * 100.f)); SC->ShadowCacheInvalidationBehavior = EShadowCacheInvalidationBehavior::Rigid; C = SC;
				} else {
					UInstancedStaticMeshComponent* IC = NewObject<UInstancedStaticMeshComponent>(this); IC->SetStaticMesh(M.Static); IC->SetMobility(EComponentMobility::Static);
					if (K.bRock) IC->NumCustomDataFloats = 1;   // (its nearness to the water: M_MS_Rock's bare, wet band)
					IC->SetCullDistances(0, (int32)(K.CullM * 100.f)); C = IC;
				}
				C->SetCollisionProfileName(bBig ? TEXT("BlockAll") : TEXT("NoCollision")); C->SetCollisionEnabled(bBig ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision);
				C->SetCastShadow(K.Ring > 0); C->bAffectDistanceFieldLighting = bBig;
				C->SetupAttachment(RootComponent); C->RegisterComponent(); C->SetComponentTickEnabled(false); Out.Add(C);
				KindOfComp.Add(C, k); if (!KindShown(k)) C->SetVisibility(false);   // (the season's: under the snow, out of its months)
			}
			const FTransform T(Rot, At, FVector(S));
			Instances++;
			if (UInstancedSkinnedMeshComponent* SC = Cast<UInstancedSkinnedMeshComponent>(C)) SC->AddInstance(T, 0, true);
			else { UInstancedStaticMeshComponent* IC = Cast<UInstancedStaticMeshComponent>(C); const int32 Ix = IC->AddInstance(T, true); if (K.bRock && Ix >= 0) IC->SetCustomDataValue(Ix, 0, Near, true); }
		}
	}
}

void AHotBrookGroundCover::FreeCell(int64 Key)
{
	if (TArray<TObjectPtr<UPrimitiveComponent>>* L = Live.Find(Key)) { for (UPrimitiveComponent* C : *L) if (C) { KindOfComp.Remove(C); C->DestroyComponent(); } Live.Remove(Key); }
}

bool AHotBrookGroundCover::KindShown(int32 K) const
{
	// (under the snow: all but the shrubs that stand out of it, the fallen logs and the big rocks; the mushrooms: their season)
	const FKind& Kd = KINDS[K]; const bool bBig = (Kd.bRock && Kd.Ring == 2) || Kd.bWaterOnly || Kd.bLying || FCString::Strstr(Kd.Source, TEXT("ShoreShrub"));
	if (FCString::Strstr(Kd.Source, TEXT("Mushroom")) && (Yf < 0.42f || Yf > 0.67f)) return false;   // (August – October)
	return bBig || SnowK < 0.5f;
}

void AHotBrookGroundCover::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!bReady) return;
	// the season (twice a second at most: the snow on the land, MPC_HB_Season's; the date) — what shows changes only with them
	if (GetWorld()->GetTimeSeconds() > NextSeason) {
		NextSeason = GetWorld()->GetTimeSeconds() + 2.0;
		static UMaterialParameterCollection* Season = LoadObject<UMaterialParameterCollection>(nullptr, TEXT("/Game/HotBrook/Materials/MPC_HB_Season.MPC_HB_Season"));
		SnowK = Season ? UKismetMaterialLibrary::GetScalarParameterValue(this, Season, TEXT("Snow")) : 0.f;
		for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Yf = It->YearFrac; break; }
		const uint32 Key = (SnowK >= 0.5f ? 1u : 0u) | (Yf >= 0.42f && Yf <= 0.67f ? 2u : 0u);
		if (Key != ShownKey) { ShownKey = Key; for (auto& KV : KindOfComp) if (KV.Key) KV.Key->SetVisibility(KindShown(KV.Value)); }
	}
	const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const APawn* P = PC ? PC->GetPawn() : nullptr; if (!P) return;
	const FVector2D M = HotBrookCoords::ToSim(P->GetActorLocation());
	// the cells to free: past their ring's reach
	TArray<int64> Drop;
	for (const auto& KV : Live) {
		const int32 Ring = (int32)(KV.Key >> 48), CX = (int32)(KV.Key & 0xFFFFFF) - 32768, CY = (int32)((KV.Key >> 24) & 0xFFFFFF) - 32768;
		const double CELL = RING_CELL[Ring];
		if (FVector2D::Distance(M, FVector2D((CX + 0.5) * CELL, (CY + 0.5) * CELL)) > RING_M[Ring] + 2 * CELL) Drop.Add(KV.Key);
	}
	for (int64 K : Drop) FreeCell(K);
	// the cells to make: within each ring's reach, the nearest first, a few a tick
	TArray<TTuple<double, int32, int32, int32>> Want;
	for (int32 Ring = 0; Ring < 3; Ring++) {
		const float Rr = RING_M[Ring]; const double CELL = RING_CELL[Ring];
		for (int32 cy = FMath::FloorToInt((M.Y - Rr) / CELL); cy <= FMath::FloorToInt((M.Y + Rr) / CELL); cy++)
			for (int32 cx = FMath::FloorToInt((M.X - Rr) / CELL); cx <= FMath::FloorToInt((M.X + Rr) / CELL); cx++) {
				const double d = FVector2D::Distance(M, FVector2D((cx + 0.5) * CELL, (cy + 0.5) * CELL)); if (d > Rr) continue;
				const int64 Key = ((int64)Ring << 48) | ((int64)(cy + 32768) << 24) | (int64)(cx + 32768);
				if (!Live.Contains(Key)) Want.Add(MakeTuple(d + Ring * 10.0, Ring, cx, cy));
			}
	}
	Want.Sort([](const auto& A, const auto& B) { return A.template Get<0>() < B.template Get<0>(); });
	const double T0 = FPlatformTime::Seconds();
	for (int32 k = 0; k < FMath::Min(CellsPerTick, Want.Num()); k++) { MakeCell(Want[k].Get<1>(), Want[k].Get<2>(), Want[k].Get<3>()); Made++; }
	MakeMs += (FPlatformTime::Seconds() - T0) * 1000.0;
}
