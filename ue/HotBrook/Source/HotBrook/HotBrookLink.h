// HotBrookLink — the live simulation in the first-person world: a WebSocket client of ue/link/simhost.mjs (ws://127.0.0.1:8771),
// which runs the Synapse Reef sim of the lakes at real time. Each snapshot ("HBS2"): the clock (the sun placed for the date and the
// hour at 45.63° N, as the browser's sky3.js), the weather and wind, the fish near the walker (AHotBrookFish draws them), the forest's
// large animals (AHotBrookAnimals). The walker's place goes back twice a second, so the sim keeps its
// fish-by-fish detail about it. Without the host running the world stands still at its default noon; it keeps trying to connect.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookLink.generated.h"

class IWebSocket;
class ADirectionalLight;
class UMaterialParameterCollection;

UCLASS()
class HOTBROOK_API AHotBrookLink : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookLink();
	virtual void BeginPlay() override;
	virtual void EndPlay(const EEndPlayReason::Type Reason) override;
	virtual void Tick(float Dt) override;
	UPROPERTY(EditAnywhere, Category = "HotBrook") FString Url = TEXT("ws://127.0.0.1:8771");
	// the sim's clock as last heard: 0–1 of a day, the year's fraction from March 1, the weather (0 clear … 3 storm)
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") float TimeOfDay = 0.5f;
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") float YearFrac = 0.3f;
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") int32 Weather = 0;
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") int32 FishNear = 0;
	// the wind: m/s, and the bearing it blows FROM (radians, 0 north, clockwise)
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") float WindSpeed = 3.f;
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") float WindFrom = 3.93f;
	// the air (°C) and the sun's light (0–1) as last heard
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") float Air = 15.f;
	// the sim's clock (s since it began — its day: the camps' who-is-in draw, camps3.js occupied)
	double SimTime = 0.0;
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") float Daylight = 0.6f;
private:
	TSharedPtr<IWebSocket> Socket;
	TArray<uint8> Pending, Latest; bool bFresh = false;
	double NextTry = 0, NextCam = 0;
	float Night = 0.f;   // (0 day … 1 night: the sun's height)
	TObjectPtr<ADirectionalLight> Sun = nullptr;
	FVector SunDirSet = FVector::ZeroVector;   // (where the sun was last turned to)
	// the snow on the land (MPC_HB_Season 'Snow', which the ground's and the camps' materials read): on when the lakes have frozen, off
	// when their ice has gone (the browser's rule: the land's snow comes and goes with the sim's ice), eased over ten seconds
	UPROPERTY() TObjectPtr<UMaterialParameterCollection> Season;
	float SnowNow = -1.f, SnowWant = 0.f;
	void Connect();
	void Apply(const TArray<uint8>& B);
	void PlaceSun();
};
