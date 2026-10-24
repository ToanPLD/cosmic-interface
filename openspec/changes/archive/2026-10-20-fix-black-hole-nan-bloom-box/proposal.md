# Proposal: Fix Black Hole NaN Bloom Box Artifact

## Why

In certain browser viewports, GPU architectures, and camera angles, a large opaque black square appears directly over the central black hole and accretion disk. This visual defect is the notorious Three.js "UnrealBloomPass NaN Box of Death", caused when shader calculations evaluate mathematical edge cases (such as `pow()` with negative bases or zero-length vector normalizations) that yield `NaN` or `Inf`. When `UnrealBloomPass` downsamples and blurs mips through its Gaussian blur pyramid, a single `NaN` pixel spreads across bloom tiles, and tone mapping (`OutputPass`) converts `NaN` to solid black pixels. Addressing this immediately restores cinematic visual fidelity across all target devices.

## What Changes

- **Shader Math Clamping**:
  - Clamp all bases passed into `pow(base, exp)` to non-negative ranges (`max(0.0, ...)` or `clamp(..., 0.0, 1.0)`) across `accretionDiskShader`, `gravitationalLensingShader`, `holographicCardShader`, and `cosmicPlumeShader`.
  - Guard vector normalizations (`camDir`, `vNormal`, `rayDir`) with minimum epsilon thresholds to prevent zero-length divisions.
  - Apply an upper-bound clamp on fragment output RGB channels (`clamp(finalColor.rgb, 0.0, 60.0)`) before writing to the render target, preventing runaway HDR values from contaminating downstream bloom passes.
- **Orientation & Camera Stability**:
  - Guard `HolographicCard` billboarding against gimbal lock when normal vectors approach $(0, \pm 1, 0)$ by dynamically adjusting the local `up` vector.

## Capabilities

### New Capabilities
- `cosmic-shaders`: Shader numerical safety, floating-point domain protection (clamping `pow()`, dot products, and vector normalizations), and finite HDR bounds to ensure clean, NaN-free post-processing integration.

### Modified Capabilities
*(None - first formal capability definition for this codebase)*

## Impact

- **Affected Shaders**:
  - `src/shaders/accretionDiskShader.ts`
  - `src/shaders/gravitationalLensingShader.ts`
  - `src/shaders/holographicCardShader.ts`
  - `src/shaders/cosmicPlumeShader.ts`
- **Affected Objects**:
  - `src/objects/HolographicCard.ts`
- **Visual & Performance Impact**: Zero visual degradation, zero measurable GPU overhead, eliminates rendering artifacts and black bloom bounding boxes.
