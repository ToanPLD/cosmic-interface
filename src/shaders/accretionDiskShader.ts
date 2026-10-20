import * as THREE from 'three';

export const AccretionDiskShader = {
  uniforms: {
    uTime: { value: 0 },
    uInnerRadius: { value: 1.85 },
    uOuterRadius: { value: 7.2 },
    uColorCore: { value: new THREE.Color(0xffffff) },
    uColorMid: { value: new THREE.Color(0x00f5ff) },
    uColorOuter: { value: new THREE.Color(0x1e40af) },
    uColorDark: { value: new THREE.Color(0x020617) },
    uCameraPosition: { value: new THREE.Vector3() },
    uIntensity: { value: 1.8 }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vLocalPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform float uInnerRadius;
    uniform float uOuterRadius;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorOuter;
    uniform vec3 uColorDark;
    uniform vec3 uCameraPosition;
    uniform float uIntensity;

    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;

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
      // Polar coords in disk local plane (XY)
      float r = length(vLocalPosition.xy);
      float theta = atan(vLocalPosition.y, vLocalPosition.x);

      // Radial normalized factor [0, 1]
      float rNorm = clamp((r - uInnerRadius) / (uOuterRadius - uInnerRadius), 0.0, 1.0);

      // Keplerian differential shear: inner regions orbit faster
      // Strictly harmonic 12s period: base frequency = 2*PI/12
      float baseOmega = 6.28318530718 / 12.0;
      float shear = baseOmega * 4.0 / pow(max(rNorm * 3.0 + 0.5, 0.5), 1.25);
      float angleFlow = theta + uTime * shear;

      // Multi-frequency noise for plasma swirls
      vec2 noiseCoord1 = vec2(cos(angleFlow) * r * 1.5, sin(angleFlow) * r * 1.5);
      float n1 = snoise(noiseCoord1) * 0.5 + 0.5;

      vec2 noiseCoord2 = vec2(cos(angleFlow * 2.0) * r * 2.8, sin(angleFlow * 2.0) * r * 2.8);
      float n2 = snoise(noiseCoord2 + vec2(uTime * 0.2, 0.0)) * 0.5 + 0.5;

      float plasmaNoise = n1 * 0.65 + n2 * 0.35;

      // Relativistic Doppler Beaming Effect:
      // Approaching side of the accretion disk is bluer and brighter
      vec3 camDir = normalize(uCameraPosition - vWorldPosition);
      vec3 tangent = normalize(vec3(-vLocalPosition.y, vLocalPosition.x, 0.0));
      vec3 worldTangent = normalize((modelMatrix * vec4(tangent, 0.0)).xyz);
      float dopplerFactor = dot(worldTangent, camDir);
      float dopplerBoost = clamp(1.0 + dopplerFactor * 0.4, 0.6, 1.4);

      // Radial density profile
      // Sharp inner edge near photon sphere, peak luminance at rNorm ~0.15, smooth exponential outer fade
      float innerCutoff = smoothstep(0.0, 0.08, rNorm);
      float peakBrightness = exp(-rNorm * 3.8);
      float outerFade = smoothstep(1.0, 0.6, rNorm);
      float density = innerCutoff * peakBrightness * outerFade;

      // Color mapping
      vec3 color = mix(uColorMid, uColorCore, pow(1.0 - rNorm, 3.5));
      color = mix(uColorOuter, color, pow(1.0 - rNorm, 1.2));
      color = mix(uColorDark, color, innerCutoff);

      // Add plasma filaments
      color += uColorMid * pow(plasmaNoise, 2.0) * 0.8 * (1.0 - rNorm * 0.7);

      float alpha = density * (0.6 + plasmaNoise * 0.5) * dopplerBoost;
      vec3 finalColor = color * uIntensity * dopplerBoost;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
