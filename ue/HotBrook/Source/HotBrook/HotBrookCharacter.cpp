#include "HotBrookCharacter.h"
#include "HotBrookWater.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/InputComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Engine/World.h"

AHotBrookCharacter::AHotBrookCharacter()
{
	PrimaryActorTick.bCanEverTick = true;
	GetCapsuleComponent()->InitCapsuleSize(30.f, 90.f);   // (a person: 60 cm across, 1.8 m tall)
	Eye = CreateDefaultSubobject<UCameraComponent>(TEXT("Eye"));
	Eye->SetupAttachment(GetCapsuleComponent());
	Eye->SetRelativeLocation(FVector(0, 0, 75.f));   // (the eye 1.65 m above the feet)
	Eye->bUsePawnControlRotation = true;
	Eye->SetFieldOfView(80.f);
	bUseControllerRotationYaw = true;
	UCharacterMovementComponent* M = GetCharacterMovement();
	M->MaxWalkSpeed = WalkSpeed * 100.f; M->JumpZVelocity = 310.f;   // (a standing jump of ~0.5 m)
	M->MaxStepHeight = 45.f; M->SetWalkableFloorAngle(42.f);         // (up a rock or a stair, not a cliff)
	M->BrakingDecelerationWalking = 1400.f; M->GroundFriction = 8.f; M->AirControl = 0.15f;
	M->MaxFlySpeed = SwimSpeed * 100.f; M->BrakingDecelerationFlying = 300.f;
}

void AHotBrookCharacter::SetupPlayerInputComponent(UInputComponent* In)
{
	Super::SetupPlayerInputComponent(In);
	In->BindAxis("MoveForward", this, &AHotBrookCharacter::Fwd);
	In->BindAxis("MoveRight", this, &AHotBrookCharacter::Side);
	In->BindAxis("Turn", this, &AHotBrookCharacter::Turn);
	In->BindAxis("LookUp", this, &AHotBrookCharacter::Look);
	In->BindAction("Run", IE_Pressed, this, &AHotBrookCharacter::RunOn);
	In->BindAction("Run", IE_Released, this, &AHotBrookCharacter::RunOff);
	In->BindAction("Up", IE_Pressed, this, &AHotBrookCharacter::UpOn);
	In->BindAction("Up", IE_Released, this, &AHotBrookCharacter::UpOff);
	In->BindAction("Down", IE_Pressed, this, &AHotBrookCharacter::DownOn);
	In->BindAction("Down", IE_Released, this, &AHotBrookCharacter::DownOff);
}

FString AHotBrookCharacter::WaterState() const
{
	switch (State) { case EWater::Wade: return TEXT("wading"); case EWater::Swim: return TEXT("swimming"); case EWater::Dive: return TEXT("diving"); case EWater::Ice: return TEXT("on the ice"); default: return TEXT("on land"); }
}

void AHotBrookCharacter::Tick(float Dt)
{
	Super::Tick(Dt);
	UCharacterMovementComponent* M = GetCharacterMovement();
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
	const FVector P = GetActorLocation(); const float Feet = P.Z - GetCapsuleComponent()->GetScaledCapsuleHalfHeight();
	float S = 0; const bool Wet = W && W->SurfaceAt(P, S) && S > Feet;
	const float Depth = Wet ? (S - Feet) / 100.f : 0.f;   // (m of water about the feet)
	const bool OnIce = Wet && W->IceAt(P) >= 0.1f;          // (10 cm: Maine IF&W's 4 inches for a person on foot — the ice floor is HotBrookIce's)

	// on foot, wading, swimming or diving
	if (!Wet || OnIce || (Depth < WadeDepth && State != EWater::Dive)) {
		State = !Wet ? EWater::Dry : OnIce ? EWater::Ice : EWater::Wade;
		if (M->MovementMode == MOVE_Flying) M->SetMovementMode(MOVE_Walking);
		const float Wade = State == EWater::Wade ? 1.f - 0.55f * FMath::Clamp(Depth / WadeDepth, 0.f, 1.f) : 1.f;
		M->MaxWalkSpeed = (bRun ? RunSpeed : WalkSpeed) * Wade * (State == EWater::Ice ? 0.8f : 1.f) * 100.f;
		M->GroundFriction = State == EWater::Ice ? 1.5f : 8.f;   // (slippery on the ice)
	} else {
		if (M->MovementMode != MOVE_Flying) M->SetMovementMode(MOVE_Flying);
		const float EyeZ = P.Z + Eye->GetRelativeLocation().Z;
		if (bDown) State = EWater::Dive;
		else if (State == EWater::Dive && (bUp && EyeZ > S - 30.f)) State = EWater::Swim;
		else if (State != EWater::Dive) State = EWater::Swim;
		M->MaxFlySpeed = (bRun ? 1.6f : 1.f) * SwimSpeed * 100.f;
		if (State == EWater::Swim) {   // (afloat: the head just out of the water)
			const float Target = S + 12.f - Eye->GetRelativeLocation().Z;
			FVector V = M->Velocity; V.Z = FMath::Clamp((Target - P.Z) * 4.f, -60.f, 60.f); M->Velocity = V;
		} else if (bUp) { FVector V = M->Velocity; V.Z = FMath::Max(V.Z, 90.f); M->Velocity = V; }   // (up toward the surface)
	}

	// the walk: along the ground's level on foot and at the surface; where the eye looks when diving
	const FRotator Yaw(0, GetControlRotation().Yaw, 0);
	const FVector F = State == EWater::Dive ? GetControlRotation().Vector() : FRotationMatrix(Yaw).GetUnitAxis(EAxis::X), R = FRotationMatrix(Yaw).GetUnitAxis(EAxis::Y);
	if (FwdIn != 0) AddMovementInput(F, FwdIn);
	if (SideIn != 0) AddMovementInput(R, SideIn);
	if (State == EWater::Dive && bDown) AddMovementInput(FVector::DownVector, 1.f);
}
