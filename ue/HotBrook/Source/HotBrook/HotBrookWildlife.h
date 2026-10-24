// HotBrookWildlife — the lakes' fish-eating birds as the live simulation has them, each with its own simple life (as the browser's
// render3/wild3view.js gives them). WHAT THE SIM DECIDES: how many are on the lakes now (fish3 _wildN — the loons by the lakes' area,
// the herons by their shore, the eagle pair; none out of season), how active each is by the light, and every fish they take (where,
// how deep, how big). HERE: the common loons swim the open water (≥ 1.5 m), diving every minute or two for half a minute and coming
// up elsewhere — one dives where the sim says a loon took a fish, and comes up there — and rest on the water at night; the great blue
// herons stand in the shallows (5–35 cm) and step slowly to the next spot, toward a fish taken near them; the bald eagles circle high
// over the lake by day and stoop to the water where the sim's eagle took one. Each lake has its share (by area; the herons by shore).
// No models yet for the ospreys, kingfishers, mergansers, otters and mink (the sim keeps them all).
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookWildlife.generated.h"

class UStaticMeshComponent;
class UStaticMesh;

UCLASS()
class HOTBROOK_API AHotBrookWildlife : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookWildlife();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	// the snapshot's wildlife: how many of each (fish3 WILDK order) and its activity now; the fish taken since the last (6 floats each:
	// x, y, depth m, WILDK index, length cm, species); the year's fraction (the day: who of a fractional count is about)
	void Update(const float* Counts, const float* Act, int32 NKinds, const float* Taken, int32 NTaken, float YearFrac);
	UPROPERTY(EditAnywhere, Category = "HotBrook") float DrawRadius = 2500.f;   // m from the walker
	// the bird of a kind (0 loon, 1 heron, 4 eagle) nearest a place (the sim's metres) now, in sight: where it is (UE), the yaw it faces —
	// what a look at one is framed on; false if none is about
	bool Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw) const;
private:
	enum EKind : int32 { Loon = 0, Heron = 1, Eagle = 4 };   // (fish3 WILDK indices)
	struct FLake { TArray<FVector2D> Pts; FBox2D Box; double Area = 0, Shore = 0; float Level = 0; };
	struct FBird {
		int32 Kind = 0, Lake = 0, State = 0; FVector2D P, Goal, Centre; float Heading = 0, Alt = 0, Radius = 80.f, Ang = 0, Hover = 0;
		double Until = 0, T0 = 0; FVector2D From; TObjectPtr<UStaticMeshComponent> C;
	};
	TArray<FLake> Lakes;
	TArray<FBird> Birds;
	TMap<int32, TObjectPtr<UStaticMesh>> Mesh;
	float N[16] = { 0 }, ActNow[16] = { 0 }; float YearNow = 0.3f; double CensusAt = -1e9;
	bool InLake(const FLake& L, const FVector2D& P) const;
	bool Fits(int32 Kind, const FVector2D& P) const;   // (water of the right depth for it)
	bool Pick(int32 Kind, int32 Lake, FVector2D& Out, const FVector2D* Near = nullptr, float Within = 0) const;
	void Census();
	void Spawn(int32 Kind, int32 Lake);
	void Taken(int32 Kind, const FVector2D& P);
	float Depth(const FVector2D& P, float* OutSurf = nullptr, float* OutGround = nullptr) const;
};
