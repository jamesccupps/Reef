#include "HotBrookNightSky.h"
#include "HotBrookLink.h"
#include "Components/StaticMeshComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Engine/DirectionalLight.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "Camera/PlayerCameraManager.h"
#include "GameFramework/PlayerController.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"
#include "Misc/DateTime.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookNight, Log, All);

AHotBrookNightSky::AHotBrookNightSky()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookNightSky::BeginPlay()
{
	Super::BeginPlay();
	for (TActorIterator<ADirectionalLight> It(GetWorld()); It; ++It) { Sun = *It; break; }
	// the dome: the engine's sphere, 50 km across its radius, about the camera; drawn added over the sky
	UStaticMesh* Ball = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	UMaterialInterface* M = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Materials/M_HB_NightSky.M_HB_NightSky"));
	if (Ball && M) {
		Dome = NewObject<UStaticMeshComponent>(this); Dome->SetStaticMesh(Ball); Dome->SetMobility(EComponentMobility::Movable);
		Dome->SetCollisionEnabled(ECollisionEnabled::NoCollision); Dome->SetCastShadow(false); Dome->bAffectDistanceFieldLighting = false;
		Dome->bNeverDistanceCull = true; Dome->SetWorldScale3D(FVector(100000.0)); Dome->SetupAttachment(RootComponent); Dome->RegisterComponent();
		Mat = UMaterialInstanceDynamic::Create(M, this); Dome->SetMaterial(0, Mat);
	} else UE_LOG(LogHotBrookNight, Warning, TEXT("no M_HB_NightSky (Scripts/make_night_sky_material.py): no stars"));
	// the moon's light: the sky atmosphere's second sun
	FActorSpawnParameters SP; SP.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
	Moon = GetWorld()->SpawnActor<ADirectionalLight>(ADirectionalLight::StaticClass(), FTransform::Identity, SP);
	if (Moon) {
		Moon->SetMobility(EComponentMobility::Movable);
		if (UDirectionalLightComponent* L = Cast<UDirectionalLightComponent>(Moon->GetLightComponent())) {
			L->SetAtmosphereSunLight(true); L->SetAtmosphereSunLightIndex(1); L->SetLightColor(FLinearColor(0.62f, 0.72f, 1.0f)); L->SetIntensity(0.f);
			L->SetDynamicShadowDistanceMovableLight(15000.f); L->AtmosphereSunDiskColorScale = FLinearColor::Black;   // (its disc is the dome's, phased)
		}
	}
}

void AHotBrookNightSky::Tick(float Dt)
{
	Super::Tick(Dt);
	float Yf = 0.3f, Tod = 0.5f;
	for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Yf = It->YearFrac; Tod = It->TimeOfDay; break; }
	// the dome about the camera
	if (Dome) if (const APlayerController* PC = GetWorld()->GetFirstPlayerController()) if (PC->PlayerCameraManager) Dome->SetWorldLocation(PC->PlayerCameraManager->GetCameraLocation());
	// the sun's place (AHotBrookLink::PlaceSun's), its ecliptic longitude and right ascension; the local sidereal time from its hour angle
	const double Lat = FMath::DegreesToRadians(45.63), Eps = FMath::DegreesToRadians(23.44), N = FMath::Fmod(Yf * 365.0 + 59.0, 365.0);
	const double Hs = FMath::DegreesToRadians((Tod * 24.0 - 12.0) * 15.0);
	const double Ls = 2.0 * PI * (N - 80.0) / 365.25;
	const double RAs = FMath::Atan2(FMath::Cos(Eps) * FMath::Sin(Ls), FMath::Cos(Ls)), LST = RAs + Hs;
	const FVector ToSun = Sun ? -Sun->GetActorForwardVector() : FVector(0, 0, -1);
	// the moon: its age this year at this date and hour (Maine's local time ~ UTC−5), its elongation from the sun along the ecliptic
	const FDateTime At = FDateTime(2026, 3, 1) + FTimespan::FromDays(Yf * 365.0 + Tod + 5.0 / 24.0);
	const double Age = FMath::Fmod((At - FDateTime(2000, 1, 6, 18, 14)).GetTotalDays(), 29.530589), El = 2.0 * PI * Age / 29.530589;
	Lit = (float)(0.5 * (1.0 - FMath::Cos(El)));
	const double Lm = Ls + El, Dm = FMath::Asin(FMath::Sin(Eps) * FMath::Sin(Lm)), RAm = FMath::Atan2(FMath::Cos(Eps) * FMath::Sin(Lm), FMath::Cos(Lm));
	const double Hm = LST - RAm;
	const double SinAlt = FMath::Sin(Lat) * FMath::Sin(Dm) + FMath::Cos(Lat) * FMath::Cos(Dm) * FMath::Cos(Hm), Alt = FMath::Asin(SinAlt);
	const double Az = FMath::Atan2(-FMath::Sin(Hm) * FMath::Cos(Dm), FMath::Cos(Lat) * FMath::Sin(Dm) - FMath::Sin(Lat) * FMath::Cos(Dm) * FMath::Cos(Hm));
	const FVector ToMoon(FMath::Cos(Alt) * FMath::Sin(Az), -FMath::Cos(Alt) * FMath::Cos(Az), SinAlt);
	// the night's depth: the stars come out as the sun sinks from 2° to 14° under the horizon
	const float NightK = FMath::Clamp((float)(-ToSun.Z - 0.035) / 0.2f, 0.f, 1.f);
	if (Mat) {
		Mat->SetScalarParameterValue(TEXT("LST"), (float)LST); Mat->SetScalarParameterValue(TEXT("Night"), NightK);
		Mat->SetVectorParameterValue(TEXT("MoonDir"), FLinearColor(ToMoon.X, ToMoon.Y, ToMoon.Z)); Mat->SetVectorParameterValue(TEXT("SunDir"), FLinearColor(ToSun.X, ToSun.Y, ToSun.Z));
		Mat->SetScalarParameterValue(TEXT("MoonGain"), 3.f * (0.25f + 0.75f * NightK));
	}
	// the moonlight: the sun's ×0.004 at the full (the dark-adapted eye's), by its lit share and its height, only by night
	if (Moon) {
		Moon->SetActorRotation((-ToMoon).Rotation());
		if (UDirectionalLightComponent* L = Cast<UDirectionalLightComponent>(Moon->GetLightComponent())) {
			const float SunI = Sun && Sun->GetLightComponent() ? Sun->GetLightComponent()->Intensity : 10.f;
			L->SetIntensity(SunI * 0.004f * Lit * FMath::SmoothStep(-0.02f, 0.12f, (float)SinAlt) * NightK);
		}
	}
}
