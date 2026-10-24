// HotBrookGameMode — the walker as the player. With -hbshot="X,Y,Yaw,Pitch,Name;…" on the command line (the sim's metres, degrees,
// a file name) the walker is set down at each spot in turn and a screenshot written to Saved/Screenshots/<Name>.png once the light
// has settled, then the game quits: how the view is checked without anyone at the keyboard. A sixth field runs console commands
// before that shot — "r.Some.Setting:0|ShowFlag.Fog:0" (':' for the space, '|' between commands) — to compare settings in one run;
// among them "nearfish" frames the shot on the fish nearest the spot, from its side a few lengths off, just before it is taken, and
// "nearbear", "neardeer", "nearmoose" set the walker down by the nearest of those and frame it from its side.
// With -hbwalk="X0,Y0,X1,Y1[,m/s]" the walker is instead walked along that line at a walking pace (1.45 m/s) once -hbwait is up,
// the frame times logged every two seconds (the forest and the ground cover streaming in as they would), then the game quits.
// With -hbpaddle=N the walker gets into the canoe and paddles it for N seconds (its speed and heading logged), then a picture, then quits.
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
	// the walker set down where the player chose to start — Import/start.json {"x", "y", "yaw"} (the sim's metres, UE degrees; kept
	// out of the repo: a player's own place) or -hbstart=X,Y,Yaw — on the ground, or the nearest dry ground if that is water; the
	// level's start without either
	virtual APawn* SpawnDefaultPawnFor_Implementation(AController* NewPlayer, AActor* StartSpot) override;
	virtual void FinishRestartPlayer(AController* NewPlayer, const FRotator& StartRotation) override;
private:
	bool bHaveStart = false; FVector StartAt = FVector::ZeroVector; float StartYaw = 0.f;
	bool FindStart();
	struct FShot { double X, Y, Yaw, Pitch; FString Name, Cmds; FString Near; };
	TArray<FShot> Shots; int32 NextShot = 0; FTimerHandle ShotTimer; int32 Framed = 0;
	UPROPERTY() TObjectPtr<class ACameraActor> ShotCam = nullptr;
	void PlaceNext();
	void TakeShot();
	// (the frame times before each shot: the game thread's and the GPU's, summed over the settling seconds — logged with the shot)
	double SumFrame = 0, SumGpu = 0, SumGame = 0, SumDraw = 0, SumRhi = 0; int32 NFrames = 0;
	// (the walk test)
	bool bWalk = false, bWalking = false; FVector2D WalkA, WalkB; double WalkSpeed = 1.45, WalkT0 = 0, NextLog = 0, MaxFrame = 0;
	void StartWalk();
	// (the canoe test, -hbpaddle=seconds: aboard, steady strokes with a little turn, its speed logged each second, a picture at the end)
	double PaddleFor = 0, PaddleT0 = -1, NextPaddleLog = 0; void StartPaddle();
	bool bStats = false; double StatsT0 = -1, NextStats = 0, QuitAt = 0;
};
