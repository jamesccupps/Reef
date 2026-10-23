// HotBrookGameMode — the walker as the player. With -hbshot="X,Y,Yaw,Pitch,Name;…" on the command line (the sim's metres, degrees,
// a file name) the walker is set down at each spot in turn and a screenshot written to Saved/Screenshots/<Name>.png once the light
// has settled, then the game quits: how the view is checked without anyone at the keyboard.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "HotBrookGameMode.generated.h"

UCLASS()
class HOTBROOK_API AHotBrookGameMode : public AGameModeBase
{
	GENERATED_BODY()
public:
	AHotBrookGameMode();
	virtual void BeginPlay() override;
private:
	struct FShot { double X, Y, Yaw, Pitch; FString Name; };
	TArray<FShot> Shots; int32 NextShot = 0; FTimerHandle ShotTimer;
	void PlaceNext();
	void TakeShot();
};
