// print_view.js — a preview of tools/hotbrook/export_print.mjs's models (browser): binary STLs, each a colour, seen from an angle.
//   print_view.html?d=exports/print/a1mini&f=onepiece.stl:c9c3b0[,parts/fourcolor_4.stl:3b7dd8 …][&az=30&el=35&zoom=1]
import * as THREE from '../../vendor/three-0.186.1/three.webgpu.min.js';
const q = new URLSearchParams(location.search), dir = q.get('d') || 'exports/print/a1mini';
const files = (q.get('f') || 'onepiece.stl:c9c3b0').split(',').map(s => { const [f, c] = s.split(':'); return { f, c: '#' + (c || 'c9c3b0') }; });
const canvas = document.getElementById('v'), renderer = new THREE.WebGPURenderer({ canvas, antialias: true });
await renderer.init(); renderer.setPixelRatio(devicePixelRatio); renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#e9ecef');
scene.add(new THREE.HemisphereLight('#ffffff', '#8a8a80', 1.6)); const sun = new THREE.DirectionalLight('#ffffff', 2.2); sun.position.set(-1, -0.6, 1.4); scene.add(sun);
const box = new THREE.Box3(); let tris = 0;
for (const { f, c } of files) {
  const buf = await (await fetch(`/${dir}/${f}`)).arrayBuffer(), dv = new DataView(buf), n = dv.getUint32(80, true), pos = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) pos[i * 9 + k] = dv.getFloat32(84 + i * 50 + 12 + k * 4, true);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true })); scene.add(m); g.computeBoundingBox(); box.union(g.boundingBox); tris += n;
}
const ctr = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()), R = Math.max(size.x, size.y) * 0.62 / (+q.get('zoom') || 1);
const az = (+q.get('az') || 25) * Math.PI / 180, el = (+q.get('el') || 38) * Math.PI / 180;
const cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 1, 5000); cam.up.set(0, 0, 1);
cam.position.set(ctr.x + R * 2 * Math.cos(el) * Math.sin(az), ctr.y - R * 2 * Math.cos(el) * Math.cos(az), ctr.z + R * 2 * Math.sin(el)); cam.lookAt(ctr);
document.getElementById('info').textContent = `${files.map(x => x.f).join(' + ')} · ${size.x.toFixed(0)} × ${size.y.toFixed(0)} × ${size.z.toFixed(1)} mm · ${tris.toLocaleString()} triangles`;
renderer.setAnimationLoop(() => renderer.render(scene, cam));
