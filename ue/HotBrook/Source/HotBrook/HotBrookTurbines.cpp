#include "HotBrookTurbines.h"
#include "GameFramework/PlayerController.h"
#include "Camera/PlayerCameraManager.h"
#include "HotBrookCoords.h"
#include "HotBrookLink.h"
#include "HotBrookWater.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookTurbines, Log, All);

namespace
{
	const FVector HUB(260.0, 0.0, 8160.0);       // (the rotor's centre on the tower, cm: build_turbine.py's (2.6, 0, 81.6) m)
	const FVector BEACON(-300.0, 0.0, 8380.0);   // (the beacon on the nacelle's roof, aft)
}

AHotBrookTurbines::AHotBrookTurbines()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookTurbines::BeginPlay()
{
	Super::BeginPlay();
	FString Text; TSharedPtr<FJsonObject> J;
	if (!FFileHelper::LoadFileToString(Text, *FPaths::Combine(FPaths::ProjectDir(), TEXT("Import"), TEXT("turbines.json"))) || !FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), J) || !J.IsValid()) {
		UE_LOG(LogHotBrookTurbines, Warning, TEXT("no Import/turbines.json (ue/export/export_turbines.mjs): no wind farm")); return;
	}
	UStaticMesh* TowerM = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HotBrook/Landmarks/turbine_tower/SM_turbine_tower.SM_turbine_tower"));
	UStaticMesh* RotorM = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HotBrook/Landmarks/turbine_rotor/SM_turbine_rotor.SM_turbine_rotor"));
	UStaticMesh* Ball = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	if (!TowerM || !RotorM) { UE_LOG(LogHotBrookTurbines, Warning, TEXT("no turbine meshes (ue/export/build_turbine.py, then HB_SET=landmarks Scripts/import_creatures.py)")); return; }
	Held.Add(TowerM); Held.Add(RotorM); if (Ball) Held.Add(Ball);
	if (UMaterialInterface* BM = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Landmarks/M_HB_Beacon.M_HB_Beacon"))) BeaconMat = UMaterialInstanceDynamic::Create(BM, this);
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	const auto Make = [&](UStaticMesh* M) {
		UStaticMeshComponent* C = NewObject<UStaticMeshComponent>(this); C->SetStaticMesh(M); C->SetMobility(EComponentMobility::Movable);
		C->SetCollisionEnabled(ECollisionEnabled::NoCollision); C->bAffectDistanceFieldLighting = false; C->SetupAttachment(RootComponent); C->RegisterComponent(); return C; };
	int32 NLit = 0, NOn = 0;
	for (const TSharedPtr<FJsonValue>& V : J->GetArrayField(TEXT("turbines"))) {
		const TSharedPtr<FJsonObject> T = V->AsObject();
		FTurbine Tb; const double X = T->GetNumberField(TEXT("x")), Y = T->GetNumberField(TEXT("y"));
		Tb.Base = HotBrookCoords::ToUE(X, Y, T->GetNumberField(TEXT("ground")));
		float G; if (W && W->GroundAt(Tb.Base, G)) { Tb.Base.Z = G; NOn++; }   // (on the landscape where it reaches)
		else Tb.Base.Z -= HotBrookCoords::EarthDrop(X, Y) * 100.0;   // (beyond it, on the far land: sunk by the Earth's curve as it is)
		const uint32 H = GetTypeHash(FVector2D(X, Y)); Tb.YawOff = ((H & 255) / 255.f - 0.5f) * 10.f; Tb.Angle = ((H >> 8) & 255) / 255.f * 120.f;
		Tb.Tower = Make(TowerM); Tb.Rotor = Make(RotorM);
		if (Ball && BeaconMat && T->GetBoolField(TEXT("lit"))) { Tb.Beacon = Make(Ball); Tb.Beacon->SetWorldScale3D(FVector(0.6)); Tb.Beacon->SetMaterial(0, BeaconMat); Tb.Beacon->SetCastShadow(false); NLit++; }
		Turbines.Add(Tb);
	}
	UE_LOG(LogHotBrookTurbines, Display, TEXT("wind farm: %d turbines (%d on the landscape, the rest on their own ground beyond it), %d with beacons"), Turbines.Num(), NOn, NLit);
}

void AHotBrookTurbines::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!Turbines.Num()) return;
	float Wind = 4.f, From = 3.93f, Day = 0.6f;
	for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Wind = It->WindSpeed; From = It->WindFrom; Day = It->Daylight; break; }
	// the rotor's speed at its hub's wind (a GE 1.5-77: cut-in 3.5 m/s, 10.1 rpm rising to 20.4 at ~12 m/s), spooling up and down
	const float Hub = Wind * 1.338f, Want = Hub < 3.5f ? 0.f : FMath::Min(20.4f, 10.1f + (Hub - 3.5f) / 8.5f * 10.3f);
	Rpm = FMath::FInterpTo(Rpm, Want, Dt, 0.2f);
	// facing where the wind comes from (the bearing it blows FROM: clockwise from north) — the nacelle's +X toward it
	const float Into = FMath::RadiansToDegrees(FMath::Atan2(-FMath::Cos(From), FMath::Sin(From)));
	FVector Cam = FVector::ZeroVector; if (const APlayerController* PC = GetWorld()->GetFirstPlayerController()) if (PC->PlayerCameraManager) Cam = PC->PlayerCameraManager->GetCameraLocation();
	for (FTurbine& T : Turbines) {
		if (!T.bSet) { T.Yaw = Into + T.YawOff; T.bSet = true; }
		T.Yaw += FMath::Clamp(FMath::FindDeltaAngleDegrees(T.Yaw, Into + T.YawOff), -0.5f * Dt, 0.5f * Dt);   // (0.5°/s: a turbine's slow yaw)
		T.Angle = FMath::Fmod(T.Angle + Rpm / 60.f * 360.f * Dt, 360.f);
		const FRotator R(0.f, T.Yaw, 0.f);
		T.Tower->SetWorldLocationAndRotation(T.Base, R);
		T.Rotor->SetWorldLocationAndRotation(T.Base + R.RotateVector(HUB), FRotator(0.f, T.Yaw, T.Angle));
		if (T.Beacon) {
			// (a 2,000-candela lamp is a bright point from miles off — at 3.5 km as bright as Venus at its brightest —, never smaller than the eye's blur: the lamp held at ~1.5 mrad across)
			const FVector At = T.Base + R.RotateVector(BEACON);
			T.Beacon->SetWorldLocationAndRotation(At, FRotator::ZeroRotator); T.Beacon->SetWorldScale3D(FVector(FMath::Max(0.6, FVector::Dist(At, Cam) * 1.5e-5)));
		}
	}
	// the beacons by night: all of them together, 30 flashes a minute
	if (BeaconMat) { const double Tm = GetWorld()->GetTimeSeconds(); BeaconMat->SetScalarParameterValue(TEXT("Glow"), Day < 0.15f && FMath::Fmod(Tm, 2.0) < 0.6 ? 300.f : 0.f); }
}
