# cosmic-shaders Specification

## Purpose
Defines mathematical safety, floating-point domain boundaries, and finite HDR output guarantees for all procedural cosmic GLSL shaders and orbiting entities, preventing NaN/Inf propagation into post-processing passes.

## Requirements

### Requirement: Safe Exponential Power Calculations
All procedural GLSL fragment shaders SHALL guard bases for power functions against negative or non-finite values before evaluation.

#### Scenario: Accretion disk plasma noise evaluation
- **WHEN** procedural plasma noise or radial falloff calculations yield negative values or float underflow
- **THEN** the shader clamps the base to `[0.0, 1.0]` prior to `pow()`, evaluating to a finite float without generating `NaN`

#### Scenario: Holographic card fresnel falloff
- **WHEN** surface view angles produce `1.0 - NdotV` values outside the valid non-negative domain
- **THEN** the shader clamps `1.0 - NdotV` between `0.0` and `1.0` before passing to `pow()`, producing continuous finite rim highlights

### Requirement: Safe Normalization and Vector Math
All cosmic shaders evaluating view angles, surface normals, or ray directions SHALL guard against zero-length normalizations and out-of-range dot products.

#### Scenario: Gravitational lensing ray direction normalization
- **WHEN** view or light vectors approach zero magnitude during perspective transformations
- **THEN** the shader uses safe vector normalization with an epsilon threshold `max(length(v), 0.00001)`, avoiding division by zero

### Requirement: Bounded High Dynamic Range Output
Fragment shaders writing to the primary scene render buffer SHALL clamp final color values to prevent infinite or extreme runaway intensities from entering bloom pyramids.

#### Scenario: High energy emissive downsampling in bloom pass
- **WHEN** additive plasma layers and central singularity lighting converge at peak intensity
- **THEN** fragment output RGB is bounded within `[0.0, 60.0]`, preventing `UnrealBloomPass` downsampling pyramids from generating black tile artifacts

### Requirement: Gimbal-Safe Card Orientation
Orbiting 3D holographic card entities SHALL dynamically adjust their upward reference vector when approaching collinear alignment with the world Y-axis.

#### Scenario: Card orbiting through zenith or nadir
- **WHEN** an orbiting card's surface normal approaches vertical alignment where `abs(normal.y) > 0.99`
- **THEN** the card entity shifts its reference up vector to `(0, 0, 1)` prior to computing orientation, preventing matrix inversion singularity and transform NaN
