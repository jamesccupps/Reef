// HotBrookLink — the live simulation in the first-person world: a WebSocket client of ue/link/simhost.mjs (ws://127.0.0.1:8771),
// which runs the Synapse Reef sim of the lakes at real time. Each snapshot ("HBS1"): the clock (the sun placed for the date and the
// hour at 45.63° N, as the browser's sky3.js), the weather and wind, the fish near the walker (drawn as instances, one component a
// species, at their places and headings), the forest's large animals. The walker's place goes back twice a second, so the sim keeps its
// fish-by-fish detail about it. Without the host running the world stands still at its default noon; it keeps trying to connect.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookLink.generated.h"

class IWebSocket;
class UInstancedStaticMeshComponent;
class ADirectionalLight;

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
private:
	TSharedPtr<IWebSocket> Socket;
	TArray<uint8> Pending, Latest; bool bFresh = false;
	double NextTry = 0, NextCam = 0;
	TArray<TObjectPtr<UInstancedStaticMeshComponent>> FishBySpecies;
	TObjectPtr<ADirectionalLight> Sun = nullptr;
	void Connect();
	void Apply(const TArray<uint8>& B);
	void PlaceSun();
};
