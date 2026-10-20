import * as THREE from 'three';
import { CosmicPlumeShader } from '../shaders/cosmicPlumeShader';

export class CosmicPlume extends THREE.Group {
  public mesh: THREE.Mesh;
  public shaderMaterial: THREE.ShaderMaterial;
  public curve: THREE.CatmullRomCurve3;

  constructor() {
    super();

    // 3D Spline gracefully funnelling cosmic plasma into the accretion core
    const points = [
      new THREE.Vector3(-12.0, 7.5, -4.5),
      new THREE.Vector3(-8.5, 5.0, -2.5),
      new THREE.Vector3(-5.5, 3.2, -0.8),
      new THREE.Vector3(-3.2, 1.8, 0.4),
      new THREE.Vector3(-1.6, 0.8, 0.8),
      new THREE.Vector3(-0.6, 0.2, 0.3),
      new THREE.Vector3(0, 0, 0)
    ];

    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);

    // Slim, elegant plasma ribbon tube
    const tubularSegments = 100;
    const radius = 0.65;
    const radialSegments = 24;
    const geometry = new THREE.TubeGeometry(this.curve, tubularSegments, radius, radialSegments, false);

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CosmicPlumeShader.uniforms),
      vertexShader: CosmicPlumeShader.vertexShader,
      fragmentShader: CosmicPlumeShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide, // Render front side only to avoid 4x additive stacking!
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.mesh.renderOrder = 4;
    this.add(this.mesh);

    // Soft outer glow sheath (subtle)
    const outerRadius = 1.1;
    const outerGeo = new THREE.TubeGeometry(this.curve, 60, outerRadius, 16, false);
    const outerMat = this.shaderMaterial.clone();
    outerMat.uniforms.uIntensity.value = 0.8;
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.renderOrder = 3;
    this.add(outerMesh);
  }

  public update(elapsedTime: number): void {
    if (this.shaderMaterial.uniforms.uTime) {
      this.shaderMaterial.uniforms.uTime.value = elapsedTime;
    }
  }
}
