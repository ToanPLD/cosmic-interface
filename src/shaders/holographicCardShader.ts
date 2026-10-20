import * as THREE from 'three';

export const HolographicCardShader = {
  uniforms: {
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uBorderColor: { value: new THREE.Color(0x00f5ff) },
    uGlowColor: { value: new THREE.Color(0x1d4ed8) },
    uGlassOpacity: { value: 0.88 },
    uFresnelPower: { value: 2.2 },
    uEmissionMultiplier: { value: 1.1 }
  },

  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = viewMatrix * worldPos;
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec3 uBorderColor;
    uniform vec3 uGlowColor;
    uniform float uGlassOpacity;
    uniform float uFresnelPower;
    uniform float uEmissionMultiplier;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel rim glow
      float NdotV = abs(dot(normal, viewDir));
      float fresnel = pow(1.0 - NdotV, uFresnelPower);

      // Sample procedural cosmic image
      vec4 texColor = texture2D(uTexture, vUv);

      // High-tech holographic scanline effect
      float scanline = sin(vUv.y * 120.0 + uTime * 4.0) * 0.04 + 0.96;

      // Holographic sci-fi border framing & corner brackets
      vec2 borderDist = min(vUv, 1.0 - vUv);
      float minEdge = min(borderDist.x, borderDist.y);
      float borderMask = 1.0 - smoothstep(0.005, 0.02, minEdge);

      // Corner bracket accents
      float cornerSize = 0.12;
      float inCornerX = step(borderDist.x, cornerSize);
      float inCornerY = step(borderDist.y, cornerSize);
      float cornerBracket = inCornerX * inCornerY * (1.0 - smoothstep(0.015, 0.035, minEdge));

      // Compose holographic glass color
      vec3 baseImg = texColor.rgb * scanline;
      vec3 edgeGlow = uBorderColor * (borderMask * 1.5 + cornerBracket * 2.5);
      vec3 rimGlow = uGlowColor * fresnel * 1.4;

      vec3 finalRgb = baseImg + edgeGlow + rimGlow;
      finalRgb *= uEmissionMultiplier;

      float alpha = clamp(texColor.a * uGlassOpacity + borderMask + fresnel * 0.5, 0.15, 0.98);

      gl_FragColor = vec4(finalRgb, alpha);
    }
  `
};
