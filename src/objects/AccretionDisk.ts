import * as THREE from 'three';
import { AccretionDiskShader } from '../shaders/accretionDiskShader';

export class AccretionDisk extends THREE.Group {
  public mesh: THREE.Mesh;
  public shaderMaterial: THREE.ShaderMaterial;

  constructor() {
    super();

    // High-resolution ring geometry
    // Inner radius 1.85 (just outside event horizon 1.65), outer radius 7.2
    const innerRadius = 1.85;
    const outerRadius = 7.2;
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128, 64);

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(AccretionDiskShader.uniforms),
      vertexShader: AccretionDiskShader.vertexShader,
      fragmentShader: AccretionDiskShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.mesh.renderOrder = 3;
    this.add(this.mesh);

    // Apply 3D cinematic tilt matching reference image
    // Rotate so normal points upward and tilted towards camera
    this.rotation.x = Math.PI * 0.38; // ~68 degrees tilt
    this.rotation.y = -Math.PI * 0.12;
    this.rotation.z = Math.PI * 0.18;
  }

  public update(elapsedTime: number, cameraPosition: THREE.Vector3): void {
    if (this.shaderMaterial.uniforms.uTime) {
      this.shaderMaterial.uniforms.uTime.value = elapsedTime;
    }
    if (this.shaderMaterial.uniforms.uCameraPosition) {
      this.shaderMaterial.uniforms.uCameraPosition.value.copy(cameraPosition);
    }
  }
}
