# Cinematic 3D Sci-Fi Cosmic Interface

A real-time, browser-rendered 3D cinematic sci-fi cosmic interface built with Three.js, WebGL, custom GLSL shaders, and postprocessing, directly inspired by relativistic astrophysics and the reference cosmic singularity artwork.

## 🚀 Key Features

1. **Central Cosmic Singularity & Accretion Ring**:
   - **Event Horizon**: Pure light-absorbing core at `(0, 0, 0)`.
   - **Gravitational Lensing Shell**: Einstein ring distortion shell bending space with inverted Fresnel luminescence.
   - **Tilted Accretion Disk**: High-resolution ring geometry tilted at $68^\circ$ pitch and $18^\circ$ roll matching the reference image.
   - **Relativistic Doppler Beaming**: Asymmetrical brightness boosting on the approaching side.
   - **Keplerian Shear Flow**: Angular velocity differential $\omega(r) \propto r^{-1.25}$ creating realistic swirling plasma vortices.

2. **Cosmic Inflow Plasma Plume**:
   - 3D Catmull-Rom spline tube funnelling glowing cyan-blue plasma from deep space into the singularity core.
   - Flowing procedural simplex turbulence and hot luminous core filaments.

3. **Multi-Tiered Orbital Carousel**:
   - 3 concentric 3D orbital tracks ($R = 8.5, 11.5, 14.5$) with faint glowing neon trajectory rings.
   - 14 floating holographic rectangular cards with procedural deep space artworks (spiral galaxies, celestial clusters, quantum wavefronts, gravitational arcs).
   - **Dynamic Camera-Facing Alignment**: Cards smoothly slerp to face directly toward the camera when traveling through the foreground, and turn tangentially when traveling behind the core.

4. **Cosmic Atmosphere & Gravitational Inflow**:
   - 10,000 distant background micro-stars + 800 twinkling foreground stars.
   - Swirling deep blue/cyan nebula clouds.
   - 2,400 inward-spiraling cosmic dust particles accelerating along logarithmic streamlines into the event horizon.

5. **Cinematic 12-Second Seamless Loop**:
   - Mathematical harmonic orbital speeds ($k \cdot \frac{2\pi}{12.0}$) and synchronized 360-degree camera path ensure zero frame stutter or jump at $t = 12.0s$.
   - Tested and verified mathematically (delta between $t=0$s and $t=12$s is $< 10^{-8}$).

6. **Cinematic Post-Processing ("ui-ux-promax")**:
   - UnrealBloomPass tuned for high-contrast dark space with radiant glowing core and cards.
   - Custom composite pass with radial chromatic aberration, film dither, and vignette.
   - Zero UI text, buttons, or logos for pure fullscreen immersion.

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```
