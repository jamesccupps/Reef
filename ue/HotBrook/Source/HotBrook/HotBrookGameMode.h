// HotBrookGameMode — the walker as the player. With -hbshot="X,Y,Yaw,Pitch,Name;…" on the command line (the sim's metres, degrees,
// a file name) the walker is set down at each spot in turn and a screenshot written to Saved/Screenshots/<Name>.png once the light
// has settled, then the game quits: how the view is checked without anyone at the keyboard. A sixth field runs console commands
// before that shot — "r.Some.Setting:0|ShowFlag.Fog:0" (':' for the space, '|' between commands) — to compare settings in one run.
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
	virtual void Tick(float Dt) override;
private:
	struct FShot { double X, Y, Yaw, Pitch; FString Name, Cmds; };
	TArray<FShot> Shots; int32 NextShot = 0; FTimerHandle ShotTimer;
	void PlaceNext();
	void TakeShot();
	// (the frame times before each shot: the game thread's and the GPU's, summed over the settling seconds — logged with the shot)
	double SumFrame = 0, SumGpu = 0, SumGame = 0, SumDraw = 0, SumRhi = 0; int32 NFrames = 0;
};
