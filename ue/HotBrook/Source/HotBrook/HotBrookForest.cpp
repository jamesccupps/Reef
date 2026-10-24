#include "HotBrookForest.h"
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
	UE_LOG(LogHotBrookForest, Display, TEXT("tree meshes: %d species, %d skinned meshes; Dynamic Wind %s"), Meshes.Num(), NSkel, Wind ? TEXT("on") : TEXT("missing"));
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
