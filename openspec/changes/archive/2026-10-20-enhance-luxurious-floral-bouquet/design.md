# Design

## Context

See `proposal.md` for motivation. Currently, `flowerGeometry.ts` uses low-resolution displaced plane geometries with flat single hex colors. `FlowerBouquet.ts` arranges 20 loosely scattered petals with noticeable gaps, and wrapping paper is constructed from disjoint planar cone segments resulting in visible polygonal seams. This design specifies the botanical anatomy, procedural shaders/textures, and parametric geometry needed to achieve a luxurious 20/10 gift bouquet.

## Goals / Non-Goals

**Goals:**
- Provide procedural HTML5 Canvas texture generation with radiating micro-veins and 4-stop radial gradient coloring (`#fef3c7` base -> `#fce7f3` blush -> `#f472b6` rose body -> `#e11d48` rim).
- Construct high-detail petal geometries (32x32 vertex grid) with compound Gaussian curvature (spoon-like dish depth + reflexed curling margins).
- Architecture English Garden / Peony roses with 32 interlocking concentric petals across 4 tight whorls (Core 6, Inner Cup 8, Mid Whorl 10, Base Reflexed 8), completely eliminating gaps.
- Create a continuous parametric pleated origami wrapping paper mesh with sinusoidal folds, accompanied by an inner white crinkled silk ruffle collar and draped burgundy satin ribbon.
- Unify flying petals in `PetalVortex.ts` with the new high-detail petal geometry and texture for seamless docking.

**Non-Goals:**
- Heavy physics-based cloth simulation for wrapping paper (parametric analytical geometry provides superior performance and deterministic animation).
- Loading external multi-megabyte 3D model files (.glb/.gltf); all botanical elements remain procedural, lightweight, and instantaneous to load.

## Decisions

### 1. Procedural CanvasTexture vs External Image Assets
- **Choice**: Generate a procedural 1024x1024 HTML5 Canvas texture at runtime for rose petals.
- **Rationale**: Generates instantly in memory (<5ms), zero network latency or 404 file risk, provides crisp micro-veins, smooth radial color transitions, and alpha fringe translucency with zero bundle weight.
- **Alternatives considered**: Bundled PNG assets (increases repository size and requires asset loader error handling).

### 2. Compound Gaussian Curvature Petal Geometry
- **Choice**: Generate a 32x32 parametric `BufferGeometry` where vertex height $z(u, v)$ combines concave spoon dishing $z_{\text{dish}} = -0.32 \cdot (1 - u^2) \cdot \sin(\pi v)$ and outward edge reflex $z_{\text{reflex}} = 0.18 \cdot u^2 \cdot v^2$.
- **Rationale**: Real rose petals are not flat or uniformly bent; they cup inward toward the center and curl gracefully outward at their edges, catching specular highlights and subsurface scattering.
- **Alternatives considered**: Flat quad with normal maps (lacks geometric silhouette depth when viewed from edge-on angles).

### 3. Dense 4-Whorl English Garden Rose Architecture
- **Choice**: Assemble roses using 32 petals arranged in 4 concentric botanical layers:
  - Core Whorl (6 petals, $r=0.08, \text{tilt}=15^\circ$, tightly curled scroll center)
  - Inner Cup Whorl (8 petals, $r=0.18, \text{tilt}=32^\circ$, upright protective chalice)
  - Mid Whorl (10 petals, $r=0.32, \text{tilt}=55^\circ$, full bloom body)
  - Outer Base Whorl (8 petals, $r=0.48, \text{tilt}=78^\circ$, reflexed downward skirt)
- **Rationale**: Matches David Austin luxury garden roses; the overlapping petals fully conceal the central calyx/stem and produce rich visual density.

### 4. Continuous Lofted Pleated Origami Wrapping Paper
- **Choice**: Generate a single continuous lofted mesh wrapping around the stems defined by harmonic radial perturbation:
  $$R(\theta, y) = (R_{\text{base}} + (R_{\text{top}} - R_{\text{base}}) \cdot y) \cdot [1.0 + 0.22\cos(6\theta) + 0.12\sin(3\theta)]$$
  Lined with an inner white silk ruffle collar ($R_{\text{ruffle}}$ with higher frequency crinkles: $12\theta$).
- **Rationale**: Eliminates disjoint planar seams and polygonal cracks, producing clean, flowing luxury origami wrapping worthy of a 20/10 gift presentation.
- **Alternatives considered**: Multi-mesh overlapping paper sheets (prone to z-fighting and visible gaps).

## Risks / Trade-offs

- **[Risk] High draw call / triangle count from 32-petal roses**:
  - *Mitigation*: Share geometry buffers across petals with matrix transforms; total bouquet vertex count remains under 50k, easily rendering at a locked 60fps on web browsers and mobile devices.
- **[Risk] Texture seam or stretching on curved petals**:
  - *Mitigation*: UV coordinates mapped normalized along the petal's longitudinal vein axis (u from center to rim, v from base to apex), ensuring veins follow natural botanical growth lines.
