# Tasks

## 1. Timeline & Camera Controls in SceneManager

- [x] 1.1 Add `setTime(t: number)`, `togglePlayPause()`, `isPaused()`, and time-synchronization callback in `src/core/SceneManager.ts`, and verify with `npm run build`.
- [x] 1.2 Add camera mode toggle method `toggleAutoOrbit()` in `src/core/CameraController.ts` and expose it via `SceneManager.ts`, and verify with `npm run build`.

## 2. Romantic Audio Player & Keepsake Utilities

- [x] 2.1 Implement procedural Web Audio chime/melody synthesizer in `src/utils/audioPlayer.ts` playing soft music-box arpeggios on user activation, and verify with `npm run build`.
- [x] 2.2 Implement commemorative photo download utility `exportCanvasSnapshot()` in `src/utils/snapshot.ts` capturing the 3D canvas and initiating a PNG download, and verify with `npm run build`.

## 3. Glassmorphic UI Overlay & Interactive Letter Modal

- [x] 3.1 Implement `src/ui/GiftUIOverlay.ts` constructing the floating 20/10 header banner, interactive 4-phase timeline stepper bar, and action buttons with responsive styles in `src/style.css`, and verify with `npm run build`.
- [x] 3.2 Implement interactive 20/10 greeting letter modal in `GiftUIOverlay.ts` with open/close animations and heartfelt Vietnamese Women's Day wishes, and verify with `npm run build`.

## 4. Integration & Visual Verification

- [x] 4.1 Update `index.html` with title "Chúc Mừng Ngày Phụ Nữ Việt Nam 20/10" and Google Serif fonts, mount `GiftUIOverlay` in `src/main.ts`, and verify with `npm run build`.
- [x] 4.2 Run end-to-end visual verification using `scripts/captureShots.mjs`, verifying the UI header, timeline controls, and modal dialog render cleanly without obscuring the bouquet.
