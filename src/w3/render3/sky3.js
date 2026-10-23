// sky3.js — the sky over the Hot Brook lakes (browser layer): three's physical sky (Preetham's scattering, its sun disc and its
// clouds — vendor/three-0.186.1/addons/SkyMesh.js) under the sun where it really is, and the colour of the haze the land fades into.
// The sun: its height and bearing at 45.63° N for the sim's date and hour (the solar declination by day of year; the hour angle from
// the sim's time of day, which runs on local solar time) — it rose in a fixed southern arc before, the same every day of the year.
// The clouds follow the sim's weather (ENVC.CLOUD_COVER: clear, cloudy, rain, storm); the haze's colour is the sky's own at the
// horizon, warmer toward a low sun.
import * as THREE from '../../../vendor/three-0.186.1/three.webgpu.min.js';
import { SkyMesh } from '../../../vendor/three-0.186.1/addons/SkyMesh.js';

const LAT = 45.63 * Math.PI / 180;
// the sun's unit direction (three's axes: x east, y up, z south) for year-fraction yf (0 = March 1) and time of day t (0–1, solar)
export function sunDir(yf, t, out = new THREE.Vector3()) {
  const N = (yf * 365 + 59) % 365, dec = 23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (284 + N) / 365);
  const H = (t * 24 - 12) * 15 * Math.PI / 180;   // hour angle (+ afternoon)
  const sinAlt = Math.sin(LAT) * Math.sin(dec) + Math.cos(LAT) * Math.cos(dec) * Math.cos(H), alt = Math.asin(sinAlt);
  // azimuth from north, clockwise (east = +π/2)
  const az = Math.atan2(-Math.sin(H) * Math.cos(dec), Math.cos(LAT) * Math.sin(dec) - Math.sin(LAT) * Math.cos(dec) * Math.cos(H));
  const ca = Math.cos(alt); return out.set(ca * Math.sin(az), sinAlt, -ca * Math.cos(az));   // (north is −z)
}

export function makeSky(KM) {
  const sky = new SkyMesh();
  sky.scale.setScalar(5000 * KM); sky.renderOrder = -1; sky.frustumCulled = false;
  sky.turbidity.value = 2.6; sky.rayleigh.value = 1.4; sky.mieCoefficient.value = 0.0025; sky.mieDirectionalG.value = 0.78;   // (a clear Maine day: less of the white haze about a low sun — the human, 2026-10-23)
  sky.cloudScale.value = 0.00025; sky.cloudSpeed.value = 0.00003; sky.cloudElevation.value = 0.55;
  const dir = new THREE.Vector3(), haze = new THREE.Color(), _c = new THREE.Color();
  // the clouds' cover and density by the sim's weather (0 clear, 1 cloudy, 2 rain, 3 storm): fair-weather cumulus on a clear day
  const COVER = [0.28, 0.62, 0.86, 0.95], DENS = [0.35, 0.55, 0.8, 0.95];
  return {
    mesh: sky, dir, haze,
    // each frame: the sun for the date and hour, the clouds for the weather; returns the sun's direction
    update(yf, t, weather, camera) {
      sunDir(yf, t, dir); sky.sunPosition.value.copy(dir).multiplyScalar(450000);
      const w = Math.max(0, Math.min(3, weather | 0)); sky.cloudCoverage.value += (COVER[w] - sky.cloudCoverage.value) * 0.02; sky.cloudDensity.value += (DENS[w] - sky.cloudDensity.value) * 0.02;
      sky.turbidity.value = 2.6 + 4 * (w >= 2 ? 1 : 0);   // (rain and storms: a heavier, greyer sky)
      sky.position.copy(camera.position);
      // the haze's colour: a pale blue-white horizon by day, warmer as the sun gets low, grey under cloud
      const h = dir.y, warm = Math.max(0, Math.min(1, 1 - h / 0.25)) * (h > -0.1 ? 1 : 0);
      haze.setRGB(0.74, 0.81, 0.87).lerp(_c.setRGB(0.95, 0.72, 0.52), 0.55 * warm).lerp(_c.setRGB(0.66, 0.68, 0.7), w >= 1 ? 0.5 + 0.15 * w : 0);
      return dir;
    },
  };
}
