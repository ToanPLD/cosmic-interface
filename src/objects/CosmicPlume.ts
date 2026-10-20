import * as THREE from 'three';
import { CosmicPlumeShader } from '../shaders/cosmicPlumeShader';

export class CosmicPlume extends THREE.Group {
  public mesh: THREE.Mesh;
  public shaderMaterial: THREE.ShaderMaterial;
  public curve: THREE.CatmullRomCurve3;

  constructor() {
    super();

    // 3D Spline matching the reference image's sweeping gas arm
    const points = [
      new THREE.Vector3(-18, 12, -7),
      new THREE.Vector3(-13, 8.5, -4),
      new THREE.Vector3(-8, 5.0, -1.5),
      new THREE.Vector3(-4.5, 2.6, 0.5),
      new THREE.Vector3(-2.2, 1.0, 1.2),
      new THREE.Vector3(-0.6, 0.2, 0.4),
      new THREE.Vector3(0, 0, 0)
    ];

    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);

    // Tube geometry along curve
    const tubularSegments = 120;
    const radius = 1.35;
    const radialSegments = 32;
    const geometry = new THREE.TubeGeometry(this.curve, tubularSegments, radius, radialSegments, false);

    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(CosmicPlumeShader.uniforms),
      vertexShader: CosmicPlumeShader.vertexShader,
      fragmentShader: CosmicPlumeShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, this.shaderMaterial);
    this.mesh.renderOrder = 4;
    this.add(this.mesh);

    // Add secondary subtle wider outer glow sheath
    const outerRadius = 2.4;
    const outerGeo = new THREE.TubeGeometry(this.curve, 80, outerRadius, 20, false);
    const outerMat = this.shaderMaterial.clone();
    outerMat.uniforms.uIntensity.value = 1.2;
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
