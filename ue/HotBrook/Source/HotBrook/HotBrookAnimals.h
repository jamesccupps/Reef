// HotBrookAnimals — the forest's large animals as the live simulation has them (src/w3/forest3.js: each deer, moose and black bear
// with its place, heading, what it is doing — walking, grazing, browsing, drinking, wading, fishing, bedded, denned — its young, its
// length), drawn where they are: each a skinned mesh playing the gait that fits its speed or the idle that fits what it does, moved
// smoothly between the snapshots (20 a second), standing on the ground, scaled to its own length; its young at heel, sized for
// their age (forest3's lengths at birth and by month). The deer are the Animal Variety Pack's stag and doe; the black bear and the
// moose the human's own models (Scripts/import_animals.py) — a bull moose with his antlers from mid-May until he drops them about
// New Year, a cow without. A bear in its den isn't drawn.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookAnimals.generated.h"

class USkeletalMesh;
class USkeletalMeshComponent;
class UAnimSequence;
class UMaterialInterface;

UCLASS()
class HOTBROOK_API AHotBrookAnimals : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookAnimals();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	// a snapshot's animals: N records of 8 floats — id, kind (0 bear, 1 deer, 2 moose), x, y (the sim's metres), heading (rad: x += cos,
	// y += sin), act (0 walk, 1 graze, 2 browse, 3 drink, 4 wade, 5 fish, 6 bed, 7 den), young, length (m); the year's fraction from
	// March 1 (how old the young are; a bull's antlers)
	void Update(const float* Records, int32 N, float YearFrac);
	UPROPERTY(EditAnywhere, Category = "HotBrook") float DrawRadius = 1500.f;   // m from the walker
	// the animal of a kind nearest a place (the sim's metres) now: where it stands (UE), the yaw it faces, its length (m) — what a look at one
	// is framed on; false if there is none
	bool Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw, float& OutLen) const;
private:
	// a look: the mesh (facing +Y), its length nose to tail (cm), its gaits (each with its ground speed at the model's size, cm/s,
	// slowest first) and its idles
	struct FGait { TObjectPtr<UAnimSequence> Anim; float Speed = 100.f; };
	struct FLook {
		TObjectPtr<USkeletalMesh> Mesh; float Length = 200.f; TArray<FGait> Gaits;
		TObjectPtr<UAnimSequence> Graze, Browse, Drink, Fish, Idle, Rest;
		// the young: length at birth (m), growth (m a month), the most, and their birth's fraction of the year (forest3 YLEN, *_YF)
		float Y0 = 0.5f, YPerMonth = 0.1f, YMax = 1.f, YBorn = 0.25f;
	};
	struct FView {
		TObjectPtr<USkeletalMeshComponent> Body, Young;
		FVector2D From, To; double T0 = 0, T1 = 0; float Heading = 0, Yaw = 0, Speed = 0, Len = 1.8f; int32 Kind = 1, Act = 0; bool bSeen = true;
		TObjectPtr<UAnimSequence> Playing, YoungPlaying; int32 AntlersShown = -1;
	};
	FLook Stag, Doe, Bear, Moose;
	TObjectPtr<UMaterialInterface> Invisible, MooseAntler;
	// (every mesh, clip and material the looks hold — the plain structs above are unseen by the garbage collector, which freed the
	// clips no animal was playing about a minute in: the crash at the next change of gait)
	UPROPERTY() TArray<TObjectPtr<UObject>> Held;
	TMap<int32, FView> Views;
	double LastSnap = 0, SnapDt = 0.05; float YearNow = 0.3f;
	bool bLoaded = false;
	const FLook* LookOf(int32 Kind, float Len) const;
	float YoungLen(const FLook& L) const;
	UAnimSequence* Pick(const FLook& L, int32 Act, float Speed, float Scale, float& OutRate) const;
	void Play(USkeletalMeshComponent* C, TObjectPtr<UAnimSequence>& Playing, UAnimSequence* A, float Rate);
	USkeletalMeshComponent* NewBody(USkeletalMesh* Mesh);
};
