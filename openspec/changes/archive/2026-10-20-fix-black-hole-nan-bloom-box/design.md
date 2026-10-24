# Design: Robust Numerical Safety & Post-Processing Stabilization

## Context

Under certain camera orbital angles and GPU float-interpolation behaviors, GLSL fragment shaders produce non-finite values (`NaN` or $\pm\infty$). When `UnrealBloomPass` downsamples these pixels through its 5-level Gaussian blur pyramid, a single `NaN` value infects an entire mip tile ($512 \times 512$ or $256 \times 256$), which `OutputPass` (ACES Filmic Tone Mapping) outputs as a solid black square over the black hole core (see proposal.md - Why).

## Goals / Non-Goals

**Goals:**
- Eliminate all potential sources of `NaN` and `Inf` across all procedural GLSL fragment shaders.
- Ensure all power functions (`pow`) receive strictly non-negative bases within their defined mathematical domains.
- Protect vector normalization from division-by-zero singularities.
- Establish an upper HDR luminance bound before fragment buffers are passed into `UnrealBloomPass`.
- Prevent gimbal lock singularity in card orientation during high-inclination orbits.

**Non-Goals:**
- Altering the visual color grading, nebula backdrop, or timing of the 12-second orbital loop.
- Removing `UnrealBloomPass` or disabling post-processing.
- Replacing Simplex noise algorithms with pre-baked textures.

## Decisions

### 1. Pre-`pow()` Input Clamping in Fragment Shaders
- **Decision**: Guard every `pow(base, exp)` call with explicit clamping (`clamp(base, 0.0, 1.0)` or `max(0.0, base)`).
- **Rationale**: In WebGL / GLSL ES specifications, `pow(x, y)` where $x < 0.0$ is undefined and produces `NaN`. In shaders such as `accretionDiskShader` and `cosmicPlumeShader`, procedural simplex noise and interpolated UV coordinates can produce tiny negative values due to floating-point rounding or edge transitions.
- **Alternative Considered**: Using `abs(base)` instead of clamping. Rejected because reflecting negative noise values creates unnatural bright creases along zero crossings.

### 2. Safe Vector Normalization
- **Decision**: Implement safe normalization checks or epsilon floor guards `max(length(v), 0.00001)` for all dynamic direction vectors (`camDir`, `vViewPosition`, `vNormal`).
- **Rationale**: If the camera position approaches an object vertex or a tangent vector experiences precision loss, `normalize(v)` performs `v / 0.0`, resulting in `vec3(NaN)`.
- **Alternative Considered**: Relying on Three.js built-in normal interpolation. Rejected because custom vertex and fragment shaders compute tangent space and camera vectors manually.

### 3. High Dynamic Range Ceiling on Fragment Outputs
- **Decision**: Clamp the final RGB outputs of emissive fragment shaders to `[0.0, 60.0]`.
- **Rationale**: While HDR bloom requires values $> 1.0$ (typical peak intensity is ~15.0–25.0), unconstrained additive blending or math singularities can escalate toward infinity. A conservative upper bound of 60.0 preserves full bloom glow while guaranteeing finite float values in the render target.
- **Alternative Considered**: Tone mapping inside each fragment shader. Rejected because global bloom must operate on linear HDR colors before the master `OutputPass`.

### 4. Adaptive Up-Vector in Card Billboarding
- **Decision**: In `HolographicCard.update()`, detect when `targetNormal` approaches vertical collinearity (`abs(targetNormal.y) > 0.98`) and temporarily set `this.up` to `(0, 0, 1)` instead of `(0, 1, 0)`. In addition, eliminate per-frame allocations by using persistent scratch `Vector3` instances.
- **Rationale**: Standard `Object3D.lookAt()` calculates `normal.cross(up)`. When vectors are collinear, the cross product is zero, resulting in degenerate matrices and `NaN` quaternion transforms.

## Risks / Trade-offs

- **[Risk] Clamping luminance at 60.0 might clip desired bloom highlights**:
  - *Mitigation*: The maximum designed core brightness is 3.5 multiplied by density (~1.0) and Doppler boost (~1.45), totaling under 15.0. A limit of 60.0 provides a $4\times$ headroom margin, preventing clipping while ensuring stability.
- **[Risk] Precision penalty of extra `clamp` operations**:
  - *Mitigation*: Modern GPUs execute `clamp` and `max` as single-cycle ALU instructions (`min`/`max` opcodes), introducing zero measurable performance overhead.
