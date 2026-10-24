import * as THREE from 'three';
import { CameraController } from './CameraController';
import { PostProcessingManager } from './PostProcessing';
import { FlowerBouquet } from '../objects/FlowerBouquet';
import { PetalVortex } from '../objects/PetalVortex';
import { SparkleEnvironment } from '../objects/SparkleEnvironment';

export class SceneManager {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public cameraController: CameraController;
  public postProcessing: PostProcessingManager;
  public clock: THREE.Clock;

  // Floral Bouquet Assembly System
  public flowerBouquet: FlowerBouquet;
  public petalVortex: PetalVortex;
  public sparkleEnvironment: SparkleEnvironment;

  private isRunning: boolean = false;
  private updateCallbacks: Array<(elapsedTime: number, deltaTime: number) => void> = [];
  private assemblyTime: number = 0;
  private continuousTime: number = 0;
  private lastRawDelta: number = 0.016;
  private isPausedState: boolean = false;
  private timeUpdateCallbacks: Array<(time: number, isPaused: boolean) => void> = [];

  // 3D Card Interactive Raycasting & Callbacks
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouseNDC: THREE.Vector2 = new THREE.Vector2();
  private pointerDownPos: THREE.Vector2 = new THREE.Vector2();
  private isPointerDownValid: boolean = false;
  private onCardOpenModalCallback: (() => void) | null = null;
  private cardHoverListeners: Array<(isHovered: boolean) => void> = [];

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene: Romantic luxury deep plum atmosphere
    this.scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x0e0614);
    this.scene.background = bgColor;
    this.scene.fog = new THREE.FogExp2(0x0e0614, 0.018);

    // 2. Camera: Focused medium shot framing the floral bouquet
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    this.camera.position.set(0, 2.4, 15.5);

    // 3. WebGLRenderer with ACES Filmic Tone Mapping
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
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 4. Camera Controller (centered on bouquet at (0, 0.4, 0))
    this.cameraController = new CameraController(this.camera, {
      radius: 15.5,
      height: 2.2,
      heightAmplitude: 1.0,
      loopPeriod: 16.0,
      lookAtTarget: new THREE.Vector3(0, 0.4, 0)
    });

    // 5. Postprocessing Pipeline for soft blooming
    this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);
    if (this.postProcessing.bloomPass) {
      this.postProcessing.bloomPass.strength = 0.32;
      this.postProcessing.bloomPass.radius = 0.35;
      this.postProcessing.bloomPass.threshold = 0.75;
    }

    // 6. Clock
    this.clock = new THREE.Clock();

    // 7. Sparkle & Romantic Lighting Environment
    this.sparkleEnvironment = new SparkleEnvironment();
    this.scene.add(this.sparkleEnvironment);

    // 8. Petal Vortex (Floating 3D Petals in Orbit)
    this.petalVortex = new PetalVortex();
    this.scene.add(this.petalVortex);

    // 9. Flower Bouquet (Centerpiece Assembly)
    this.flowerBouquet = new FlowerBouquet();
    this.scene.add(this.flowerBouquet);

    // Register update loop for the 4-phase choreographed assembly
    this.registerUpdate((assemblyTime, deltaTime) => {
      this.sparkleEnvironment.update(this.continuousTime);
      this.petalVortex.update(assemblyTime);
      this.flowerBouquet.update(assemblyTime, this.continuousTime, this.lastRawDelta);
    });

    this.setupEvents();
    this.setupCardInteraction();
    this.onResize();
  }

  private setupEvents(): void {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupCardInteraction(): void {
    const checkCardHover = (clientX: number, clientY: number, target: EventTarget | null) => {
      if (this.cameraController.getModalOpen() || (target as HTMLElement)?.closest?.('.ui-interactive')) {
        this.flowerBouquet.setCardHover(false);
        if (document.body.style.cursor === 'pointer') {
          document.body.style.cursor = 'default';
        }
        this.notifyCardHover(false);
        return;
      }

      if (!this.flowerBouquet.visible || this.flowerBouquet.greetingCard.scale.x < 0.4) {
        this.flowerBouquet.setCardHover(false);
        if (document.body.style.cursor === 'pointer') {
          document.body.style.cursor = 'default';
        }
        this.notifyCardHover(false);
        return;
      }

      this.mouseNDC.x = (clientX / window.innerWidth) * 2 - 1;
      this.mouseNDC.y = -(clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseNDC, this.camera);
      const hits = this.raycaster.intersectObject(this.flowerBouquet.greetingCard, false);
      const isHit = hits.length > 0;

      this.flowerBouquet.setCardHover(isHit);
      if (isHit) {
        document.body.style.cursor = 'pointer';
        this.notifyCardHover(true);
      } else {
        if (document.body.style.cursor === 'pointer') {
          document.body.style.cursor = 'default';
        }
        this.notifyCardHover(false);
      }
    };

    window.addEventListener('pointermove', (e: PointerEvent) => {
      checkCardHover(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('pointerdown', (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest?.('.ui-interactive')) {
        this.isPointerDownValid = false;
        return;
      }
      this.pointerDownPos.set(e.clientX, e.clientY);
      this.isPointerDownValid = true;
    });

    window.addEventListener('pointerup', (e: PointerEvent) => {
      if (!this.isPointerDownValid) return;
      this.isPointerDownValid = false;
      if ((e.target as HTMLElement)?.closest?.('.ui-interactive')) return;

      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist > 8) return; // Ignore drag motions

      if (!this.flowerBouquet.visible || this.flowerBouquet.greetingCard.scale.x < 0.4) return;

      this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseNDC, this.camera);
      const hits = this.raycaster.intersectObject(this.flowerBouquet.greetingCard, false);
      if (hits.length > 0) {
        this.openGreetingCard();
      }
    });
  }

  public openGreetingCard(onOpenModal?: () => void): void {
    if (this.cameraController.getModalOpen()) return;
    if (this.assemblyTime < 10.5) {
      this.setTime(11.0);
    }
    this.flowerBouquet.openCard(this.camera.position, () => {
      if (onOpenModal) {
        onOpenModal();
      } else if (this.onCardOpenModalCallback) {
        this.onCardOpenModalCallback();
      }
    });
  }

  public closeGreetingCard(onCloseComplete?: () => void): void {
    this.flowerBouquet.closeCard(onCloseComplete);
  }

  public setOnCardOpenModal(cb: () => void): void {
    this.onCardOpenModalCallback = cb;
  }

  public setModalOpen(isOpen: boolean): void {
    this.cameraController.setModalOpen(isOpen);
    if (isOpen) {
      this.notifyCardHover(false);
      if (document.body.style.cursor === 'pointer') {
        document.body.style.cursor = 'default';
      }
    }
  }

  public onCardHover(cb: (isHovered: boolean) => void): () => void {
    this.cardHoverListeners.push(cb);
    return () => {
      this.cardHoverListeners = this.cardHoverListeners.filter(c => c !== cb);
    };
  }

  private notifyCardHover(isHovered: boolean): void {
    for (const cb of this.cardHoverListeners) cb(isHovered);
  }

  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1.0 ? 48 : 45;
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

  public setTime(t: number): void {
    this.assemblyTime = Math.max(0.0, Math.min(16.0, t));
    (window as any).__elapsedTime = this.assemblyTime;
    this.cameraController.update(this.assemblyTime, 0, this.continuousTime);
    for (const callback of this.updateCallbacks) {
      callback(this.assemblyTime, 0);
    }
    for (const cb of this.timeUpdateCallbacks) {
      cb(this.assemblyTime, this.isPausedState);
    }
    this.postProcessing.render();
  }

  public togglePlayPause(): boolean {
    this.isPausedState = !this.isPausedState;
    for (const cb of this.timeUpdateCallbacks) {
      cb(this.assemblyTime, this.isPausedState);
    }
    return this.isPausedState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public setPaused(paused: boolean): void {
    this.isPausedState = paused;
    for (const cb of this.timeUpdateCallbacks) {
      cb(this.assemblyTime, this.isPausedState);
    }
  }

  public getTime(): number {
    return this.assemblyTime;
  }

  public getContinuousTime(): number {
    return this.continuousTime;
  }

  public onTimeUpdate(callback: (time: number, isPaused: boolean) => void): () => void {
    this.timeUpdateCallbacks.push(callback);
    return () => {
      this.timeUpdateCallbacks = this.timeUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  public toggleAutoOrbit(): boolean {
    return this.cameraController.toggleAutoOrbit();
  }

  public isAutoOrbiting(): boolean {
    return this.cameraController.isAutoOrbiting();
  }

  private render = (): void => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.render);

    const rawDelta = Math.min(this.clock.getDelta(), 0.1);
    this.lastRawDelta = rawDelta;
    this.continuousTime += rawDelta;
    (window as any).__continuousTime = this.continuousTime;

    const deltaTime = this.isPausedState ? 0 : rawDelta;
    if (!this.isPausedState) {
      // Clamps at 16.0s so completed bouquet presentation persists indefinitely
      this.assemblyTime = Math.min(16.0, this.assemblyTime + rawDelta);
    }
    (window as any).__elapsedTime = this.assemblyTime;

    // Update camera orbital movement (uses continuous time once showcase starts)
    this.cameraController.update(this.assemblyTime, rawDelta, this.continuousTime);

    // Update animated scene elements
    for (const callback of this.updateCallbacks) {
      callback(this.assemblyTime, deltaTime);
    }

    // Notify UI time listeners
    for (const cb of this.timeUpdateCallbacks) {
      cb(this.assemblyTime, this.isPausedState);
    }

    // Postprocessing render pass
    this.postProcessing.render();
  };
}
