import * as THREE from 'three';
import { GravitationalLensingShader } from '../shaders/gravitationalLensingShader';

export class BlackHole extends THREE.Group {
  public eventHorizon: THREE.Mesh;
  public photonSphere: THREE.Mesh;
  public lensingMaterial: THREE.ShaderMaterial;

  constructor() {
    super();

    // 1. Event Horizon: pure black sphere that absorbs all incoming photons
    const horizonGeo = new THREE.SphereGeometry(1.68, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthTest: true,
      depthWrite: true
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.eventHorizon.renderOrder = 50;
    this.add(this.eventHorizon);

    // 2. Photon Sphere / Einstein Gravitational Lensing Rim
    const lensingGeo = new THREE.SphereGeometry(1.85, 64, 64);
    this.lensingMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(GravitationalLensingShader.uniforms),
      vertexShader: GravitationalLensingShader.vertexShader,
      fragmentShader: GravitationalLensingShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false
    });
    this.photonSphere = new THREE.Mesh(lensingGeo, this.lensingMaterial);
    this.photonSphere.renderOrder = 55;
    this.add(this.photonSphere);
  }

  public update(elapsedTime: number): void {
    if (this.lensingMaterial.uniforms.uTime) {
      this.lensingMaterial.uniforms.uTime.value = elapsedTime;
    }
  }
}
