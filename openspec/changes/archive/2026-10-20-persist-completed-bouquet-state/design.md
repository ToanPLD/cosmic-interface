# Design

## Context

See `proposal.md` for motivation. Currently, `SceneManager.ts` uses modular arithmetic `manualTime = (manualTime + rawDelta) % 16.0;`, causing the timeline to cycle endlessly and destroy the completed bouquet every 16 seconds. This design decouples the one-way assembly choreography timeline from the infinite ambient runtime clock.

## Goals / Non-Goals

**Goals:**
- Clamp the assembly choreography timeline once it reaches the completed presentation state ($t = 16.0s$), keeping the bouquet fully blooming and wrapped indefinitely.
- Allow continuous ambient effects (360° camera orbit, fairy dust particle flow, gentle breathing sway) to run indefinitely using an un-clamped continuous clock.
- Preserve full manual replay functionality: recipient can click Rewind (`⏮`), Play/Pause (`▶`/`⏸`), or any phase stepper button at any time to re-watch the assembly.

**Non-Goals:**
- Removing user replay controls; recipient remains in full control to re-watch whenever desired.

## Decisions

### 1. Dual-Clock Architecture (Assembly Time vs Ambient Clock)
- **Choice**: Separate `assemblyTime` (clamped at $[0.0, 16.0]$) and `continuousTime` (monotonically increasing):
  - `SceneManager.render`:
    `this.continuousTime += rawDelta;`
    `if (!this.isPausedState) { this.assemblyTime = Math.min(16.0, this.assemblyTime + rawDelta); }`
- **Rationale**: The bouquet gathering, bloom scaling, and ribbon wrapping depend on `assemblyTime` and thus permanently settle into their completed 1.0 state once finished. Meanwhile, camera rotation, sparkle particle movement, and organic flower breathing depend on `continuousTime` (or `rawDelta`), maintaining vivid life and movement indefinitely.

### 2. Rewind & Replay Interactivity
- **Choice**: When the recipient clicks Rewind (`⏮`) or any Phase button (e.g. Phase 1 at $t=0.0$), `this.assemblyTime` is set to that timestamp and playback resumes smoothly.
- **Rationale**: Gives recipients the best of both worlds: a stable completed gift to admire, plus the freedom to replay the magic gathering moment on demand.

### 3. UI Stepper and Progress Bar Persistence
- **Choice**: In `GiftUIOverlay.ts`, when `assemblyTime >= 16.0`, the progress bar rests at 100%, and Phase 4 ("Hoàn Mỹ") remains highlighted.
- **Rationale**: Accurately conveys to the user that the bouquet is complete.
