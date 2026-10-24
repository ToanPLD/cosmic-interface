# audio-playlist-system Specification

## Purpose
Manages a curated multi-track romantic music playlist for the 20/10 gift application, providing offline MP3 playback with fallback to procedural music box synthesis.

## Requirements

### Requirement: Curated Offline Audio Playlist Management
The system SHALL manage a playlist of 8 romantic and upbeat music tracks plus a procedural music box option, with "Flower" by Johnny Stimson configured as the initial priority track.

#### Scenario: Initializing the playlist on application startup
- **WHEN** the audio player initializes
- **THEN** the active track is set to "Flower" - Johnny Stimson (`/audio/flower.mp3`), and the playlist registers all 8 curated songs with artist details and source paths

### Requirement: Playlist Navigation and Auto-Advance
The system SHALL support sequential and random track navigation, advancing automatically to the next song upon track completion.

#### Scenario: Advancing to next track
- **WHEN** the user triggers next track or the currently playing song reaches its end
- **THEN** the player switches to the next track in the playlist, updates active playback status, and begins playing the new audio stream

#### Scenario: Selecting a specific track directly
- **WHEN** the user selects any track from the playlist drawer
- **THEN** the player immediately loads and plays the selected song and updates the current track index

### Requirement: Graceful Procedural Chime Fallback
The system SHALL fall back seamlessly to the procedural Web Audio API romantic music box when an MP3 audio file is absent or fails to load.

#### Scenario: Missing MP3 audio file handling
- **WHEN** an audio file cannot be loaded from the `/audio/` directory
- **THEN** the system logs a graceful notice and automatically starts synthesizing delicate metallic music-box chimes without breaking the UI or throwing unhandled errors
