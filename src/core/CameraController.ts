import * as THREE from 'three';

export interface CameraControllerOptions {
  radius?: number;
  height?: number;
  heightAmplitude?: number;
  loopPeriod?: number; // seconds, default 16.0
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

  private autoOrbit: boolean = true;
  private isPointerDown: boolean = false;
  private hasUserInteracted: boolean = false;
  private isModalOpen: boolean = false;

  // Active pointer tracking for multi-touch (drag & pinch zoom)
  private activePointers = new Map<number, { x: number; y: number }>();
  private primaryPointerId: number | null = null;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;
  private lastDragTime: number = 0;
  private initialPinchDist: number = 0;
  private zoomScale: number = 1.0;
  private initialZoomScale: number = 1.0;

  // Orbit angles & smooth auto-rotation
  private orbitAngle: number = 0;
  private orbitPitch: number = 0; // vertical tilt clamped to safe visual range
  private defaultAutoSpeed: number = (Math.PI * 2.0) / 28.0; // ~0.224 rad/s (28s per 360 deg)
  private orbitVelocity: number = (Math.PI * 2.0) / 28.0;

  constructor(camera: THREE.PerspectiveCamera, options: CameraControllerOptions = {}) {
    this.camera = camera;
    this.radius = options.radius ?? 15.0;
    this.baseHeight = options.height ?? 2.8;
    this.heightAmplitude = options.heightAmplitude ?? 0.8;
    this.loopPeriod = options.loopPeriod ?? 16.0;
    this.lookAtTarget = options.lookAtTarget ?? new THREE.Vector3(0, 0.6, 0);

    this.bindEvents();
  }

  public getResponsiveRadius(): number {
    if (typeof window === 'undefined') return this.radius;
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect >= 1.35) {
      return this.radius; // Desktop: 15.0
    }
    // Portrait mobile / tablet: scale camera distance so the bouquet fits screen width
    const targetScale = Math.min(1.85, Math.max(1.0, 0.82 / Math.max(aspect, 0.42)));
    return this.radius * targetScale;
  }

  public getResponsiveHeight(): number {
    if (typeof window === 'undefined') return this.baseHeight;
    const aspect = window.innerWidth / window.innerHeight;
    return aspect < 1.0 ? 1.8 : this.baseHeight;
  }

  public getResponsiveLookAt(): THREE.Vector3 {
    if (typeof window === 'undefined') return this.lookAtTarget;
    const aspect = window.innerWidth / window.innerHeight;
    return aspect < 1.0 ? new THREE.Vector3(0, 0.25, 0) : this.lookAtTarget;
  }

  private bindEvents(): void {
    if (typeof window === 'undefined') return;

    // Pointer Down (Mouse click or finger touch)
    window.addEventListener('pointerdown', (e: PointerEvent) => {
      // Ignore clicks on UI elements (letter modal, audio player, playlist, etc.)
      if ((e.target as HTMLElement)?.closest?.('.ui-interactive')) return;

      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.hasUserInteracted = true;

      if (this.activePointers.size === 1) {
        this.primaryPointerId = e.pointerId;
        this.isPointerDown = true;
        this.prevPointerX = e.clientX;
        this.prevPointerY = e.clientY;
        this.lastDragTime = performance.now();
      } else if (this.activePointers.size === 2) {
        // Two fingers -> pinch zoom
        const pts = Array.from(this.activePointers.values());
        this.initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        this.initialZoomScale = this.zoomScale;
      }
    });

    // Pointer Move
    window.addEventListener('pointermove', (e: PointerEvent) => {
      this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (!this.activePointers.has(e.pointerId)) return;
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.activePointers.size === 1 && this.primaryPointerId === e.pointerId) {
        const now = performance.now();
        const dt = Math.max((now - this.lastDragTime) / 1000, 0.001);
        const deltaX = e.clientX - this.prevPointerX;
        const deltaY = e.clientY - this.prevPointerY;

        // Rotate orbit angle horizontally
        this.orbitAngle -= deltaX * 0.0065;

        // Tilt pitch vertically (clamped so bouquet remains beautifully centered)
        this.orbitPitch = Math.max(-0.45, Math.min(0.85, this.orbitPitch + deltaY * 0.004));

        // Velocity tracking for natural inertia when released
        const instantVel = -deltaX * 0.0065 / dt;
        this.orbitVelocity = Math.max(-2.5, Math.min(2.5, instantVel));

        this.prevPointerX = e.clientX;
        this.prevPointerY = e.clientY;
        this.lastDragTime = now;
      } else if (this.activePointers.size === 2 && this.initialPinchDist > 0) {
        // Pinch zoom
        const pts = Array.from(this.activePointers.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const pinchRatio = this.initialPinchDist / Math.max(currentDist, 1);
        this.zoomScale = Math.max(0.65, Math.min(1.6, this.initialZoomScale * pinchRatio));
      }
    });

    // Pointer Up & Cancel
    const onPointerRelease = (e: PointerEvent) => {
      this.activePointers.delete(e.pointerId);

      if (this.activePointers.size === 0) {
        this.isPointerDown = false;
        this.primaryPointerId = null;
        this.initialPinchDist = 0;
      } else if (this.activePointers.size === 1) {
        const [remainingId, pt] = Array.from(this.activePointers.entries())[0];
        this.primaryPointerId = remainingId;
        this.prevPointerX = pt.x;
        this.prevPointerY = pt.y;
        this.lastDragTime = performance.now();
      }
    };

    window.addEventListener('pointerup', onPointerRelease);
    window.addEventListener('pointercancel', onPointerRelease);

    // Mouse wheel zoom
    window.addEventListener('wheel', (e: WheelEvent) => {
      if ((e.target as HTMLElement)?.closest?.('.ui-interactive')) return;
      const zoomDelta = e.deltaY * 0.0006;
      this.zoomScale = Math.max(0.65, Math.min(1.6, this.zoomScale + zoomDelta));
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.targetMouseX = 0;
      this.targetMouseY = 0;
    });
  }

  public toggleAutoOrbit(): boolean {
    this.autoOrbit = !this.autoOrbit;
    return this.autoOrbit;
  }

  public isAutoOrbiting(): boolean {
    return this.autoOrbit;
  }

  public setAutoOrbit(auto: boolean): void {
    this.autoOrbit = auto;
  }

  public setModalOpen(isOpen: boolean): void {
    this.isModalOpen = isOpen;
  }

  public getModalOpen(): boolean {
    return this.isModalOpen;
  }

  public update(assemblyTime: number, deltaTime: number, _continuousTime: number = assemblyTime): void {
    const lerpFactor = Math.min(1.0, deltaTime * 2.5);
    this.mouseX += (this.targetMouseX - this.mouseX) * lerpFactor;
    this.mouseY += (this.targetMouseY - this.mouseY) * lerpFactor;

    if (this.isPointerDown) {
      // User is holding / dragging: bleed off release velocity if stationary for > 90ms
      const now = performance.now();
      if (now - this.lastDragTime > 90) {
        this.orbitVelocity *= Math.max(0, 1.0 - deltaTime * 8.0);
      }
    } else if (this.isModalOpen) {
      // Calm steady camera view while reading letter modal
      this.orbitVelocity = 0;
    } else {
      // Hand / mouse released (not touching)
      if (!this.hasUserInteracted && assemblyTime <= 10.5) {
        // Front focal view with gentle romantic sway during initial flower assembly
        this.orbitAngle = Math.sin(assemblyTime * 0.45) * 0.18;
      } else if (this.autoOrbit) {
        // Smoothly blend release velocity back to default gentle clockwise orbit speed
        this.orbitVelocity += (this.defaultAutoSpeed - this.orbitVelocity) * Math.min(1.0, deltaTime * 2.2);
        this.orbitAngle += this.orbitVelocity * deltaTime;

        // Very slow, subtle relaxation of pitch towards level eye-height
        this.orbitPitch += (0 - this.orbitPitch) * Math.min(1.0, deltaTime * 0.12);
      }
    }

    // Gentle organic vertical floating bobbing
    const organicBobbing = Math.sin(this.orbitAngle * 1.5) * (this.heightAmplitude * 0.4);
    const pitchHeight = this.orbitPitch * 3.8 + organicBobbing;

    // Interactive subtle parallax offset from mouse position (relaxed when dragging)
    const parallaxRadius = this.isPointerDown ? 0 : this.mouseX * 1.2;
    const parallaxHeight = this.isPointerDown ? 0 : this.mouseY * 0.8;

    const responsiveRadius = this.getResponsiveRadius() * this.zoomScale;
    const responsiveBaseHeight = this.getResponsiveHeight();
    const responsiveLookAt = this.getResponsiveLookAt();

    const currentRadius = responsiveRadius + parallaxRadius;
    const x = Math.sin(this.orbitAngle) * currentRadius;
    const z = Math.cos(this.orbitAngle) * currentRadius;
    const y = responsiveBaseHeight + pitchHeight + parallaxHeight;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(responsiveLookAt);
  }
}
