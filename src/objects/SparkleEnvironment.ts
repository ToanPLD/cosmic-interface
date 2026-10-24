import * as THREE from 'three';
import { createCircularParticleTexture } from '../utils/particleTexture';

export class SparkleEnvironment extends THREE.Group {
  public ambientLight: THREE.AmbientLight;
  public keyLight: THREE.DirectionalLight;
  public fillLight: THREE.DirectionalLight;
  public rimLight: THREE.PointLight;
  public fairyDust: THREE.Points;

  private dustCount: number = 750;
  private dustPositions: Float32Array;
  private dustBasePositions: Float32Array;
  private dustSpeeds: Float32Array;
  private dustPhases: Float32Array;
  private dustGeometry: THREE.BufferGeometry;

  constructor() {
    super();

    // 1. Studio 3-Point Lighting Rig for Botanical Photography
    this.ambientLight = new THREE.AmbientLight(0xfff1f2, 0.95);
    this.add(this.ambientLight);

    // Warm rose-gold key light
    this.keyLight = new THREE.DirectionalLight(0xffedd5, 2.4);
    this.keyLight.position.set(7, 10, 9);
    this.add(this.keyLight);

    // Soft sky-blue fill light to bring out translucent petals
    this.fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    this.fillLight.position.set(-8, 5, 6);
    this.add(this.fillLight);

    // Romantic back rim light highlighting edges of roses and wrapping paper
    this.rimLight = new THREE.PointLight(0xf472b6, 2.0, 30);
    this.rimLight.position.set(0, 3, -7);
    this.add(this.rimLight);

    // Warm frontal soft fill to illuminate petal micro-veins and velvety gradients
    const frontFill = new THREE.PointLight(0xfff7ed, 1.6, 22);
    frontFill.position.set(0, 0.4, 7.5);
    this.add(frontFill);

    // 2. Fairy Sparkles & Floating Pollen Dust
    this.dustPositions = new Float32Array(this.dustCount * 3);
    this.dustBasePositions = new Float32Array(this.dustCount * 3);
    this.dustSpeeds = new Float32Array(this.dustCount);
    this.dustPhases = new Float32Array(this.dustCount);
    const dustColors = new Float32Array(this.dustCount * 3);

    const cGold = new THREE.Color(0xfef08a);
    const cRose = new THREE.Color(0xf472b6);
    const cWhite = new THREE.Color(0xffffff);
    const cSky = new THREE.Color(0x7dd3fc);

    for (let i = 0; i < this.dustCount; i++) {
      const radius = 2.0 + Math.random() * 14.0;
      const theta = Math.random() * Math.PI * 2;
      const y = -4.0 + Math.random() * 12.0;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      this.dustPositions[i * 3] = x;
      this.dustPositions[i * 3 + 1] = y;
      this.dustPositions[i * 3 + 2] = z;

      this.dustBasePositions[i * 3] = x;
      this.dustBasePositions[i * 3 + 1] = y;
      this.dustBasePositions[i * 3 + 2] = z;

      this.dustSpeeds[i] = 0.4 + Math.random() * 0.8;
      this.dustPhases[i] = Math.random() * Math.PI * 2;

      // Color distribution
      const roll = Math.random();
      const col = roll < 0.4 ? cGold : roll < 0.7 ? cRose : roll < 0.9 ? cWhite : cSky;
      dustColors[i * 3] = col.r;
      dustColors[i * 3 + 1] = col.g;
      dustColors[i * 3 + 2] = col.b;
    }

    this.dustGeometry = new THREE.BufferGeometry();
    this.dustGeometry.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    this.dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const particleTexture = createCircularParticleTexture();
    const dustMat = new THREE.PointsMaterial({
      size: 0.42,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.fairyDust = new THREE.Points(this.dustGeometry, dustMat);
    this.add(this.fairyDust);
  }

  public update(elapsedTime: number): void {
    const pos = this.dustPositions;
    const base = this.dustBasePositions;

    for (let i = 0; i < this.dustCount; i++) {
      // Gentle upward float with soft spiral breeze
      const speed = this.dustSpeeds[i];
      const phase = this.dustPhases[i];

      const currentY = base[i * 3 + 1] + (elapsedTime * speed) % 14.0 - 5.0;
      const waveX = Math.sin(elapsedTime * 0.8 + phase) * 0.4;
      const waveZ = Math.cos(elapsedTime * 0.8 + phase) * 0.4;

      pos[i * 3] = base[i * 3] + waveX;
      pos[i * 3 + 1] = currentY;
      pos[i * 3 + 2] = base[i * 3 + 2] + waveZ;
    }

    this.dustGeometry.attributes.position.needsUpdate = true;

    // Subtle gentle breathing movement in key light
    this.keyLight.position.x = 7.0 + Math.sin(elapsedTime * 0.5) * 1.2;
  }
}
