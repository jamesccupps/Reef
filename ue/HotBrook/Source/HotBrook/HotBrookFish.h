// HotBrookFish — the lakes' fish near the walker as the live simulation has them (src/w3/fish3.js through ue/link/simhost.mjs), each
// drawn as its species' model (Scripts/import_models.py: a fish 1 m long along +X, scaled to the sim's length, deepened by its
// condition) at its place, heading and pitch, moved smoothly between the snapshots (20 a second); its tail beating at the browser
// view's rate for its speed (the phase kept per fish and handed to M_HB_Fish's swim wave). A school (one record of n fish) is drawn
// as up to MembersMax of them about its place, ~3 body lengths apart by day and ~8 at night, as the browser's fish3view spreads them.
// Species without a model of their own borrow the nearest one: redbreast the pumpkinseed, fallfish and alewife the dace.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookFish.generated.h"

class UInstancedStaticMeshComponent;

UCLASS()
class HOTBROOK_API AHotBrookFish : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookFish();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	// a snapshot's fish: N records of 12 four-byte fields — x, y (the sim's metres), z (its depth, m), yaw (rad from east,
	// counter-clockwise), pitch (rad, nose up), length (cm), species (src/w3/species3.js's order), n (fish in the record), speed (m/s),
	// id (u32), school (0/1), body depth's multiplier. Night: 0 day … 1 night (the schools loosen).
	void Update(const uint8* Records, int32 N, float Night);
	static constexpr int32 Stride = 48;
	// the fish nearest a point now (its place, heading, length m) — what a look at a fish is framed on; false if none is near
	bool Nearest(const FVector& From, FVector& OutP, FRotator& OutR, float& OutL) const;
	UPROPERTY(EditAnywhere, Category = "HotBrook") int32 MembersMax = 24;
private:
	struct FView {
		FVector From = FVector::ZeroVector, To = FVector::ZeroVector; float YawFrom = 0, YawTo = 0, PitchFrom = 0, PitchTo = 0;
		double T0 = 0, T1 = 0; float Phase = 0, Speed = 0, Lcm = 10, BodyMul = 1, SurfZ = 0; int32 Sp = 0, N = 1; bool bSchool = false, bSeen = true;
	};
	TArray<TObjectPtr<UInstancedStaticMeshComponent>> BySpecies;
	TMap<uint32, FView> Views;
	double LastSnap = 0, SnapDt = 0.05; float NightNow = 0;
	TArray<TArray<FTransform>> X; TArray<TArray<float>> C;   // (this frame's instances and their custom data, a species each)
};
