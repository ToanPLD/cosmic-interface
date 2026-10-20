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
    this.verticalAmplitude = 0.35;
    this.bobbingFrequency = (Math.PI * 2) / 12.0 * 2.0; // 2 oscillations per 12s loop

    // Card dimensions (aspect ratio ~1.6 : 1)
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
      depthWrite: false
    });

    this.shaderMaterial.uniforms.uTexture.value = texture;

    this.mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.mesh.renderOrder = 10;
    this.add(this.mesh);

    // Subtle edge backer plane for depth
    const borderGeo = new THREE.PlaneGeometry(cardWidth * 1.03, cardHeight * 1.03);
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.z = -0.01;
    this.add(borderMesh);
  }

  public update(
    elapsedTime: number,
    cameraPosition: THREE.Vector3,
    orbitInclinationMatrix: THREE.Matrix4
  ): void {
    if (this.shaderMaterial.uniforms.uTime) {
      this.shaderMaterial.uniforms.uTime.value = elapsedTime;
    }

    // 1. Calculate orbital angle (Clockwise movement)
    // angle = initialPhase - orbitSpeed * elapsedTime
    const angle = this.initialPhase - this.orbitSpeed * elapsedTime;

    // 2. Uninclined position on circle
    const rawX = Math.cos(angle) * this.baseOrbitRadius;
    const rawZ = Math.sin(angle) * this.baseOrbitRadius;
    // Harmonic vertical floating bobbing
    const rawY = this.verticalOffset + Math.sin(this.initialPhase + elapsedTime * this.bobbingFrequency) * this.verticalAmplitude;

    const localPos = new THREE.Vector3(rawX, rawY, rawZ);

    // 3. Apply orbit inclination plane transform
    localPos.applyMatrix4(orbitInclinationMatrix);
    this.position.copy(localPos);

    // 4. Calculate orbital tangent (motion direction)
    const tangent = new THREE.Vector3(Math.sin(angle), 0, -Math.cos(angle)).applyMatrix4(orbitInclinationMatrix).normalize();

    // 5. Calculate card orientation
    // Vector from card to camera
    const toCamera = new THREE.Vector3().subVectors(cameraPosition, this.position).normalize();

    // Foreground factor: how close is the card compared to the core?
    // Camera is looking at (0,0,0). Cards between camera and core are in the foreground.
    const camToCenter = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), cameraPosition).normalize();
    const camToCard = new THREE.Vector3().subVectors(this.position, cameraPosition).normalize();
    const foregroundDot = camToCard.dot(camToCenter); // higher value (near 1.0) means closer to central sightline

    // Distance to camera vs distance from center to camera
    const distToCam = this.position.distanceTo(cameraPosition);
    const centerDistToCam = cameraPosition.length();
    const isForeground = distToCam < centerDistToCam;

    // Target normal:
    // If in foreground, card normal rotates to face the camera smoothly.
    // If behind the core (background), card normal aligns with the orbital outward normal or tangent.
    let faceWeight = 0.0;
    if (isForeground) {
      // Strong camera facing when in front
      faceWeight = Math.min(1.0, Math.max(0.0, (centerDistToCam - distToCam) / 6.0));
      faceWeight = Math.pow(faceWeight, 0.7); // smooth easing
    }

    // Normal when following circular orbit (facing outwards from center)
    const orbitalNormal = this.position.clone().normalize();
    const targetNormal = new THREE.Vector3().lerpVectors(orbitalNormal, toCamera, faceWeight * 0.85 + 0.15).normalize();

    // Look at target
    const lookTarget = this.position.clone().add(targetNormal);
    this.lookAt(lookTarget);
  }
}
