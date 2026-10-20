import * as THREE from 'three';
import { createCircularParticleTexture } from '../utils/particleTexture';

export class CosmicEnvironment extends THREE.Group {
  public distantStars: THREE.Points;
  public brightStars: THREE.Points;
  public dustParticles: THREE.Points;
  public nebulaMesh: THREE.Mesh;

  private dustCount: number = 800;
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

    // 1. Distant Micro Starfield (8,000 tiny pinprick stars)
    const starCount = 8000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const cWhite = new THREE.Color(0xffffff);
    const cCyan = new THREE.Color(0x7dd3fc);
    const cBlue = new THREE.Color(0x38bdf8);
    const cDeep = new THREE.Color(0x1d4ed8);

    for (let i = 0; i < starCount; i++) {
      const radius = 120 + Math.random() * 250;
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

    const particleTex = createCircularParticleTexture();

    const starMat = new THREE.PointsMaterial({
      size: 0.9,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.distantStars = new THREE.Points(starGeo, starMat);
    this.add(this.distantStars);

    // 2. Bright Foreground Stars
    const brightCount = 400;
    const brightGeo = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(brightCount * 3);
    const brightColors = new Float32Array(brightCount * 3);

    for (let i = 0; i < brightCount; i++) {
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      brightPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      brightPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      brightPositions[i * 3 + 2] = radius * Math.cos(phi);

      brightColors[i * 3] = 0.85 + Math.random() * 0.15;
      brightColors[i * 3 + 1] = 0.95;
      brightColors[i * 3 + 2] = 1.0;
    }

    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

    const brightMat = new THREE.PointsMaterial({
      size: 1.6,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.brightStars = new THREE.Points(brightGeo, brightMat);
    this.add(this.brightStars);

    // 3. Subtle Background Nebula Plane
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 512;
    nebulaCanvas.height = 512;
    const nCtx = nebulaCanvas.getContext('2d')!;

    const gNeb = nCtx.createRadialGradient(200, 220, 20, 256, 256, 300);
    gNeb.addColorStop(0, 'rgba(0, 190, 255, 0.25)');
    gNeb.addColorStop(0.4, 'rgba(30, 58, 138, 0.18)');
    gNeb.addColorStop(0.8, 'rgba(15, 23, 42, 0.08)');
    gNeb.addColorStop(1, 'rgba(0, 0, 0, 0)');
    nCtx.fillStyle = gNeb;
    nCtx.fillRect(0, 0, 512, 512);

    const nebulaTexture = new THREE.CanvasTexture(nebulaCanvas);
    const nebulaGeo = new THREE.PlaneGeometry(140, 140);
    const nebulaMat = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    this.nebulaMesh.position.set(-20, 12, -40);
    this.nebulaMesh.rotation.z = 0.2;
    this.add(this.nebulaMesh);

    // 4. Inward-Spiraling Cosmic Dust Particles
    this.dustInitialRadii = new Float32Array(this.dustCount);
    this.dustInitialThetas = new Float32Array(this.dustCount);
    this.dustTimeOffsets = new Float32Array(this.dustCount);
    this.dustBaseZ = new Float32Array(this.dustCount);
    this.dustSpeedMultipliers = new Float32Array(this.dustCount);

    this.dustPositions = new Float32Array(this.dustCount * 3);
    this.dustColors = new Float32Array(this.dustCount * 3);

    for (let i = 0; i < this.dustCount; i++) {
      this.dustInitialRadii[i] = 5.0 + Math.random() * 15.0;
      this.dustInitialThetas[i] = Math.random() * Math.PI * 2;
      this.dustTimeOffsets[i] = Math.random() * 12.0;
      this.dustBaseZ[i] = (Math.random() - 0.5) * 3.0;
      this.dustSpeedMultipliers[i] = 0.8 + Math.random() * 0.4;
    }

    this.dustGeometry = new THREE.BufferGeometry();
    this.dustGeometry.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    this.dustGeometry.setAttribute('color', new THREE.BufferAttribute(this.dustColors, 3));

    // Refined small glowing circular particles
    const dustMat = new THREE.PointsMaterial({
      size: 0.38,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
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
      const tNorm = ((elapsedTime + this.dustTimeOffsets[i]) % loopPeriod) / loopPeriod;

      const maxR = this.dustInitialRadii[i];
      const minR = 2.2; // Don't let particles collapse into the black hole center
      const decay = Math.pow(1.0 - tNorm, 1.4);
      const r = minR + (maxR - minR) * decay;

      const angularSpeed = (Math.PI * 2 * 1.5) / (r * 0.5);
      const theta = this.dustInitialThetas[i] - tNorm * loopPeriod * angularSpeed * this.dustSpeedMultipliers[i];
      const zPlane = this.dustBaseZ[i] * decay;

      const rawX = Math.cos(theta) * r;
      const rawY = Math.sin(theta) * r;
      const rawZ = zPlane;

      // Tilt along accretion disk orientation
      const cosX = 0.3746, sinX = 0.9272;
      const yRot = rawY * cosX - rawZ * sinX;
      const zRot = rawY * sinX + rawZ * cosX;

      positions[i * 3] = rawX;
      positions[i * 3 + 1] = yRot;
      positions[i * 3 + 2] = zRot;

      // Smooth fade in & fade out near horizon
      const fadeIn = Math.min(1.0, tNorm * 4.0);
      const fadeOut = Math.min(1.0, (1.0 - tNorm) * 5.0);
      const horizonFade = Math.min(1.0, Math.max(0.0, (r - 2.2) / 1.5));
      const alphaFactor = fadeIn * fadeOut * horizonFade;

      colors[i * 3] = 0.4 * alphaFactor;
      colors[i * 3 + 1] = 0.8 * alphaFactor;
      colors[i * 3 + 2] = 1.0 * alphaFactor;
    }

    this.dustGeometry.attributes.position.needsUpdate = true;
    this.dustGeometry.attributes.color.needsUpdate = true;
  }
}
