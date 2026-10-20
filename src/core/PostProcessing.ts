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
    const pr = Math.min(window.devicePixelRatio || 1, 2);

    this.composer = new EffectComposer(renderer);
    this.composer.setPixelRatio(pr);
    this.composer.setSize(window.innerWidth, window.innerHeight);

    // 1. Render scene
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 2. Controlled subtle bloom: only high-luminance elements (>0.72) bloom softly
    const effectiveRes = new THREE.Vector2(
      window.innerWidth * pr,
      window.innerHeight * pr
    );
    const bloomStrength = 0.45;
    const bloomRadius = 0.25;
    const bloomThreshold = 0.72;

    this.bloomPass = new UnrealBloomPass(
      effectiveRes,
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    this.composer.addPass(this.bloomPass);

    // 3. Color grading & ACES Filmic Tone Mapping
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  public setSize(width: number, height: number): void {
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    this.composer.setPixelRatio(pr);
    // composer.setSize automatically computes effectiveWidth (width * pr)
    // and correctly invokes setSize(effectiveWidth, effectiveHeight) on all passes
    this.composer.setSize(width, height);
  }

  public render(): void {
    this.composer.render();
  }
}
