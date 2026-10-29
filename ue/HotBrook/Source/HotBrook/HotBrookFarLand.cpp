#include "HotBrookFarLand.h"
#include "HotBrookLink.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "HAL/IConsoleManager.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookFarLand, Log, All);

AHotBrookFarLand::AHotBrookFarLand()
{
	PrimaryActorTick.bCanEverTick = true; PrimaryActorTick.TickInterval = 1.f;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookFarLand::BeginPlay()
{
	Super::BeginPlay();
	UStaticMesh* M = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/HotBrook/Landmarks/farland/SM_farland.SM_farland"));
	if (!M) { UE_LOG(LogHotBrookFarLand, Warning, TEXT("no far land (ue/export/build_farland.py, then HB_SET=landmarks HB_ONLY=farland Scripts/import_creatures.py)")); return; }
	// (its vertices are in the sim's metres about the origin, heights less the datum: placed where it was made)
	Land = NewObject<UStaticMeshComponent>(this); Land->SetStaticMesh(M); Land->SetMobility(EComponentMobility::Movable);
	Land->SetCollisionEnabled(ECollisionEnabled::NoCollision); Land->bAffectDistanceFieldLighting = false; Land->bNeverDistanceCull = true;
	Land->SetupAttachment(RootComponent); Land->RegisterComponent();
	if (UMaterialInterface* FM = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Materials/M_HB_FarLand.M_HB_FarLand"))) {
		Mat = UMaterialInstanceDynamic::Create(FM, this);
		for (int32 i = 0; i < Land->GetNumMaterials(); i++) Land->SetMaterial(i, Mat);
	} else UE_LOG(LogHotBrookFarLand, Warning, TEXT("no M_HB_FarLand (Scripts/make_farland_material.py): the far land in its summer photo all year"));
	UE_LOG(LogHotBrookFarLand, Display, TEXT("the far land: %s"), *M->GetBounds().GetBox().ToString());
}

void AHotBrookFarLand::Tick(float Dt)
{
	Super::Tick(Dt);
	if (!Mat) return;
	// the date its leaves show: hb.LeafDate (the forest's), or the sim's
	float Yf = 0.3f;
	static IConsoleVariable* Force = IConsoleManager::Get().FindConsoleVariable(TEXT("hb.LeafDate"));
	if (Force && Force->GetFloat() >= 0.f) Yf = Force->GetFloat(); else for (TActorIterator<AHotBrookLink> It(GetWorld()); It; ++It) { Yf = It->YearFrac; break; }
	// (the forest's calendar, its hardwoods together: turning from mid-September, the colours at their height in early October, down
	// by the end of the month; out again in the second half of May)
	const float Autumn = FMath::SmoothStep(0.545f, 0.60f, Yf) * (1.f - FMath::SmoothStep(0.625f, 0.665f, Yf));
	const float Bare = FMath::Max(FMath::SmoothStep(0.62f, 0.67f, Yf), 1.f - FMath::SmoothStep(0.19f, 0.225f, Yf));
	Mat->SetScalarParameterValue(TEXT("Autumn"), Autumn); Mat->SetScalarParameterValue(TEXT("Bare"), Bare);
}
