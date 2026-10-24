# Design

## Context

See `proposal.md` for motivation. Currently, `index.html` loads a full-screen canvas rendered by `SceneManager`. There are no HTML UI elements, no timeline controls, no greeting modal, and no audio player. This design specifies an elegant, lightweight glassmorphic UI overlay layer (`GiftUIOverlay.ts`) built with pure TypeScript and CSS, interfacing seamlessly with `SceneManager`.

## Goals / Non-Goals

**Goals:**
- Provide a responsive floating glassmorphic header with 20/10 celebration branding and serif typography.
- Implement an interactive timeline stepper bar supporting play/pause, step backward/forward, and direct phase seeking (`t = 0.0s, 4.0s, 8.0s, 11.0s`).
- Implement an interactive greeting letter modal (`💌`) with rich romantic typography and easy message customization.
- Provide a floating action bar for instant HD photo download (`📸`) and 360° cinematic tour vs manual pointer interaction toggle (`🔄`).
- Include a procedural Web Audio melody player / music box generator for romantic background sound with zero external MP3 dependencies.

**Non-Goals:**
- Introducing heavy UI frameworks (React, Vue, Svelte); vanilla TypeScript and CSS provide maximum performance and instant load times.

## Decisions

### 1. Vanilla DOM & CSS vs External Framework
- **Choice**: Implement `GiftUIOverlay` as a standalone TypeScript class generating DOM elements and CSS animations.
- **Rationale**: Keeps bundle size minimal (<15KB), zero dependency conflicts, and direct, instantaneous synchronization with `SceneManager` animation frames.
- **Alternatives considered**: React/Vue (introduces 100KB+ bundle overhead and unnecessary state complexity for a celebratory gift page).

### 2. Bidirectional SceneManager Timeline Control
- **Choice**: Expose `setTime(timeInSeconds)`, `pause()`, `resume()`, and `isPaused()` on `SceneManager`.
- **Rationale**: Allows the timeline slider and phase buttons to seek cleanly to any point in the 16-second loop, freezing time so the user can rotate and inspect the bouquet at their leisure.
- **Alternatives considered**: Uncontrolled continuous clock (prevents user from pausing to admire the blossoms).

### 3. Procedural Web Audio Music Box vs External Audio File
- **Choice**: Implement a lightweight procedural Web Audio API melody generator (gentle music box / bell chimes playing Canon in D / romantic arpeggios) with audio equalizer visualizer bars.
- **Rationale**: 100% reliable, zero network latency or 404 broken audio links, complies with browser autoplay policies by starting on user click.
- **Alternatives considered**: External MP3 streaming (susceptible to network errors, CORS, or missing audio files).

### 4. High-Definition Commemorative Photo Export
- **Choice**: Hook directly into `renderer.domElement` during a render frame using `renderer.render()` followed by `toDataURL('image/png')` to download a crisp keepsake photo.
- **Rationale**: Gives users an instant shareable memento of the 3D bouquet gift.

## Risks / Trade-offs

- **[Risk] Small mobile screen overlap**:
  - *Mitigation*: Responsive media queries in `style.css` scaling down button sizes and padding on screens $< 640\text{px}$, keeping controls docked cleanly at screen margins without obscuring the central flower dome.
- **[Risk] Web Audio autoplay restrictions**:
  - *Mitigation*: Audio defaults to off with clear visual cues ("Bật Nhạc 🎵") and begins only upon explicit recipient click.
