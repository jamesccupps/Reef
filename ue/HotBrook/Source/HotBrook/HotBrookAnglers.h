// HotBrookAnglers — the people fishing the lakes, as the live simulation has them (fish3 WILD3 'angler' and 'iceAngler' through the
// link: their seasons — open water May to November, the ice January to March — and their hours) and as the browser's
// render3/wild3view.js draws them ("THE ANGLERS", "THE ICE CAMP"). The numbers are the research's: Upper ~12 angler-hours a hectare a
// year, Lower ~4 — four-fifths in open water, Upper ~1.2 boats out at a time by day, Lower ~0.35; a fifth through the ice, ~1.2 and
// ~0.3 camps (wild3view ANGLERS). Every fish the sim's anglers take (fish3 wildEv) is a fish on for the nearest of them.
//   - IN A BOAT: a 14-ft aluminium skiff with its outboard (build_camps.py 'boat_skiff_running') out from a camp's dock to a bass spot
//     (1.2–3.5 m of water within ~25 m of the shore), the motor's run there, then drifting on the wind, the angler (convert_people.py's
//     'angler_summer') turned on the stern seat toward the shore casting every half minute or so and reeling in; a fish on — reeling a
//     while; a new spot every 15–30 minutes; home at dusk.
//   - ON THE ICE (when the sim's ice holds a person, ≥ 20 cm): a pop-up shelter over the perch holes in the deep basin, a sled, the
//     jigger ('angler_winter') on a bucket by his hole jigging a short rod, and five tip-ups along the 1–3-m water toward the shore
//     for pickerel — a flag up when the sim's ice anglers take a fish.
// `hb.AllLife 1` (AHotBrookWildlife's) brings them out whatever the season or hour.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookAnglers.generated.h"

class UStaticMesh;
class UStaticMeshComponent;
class USkeletalMesh;
class USkeletalMeshComponent;
class UAnimSequence;
class AHotBrookWildlife;

UCLASS()
class HOTBROOK_API AHotBrookAnglers : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookAnglers();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float DrawRadius = 2500.f;   // m from the walker
	// the nearest angler (0 in a boat, 1 on the ice) to a place (the sim's metres): where he is (UE), the way he faces
	bool Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw) const;
private:
	struct FPerson { TObjectPtr<USkeletalMesh> Mesh; TMap<FString, TObjectPtr<UAnimSequence>> Clips; FName Hand; float Pelvis = 90.f, Scale = 1.f; };
	struct FLake { TArray<FVector2D> Pts; FBox2D Box; double Area = 0; float Level = 0; bool bUpper = false; TArray<FVector2D> Docks, DockDir; };
	struct FBoat {
		int32 Lake = 0, State = 0; FVector2D P, Goal, Home; float Heading = 0, Speed = 0, Side = 1.f, Turn = 0; double Until = 0, ClipAt = 0, FishOn = 0;
		FString Clip; TObjectPtr<UStaticMeshComponent> Hull, Rod; TObjectPtr<USkeletalMeshComponent> Man;
	};
	struct FCamp {
		int32 Lake = 0; FVector2D P; float Heading = 0; double FlagUntil = 0; int32 Flag = -1; FString Clip;
		TArray<FVector2D> Tips; TObjectPtr<UStaticMeshComponent> Shelter, Bucket, Sled, Hole, Rod; TObjectPtr<USkeletalMeshComponent> Man;
		TArray<TObjectPtr<UStaticMeshComponent>> TipC;
	};
	TArray<FLake> Lakes;
	TArray<FBoat> Boats;
	TArray<FCamp> Camps;
	FPerson Summer, Winter;
	UPROPERTY() TArray<TObjectPtr<UObject>> Held;
	TObjectPtr<UStaticMesh> Skiff, RodMesh, Bucket, Sled, Hole, Tipup, TipupFlag; TArray<TObjectPtr<UStaticMesh>> Shelters;
	TObjectPtr<AHotBrookWildlife> Wild;
	double CensusAt = -1e9;
	bool InLake(const FLake& L, const FVector2D& P) const;
	float Depth(const FVector2D& P) const;
	float ShoreDist(const FLake& L, const FVector2D& P) const;
	bool Spot(int32 Lake, FVector2D& Out, const FVector2D* Near = nullptr) const;
	void Census();
	void Launch(int32 Lake);
	void Pitch(int32 Lake);
	void Strike(FBoat& B);
	USkeletalMeshComponent* NewMan(const FPerson& P);
	UStaticMeshComponent* NewStatic(UStaticMesh* M);
	void Play(USkeletalMeshComponent* C, FString& Now, const FPerson& P, const TCHAR* Clip, bool bLoop);
	void HoldRod(USkeletalMeshComponent* Man, const FPerson& P, UStaticMeshComponent* Rod, float PitchDeg, float Reach);
};
