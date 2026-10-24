# Tasks

## 1. Procedural Botanical Assets & High-Detail Petal Geometry

- [x] 1.1 Implement `createRosePetalTexture()` in `src/utils/flowerGeometry.ts` generating procedural radial venation striations, 4-stop radial color gradient (`#fef3c7` base -> `#fce7f3` blush -> `#f472b6` rose body -> `#e11d48` outer margin), and soft edge alpha feathering, and verify with `npm run build`.
- [x] 1.2 Implement `createHighDetailPetalGeometry()` in `src/utils/flowerGeometry.ts` featuring a 32x32 vertex parametric surface with compound Gaussian curvature (concave spoon dish + reflexed outward lip) and recomputed vertex normals, and verify with `npm run build`.

## 2. Dense Interlocking English Garden Rose Assembly

- [x] 2.1 Refactor rose blossom assembly in `src/objects/FlowerBouquet.ts` to arrange 32 interlocking concentric petals across 4 botanical whorls (Core 6, Inner Cup 8, Mid Whorl 10, Base Reflexed 8) with progressive tilt and radial overlap, completely eliminating core gaps, and verify with `npm run build`.
- [x] 2.2 Configure velvety petal material properties with procedural canvas texture, subtle translucent sheen, and double-sided rendering, and verify with `npm run build`.

## 3. Seamless Parametric Origami Gift Wrapping & Satin Ribbon

- [x] 3.1 Implement `createSeamlessPleatedWrappingGeometry()` in `src/utils/flowerGeometry.ts` generating a continuous lofted parametric mesh with harmonic radial undulating pleats $R(\theta, y) = R_{\text{cone}}(y) \cdot [1.0 + 0.22\cos(6\theta) + 0.12\sin(3\theta)]$, eliminating polygon gaps, and verify with `npm run build`.
- [x] 3.2 Update `FlowerBouquet.ts` to integrate the continuous pleated wrapping mesh, an inner crinkled white silk ruffle collar, and a draped burgundy satin ribbon bow with smooth animation interpolation, and verify with `npm run build`.

## 4. Vortex Integration & Visual Verification

- [x] 4.1 Update `src/objects/PetalVortex.ts` so orbiting and inward-spiraling petals adopt the high-detail petal geometry and procedural venation texture for seamless visual continuity upon docking, and verify with `npm run build`.
- [x] 4.2 Run end-to-end visual verification using `scripts/captureShots.mjs`, inspect rendered bouquet imagery at key animation timestamps, and confirm dense English rose bloom, delicate venation, and seamless luxury origami packaging.
