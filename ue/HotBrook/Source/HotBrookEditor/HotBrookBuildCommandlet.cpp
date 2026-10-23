#include "HotBrookBuildCommandlet.h"
#include "../HotBrook/HotBrookCoords.h"
#include "Editor.h"
#include "Engine/World.h"
#include "Landscape.h"
#include "LandscapeInfo.h"
#include "WaterBodyLakeActor.h"
#include "WaterBodyComponent.h"
#include "WaterSplineComponent.h"
#include "WaterZoneActor.h"
#include "Components/SkyAtmosphereComponent.h"
#include "Components/VolumetricCloudComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/SkyLightComponent.h"
#include "Components/ExponentialHeightFogComponent.h"
#include "Engine/DirectionalLight.h"
#include "Engine/SkyLight.h"
#include "Engine/ExponentialHeightFog.h"
#include "Engine/PostProcessVolume.h"
#include "GameFramework/PlayerStart.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Misc/PackageName.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "UObject/Package.h"
#include "UObject/SavePackage.h"
#include "EngineUtils.h"
#include "HAL/FileManager.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookBuild, Log, All);

static TSharedPtr<FJsonObject> ReadJson(const FString& Path)
{
	FString Text; if (!FFileHelper::LoadFileToString(Text, *Path)) return nullptr;
	TSharedPtr<FJsonObject> J; const TSharedRef<TJsonReader<>> R = TJsonReaderFactory<>::Create(Text);
	return FJsonSerializer::Deserialize(R, J) ? J : nullptr;
}

int32 UHotBrookBuildCommandlet::Main(const FString& Params)
{
	const FString Import = FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"));
	const TSharedPtr<FJsonObject> HM = ReadJson(Import / TEXT("heightmap.json")), LJ = ReadJson(Import / TEXT("lakes.json"));
	TArray<uint8> Raw;
	if (!HM || !LJ || !FFileHelper::LoadFileToArray(Raw, *(Import / TEXT("heightmap.r16")))) { UE_LOG(LogHotBrookBuild, Error, TEXT("Import/ is missing: run ue/export/export_world.mjs")); return 1; }
	const int32 NX = HM->GetIntegerField(TEXT("nx")), NY = HM->GetIntegerField(TEXT("ny")), Q = HM->GetIntegerField(TEXT("quadsPerComponent"));
	const double Cell = HM->GetNumberField(TEXT("cell")), X0 = HM->GetNumberField(TEXT("x0")), YN = HM->GetNumberField(TEXT("yNorth"));
	if (Raw.Num() != NX * NY * 2) { UE_LOG(LogHotBrookBuild, Error, TEXT("heightmap.r16 is %d bytes, %dx%d wanted"), Raw.Num(), NX, NY); return 1; }
	TArray<uint16> Heights; Heights.SetNumUninitialized(NX * NY); FMemory::Memcpy(Heights.GetData(), Raw.GetData(), Raw.Num());
	const auto GroundAt = [&](double X, double Y) {   // (the heightmap's ground at a sim point, m above sea level)
		const int32 q = FMath::Clamp(FMath::RoundToInt((X - X0) / Cell), 0, NX - 1), r = FMath::Clamp(FMath::RoundToInt((YN - Y) / Cell), 0, NY - 1);
		return (Heights[r * NX + q] - 32768.0) / 128.0 + HotBrookCoords::Datum;
	};

	// a new world in a new map package (the old map's file deleted first: a new package can't be saved over an unloaded one)
	const FString MapName = TEXT("/Game/Maps/HotBrook");
	{ const FString Old = FPackageName::LongPackageNameToFilename(MapName, FPackageName::GetMapPackageExtension()); if (IFileManager::Get().FileExists(*Old)) IFileManager::Get().Delete(*Old, false, true); }
	UPackage* Pkg = CreatePackage(*MapName);
	UWorld* World = UWorld::CreateWorld(EWorldType::Editor, true, FName(TEXT("HotBrook")), Pkg, true);
	World->SetFlags(RF_Public | RF_Standalone);
	if (GEditor) { GEditor->GetEditorWorldContext().SetCurrentWorld(World); }
	GWorld = World;
	FActorSpawnParameters SP; SP.bNoFail = true;

	// THE GROUND: the landscape, 2 m a quad, 1 m a height step of 1/128 (Z scale 100), its north-west corner at the heightmap's
	{
		// (as the editor's importer does it: spawned at its corner, then scaled — a scale in the spawn transform came out 25600 on every
		// axis, the land 128 times too wide)
		ALandscape* L = World->SpawnActor<ALandscape>(ALandscape::StaticClass(), FTransform(HotBrookCoords::ToUE(X0, YN, HotBrookCoords::Datum)), SP);
		L->SetActorRelativeScale3D(FVector(Cell * 100.0, Cell * 100.0, 100.0));
		L->SetActorLabel(TEXT("Hot Brook land and lake beds"));
		if (UMaterialInterface* M = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Materials/M_Ground.M_Ground"))) L->LandscapeMaterial = M;
		TMap<FGuid, TArray<uint16>> HeightData; HeightData.Add(FGuid(), Heights);
		TMap<FGuid, TArray<FLandscapeImportLayerInfo>> Layers; Layers.Add(FGuid(), TArray<FLandscapeImportLayerInfo>());
		L->Import(FGuid::NewGuid(), 0, 0, NX - 1, NY - 1, 1, Q, HeightData, nullptr, Layers, ELandscapeImportAlphamapType::Additive, TArrayView<const FLandscapeLayer>());
		L->SetActorRelativeScale3D(FVector(Cell * 100.0, Cell * 100.0, 100.0));
		UE_LOG(LogHotBrookBuild, Display, TEXT("landscape %dx%d (%d-quad components), scale %s"), NX, NY, Q, *L->GetActorScale3D().ToString());
	}

	// THE LAKES: Unreal water bodies on the shorelines at their levels (the bed is the landscape's: they don't carve it), in one water
	// zone made first (else each lake made its own, about the landscape)
	FBox Bounds(ForceInit);
	for (const TSharedPtr<FJsonValue>& V : LJ->GetArrayField(TEXT("lakes"))) for (const TSharedPtr<FJsonValue>& P : V->AsObject()->GetArrayField(TEXT("pts"))) {
		const TArray<TSharedPtr<FJsonValue>>& XY = P->AsArray(); Bounds += HotBrookCoords::ToUE(XY[0]->AsNumber(), XY[1]->AsNumber(), V->AsObject()->GetNumberField(TEXT("level")));
	}
	AWaterZone* Zone = nullptr;
	{
		const FVector C = Bounds.GetCenter(), E = Bounds.GetExtent();
		Zone = World->SpawnActor<AWaterZone>(AWaterZone::StaticClass(), FTransform(C), SP);
		Zone->SetActorLabel(TEXT("Hot Brook water zone"));
		Zone->SetZoneExtent(FVector2D(E.X * 2.0 + 20000.0, E.Y * 2.0 + 20000.0));
	}
	TArray<AWaterBodyLake*> Lakes;
	for (const TSharedPtr<FJsonValue>& V : LJ->GetArrayField(TEXT("lakes"))) {
		const TSharedPtr<FJsonObject> O = V->AsObject(); const double Level = O->GetNumberField(TEXT("level"));
		AWaterBodyLake* Lake = World->SpawnActor<AWaterBodyLake>(AWaterBodyLake::StaticClass(), FTransform::Identity, SP);
		Lake->SetActorLabel(O->GetStringField(TEXT("name")));
		UWaterSplineComponent* S = Lake->GetWaterSpline(); S->ClearSplinePoints(false);
		for (const TSharedPtr<FJsonValue>& P : O->GetArrayField(TEXT("pts"))) {
			const TArray<TSharedPtr<FJsonValue>>& XY = P->AsArray(); const FVector W = HotBrookCoords::ToUE(XY[0]->AsNumber(), XY[1]->AsNumber(), Level);
			S->AddSplinePoint(W, ESplineCoordinateSpace::World, false);
		}
		for (int32 i = 0; i < S->GetNumberOfSplinePoints(); i++) S->SetSplinePointType(i, ESplinePointType::Linear, false);
		S->SetClosedLoop(true, false); S->UpdateSpline();
		if (UWaterBodyComponent* C = Lake->GetWaterBodyComponent()) { C->bAffectsLandscape = false; C->SetWaterZoneOverride(Zone); C->UpdateAll(FOnWaterBodyChangedParams()); }
		Lakes.Add(Lake);
		UE_LOG(LogHotBrookBuild, Display, TEXT("lake %s: %d points at %.2f m"), *O->GetStringField(TEXT("name")), S->GetNumberOfSplinePoints(), Level);
	}
	// (any other water zone the water bodies made for themselves goes)
	for (TActorIterator<AWaterZone> It(World); It; ++It) if (*It != Zone) World->DestroyActor(*It);

	// THE SKY: the physical atmosphere, the sun (its light through it), the sky's light captured live, volumetric clouds, a little haze
	{
		ADirectionalLight* Sun = World->SpawnActor<ADirectionalLight>(ADirectionalLight::StaticClass(), FTransform(FRotator(-38.0, 225.0, 0.0)), SP);
		Sun->SetActorLabel(TEXT("Sun")); Sun->SetMobility(EComponentMobility::Movable);
		UDirectionalLightComponent* SL = Cast<UDirectionalLightComponent>(Sun->GetLightComponent());
		SL->SetAtmosphereSunLight(true); SL->SetIntensity(10.f); SL->SetDynamicShadowDistanceMovableLight(20000.f);
		ASkyAtmosphere* Atm = World->SpawnActor<ASkyAtmosphere>(ASkyAtmosphere::StaticClass(), FTransform::Identity, SP); Atm->SetActorLabel(TEXT("Sky atmosphere"));
		ASkyLight* Sky = World->SpawnActor<ASkyLight>(ASkyLight::StaticClass(), FTransform::Identity, SP); Sky->SetActorLabel(TEXT("Sky light"));
		Sky->GetLightComponent()->SetMobility(EComponentMobility::Movable); Sky->GetLightComponent()->bRealTimeCapture = true; Sky->GetLightComponent()->bLowerHemisphereIsBlack = false;
		AVolumetricCloud* Cloud = World->SpawnActor<AVolumetricCloud>(AVolumetricCloud::StaticClass(), FTransform::Identity, SP); Cloud->SetActorLabel(TEXT("Clouds"));
		AExponentialHeightFog* Fog = World->SpawnActor<AExponentialHeightFog>(AExponentialHeightFog::StaticClass(), FTransform(FVector(0, 0, 0)), SP); Fog->SetActorLabel(TEXT("Haze"));
		Fog->GetComponent()->SetFogDensity(0.004f); Fog->GetComponent()->SetFogHeightFalloff(0.2f);
		APostProcessVolume* PP = World->SpawnActor<APostProcessVolume>(APostProcessVolume::StaticClass(), FTransform::Identity, SP); PP->SetActorLabel(TEXT("Camera"));
		PP->bUnbound = true;
	}

	// THE WALKER'S START: the east shore of Upper Hot Brook Lake, on the ground, facing the water
	{
		const double SX = 334.8, SY = -575.6;
		APlayerStart* PS = World->SpawnActor<APlayerStart>(APlayerStart::StaticClass(), FTransform(FRotator(0, 130.0, 0), HotBrookCoords::ToUE(SX, SY, GroundAt(SX, SY) + 1.2)), SP);
		PS->SetActorLabel(TEXT("Start on the shore"));
	}

	World->UpdateWorldComponents(true, false);
	const FString File = FPackageName::LongPackageNameToFilename(MapName, FPackageName::GetMapPackageExtension());
	FSavePackageArgs Args; Args.TopLevelFlags = RF_Public | RF_Standalone; Args.SaveFlags = SAVE_NoError;
	const bool Saved = UPackage::SavePackage(Pkg, World, *File, Args);
	UE_LOG(LogHotBrookBuild, Display, TEXT("%s %s"), Saved ? TEXT("saved") : TEXT("FAILED to save"), *File);
	// (the world taken down as the editor would: its subsystems deinitialised — else an ensure at exit)
	if (GEditor) GEditor->GetEditorWorldContext().SetCurrentWorld(nullptr);
	World->CleanupWorld(); World->DestroyWorld(true); World->RemoveFromRoot(); GWorld = nullptr;
	return Saved ? 0 : 1;
}
