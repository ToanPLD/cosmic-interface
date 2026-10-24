# Design

## Context

See `proposal.md` for motivation. Currently, `RomanticAudioPlayer` in `src/utils/audioPlayer.ts` synthesizes a procedural D-major Canon arpeggio using the Web Audio API. The user requested support for 8 specific songs played via local MP3 files placed in `public/audio/`, with "Flower" by Johnny Stimson as the default priority track, alongside an interactive playlist drawer for selecting songs and full fallback to the procedural chimes.

## Goals / Non-Goals

**Goals:**
- Provide a robust hybrid audio engine supporting both HTML5 `Audio` for local MP3 files and the existing procedural Web Audio API music-box chimes.
- Configure the curated 8-track playlist with metadata, filenames, and YouTube references.
- Auto-advance to the next track upon song completion and provide Next (`⏭`) / Previous (`⏮`) controls.
- Prevent crashes or silent failures: if any MP3 file is not yet present on disk, fall back to procedural chimes automatically.
- Provide an elegant glassmorphism Playlist Drawer modal in `GiftUIOverlay.ts` matching the luxurious 20/10 visual theme.

**Non-Goals:**
- Downloading copyrighted YouTube audio automatically via backend servers (the application remains a fast, secure static client-side bundle where the user places their preferred audio files).

## Decisions

### 1. Hybrid Audio Engine (HTML5 Audio + Web Audio API Fallback)
- **Choice**: The upgraded `RomanticAudioPlayer` manages both an HTML5 `HTMLAudioElement` for MP3 files and the existing `AudioContext` oscillator network for procedural chimes.
- **Rationale**: Browsers handle streaming and decoding MP3 files natively with standard audio controls and event listeners (`ended`, `error`, `timeupdate`). If an MP3 file path returns a 404 or format error, the engine seamlessly triggers `playProceduralChimes()` so the romantic atmosphere never goes silent.

### 2. Playlist Structure and Track Identification
- **Track List**:
  1. `flower`: "Flower" - Johnny Stimson (`/audio/flower.mp3`) - **Default**
  2. `wonderful-u`: "Wonderful U" - AGA (`/audio/wonderful-u.mp3`)
  3. `berlin`: "BERLIN" - Khoi Vu (`/audio/berlin.mp3`)
  4. `cho-trong-trang`: "Chờ trong trăng (Remix)" - Wren Evans x Htingale (`/audio/cho-trong-trang.mp3`)
  5. `nhe-buong`: "Nhẹ Buông (Remix)" - Hằng Ssi x AM (`/audio/nhe-buong.mp3`)
  6. `bien-dao-va-em`: "[Mashup] Biển Đảo Và Em x I Hate You I Love You" - QuinVy (`/audio/bien-dao-va-em.mp3`)
  7. `em-la`: "Em Là (Kirimi Remix)" - MONO (`/audio/em-la.mp3`)
  8. `tinh-yeu-mau-nang`: "Tình Yêu Màu Nắng" - MCK x Obito Type Beat (`/audio/tinh-yeu-mau-nang.mp3`)
  9. `music-box`: "Giai Điệu Hộp Nhạc (Chimes)" - Bản Không Lời (`procedural`)

### 3. Glassmorphic Playlist Drawer in UI
- **Choice**: Add a playlist drawer panel inside `GiftUIOverlay.ts` that slides in smoothly when clicking the header music pill or playlist button.
- **Rationale**: Maintains a clean, cinematic 3D viewport while giving the recipient intuitive access to track switching, volume control, and track information.

## Risks / Trade-offs

- **[Risk] Missing MP3 files**: The user has not yet copied MP3 files into `public/audio/`.
  → **Mitigation**: Detect `HTMLAudioElement` error and automatically fall back to procedural chimes, displaying a gentle helper toast in the drawer reminding the user of the audio directory.
- **[Risk] Autoplay policy restrictions**: Browsers block audio playback without prior user interaction.
  → **Mitigation**: Audio initializes and resumes on the user's first click on the music button or interactive viewport.
