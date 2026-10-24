# Design: Floral Bouquet Gathering & Blooming 3D Animation

## Context

The system is transitioning from a sci-fi cosmic core to an interactive 3D romantic floral gift (see proposal.md - Why). The existing Three.js rendering pipeline, camera controller, and post-processing framework are repurposed to render an organic, multi-phase botanical assembly where orbiting petals spiral into a complete bouquet.

## Goals / Non-Goals

**Goals:**
- Implement procedural 3D geometries for all bouquet elements: curved rose petals, ruffled carnations, blue florets, eucalyptus leaves, blush wrapping paper cones, and burgundy ribbon with bow.
- Create a deterministic, 4-phase kinematic timeline controlling the flight and assembly of elements.
- Implement soft velvety PBR materials with subtle translucency, warm lighting, and fairy sparkle particles.
- Provide continuous 360-degree orbital camera rotation with user touch/mouse interactivity.
- Maintain steady 60 FPS across desktop and mobile browsers with zero external model download dependencies.

**Non-Goals:**
- Heavy physics/cloth simulation engines (Ammo.js/Cannon.js) — procedural easing and spline mathematics are used for consistent, guaranteed artistic results.
- External glTF/OBJ file dependencies — all botanical models are generated procedurally in code for instantaneous loading and zero broken asset links.

## Decisions

### 1. Procedural Flower & Leaf Geometries
- **Decision**: Construct botanical elements using procedurally curved `BufferGeometry`, `ShapeGeometry`, and `ExtrudeGeometry`.
- **Rationale**: Procedural creation gives precise parametric control over curvature, petal thickness, and vertex positions without asset download overhead or external HTTP requests.
- **Alternative Considered**: Loading pre-made glTF 3D models. Rejected due to file size, network latency, and rigid non-parametric rigging.

### 2. Dual-State Kinematic Interpolation for Petals
- **Decision**: Each individual petal tracks an **Orbital State** $(r_0, \theta_0, \mathbf{M}_{\text{orbit}}, \omega)$ and a **Bouquet Target State** $(\mathbf{p}_{\text{target}}, \mathbf{q}_{\text{target}}, \mathbf{s}_{\text{target}})$.
- **Rationale**: An easing function $s(t) = \text{smoothstep}(t_{\text{start}}, t_{\text{end}}, t)$ seamlessly blends the petal's orbital flight into a logarithmic spiral that docks accurately into the final blossom matrix.
- **Alternative Considered**: Pure physics particle attraction. Rejected because particles cluster chaotically rather than forming an organized, photorealistic rose bud.

### 3. Staggered Assembly Choreography
- **Decision**: Cascade the arrival of elements in natural botanical layers:
  1. $0.0s - 4.0s$: Dispersed orbit dance; center is completely empty.
  2. $4.0s - 5.5s$: Core rose spiral petals dock and assemble the central blossom buds.
  3. $5.5s - 7.0s$: Outer rose petals and ruffled pink carnations gather around the core.
  4. $7.0s - 8.0s$: Blue delphinium florets and eucalyptus greenery arrange into perimeter foliage.
  5. $8.0s - 9.5s$: Layered blush wrapping paper sweeps in from below and envelops the bouquet stems.
  6. $9.5s - 11.0s$: Burgundy ribbon coils and ties into a bow; "LUCKY TO HAVE YOU" greeting card flips up.
  7. $11.0s+$: Assembled bouquet gently sways in place; camera resumes continuous slow orbital sweep.

### 4. Romantic Lighting & Fairy Sparkle Atmosphere
- **Decision**: Implement a 3-point lighting setup: warm rose key light $(0xffeedd)$, soft lavender-cyan fill $(0xdbeafe)$, and back rim light $(0xffd1dc)$, accompanied by upward-drifting sparkling dust particles.
- **Rationale**: Emulates high-end studio floral photography, highlighting petal velvety specular highlights and translucent edges without harsh shadows.

## Risks / Trade-offs

- **[Risk] High mesh count could cause mobile performance drop**:
  - *Mitigation*: Limit total active moving petal meshes to ~120 well-distributed elements. Once docked into the bouquet, their transformations are frozen, keeping CPU draw calls minimal.
- **[Risk] Petals intersecting abruptly during assembly**:
  - *Mitigation*: Stagger radial decay timings based on each petal's target radial depth (inner petals gather before outer petals).
