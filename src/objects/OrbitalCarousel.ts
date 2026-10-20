import * as THREE from 'three';
import { HolographicCard } from './HolographicCard';
import { createProceduralCosmicTexture } from '../utils/cosmicTextureGenerator';

interface OrbitConfig {
  radius: number;
  speedMultiplier: number; // integer harmonic of 2pi / 12
  inclinationX: number; // pitch tilt
  inclinationY: number; // yaw rotation
  inclinationZ: number; // roll tilt
  cardCount: number;
  yOffset: number;
  ringColor: number;
}

export class OrbitalCarousel extends THREE.Group {
  public cards: HolographicCard[] = [];
  public orbitTrackGroups: THREE.Group[] = [];
  public orbitMatrices: THREE.Matrix4[] = [];
  private textures: THREE.CanvasTexture[] = [];

  constructor() {
    super();

    // Generate distinct procedural cosmic textures
    for (let i = 0; i < 6; i++) {
      this.textures.push(createProceduralCosmicTexture(i));
    }

    // 5 Distinct 3D orbital trajectories at steep, varied angles
    // creating a true spherical celestial formation (miniature solar system)
    const orbitConfigs: OrbitConfig[] = [
      {
        radius: 7.8,
        speedMultiplier: 2, // 2 full revolutions per 12s
        inclinationX: 0.28, // ~16 deg
        inclinationY: 0.15,
        inclinationZ: 0.12,
        cardCount: 4,
        yOffset: 0.15,
        ringColor: 0x00f5ff // Electric Cyan
      },
      {
        radius: 9.8,
        speedMultiplier: 1, // 1 full revolution per 12s
        inclinationX: -0.62, // ~-35 deg
        inclinationY: -0.38,
        inclinationZ: 0.28,
        cardCount: 4,
        yOffset: -0.25,
        ringColor: 0x38bdf8 // Sky Cyan-Blue
      },
      {
        radius: 11.8,
        speedMultiplier: 2, // 2 full revolutions per 12s
        inclinationX: 0.94, // ~54 deg
        inclinationY: 0.55,
        inclinationZ: -0.38,
        cardCount: 4,
        yOffset: 0.35,
        ringColor: 0x2563eb // Royal Neon Cobalt
      },
      {
        radius: 13.8,
        speedMultiplier: 1, // 1 full revolution per 12s
        inclinationX: -1.12, // ~-64 deg
        inclinationY: 0.72,
        inclinationZ: -0.25,
        cardCount: 4,
        yOffset: -0.20,
        ringColor: 0x06b6d4 // Aqua Cyan
      },
      {
        radius: 15.8,
        speedMultiplier: 1, // 1 full revolution per 12s
        inclinationX: 0.52, // ~30 deg
        inclinationY: -1.18, // ~-68 deg
        inclinationZ: 0.72,
        cardCount: 4,
        yOffset: 0.30,
        ringColor: 0x6366f1 // Celestial Indigo
      }
    ];

    let textureIndex = 0;

    orbitConfigs.forEach((config) => {
      // 1. Create inclination matrix
      const matrix = new THREE.Matrix4();
      const euler = new THREE.Euler(config.inclinationX, config.inclinationY, config.inclinationZ, 'XYZ');
      matrix.makeRotationFromEuler(euler);
      this.orbitMatrices.push(matrix);

      // 2. Create glowing 3D circular orbital track
      const trackGroup = new THREE.Group();
      trackGroup.rotation.copy(euler);

      // 3D Torus orbital track (remains visible and smooth from all 360-degree viewing angles)
      const ringGeo = new THREE.TorusGeometry(config.radius, 0.026, 8, 128);
      const ringMat = new THREE.MeshBasicMaterial({
        color: config.ringColor,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      trackGroup.add(ringMesh);

      // Secondary soft glowing outer aura torus
      const haloGeo = new THREE.TorusGeometry(config.radius, 0.12, 6, 96);
      const haloMat = new THREE.MeshBasicMaterial({
        color: config.ringColor,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 2;
      trackGroup.add(haloMesh);

      this.add(trackGroup);
      this.orbitTrackGroups.push(trackGroup);

      // 3. Create holographic cards along this orbit
      const baseAngularSpeed = ((Math.PI * 2) / 12.0) * config.speedMultiplier;
      const stepPhase = (Math.PI * 2) / config.cardCount;

      for (let c = 0; c < config.cardCount; c++) {
        const tex = this.textures[textureIndex % this.textures.length];
        textureIndex++;

        const phase = c * stepPhase;
        const card = new HolographicCard(
          tex,
          config.radius,
          baseAngularSpeed,
          phase,
          config.yOffset
        );

        // Store index of which orbit this card belongs to
        card.userData.orbitIndex = this.orbitMatrices.length - 1;

        this.add(card);
        this.cards.push(card);
      }
    });
  }

  public update(elapsedTime: number, cameraPosition: THREE.Vector3): void {
    for (const card of this.cards) {
      const orbitIndex = card.userData.orbitIndex as number;
      const orbitMatrix = this.orbitMatrices[orbitIndex];
      card.update(elapsedTime, cameraPosition, orbitMatrix);
    }
  }
}
