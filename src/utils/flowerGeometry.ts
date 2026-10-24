import * as THREE from 'three';

/**
 * Procedural geometry generators and textures for organic flower petals, florets, and foliage.
 */

// Cached procedural petal textures for memory and rendering efficiency
let _cachedRoseCoreTexture: THREE.CanvasTexture | null = null;
let _cachedRoseOuterTexture: THREE.CanvasTexture | null = null;

/**
 * Procedural HTML5 Canvas texture for rose petals:
 * - 4-stop botanical color gradient: creamy yellow base -> tender blush -> rich rose -> velvet crimson outer margin
 * - Radiating micro-veins fanning out from base (u=0.5, v=0.0) across petal body
 * - Subtle velvet micro-noise
 */
export function createRosePetalTexture(isCore: boolean = false): THREE.CanvasTexture {
  if (isCore && _cachedRoseCoreTexture) return _cachedRoseCoreTexture;
  if (!isCore && _cachedRoseOuterTexture) return _cachedRoseOuterTexture;

  if (typeof document === 'undefined') {
    const canvas = {} as HTMLCanvasElement;
    return new THREE.CanvasTexture(canvas);
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Base gradient along vertical axis (y from base to tip)
  const grad = ctx.createLinearGradient(size * 0.5, size, size * 0.5, 0);
  if (isCore) {
    // Tighter, warmer, creamier core
    grad.addColorStop(0.0, '#fffbeb'); // Ivory cream base
    grad.addColorStop(0.18, '#fef3c7'); // Warm primrose
    grad.addColorStop(0.52, '#fbcfe8'); // Delicate pink
    grad.addColorStop(0.82, '#f472b6'); // Rose pink
    grad.addColorStop(1.0, '#db2777'); // Deeper rose edge
  } else {
    // Opulent garden rose petal
    grad.addColorStop(0.0, '#fef9c3'); // Soft cream yellow base
    grad.addColorStop(0.18, '#fce7f3'); // Blush pink
    grad.addColorStop(0.55, '#f472b6'); // Radiant rose
    grad.addColorStop(0.88, '#e11d48'); // Carmine pink lip
    grad.addColorStop(1.0, '#be123c'); // Velvet crimson rim
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Radial micro-venation (fine veins radiating from attachment point at bottom-center)
  const centerX = size * 0.5;
  const baseY = size * 0.98;
  const veinCount = 84;

  ctx.save();
  for (let i = 0; i < veinCount; i++) {
    const angleRatio = (i / (veinCount - 1)) * 2.0 - 1.0; // [-1, 1]
    const targetAngle = -Math.PI * 0.5 + angleRatio * (Math.PI * 0.44); // Fan out upwards
    const length = size * (0.75 + Math.random() * 0.22);

    ctx.beginPath();
    ctx.moveTo(centerX + (Math.random() - 0.5) * 30, baseY);

    let curX = centerX;
    let curY = baseY;
    const segments = 12;
    for (let s = 1; s <= segments; s++) {
      const segT = s / segments;
      const r = length * segT;
      const angleJitter = Math.sin(s * 1.5 + i) * 0.035 * (1.0 - segT * 0.3);
      const px = centerX + Math.cos(targetAngle + angleJitter) * r;
      const py = baseY + Math.sin(targetAngle + angleJitter) * r;

      ctx.quadraticCurveTo(curX, curY, px, py);
      curX = px;
      curY = py;

      // Secondary fine branch
      if (s === 6 && Math.random() > 0.45) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(px, py);
        const branchAngle = targetAngle + (Math.random() > 0.5 ? 0.32 : -0.32);
        const bLen = length * 0.22;
        ctx.strokeStyle = 'rgba(255, 235, 245, 0.08)';
        ctx.lineWidth = 0.8;
        ctx.lineTo(px + Math.cos(branchAngle) * bLen, py + Math.sin(branchAngle) * bLen);
        ctx.stroke();
        ctx.restore();
      }
    }

    const alpha = (0.04 + (i % 3 === 0 ? 0.08 : 0.03)) * (1.0 - Math.abs(angleRatio) * 0.2);
    ctx.lineWidth = i % 4 === 0 ? 1.6 : 1.0;
    ctx.strokeStyle = i % 2 === 0 ? `rgba(180, 20, 60, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.stroke();
  }
  ctx.restore();

  // 3. Subtle velvet noise texture overlay
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let p = 0; p < data.length; p += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[p] = Math.min(255, Math.max(0, data[p] + noise));
    data[p + 1] = Math.min(255, Math.max(0, data[p + 1] + noise * 0.7));
    data[p + 2] = Math.min(255, Math.max(0, data[p + 2] + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  if (isCore) {
    _cachedRoseCoreTexture = texture;
  } else {
    _cachedRoseOuterTexture = texture;
  }
  return texture;
}

/**
 * High-detail botanical rose petal geometry:
 * - 32x32 vertex grid for silky smooth curvature without polygonal facets
 * - Compound Gaussian curvature: concave spoon dish + reflexed curling lip
 * - Natural organic tapering from stem insertion to scalloped apex
 */
export function createHighDetailPetalGeometry(
  width: number = 1.0,
  height: number = 1.3,
  cupDepth: number = 0.38,
  curlLip: number = 0.22,
  scallop: number = 0.06
): THREE.BufferGeometry {
  const segX = 32;
  const segY = 32;
  const geometry = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    // Normalized coordinates: u in [-1, 1], v in [0, 1]
    const u = x / (width * 0.5);
    const v = (y + height * 0.5) / height;

    // 1. Natural botanical petal silhouette tapering
    // Narrow base at attachment (v=0), swelling broadly at mid-upper (v=0.65), gently rounded rim (v=1)
    const contour = 0.26 + 0.74 * Math.pow(Math.sin(Math.min(v * 1.15, 1.0) * Math.PI * 0.82), 0.75);
    const shapedX = x * contour;

    // 2. Apical heart indentation
    const apexDip = -Math.cos(u * Math.PI) * scallop * Math.pow(v, 2.2);
    const shapedY = y + apexDip;

    // 3. Concave spoon dish depth (inward depression)
    const dish = -Math.sin(v * Math.PI) * (1.0 - 0.42 * u * u) * cupDepth;

    // 4. Reflexed outward curling lip at petal margins and tip (hallmark of garden roses)
    const lipCurl = curlLip * Math.pow(v, 1.9) * (1.0 - 0.35 * Math.abs(u));

    // 5. Delicate undulation along the petal periphery
    const edgeWave = Math.sin(u * Math.PI * 3.5) * 0.05 * Math.pow(v, 1.4);

    // 6. Lateral side wings curvature
    const lateralCurl = curlLip * 0.45 * (u * u) * Math.pow(v, 0.8);

    const shapedZ = dish + lipCurl + edgeWave + lateralCurl;

    pos.setXYZ(i, shapedX, shapedY, shapedZ);
  }

  geometry.computeVertexNormals();
  return geometry;
}

export function createRosePetalGeometry(
  width: number = 1.0,
  height: number = 1.3,
  cupDepth: number = 0.35,
  curlEdge: number = 0.18
): THREE.BufferGeometry {
  // Alias to high detail geometry with proportional parameters
  return createHighDetailPetalGeometry(width, height, cupDepth, curlEdge);
}

export function createCarnationPetalGeometry(
  width: number = 0.9,
  height: number = 1.0
): THREE.BufferGeometry {
  const segX = 24;
  const segY = 16;
  const geometry = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const normX = x / (width * 0.5);
    const normY = (y + height * 0.5) / height;

    // High frequency serrated ruffling on upper rim
    const ruffle = Math.sin(normX * Math.PI * 10.0) * Math.pow(normY, 1.5) * 0.16;
    const wave = Math.cos(normX * Math.PI * 4.0) * 0.12 * normY;

    pos.setX(i, x * (0.2 + 0.8 * Math.sqrt(normY)));
    pos.setZ(i, ruffle + wave);
  }

  geometry.computeVertexNormals();
  return geometry;
}

export function createFloretGeometry(radius: number = 0.5): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const petalCount = 5;

  for (let i = 0; i <= 60; i++) {
    const angle = (i / 60) * Math.PI * 2;
    // 5-petal sinusoidal modulation
    const r = radius * (0.45 + 0.55 * Math.abs(Math.sin((angle * petalCount) / 2)));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  const geometry = new THREE.ShapeGeometry(shape, 12);
  const pos = geometry.attributes.position;

  // Gentle central dishing
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const dist = Math.sqrt(px * px + py * py) / radius;
    pos.setZ(i, -Math.pow(1.0 - Math.min(dist, 1.0), 1.5) * 0.12);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Parametric seamless pleated origami wrapping paper mesh:
 * Continuous lofted surface with harmonic radial pleats, flared asymmetric backdrop,
 * and zero polygon seams or cracks.
 */
export function createSeamlessPleatedWrappingGeometry(
  heightSegments: number = 40,
  radialSegments: number = 64
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const yBottom = -4.2;

  for (let j = 0; j <= heightSegments; j++) {
    const v = j / heightSegments; // 0 (bottom) to 1 (top)

    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments;
      const theta = u * Math.PI * 2;

      // Asymmetric elevation: back (theta around PI) rises into a tall protective fan backdrop
      // front (theta around 0) cups the front focal rose to display the blooms gracefully
      const backFactor = 0.5 - 0.5 * Math.cos(theta); // 0 at front (theta=0), 1 at back (theta=PI)
      const sideFactor = Math.pow(Math.sin(theta), 2.0); // 0 at front/back, 1 at left/right flanks
      const yTopAtTheta = -0.08 + 3.6 * Math.pow(backFactor, 1.15) + 0.9 * sideFactor;
      const yElevation = yBottom + (yTopAtTheta - yBottom) * Math.pow(v, 0.95);

      // Base conical expansion with flared origami wings at sides and back
      const rBase = 0.55 + 0.9 * v + (1.6 + 1.2 * backFactor + 0.85 * sideFactor) * Math.pow(v, 1.7);

      // Harmonic radial origami pleats: 4 primary fanned wings (sides, back, front) + 8-wave creases
      const pleat = 1.0 + Math.pow(v, 0.7) * (
        0.24 * Math.cos(4.0 * theta) +
        0.10 * Math.cos(8.0 * theta) +
        0.05 * Math.sin(3.0 * theta)
      );

      // Back tilt / flare
      const r = rBase * pleat;
      const x = Math.sin(theta) * r;
      // Tilt backwards slightly towards top to frame the flowers
      const zOffset = -backFactor * v * 0.95 + (1.0 - backFactor) * v * 0.2;
      const z = Math.cos(theta) * r + zOffset;

      positions.push(x, yElevation, z);
      uvs.push(u, v);
    }
  }

  // Generate quad indices with consistent outward-facing CCW winding
  const ringSize = radialSegments + 1;
  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < radialSegments; i++) {
      const a = j * ringSize + i;
      const b = (j + 1) * ringSize + i;
      const c = (j + 1) * ringSize + (i + 1);
      const d = j * ringSize + (i + 1);

      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Inner crinkled white silk ruffle collar cradling the flower heads
 */
export function createSilkRuffleGeometry(
  segments: number = 48
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const rings = 8;
  for (let j = 0; j <= rings; j++) {
    const v = j / rings;

    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const theta = u * Math.PI * 2;
      const backFactor = 0.5 - 0.5 * Math.cos(theta);
      const sideFactor = Math.pow(Math.sin(theta), 2.0);
      const y = -0.65 + v * (0.6 + 1.4 * backFactor + 0.3 * sideFactor);

      // High frequency crinkle ruffles
      const ruffle = 1.0 + 0.15 * Math.sin(theta * 14.0) + 0.08 * Math.cos(theta * 7.0);
      const r = (1.3 + v * 1.0 + 0.35 * sideFactor) * ruffle;

      const x = Math.sin(theta) * r;
      const z = Math.cos(theta) * r * 0.95 + 0.1 * (1.0 - v);

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const ringSize = segments + 1;
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * ringSize + i;
      const b = (j + 1) * ringSize + i;
      const c = (j + 1) * ringSize + (i + 1);
      const d = j * ringSize + (i + 1);

      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createEucalyptusLeafGeometry(
  width: number = 0.85,
  height: number = 1.4
): THREE.BufferGeometry {
  const segX = 16;
  const segY = 20;
  const geometry = new THREE.PlaneGeometry(width, height, segX, segY);
  const pos = geometry.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const normX = x / (width * 0.5);
    const normY = (y + height * 0.5) / height;

    // Oval leaf profile
    const ovalFactor = Math.sin(normY * Math.PI);
    pos.setX(i, x * (0.2 + 0.8 * ovalFactor));

    // Midrib vein crease
    const veinCrease = -Math.abs(normX) * 0.14 * ovalFactor;
    // Longitudinal gentle bend
    const arch = -Math.sin(normY * Math.PI) * 0.18;

    pos.setZ(i, veinCrease + arch);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Flower materials with velvet specular responses
 */
export const FlowerMaterials = {
  rosePetalCore: new THREE.MeshStandardMaterial({
    map: createRosePetalTexture(true),
    roughness: 0.58,
    metalness: 0.02,
    side: THREE.DoubleSide
  }),
  rosePetalOuter: new THREE.MeshStandardMaterial({
    map: createRosePetalTexture(false),
    roughness: 0.60,
    metalness: 0.02,
    side: THREE.DoubleSide
  }),
  carnationCoral: new THREE.MeshStandardMaterial({
    color: 0xfb7185, // Vibrant pink carnation
    roughness: 0.72,
    metalness: 0.02,
    side: THREE.DoubleSide
  }),
  floretBlue: new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Sky delphinium blue
    roughness: 0.55,
    metalness: 0.08,
    side: THREE.DoubleSide
  }),
  floretCenter: new THREE.MeshStandardMaterial({
    color: 0xfef08a, // Soft golden pistil
    roughness: 0.45,
    metalness: 0.1
  }),
  eucalyptusGreen: new THREE.MeshStandardMaterial({
    color: 0x64748b, // Sage blue-green
    roughness: 0.75,
    metalness: 0.05,
    side: THREE.DoubleSide
  }),
  wrappingPaper: new THREE.MeshStandardMaterial({
    color: 0xfce7f3, // Soft luxury blush wrapping paper
    roughness: 0.78,
    metalness: 0.02,
    side: THREE.DoubleSide
  }),
  silkRuffle: new THREE.MeshStandardMaterial({
    color: 0xfffafb, // Crisp white crinkled silk tissue
    roughness: 0.85,
    metalness: 0.01,
    side: THREE.DoubleSide
  }),
  ribbonBurgundy: new THREE.MeshStandardMaterial({
    color: 0x881337, // Rich burgundy red satin
    roughness: 0.32,
    metalness: 0.28,
    side: THREE.DoubleSide
  })
};
