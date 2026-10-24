// HotBrookWildlife — the lakes' fish-eating birds and mammals and their two big herps as the live simulation has them, each with its
// own simple life (as the browser's render3/wild3view.js and shallows3view.js give them). WHAT THE SIM DECIDES (fish3 WILD3 through
// the link): how many of each are on the lakes now (_wildN — by the lakes' area, their shore, per lake; none out of season), how
// active each is by the light, and every fish they take (where, how deep, how big). HERE, each lake its share:
//   - the COMMON LOONS swim the open water (≥ 1.5 m), diving every minute or two for half a minute — one dives where the sim says a
//     loon took a fish, and comes up there — and rest on the water at night;
//   - the GREAT BLUE HERONS stand in the shallows (5–35 cm) and step slowly to the next spot, toward a fish taken near them;
//   - the BELTED KINGFISHERS sit on a dead limb leaning out over the water's edge (2.5–3.5 m up), watching; fly out with their
//     rattling flap, hover, plunge head first and come back — to where the sim's kingfisher took a fish when one does;
//   - the OSPREYS circle high over the open water (18–30 m), hover, plunge feet first and lift off heavy, carrying the fish off over
//     the woods (to a perch out of sight) and coming back a few minutes later;
//   - the BALD EAGLES soar high in wide circles on few wingbeats by day and glide down to snatch a fish at the surface where the sim's
//     eagle took one, flying off with it; in the woods at night;
//   - the COMMON and HOODED MERGANSERS in a group along the shore (a pair in spring, five or four in hen's plumage after), swimming
//     together, each diving for a while and coming up again;
//   - the RIVER OTTERS swimming the shallows along the shore, porpoising, diving for half a minute, hauling out on the bank to eat;
//   - the MINK at night: bounding along the water's edge, now and then a short swim and a dive in the shallows;
//   - the SNAPPING TURTLES walking slowly on the bed of the shallows (WILD3 1 a hectare) and the BULLFROGS floating at the weedy edge
//     (10 a km of shore) — drawn at those densities near the walker, where the sim has them out (late May – mid-September; mid-May –
//     mid-October).
// The models: the loon and heron scans (Import/models), the rest from Import/creatures (Scripts/import_creatures.py; the birds in
// flight and the otter's swim are animated). `hb.AllLife 1` shows every kind whatever the season (for a look at one).
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookWildlife.generated.h"

class UStaticMeshComponent;
class USkeletalMeshComponent;
class UStaticMesh;
class USkeletalMesh;
class UAnimSequence;
class UMaterialInterface;

UCLASS()
class HOTBROOK_API AHotBrookWildlife : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookWildlife();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	// the snapshot's wildlife: how many of each (fish3 WILDK order) and its activity now; the fish taken since the last (6 floats each:
	// x, y, depth m, WILDK index, length cm, species); the year's fraction (the day: who of a fractional count is about); the lakes'
	// mean ice (m)
	void Update(const float* Counts, const float* Act, int32 NKinds, const float* Taken, int32 NTaken, float YearFrac, float IceMean);
	UPROPERTY(EditAnywhere, Category = "HotBrook") float DrawRadius = 2500.f;   // m from the walker
	// the animal of a kind (fish3 WILDK index) nearest a place (the sim's metres) now, in sight: where it is (UE), the yaw it faces —
	// what a look at one is framed on; false if none is about
	bool Nearest(int32 Kind, const FVector2D& From, FVector& OutP, float& OutYaw) const;
	// the kind's index for a name ("loon", "kingfisher", "otter", …), or -1
	static int32 KindOf(const FString& Name);
	// how many of the anglers' kinds the sim has out now (fish3 WILDK 11: in a boat; 12: on the ice) and the lakes' ice — AHotBrookAnglers reads them
	float Count(int32 Kind) const { return Kind >= 0 && Kind < 16 ? N[Kind] : 0.f; }
	float Activity(int32 Kind) const { return Kind >= 0 && Kind < 16 ? ActNow[Kind] : 0.f; }
	float Ice() const { return IceNow; }
	float Year() const { return YearNow; }
	// the fish the sim's anglers took since the last snapshot (x, y — the sim's metres; kind 11 or 12), for AHotBrookAnglers to play a catch
	TArray<FVector> AnglerTakes;
private:
	enum EKind : int32 { Loon = 0, Heron = 1, Kingfisher = 2, Osprey = 3, Eagle = 4, CMerg = 5, HMerg = 6, Otter = 7, Mink = 8, Snapper = 9, Bullfrog = 10, NKinds = 11 };
	// a model: a still mesh or a skinned one with its clip; how it is scaled (its real size over the model's), where its middle is
	// (cm, the model's own frame — subtracted) and the moment of its clip to hold for a glide (s; < 0 none)
	struct FLook { TObjectPtr<UStaticMesh> SM; TObjectPtr<USkeletalMesh> SK; TObjectPtr<UAnimSequence> Clip; float Scale = 1.f; FVector Offset = FVector::ZeroVector; float Glide = -1.f; };
	struct FLake { TArray<FVector2D> Pts; TArray<FVector2D> Out; TArray<double> Arc; FBox2D Box; double Area = 0, Shore = 0; float Level = 0; };
	// one of a merganser group, beside its leader
	struct FMember { FVector2D P, Off; float Heading = 0, Z = 0; int32 State = 0; double Until = 0; TObjectPtr<UStaticMeshComponent> C; };
	struct FBird {
		int32 Kind = 0, Lake = 0, State = 0; FVector2D P, Goal, Centre, From; float Heading = 0, Alt = 0, Radius = 80.f, Ang = 0, Hover = 0, Z = 0, Pitch = 0;
		double Until = 0, T0 = 0, Arc = 0; bool bAway = false;
		TObjectPtr<UStaticMeshComponent> S; TObjectPtr<USkeletalMeshComponent> K; TObjectPtr<UStaticMeshComponent> Prop;   // (the body; a kingfisher's limb)
		FVector Perch = FVector::ZeroVector; float PerchYaw = 0;   // (a kingfisher's: where it sits, UE cm, and the way it faces — out over the water)
		int32 Look = -1;   // (which of its looks the skinned body wears: 0 perched, 1 flying)
		TArray<FMember> Members;
	};
	// a herp of the shallows near the walker (its place's key, so it keeps its state while the walker moves)
	struct FHerp { int32 Kind = 0; FVector2D P, Home, Goal; float Heading = 0, Scale = 1.f; double Until = 0; int32 State = 0; TObjectPtr<UStaticMeshComponent> C; bool bSeen = true; };
	TArray<FLake> Lakes;
	TArray<FBird> Birds;
	TMap<int64, FHerp> Herps;
	TMap<int32, FLook> Looks;   // (kind → its look; kingfisher, osprey: 100 + kind the perched one)
	UPROPERTY() TArray<TObjectPtr<UObject>> Held;   // (every mesh, clip and material — else freed by the garbage collector)
	TObjectPtr<UStaticMesh> Limb; TObjectPtr<UMaterialInterface> LimbMat;
	float N[16] = { 0 }, ActNow[16] = { 0 }; float YearNow = 0.3f, IceNow = 0.f; double CensusAt = -1e9, HerpsAt = -1e9;
	bool InLake(const FLake& L, const FVector2D& P) const;
	bool Fits(int32 Kind, const FVector2D& P) const;   // (water of the right depth for it)
	bool Pick(int32 Kind, int32 Lake, FVector2D& Out, const FVector2D* Near = nullptr, float Within = 0) const;
	void ShoreAt(const FLake& L, double S, FVector2D& OutP, FVector2D& OutOut) const;   // (a lake's 0.25-m line at arc length S, its outward normal)
	void Census();
	void Spawn(int32 Kind, int32 Lake);
	void Despawn(FBird& B);
	void Taken(int32 Kind, const FVector2D& P);
	void Herpetology(const FVector2D& Me);
	float Depth(const FVector2D& P, float* OutSurf = nullptr, float* OutGround = nullptr) const;
	bool LoadLook(int32 Key, const FString& Name, float Scale, float Glide = -1.f, bool bBase = false);
	UStaticMeshComponent* NewStatic(UStaticMesh* M);
	USkeletalMeshComponent* NewSkinned(const FLook& L);
	void Wear(FBird& B, int32 LookKey);   // (a skinned body put in another of its looks — a kingfisher's perch and flight)
	void Place(FBird& B, const FVector& At, float YawDeg, float PitchDeg = 0.f, float RollDeg = 0.f, bool bGlide = false);
	bool AllLife() const;
};
