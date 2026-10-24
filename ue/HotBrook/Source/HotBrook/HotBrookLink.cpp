#include "HotBrookLink.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "HotBrookForest.h"
#include "HotBrookAnimals.h"
#include "WebSocketsModule.h"
#include "IWebSocket.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Engine/DirectionalLight.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "GameFramework/PlayerController.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookLink, Log, All);
static constexpr int32 NSPECIES = 11;   // (the lakes' eleven fish: src/w3/species3.js)

AHotBrookLink::AHotBrookLink()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookLink::BeginPlay()
{
	Super::BeginPlay();
	for (TActorIterator<ADirectionalLight> It(GetWorld()); It; ++It) { Sun = *It; break; }
	// the fish: one instanced component a species — the engine's cone as a stand-in until each species has its model
	UStaticMesh* Body = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cone.Cone"));
	for (int32 s = 0; s < NSPECIES; s++) {
		UInstancedStaticMeshComponent* C = NewObject<UInstancedStaticMeshComponent>(this);
		C->SetStaticMesh(Body); C->SetMobility(EComponentMobility::Movable); C->SetCollisionEnabled(ECollisionEnabled::NoCollision); C->SetCastShadow(false);
		C->SetupAttachment(RootComponent); C->RegisterComponent(); FishBySpecies.Add(C);
	}
	FModuleManager::LoadModuleChecked<FWebSocketsModule>(TEXT("WebSockets"));
	Connect();
}

void AHotBrookLink::EndPlay(const EEndPlayReason::Type Reason)
{
	if (Socket.IsValid()) { Socket->OnRawMessage().Clear(); Socket->Close(); Socket.Reset(); }
	Super::EndPlay(Reason);
}

void AHotBrookLink::Connect()
{
	Socket = FWebSocketsModule::Get().CreateWebSocket(Url, TEXT(""));
	Socket->OnConnected().AddLambda([this]() { UE_LOG(LogHotBrookLink, Display, TEXT("connected to the simulation at %s"), *Url); });
	Socket->OnConnectionError().AddLambda([this](const FString& E) { NextTry = GetWorld() ? GetWorld()->GetTimeSeconds() + 3.0 : 0; });
	Socket->OnClosed().AddLambda([this](int32, const FString&, bool) { NextTry = GetWorld() ? GetWorld()->GetTimeSeconds() + 3.0 : 0; });
	// (a snapshot may come in pieces: gathered until the last)
	Socket->OnRawMessage().AddLambda([this](const void* Data, SIZE_T Size, SIZE_T Remaining) {
		Pending.Append((const uint8*)Data, Size);
		if (Remaining == 0) { Latest = MoveTemp(Pending); Pending.Reset(); bFresh = true; }
	});
	Socket->Connect();
}

void AHotBrookLink::Tick(float Dt)
{
	Super::Tick(Dt);
	const double Now = GetWorld()->GetTimeSeconds();
	if (Socket.IsValid() && !Socket->IsConnected() && NextTry > 0 && Now > NextTry) { NextTry = 0; Connect(); }
	if (bFresh) { bFresh = false; Apply(Latest); }
	// the walker's place, twice a second (the sim's metres; the view's reach 30 m)
	if (Socket.IsValid() && Socket->IsConnected() && Now > NextCam) {
		NextCam = Now + 0.5;
		const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const APawn* P = PC ? PC->GetPawn() : nullptr;
		if (P) { const FVector2D M = HotBrookCoords::ToSim(P->GetActorLocation()); Socket->Send(FString::Printf(TEXT("{\"cam\":[%.2f,%.2f,30]}"), M.X, M.Y)); }
	}
}

void AHotBrookLink::Apply(const TArray<uint8>& B)
{
	if (B.Num() < 48 || FMemory::Memcmp(B.GetData(), "HBS1", 4) != 0) return;
	const auto F = [&](int32 o) { float v; FMemory::Memcpy(&v, B.GetData() + o, 4); return v; };
	const auto U = [&](int32 o) { uint32 v; FMemory::Memcpy(&v, B.GetData() + o, 4); return v; };
	TimeOfDay = F(12); YearFrac = F(16); Weather = B[36];
	WindSpeed = F(20); WindFrom = B[37] * (2.0 * PI / 256.0);
	for (TActorIterator<AHotBrookForest> It(GetWorld()); It; ++It) It->SetWind(WindSpeed, WindFrom);   // (the branches move with it)
	const uint32 NF = U(40), NFo = U(44); FishNear = NF;
	if ((int64)48 + NF * 32 > B.Num()) return;
	// the forest's large animals after the fish: 8 floats each (AHotBrookAnimals reads them)
	if ((int64)48 + NF * 32 + NFo * 32 <= B.Num()) {
		TArray<float> Rec; Rec.SetNumUninitialized(NFo * 8); FMemory::Memcpy(Rec.GetData(), B.GetData() + 48 + NF * 32, NFo * 32);
		for (TActorIterator<AHotBrookAnimals> It(GetWorld()); It; ++It) It->Update(Rec.GetData(), NFo);
	}
	PlaceSun();
	// the fish: each one's place (the sim's metres; z is its depth below the surface), heading and pitch, length (cm), species
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	TArray<TArray<FTransform>> Per; Per.SetNum(NSPECIES);
	for (uint32 i = 0; i < NF; i++) {
		const int32 o = 48 + i * 32; const float X = F(o), Y = F(o + 4), Z = F(o + 8), Yaw = F(o + 12), Pitch = F(o + 16), Lcm = F(o + 20); const int32 Sp = FMath::Clamp((int32)F(o + 24), 0, NSPECIES - 1);
		float S = 0; FVector P = HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum);
		if (W && W->SurfaceAt(P, S)) P.Z = S - Z * 100.f; else continue;
		// (the cone points up its Z: laid along the fish — the sim's yaw is from east, counter-clockwise; UE's Y is south)
		const FRotator R(FMath::RadiansToDegrees(Pitch) - 90.f, -FMath::RadiansToDegrees(Yaw), 0.f);
		const float Len = FMath::Max(2.f, Lcm) / 100.f;   // (the cone is 1 m tall: this many metres)
		Per[Sp].Add(FTransform(R, P, FVector(Len * 0.25f, Len * 0.12f, Len)));
	}
	for (int32 s = 0; s < NSPECIES; s++) {
		UInstancedStaticMeshComponent* C = FishBySpecies[s]; const int32 N = Per[s].Num(), Have = C->GetInstanceCount();
		if (Have > N) { for (int32 k = Have - 1; k >= N; k--) C->RemoveInstance(k); }
		for (int32 k = 0; k < N; k++) { if (k < Have) C->UpdateInstanceTransform(k, Per[s][k], true, false, true); else C->AddInstance(Per[s][k], true); }
		C->MarkRenderStateDirty();
	}
}

void AHotBrookLink::PlaceSun()
{
	if (!Sun) return;
	// the sun for the date and the hour at 45.63° N (sky3.js sunDir): the declination by the day of the year, the hour angle by the time
	const double Lat = FMath::DegreesToRadians(45.63), N = FMath::Fmod(YearFrac * 365.0 + 59.0, 365.0);
	const double Dec = FMath::DegreesToRadians(23.44) * FMath::Sin(2.0 * PI * (284.0 + N) / 365.0), H = FMath::DegreesToRadians((TimeOfDay * 24.0 - 12.0) * 15.0);
	const double SinAlt = FMath::Sin(Lat) * FMath::Sin(Dec) + FMath::Cos(Lat) * FMath::Cos(Dec) * FMath::Cos(H), Alt = FMath::Asin(SinAlt);
	const double Az = FMath::Atan2(-FMath::Sin(H) * FMath::Cos(Dec), FMath::Cos(Lat) * FMath::Sin(Dec) - FMath::Sin(Lat) * FMath::Cos(Dec) * FMath::Cos(H));
	const FVector ToSun(FMath::Cos(Alt) * FMath::Sin(Az), -FMath::Cos(Alt) * FMath::Cos(Az), SinAlt);   // (UE: X east, Y south, Z up)
	if (SunDirSet.IsZero() || FVector::DotProduct(SunDirSet, ToSun) < FMath::Cos(FMath::DegreesToRadians(0.2))) { Sun->SetActorRotation((-ToSun).Rotation()); SunDirSet = ToSun; }
}
