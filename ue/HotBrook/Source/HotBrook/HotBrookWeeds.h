// HotBrookWeeds — the lakes' water plants as the live simulation has them (src/w3/plants3.js: every species' shoots per bed cell, laid
// on the lake bed about the walker by ue/link/weeds.mjs — the browser's plants3view.js's blend and clumps — and sent as "HBP1"): in each
// 5-m water cell, each species' share of its full stand drawn as that share of a full stand's plants, scattered by a hash —
//   - the FLOATING-LEAVED on the surface: the fragrant water-lily's clumps (Valery.Li's Nymphaea odorata — its white flowers), the
//     yellow pond-lily's (the "lake lily": big pads on a rhizome), watershield's small pads (the lake lily made small), floating
//     pondweed and bur-reed (the pondweed);
//   - the tall SUBMERGED pondweeds with their floating leaves (ribbon-leaf, large-leaf: the pondweed);
//   - the EMERGENT reeds from the bed up through the surface, 0.5–1.3 m above it (build_reeds.py's bulrush, pickerelweed — also for
//     bogbean and arrowhead —, horsetail; the sedge the grass tuft made tall);
//   - the MUSSELS (littoral3: eastern elliptio /m²): dark shells standing half-buried in the bed, within ~25 m.
// The low rosettes, bladderworts, Robbins' pondweed and the stoneworts on the deep bed are not drawn (under the tea water they don't
// show). Rebuilt on each message (the host sends one when the walker has moved 20 m, or every half minute).
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookWeeds.generated.h"

class UHierarchicalInstancedStaticMeshComponent;
class UStaticMesh;

UCLASS()
class HOTBROOK_API AHotBrookWeeds : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookWeeds();
	virtual void BeginPlay() override;
	// a plants message ("HBP1": ue/link/weeds.mjs)
	void Update(const TArray<uint8>& B);
	int32 NumInstances() const { return NInst; }
	// the nearest plant of a species (its key in plants3's FORMS3, e.g. "whitelily", "bulrush") to a place (the sim's metres): where (UE)
	bool Nearest(const FString& Key, const FVector2D& From, FVector& OutP) const;
private:
	// a look: a mesh, how a stand of it is drawn (instances in a 5-m cell at a full stand; its scale), where (0 on the surface, 1 the
	// reeds from the bed through it, 2 the bed)
	struct FLook { TObjectPtr<UStaticMesh> Mesh; int32 Per = 10; float Scale = 1.f, H = 100.f; int32 Where = 0; TObjectPtr<UHierarchicalInstancedStaticMeshComponent> C; };   // (H: a reed mesh's own height, cm)
	TArray<FLook> Looks;
	TMap<FString, int32> LookOfKey;   // (a species' key → its look)
	UPROPERTY() TArray<TObjectPtr<UObject>> Held;
	int32 NInst = 0;
	TMap<FString, TArray<FVector>> Placed;   // (where each species' plants were put: for a look at one)
	int32 AddLook(const TCHAR* Mesh, int32 Per, float Scale, int32 Where, float CullM, float H = 100.f);
};
