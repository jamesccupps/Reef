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
#include "HotBrookWildlife.h"
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
	// the lakes' fish-eating birds the sim counts (loons, herons, eagles), each with its own simple life
	if (!TActorIterator<AHotBrookWildlife>(GetWorld())) GetWorld()->SpawnActor<AHotBrookWildlife>();
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
		TArray<FString> Cs; S.Cmds.ParseIntoArray(Cs, TEXT("|"));
		for (const TCHAR* N : { TEXT("fish"), TEXT("bear"), TEXT("deer"), TEXT("moose"), TEXT("loon"), TEXT("heron"), TEXT("eagle") }) if (Cs.Remove(FString(TEXT("near")) + N) > 0) S.Near = N;
		S.Cmds = FString::Join(Cs, TEXT("|"));
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
	// (a look at an animal: the walker set down 12 m from the nearest of its kind, so the woods about it stream in while it settles)
	double SX = S.X, SY = S.Y;
	const int32 Kind = S.Near == TEXT("bear") ? 0 : S.Near == TEXT("deer") ? 1 : S.Near == TEXT("moose") ? 2 : -1;
	const int32 Bird = S.Near == TEXT("loon") ? 0 : S.Near == TEXT("heron") ? 1 : S.Near == TEXT("eagle") ? 4 : -1;
	if (Bird >= 0) {   // (a bird: the walker set down by the nearest of its kind — on the shore or swimming)
		const AHotBrookWildlife* Wl = nullptr; for (TActorIterator<AHotBrookWildlife> It(GetWorld()); It; ++It) { Wl = *It; break; }
		FVector BP; float BY = 0;
		if (Wl && Wl->Nearest(Bird, FVector2D(S.X, S.Y), BP, BY)) { const FVector2D M = HotBrookCoords::ToSim(BP); SX = M.X + 15.0; SY = M.Y; UE_LOG(LogTemp, Display, TEXT("hbshot %s: the nearest %s at %.0f, %.0f"), *S.Name, *S.Near, M.X, M.Y); }
		else UE_LOG(LogTemp, Display, TEXT("hbshot %s: no %s about"), *S.Name, *S.Near);
	}
	if (Kind >= 0) {
		const AHotBrookAnimals* An = nullptr; for (TActorIterator<AHotBrookAnimals> It(GetWorld()); It; ++It) { An = *It; break; }
		FVector AP; float AY = 0, AL = 0;
		if (An && An->Nearest(Kind, FVector2D(S.X, S.Y), AP, AY, AL)) { const FVector2D M = HotBrookCoords::ToSim(AP); SX = M.X + 12.0; SY = M.Y; UE_LOG(LogTemp, Display, TEXT("hbshot %s: the nearest %s at %.0f, %.0f"), *S.Name, *S.Near, M.X, M.Y); }
		else UE_LOG(LogTemp, Display, TEXT("hbshot %s: no %s to look at"), *S.Name, *S.Near);
	}
	if (P) {
		// (the ground under the spot: a trace down from 1 km up — the landscape, a deck, a roof)
		const FVector Top = HotBrookCoords::ToUE(SX, SY, HotBrookCoords::Datum + 900.0), Bottom = HotBrookCoords::ToUE(SX, SY, HotBrookCoords::Datum - 200.0);
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
	const FString& Near = Shots[NextShot].Near;
	// (framed twice: once to let the exposure settle on the new view, a moment later again on where the animal has gone)
	const FVector From = Framed && ShotCam ? ShotCam->GetActorLocation() : Pw ? Pw->GetActorLocation() : FVector::ZeroVector;
	const int32 BirdK = Near == TEXT("loon") ? 0 : Near == TEXT("heron") ? 1 : Near == TEXT("eagle") ? 4 : -1;
	if (BirdK >= 0 && Framed < 2 && Pw) {
		// (a bird: the camera off its side — a loon or a heron from a few metres, low; an eagle from 30 m, level with it)
		Framed++; FVector BP; float BY = 0;
		const AHotBrookWildlife* Wl = nullptr; for (TActorIterator<AHotBrookWildlife> It(GetWorld()); It; ++It) { Wl = *It; break; }
		if (Wl && Wl->Nearest(BirdK, HotBrookCoords::ToSim(From), BP, BY)) {
			const FVector Side = FRotator(0, BY + 90.f, 0).Vector(), At = BP + FVector(0, 0, BirdK == 1 ? 70.f : BirdK == 0 ? 15.f : 0.f);
			const FVector Eye = At + Side * (BirdK == 4 ? 3000.f : 450.f) + FVector(0, 0, BirdK == 0 ? 40.f : BirdK == 1 ? 30.f : 0.f);
			if (!ShotCam) ShotCam = GetWorld()->SpawnActor<ACameraActor>();
			ShotCam->SetActorLocationAndRotation(Eye, (At - Eye).Rotation()); PC->SetViewTarget(ShotCam);
			UE_LOG(LogTemp, Display, TEXT("hbshot %s: the %s at %s"), *Shots[NextShot].Name, *Near, *BP.ToString());
		}
		GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::TakeShot, Framed == 1 ? 1.5f : 0.15f, false);
		return;
	}
	if (Near != TEXT("fish") && BirdK < 0 && !Near.IsEmpty() && Framed < 2 && Pw) {
		// (an animal: the camera off its flank at 1.7 lengths, a little above its back, on it)
		Framed++; FVector AP; float AY = 0, AL = 0; const int32 K = Near == TEXT("bear") ? 0 : Near == TEXT("deer") ? 1 : 2;
		const AHotBrookAnimals* An = nullptr; for (TActorIterator<AHotBrookAnimals> It(GetWorld()); It; ++It) { An = *It; break; }
		if (An && An->Nearest(K, HotBrookCoords::ToSim(From), AP, AY, AL)) {
			const FVector Side = FRotator(0, AY + 90.f, 0).Vector(), At = AP + FVector(0, 0, 45.f * AL);
			if (!ShotCam) ShotCam = GetWorld()->SpawnActor<ACameraActor>();
			const FVector Eye = At + Side * (170.f * AL) + FVector(0, 0, 40.f);
			ShotCam->SetActorLocationAndRotation(Eye, (At - Eye).Rotation()); PC->SetViewTarget(ShotCam);
			UE_LOG(LogTemp, Display, TEXT("hbshot %s: the %s, %.2f m long, at %s"), *Shots[NextShot].Name, *Near, AL, *AP.ToString());
		}
		GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::TakeShot, Framed == 1 ? 1.5f : 0.15f, false);
		return;
	}
	if (Near == TEXT("fish") && Framed < 2 && Pw) {
		Framed++; FVector P; FRotator R; float L = 0;
		const AHotBrookFish* Fi = nullptr; for (TActorIterator<AHotBrookFish> It(GetWorld()); It; ++It) { Fi = *It; break; }
		if (Fi && Fi->Nearest(From, P, R, L)) {
			// (a camera of its own there: the walker, in the water, would be lifted to swim at the surface) — off the fish's flank, or
			// another side, nearer, wherever the spot is open water: in the lake, off its bed, under its surface
			const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>();
			float D = FMath::Max(60.f, 400.f * L); FVector Side = FRotator(0, R.Yaw + 90.f, 0).Vector(), At = P + Side * D;
			for (const float K : { 1.f, 0.6f, 0.35f }) {
				bool bOk = false;
				for (const float Turn : { 90.f, -90.f, 180.f, 0.f, 45.f, -45.f, 135.f, -135.f }) {
					const FVector Sd = FRotator(0, R.Yaw + Turn, 0).Vector(); FVector Q = P + Sd * (D * K); float S = 0, G = 0;
					if (!W || !W->SurfaceAt(Q, S) || !W->GroundAt(Q, G)) continue;
					Q.Z = FMath::Min(P.Z + 0.4f * D * K, S - 10.f);   // (a little above it, looking down: a fish on the bed shows against it)
					if (Q.Z > G + 15.f && Q.Z > P.Z - 5.f) { Side = Sd; At = Q; bOk = true; break; }
				}
				if (bOk) { D *= K; break; }
			}
			if (!ShotCam) ShotCam = GetWorld()->SpawnActor<ACameraActor>();
			ShotCam->SetActorLocationAndRotation(At, (P - At).Rotation()); PC->SetViewTarget(ShotCam);
			UE_LOG(LogTemp, Display, TEXT("hbshot %s: the nearest fish, %.0f cm long, at %s, seen from %.0f cm"), *Shots[NextShot].Name, L * 100.f, *P.ToString(), D);
		}
		GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::TakeShot, Framed == 1 ? 1.5f : 0.15f, false);
		return;
	}
	Framed = 0;
	if (NFrames) UE_LOG(LogTemp, Display, TEXT("hbshot %s: %.1f ms a frame (%.0f fps): game %.1f, draw %.1f, RHI %.1f, GPU %.1f ms, over %d frames"), *Shots[NextShot].Name, SumFrame / NFrames,
		1000.0 * NFrames / FMath::Max(1.0, SumFrame), SumGame / NFrames, SumDraw / NFrames, SumRhi / NFrames, SumGpu / NFrames, NFrames);
	const FString File = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Screenshots"), Shots[NextShot].Name + TEXT(".png"));
	FScreenshotRequest::RequestScreenshot(File, false, false);
	NextShot++;
	GetWorldTimerManager().SetTimer(ShotTimer, this, &AHotBrookGameMode::PlaceNext, 1.5f, false);
}
