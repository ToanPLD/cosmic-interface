import * as THREE from 'three';
import {
  createRosePetalGeometry,
  createHighDetailPetalGeometry,
  createCarnationPetalGeometry,
  createFloretGeometry,
  createEucalyptusLeafGeometry,
  createSeamlessPleatedWrappingGeometry,
  createSilkRuffleGeometry,
  FlowerMaterials
} from '../utils/flowerGeometry';

export type CardState = 'docked' | 'hovered' | 'lifting' | 'floating' | 'returning';

export class FlowerBouquet extends THREE.Group {
  public flowerDome: THREE.Group;
  public wrappingGroup: THREE.Group;
  public ribbonGroup: THREE.Group;
  public greetingCard: THREE.Mesh;

  public cardState: CardState = 'docked';
  private cardHoverT: number = 0;
  private cardAnimProgress: number = 0;
  private cardAnimDuration: number = 0.75;
  private cardMat!: THREE.MeshStandardMaterial;

  private readonly defaultCardPos = new THREE.Vector3(-0.1, 2.9, -0.6);
  private readonly defaultCardRot = new THREE.Euler(-0.16, 0.06, -0.04);
  private readonly defaultCardQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.16, 0.06, -0.04));

  private targetFloatingPos = new THREE.Vector3();
  private targetFloatingQuat = new THREE.Quaternion();
  private controlPointPos = new THREE.Vector3();

  private onReadyToOpenModalCallback: (() => void) | null = null;
  private onReturnCompletedCallback: (() => void) | null = null;

  private cardSparkles!: THREE.Points;
  private sparkleVelocities: THREE.Vector3[] = [];
  private sparkleLife: number = 0;

  private roseGroups: THREE.Group[] = [];
  private carnationGroups: THREE.Group[] = [];
  private floretGroups: THREE.Group[] = [];
  private leafGroups: THREE.Group[] = [];

  constructor() {
    super();

    this.flowerDome = new THREE.Group();
    this.wrappingGroup = new THREE.Group();
    this.ribbonGroup = new THREE.Group();

    this.add(this.wrappingGroup);
    this.add(this.flowerDome);
    this.add(this.ribbonGroup);

    this.buildFlowers();
    this.buildWrappingPaper();
    this.buildRibbon();
    this.greetingCard = this.buildGreetingCard();
    this.add(this.greetingCard);

    this.cardSparkles = this.buildCardSparkles();
    this.add(this.cardSparkles);

    // Initial state: hidden during Phase 1
    this.visible = false;
  }

  /**
   * Constructs the full floral arrangement (Roses, Carnations, Blue Florets, Leaves)
   */
  private buildFlowers(): void {
    // 1. Seven Main Pink Roses arranged in a lush dome matching the reference image
    const rosePositions: [number, number, number, number, number, number, number][] = [
      [0.0, 1.8, 0.6, 0.25, 0.0, 0.0, 1.55], // Top center crowning rose
      [-1.3, 1.3, 0.8, 0.35, -0.35, 0.15, 1.45], // Left upper
      [1.3, 1.3, 0.7, 0.35, 0.35, -0.15, 1.45], // Right upper
      [-0.9, 0.35, 1.4, 0.55, -0.25, 0.1, 1.40], // Lower left front
      [0.9, 0.45, 1.3, 0.55, 0.25, -0.1, 1.40], // Lower right front
      [0.0, 0.15, 1.7, 0.65, 0.0, 0.0, 1.50], // Direct center front focal rose
      [0.0, 2.5, -0.3, 0.12, 0.0, 0.0, 1.50] // Upper back rose
    ];

    rosePositions.forEach(([x, y, z, rx, ry, rz, s]) => {
      const rose = this.createSingleRose(s);
      rose.position.set(x, y, z);
      rose.rotation.set(rx, ry, rz);
      this.flowerDome.add(rose);
      this.roseGroups.push(rose);
    });

    // 2. Ruffled Coral-Pink Carnations tucked between roses
    const carnationPositions: [number, number, number, number, number, number][] = [
      [-0.6, 1.0, 1.3, 0.45, -0.15, 1.25],
      [0.6, 1.1, 1.2, 0.45, 0.15, 1.25],
      [-1.8, 0.6, 0.9, 0.6, -0.5, 1.35],
      [1.7, 0.6, 0.8, 0.6, 0.5, 1.35],
      [-1.2, 2.1, -0.1, 0.2, -0.3, 1.25],
      [1.2, 2.1, 0.0, 0.2, 0.3, 1.25],
      [-0.1, -0.3, 1.8, 0.75, 0.0, 1.2],
      [0.0, 1.2, 0.4, 0.3, 0.0, 1.2]
    ];

    carnationPositions.forEach(([x, y, z, rx, ry, s]) => {
      const carnation = this.createSingleCarnation(s);
      carnation.position.set(x, y, z);
      carnation.rotation.set(rx, ry, 0.0);
      this.flowerDome.add(carnation);
      this.carnationGroups.push(carnation);
    });

    // 3. Small Sky-Blue Florets (Delphinium / Hydrangea accents)
    const floretCoords: [number, number, number][] = [
      [-0.6, 1.6, 1.3],
      [0.7, 1.7, 1.2],
      [-1.6, 1.1, 1.2],
      [1.6, 1.0, 1.1],
      [-0.8, 2.3, 0.4],
      [0.8, 2.4, 0.3],
      [-2.1, 0.9, 0.6],
      [2.0, 0.8, 0.5],
      [-0.4, -0.1, 1.8],
      [0.5, -0.2, 1.7],
      [-1.8, 1.7, 0.1],
      [1.9, 1.6, 0.1],
      [-0.2, 2.7, -0.1],
      [0.0, 0.9, 1.6],
      [-1.2, 0.1, 1.6],
      [1.2, 0.0, 1.5],
      [-0.1, 1.5, 1.4],
      [0.0, 2.0, 0.8]
    ];

    const floretGeo = createFloretGeometry(0.38);
    const centerGeo = new THREE.SphereGeometry(0.08, 8, 8);

    floretCoords.forEach(([x, y, z]) => {
      const floretGroup = new THREE.Group();
      const petalsMesh = new THREE.Mesh(floretGeo, FlowerMaterials.floretBlue);
      const centerMesh = new THREE.Mesh(centerGeo, FlowerMaterials.floretCenter);
      centerMesh.position.z = 0.04;
      floretGroup.add(petalsMesh);
      floretGroup.add(centerMesh);

      floretGroup.position.set(x, y, z);
      floretGroup.lookAt(new THREE.Vector3(x * 2.2, y * 2.2, z * 2.2 + 0.5));
      this.flowerDome.add(floretGroup);
      this.floretGroups.push(floretGroup);
    });

    // 4. Eucalyptus foliage framing the upper perimeter and crown of the bouquet
    const leafCoords: [number, number, number, number, number, number][] = [
      [-2.2, 1.6, 0.3, 0.2, -0.7, 0.4],
      [-2.0, 2.1, -0.2, 0.1, -0.8, 0.5],
      [2.2, 1.5, 0.2, 0.2, 0.7, -0.4],
      [2.0, 2.0, -0.2, 0.1, 0.8, -0.5],
      [-1.5, 2.7, -0.3, -0.2, -0.5, 0.6],
      [1.4, 2.8, -0.4, -0.2, 0.5, -0.6],
      [-0.9, 2.4, 0.8, 0.3, -0.3, 0.3],
      [0.9, 2.3, 0.7, 0.3, 0.3, -0.3],
      [-1.8, 1.2, 0.8, 0.4, -0.6, 0.2],
      [1.8, 1.1, 0.8, 0.4, 0.6, -0.2],
      [-0.4, 2.9, 0.0, -0.1, 0.0, 0.1],
      [0.4, 2.9, -0.1, -0.1, 0.0, -0.1]
    ];

    const leafGeo = createEucalyptusLeafGeometry(0.75, 1.3);
    leafCoords.forEach(([x, y, z, rx, ry, rz]) => {
      const leaf = new THREE.Mesh(leafGeo, FlowerMaterials.eucalyptusGreen);
      leaf.position.set(x, y, z);
      leaf.rotation.set(rx, ry, rz);
      this.flowerDome.add(leaf);
      this.leafGroups.push(leaf as unknown as THREE.Group);
    });
  }

  /**
   * Generates a dense, multi-layered 32-petal English Garden / Peony Rose blossom
   * organized across 4 botanical whorls with zero hollow core gaps.
   */
  private createSingleRose(overallScale: number = 1.0): THREE.Group {
    const rose = new THREE.Group();
    const s = overallScale;

    // 1. Center floral receptacle dome to prevent any hollow black hole at the blossom core
    const centerReceptacleGeo = new THREE.SphereGeometry(0.14 * s, 12, 12);
    centerReceptacleGeo.scale(1.0, 0.6, 1.0);
    const centerReceptacleMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Soft warm pistil gold
      roughness: 0.7,
      metalness: 0.0
    });
    const centerReceptacle = new THREE.Mesh(centerReceptacleGeo, centerReceptacleMat);
    centerReceptacle.position.set(0, -0.05 * s, 0);
    rose.add(centerReceptacle);

    // Shared high-detail geometries for the 4 concentric whorls (32 petals total)
    const coreGeo = createHighDetailPetalGeometry(0.65 * s, 0.88 * s, 0.44 * s, 0.14 * s, 0.04 * s);
    const innerGeo = createHighDetailPetalGeometry(0.85 * s, 1.10 * s, 0.40 * s, 0.20 * s, 0.06 * s);
    const midGeo = createHighDetailPetalGeometry(1.05 * s, 1.28 * s, 0.35 * s, 0.24 * s, 0.07 * s);
    const outerGeo = createHighDetailPetalGeometry(1.25 * s, 1.45 * s, 0.30 * s, 0.28 * s, 0.08 * s);

    // Whorl 1: Core Scroll Center (6 petals, tightly spiraled)
    const coreCount = 6;
    for (let i = 0; i < coreCount; i++) {
      const angle = (i / coreCount) * Math.PI * 2 + 0.12 * Math.sin(i);
      const radius = 0.07 * s;
      const petal = new THREE.Mesh(coreGeo, FlowerMaterials.rosePetalCore);
      petal.position.set(Math.cos(angle) * radius, -0.02 * s, Math.sin(angle) * radius);
      petal.rotation.y = -angle + Math.PI * 0.5 + 0.25;
      petal.rotation.x = 0.22 + (i % 2) * 0.05;
      rose.add(petal);
    }

    // Whorl 2: Inner Chalice Cup (8 petals, upright protective layer)
    const innerCount = 8;
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2 + 0.25;
      const radius = 0.17 * s;
      const petal = new THREE.Mesh(innerGeo, FlowerMaterials.rosePetalCore);
      petal.position.set(Math.cos(angle) * radius, -0.06 * s, Math.sin(angle) * radius);
      petal.rotation.y = -angle + Math.PI * 0.5;
      petal.rotation.x = 0.44 + (i % 2) * 0.08;
      rose.add(petal);
    }

    // Whorl 3: Mid Bloom Body (10 petals, spreading and cupping)
    const midCount = 10;
    for (let i = 0; i < midCount; i++) {
      const angle = (i / midCount) * Math.PI * 2 + 0.15;
      const radius = 0.30 * s;
      const petal = new THREE.Mesh(midGeo, FlowerMaterials.rosePetalOuter);
      petal.position.set(Math.cos(angle) * radius, -0.12 * s, Math.sin(angle) * radius);
      petal.rotation.y = -angle + Math.PI * 0.5;
      petal.rotation.x = 0.68 + (i % 2) * 0.06;
      rose.add(petal);
    }

    // Whorl 4: Base Reflexed Skirt (8 petals, broad downward curled margins)
    const outerCount = 8;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2 + 0.4;
      const radius = 0.44 * s;
      const petal = new THREE.Mesh(outerGeo, FlowerMaterials.rosePetalOuter);
      petal.position.set(Math.cos(angle) * radius, -0.19 * s, Math.sin(angle) * radius);
      petal.rotation.y = -angle + Math.PI * 0.5;
      petal.rotation.x = 0.96 + (i % 2) * 0.08;
      rose.add(petal);
    }

    // Underlying Calyx Sepals (5 green pointed sepals cradling the blossom)
    const sepalGeo = createEucalyptusLeafGeometry(0.35 * s, 0.7 * s);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const sepal = new THREE.Mesh(sepalGeo, FlowerMaterials.eucalyptusGreen);
      sepal.position.set(Math.cos(angle) * 0.32 * s, -0.24 * s, Math.sin(angle) * 0.32 * s);
      sepal.rotation.y = -angle + Math.PI * 0.5;
      sepal.rotation.x = 1.35; // Downward pointing sepal
      rose.add(sepal);
    }

    return rose;
  }

  /**
   * Generates a ruffled carnation blossom
   */
  private createSingleCarnation(overallScale: number = 1.0): THREE.Group {
    const carnation = new THREE.Group();
    const petalCount = 16;

    for (let i = 0; i < petalCount; i++) {
      const angle = i * (Math.PI * 2 / petalCount) + (i % 2) * 0.3;
      const radius = 0.15 + (i % 3) * 0.12;
      const scale = (0.58 + (i % 3) * 0.2) * overallScale;

      const cGeo = createCarnationPetalGeometry(0.8 * scale, 0.95 * scale);
      const petal = new THREE.Mesh(cGeo, FlowerMaterials.carnationCoral);

      petal.position.set(Math.cos(angle) * radius, 0.05 * (i % 3), Math.sin(angle) * radius);
      petal.rotation.y = angle;
      petal.rotation.x = 0.4 + (i % 2) * 0.2;
      carnation.add(petal);
    }

    return carnation;
  }

  /**
   * Constructs the continuous pleated origami wrapping paper and inner silk ruffle collar
   */
  private buildWrappingPaper(): void {
    // 1. Continuous parametric pleated origami wrapping paper mesh (zero seams or polygonal cracks)
    const wrapGeo = createSeamlessPleatedWrappingGeometry(48, 64);
    const wrapMesh = new THREE.Mesh(wrapGeo, FlowerMaterials.wrappingPaper);
    wrapMesh.position.set(0, 0.0, 0.0);
    wrapMesh.rotation.x = 0.05;
    this.wrappingGroup.add(wrapMesh);

    // 2. Inner crinkled white silk ruffle collar cradling the flower stems
    const ruffleGeo = createSilkRuffleGeometry(48);
    const ruffleMesh = new THREE.Mesh(ruffleGeo, FlowerMaterials.silkRuffle);
    ruffleMesh.position.set(0, 0.15, 0.05);
    ruffleMesh.rotation.x = 0.05;
    this.wrappingGroup.add(ruffleMesh);
  }

  /**
   * Constructs the burgundy red satin ribbon collar and bow at the front waist
   */
  private buildRibbon(): void {
    // Ribbon collar wrapped around waist
    const collarGeo = new THREE.TorusGeometry(1.15, 0.1, 12, 32);
    const collar = new THREE.Mesh(collarGeo, FlowerMaterials.ribbonBurgundy);
    collar.position.set(0, -1.9, 0.35);
    collar.rotation.x = Math.PI * 0.45;
    this.ribbonGroup.add(collar);

    // Bow loops in front (+Z)
    const loopGeo = new THREE.TorusGeometry(0.62, 0.11, 14, 28);
    loopGeo.scale(1.45, 0.7, 0.7);

    const leftLoop = new THREE.Mesh(loopGeo, FlowerMaterials.ribbonBurgundy);
    leftLoop.position.set(-0.56, -1.9, 1.48);
    leftLoop.rotation.set(0.12, -0.4, 0.3);
    this.ribbonGroup.add(leftLoop);

    const rightLoop = new THREE.Mesh(loopGeo, FlowerMaterials.ribbonBurgundy);
    rightLoop.position.set(0.56, -1.9, 1.48);
    rightLoop.rotation.set(0.12, 0.4, -0.3);
    this.ribbonGroup.add(rightLoop);

    // Knot center
    const knotGeo = new THREE.SphereGeometry(0.24, 14, 14);
    knotGeo.scale(1.25, 1.05, 0.85);
    const knot = new THREE.Mesh(knotGeo, FlowerMaterials.ribbonBurgundy);
    knot.position.set(0, -1.9, 1.60);
    this.ribbonGroup.add(knot);

    // Trailing ribbon tails
    const tailGeo = new THREE.PlaneGeometry(0.40, 2.6, 8, 16);
    const tailPos = tailGeo.attributes.position;
    for (let i = 0; i < tailPos.count; i++) {
      const y = tailPos.getY(i);
      const normY = (1.3 - y) / 2.6;
      tailPos.setZ(i, Math.sin(normY * Math.PI * 2.2) * 0.25);
    }
    tailGeo.computeVertexNormals();

    const leftTail = new THREE.Mesh(tailGeo, FlowerMaterials.ribbonBurgundy);
    leftTail.position.set(-0.32, -3.1, 1.45);
    leftTail.rotation.set(0.1, 0.18, 0.2);
    this.ribbonGroup.add(leftTail);

    const rightTail = new THREE.Mesh(tailGeo, FlowerMaterials.ribbonBurgundy);
    rightTail.position.set(0.32, -3.1, 1.45);
    rightTail.rotation.set(0.1, -0.18, -0.2);
    this.ribbonGroup.add(rightTail);
  }

  /**
   * Generates the "LUCKY TO HAVE YOU" greeting card
   */
  private buildGreetingCard(): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    // Soft blush marble / watercolor background
    const grad = ctx.createLinearGradient(0, 0, 1024, 768);
    grad.addColorStop(0, '#fdf2f8');
    grad.addColorStop(0.5, '#fce7f3');
    grad.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 768);

    // Elegant border framing
    ctx.strokeStyle = 'rgba(136, 19, 55, 0.4)';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 1024 - 72, 768 - 72);

    // Inner gold decorative line
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, 1024 - 96, 768 - 96);

    // Corner decorative flourishes
    ctx.strokeStyle = 'rgba(190, 18, 60, 0.45)';
    ctx.lineWidth = 3;
    const corners = [
      [64, 64, 104, 64, 64, 104],
      [960, 64, 920, 64, 960, 104],
      [64, 704, 104, 704, 64, 664],
      [960, 704, 920, 704, 960, 664]
    ];
    for (const [x1, y1, x2, y2, x3, y3] of corners) {
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }

    // Top subtle label
    ctx.fillStyle = '#b45309';
    ctx.font = '600 24px "Cinzel", "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPECIAL GIFT 20/11', 512, 260);

    // Headline: "LUCKY TO HAVE YOU"
    ctx.fillStyle = '#881337';
    ctx.font = 'bold 78px "Playfair Display", "Georgia", serif';
    ctx.textAlign = 'center';
    ctx.fillText('LUCKY TO HAVE YOU', 512, 360);

    // Romantic script subtitle
    ctx.fillStyle = '#4c0519';
    ctx.font = 'italic 34px "Cinzel", "Georgia", serif';
    ctx.fillText('your gentleness and kindness', 512, 435);
    ctx.fillText('deserves to be cherished', 512, 485);

    // Bottom decorative button badge
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.roundRect(312, 570, 400, 56, 28);
    ctx.fill();

    ctx.fillStyle = '#fff1f2';
    ctx.font = '600 22px "Montserrat", sans-serif';
    ctx.fillText('💌 Chạm để mở bức thư 🌷', 512, 606);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const cardGeo = new THREE.PlaneGeometry(3.8, 2.8);
    const cardMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.68,
      metalness: 0.06,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
      side: THREE.DoubleSide
    });
    this.cardMat = cardMat;

    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    // Positioned in upper back, facing forward (+Z) so it is clearly readable from the front
    cardMesh.position.copy(this.defaultCardPos);
    cardMesh.rotation.copy(this.defaultCardRot);
    return cardMesh;
  }

  /**
   * Sparkle burst particles radiating from the card
   */
  private buildCardSparkles(): THREE.Points {
    const count = 48;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    this.sparkleVelocities = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const colorType = i % 3;
      if (colorType === 0) {
        colors[i * 3 + 0] = 1.0; colors[i * 3 + 1] = 0.94; colors[i * 3 + 2] = 0.54; // gold
      } else if (colorType === 1) {
        colors[i * 3 + 0] = 0.96; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.71; // pink
      } else {
        colors[i * 3 + 0] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0; // warm white
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 1.6 + Math.random() * 3.2;
      this.sparkleVelocities.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.abs(Math.cos(phi)) * speed * 1.3 + 0.8,
          Math.sin(phi) * Math.sin(theta) * speed
        )
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    points.visible = false;
    return points;
  }

  private triggerCardSparkles(origin: THREE.Vector3): void {
    if (!this.cardSparkles) return;
    this.cardSparkles.position.copy(origin);
    this.cardSparkles.visible = true;
    this.sparkleLife = 1.0;

    const posAttr = this.cardSparkles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    arr.fill(0);
    posAttr.needsUpdate = true;
  }

  private updateCardSparkles(deltaTime: number): void {
    if (!this.cardSparkles || this.sparkleLife <= 0) return;

    this.sparkleLife -= deltaTime * 1.35;
    const mat = this.cardSparkles.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, Math.min(1.0, this.sparkleLife));

    const posAttr = this.cardSparkles.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < this.sparkleVelocities.length; i++) {
      const vel = this.sparkleVelocities[i];
      arr[i * 3 + 0] += vel.x * deltaTime;
      arr[i * 3 + 1] += vel.y * deltaTime;
      arr[i * 3 + 2] += vel.z * deltaTime;
      vel.y -= 1.8 * deltaTime; // gravity
    }
    posAttr.needsUpdate = true;

    if (this.sparkleLife <= 0) {
      this.cardSparkles.visible = false;
    }
  }

  /**
   * Hover control
   */
  public setCardHover(hovered: boolean): void {
    if (this.cardState === 'lifting' || this.cardState === 'floating' || this.cardState === 'returning') {
      return;
    }
    this.cardState = hovered ? 'hovered' : 'docked';
  }

  public getCardState(): CardState {
    return this.cardState;
  }

  /**
   * Triggers the 3D card lifting animation towards the camera
   */
  public openCard(cameraPos: THREE.Vector3, onReadyToOpenModal?: () => void): void {
    if (this.cardState === 'lifting' || this.cardState === 'floating') return;

    this.cardState = 'lifting';
    this.cardAnimProgress = 0;
    this.onReadyToOpenModalCallback = onReadyToOpenModal || null;

    // Sightline vector from bouquet center towards camera
    const dirToCam = cameraPos.clone().sub(new THREE.Vector3(0, 2.0, 0)).normalize();

    // Target floating position: pulled toward camera proportionately to camera distance
    const camDist = cameraPos.length();
    const pullDist = camDist > 20 ? 8.5 : 5.2;
    const liftY = camDist > 20 ? 2.3 : 2.8;
    this.targetFloatingPos.set(0, liftY, 0).addScaledVector(dirToCam, pullDist);

    // Orient card to face camera directly
    const dummy = new THREE.Object3D();
    dummy.position.copy(this.targetFloatingPos);
    dummy.lookAt(cameraPos);
    this.targetFloatingQuat.copy(dummy.quaternion);

    // Control point for smooth curved upward-arcing motion over front roses
    this.controlPointPos.copy(this.defaultCardPos)
      .add(new THREE.Vector3(0, 1.6, 0))
      .addScaledVector(dirToCam, 1.8);

    // Trigger magical sparkle burst around initial card position
    this.triggerCardSparkles(this.defaultCardPos.clone().add(new THREE.Vector3(0, 0.8, 0)));
  }

  /**
   * Triggers the 3D card returning animation back into the bouquet pocket
   */
  public closeCard(onCompleted?: () => void): void {
    if (this.cardState === 'returning' || this.cardState === 'docked') return;

    this.cardState = 'returning';
    this.cardAnimProgress = 0;
    this.onReturnCompletedCallback = onCompleted || null;
  }

  /**
   * Updates bouquet visibility and expansion based on assembly timeline,
   * keeping the completed bouquet intact once assembled.
   */
  public update(assemblyTime: number, continuousTime: number = assemblyTime, deltaTime: number = 0.016): void {
    // Phase 1 (0s - 4s): Center is empty
    if (assemblyTime < 4.0) {
      this.visible = false;
      return;
    }

    this.visible = true;

    // Phase 2 (4s - 8s): Flowers bloom and scale up
    const bloomT = THREE.MathUtils.clamp((assemblyTime - 4.0) / 4.0, 0.0, 1.0);
    const easedBloom = THREE.MathUtils.smoothstep(bloomT, 0.0, 1.0);
    this.flowerDome.scale.setScalar(easedBloom);

    // Phase 3 (8s - 11s): Wrapping and ribbon animate in
    const wrapT = THREE.MathUtils.clamp((assemblyTime - 8.0) / 3.0, 0.0, 1.0);
    const easedWrap = THREE.MathUtils.smoothstep(wrapT, 0.0, 1.0);
    this.wrappingGroup.scale.setScalar(easedWrap);
    this.ribbonGroup.scale.setScalar(easedWrap);

    // Phase 4 (11s+): Gentle breathing sway using continuous runtime clock
    if (assemblyTime >= 11.0) {
      const breath = Math.sin(continuousTime * 1.5) * 0.015;
      this.flowerDome.position.y = breath;
    }

    // Update Sparkle particles
    this.updateCardSparkles(deltaTime);

    // Update Card Interactive Animation State Machine
    this.updateCardAnimation(easedWrap, continuousTime, deltaTime);
  }

  private updateCardAnimation(easedWrap: number, continuousTime: number, deltaTime: number): void {
    const targetHover = (this.cardState === 'hovered') ? 1.0 : 0.0;
    this.cardHoverT += (targetHover - this.cardHoverT) * Math.min(1.0, deltaTime * 12.0);

    if (this.cardMat) {
      this.cardMat.emissive.set(0xf472b6);
      this.cardMat.emissiveIntensity = this.cardHoverT * 0.35;
    }

    if (this.cardState === 'docked' || this.cardState === 'hovered') {
      const hoverY = this.cardHoverT * 0.28;
      const hoverZ = this.cardHoverT * 0.12;
      this.greetingCard.position.set(
        this.defaultCardPos.x,
        this.defaultCardPos.y + hoverY,
        this.defaultCardPos.z + hoverZ
      );
      this.greetingCard.rotation.copy(this.defaultCardRot);
      const scaleVal = easedWrap * (1.0 + this.cardHoverT * 0.06);
      this.greetingCard.scale.setScalar(scaleVal);
      return;
    }

    if (this.cardState === 'lifting') {
      this.cardAnimProgress += deltaTime / this.cardAnimDuration;
      const p = Math.min(1.0, this.cardAnimProgress);
      // Cubic ease-out
      const easeT = 1.0 - Math.pow(1.0 - p, 3);

      const u = 1.0 - easeT;
      const tt = easeT * easeT;
      const uu = u * u;
      const pos = new THREE.Vector3()
        .addScaledVector(this.defaultCardPos, uu)
        .addScaledVector(this.controlPointPos, 2 * u * easeT)
        .addScaledVector(this.targetFloatingPos, tt);

      this.greetingCard.position.copy(pos);
      this.greetingCard.quaternion.slerpQuaternions(this.defaultCardQuat, this.targetFloatingQuat, easeT);
      const scaleVal = THREE.MathUtils.lerp(1.0, 1.38, easeT);
      this.greetingCard.scale.setScalar(scaleVal);

      if (p >= 1.0) {
        this.cardState = 'floating';
        if (this.onReadyToOpenModalCallback) {
          const cb = this.onReadyToOpenModalCallback;
          this.onReadyToOpenModalCallback = null;
          cb();
        }
      }
      return;
    }

    if (this.cardState === 'floating') {
      const floatBreathY = Math.sin(continuousTime * 2.0) * 0.03;
      this.greetingCard.position.copy(this.targetFloatingPos);
      this.greetingCard.position.y += floatBreathY;
      this.greetingCard.quaternion.copy(this.targetFloatingQuat);
      this.greetingCard.scale.setScalar(1.38);
      return;
    }

    if (this.cardState === 'returning') {
      this.cardAnimProgress += deltaTime / 0.65;
      const p = Math.min(1.0, this.cardAnimProgress);
      // Smooth ease-in-out
      const easeT = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      const u = 1.0 - easeT;
      const tt = easeT * easeT;
      const uu = u * u;
      const pos = new THREE.Vector3()
        .addScaledVector(this.targetFloatingPos, uu)
        .addScaledVector(this.controlPointPos, 2 * u * easeT)
        .addScaledVector(this.defaultCardPos, tt);

      this.greetingCard.position.copy(pos);
      this.greetingCard.quaternion.slerpQuaternions(this.targetFloatingQuat, this.defaultCardQuat, easeT);
      const scaleVal = THREE.MathUtils.lerp(1.38, 1.0, easeT);
      this.greetingCard.scale.setScalar(scaleVal);

      if (p >= 1.0) {
        this.cardState = 'docked';
        this.cardHoverT = 0;
        this.greetingCard.position.copy(this.defaultCardPos);
        this.greetingCard.rotation.copy(this.defaultCardRot);
        this.greetingCard.scale.setScalar(1.0);
        if (this.onReturnCompletedCallback) {
          const cb = this.onReturnCompletedCallback;
          this.onReturnCompletedCallback = null;
          cb();
        }
      }
      return;
    }
  }
}
