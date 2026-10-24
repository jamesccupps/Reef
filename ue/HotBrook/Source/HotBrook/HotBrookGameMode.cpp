#include "HotBrookGameMode.h"
#include "HotBrookCharacter.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "HotBrookForest.h"
#include "HotBrookLink.h"
#include "HotBrookWaterSurface.h"
#include "HotBrookGroundCover.h"
#include "HotBrookAnimals.h"
#include "HotBrookFish.h"
#include "EngineUtils.h"
#include "Camera/CameraActor.h"
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
	MaxFrame = FMath::Max(MaxFrame, (double)Dt * 1000.0);
	if (bStats && !bWalking) {
		const double Now = FPlatformTime::Seconds(); if (StatsT0 < 0) { StatsT0 = Now; NextStats = Now + 2.0; }
		if (Now >= NextStats && NFrames) {
			int32 FT = 0, GC = 0, GI = 0; double FMs = 0, GMs = 0; int32 FLive = 0, GLive = 0;
			for (TActorIterator<AHotBrookForest> It(GetWorld()); It; ++It) { It->TakeMakeStats(FT, FMs); FLive = It->LiveTiles(); }
			for (TActorIterator<AHotBrookGroundCover> It(GetWorld()); It; ++It) { It->TakeMakeStats(GC, GMs, GI); GLive = It->LiveCells(); }
			UE_LOG(LogTemp, Display, TEXT("hbstats %5.1f s: %3d frames, %.0f ms a frame (worst %.0f): game %.0f, draw %.0f, GPU %.0f | forest %d tiles (+%d, %.0f ms) | ground %d cells (+%d, %d plants, %.0f ms)"),
				Now - StatsT0, NFrames, SumFrame / NFrames, MaxFrame, SumGame / NFrames, SumDraw / NFrames, SumGpu / NFrames, FLive, FT, FMs, GLive, GC, GI, GMs);
			SumFrame = SumGpu = SumGame = SumDraw = SumRhi = 0; NFrames = 0; MaxFrame = 0; NextStats = Now + 2.0;
		}
		if (QuitAt > 0 && Now - StatsT0 > QuitAt) FPlatformMisc::RequestExit(false);
	}
	if (!bWalking) return;
	// the walk: along the line at the pace, on the ground (the heightmap's), facing the way
	const double Now = GetWorld()->GetTimeSeconds(), L = FVector2D::Distance(WalkA, WalkB), S = (Now - WalkT0) * WalkSpeed;
	APlayerController* PC = GetWorld()->GetFirstPlayerController(); APawn* P = PC ? PC->GetPawn() : nullptr;
	if (S >= L || !P) { UE_LOG(LogTemp, Display, TEXT("hbwalk done: %.0f m"), L); FPlatformMisc::RequestExit(false); bWalking = false; return; }
	const FVector2D M = WalkA + (WalkB - WalkA) * (S / L);
	float G = 0; GetWorld()->GetSubsystem<UHotBrookWater>()->GroundAt(HotBrookCoords::ToUE(M.X, M.Y, HotBrookCoords::Datum), G);
	P->SetActorLocation(FVector(M.X * 100.0, -M.Y * 100.0, G + 95.0), false, nullptr, ETeleportType::TeleportPhysics);
	const FVector2D D = (WalkB - WalkA).GetSafeNormal(); PC->SetControlRotation(FRotator(-3.0, FMath::RadiansToDegrees(FMath::Atan2(-D.Y, D.X)), 0));
	if (Now >= NextLog && NFrames) {
		UE_LOG(LogTemp, Display, TEXT("hbwalk %4.0f m: %.1f ms a frame (%.0f fps, worst %.0f ms): game %.1f, draw %.1f, GPU %.1f"), S, SumFrame / NFrames, 1000.0 * NFrames / FMath::Max(1.0, SumFrame), MaxFrame,
			SumGame / NFrames, SumDraw / NFrames, SumGpu / NFrames);
		SumFrame = SumGpu = SumGame = SumDraw = SumRhi = 0; NFrames = 0; MaxFrame = 0; NextLog = Now + 2.0;
	}
}

void AHotBrookGameMode::StartWalk()
{
	bWalking = true; WalkT0 = NextLog = GetWorld()->GetTimeSeconds(); SumFrame = SumGpu = SumGame = SumDraw = SumRhi = 0; NFrames = 0; MaxFrame = 0;
	UE_LOG(LogTemp, Display, TEXT("hbwalk from (%.1f, %.1f) to (%.1f, %.1f) at %.2f m/s"), WalkA.X, WalkA.Y, WalkB.X, WalkB.Y, WalkSpeed);
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
	// the forest floor's and the shores' plants and stones near the walker (after the forest: it reads the trees)
	if (!TActorIterator<AHotBrookGroundCover>(GetWorld())) GetWorld()->SpawnActor<AHotBrookGroundCover>();
	// the forest's large animals the live link reports (the deer so far)
	if (!TActorIterator<AHotBrookAnimals>(GetWorld())) GetWorld()->SpawnActor<AHotBrookAnimals>();
	// the lakes' fish near the walker, each its species' model
	if (!TActorIterator<AHotBrookFish>(GetWorld())) GetWorld()->SpawnActor<AHotBrookFish>();
	bStats = FParse::Param(FCommandLine::Get(), TEXT("hbstats")); float Q = 0; if (FParse::Value(FCommandLine::Get(), TEXT("hbquit="), Q)) QuitAt = Q;
	FString Arg;
	if (FParse::Value(FCommandLine::Get(), TEXT("hbwalk="), Arg, false)) {
		TArray<FString> F; Arg.TrimQuotes().ParseIntoArray(F, TEXT(","));
		if (F.Num() >= 4) {
			WalkA = FVector2D(FCString::Atod(*F[0]), FCString::Atod(*F[1])); WalkB = FVector2D(FCString::Atod(*F[2]), FCString::Atod(*F[3]));
			if (F.Num() > 4) WalkSpeed = FCString::Atod(*F[4]);
			float W = 6.f; FParse::Value(FCommandLine::Get(), TEXT("hbwait="), W);
			bWalk = true; GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::StartWalk, W, false);
		}
		return;
	}
	if (!FParse::Value(FCommandLine::Get(), TEXT("hbshot="), Arg, false)) return;
	TArray<FString> Items; Arg.TrimQuotes().ParseIntoArray(Items, TEXT(";"));
	for (const FString& It : Items) {
		TArray<FString> F; It.ParseIntoArray(F, TEXT(","));
		if (F.Num() < 4) continue;
		FShot S{ FCString::Atod(*F[0]), FCString::Atod(*F[1]), FCString::Atod(*F[2]), FCString::Atod(*F[3]), F.Num() > 4 ? F[4] : FString::Printf(TEXT("shot%d"), Shots.Num()), F.Num() > 5 ? F[5] : FString() };
		TArray<FString> Cs; S.Cmds.ParseIntoArray(Cs, TEXT("|")); S.bNearFish = Cs.Remove(TEXT("nearfish")) > 0; S.Cmds = FString::Join(Cs, TEXT("|"));
		Shots.Add(S);
	}
	float Wait = 6.f; FParse::Value(FCommandLine::Get(), TEXT("hbwait="), Wait);   // (the first after the world has loaded and its shaders compiled: longer on a first run)
	if (Shots.Num()) GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::PlaceNext, Wait, false);
}

void AHotBrookGameMode::PlaceNext()
{
	if (NextShot >= Shots.Num()) { FPlatformMisc::RequestExit(false); return; }
	const FShot& S = Shots[NextShot];
	APlayerController* PC = GetWorld()->GetFirstPlayerController(); APawn* P = PC ? PC->GetPawn() : nullptr;
	if (PC && P && PC->GetViewTarget() != P) PC->SetViewTarget(P);   // (back from a look at a fish)
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
	// (a look at a fish: the walker set beside the nearest, a few lengths off its flank, eye level with it, a moment before the shot)
	APlayerController* PC = GetWorld()->GetFirstPlayerController(); APawn* Pw = PC ? PC->GetPawn() : nullptr;
	if (Shots[NextShot].bNearFish && !bFramed && Pw) {
		bFramed = true; FVector P; FRotator R; float L = 0;
		const AHotBrookFish* Fi = nullptr; for (TActorIterator<AHotBrookFish> It(GetWorld()); It; ++It) { Fi = *It; break; }
		if (Fi && Fi->Nearest(Pw->GetActorLocation(), P, R, L)) {
			// (a camera of its own there: the walker, in the water, would be lifted to swim at the surface)
			const FVector Side = FRotator(0, R.Yaw + 90.f, 0).Vector();
			const float D = FMath::Max(60.f, 400.f * L);
			if (!ShotCam) ShotCam = GetWorld()->SpawnActor<ACameraActor>();
			ShotCam->SetActorLocationAndRotation(P + Side * D, (-Side).Rotation()); PC->SetViewTarget(ShotCam);
			UE_LOG(LogTemp, Display, TEXT("hbshot %s: the nearest fish, %.0f cm long, at %s, seen from %.0f cm"), *Shots[NextShot].Name, L * 100.f, *P.ToString(), D);
		}
		GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::TakeShot, 0.4f, false);
		return;
	}
	bFramed = false;
	if (NFrames) UE_LOG(LogTemp, Display, TEXT("hbshot %s: %.1f ms a frame (%.0f fps): game %.1f, draw %.1f, RHI %.1f, GPU %.1f ms, over %d frames"), *Shots[NextShot].Name, SumFrame / NFrames,
		1000.0 * NFrames / FMath::Max(1.0, SumFrame), SumGame / NFrames, SumDraw / NFrames, SumRhi / NFrames, SumGpu / NFrames, NFrames);
	const FString File = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Screenshots"), Shots[NextShot].Name + TEXT(".png"));
	FScreenshotRequest::RequestScreenshot(File, false, false);
	NextShot++;
	GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::PlaceNext, 1.5f, false);
}
