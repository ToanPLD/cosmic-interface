import * as THREE from 'three';
import { CameraController } from './CameraController';
import { PostProcessingManager } from './PostProcessing';
import { BlackHole } from '../objects/BlackHole';
import { AccretionDisk } from '../objects/AccretionDisk';
import { CosmicPlume } from '../objects/CosmicPlume';
import { OrbitalCarousel } from '../objects/OrbitalCarousel';
import { CosmicEnvironment } from '../objects/CosmicEnvironment';

export class SceneManager {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public cameraController: CameraController;
  public postProcessing: PostProcessingManager;
  public clock: THREE.Clock;
  public blackHole: BlackHole;
  public accretionDisk: AccretionDisk;
  public cosmicPlume: CosmicPlume;
  public orbitalCarousel: OrbitalCarousel;
  public cosmicEnvironment: CosmicEnvironment;

  private isRunning: boolean = false;
  private updateCallbacks: Array<(elapsedTime: number, deltaTime: number) => void> = [];

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010206);
    this.scene.fog = new THREE.FogExp2(0x010206, 0.012);

    // 2. Camera: Wide cinematic view of the entire cosmic system
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
    this.camera.position.set(0, 8, 32);

    // 3. WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
      stencil: false,
      depth: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // 4. Camera Controller (centered on black hole at (0, 0, 0))
    this.cameraController = new CameraController(this.camera, {
      radius: 32.0,
      height: 8.0,
      heightAmplitude: 2.5,
      loopPeriod: 12.0
    });

    // 5. Postprocessing Pipeline
    this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);

    // 6. Clock
    this.clock = new THREE.Clock();

    // 7. Black Hole Singularity Core
    this.blackHole = new BlackHole();
    this.scene.add(this.blackHole);

    // 8. Accretion Disk (tilted plasma ring)
    this.accretionDisk = new AccretionDisk();
    this.scene.add(this.accretionDisk);

    // 9. Cosmic Gas Plume (inflow from deep space)
    this.cosmicPlume = new CosmicPlume();
    this.scene.add(this.cosmicPlume);

    // 10. Orbital Carousel & Holographic Cards
    this.orbitalCarousel = new OrbitalCarousel();
    this.scene.add(this.orbitalCarousel);

    // 11. Cosmic Environment (Starfield, Nebula, Inward Dust)
    this.cosmicEnvironment = new CosmicEnvironment();
    this.scene.add(this.cosmicEnvironment);

    // Register update loops
    this.registerUpdate((elapsedTime) => {
      this.blackHole.update(elapsedTime);
      this.accretionDisk.update(elapsedTime, this.camera.position);
      this.cosmicPlume.update(elapsedTime);
      this.orbitalCarousel.update(elapsedTime, this.camera.position);
      this.cosmicEnvironment.update(elapsedTime);
    });

    this.setupEvents();

    // Explicit initial resize to guarantee exact buffer alignment
    this.onResize();
  }

  private setupEvents(): void {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(width, height);
    this.postProcessing.setSize(width, height);
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

    // Update scene components
    for (const callback of this.updateCallbacks) {
      callback(elapsedTime, deltaTime);
    }

    // Postprocessing render pipeline
    this.postProcessing.render();
  };
}
