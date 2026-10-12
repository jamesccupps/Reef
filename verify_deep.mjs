import { seed } from './src/core.js';
import { World } from './src/world.js';
import { MACRO, WORLD } from './src/config.js';

seed(444);
const vw = new World();
for (let i = 0; i < 1500; i++) vw.step(1 / 30);

const vlive = vw.plants.filter(p => !p.dead);
const deepPlants = vlive.filter(p => p.baseY / WORLD.H > 0.72);
const extremeDeep = vlive.filter(p => p.baseY / WORLD.H > 0.90);

console.log(`Total living plants: ${vlive.length}`);
console.log(`Deep plants (bedFrac > 0.72): ${deepPlants.length}`);
console.log(`Extreme deep (bedFrac > 0.90): ${extremeDeep.length}`);

if (deepPlants.length > 0) {
  const varieties = {};
  for (const p of deepPlants) {
    const v = MACRO[p.v].key;
    varieties[v] = (varieties[v] || 0) + 1;
  }
  console.log(`Deep plant varieties:`, varieties);
}

if (extremeDeep.length > 0) {
  const varieties = {};
  for (const p of extremeDeep) {
    const v = MACRO[p.v].key;
    varieties[v] = (varieties[v] || 0) + 1;
  }
  console.log(`Extreme deep plant varieties:`, varieties);
  console.log(`Extreme deep plants by depth:`);
  for (const p of extremeDeep.slice(0, 5)) {
    const frac = (p.baseY / WORLD.H).toFixed(3);
    console.log(`  ${MACRO[p.v].key} at bedFrac ${frac}`);
  }
}
