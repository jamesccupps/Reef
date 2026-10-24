// HotBrookNightSky — the night over the lakes (a dark site: no town's glow for miles): the STARS and the MILKY WAY wheeling about the
// pole as the hours go (M_HB_NightSky on a great sphere about the camera: Scripts/make_night_sky_material.py), the faint airglow at
// the horizon that the treelines stand black against, and the MOON — where it is for the sim's date and hour, by its phase this year
// (its age from a known new moon, 2000-01-06 18:14 UTC: its elongation from the sun, on the ecliptic), its disc lit on the sun's side,
// and its light: a second sun for the sky atmosphere, silver-blue, by its phase and height (scaled as the dark-adapted eye sees it,
// not as a light meter: a full moon's landscape is plain to walk by). All of it fading in as the twilight deepens.
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HotBrookNightSky.generated.h"

class UStaticMeshComponent;
class UMaterialInstanceDynamic;
class ADirectionalLight;

UCLASS()
class HOTBROOK_API AHotBrookNightSky : public AActor
{
	GENERATED_BODY()
public:
	AHotBrookNightSky();
	virtual void BeginPlay() override;
	virtual void Tick(float Dt) override;
	float MoonLit() const { return Lit; }   // (the moon's lit share now, 0 new … 1 full)
private:
	UPROPERTY() TObjectPtr<UStaticMeshComponent> Dome;
	UPROPERTY() TObjectPtr<UMaterialInstanceDynamic> Mat;
	UPROPERTY() TObjectPtr<ADirectionalLight> Moon;
	UPROPERTY() TObjectPtr<ADirectionalLight> Sun;
	float Lit = 0.f;
};
