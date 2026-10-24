#include "HotBrookGroundCover.h"
#include "HotBrookCoords.h"
#include "HotBrookForest.h"
#include "HotBrookWater.h"
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
// stands, within the shore band (m) of the water.
struct AHotBrookGroundCover::FKind
{
	const TCHAR* Source;   // ("MS:" a Megascans scan by its name in megascans_meshes.json, "MP:" a Megaplants plant in groundcover_meshes.json)
	int32 Ring; float Amount; bool bCover; float Patch, PatchCover, Forest, Open, Conifer, Shore, ShoreBand, ScaleMin, ScaleMax, CullM;
	bool bRock;            // (tilted to the ground, sunk a quarter into it, the walker can't pass the big ones)
	bool bLying;           // (laid down along the ground: the fallen logs; no wind)
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
			KindMeshes[k].Add(M);
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
		const float WMax = Stand + (bNearAny ? K.Shore : 0.f); if (WMax <= 0.f) continue;
		FRandomStream R((int32)(CX * 92837111 ^ CY * 689287499 ^ (k + 1) * 283923481));
		const int32 N = FMath::FloorToInt(KindDensity[k] * DensityScale * CELL * CELL * WMax + R.FRand());
		for (int32 n = 0; n < N; n++) {
			const double X = X0 + R.FRand() * CELL, Y = Y0 + R.FRand() * CELL;
			// in a patch? (the patch noise above 1 − cover, its edge softened)
			const float Pn = ValueNoise(X, Y, K.Patch, k * 7919 + 13), In = FMath::SmoothStep(1.f - K.PatchCover - 0.05f, 1.f - K.PatchCover + 0.05f, Pn);
			if (R.FRand() > In) continue;
			float W = Stand; float WaterZ;
			const FVector At0 = HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum);
			if (Water->SurfaceAt(At0, WaterZ)) continue;   // (nothing in the water)
			if (K.Shore > 0.f && bNearAny) W += K.Shore * NearWater(FVector2D(X, Y), K.ShoreBand);
			if (R.FRand() * WMax > W) continue;
			float G; if (!Water->GroundAt(At0, G)) continue;
			const FMesh& M = KindMeshes[k][R.RandHelper(KindMeshes[k].Num())];
			const float S = R.FRandRange(K.ScaleMin, K.ScaleMax);
			FRotator Rot(0.f, R.FRand() * 360.f, 0.f); FVector At(At0.X, At0.Y, G);
			if (K.bLying) {   // (laid along the ground on a random bearing, sunk to half its girth)
				Rot = FRotator(-90.f + R.FRandRange(-4.f, 4.f), R.FRand() * 360.f, R.FRand() * 360.f);
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
				const bool bBig = K.bRock && K.Ring == 2;
				if (M.Skel) {
					UInstancedSkinnedMeshComponent* SC = NewObject<UInstancedSkinnedMeshComponent>(this); SC->SetSkinnedAssetAndUpdate(M.Skel); if (Wind && !K.bLying) SC->SetTransformProvider(Wind);
					SC->SetCullDistances(0, (int32)(K.CullM * 100.f)); SC->ShadowCacheInvalidationBehavior = EShadowCacheInvalidationBehavior::Rigid; C = SC;
				} else {
					UInstancedStaticMeshComponent* IC = NewObject<UInstancedStaticMeshComponent>(this); IC->SetStaticMesh(M.Static); IC->SetMobility(EComponentMobility::Static);
					IC->SetCullDistances(0, (int32)(K.CullM * 100.f)); C = IC;
				}
				C->SetCollisionProfileName(bBig ? TEXT("BlockAll") : TEXT("NoCollision")); C->SetCollisionEnabled(bBig ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision);
				C->SetCastShadow(K.Ring > 0); C->bAffectDistanceFieldLighting = bBig;
				C->SetupAttachment(RootComponent); C->RegisterComponent(); C->SetComponentTickEnabled(false); Out.Add(C);
			}
			const FTransform T(Rot, At, FVector(S));
			Instances++;
			if (UInstancedSkinnedMeshComponent* SC = Cast<UInstancedSkinnedMeshComponent>(C)) SC->AddInstance(T, 0, true);
			else Cast<UInstancedStaticMeshComponent>(C)->AddInstance(T, true);
		}
	}
}

void AHotBrookGroundCover::FreeCell(int64 Key)
{
	if (TArray<TObjectPtr<UPrimitiveComponent>>* L = Live.Find(Key)) { for (UPrimitiveComponent* C : *L) if (C) C->DestroyComponent(); Live.Remove(Key); }
}

void AHotBrookGroundCover::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!bReady) return;
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
