# Tasks

## 1. Shader Arithmetic Clamping & NaN Prevention

- [x] 1.1 Harden `accretionDiskShader.ts` with safe vector normalization, clamped `plasmaNoise` and `1.0 - rNorm` bases before all `pow()` calls, and bounded output luminance (`[0.0, 60.0]`). Verify via `npm run build`.
- [x] 1.2 Harden `gravitationalLensingShader.ts` with guarded normal/viewDir normalization, clamped `1.0 - NdotV` and `fresnel` inputs for all `pow()` calls, and bounded output luminance (`[0.0, 60.0]`). Verify via `npm run build`.
- [x] 1.3 Harden `holographicCardShader.ts` with guarded vector normalizations, clamped `1.0 - NdotV` before `pow()`, and bounded output luminance (`[0.0, 60.0]`). Verify via `npm run build`.
- [x] 1.4 Harden `cosmicPlumeShader.ts` with clamped `radialEdge` and `vUv.x` inputs before `pow()`, and bounded output luminance (`[0.0, 60.0]`). Verify via `npm run build`.

## 2. Entity & Orientation Stabilization

- [x] 2.1 Update `HolographicCard.ts` billboarding logic to dynamically adapt its reference up vector when approaching vertical collinearity (`abs(targetNormal.y) > 0.98`) and eliminate per-frame `Vector3` heap allocations using persistent scratch vectors. Verify via `npm run build`.

## 3. Integration & Visual Verification

- [x] 3.1 Run TypeScript type check and bundle compilation via `npm run build`, verifying zero errors or warnings.
- [x] 3.2 Verify rendering across full 360-degree camera orbital trajectory (0s to 12s), confirming complete elimination of the black box artifact and proper bloom preservation around the black hole singularity.
