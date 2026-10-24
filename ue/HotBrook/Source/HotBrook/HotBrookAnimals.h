// HotBrookAnimals — the forest's large animals as the live simulation has them (src/w3/forest3.js: each deer, moose and black bear
// with its place, heading, what it is doing — walking, grazing, browsing, drinking, wading, bedded — its young, its length), drawn
// where they are: each a skinned mesh playing the gait or idle that fits what it does and how fast it goes, moved smoothly between
// the snapshots (20 a second), standing on the ground, scaled to its own length. The deer are the Animal Variety Pack's stag and
// doe (a doe with a fawn at heel when she has young); the moose and the bears wait for models of their own.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookAnimals.generated.h"

class USkeletalMesh;
class USkeletalMeshComponent;
class UAnimSequence;

UCLASS()
class HOTBROOK_API AHotBrookAnimals : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookAnimals();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	// a snapshot's animals: N records of 8 floats — id, kind (0 bear, 1 deer, 2 moose), x, y (the sim's metres), heading (rad: x += cos,
	// y += sin), act (0 walk, 1 graze, 2 browse, 3 drink, 4 wade, 5 fish, 6 bed, 7 den), young, length (m)
	void Update(const float* Records, int32 N);
	UPROPERTY(EditAnywhere, Category = "HotBrook") float DrawRadius = 1500.f;   // m from the walker
private:
	struct FLook { TObjectPtr<USkeletalMesh> Mesh; float Length = 200.f; TObjectPtr<UAnimSequence> Walk, Run, Graze, Browse, Idle, Rest; float WalkSpeed = 130.f, RunSpeed = 700.f; };
	struct FView {
		TObjectPtr<USkeletalMeshComponent> Body, Young;
		FVector2D From, To; double T0 = 0, T1 = 0; float Heading = 0, Yaw = 0, Speed = 0, Len = 1.8f; int32 Act = 0; bool bSeen = true;
		TObjectPtr<UAnimSequence> Playing, YoungPlaying;
	};
	FLook Stag, Doe;
	TMap<int32, FView> Views;
	double LastSnap = 0, SnapDt = 0.05;
	bool bLoaded = false;
	UAnimSequence* Pick(const FLook& L, int32 Act, float Speed) const;
	void Play(USkeletalMeshComponent* C, TObjectPtr<UAnimSequence>& Playing, UAnimSequence* A, float Rate);
};
