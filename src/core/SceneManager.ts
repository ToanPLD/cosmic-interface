import * as THREE from 'three';
import { CameraController } from './CameraController';

export class SceneManager {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public cameraController: CameraController;
  public clock: THREE.Clock;

  private isRunning: boolean = false;
  private resizeObserver: ResizeObserver | null = null;
  private updateCallbacks: Array<(elapsedTime: number, deltaTime: number) => void> = [];

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010206);
    this.scene.fog = new THREE.FogExp2(0x010206, 0.015);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 22);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Camera Controller
    this.cameraController = new CameraController(this.camera, {
      radius: 24.0,
      height: 5.0,
      heightAmplitude: 1.8,
      loopPeriod: 12.0
    });

    // 5. Clock
    this.clock = new THREE.Clock();

    this.setupEvents();
  }

  private setupEvents(): void {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public registerUpdate(callback: (elapsedTime: number, deltaTime: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.render();
  }

  public stop(): void {
    this.isRunning = false;
  }

  private render = (): void => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.render);

    const deltaTime = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update camera orbital motion
    this.cameraController.update(elapsedTime, deltaTime);

    // Update components
    for (const callback of this.updateCallbacks) {
      callback(elapsedTime, deltaTime);
    }

    // Direct render fallback (will be routed through post-processing composer in Task 7)
    this.renderer.render(this.scene, this.camera);
  };
}
