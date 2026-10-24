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
	int32 NSkel = 0; for (const auto& KV : Meshes) for (const FMeshInfo& MI : KV.Value) NSkel += MI.Skel != nullptr;
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

void AHotBrookForest::MakeTile(int32 T)
{
	TMap<int64, UInstancedStaticMeshComponent*> ByMesh;   // (species × variant → its component in this tile)
	TMap<int64, UInstancedSkinnedMeshComponent*> BySkel;
	UInstancedStaticMeshComponent* Trunks = nullptr;
	TArray<TObjectPtr<UPrimitiveComponent>>& Out = Live.Add(T);
	for (int32 o = TileStart[T]; o < TileStart[T + 1]; o++) {
		const FTree& Tr = Trees[TileOrder[o]]; const TArray<FMeshInfo>* L = Meshes.Find(Tr.Sp); if (!L || !L->Num()) continue;
		const int32 V = (int32)((TileOrder[o] * 2654435761u) >> 16) % L->Num(); const FMeshInfo& MI = (*L)[V];
		const int64 Key = (int64)Tr.Sp * 64 + V;
		const float S = Tr.HDm * 10.f / MI.Height;   // (cm tall over the mesh's own height)
		const FVector At = HotBrookCoords::ToUE(Tr.X, Tr.Y, Tr.Z); const FRotator Turn(0, Tr.Turn * 360.f / 256.f, 0);
		if (MI.Skel) {
			UInstancedSkinnedMeshComponent*& C = BySkel.FindOrAdd(Key);
			if (!C) {
				C = NewObject<UInstancedSkinnedMeshComponent>(this); C->SetSkinnedAssetAndUpdate(MI.Skel); if (Wind) C->SetTransformProvider(Wind);
				C->SetCollisionEnabled(ECollisionEnabled::NoCollision); C->bAffectDistanceFieldLighting = true; C->ShadowCacheInvalidationBehavior = TreeShadowCache;
				C->SetupAttachment(RootComponent); C->RegisterComponent(); C->SetComponentTickEnabled(false); Out.Add(C);   // (the wind bends them on the GPU: no tick needed — thousands of ticking components cost the game thread tens of ms)
			}
			C->AddInstance(FTransform(Turn, At, FVector(S)), 0, true);
		} else {
			UInstancedStaticMeshComponent*& C = ByMesh.FindOrAdd(Key);
			if (!C) {
				C = NewObject<UInstancedStaticMeshComponent>(this); C->SetStaticMesh(MI.Mesh); C->SetMobility(EComponentMobility::Static);
				C->SetCollisionProfileName(TEXT("BlockAll")); C->SetCullDistances(0, 0); C->bAffectDistanceFieldLighting = true;
				C->SetupAttachment(RootComponent); C->RegisterComponent(); Out.Add(C);
			}
			// (a real tree model keeps its own proportions; the engine's stand-in cone, as wide as it is tall, is narrowed to a crown's width:
			// a conifer's ~0.35 of its height, a hardwood's ~0.6, a shrub's 1)
			const float W = !MI.bStandIn ? 1.f : (Tr.Sp <= 3 || Tr.Sp == 11 || Tr.Sp == 12) ? 0.35f : (Tr.Sp >= 8 && Tr.Sp <= 10) ? 1.f : 0.6f;
			C->AddInstance(FTransform(Turn, At, FVector(S * W, S * W, S)), true);
		}
		// the trunk the walker can't pass, for the skinned trees (they have no collision of their own): a hidden cylinder 3 m tall, as thick
		// as a tree of this height — about 1.5 cm across a metre of height (a 20-m spruce ~30 cm); shrubs and saplings under 3 m let him by
		if (MI.Skel && TrunkShape && Tr.HDm >= 30) {
			if (!Trunks) {
				Trunks = NewObject<UInstancedStaticMeshComponent>(this); Trunks->SetStaticMesh(TrunkShape); Trunks->SetMobility(EComponentMobility::Static);
				Trunks->SetCollisionProfileName(TEXT("BlockAll")); Trunks->SetHiddenInGame(true); Trunks->SetCastShadow(false); Trunks->bAffectDistanceFieldLighting = false;
				Trunks->SetupAttachment(RootComponent); Trunks->RegisterComponent(); Out.Add(Trunks);
			}
			const float D = FMath::Clamp(Tr.HDm * 0.0015f, 0.08f, 0.9f);   // (the cylinder is 1 m across and 1 m tall: diameter in metres)
			Trunks->AddInstance(FTransform(FRotator::ZeroRotator, At + FVector(0, 0, 150.f), FVector(D, D, 3.f)), true);
		}
	}
}

void AHotBrookForest::FreeTile(int32 T)
{
	if (TArray<TObjectPtr<UPrimitiveComponent>>* L = Live.Find(T)) { for (UPrimitiveComponent* C : *L) if (C) C->DestroyComponent(); Live.Remove(T); }
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
	for (int32 k = 0; k < FMath::Min(TilesPerTick, Want.Num()); k++) MakeTile(Want[k].Value);
}
