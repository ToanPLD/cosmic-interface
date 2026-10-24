import * as THREE from 'three';
import {
  createHighDetailPetalGeometry,
  createCarnationPetalGeometry,
  createFloretGeometry,
  createEucalyptusLeafGeometry,
  FlowerMaterials
} from '../utils/flowerGeometry';

interface FlyingPetal {
  mesh: THREE.Mesh;
  baseRadius: number;
  orbitSpeed: number;
  initialPhase: number;
  inclinationMatrix: THREE.Matrix4;
  tumbleSpeed: THREE.Vector3;
  flutterPhase: number;
  targetPos: THREE.Vector3;
  dockStartT: number;
  dockEndT: number;
}

export class PetalVortex extends THREE.Group {
  private petals: FlyingPetal[] = [];
  private static readonly _scratchPos = new THREE.Vector3();

  constructor() {
    super();
    this.buildPetals();
  }

  private buildPetals(): void {
    const totalPetals = 84;
    const roseCoreGeo = createHighDetailPetalGeometry(0.72, 0.95, 0.40, 0.16, 0.05);
    const roseOuterGeo = createHighDetailPetalGeometry(0.88, 1.15, 0.35, 0.24, 0.07);
    const carnationGeo = createCarnationPetalGeometry(0.7, 0.85);
    const floretGeo = createFloretGeometry(0.35);
    const leafGeo = createEucalyptusLeafGeometry(0.65, 1.1);

    for (let i = 0; i < totalPetals; i++) {
      let geo: THREE.BufferGeometry;
      let mat: THREE.Material;

      const typeRoll = i % 4;
      if (typeRoll === 0) {
        if (i % 2 === 0) {
          geo = roseCoreGeo;
          mat = FlowerMaterials.rosePetalCore;
        } else {
          geo = roseOuterGeo;
          mat = FlowerMaterials.rosePetalOuter;
        }
      } else if (typeRoll === 1) {
        geo = carnationGeo;
        mat = FlowerMaterials.carnationCoral;
      } else if (typeRoll === 2) {
        geo = floretGeo;
        mat = FlowerMaterials.floretBlue;
      } else {
        geo = leafGeo;
        mat = FlowerMaterials.eucalyptusGreen;
      }

      const mesh = new THREE.Mesh(geo, mat);
      const scale = 0.7 + (i % 5) * 0.12;
      mesh.scale.setScalar(scale);
      this.add(mesh);

      // Random 3D inclination plane
      const incX = (Math.random() - 0.5) * 1.8;
      const incY = (Math.random() - 0.5) * 1.8;
      const incZ = (Math.random() - 0.5) * 1.8;
      const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(incX, incY, incZ));

      // Staggered docking times between 4.0s and 7.8s
      const dockStart = 4.0 + Math.random() * 1.5;
      const dockEnd = dockStart + 1.2 + Math.random() * 0.8;

      // Target resting coordinate near bouquet surface
      const targetRadius = 0.8 + Math.random() * 1.5;
      const targetTheta = Math.random() * Math.PI * 2;
      const targetPhi = Math.random() * Math.PI * 0.7;
      const targetPos = new THREE.Vector3(
        targetRadius * Math.sin(targetPhi) * Math.cos(targetTheta),
        targetRadius * Math.cos(targetPhi) + 0.8,
        targetRadius * Math.sin(targetPhi) * Math.sin(targetTheta)
      );

      this.petals.push({
        mesh,
        baseRadius: 6.5 + (i / totalPetals) * 9.5,
        orbitSpeed: (0.45 + (i % 3) * 0.25) * ((Math.PI * 2) / 16.0),
        initialPhase: (i / totalPetals) * Math.PI * 2,
        inclinationMatrix: matrix,
        tumbleSpeed: new THREE.Vector3(
          1.2 + Math.random() * 2.0,
          1.5 + Math.random() * 2.5,
          0.8 + Math.random() * 1.5
        ),
        flutterPhase: Math.random() * Math.PI * 2,
        targetPos,
        dockStartT: dockStart,
        dockEndT: Math.min(dockEnd, 7.9)
      });
    }
  }

  public update(assemblyTime: number): void {
    // Phase 3 & 4 (8s+): All petals docked into bouquet, hide vortex
    if (assemblyTime >= 8.0) {
      this.visible = false;
      return;
    }

    this.visible = true;

    for (const p of this.petals) {
      if (assemblyTime < 4.0) {
        // Phase 1 (0s - 4s): Free 3D orbital flight with flutter
        const angle = p.initialPhase - p.orbitSpeed * assemblyTime;
        const rawX = Math.cos(angle) * p.baseRadius;
        const rawZ = Math.sin(angle) * p.baseRadius;
        const rawY = Math.sin(p.flutterPhase + assemblyTime * 2.8) * 0.8;

        PetalVortex._scratchPos.set(rawX, rawY, rawZ).applyMatrix4(p.inclinationMatrix);
        p.mesh.position.copy(PetalVortex._scratchPos);

        // Organic tumbling rotation
        p.mesh.rotation.x = assemblyTime * p.tumbleSpeed.x;
        p.mesh.rotation.y = assemblyTime * p.tumbleSpeed.y;
        p.mesh.rotation.z = Math.sin(assemblyTime * 3.0 + p.flutterPhase) * 0.5;
        p.mesh.visible = true;
      } else {
        // Phase 2 (4s - 8s): Golden spiral vortex inward convergence
        const t = assemblyTime;
        if (t >= p.dockEndT) {
          // Petal has docked into the bouquet
          p.mesh.visible = false;
        } else {
          p.mesh.visible = true;
          const gatherT = THREE.MathUtils.clamp((t - p.dockStartT) / (p.dockEndT - p.dockStartT), 0.0, 1.0);
          const eased = THREE.MathUtils.smoothstep(gatherT, 0.0, 1.0);

          // Orbit trajectory contracts toward center
          const spiralSpeedBoost = 1.0 + eased * 2.5;
          const angle = p.initialPhase - p.orbitSpeed * t * spiralSpeedBoost;
          const currentRadius = p.baseRadius * (1.0 - eased);

          const rawX = Math.cos(angle) * currentRadius;
          const rawZ = Math.sin(angle) * currentRadius;
          const rawY = Math.sin(p.flutterPhase + t * 4.0) * 0.6 * (1.0 - eased);

          PetalVortex._scratchPos.set(rawX, rawY, rawZ).applyMatrix4(p.inclinationMatrix);

          // Interpolate position from spiral to target blossom slot
          p.mesh.position.lerpVectors(PetalVortex._scratchPos, p.targetPos, eased);

          // Settle rotation as it docks
          p.mesh.rotation.x = (1.0 - eased) * (t * p.tumbleSpeed.x);
          p.mesh.rotation.y = (1.0 - eased) * (t * p.tumbleSpeed.y);
          p.mesh.rotation.z = (1.0 - eased) * Math.sin(t * 3.0 + p.flutterPhase);
        }
      }
    }
  }
}
