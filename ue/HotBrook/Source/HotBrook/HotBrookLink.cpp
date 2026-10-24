#include "HotBrookLink.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "HotBrookForest.h"
#include "HotBrookAnimals.h"
#include "HotBrookFish.h"
#include "HotBrookWildlife.h"
#include "HotBrookBoat.h"
#include "WebSocketsModule.h"
#include "IWebSocket.h"
#include "Components/DirectionalLightComponent.h"
#include "Engine/DirectionalLight.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "GameFramework/PlayerController.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookLink, Log, All);

AHotBrookLink::AHotBrookLink()
{
	PrimaryActorTick.bCanEverTick = true;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

void AHotBrookLink::BeginPlay()
{
	Super::BeginPlay();
	for (TActorIterator<ADirectionalLight> It(GetWorld()); It; ++It) { Sun = *It; break; }
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
	if (B.Num() < 48 || FMemory::Memcmp(B.GetData(), "HBS2", 4) != 0) return;
	const auto F = [&](int32 o) { float v; FMemory::Memcpy(&v, B.GetData() + o, 4); return v; };
	const auto U = [&](int32 o) { uint32 v; FMemory::Memcpy(&v, B.GetData() + o, 4); return v; };
	TimeOfDay = F(12); YearFrac = F(16); Weather = B[36];
	WindSpeed = F(20); WindFrom = B[37] * (2.0 * PI / 256.0); Daylight = F(24); Air = F(28);
	for (TActorIterator<AHotBrookForest> It(GetWorld()); It; ++It) It->SetWind(WindSpeed, WindFrom);   // (the branches move with it)
	for (TActorIterator<AHotBrookBoat> It(GetWorld()); It; ++It) { It->WindSpeed = WindSpeed; It->WindFrom = WindFrom; }   // (and a canoe drifts)
	const uint32 NF = U(40), NFo = U(44); FishNear = NF;
	const int64 FishEnd = 48 + (int64)NF * AHotBrookFish::Stride;
	if (FishEnd > B.Num()) return;
	PlaceSun();
	// the fish (AHotBrookFish draws them), then the forest's large animals: 8 floats each (AHotBrookAnimals)
	for (TActorIterator<AHotBrookFish> It(GetWorld()); It; ++It) It->Update(B.GetData() + 48, NF, Night);
	const int64 ForestEnd = FishEnd + (int64)NFo * 32;
	if (ForestEnd <= B.Num()) {
		TArray<float> Rec; Rec.SetNumUninitialized(NFo * 8); FMemory::Memcpy(Rec.GetData(), B.GetData() + FishEnd, NFo * 32);
		for (TActorIterator<AHotBrookAnimals> It(GetWorld()); It; ++It) It->Update(Rec.GetData(), NFo, YearFrac);
	}
	// the lakes' wildlife: how many of each and how active (2 floats a kind), then the fish they took (6 floats each) — AHotBrookWildlife
	if (ForestEnd + 4 <= B.Num()) {
		const int32 NK = (int32)U(ForestEnd); const int64 Ev = ForestEnd + 4 + (int64)NK * 8;
		if (NK <= 64 && Ev + 4 <= B.Num()) {
			const int32 NW = (int32)U(Ev);
			if (Ev + 4 + (int64)NW * 24 <= B.Num()) {
				TArray<float> Cnt, Act, Tk; Cnt.SetNum(NK); Act.SetNum(NK); Tk.SetNumUninitialized(NW * 6);
				for (int32 k = 0; k < NK; k++) { Cnt[k] = F(ForestEnd + 4 + k * 8); Act[k] = F(ForestEnd + 8 + k * 8); }
				if (NW) FMemory::Memcpy(Tk.GetData(), B.GetData() + Ev + 4, NW * 24);
				for (TActorIterator<AHotBrookWildlife> It(GetWorld()); It; ++It) It->Update(Cnt.GetData(), Act.GetData(), NK, Tk.GetData(), NW, YearFrac, F(32));
			}
		}
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
	Night = FMath::Clamp((0.05f - (float)SinAlt) * 8.f, 0.f, 1.f);   // (dusk: the sun 3° up to 4° down)
	if (SunDirSet.IsZero() || FVector::DotProduct(SunDirSet, ToSun) < FMath::Cos(FMath::DegreesToRadians(0.2))) { Sun->SetActorRotation((-ToSun).Rotation()); SunDirSet = ToSun; }
}
