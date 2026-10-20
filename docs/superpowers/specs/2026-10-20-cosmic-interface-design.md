# Cinematic 3D Sci-Fi Cosmic Interface Design Specification

## 1. Overview & Vision
A real-time, browser-rendered 3D cinematic sci-fi cosmic interface built with Three.js, WebGL, custom GLSL shaders, and postprocessing. The visual center is a miniature black hole singularity with an intense glowing accretion ring and a curving blue plasma stream inspired by the reference image. Multiple floating holographic rectangular image panels travel smoothly along circular 3D orbits around the core, dynamically turning toward the camera as they pass the foreground, and turning away in the background. The entire scene loops seamlessly over a 12-second cycle, rendered with dark blue and cyan volumetric aesthetics, particle effects, and cinematic bloom.

## 2. Technical Stack
- **Bundler & Dev Server**: Vite (vanilla TypeScript / JavaScript for lightning-fast HMR and 60fps WebGL rendering)
- **3D Graphics Engine**: Three.js (`three` + `three/addons/...`)
- **Shaders**: Custom GLSL Vertex and Fragment shaders for:
  - Black hole accretion disk with Keplerian differential rotation and Doppler beaming
  - Gravitational lensing refraction sphere
  - Cosmic blue plasma plume / inflow stream
  - Holographic glass cards with neon border glow and scanlines
  - Cosmic dust particles & accretion vortex
- **Postprocessing**:
  - `EffectComposer`
  - `RenderPass`
  - `UnrealBloomPass` (high threshold, large radius, HDR glow for the singularity and cards)
  - `ShaderPass` for chromatic aberration, film grain, and cinematic vignette
  - `ACESFilmicToneMapping`

## 3. Scene Architecture & Components

### 3.1. Central Cosmic Core (Black Hole & Singularity)
1. **Event Horizon**: A sphere of radius $R = 1.6$ units at `(0, 0, 0)` with a pure unlit black shader (`vec4(0.0, 0.0, 0.0, 1.0)`).
2. **Gravitational Lensing Shell**: A sphere of radius $R = 2.4$ units with an inverted fresnel and normal-distortion shader that refracts the background starfield and nebula, creating the relativistic Einstein ring effect.
3. **Accretion Disk**:
   - Tilted ring geometry ($R_{\text{inner}} = 1.8$, $R_{\text{outer}} = 5.2$, tilt $\approx 30^\circ$).
   - Custom GLSL Fragment Shader:
     - Polar coordinate transformation $(r, \theta)$.
     - Keplerian fluid angular velocity: $\theta_{\text{flow}} = \theta - \frac{t \cdot 2.5}{r^{1.5}}$.
     - Layered 2D Simplex noise producing plasma streaks and filament voids.
     - Relativistic Doppler boosting: Brightness amplified on the approaching side $(\cos(\theta - \theta_{\text{view}}) \cdot 0.5 + 0.5)$.
     - Color gradient: Inner white rim (`#ffffff`), electric cyan (`#00f2ff`), cobalt blue (`#2563eb`), falling off to transparent deep space.
4. **Cosmic Inflow Plume (Gas Stream)**:
   - 3D Catmull-Rom curve ribbon reaching from the upper-left cosmic nebula and coiling inward into the black hole core (exact match to the reference image).
   - Animated procedural emissive noise flowing toward the center.

### 3.2. Orbital Carousel & Holographic Image Panels
1. **Orbital Paths**:
   - 3 Concentric circular orbital rings at radii $R_1 = 7.5$, $R_2 = 10.0$, $R_3 = 12.5$ with varying orbital inclinations ($\pm 10^\circ, \pm 18^\circ$).
   - Rendered as subtle, glowing circular sci-fi rings with dotted neon dashes and energy pulses.
2. **Rectangular Cards / Panels**:
   - Aspect ratio $16:9$ or $3:4$ (e.g. $2.4 \times 1.4$ units).
   - 12 panels distributed across the orbits (4 on inner orbit, 4 on middle orbit, 4 on outer orbit).
   - Card Shader & Materials:
     - Holographic double-sided frosted glass shader with fresnel rim lighting.
     - Procedural cosmic/sci-fi generative imagery baked on front face (deep space galaxies, planetary nebulae, star clusters).
     - Glowing cyan accent borders with pulsing corner brackets.
3. **Dynamic Panel Orientation & Parallax**:
   - Each card's position on orbit $i$ at time $t$ is calculated via:
     $$\theta_i(t) = \theta_{0, i} + \omega_i \cdot t$$
     $$x = R_i \cos(\theta_i(t)), \quad z = R_i \sin(\theta_i(t)), \quad y = y_0 + A \sin(\theta_i(t) + \phi)$$
   - **Camera-Facing Rotation**: As a card moves toward the front (closest to camera), its normal smoothly lerps (`slerp`) toward the camera vector. As it travels behind the core, it rotates back to follow the orbital tangent, creating clear foreground focus and depth.

### 3.3. Cosmic Environment & Particle Systems
1. **Deep Space Starfield**:
   - Dual-layer star particles:
     - 10,000 background micro-stars with static soft twinkling.
     - 1,500 foreground bright stars with dynamic diffraction spikes and chromatic tinting.
2. **Procedural Nebula Clouds**:
   - Multi-layered glowing volumetric cloud planes positioned in the background and around the plasma plume with turbulent FBM (Fractional Brownian Motion) cyan and indigo color blending.
3. **Cosmic Dust & Inward Vortex**:
   - 2,500 particles spiraling inward along logarithmic spirals toward the singularity event horizon, creating the sensation of gravitational accretion.

### 3.4. Cinematic Camera & Seamless 12s Loop
1. **Loop Period**: $T = 12.0$ seconds.
   - All angular velocities $\omega$ are synchronized to harmonic integers of $\frac{2\pi}{T}$:
     $$\omega_{\text{orbit}} = k \cdot \frac{2\pi}{12} \quad (k \in \{1, 2\})$$
   - Accretion disk noise coordinates and particle lifetime cycles are strictly modulo-12s, guaranteeing zero visual jump or stutter at loop seams.
2. **Camera Path**:
   - Smooth 360-degree orbit around the central core:
     $$x_{\text{cam}} = D \cos\left(\frac{2\pi t}{T}\right), \quad z_{\text{cam}} = D \sin\left(\frac{2\pi t}{T}\right), \quad y_{\text{cam}} = Y_0 + H \sin\left(\frac{4\pi t}{T}\right)$$
   - Always oriented with `lookAt(0, 0, 0)`.
   - Subtle interactive mouse parallax offset added smoothly without breaking loop continuity.

## 4. UI/UX & Visual Polish ("ui-ux-promax")
- Zero HTML UI controls, text, or logos — 100% immersive fullscreen cinematic rendering.
- High dynamic range lighting with bloom threshold tuned to make only the accretion core, plasma streamer, and card borders radiate intense light.
- Subtle chromatic aberration and cinematic vignette around the edges of the screen for an anamorphic sci-fi lens feel.
- High performance 60fps on modern desktop browsers with adaptive pixel ratio (capped at 2.0).

## 5. File Structure
```
d:/Sources/Code/gift/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── core/
│   │   ├── SceneManager.ts
│   │   ├── CameraController.ts
│   │   └── PostProcessing.ts
│   ├── objects/
│   │   ├── BlackHole.ts
│   │   ├── AccretionDisk.ts
│   │   ├── CosmicPlume.ts
│   │   ├── OrbitalRing.ts
│   │   ├── HolographicCard.ts
│   │   └── CosmicParticles.ts
│   └── shaders/
│       ├── accretionDiskShader.ts
│       ├── gravitationalLensingShader.ts
│       ├── holographicCardShader.ts
│       └── cosmicPlumeShader.ts
```

## 6. Verification & Testing
- Visual comparison with user's reference image (plasma plume flowing into bright black hole ring, deep space aesthetic).
- Verification of 12-second seamless loop without discontinuity.
- Real-time 60fps framerate validation.
- Responsive handling of window resize and aspect ratio changes.
