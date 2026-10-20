import * as THREE from 'three';
import { CosmicPlumeShader } from '../shaders/cosmicPlumeShader';

export class CosmicPlume extends THREE.Group {
  public mesh: THREE.Mesh;
  public shaderMaterial: THREE.ShaderMaterial;
  public curve: THREE.CatmullRomCurve3;

  constructor() {
    super();

    // 3D Spline gracefully funnelling cosmic plasma into the accretion disk rim
    // Merges into the outer accretion flow instead of intersecting the event horizon
    const points = [
      new THREE.Vector3(-14.0, 9.0, -5.5),
      new THREE.Vector3(-10.5, 6.5, -3.2),
      new THREE.Vector3(-7.2, 4.2, -1.4),
      new THREE.Vector3(-4.8, 2.8, -0.2),
      new THREE.Vector3(-3.2, 1.8, 0.6),
      new THREE.Vector3(-2.2, 1.2, 1.2)
    ];

    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);

    // Slim, elegant plasma ribbon tube
    const tubularSegments = 90;
    const radius = 0.5;
    const radialSegments = 24;
    const geometry = new THREE.TubeGeometry(this.curve, tubularSegments, radius, radialSegments, false);

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CosmicPlumeShader.uniforms),
      vertexShader: CosmicPlumeShader.vertexShader,
      fragmentShader: CosmicPlumeShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.mesh.renderOrder = 4;
    this.add(this.mesh);

    // Subtle outer glow sheath
    const outerRadius = 0.85;
    const outerGeo = new THREE.TubeGeometry(this.curve, 60, outerRadius, 16, false);
    const outerMat = this.shaderMaterial.clone();
    outerMat.uniforms.uIntensity.value = 0.6;
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
