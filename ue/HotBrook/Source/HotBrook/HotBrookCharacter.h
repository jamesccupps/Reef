// HotBrookCharacter — the walker: first person at a person's eye height, walking, running and jumping on the ground as it is (the
// landscape's collision, the camps' walls, the trees' trunks, the docks' decks), wading slowed by the water's depth, swimming at the
// surface past chest depth and diving under it (C / Ctrl down, Space up), on the ice in winter where it would hold a person; E gets in
// the canoe beside it (AHotBrookBoat) and out again, W A S D paddling it.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "HotBrookCharacter.generated.h"

class UCameraComponent;

UCLASS()
class HOTBROOK_API AHotBrookCharacter : public ACharacter
{
	GENERATED_BODY()
public:
	AHotBrookCharacter();
	virtual void SetupPlayerInputComponent(UInputComponent* In) override;
	virtual void Tick(float Dt) override;
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "HotBrook") TObjectPtr<UCameraComponent> Eye;
	// m/s: a walk, a jog; in the water
	UPROPERTY(EditAnywhere, Category = "HotBrook") float WalkSpeed = 1.45f;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float RunSpeed = 4.2f;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float SwimSpeed = 0.9f;
	UPROPERTY(EditAnywhere, Category = "HotBrook") float WadeDepth = 1.3f;   // (m of water past which the walker swims)
	UFUNCTION(BlueprintPure, Category = "HotBrook") FString WaterState() const;
	void Use();   // (E: into the canoe beside the walker, or out of it)
private:
	void Fwd(float V) { FwdIn = V; }
	void Side(float V) { SideIn = V; }
	void Turn(float V) { AddControllerYawInput(V); }
	void Look(float V) { AddControllerPitchInput(V); }
	void RunOn() { bRun = true; }
	void RunOff() { bRun = false; }
	void UpOn() { bUp = true; Jump(); }
	void UpOff() { bUp = false; StopJumping(); }
	void DownOn() { bDown = true; }
	void DownOff() { bDown = false; }
	UPROPERTY() TObjectPtr<class AHotBrookBoat> Boat;   // (the canoe the walker sits in)
	float BoatYaw = 0.f;
	float FwdIn = 0, SideIn = 0; bool bRun = false, bUp = false, bDown = false;
	float SwimT = 0, EyeBob = 0;   // (afloat: the head's ride on the water)
	enum class EWater : uint8 { Dry, Wade, Swim, Dive, Ice, Boat } State = EWater::Dry;
};
