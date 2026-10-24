# Proposal

## Why

Currently, the animation timeline wraps around automatically every 16 seconds (`time % 16.0`), causing the completed bouquet to abruptly disappear and reset back to Phase 1 (empty center with dispersed orbiting petals). For recipients enjoying the 20/10 gift, once the bouquet is fully gathered, wrapped, and revealed, it should persist indefinitely in its completed display state—gently breathing with ambient sway, floating fairy sparkles, and camera rotation—without resetting unless the user explicitly chooses to replay it via the timeline controls.

## What Changes

- **Clamp Automatic Timeline Progression at Phase 4**: Update `SceneManager` so that automatic elapsed time clamps at the completed presentation state ($t = 12.0s$ to $16.0s$), maintaining full bouquet visibility, settled blossoms, and wrapping paper indefinitely.
- **Continuous Ambient Sway and Orbit**: Keep the ambient breathing sway (`sin(elapsedTime)`), particle drift, and 360° camera orbit continuously updating even when the assembly timeline is clamped at the final phase.
- **Maintain Explicit User Replay**: Allow the recipient to rewind to the beginning ($t = 0.0s$) or seek to earlier phases at any time using the timeline stepper buttons (`⏮`, Phase 1, Phase 2, Phase 3).
- **Synchronize UI Timeline Stepper**: Keep Phase 4 highlighted on the timeline stepper once reached without resetting the progress bar to 0%.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `floral-bouquet-system`: Modify `Complete Bouquet Presentation and Continuous Orbit` requirement so the system persists the completed bouquet state indefinitely without automatic loop reset to Phase 1.

## Impact

- **Affected Files**:
  - `src/core/SceneManager.ts`: Clamp automatic time progression so it does not wrap around to 0.0 unless manually triggered; pass continuous un-clamped time to camera, sparkles, and gentle breathing sway.
  - `src/objects/FlowerBouquet.ts`: Ensure `flowerDome`, `wrappingGroup`, and `ribbonGroup` remain at scale 1.0 indefinitely for all $t \ge 11.0s$.
  - `src/objects/PetalVortex.ts`: Keep flying petals hidden/settled once the bouquet is assembled ($t \ge 8.0s$) without reappearing.
  - `src/ui/GiftUIOverlay.ts`: Keep progress bar full and Phase 4 active when the timeline reaches the final presentation state.
