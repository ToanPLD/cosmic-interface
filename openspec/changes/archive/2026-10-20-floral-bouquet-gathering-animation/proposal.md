# Proposal: Floral Bouquet Gathering & Blooming 3D Animation

## Why

The application is transforming into an interactive, cinematic 3D digital gift. Instead of a deep-space cosmic black hole, the scene presents a magical floral assembly: initially, the center is empty while individual flower petals, florets, and leaves dance in 3D orbits; they then spiral inward along a golden vortex to assemble into a full, luxurious flower bouquet inspired by the reference image (pink roses, ruffled carnations, blue delphinium florets, eucalyptus greenery, layered wrapping paper, burgundy ribbon bow, and a "LUCKY TO HAVE YOU" greeting card).

## What Changes

- **Flower & Petal System**:
  - Procedural 3D organic meshes for curved rose petals, ruffled carnation petals, 5-petal blue florets, and eucalyptus leaves with soft velvet double-sided materials.
  - 3D layered wrapping paper geometry in soft pastel blush and a satin burgundy ribbon bow with trailing tails.
  - An elegant greeting card displaying "LUCKY TO HAVE YOU".
- **Choreographed Gathering Animation (4-Phase Kinematic Timeline)**:
  - **Phase 1 (0s–4s - Dispersed Orbital Dance)**: Center is empty; petals and florets circulate along 3D tilted orbits with gentle fluttering and spinning.
  - **Phase 2 (4s–8s - Convergent Spiral Gathering & Bloom)**: Orbital radii contract smoothly along a golden vortex toward center; petals dock into blossoms from core outward.
  - **Phase 3 (8s–11s - Wrapping & Ribbon Tie)**: Wrapping paper panels sweep in to enclose stems; ribbon coils and ties into a bow; greeting card settles into place.
  - **Phase 4 (11s+ - Complete Presentation & Interactive Orbit)**: Finished bouquet radiates soft golden bloom and fairy dust sparkles; camera glides in continuous 360-degree orbit with user rotation controls.
- **Atmospheric Environment**:
  - Replaces cosmic starfield with warm, romantic ambient lighting, floating fairy dust sparkles, and a soft luxury backdrop.

## Capabilities

### New Capabilities
- `floral-bouquet-system`: 3D procedural organic flora modeling, multi-phase convergent spiral kinematics, material styling (velvet petal shaders and satin ribbons), and romantic atmospheric lighting.

### Modified Capabilities
*(None)*

## Impact

- **Affected Modules**:
  - `src/core/SceneManager.ts`: Updated to orchestrate the floral animation lifecycle.
  - `src/objects/`: Replaces black hole and sci-fi carousel modules with `FlowerBouquet.ts`, `PetalVortex.ts`, and `SparkleEnvironment.ts`.
  - `src/shaders/`: Introduces soft petal translucent shader and sparkling particle shaders.
