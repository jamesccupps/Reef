# three.js r186 (vendored)

`three.webgpu.min.js` is three.js 0.186.1 (npm `three@0.186.1`, published 2026-09-24): `build/three.webgpu.js` bundled with
the `build/three.core.js` it imports, minified, one ES module (esbuild 0.25.10:
`esbuild build/three.webgpu.js --bundle --minify --format=esm --legal-comments=inline`). The TSL shading functions are its
`TSL` export. Served from the project itself so the Content-Security-Policy stays `script-src 'self'` and the 3-D view works
offline. MIT licence: `LICENSE`.
