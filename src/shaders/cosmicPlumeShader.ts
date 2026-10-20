import * as THREE from 'three';

export const CosmicPlumeShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorCore: { value: new THREE.Color(0xffffff) },
    uColorMid: { value: new THREE.Color(0x00e5ff) },
    uColorDeep: { value: new THREE.Color(0x1d4ed8) },
    uIntensity: { value: 2.8 }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorDeep;
    uniform float uIntensity;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    // Simplex noise helper
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Inflow along tube length (U coordinate)
      // Harmonic 12s period loop: speed = 1.0 / 12.0
      float flowSpeed = 6.28318530718 / 12.0 * 0.8;
      float uCoord = vUv.x * 3.0 - uTime * flowSpeed;
      float vCoord = vUv.y * 2.0;

      // Layered noise for cosmic cloud turbulence
      float n1 = snoise(vec2(uCoord * 1.5, vCoord * 2.0)) * 0.5 + 0.5;
      float n2 = snoise(vec2(uCoord * 3.5, vCoord * 4.0 + n1 * 1.5)) * 0.5 + 0.5;
      float turbulence = n1 * 0.6 + n2 * 0.4;

      // Cross-sectional feathering: brightest in center, soft on tube edges
      float radialEdge = sin(vUv.y * 3.14159265);
      float coreFactor = pow(radialEdge, 2.2);

      // Longitudinal intensity: denser and hotter as it approaches the singularity (vUv.x -> 1.0)
      float approachHotness = pow(vUv.x, 1.5);
      float startFade = smoothstep(0.0, 0.25, vUv.x);

      // Color composition
      vec3 color = mix(uColorDeep, uColorMid, turbulence);
      color = mix(color, uColorCore, coreFactor * approachHotness);

      float alpha = coreFactor * (0.4 + turbulence * 0.6) * startFade * (0.5 + approachHotness * 0.8);
      gl_FragColor = vec4(color * uIntensity * (1.0 + approachHotness * 0.5), alpha);
    }
  `
};
