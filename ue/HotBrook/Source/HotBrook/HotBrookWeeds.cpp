#include "HotBrookWeeds.h"
#include "HotBrookCoords.h"
#include "HotBrookWater.h"
#include "Components/HierarchicalInstancedStaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "Materials/MaterialInstanceDynamic.h"

DEFINE_LOG_CATEGORY_STATIC(LogHotBrookWeeds, Log, All);

// (a hash of a cell and a draw to 0–1: the scatter, the same each rebuild)
static float H01(uint32 A, uint32 B) { uint32 h = A * 374761393u + B * 668265263u; h = (h ^ (h >> 13)) * 1274126177u; return (h ^ (h >> 16)) / 4294967296.f; }

AHotBrookWeeds::AHotBrookWeeds()
{
	PrimaryActorTick.bCanEverTick = false;
	RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
}

int32 AHotBrookWeeds::AddLook(const TCHAR* Mesh, int32 Per, float Scale, int32 Where, float CullM, float H)
{
	FLook L; L.Per = Per; L.Scale = Scale; L.Where = Where; L.H = H;
	if (FCString::Strcmp(Mesh, TEXT("mussel")) == 0) L.Mesh = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
	else L.Mesh = LoadObject<UStaticMesh>(nullptr, *FString::Printf(TEXT("/Game/HotBrook/Plants/%s/SM_%s.SM_%s"), Mesh, Mesh, Mesh));
	if (!L.Mesh) return -1;
	Held.Add(L.Mesh);
	UHierarchicalInstancedStaticMeshComponent* C = NewObject<UHierarchicalInstancedStaticMeshComponent>(this);
	C->SetStaticMesh(L.Mesh); C->SetMobility(EComponentMobility::Movable); C->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	C->SetCullDistances(0, (int32)(CullM * 100.f)); C->bAffectDistanceFieldLighting = false; C->SetCastShadow(Where != 2);
	C->SetupAttachment(RootComponent); C->RegisterComponent();
	if (FCString::Strcmp(Mesh, TEXT("mussel")) == 0)   // (the shells: dark olive-brown, wet)
		if (UMaterialInterface* Mi = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/HotBrook/Camps/Materials/MI_HB_Plastic.MI_HB_Plastic"))) {
			UMaterialInstanceDynamic* D = UMaterialInstanceDynamic::Create(Mi, this); D->SetVectorParameterValue(TEXT("Tint"), FLinearColor(0.045f, 0.038f, 0.022f)); C->SetMaterial(0, D); Held.Add(D);
		}
	L.C = C; return Looks.Add(L);
}

void AHotBrookWeeds::BeginPlay()
{
	Super::BeginPlay();
	// each species' look (plants3 FORMS3 keys): instances a 5-m cell holds at a full stand, their scale, the surface / the reeds / the bed
	const int32 White = AddLook(TEXT("white_lily"), 10, 1.f, 0, 250.f), Yellow = AddLook(TEXT("lake_lily"), 8, 1.f, 0, 250.f);
	const int32 Shield = AddLook(TEXT("lake_lily"), 24, 0.3f, 0, 150.f), Pond = AddLook(TEXT("pondweed"), 14, 1.f, 0, 200.f);
	const int32 Bulrush = AddLook(TEXT("reed_bulrush"), 40, 1.f, 1, 250.f), Pickerel = AddLook(TEXT("reed_pickerelweed"), 24, 1.f, 1, 250.f);
	const int32 Horse = AddLook(TEXT("reed_horsetail"), 30, 1.f, 1, 200.f), Sedge = AddLook(TEXT("grass_tuft_a"), 40, 1.6f, 1, 150.f, 35.f);   // (the sedge: the 35-cm grass tuft drawn to the reeds' height)
	const int32 Mussel = AddLook(TEXT("mussel"), 0, 1.f, 2, 25.f);
	for (const auto& [K, L] : { TPair<const TCHAR*, int32>(TEXT("whitelily"), White), TPair<const TCHAR*, int32>(TEXT("yellowlily"), Yellow),
		TPair<const TCHAR*, int32>(TEXT("watershield"), Shield), TPair<const TCHAR*, int32>(TEXT("floatpond"), Pond), TPair<const TCHAR*, int32>(TEXT("burreed"), Pond),
		TPair<const TCHAR*, int32>(TEXT("ribbonleaf"), Pond), TPair<const TCHAR*, int32>(TEXT("largeleaf"), Pond), TPair<const TCHAR*, int32>(TEXT("bulrush"), Bulrush),
		TPair<const TCHAR*, int32>(TEXT("pickerelweed"), Pickerel), TPair<const TCHAR*, int32>(TEXT("bogbean"), Pickerel), TPair<const TCHAR*, int32>(TEXT("arrowhead"), Pickerel),
		TPair<const TCHAR*, int32>(TEXT("horsetail"), Horse), TPair<const TCHAR*, int32>(TEXT("sedge"), Sedge), TPair<const TCHAR*, int32>(TEXT("mussel"), Mussel) })
		if (L >= 0) LookOfKey.Add(K, L);
	UE_LOG(LogHotBrookWeeds, Display, TEXT("weeds: %d looks for %d species (and the mussels)"), Looks.Num(), LookOfKey.Num() - (LookOfKey.Contains(TEXT("mussel")) ? 1 : 0));
}

void AHotBrookWeeds::Update(const TArray<uint8>& B)
{
	if (B.Num() < 20 || FMemory::Memcmp(B.GetData(), "HBP1", 4) != 0) return;
	const auto F = [&](int32 o) { float v; FMemory::Memcpy(&v, B.GetData() + o, 4); return v; };
	const auto U = [&](int32 o) { uint32 v; FMemory::Memcpy(&v, B.GetData() + o, 4); return v; };
	const int32 NF = (int32)U(8), N = (int32)U(12), KL = (int32)U(16);
	if (NF <= 0 || NF > 64 || 20 + KL > B.Num()) return;
	TArray<FString> Keys; FString(KL, (const ANSICHAR*)(B.GetData() + 20)).ParseIntoArray(Keys, TEXT(","));
	if (Keys.Num() != NF) return;
	const int32 Head = 20 + KL + (4 - (20 + KL) % 4) % 4, Rec = ((12 + NF + 2) + 3) / 4 * 4;
	if (Head + (int64)N * Rec > B.Num()) return;
	TArray<int32> LookOf; for (const FString& K : Keys) { const int32* L = LookOfKey.Find(K); LookOf.Add(L ? *L : -1); }
	const int32* MusLook = LookOfKey.Find(TEXT("mussel"));
	const UHotBrookWater* W = GetWorld()->GetSubsystem<UHotBrookWater>(); if (!W) return;
	const APlayerController* PC = GetWorld()->GetFirstPlayerController(); const APawn* Pw = PC ? PC->GetPawn() : nullptr;
	const FVector2D Me = Pw ? HotBrookCoords::ToSim(Pw->GetActorLocation()) : FVector2D::ZeroVector;
	TArray<TArray<FTransform>> Ts; Ts.SetNum(Looks.Num()); Placed.Reset();
	const float Cell = 5.f;
	for (int32 r = 0; r < N; r++) {
		const int32 o = Head + r * Rec; const float X = F(o), Y = F(o + 4);
		const uint32 Ci = (uint32)HashCombine(GetTypeHash(FMath::FloorToInt(X * 2.f)), GetTypeHash(FMath::FloorToInt(Y * 2.f)));
		for (int32 f = 0; f < NF; f++) {
			const int32 Li = LookOf[f]; if (Li < 0) continue;
			const float Cov = B[o + 12 + f] / 255.f; if (Cov <= 0.004f) continue;
			const FLook& L = Looks[Li];
			const int32 Nn = FMath::Min(L.Per, FMath::FloorToInt(Cov * L.Per + H01(Ci, f)));
			for (int32 k = 0; k < Nn; k++) {
				const float Px = X + (H01(Ci, k * 7 + f * 131) - 0.5f) * Cell, Py = Y + (H01(Ci, k * 13 + f * 131 + 3) - 0.5f) * Cell;
				const FVector Q = HotBrookCoords::ToUE(Px, Py, HotBrookCoords::Datum); float S = 0, G = 0;
				if (!W->SurfaceAt(Q, S) || !W->GroundAt(Q, G) || S - G < 8.f) continue;
				const float Yaw = H01(Ci, k + 31 * f) * 360.f, Sc = L.Scale * (0.75f + 0.5f * H01(Ci, k + 5 + f));
				FTransform T;
				if (L.Where == 0) T = FTransform(FRotator(0.f, Yaw, 0.f), FVector(Q.X, Q.Y, S + 1.f + 0.05f * (k % 8)), FVector(Sc));   // (afloat: the pads at the surface)
				else {   // (a reed from the bed through the surface: the water's depth and 0.5–1.3 m above it)
					const float Above = (0.5f + 0.8f * H01(Ci, k + 9 + f)) * (0.4f + 0.6f * Cov) * 100.f, Hgt = (S - G) + Above;
					T = FTransform(FRotator((H01(Ci, k + 17) - 0.5f) * 7.f, Yaw, (H01(Ci, k + 19) - 0.5f) * 7.f), FVector(Q.X, Q.Y, G - 3.f), FVector(Sc, Sc, Hgt / L.H));
				}
				Ts[Li].Add(T);
				TArray<FVector>& Pl = Placed.FindOrAdd(Keys[f]); if (Pl.Num() < 64) Pl.Add(T.GetLocation());
			}
		}
		// the mussels: within ~25 m of the walker, each cell's own number (/m² × 25 m², at most 120), on edge, half in the bed
		if (MusLook && FVector2D::DistSquared(FVector2D(X, Y), Me) < 625.0) {
			const float PerM2 = B[o + 12 + NF] / 10.f; const int32 Nm = FMath::Min(120, FMath::FloorToInt(PerM2 * Cell * Cell + H01(Ci, 99)));
			for (int32 k = 0; k < Nm; k++) {
				const float Px = X + (H01(Ci, k * 5 + 101) - 0.5f) * Cell, Py = Y + (H01(Ci, k * 9 + 103) - 0.5f) * Cell;
				const FVector Q = HotBrookCoords::ToUE(Px, Py, HotBrookCoords::Datum); float S = 0, G = 0;
				if (!W->SurfaceAt(Q, S) || !W->GroundAt(Q, G) || S - G < 10.f) continue;
				const float Sz = 0.75f + 0.5f * H01(Ci, k + 107);
				// (an elliptio ~8 × 2.5 × 4 cm: on its edge, its long axis tipped 50–80° into the bed, its back end out with the siphons)
				const FRotator R(-(50.f + 30.f * H01(Ci, k + 127)), H01(Ci, k + 113) * 360.f, 90.f + (H01(Ci, k + 109) - 0.5f) * 20.f);
				Ts[*MusLook].Add(FTransform(R, FVector(Q.X, Q.Y, G - 1.2f * Sz), FVector(0.08f, 0.025f, 0.04f) * Sz));
			}
			if (Nm > 0) { TArray<FVector>& Pl = Placed.FindOrAdd(TEXT("mussel")); if (Pl.Num() < 64) Pl.Add(HotBrookCoords::ToUE(X, Y, HotBrookCoords::Datum)); }
		}
	}
	NInst = 0;
	for (int32 i = 0; i < Looks.Num(); i++) {
		UHierarchicalInstancedStaticMeshComponent* C = Looks[i].C; if (!C) continue;
		C->ClearInstances(); if (Ts[i].Num()) C->AddInstances(Ts[i], false, true);
		NInst += Ts[i].Num();
	}
	UE_LOG(LogHotBrookWeeds, Display, TEXT("weeds: %d cells about the walker, %d plants and shells (yf %.3f)"), N, NInst, F(4));
}

bool AHotBrookWeeds::Nearest(const FString& Key, const FVector2D& From, FVector& OutP) const
{
	const TArray<FVector>* P = Placed.Find(Key); if (!P || !P->Num()) return false;
	double Best = 1e18;
	for (const FVector& Q : *P) { const double D = FVector2D::DistSquared(HotBrookCoords::ToSim(Q), From); if (D < Best) { Best = D; OutP = Q; } }
	return true;
}
