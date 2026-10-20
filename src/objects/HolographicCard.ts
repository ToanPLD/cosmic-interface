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

    const localPos = new THREE.Vector3(rawX, rawY, rawZ);

    // 3. Apply the 3D orbital plane inclination matrix
    localPos.applyMatrix4(orbitInclinationMatrix);
    this.position.copy(localPos);

    // 4. Calculate camera-relative distance & sightline projection
    // Optical axis from camera to central singularity at (0, 0, 0)
    const centerDistToCam = cameraPosition.length();
    const camToCenterDir = new THREE.Vector3(0, 0, 0).sub(cameraPosition).normalize();
    const camToCardVec = new THREE.Vector3().subVectors(this.position, cameraPosition);
    const sightlineProjection = camToCardVec.dot(camToCenterDir);

    // diff: positive when the card is in foreground (in front of core), negative when behind
    const diff = centerDistToCam - sightlineProjection;

    // Smooth foreground factor [0.0 = deep background, 1.0 = direct foreground]
    const foregroundFactor = THREE.MathUtils.clamp((diff + 5.0) / 12.0, 0.0, 1.0);
    const easedFactor = THREE.MathUtils.smoothstep(foregroundFactor, 0.1, 0.9);

    if (this.shaderMaterial.uniforms.uForegroundFactor) {
      this.shaderMaterial.uniforms.uForegroundFactor.value = easedFactor;
    }

    // 5. Dynamic Render Order for Realistic Occlusion & Energy Veiling:
    // When behind the core, render before the accretion disk (renderOrder = 2)
    // so the black hole event horizon occludes it, and the glowing accretion disk overlays it.
    // When in the foreground, render above the accretion disk (renderOrder = 20).
    if (diff > 0.0) {
      this.mesh.renderOrder = 20;
    } else {
      this.mesh.renderOrder = 2;
    }

    // 6. Camera-Facing Alignment:
    // Panels gently rotate to face the camera as they pass through the front,
    // then gradually turn away towards the orbital tangent as they move behind the core.
    const toCamera = new THREE.Vector3().subVectors(cameraPosition, this.position).normalize();
    const orbitalNormal = this.position.clone().normalize();

    // Lerp from outward orbital normal to direct camera-facing vector
    const targetNormal = new THREE.Vector3()
      .lerpVectors(orbitalNormal, toCamera, easedFactor * 0.88 + 0.12)
      .normalize();

    const lookTarget = this.position.clone().add(targetNormal);
    this.lookAt(lookTarget);
  }
}
