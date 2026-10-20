import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CinematicVignetteShader } from '../shaders/cinematicVignetteShader';

export class PostProcessingManager {
  public composer: EffectComposer;
  public bloomPass: UnrealBloomPass;
  public vignettePass: ShaderPass;
  public renderPass: RenderPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    // 1. Setup RenderTarget with HDR float buffer
    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        samples: 4 // MSAA anti-aliasing
      }
    );

    this.composer = new EffectComposer(renderer, renderTarget);

    // 2. Base scene render pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 3. UnrealBloomPass: intense cosmic luminescence
    const res = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const bloomStrength = 1.75;
    const bloomRadius = 0.7;
    const bloomThreshold = 0.24;

    this.bloomPass = new UnrealBloomPass(res, bloomStrength, bloomRadius, bloomThreshold);
    this.composer.addPass(this.bloomPass);

    // 4. Cinematic Chromatic Aberration & Vignette Pass
    this.vignettePass = new ShaderPass(CinematicVignetteShader);
    this.composer.addPass(this.vignettePass);
  }

  public setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  public render(): void {
    this.composer.render();
  }
}
