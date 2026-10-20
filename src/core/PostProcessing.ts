import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class PostProcessingManager {
  public composer: EffectComposer;
  public bloomPass: UnrealBloomPass;
  public renderPass: RenderPass;
  public outputPass: OutputPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    // 1. Initialize EffectComposer directly with renderer
    this.composer = new EffectComposer(renderer);
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.composer.setSize(window.innerWidth, window.innerHeight);

    // 2. Base scene render pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 3. UnrealBloomPass: controlled cinematic glow without overblowing
    const res = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const bloomStrength = 0.95;
    const bloomRadius = 0.4;
    const bloomThreshold = 0.28;

    this.bloomPass = new UnrealBloomPass(res, bloomStrength, bloomRadius, bloomThreshold);
    this.composer.addPass(this.bloomPass);

    // 4. OutputPass: official ACESFilmic tone mapping and sRGB conversion
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  public setSize(width: number, height: number): void {
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  public render(): void {
    this.composer.render();
  }
}
