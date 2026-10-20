# Cinematic 3D Sci-Fi Cosmic Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic 3D sci-fi cosmic interface in Three.js and WebGL inspired by the reference image, featuring a glowing black hole core, luminous accretion ring, flowing blue plasma plume, multi-orbit floating holographic cards facing the camera, cosmic particles, and a seamless 12s orbital loop.

**Architecture:** Vanilla Vite + TypeScript + Three.js application with modular components (`SceneManager`, `BlackHole`, `AccretionDisk`, `CosmicPlume`, `OrbitalCarousel`, `CosmicEnvironment`, `PostProcessingManager`). Uses custom GLSL shaders for relativistic plasma flow and glass holographic cards, synchronized with mathematical harmonic frequencies for a seamless 12-second loop.

**Tech Stack:** Vite, TypeScript, Three.js, GLSL, postprocessing (`three/addons/postprocessing/...`).

**Spec:** `docs/superpowers/specs/2026-10-20-cosmic-interface-design.md`

## Global Constraints
- Pure visual cinematic scene: No text, no logos, no UI controls.
- Seamless 12.0s loop period ($T = 12.0$): all orbital rotation, camera orbit, and shader UV animations must repeat perfectly every 12 seconds.
- Dark blue and cyan cosmic atmosphere (`#00f0ff`, `#3b82f6`, `#020617`) with dramatic contrast and HDR bloom.
- Real-time 60fps performance on modern desktop WebGL.

## Review Focus
- Seam discontinuity at $t = 12.0s$: Verify camera angle and card rotation have identical start and end values.
- Card camera-facing alignment: Cards must smoothly face the camera in foreground and align with orbit in background.
- Accretion disk tilt and doppler beaming: Approaching side must be brighter with white-cyan core.
- Inflow plasma stream curvature: Stream must swirl from outer space into the central singularity as in the reference image.
- Window resizing: Three.js camera aspect and composer passes must adapt without distortion or visual glitch.

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/style.css`

**Interfaces:**
- Produces: Working Vite dev server and HTML canvas mounting point for Three.js.

- [ ] **Step 1: Write `package.json` with Three.js and Vite dependencies**
- [ ] **Step 2: Configure `tsconfig.json` and `vite.config.ts`**
- [ ] **Step 3: Create fullscreen minimal canvas HTML in `index.html` and reset styling in `src/style.css`**
- [ ] **Step 4: Run `npm install` and verify Vite build passes**
- [ ] **Step 5: Commit scaffolding**

---

### Task 2: Core SceneManager & Seamless 12s Cinematic Camera Loop

**Files:**
- Create: `src/core/SceneManager.ts`
- Create: `src/core/CameraController.ts`
- Modify: `src/main.ts`

**Interfaces:**
- Produces: `SceneManager` class managing `THREE.Scene`, `THREE.WebGLRenderer`, animation loop, and resize events.
- Produces: `CameraController` computing 360-degree orbital motion with exact mathematical $T = 12.0s$ seamless loop:
  $$x = D \cos(2\pi t / 12), \quad z = D \sin(2\pi t / 12), \quad y = Y_0 + H \sin(4\pi t / 12)$$

- [ ] **Step 1: Implement `CameraController` with 12s harmonic trajectory and `lookAt(0, 0, 0)`**
- [ ] **Step 2: Implement `SceneManager` with WebGLRenderer (antialias, HDR tone mapping, pixelRatio capped at 2)**
- [ ] **Step 3: Connect render loop in `main.ts` and test browser launch**
- [ ] **Step 4: Commit core scene architecture**

---

### Task 3: Black Hole Singularity & Gravitational Lensing Refraction Shell

**Files:**
- Create: `src/shaders/gravitationalLensingShader.ts`
- Create: `src/objects/BlackHole.ts`
- Modify: `src/core/SceneManager.ts`

**Interfaces:**
- Produces: `BlackHole` component with:
  - Event horizon: radius 1.6, pitch black `#000000`.
  - Photon sphere & gravitational lensing distortion shell: radius 2.4 with inverted Fresnel edge glow and background light bending.

- [ ] **Step 1: Write `gravitationalLensingShader.ts` (vertex & fragment shaders with rim glow and refraction)**
- [ ] **Step 2: Implement `BlackHole.ts` assembly class**
- [ ] **Step 3: Add `BlackHole` to `SceneManager` and verify centered position at `(0, 0, 0)`**
- [ ] **Step 4: Commit black hole component**

---

### Task 4: Accretion Disk Shader & Swirling Cosmic Inflow Plume

**Files:**
- Create: `src/shaders/accretionDiskShader.ts`
- Create: `src/shaders/cosmicPlumeShader.ts`
- Create: `src/objects/AccretionDisk.ts`
- Create: `src/objects/CosmicPlume.ts`
- Modify: `src/core/SceneManager.ts`

**Interfaces:**
- Produces: `AccretionDisk` with tilted geometry, Keplerian angular shear $\omega(r) \propto r^{-1.5}$, white-cyan-blue HDR emission gradient, and relativistic Doppler beaming.
- Produces: `CosmicPlume` curving 3D spline ribbon funneling blue plasma from outer nebula into the core.

- [ ] **Step 1: Implement `accretionDiskShader.ts` with polar coords, simplex noise, and Doppler brightness asymmetry**
- [ ] **Step 2: Create `AccretionDisk.ts` mesh with $30^\circ$ pitch and $-15^\circ$ roll**
- [ ] **Step 3: Implement `cosmicPlumeShader.ts` and `CosmicPlume.ts` with 3D Catmull-Rom spline curve**
- [ ] **Step 4: Verify accretion disk and plume animation in scene**
- [ ] **Step 5: Commit accretion disk & plume**

---

### Task 5: Multi-Tiered Orbital Rings & Holographic Cards with Camera-Facing Alignment

**Files:**
- Create: `src/shaders/holographicCardShader.ts`
- Create: `src/objects/HolographicCard.ts`
- Create: `src/objects/OrbitalCarousel.ts`
- Modify: `src/core/SceneManager.ts`

**Interfaces:**
- Produces: `OrbitalCarousel` controlling 3 concentric orbital rings ($R \in [7.5, 10.0, 12.5]$) and 12 holographic cards.
- Each card dynamically slerps its normal to face the camera when passing the front hemisphere, and returns to orbital tangent in the rear.
- All orbits have harmonic velocities $\omega = k \cdot \frac{2\pi}{12}$ so positions loop seamlessly every 12 seconds.

- [ ] **Step 1: Implement `holographicCardShader.ts` (frosted glass, glowing cyan border brackets, procedural cosmic galaxy/nebula imagery)**
- [ ] **Step 2: Implement `HolographicCard.ts` with procedural generative textures and orientation slerp**
- [ ] **Step 3: Implement `OrbitalCarousel.ts` with glowing orbital track rings and 12-second synchronized rotation**
- [ ] **Step 4: Verify card motion and smooth parallax depth**
- [ ] **Step 5: Commit orbital carousel**

---

### Task 6: Cosmic Environment (Multi-Layer Starfield, Procedural Nebula & Inflow Dust)

**Files:**
- Create: `src/objects/CosmicEnvironment.ts`
- Modify: `src/core/SceneManager.ts`

**Interfaces:**
- Produces: `CosmicEnvironment` with:
  - 12,000 dual-layer stars (distant faint stars + sparkling foreground stars).
  - Volumetric glowing blue-cyan nebula planes in the deep background.
  - 2,500 cosmic dust particles spiraling inward toward the singularity along logarithmic streamlines.

- [ ] **Step 1: Implement starfield buffer geometry with size and color variance**
- [ ] **Step 2: Implement procedural blue/cyan nebula background planes with turbulent noise**
- [ ] **Step 3: Implement spiraling inward cosmic dust particle system with cyclic rebirth**
- [ ] **Step 4: Commit cosmic environment**

---

### Task 7: Postprocessing Pipeline & Final Verification

**Files:**
- Create: `src/core/PostProcessing.ts`
- Modify: `src/core/SceneManager.ts`

**Interfaces:**
- Produces: Postprocessing pipeline with `EffectComposer`, `RenderPass`, `UnrealBloomPass` (tuned for high-contrast neon/accretion glow), and custom vignette / chromatic aberration pass.

- [ ] **Step 1: Setup `EffectComposer`, `RenderPass`, and `UnrealBloomPass`**
- [ ] **Step 2: Add subtle chromatic aberration and film grain for cinematic sci-fi texture**
- [ ] **Step 3: Build production bundle with `npm run build` and test preview**
- [ ] **Step 4: Verify 12-second seamless looping and visual parity with the reference image**
- [ ] **Step 5: Commit complete application**
