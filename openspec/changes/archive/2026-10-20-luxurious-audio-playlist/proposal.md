# Proposal

## Why

The user requested the ability to change the background music to an enriched playlist featuring 8 curated romantic and lively songs (such as Johnny Stimson's "Flower", AGA's "Wonderful U", Khoi Vu's "BERLIN", Wren Evans' "Chờ trong trăng", MONO's "Em Là", etc.) played via local MP3 files in `public/audio/`. A dedicated offline playlist system gives the recipient the delight of listening to their favorite songs with full track controls, while preserving a zero-crash procedural chimes fallback if any audio file is absent.

## What Changes

- **Audio Playlist System (`src/utils/audioPlayer.ts`)**:
  - Implement a playlist manager supporting 8 specific curated songs + 1 procedural chime fallback option.
  - Default priority track set to "Flower" - Johnny Stimson (`/audio/flower.mp3`).
  - Support next track (`nextTrack`), previous track (`prevTrack`), direct track selection (`selectTrack`), play/pause, volume control, and auto-advancing to the next song when playback finishes.
  - Implement automatic fallback to the Web Audio API romantic music box synthesizer if an MP3 file is not found or fails to load.
- **Playlist UI Drawer & Track Display (`src/ui/GiftUIOverlay.ts`)**:
  - Update top header music pill to display current track title and artist (e.g. `🎵 Flower - Johnny Stimson`) alongside the equalizer wave bars and a playlist button (`☰` / `🎵`).
  - Build an elegant glassmorphism Playlist Drawer modal listing all 8 songs with play indicators, track numbers, and playback controls (Prev, Play/Pause, Next, Volume).
- **Public Audio Assets Directory (`public/audio/`)**:
  - Create `public/audio/` with a comprehensive `README.md` and placeholder instructions clearly specifying file names for all 8 songs.

## Capabilities

### New Capabilities
- `audio-playlist-system`: Manages the curated playlist of 8 offline songs, track switching, HTML5 Audio streaming, and graceful procedural chime fallback.

### Modified Capabilities
- `gift-ui-overlay`: Expand the header music controls to display the active track title/artist and provide an interactive playlist drawer for browsing and selecting tracks.

## Impact

- **Affected Files**:
  - `src/utils/audioPlayer.ts`: Refactor to support multi-track playlist and HTML5 Audio with procedural fallback.
  - `src/ui/GiftUIOverlay.ts`: Add playlist drawer DOM, track title ticker, and event bindings.
  - `public/audio/`: Create directory with documentation for placing the 8 MP3 files.
