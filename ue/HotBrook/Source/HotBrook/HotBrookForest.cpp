#include "HotBrookForest.h"
#include "HotBrookLink.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "HAL/IConsoleManager.h"
#include "EngineUtils.h"
#include "Kismet/KismetMaterialLibrary.h"
#include "Materials/MaterialParameterCollection.h"
#include "HotBrookCoords.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Components/InstancedSkinnedMeshComponent.h"
#include "Animation/TransformProviderData.h"
#include "Engine/SkeletalMesh.h"
#include "Engine/StaticMesh.h"
#include "Subsystems/WorldSubsystem.h"
#include "UObject/UnrealType.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookForest, Log, All);
static TAutoConsoleVariable<float> CVarLeafDate(TEXT("hb.LeafDate"), -1.f, TEXT("the date the hardwoods' leaves show (0-1 of the year from March 1: 0.6 early October's colours, 0.75 bare) - -1 the sim's own"));

// each hardwood's year (0–1 from March 1; Maine's): leaf-out, the turning's start, its height, the leaves beginning to fall, all down;
// its two Season colours at the height of it — as the Megaplants master uses them (MF_HealthSeason): a turned leaf's colour the leaf's
// own plus colour 1 (linear dodge), or its own overlaid by colour 2 (2 × leaf × colour where the leaf is dark: 0.5 leaves it as it
// is) — so colour 2 carries the hue: a green leaf × (3.2, 0.35, 0.08) is a maple's red, × (3.4, 1.5, 0.15) a birch's yellow
struct FLeafYear { int32 Sp; float Out, Turn, Peak, Drop, Gone; FLinearColor A, B; };
static const FLeafYear LEAF_YEAR[] = {
	{ 4,  0.200f, 0.560f, 0.605f, 0.625f, 0.665f, FLinearColor(0.35f, 0.25f, 0.00f), FLinearColor(3.4f, 1.5f, 0.15f) },   // paper birch: yellow
	{ 5,  0.195f, 0.565f, 0.610f, 0.630f, 0.670f, FLinearColor(0.40f, 0.25f, 0.00f), FLinearColor(3.6f, 1.4f, 0.10f) },   // quaking aspen: gold
	{ 6,  0.205f, 0.540f, 0.590f, 0.610f, 0.650f, FLinearColor(0.45f, 0.05f, 0.00f), FLinearColor(3.2f, 0.35f, 0.08f) },  // red maple: scarlet
	{ 7,  0.215f, 0.580f, 0.625f, 0.650f, 0.690f, FLinearColor(0.30f, 0.15f, 0.00f), FLinearColor(2.8f, 1.0f, 0.15f) },   // American beech: bronze
	{ 8,  0.205f, 0.600f, 0.640f, 0.650f, 0.680f, FLinearColor(0.15f, 0.12f, 0.00f), FLinearColor(1.6f, 1.0f, 0.30f) },   // speckled alder: dull yellow-green
	{ 9,  0.205f, 0.570f, 0.615f, 0.635f, 0.670f, FLinearColor(0.30f, 0.22f, 0.00f), FLinearColor(3.2f, 1.4f, 0.20f) },   // beaked hazel: yellow
	{ 10, 0.195f, 0.570f, 0.615f, 0.635f, 0.670f, FLinearColor(0.30f, 0.25f, 0.00f), FLinearColor(3.0f, 1.5f, 0.20f) },   // willows: yellow
	{ 13, 0.205f, 0.560f, 0.600f, 0.625f, 0.665f, FLinearColor(0.40f, 0.12f, 0.00f), FLinearColor(3.2f, 0.8f, 0.10f) },   // young hardwoods: red and orange
};
static const FLeafYear* LeafYearOf(int32 Sp) { for (const FLeafYear& L : LEAF_YEAR) if (L.Sp == Sp) return &L; return nullptr; }

AHotBrookForest::AHotBrookForest()
{
	PrimaryActorTick.bCanEverTick = true; PrimaryActorTick.TickInterval = 0.1f;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
	RootComponent->SetMobility(EComponentMobility::Static);   // (the static trunk colliders attach to it; the swaying trees are movable children)
}

bool AHotBrookForest::LoadTrees()
{
	// Import/trees.bin: "HBT1", uint32 n, n × { float x, y, z; uint8 species, turn; uint16 height dm }
	TArray<uint8> B;
	if (!FFileHelper::LoadFileToArray(B, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("trees.bin"))) || B.Num() < 8 || FMemory::Memcmp(B.GetData(), "HBT1", 4) != 0) return false;
	uint32 N; FMemory::Memcpy(&N, B.GetData() + 4, 4); if ((int64)N * 16 + 8 > B.Num()) return false;
	Trees.SetNumUninitialized(N);
	double x0 = 1e18, y0 = 1e18, x1 = -1e18, y1 = -1e18;
	for (uint32 i = 0; i < N; i++) {
		const uint8* p = B.GetData() + 8 + i * 16; FTree& T = Trees[i];
		FMemory::Memcpy(&T.X, p, 4); FMemory::Memcpy(&T.Y, p + 4, 4); FMemory::Memcpy(&T.Z, p + 8, 4); T.Sp = p[12]; T.Turn = p[13]; FMemory::Memcpy(&T.HDm, p + 14, 2);
		x0 = FMath::Min(x0, (double)T.X); y0 = FMath::Min(y0, (double)T.Y); x1 = FMath::Max(x1, (double)T.X); y1 = FMath::Max(y1, (double)T.Y);
	}
	TX0 = x0; TY0 = y0; TX = FMath::CeilToInt((x1 - x0) / Tile) + 1; TY = FMath::CeilToInt((y1 - y0) / Tile) + 1;
	TileStart.Init(0, TX * TY + 1); TileOrder.SetNumUninitialized(N);
	const auto TileOf = [&](const FTree& T) { return FMath::Clamp((int32)((T.Y - TY0) / Tile), 0, TY - 1) * TX + FMath::Clamp((int32)((T.X - TX0) / Tile), 0, TX - 1); };
	for (const FTree& T : Trees) TileStart[TileOf(T) + 1]++;
	for (int32 t = 0; t < TX * TY; t++) TileStart[t + 1] += TileStart[t];
	TArray<int32> Cur(TileStart.GetData(), TX * TY);
	for (uint32 i = 0; i < N; i++) TileOrder[Cur[TileOf(Trees[i])]++] = i;
	UE_LOG(LogHotBrookForest, Display, TEXT("%u trees in %dx%d tiles of %.0f m"), N, TX, TY, Tile);
	return true;
}

void AHotBrookForest::LoadMeshes()
{
	// Import/forest_meshes.json: { "0": ["/Game/…/Tree_Norway_Spruce_01_A.Tree_Norway_Spruce_01_A", …], … } — species → meshes (static
	// or skinned); a species without any takes the stand-in. A plant model stands on its pivot: its height is the top of its bounds.
	FString Text; TSharedPtr<FJsonObject> J;
	if (FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("forest_meshes.json"))) && FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) && J.IsValid()) {
		for (const auto& KV : J->Values) {
			const int32 Sp = FCString::Atoi(*KV.Key);
			for (const TSharedPtr<FJsonValue>& V : KV.Value->AsArray()) {
				UObject* A = LoadObject<UObject>(nullptr, *V->AsString());
				if (UStaticMesh* M = Cast<UStaticMesh>(A)) { const FBoxSphereBounds B = M->GetBounds(); Meshes.FindOrAdd(Sp).Add({ M, nullptr, (float)FMath::Max(1.0, B.Origin.Z + B.BoxExtent.Z) }); }
				else if (USkeletalMesh* K = Cast<USkeletalMesh>(A)) { const FBoxSphereBounds B = K->GetBounds(); Meshes.FindOrAdd(Sp).Add({ nullptr, K, (float)FMath::Max(1.0, B.Origin.Z + B.BoxExtent.Z) }); }
				else UE_LOG(LogHotBrookForest, Warning, TEXT("species %d: %s isn't a mesh"), Sp, *V->AsString());
			}
		}
	}
	// (the stand-ins: the engine's cone for every species, scaled to the tree)
	UStaticMesh* Cone = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cone.Cone"));
	for (int32 Sp = 0; Sp < 14; Sp++) if (!Meshes.Contains(Sp) && Cone) Meshes.Add(Sp, { { Cone, nullptr, (float)(Cone->GetBounds().BoxExtent.Z * 2.0), true } });
	int32 NSkel = 0; for (const auto& KV : Meshes) for (const FMeshInfo& MI : KV.Value) { NSkel += MI.Skel != nullptr; Held.AddUnique(MI.Mesh); Held.AddUnique(MI.Skel); }
	Held.Remove(nullptr);
	// the wind: Dynamic Wind's provider (looked up by name — the plugin may be off; the trees then stand still)
	if (UClass* WC = FindObject<UClass>(nullptr, TEXT("/Script/DynamicWind.DynamicWindData"))) Wind = NewObject<UTransformProviderData>(this, WC);
	TrunkShape = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
	LoadSeasons();
	UE_LOG(LogHotBrookForest, Display, TEXT("tree meshes: %d species, %d skinned meshes; Dynamic Wind %s"), Meshes.Num(), NSkel, Wind ? TEXT("on") : TEXT("missing"));
}

void AHotBrookForest::LoadSeasons()
{
	// each hardwood's foliage materials (by name) → their twins (/Game/HotBrook/Seasons/<name>_Season), one dynamic instance each
	Bare = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Seasons/M_HB_Bare.M_HB_Bare"));   // (masked away; twig grey-brown where Nanite draws far foliage as voxels)
	if (!Bare) Bare = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Animals/M_HB_Invisible.M_HB_Invisible"));
	int32 N = 0;
	for (const auto& KV : Meshes) {
		if (!LeafYearOf(KV.Key)) continue;
		for (const FMeshInfo& MI : KV.Value) {
			if (!MI.Skel) continue;
			for (const FSkeletalMaterial& SM : MI.Skel->GetMaterials()) {
				UMaterialInterface* M = SM.MaterialInterface; if (!M || SeasonOf.Contains(M) || !M->GetName().Contains(TEXT("Foliage"))) continue;
				UMaterialInterface* Tw = LoadObject<UMaterialInterface>(nullptr, *FString::Printf(TEXT("/Game/HotBrook/Seasons/%s_Season.%s_Season"), *M->GetName(), *M->GetName()));
				if (!Tw) continue;
				UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Tw, this); SeasonHeld.Add(D); SeasonOf.Add(M, { D, KV.Key }); N++;
			}
		}
	}
	UE_LOG(LogHotBrookForest, Display, TEXT("the leaves by the date: %d hardwood foliage materials with their autumn twins%s"), N, Bare ? TEXT("") : TEXT(" (no M_HB_Bare: no bare trees)"));
}

int32 AHotBrookForest::LeafState(int32 Sp, int32 TileIx) const
{
	const FLeafYear* L = LeafYearOf(Sp); if (!L) return 0;
	const uint32 H = (uint32)TileIx * 2654435761u ^ (uint32)Sp * 40503u; const float dT = (((H >> 8) & 1023) / 1023.f - 0.5f) * 0.02f;   // (±3.6 days a tile)
	const float Y = LeafYf - dT;
	if (Y < L->Out || Y >= L->Gone) return Bare ? 2 : 0;
	return Y >= L->Turn ? 1 : 0;
}

void AHotBrookForest::ApplyLeaves(UInstancedSkinnedMeshComponent* C, int32 TileIx)
{
	const USkinnedAsset* A = C ? C->GetSkinnedAsset() : nullptr; if (!A) return;
	const TArray<FSkeletalMaterial>& Mats = A->GetMaterials();
	for (int32 i = 0; i < Mats.Num(); i++) {
		const FSeason* S = SeasonOf.Find(Mats[i].MaterialInterface); if (!S) continue;
		const int32 St = LeafState(S->Sp, TileIx);
		UMaterialInterface* Want = St == 1 ? (UMaterialInterface*)S->MID : St == 2 ? Bare.Get() : Mats[i].MaterialInterface.Get();
		if (C->GetMaterial(i) != Want) C->SetMaterial(i, Want);
	}
}

void AHotBrookForest::UpdateLeaves()
{
	// the date (hb.LeafDate, or the sim's), each twin's colours (green → its autumn's → brown as they fall), each live tree's leaves
	const float Force = CVarLeafDate.GetValueOnGameThread();
	if (Force >= 0.f) LeafYf = Force; else for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { LeafYf = It->YearFrac; break; }
	// (each colour from neutral — the leaf as it is: nothing added, overlaid by 0.5 — to its autumn's, then toward brown as they fall)
	const FLinearColor Neutral1(0.f, 0.f, 0.f), Neutral2(0.5f, 0.5f, 0.5f), Brown1(0.10f, 0.03f, 0.f), Brown2(1.5f, 0.75f, 0.4f);
	// (the Megaplants' own season control — MPC_GlobalFoliageActor 'Season Strength', 0 by default — is the exponent of the leaves'
	// turning mask: saturate(1e9 · x^(strength + 0.01)), x a leaf pixel's red × noise ~0.05–0.3: none turn below ~7, most by ~40 — held
	// at 40 while any hardwood is turning or falling; each species' timing is in its colours, neutral until its turning)
	static UMaterialParameterCollection* Foliage = LoadObject<UMaterialParameterCollection>(nullptr, TEXT("/ProceduralVegetationEditor/SampleAssets/Materials/MaterialFunctions/MPC_GlobalFoliageActor.MPC_GlobalFoliageActor"));
	if (Foliage) { bool bAutumn = false; for (const FLeafYear& L : LEAF_YEAR) bAutumn |= LeafYf >= L.Turn - 0.015f && LeafYf < L.Gone + 0.015f; UKismetMaterialLibrary::SetScalarParameterValue(this, Foliage, TEXT("Season Strength"), bAutumn ? 40.f : 0.f); }
	for (auto& KV : SeasonOf) {
		const FLeafYear* L = LeafYearOf(KV.Value.Sp); if (!L || !KV.Value.MID) continue;
		const float t = FMath::SmoothStep(L->Turn, L->Peak, LeafYf), u = 0.7f * FMath::SmoothStep(L->Drop, L->Gone, LeafYf);
		KV.Value.MID->SetVectorParameterValue(TEXT("Season Color 1"), FMath::Lerp(FMath::Lerp(Neutral1, L->A, t), Brown1, u));
		KV.Value.MID->SetVectorParameterValue(TEXT("Season Color 2"), FMath::Lerp(FMath::Lerp(Neutral2, L->B, t), Brown2, u));
	}
	for (auto& KV : Live) for (UPrimitiveComponent* P : KV.Value) if (UInstancedSkinnedMeshComponent* C = Cast<UInstancedSkinnedMeshComponent>(P)) ApplyLeaves(C, KV.Key);
}

void AHotBrookForest::BeginPlay()
{
	Super::BeginPlay();
	if (!LoadTrees()) { UE_LOG(LogHotBrookForest, Warning, TEXT("Import/trees.bin not read: run ue/export/export_forest.mjs")); SetActorTickEnabled(false); return; }
	LoadMeshes();
}

int32 AHotBrookForest::VariantOf(const FTree& Tr, int32 Index, const TArray<FMeshInfo>& L) const
{
	// (the variant: among those within 1.6× of the tree's height, by the tree's hash; none, the nearest)
	const float Hcm = Tr.HDm * 10.f; const uint32 Hash = (uint32)Index * 2654435761u >> 16;
	int32 NFit = 0, Near = 0; float Best = 1e9f;
	for (int32 v = 0; v < L.Num(); v++) { const float r = FMath::Abs(FMath::Loge(L[v].Height / Hcm)); NFit += r < 0.47f; if (r < Best) { Best = r; Near = v; } }
	if (NFit > 1) { int32 Pick = Hash % NFit; for (int32 v = 0; v < L.Num(); v++) if (FMath::Abs(FMath::Loge(L[v].Height / Hcm)) < 0.47f && Pick-- == 0) return v; }
	return Near;
}

void AHotBrookForest::MakeTile(int32 T)
{
	// the tile's trees gathered by species × variant first, then each group added to its component in one call before it is
	// registered (one at a time, into a live component, ~10,000 a tile took 1–3 s of the game thread: the start froze for minutes)
	struct FBatch { const FMeshInfo* MI = nullptr; int32 Sp = 0; TArray<FTransform> X; };
	TMap<int64, FBatch> Batches;
	for (int32 o = TileStart[T]; o < TileStart[T + 1]; o++) {
		const FTree& Tr = Trees[TileOrder[o]]; const TArray<FMeshInfo>* L = Meshes.Find(Tr.Sp); if (!L || !L->Num()) continue;
		const int32 V = VariantOf(Tr, TileOrder[o], *L); const FMeshInfo& MI = (*L)[V];
		FBatch& B = Batches.FindOrAdd((int64)Tr.Sp * 64 + V); B.MI = &MI; B.Sp = Tr.Sp;
		const float S = Tr.HDm * 10.f / MI.Height;   // (cm tall over the mesh's own height)
		// (a real tree model keeps its own proportions; the engine's stand-in cone, as wide as it is tall, is narrowed to a crown's width:
		// a conifer's ~0.35 of its height, a hardwood's ~0.6, a shrub's 1)
		const float W = !MI.bStandIn ? 1.f : (Tr.Sp <= 3 || Tr.Sp == 11 || Tr.Sp == 12) ? 0.35f : (Tr.Sp >= 8 && Tr.Sp <= 10) ? 1.f : 0.6f;
		B.X.Add(FTransform(FRotator(0, Tr.Turn * 360.f / 256.f, 0), HotBrookCoords::ToUE(Tr.X, Tr.Y, Tr.Z), FVector(S * W, S * W, S)));
	}
	TArray<TObjectPtr<UPrimitiveComponent>>& Out = Live.Add(T);
	for (auto& KV : Batches) {
		const FMeshInfo& MI = *KV.Value.MI;
		if (MI.Skel) {
			UInstancedSkinnedMeshComponent* C = NewObject<UInstancedSkinnedMeshComponent>(this); C->SetSkinnedAssetAndUpdate(MI.Skel); if (Wind) C->SetTransformProvider(Wind);
			if (MI.Height < 1200.f) C->SetCullDistances(0, MI.Height < 600.f ? 30000 : 60000);   // (the small trees drawn only near: the variant's height is near the tree's own)
			C->SetCollisionEnabled(ECollisionEnabled::NoCollision); C->bAffectDistanceFieldLighting = true; C->ShadowCacheInvalidationBehavior = TreeShadowCache;
			TArray<int32> Anim; Anim.SetNumZeroed(KV.Value.X.Num());
			ApplyLeaves(C, T);   // (its leaves by the date)
			C->AddInstances(KV.Value.X, Anim, false, true);
			C->SetupAttachment(RootComponent); C->RegisterComponent(); C->SetComponentTickEnabled(false); Out.Add(C);   // (the wind bends them on the GPU: no tick needed — thousands of ticking components cost the game thread tens of ms)
		} else {
			UInstancedStaticMeshComponent* C = NewObject<UInstancedStaticMeshComponent>(this); C->SetStaticMesh(MI.Mesh); C->SetMobility(EComponentMobility::Static);
			C->SetCollisionEnabled(ECollisionEnabled::NoCollision); C->SetCullDistances(0, 0); C->bAffectDistanceFieldLighting = true;
			C->AddInstances(KV.Value.X, false, true, false);
			C->SetupAttachment(RootComponent); C->RegisterComponent(); Out.Add(C);
		}
	}
}

void AHotBrookForest::MakeTrunks(int32 Cell)
{
	// the trunks the walker can't pass (the skinned trees have no collision of their own): a hidden cylinder 3 m tall per tree of 3 m
	// and more, as thick as a tree of its height — about 1.5 cm across a metre of height (a 20-m spruce ~30 cm); saplings and shrubs
	// under 3 m let him by. Only in the 50-m cells about the walker: physics bodies for every trunk out to a kilometre cost seconds.
	const int32 NCX = FMath::CeilToInt(TX * Tile / TrunkCell), cx = Cell % NCX, cy = Cell / NCX;
	const double X0 = TX0 + cx * TrunkCell, Y0 = TY0 + cy * TrunkCell;
	const int32 T = FMath::Clamp((int32)((Y0 + 1 - TY0) / Tile), 0, TY - 1) * TX + FMath::Clamp((int32)((X0 + 1 - TX0) / Tile), 0, TX - 1);
	TArray<FTransform> X;
	for (int32 o = TileStart[T]; o < TileStart[T + 1]; o++) {
		const FTree& Tr = Trees[TileOrder[o]]; if (Tr.HDm < 30 || Tr.X < X0 || Tr.X >= X0 + TrunkCell || Tr.Y < Y0 || Tr.Y >= Y0 + TrunkCell) continue;
		const TArray<FMeshInfo>* L = Meshes.Find(Tr.Sp); if (!L || !L->Num() || !(*L)[VariantOf(Tr, TileOrder[o], *L)].Skel) continue;
		const float D = FMath::Clamp(Tr.HDm * 0.0015f, 0.08f, 0.9f);   // (the cylinder is 1 m across and 1 m tall: diameter in metres)
		X.Add(FTransform(FRotator::ZeroRotator, HotBrookCoords::ToUE(Tr.X, Tr.Y, Tr.Z) + FVector(0, 0, 150.f), FVector(D, D, 3.f)));
	}
	UInstancedStaticMeshComponent* C = NewObject<UInstancedStaticMeshComponent>(this); C->SetStaticMesh(TrunkShape); C->SetMobility(EComponentMobility::Static);
	C->SetCollisionProfileName(TEXT("BlockAll")); C->SetHiddenInGame(true); C->SetCastShadow(false); C->bAffectDistanceFieldLighting = false;
	C->AddInstances(X, false, true, false);
	C->SetupAttachment(RootComponent); C->RegisterComponent(); Trunks.Add(Cell, C);
}

void AHotBrookForest::FreeTile(int32 T)
{
	if (TArray<TObjectPtr<UPrimitiveComponent>>* L = Live.Find(T)) { for (UPrimitiveComponent* C : *L) if (C) C->DestroyComponent(); Live.Remove(T); }
}

void AHotBrookForest::CanopyAt(const FVector2D& S, float R, int32& NCanopy, int32& NConifer) const
{
	NCanopy = NConifer = 0; if (!TX) return;
	const int32 q0 = FMath::Max(0, (int32)((S.X - R - TX0) / Tile)), q1 = FMath::Min(TX - 1, (int32)((S.X + R - TX0) / Tile));
	const int32 r0 = FMath::Max(0, (int32)((S.Y - R - TY0) / Tile)), r1 = FMath::Min(TY - 1, (int32)((S.Y + R - TY0) / Tile));
	for (int32 r = r0; r <= r1; r++) for (int32 q = q0; q <= q1; q++) {
		const int32 T = r * TX + q;
		for (int32 o = TileStart[T]; o < TileStart[T + 1]; o++) {
			const FTree& Tr = Trees[TileOrder[o]];
			if (Tr.Sp > 7 && Tr.Sp != 11) continue;   // (the canopy's species: not the shrubs, not the saplings)
			if (FMath::Square(Tr.X - S.X) + FMath::Square(Tr.Y - S.Y) > R * R) continue;
			NCanopy++; NConifer += Tr.Sp <= 3 || Tr.Sp == 11;
		}
	}
}

void AHotBrookForest::SetWind(float SpeedMs, float FromBearing)
{
	WindMs = SpeedMs; WindFrom = FromBearing;
}

void AHotBrookForest::PushWind()
{
	// Dynamic Wind's subsystem, by name (its class isn't exported to game modules): UpdateWindParameters(FDynamicWindParameters) called
	// through reflection. Its speed is on its own 0–100 scale (15 its default breeze): the sim's m/s as km/h. Its direction is the way the
	// wind blows TO; the sim's bearing is where it comes FROM (0 north, clockwise), and UE's Y is south.
	static UClass* SubClass = FindObject<UClass>(nullptr, TEXT("/Script/DynamicWind.DynamicWindSubsystem"));
	UWorldSubsystem* Sub = SubClass ? GetWorld()->GetSubsystemBase(SubClass) : nullptr; if (!Sub) return;
	UFunction* Fn = Sub->FindFunction(TEXT("UpdateWindParameters")); if (!Fn) return;
	FStructProperty* PP = CastField<FStructProperty>(Fn->FindPropertyByName(TEXT("Parameters"))); if (!PP) return;
	TArray<uint8> Buf; Buf.SetNumZeroed(Fn->ParmsSize);
	void* V = PP->ContainerPtrToValuePtr<void>(Buf.GetData()); PP->Struct->InitializeStruct(V);
	const double To = WindFrom + PI;
	if (FStructProperty* D = CastField<FStructProperty>(PP->Struct->FindPropertyByName(TEXT("WindDirection")))) *D->ContainerPtrToValuePtr<FVector>(V) = FVector(FMath::Sin(To), -FMath::Cos(To), 0.0);
	if (FFloatProperty* Sp = CastField<FFloatProperty>(PP->Struct->FindPropertyByName(TEXT("WindSpeed")))) Sp->SetPropertyValue_InContainer(V, FMath::Clamp(WindMs * 3.6f, 0.f, 100.f));
	Sub->ProcessEvent(Fn, Buf.GetData());
	PP->Struct->DestroyStruct(V);
}

void AHotBrookForest::Tick(float Dt)
{
	Super::Tick(Dt);
	const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const APawn* P = PC ? PC->GetPawn() : nullptr;
	if (!P || !TX) return;
	const FVector2D M = HotBrookCoords::ToSim(P->GetActorLocation());
	if (Wind && GetWorld()->GetTimeSeconds() > NextWind) { NextWind = GetWorld()->GetTimeSeconds() + 0.5; PushWind(); }   // (the wind in the branches)
	if (SeasonOf.Num() && GetWorld()->GetTimeSeconds() > NextLeaf) { NextLeaf = GetWorld()->GetTimeSeconds() + 2.0; UpdateLeaves(); }   // (the leaves by the date)
	// the tiles to free: past UnloadRadius
	TArray<int32> Drop; for (const auto& KV : Live) { const int32 q = KV.Key % TX, r = KV.Key / TX; const double cx = TX0 + (q + 0.5) * Tile, cy = TY0 + (r + 0.5) * Tile; if (FVector2D::Distance(M, FVector2D(cx, cy)) > UnloadRadius + Tile) Drop.Add(KV.Key); }
	for (int32 T : Drop) FreeTile(T);
	// the tiles to make: within LoadRadius, the nearest first, a few a tick
	TArray<TPair<double, int32>> Want;
	const int32 q0 = FMath::Max(0, (int32)((M.X - LoadRadius - TX0) / Tile)), q1 = FMath::Min(TX - 1, (int32)((M.X + LoadRadius - TX0) / Tile));
	const int32 r0 = FMath::Max(0, (int32)((M.Y - LoadRadius - TY0) / Tile)), r1 = FMath::Min(TY - 1, (int32)((M.Y + LoadRadius - TY0) / Tile));
	for (int32 r = r0; r <= r1; r++) for (int32 q = q0; q <= q1; q++) {
		const int32 T = r * TX + q; if (Live.Contains(T)) continue;
		const double d = FVector2D::Distance(M, FVector2D(TX0 + (q + 0.5) * Tile, TY0 + (r + 0.5) * Tile)); if (d <= LoadRadius) Want.Add({ d, T });
	}
	Want.Sort([](const TPair<double, int32>& A, const TPair<double, int32>& B) { return A.Key < B.Key; });
	const double T0 = FPlatformTime::Seconds();
	for (int32 k = 0; k < Want.Num() && (k == 0 || (FPlatformTime::Seconds() - T0) * 1000.0 < BudgetMs); k++) { MakeTile(Want[k].Value); Made++; }   // (the nearest first, within the frame's budget)
	// the trunks' collision in the cells within TrunkRadius, freed past twice it
	if (TrunkShape) {
		const int32 NCX = FMath::CeilToInt(TX * Tile / TrunkCell);
		TArray<int32> Gone; for (const auto& KV : Trunks) { const double cx = TX0 + (KV.Key % NCX + 0.5) * TrunkCell, cy = TY0 + (KV.Key / NCX + 0.5) * TrunkCell; if (FVector2D::Distance(M, FVector2D(cx, cy)) > 2 * TrunkRadius) Gone.Add(KV.Key); }
		for (int32 K : Gone) { if (UInstancedStaticMeshComponent* C = Trunks.FindRef(K)) C->DestroyComponent(); Trunks.Remove(K); }
		const int32 a0 = FMath::Max(0, (int32)((M.X - TrunkRadius - TX0) / TrunkCell)), a1 = (int32)((M.X + TrunkRadius - TX0) / TrunkCell);
		const int32 b0 = FMath::Max(0, (int32)((M.Y - TrunkRadius - TY0) / TrunkCell)), b1 = (int32)((M.Y + TrunkRadius - TY0) / TrunkCell);
		int32 NMade = 0;
		for (int32 b = b0; b <= b1 && NMade < 4; b++) for (int32 a = a0; a <= a1 && a < NCX && NMade < 4; a++) {
			const int32 K = b * NCX + a; if (Trunks.Contains(K) || (TY0 + b * TrunkCell) >= TY0 + TY * Tile) continue;
			if (FVector2D::Distance(M, FVector2D(TX0 + (a + 0.5) * TrunkCell, TY0 + (b + 0.5) * TrunkCell)) > TrunkRadius) continue;
			MakeTrunks(K); NMade++;
		}
	}
	MakeMs += (FPlatformTime::Seconds() - T0) * 1000.0;
}
