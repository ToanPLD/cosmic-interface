# Proposal

## Why

While the 3D flower bouquet gathering animation and botanical fidelity have reached photorealistic elegance, the web application currently lacks a dedicated, romantic user interface. Visitors currently see an unadorned 3D canvas with an outdated title ("Cosmic Core Interface") and no intuitive controls. For a memorable Vietnamese Women's Day (20/10) gift experience, the application requires a luxurious glassmorphic UI overlay that greets the recipient with celebratory typography, allows them to control or replay the 4-phase assembly animation, opens an interactive handwritten letter modal, toggles romantic background melodies, and captures keepsake souvenir photos.

## What Changes

- **Romantic Glassmorphic Top Header**: Introduce a floating glassmorphic header badge featuring "20 · 10 Edition · Happy Vietnamese Women's Day" with high-fashion serif typography, gold accents, and a romantic BGM player button with animated equalizer wave bars.
- **Interactive 4-Phase Timeline Stepper**: Provide an intuitive timeline control bar at the bottom with play/pause, rewind/replay, and clickable step buttons corresponding to the 4 animation phases (1. Petal Orbit, 2. Golden Vortex Gathering, 3. Origami Bouquet Wrapping, 4. Completed Showcase).
- **Interactive 20/10 Greeting Letter Modal**: Add a romantic envelope modal triggered by a floating letter button (`💌`), opening an elegant greeting letter with customizable heartfelt messages for mothers, partners, and loved ones.
- **Keepsake Action Bar**: Provide quick action buttons to download a high-definition commemorative photo of the bouquet (`📸`), toggle automatic 360° cinematic orbital tour vs manual touch/pointer rotation (`🔄`), and adjust sparkle dust density.
- **Web Audio Background Melodies**: Implement a lightweight procedural Web Audio synthesizer / audio element for romantic music box / piano melody that plays smoothly with user interaction.

## Capabilities

### New Capabilities
- `gift-ui-overlay`: Glassmorphic UI overlay providing celebratory 20/10 typography, interactive 4-phase timeline playback controller, interactive greeting letter modal, background audio player, and commemorative screenshot export.

### Modified Capabilities
None.

## Impact

- **Affected Files**:
  - `index.html`: Update title, meta tags, and font imports (Playfair Display, Montserrat).
  - `src/style.css`: Add styles for glassmorphism, responsive UI positioning, animations, and modal overlays.
  - `src/ui/GiftUIOverlay.ts`: Implement the UI manager handling timeline synchronization, letter modal, music player, and screenshot export.
  - `src/core/SceneManager.ts`: Connect UI events with `SceneManager` timeline, camera mode, and canvas rendering.
- **Dependencies**: No external runtime heavy UI dependencies; clean, lightweight vanilla TypeScript and CSS.
