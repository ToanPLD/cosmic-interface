# Proposal

## Why

The current floral bouquet assembly animation functions mechanically, but the visual elements appear crude, disjointed, and flat—petals look low-poly and uniformly colored without organic curvature or venation, roses have visible gaps between loose petals, and the gift wrapping consists of disconnected planar cones with visible hard seams. For a meaningful Vietnamese Women's Day (20/10) gift presentation, the bouquet must convey luxury, craftsmanship, and botanical delicacy following `/anatomy` principles: micro-veined velvety petals, lush multi-layered English garden roses with zero gaps, and continuous pleated origami wrapping paper with delicate silk ruffles.

## What Changes

- **Procedural Petal Canvas Texture & Vein Microstructure**: Create a high-resolution (1024x1024) procedural canvas texture generator creating organic radial venation striations, soft 4-stop radial gradient coloring (`#fef3c7` creamy base -> `#fce7f3` blush pink -> `#f472b6` rose body -> `#e11d48` outer lip), and subtle alpha fringe softness.
- **Compound Gaussian Curvature Petal Geometry**: Upgrade petal geometry from low-poly displacement to a 32x32 parametric surface featuring 3D spoon dishing along the radial axis, organic undulating borders, and outward reflexed edges.
- **Dense Interlocking English Garden Rose Architecture**: Redesign rose blossom assembly to feature 32 tightly nested petals arranged in 4 distinct botanical whorls (Core 6, Inner Cup 8, Mid Whorl 10, Base Reflexed 8) to completely eliminate hollow gaps and achieve a lush, opulent peony-rose bloom.
- **Seamless Parametric Pleated Origami Gift Wrapping**: Replace disjointed cone geometry with a single continuous lofted pleated origami mesh defined by radial harmonic perturbation $R(\theta, y) = R_{\text{cone}}(y) \cdot [1.0 + 0.22\cos(6\theta) + 0.12\sin(3\theta)]$, lined with an inner crinkled silk ruffle collar and tied with a draped burgundy satin ribbon.
- **Cohesive Integration with Flight Vortex**: Ensure both orbiting flying petals in `PetalVortex` and settled bouquet roses in `FlowerBouquet` utilize the high-detail petal geometry, procedural textures, and smooth lighting.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `floral-bouquet-system`: Upgrade blossom petal fidelity with procedural radial venation and compound curvature, re-architect roses into dense 32-petal English garden blooms without gaps, and implement seamless parametric pleated luxury gift wrapping with inner silk collar.

## Impact

- **Affected Files**:
  - `src/utils/flowerGeometry.ts`: Add `createRosePetalTexture()`, `createHighDetailPetalGeometry()`, and `createSeamlessPleatedWrappingGeometry()`.
  - `src/objects/FlowerBouquet.ts`: Refactor rose generation to use dense 32-petal whorls; replace disjointed wrapping planes with seamless parametric pleated mesh and inner silk collar.
  - `src/objects/PetalVortex.ts`: Use upgraded high-detail petal textures and geometries for the orbiting and gathering petal particles.
- **Performance**: Canvas textures are generated procedurally once in memory and shared across materials/instances with low memory footprint (~4MB VRAM) and smooth 60fps rendering.
