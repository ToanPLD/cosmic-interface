import * as THREE from 'three';
import { HolographicCardShader } from '../shaders/holographicCardShader';

export class HolographicCard extends THREE.Group {
  public mesh: THREE.Mesh;
  public shaderMaterial: THREE.ShaderMaterial;
  public baseOrbitRadius: number;
  public orbitSpeed: number; // in radians per second (harmonic integer * 2pi / 12)
  public initialPhase: number;
  public verticalOffset: number;
  public verticalAmplitude: number;
  public bobbingFrequency: number;

  // Persistent scratch vectors to eliminate per-frame GC allocations
  private static readonly _scratchLocalPos = new THREE.Vector3();
  private static readonly _scratchCamToCenterDir = new THREE.Vector3();
  private static readonly _scratchCamToCardVec = new THREE.Vector3();
  private static readonly _scratchToCamera = new THREE.Vector3();
  private static readonly _scratchOrbitalNormal = new THREE.Vector3();
  private static readonly _scratchTargetNormal = new THREE.Vector3();
  private static readonly _scratchLookTarget = new THREE.Vector3();

  constructor(
    texture: THREE.Texture,
    orbitRadius: number,
    orbitSpeed: number,
    initialPhase: number,
    verticalOffset: number = 0
  ) {
    super();

    this.baseOrbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.initialPhase = initialPhase;
    this.verticalOffset = verticalOffset;
    this.verticalAmplitude = 0.4;
    this.bobbingFrequency = ((Math.PI * 2) / 12.0) * 2.0; // 2 oscillations per 12s loop

    // Cinematic rectangular card dimensions (aspect ratio ~1.6 : 1)
    const cardWidth = 2.4;
    const cardHeight = 1.5;
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight, 16, 16);

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(HolographicCardShader.uniforms),
      vertexShader: HolographicCardShader.vertexShader,
      fragmentShader: HolographicCardShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false
    });

    this.shaderMaterial.uniforms.uTexture.value = texture;

    this.mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.mesh.renderOrder = 20;
    this.add(this.mesh);
  }

  public update(
    elapsedTime: number,
    cameraPosition: THREE.Vector3,
    orbitInclinationMatrix: THREE.Matrix4
  ): void {
    if (this.shaderMaterial.uniforms.uTime) {
      this.shaderMaterial.uniforms.uTime.value = elapsedTime;
    }

    // 1. Calculate orbital angle (Clockwise orbital movement around core)
    const angle = this.initialPhase - this.orbitSpeed * elapsedTime;

    // 2. Uninclined circular trajectory with subtle harmonic vertical floating
    const rawX = Math.cos(angle) * this.baseOrbitRadius;
    const rawZ = Math.sin(angle) * this.baseOrbitRadius;
    const rawY =
      this.verticalOffset +
      Math.sin(this.initialPhase + elapsedTime * this.bobbingFrequency) * this.verticalAmplitude;

    HolographicCard._scratchLocalPos.set(rawX, rawY, rawZ);

    // 3. Apply the 3D orbital plane inclination matrix
    HolographicCard._scratchLocalPos.applyMatrix4(orbitInclinationMatrix);
    this.position.copy(HolographicCard._scratchLocalPos);

    // 4. Calculate camera-relative distance & sightline projection
    // Optical axis from camera to central singularity at (0, 0, 0)
    const centerDistToCam = cameraPosition.length();
    HolographicCard._scratchCamToCenterDir.copy(cameraPosition).negate().normalize();
    HolographicCard._scratchCamToCardVec.subVectors(this.position, cameraPosition);
    const sightlineProjection = HolographicCard._scratchCamToCardVec.dot(HolographicCard._scratchCamToCenterDir);

    // diff: positive when the card is in foreground (in front of core), negative when behind
    const diff = centerDistToCam - sightlineProjection;

    // Smooth foreground factor [0.0 = deep background, 1.0 = direct foreground]
    const foregroundFactor = THREE.MathUtils.clamp((diff + 5.0) / 12.0, 0.0, 1.0);
    const easedFactor = THREE.MathUtils.smoothstep(foregroundFactor, 0.1, 0.9);

    if (this.shaderMaterial.uniforms.uForegroundFactor) {
      this.shaderMaterial.uniforms.uForegroundFactor.value = easedFactor;
    }

    // 5. Dynamic Render Order for Realistic Occlusion & Energy Veiling:
    if (diff > 0.0) {
      this.mesh.renderOrder = 20;
    } else {
      this.mesh.renderOrder = 2;
    }

    // 6. Camera-Facing Alignment with Gimbal-Lock Prevention:
    HolographicCard._scratchToCamera.subVectors(cameraPosition, this.position).normalize();
    HolographicCard._scratchOrbitalNormal.copy(this.position).normalize();

    // Lerp from outward orbital normal to direct camera-facing vector
    HolographicCard._scratchTargetNormal
      .lerpVectors(HolographicCard._scratchOrbitalNormal, HolographicCard._scratchToCamera, easedFactor * 0.88 + 0.12)
      .normalize();

    // Adaptive up vector to prevent gimbal lock at zenith/nadir
    if (Math.abs(HolographicCard._scratchTargetNormal.y) > 0.98) {
      this.up.set(0, 0, 1);
    } else {
      this.up.set(0, 1, 0);
    }

    HolographicCard._scratchLookTarget.addVectors(this.position, HolographicCard._scratchTargetNormal);
    this.lookAt(HolographicCard._scratchLookTarget);
  }
}
