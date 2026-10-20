import * as THREE from 'three';
import { GravitationalLensingShader } from '../shaders/gravitationalLensingShader';

export class BlackHole extends THREE.Group {
  public eventHorizon: THREE.Mesh;
  public photonSphere: THREE.Mesh;
  public lensingMaterial: THREE.ShaderMaterial;
  public coreLight: THREE.PointLight;

  constructor() {
    super();

    // 1. Event Horizon: pure black sphere that absorbs all incoming photons
    const horizonGeo = new THREE.SphereGeometry(1.65, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthTest: true,
      depthWrite: true
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.eventHorizon.renderOrder = 1;
    this.add(this.eventHorizon);

    // 2. Photon Sphere / Einstein Gravitational Lensing Shell
    const lensingGeo = new THREE.SphereGeometry(2.35, 64, 64);
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
    this.photonSphere.renderOrder = 2;
    this.add(this.photonSphere);

    // 3. Central Core Point Light (illuminates nearby space & orbiting cards)
    this.coreLight = new THREE.PointLight(0x00e5ff, 4.5, 45, 1.2);
    this.coreLight.position.set(0, 0, 0);
    this.add(this.coreLight);

    // Additional secondary blue light for deep ambient fill
    const ambientDeep = new THREE.PointLight(0x1d4ed8, 2.0, 50, 1.5);
    this.add(ambientDeep);
  }

  public update(elapsedTime: number): void {
    if (this.lensingMaterial.uniforms.uTime) {
      this.lensingMaterial.uniforms.uTime.value = elapsedTime;
    }
  }
}
