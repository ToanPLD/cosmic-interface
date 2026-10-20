import * as THREE from 'three';
import { HolographicCard } from './HolographicCard';
import { createProceduralCosmicTexture } from '../utils/cosmicTextureGenerator';

interface OrbitConfig {
  radius: number;
  speedMultiplier: number; // integer harmonic of 2pi / 12
  inclinationX: number;
  inclinationZ: number;
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

    // Generate 6 distinct procedural cosmic textures
    for (let i = 0; i < 6; i++) {
      this.textures.push(createProceduralCosmicTexture(i));
    }

    // Define 3 realistic tilted 3D orbital trajectories
    const orbitConfigs: OrbitConfig[] = [
      {
        radius: 8.5,
        speedMultiplier: 2, // 2 full revolutions per 12s
        inclinationX: 0.18, // ~10 deg tilt
        inclinationZ: 0.12,
        cardCount: 4,
        yOffset: 0.2,
        ringColor: 0x00f0ff
      },
      {
        radius: 11.5,
        speedMultiplier: 1, // 1 full revolution per 12s
        inclinationX: -0.24, // ~-14 deg tilt
        inclinationZ: -0.15,
        cardCount: 5,
        yOffset: -0.4,
        ringColor: 0x38bdf8
      },
      {
        radius: 14.5,
        speedMultiplier: 1, // 1 full revolution per 12s
        inclinationX: 0.14, // ~8 deg tilt
        inclinationZ: -0.22,
        cardCount: 5,
        yOffset: 0.5,
        ringColor: 0x1d4ed8
      }
    ];

    let textureIndex = 0;

    orbitConfigs.forEach((config) => {
      // 1. Create inclination matrix
      const matrix = new THREE.Matrix4();
      const euler = new THREE.Euler(config.inclinationX, 0, config.inclinationZ, 'XYZ');
      matrix.makeRotationFromEuler(euler);
      this.orbitMatrices.push(matrix);

      // 2. Create glowing circular orbital track line
      const trackGroup = new THREE.Group();
      trackGroup.rotation.copy(euler);

      // Main glowing orbital ring
      const ringGeo = new THREE.RingGeometry(config.radius - 0.035, config.radius + 0.035, 128);
      const ringMat = new THREE.MeshBasicMaterial({
        color: config.ringColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      trackGroup.add(ringMesh);

      // Secondary outer faint halo ring
      const haloGeo = new THREE.RingGeometry(config.radius - 0.2, config.radius + 0.2, 96);
      const haloMat = new THREE.MeshBasicMaterial({
        color: config.ringColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.06,
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
