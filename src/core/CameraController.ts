import * as THREE from 'three';

export interface CameraControllerOptions {
  radius?: number;
  height?: number;
  heightAmplitude?: number;
  loopPeriod?: number; // seconds, default 12.0
  lookAtTarget?: THREE.Vector3;
}

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public loopPeriod: number;
  public radius: number;
  public baseHeight: number;
  public heightAmplitude: number;
  public lookAtTarget: THREE.Vector3;

  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  constructor(camera: THREE.PerspectiveCamera, options: CameraControllerOptions = {}) {
    this.camera = camera;
    this.radius = options.radius ?? 22.0;
    this.baseHeight = options.height ?? 5.5;
    this.heightAmplitude = options.heightAmplitude ?? 1.6;
    this.loopPeriod = options.loopPeriod ?? 12.0;
    this.lookAtTarget = options.lookAtTarget ?? new THREE.Vector3(0, 0, 0);

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('mousemove', (e: MouseEvent) => {
      // Normalized coordinates [-1, 1]
      this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mouseleave', () => {
      this.targetMouseX = 0;
      this.targetMouseY = 0;
    });
  }

  public update(elapsedTime: number, deltaTime: number): void {
    // Smooth lerp for subtle mouse parallax
    const lerpFactor = Math.min(1.0, deltaTime * 3.0);
    this.mouseX += (this.targetMouseX - this.mouseX) * lerpFactor;
    this.mouseY += (this.targetMouseY - this.mouseY) * lerpFactor;

    // Harmonic angle: strictly repeats every loopPeriod
    const phase = (elapsedTime % this.loopPeriod) / this.loopPeriod;
    const angle = phase * Math.PI * 2.0;

    // Subtle parallax offset
    const parallaxRadius = this.mouseX * 1.5;
    const parallaxHeight = this.mouseY * 1.0;

    const currentRadius = this.radius + parallaxRadius;
    const x = Math.cos(angle) * currentRadius;
    const z = Math.sin(angle) * currentRadius;
    // Harmonic vertical undulation (2 full waves per 360 revolution for cinematic drift)
    const y = this.baseHeight + Math.sin(angle * 2.0) * this.heightAmplitude + parallaxHeight;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.lookAtTarget);
  }
}
