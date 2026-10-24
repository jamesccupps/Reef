#include "HotBrookGameMode.h"
#include "HotBrookCharacter.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "HotBrookForest.h"
#include "HotBrookLink.h"
#include "HotBrookWaterSurface.h"
#include "EngineUtils.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "TimerManager.h"
#include "UnrealClient.h"
#include "RHI.h"
#include "RenderTimer.h"

AHotBrookGameMode::AHotBrookGameMode()
{
	DefaultPawnClass = AHotBrookCharacter::StaticClass();
	PrimaryActorTick.bCanEverTick = true;
}

void AHotBrookGameMode::Tick(float Dt)
{
	Super::Tick(Dt);
	SumFrame += Dt * 1000.0; SumGpu += FPlatformTime::ToMilliseconds(RHIGetGPUFrameCycles()); NFrames++;
	SumGame += FPlatformTime::ToMilliseconds(GGameThreadTime); SumDraw += FPlatformTime::ToMilliseconds(GRenderThreadTime); SumRhi += FPlatformTime::ToMilliseconds(GRHIThreadTime);
}

void AHotBrookGameMode::BeginPlay()
{
	Super::BeginPlay();
	// the forest (streamed about the walker from Import/trees.bin) if the level hasn't one
	if (!TActorIterator<AHotBrookForest>(GetWorld())) GetWorld()->SpawnActor<AHotBrookForest>();
	// the live simulation (ue/link/simhost.mjs) if the level hasn't its link
	if (!TActorIterator<AHotBrookLink>(GetWorld())) GetWorld()->SpawnActor<AHotBrookLink>();
	// the lakes' surfaces (Import/lakes.json) if the level hasn't them
	if (!TActorIterator<AHotBrookWaterSurface>(GetWorld())) GetWorld()->SpawnActor<AHotBrookWaterSurface>();
	FString Arg;
	if (!FParse::Value(FCommandLine::Get(), TEXT("hbshot="), Arg, false)) return;
	TArray<FString> Items; Arg.TrimQuotes().ParseIntoArray(Items, TEXT(";"));
	for (const FString& It : Items) {
		TArray<FString> F; It.ParseIntoArray(F, TEXT(","));
		if (F.Num() >= 4) Shots.Add({ FCString::Atod(*F[0]), FCString::Atod(*F[1]), FCString::Atod(*F[2]), FCString::Atod(*F[3]), F.Num() > 4 ? F[4] : FString::Printf(TEXT("shot%d"), Shots.Num()), F.Num() > 5 ? F[5] : FString() });
	}
	float Wait = 6.f; FParse::Value(FCommandLine::Get(), TEXT("hbwait="), Wait);   // (the first after the world has loaded and its shaders compiled: longer on a first run)
	if (Shots.Num()) GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::PlaceNext, Wait, false);
}

void AHotBrookGameMode::PlaceNext()
{
	if (NextShot >= Shots.Num()) { FPlatformMisc::RequestExit(false); return; }
	const FShot& S = Shots[NextShot];
	APlayerController* PC = GetWorld()->GetFirstPlayerController(); APawn* P = PC ? PC->GetPawn() : nullptr;
	if (!S.Cmds.IsEmpty() && PC) {
		TArray<FString> Cmds; S.Cmds.ParseIntoArray(Cmds, TEXT("|"));
		for (FString C : Cmds) { C.ReplaceInline(TEXT(":"), TEXT(" ")); PC->ConsoleCommand(C); UE_LOG(LogTemp, Display, TEXT("hbshot %s: %s"), *S.Name, *C); }
	}
	if (P) {
		// (the ground under the spot: a trace down from 1 km up — the landscape, a deck, a roof)
		const FVector Top = HotBrookCoords::ToUE(S.X, S.Y, HotBrookCoords::Datum + 900.0), Bottom = HotBrookCoords::ToUE(S.X, S.Y, HotBrookCoords::Datum - 200.0);
		FHitResult Hit; FCollisionQueryParams Q; Q.AddIgnoredActor(P);
		// (or, before the landscape's collision is built, the heightmap's ground)
		float G = 0; const bool bHM = GetWorld()->GetSubsystem<UHotBrookWater>()->GroundAt(Top, G);
		const bool bHit = GetWorld()->LineTraceSingleByChannel(Hit, Top, Bottom, ECC_Visibility, Q);
		const double Z = bHit ? FMath::Max((double)Hit.Location.Z, bHM ? (double)G : -1e9) : bHM ? (double)G : 0.0;
		UE_LOG(LogTemp, Display, TEXT("hbshot %s: trace %s %.0f, heightmap %s %.0f -> Z %.0f cm"), *S.Name, bHit ? TEXT("hit") : TEXT("missed"), bHit ? Hit.Location.Z : 0.0, bHM ? TEXT("") : TEXT("none"), G, Z);
		P->SetActorLocation(FVector(Top.X, Top.Y, Z + 95.0), false, nullptr, ETeleportType::TeleportPhysics);
		PC->SetControlRotation(FRotator(S.Pitch, S.Yaw, 0));
	}
	GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::TakeShot, 5.f, false);   // (the light and the streaming settle)
	SumFrame = SumGpu = SumGame = SumDraw = SumRhi = 0; NFrames = 0;
}

void AHotBrookGameMode::TakeShot()
{
	if (NFrames) UE_LOG(LogTemp, Display, TEXT("hbshot %s: %.1f ms a frame (%.0f fps): game %.1f, draw %.1f, RHI %.1f, GPU %.1f ms, over %d frames"), *Shots[NextShot].Name, SumFrame / NFrames,
		1000.0 * NFrames / FMath::Max(1.0, SumFrame), SumGame / NFrames, SumDraw / NFrames, SumRhi / NFrames, SumGpu / NFrames, NFrames);
	const FString File = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Screenshots"), Shots[NextShot].Name + TEXT(".png"));
	FScreenshotRequest::RequestScreenshot(File, false, false);
	NextShot++;
	GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::PlaceNext, 1.5f, false);
}
