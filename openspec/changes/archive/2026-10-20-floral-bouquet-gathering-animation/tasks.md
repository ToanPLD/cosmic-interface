# Tasks

## 1. 3D Botanical Modeling & Procedural Petal Geometries

- [x] 1.1 Create procedural petal, floret, and eucalyptus leaf geometry generators (`src/utils/flowerGeometry.ts`) with organic curvature, velvet shaders, and double-sided materials. Verify via `npm run build`.
- [x] 1.2 Implement the assembled `FlowerBouquet.ts` component featuring layered pink roses, ruffled carnations, blue delphinium florets, eucalyptus greenery, blush wrapping paper cones, a burgundy satin ribbon bow, and a "LUCKY TO HAVE YOU" greeting card. Verify via `npm run build`.

## 2. Kinematic Petal Vortex & Inward Gathering Animation

- [x] 2.1 Implement `PetalVortex.ts` managing individual floating petals circulating along 3D orbits during Phase 1 (0s–4s) and smoothly transitioning along golden vortex spirals to dock into their target blossom positions during Phase 2 (4s–8s). Verify via `npm run build`.
- [x] 2.2 Implement packaging animation for wrapping paper enclosure and burgundy ribbon bow tying during Phase 3 (8s–11s). Verify via `npm run build`.

## 3. Romantic Environment, Scene Orchestration & Verification

- [x] 3.1 Create `SparkleEnvironment.ts` featuring a 3-point romantic studio lighting rig, floating fairy dust particles, and soft ambient glow. Verify via `npm run build`.
- [x] 3.2 Update `SceneManager.ts` and `CameraController.ts` to orchestrate the 4-phase timeline, smooth transition choreography, and user orbital navigation. Verify via `npm run build`.
- [x] 3.3 Execute full production build and capture verification snapshots across all 4 animation phases (t = 2s, 6s, 10s, 14s) confirming smooth gathering, zero black artifacts, and rich floral bouquet aesthetics.
