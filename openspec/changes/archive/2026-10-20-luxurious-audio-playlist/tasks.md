# Tasks

## 1. Audio Directory & Hybrid Player Engine

- [x] 1.1 Create `public/audio/` directory with `README.md` documenting file naming conventions and YouTube source links for all 8 curated songs, and verify directory presence.
- [x] 1.2 Upgrade `RomanticAudioPlayer` in `src/utils/audioPlayer.ts` to support the 8-track playlist, track navigation (`nextTrack`, `prevTrack`, `selectTrack`), HTML5 `Audio` streaming, and procedural music-box chimes fallback, and verify with `npm run build`.

## 2. Playlist UI Drawer & Header Integration

- [x] 2.1 Update header audio controls in `src/ui/GiftUIOverlay.ts` to display active song title and artist ticker alongside animated equalizer wave bars, and verify with `npm run build`.
- [x] 2.2 Implement the glassmorphic Playlist Drawer modal in `src/ui/GiftUIOverlay.ts` with tracklist browsing, active play badges, Prev/Next controls, and volume adjustment, and verify with `npm run build`.

## 3. Verification & Visual Inspection

- [x] 3.1 Run `npm run build` to confirm zero TypeScript and bundling errors across the entire codebase.
- [x] 3.2 Update and execute `scripts/captureShots.mjs` to capture screenshots of the open playlist drawer and active music pill, verifying visual quality and responsiveness.
