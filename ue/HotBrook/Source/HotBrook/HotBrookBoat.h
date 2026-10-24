// HotBrookBoat — a canoe on the lake: it waits drawn up in the shallows by the shore nearest where the walker starts; E beside it
// gets in (the walker sits at the stern, the eye ~0.9 m over the water) and E again gets out — onto the shore if it is within a few
// metres, else over the side into the water. Paddling: W / S strokes forward and back, A / D turn, Shift strokes harder. It moves as a
// 5-m tandem canoe does: ~1.5 m/s at a steady pace, ~2.2 m/s hard, gliding on between strokes and slowing on the water's drag; its keel
// holds it straight (a sideways slide dies quickly); it rides ~12 cm deep with someone in it, bobbing and rocking a little; the wind
// (the sim's) drifts it; it runs aground where the water is shallower than its draft.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookBoat.generated.h"

class UStaticMeshComponent;

UCLASS()
class HOTBROOK_API AHotBrookBoat : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookBoat();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	// the paddler's strokes this frame: forward (−1…1), turn (−1 left … 1 right), hard
	void Paddle(float Fwd, float Turn, bool bHard) { InFwd = Fwd; InTurn = Turn; bInHard = bHard; }
	void SetOccupied(bool b) { bOccupied = b; }
	// (a test's steady strokes, in place of the paddler's: -hbpaddle)
	void Autopilot(float Fwd, float Turn) { AutoFwd = Fwd; AutoTurn = Turn; }
	float Speed() const { return Vel.Size(); }
	bool IsOccupied() const { return bOccupied; }
	// where the paddler sits (UE world) and the boat's heading
	FVector SeatLocation() const;
	float Yaw() const { return YawDeg; }
	// the nearest dry (or wadeable, < 0.3 m) ground within Within cm of the boat's side, for getting out
	bool LandingSpot(float Within, FVector& Out) const;
	UPROPERTY(VisibleAnywhere, Category = "HotBrook") TObjectPtr<UStaticMeshComponent> Hull;
	float WindSpeed = 0.f, WindFrom = 0.f;   // (m/s; radians from north, clockwise — the sim's, from the link)
private:
	FVector2D Vel = FVector2D::ZeroVector; float YawDeg = 0.f, YawRate = 0.f, InFwd = 0.f, InTurn = 0.f; bool bInHard = false, bOccupied = false, bPlaced = false; float AutoFwd = 0.f, AutoTurn = 0.f;
	double T = 0;
	bool Place();
	float DepthAt(const FVector& P, float* OutSurf = nullptr) const;
};
