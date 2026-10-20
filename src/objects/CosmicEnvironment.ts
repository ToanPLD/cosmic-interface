import * as THREE from 'three';

export class CosmicEnvironment extends THREE.Group {
  public distantStars: THREE.Points;
  public brightStars: THREE.Points;
  public dustParticles: THREE.Points;
  public nebulaMesh: THREE.Mesh;

  private dustCount: number = 2400;
  private dustInitialRadii: Float32Array;
  private dustInitialThetas: Float32Array;
  private dustTimeOffsets: Float32Array;
  private dustBaseZ: Float32Array;
  private dustSpeedMultipliers: Float32Array;
  private dustPositions: Float32Array;
  private dustColors: Float32Array;
  private dustGeometry: THREE.BufferGeometry;

  constructor() {
    super();

    // 1. Distant Micro Starfield (10,000 stars)
    const starCount = 10000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const cWhite = new THREE.Color(0xffffff);
    const cCyan = new THREE.Color(0x7dd3fc);
    const cBlue = new THREE.Color(0x38bdf8);
    const cDeep = new THREE.Color(0x1d4ed8);

    for (let i = 0; i < starCount; i++) {
      // Sphere distribution around center
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const tintRoll = Math.random();
      const col = tintRoll < 0.6 ? cWhite : tintRoll < 0.85 ? cCyan : tintRoll < 0.95 ? cBlue : cDeep;
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    this.distantStars = new THREE.Points(starGeo, starMat);
    this.add(this.distantStars);

    // 2. Bright Foreground / Midground Stars with Lens Twinkle
    const brightCount = 800;
    const brightGeo = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(brightCount * 3);
    const brightColors = new Float32Array(brightCount * 3);

    for (let i = 0; i < brightCount; i++) {
      const radius = 40 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      brightPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      brightPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      brightPositions[i * 3 + 2] = radius * Math.cos(phi);

      brightColors[i * 3] = 0.8 + Math.random() * 0.2;
      brightColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
      brightColors[i * 3 + 2] = 1.0;
    }

    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

    const brightMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    this.brightStars = new THREE.Points(brightGeo, brightMat);
    this.add(this.brightStars);

    // 3. Distant Volumetric Nebula Background Plane
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 1024;
    nebulaCanvas.height = 1024;
    const nCtx = nebulaCanvas.getContext('2d')!;

    // Soft swirling deep nebula gradient matching reference image
    const gNeb = nCtx.createRadialGradient(380, 420, 40, 512, 512, 600);
    gNeb.addColorStop(0, 'rgba(0, 220, 255, 0.45)');
    gNeb.addColorStop(0.35, 'rgba(30, 64, 175, 0.35)');
    gNeb.addColorStop(0.7, 'rgba(15, 23, 42, 0.2)');
    gNeb.addColorStop(1, 'rgba(0, 0, 0, 0)');
    nCtx.fillStyle = gNeb;
    nCtx.fillRect(0, 0, 1024, 1024);

    // Secondary gas puff
    const gNeb2 = nCtx.createRadialGradient(680, 600, 20, 680, 600, 400);
    gNeb2.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gNeb2.addColorStop(0.5, 'rgba(17, 24, 39, 0.15)');
    gNeb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    nCtx.fillStyle = gNeb2;
    nCtx.fillRect(0, 0, 1024, 1024);

    const nebulaTexture = new THREE.CanvasTexture(nebulaCanvas);
    const nebulaGeo = new THREE.PlaneGeometry(160, 160);
    const nebulaMat = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    this.nebulaMesh.position.set(-25, 15, -45);
    this.nebulaMesh.rotation.z = 0.25;
    this.add(this.nebulaMesh);

    // 4. Inward-Spiraling Cosmic Dust & Gravitational Inflow Particles
    this.dustInitialRadii = new Float32Array(this.dustCount);
    this.dustInitialThetas = new Float32Array(this.dustCount);
    this.dustTimeOffsets = new Float32Array(this.dustCount);
    this.dustBaseZ = new Float32Array(this.dustCount);
    this.dustSpeedMultipliers = new Float32Array(this.dustCount);

    this.dustPositions = new Float32Array(this.dustCount * 3);
    this.dustColors = new Float32Array(this.dustCount * 3);

    for (let i = 0; i < this.dustCount; i++) {
      this.dustInitialRadii[i] = 4.5 + Math.random() * 16.0;
      this.dustInitialThetas[i] = Math.random() * Math.PI * 2;
      this.dustTimeOffsets[i] = Math.random() * 12.0;
      this.dustBaseZ[i] = (Math.random() - 0.5) * 4.0;
      this.dustSpeedMultipliers[i] = 0.8 + Math.random() * 0.4;
    }

    this.dustGeometry = new THREE.BufferGeometry();
    this.dustGeometry.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    this.dustGeometry.setAttribute('color', new THREE.BufferAttribute(this.dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.dustParticles = new THREE.Points(this.dustGeometry, dustMat);
    this.add(this.dustParticles);
  }

  public update(elapsedTime: number): void {
    const loopPeriod = 12.0;
    const positions = this.dustPositions;
    const colors = this.dustColors;

    for (let i = 0; i < this.dustCount; i++) {
      // Periodic phase [0, 1) strictly repeating every 12 seconds
      const tNorm = ((elapsedTime + this.dustTimeOffsets[i]) % loopPeriod) / loopPeriod;

      // Inward logarithmic accretion pull: radius shrinks from initial radius down to horizon (1.75)
      const maxR = this.dustInitialRadii[i];
      const minR = 1.75;
      const decay = Math.pow(1.0 - tNorm, 1.4);
      const r = minR + (maxR - minR) * decay;

      // Accelerating angular spin as radius shrinks (conservation of angular momentum)
      const angularSpeed = (Math.PI * 2 * 2.0) / (r * 0.45);
      const theta = this.dustInitialThetas[i] - tNorm * loopPeriod * angularSpeed * this.dustSpeedMultipliers[i];

      // Flatten towards accretion disk plane as r shrinks
      const zPlane = this.dustBaseZ[i] * decay;

      // Position in cosmic space (tilted along the general accretion disk tilt)
      const rawX = Math.cos(theta) * r;
      const rawY = Math.sin(theta) * r;
      const rawZ = zPlane;

      // Rotate to match the tilted accretion disk orientation
      // tilt ~68 deg X, ~10 deg Y
      const cosX = 0.3746, sinX = 0.9272; // cos(68 deg), sin(68 deg)
      const yRot = rawY * cosX - rawZ * sinX;
      const zRot = rawY * sinX + rawZ * cosX;

      positions[i * 3] = rawX;
      positions[i * 3 + 1] = yRot;
      positions[i * 3 + 2] = zRot;

      // Alpha fade in at birth and fade out at singularity event horizon
      const fadeIn = Math.min(1.0, tNorm * 5.0);
      const fadeOut = Math.min(1.0, (1.0 - tNorm) * 6.0);
      const alphaFactor = fadeIn * fadeOut;

      // Color shifts from electric cyan/white near center to deep blue outer
      const heat = Math.min(1.0, Math.max(0.0, (8.0 - r) / 6.0));
      colors[i * 3] = (0.2 + 0.8 * heat) * alphaFactor;
      colors[i * 3 + 1] = (0.7 + 0.3 * heat) * alphaFactor;
      colors[i * 3 + 2] = (1.0) * alphaFactor;
    }

    this.dustGeometry.attributes.position.needsUpdate = true;
    this.dustGeometry.attributes.color.needsUpdate = true;
  }
}
