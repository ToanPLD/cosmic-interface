# Tasks

## 1. Dual-Clock Refactor in SceneManager

- [x] 1.1 Decouple `assemblyTime` from `continuousTime` in `src/core/SceneManager.ts`, clamping `assemblyTime` at 16.0s on completion while keeping `continuousTime` running indefinitely, and verify with `npm run build`.

## 2. Object State Persistence & Ambient Breathing

- [x] 2.1 Update `src/objects/FlowerBouquet.ts` so blossoms, wrapping, and ribbon remain at scale 1.0 once $t \ge 11.0s$, while breathing sway updates continuously, and verify with `npm run build`.
- [x] 2.2 Update `src/objects/PetalVortex.ts` so flying petals remain settled/hidden when assembly is complete ($t \ge 8.0s$), and verify with `npm run build`.
- [x] 2.3 Update `src/core/CameraController.ts` so continuous 360-degree rotation uses the continuous clock without resetting, and verify with `npm run build`.

## 3. UI Synchronization & Verification

- [x] 3.1 Update `src/ui/GiftUIOverlay.ts` so the progress bar stays at 100% and Phase 4 remains highlighted once complete, while Rewind and phase button clicks smoothly reset timeline, and verify with `npm run build`.
- [x] 3.2 Run visual verification with `scripts/captureShots.mjs` confirming the bouquet remains fully visible and intact beyond 16 seconds without resetting to the empty center.
