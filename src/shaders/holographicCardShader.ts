import * as THREE from 'three';

export const HolographicCardShader = {
  uniforms: {
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uForegroundFactor: { value: 1.0 }, // 1.0 when in front of core, 0.0 when behind
    uBorderColor: { value: new THREE.Color(0x00f5ff) },
    uGlowColor: { value: new THREE.Color(0x1d4ed8) },
    uGlassOpacity: { value: 0.90 },
    uFresnelPower: { value: 2.4 },
    uEmissionMultiplier: { value: 1.2 }
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
    uniform float uForegroundFactor;
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
      // Safe normalizations
      vec3 normal = length(vNormal) > 0.0001 ? normalize(vNormal) : vec3(0.0, 0.0, 1.0);
      vec3 viewDir = length(vViewPosition) > 0.0001 ? normalize(vViewPosition) : vec3(0.0, 0.0, 1.0);

      // Safe Fresnel rim glow
      float NdotV = clamp(abs(dot(normal, viewDir)), 0.0, 1.0);
      float fresnel = pow(clamp(1.0 - NdotV, 0.0, 1.0), uFresnelPower);
      float safeFresnel = clamp(fresnel, 0.0, 1.0);

      // Sample procedural cosmic image
      vec4 texColor = texture2D(uTexture, vUv);

      // High-tech holographic scanline effect (sharper in foreground, subtler in background)
      float scanlineSpeed = 3.5;
      float scanlineDensity = 140.0;
      float scanline = sin(vUv.y * scanlineDensity + uTime * scanlineSpeed) * 0.05 + 0.95;

      // Holographic sci-fi border framing & corner brackets
      vec2 borderDist = min(vUv, 1.0 - vUv);
      float minEdge = min(borderDist.x, borderDist.y);
      float borderMask = 1.0 - smoothstep(0.006, 0.024, minEdge);

      // Corner bracket accents
      float cornerSize = 0.14;
      float inCornerX = step(borderDist.x, cornerSize);
      float inCornerY = step(borderDist.y, cornerSize);
      float cornerBracket = inCornerX * inCornerY * (1.0 - smoothstep(0.012, 0.038, minEdge));

      // Compose holographic glass color
      vec3 baseImg = texColor.rgb * scanline;

      // Energy Field Obscuration:
      // When cards pass behind the central core (uForegroundFactor -> 0.0),
      // their light is shifted towards deep cosmic cyan-blue and partially diffused.
      vec3 energyVeilColor = vec3(0.04, 0.22, 0.55);
      baseImg = mix(energyVeilColor * (baseImg.r * 0.5 + 0.5), baseImg, 0.35 + 0.65 * uForegroundFactor);

      // Border and rim glows
      float edgeMultiplier = mix(0.5, 1.8, uForegroundFactor);
      vec3 edgeGlow = uBorderColor * (borderMask * 1.6 + cornerBracket * 2.8) * edgeMultiplier;
      vec3 rimGlow = uGlowColor * safeFresnel * (1.2 + 0.6 * uForegroundFactor);

      // Bounded HDR emissive composition to prevent bloom pyramid NaN or runaway values
      vec3 finalRgb = clamp((baseImg + edgeGlow + rimGlow) * uEmissionMultiplier, 0.0, 60.0);

      // Dynamic opacity: foreground cards are crisp and solid (up to 0.95);
      // background cards become semi-translucent and veiled (0.35 - 0.65)
      float baseAlpha = clamp(texColor.a * uGlassOpacity + borderMask + safeFresnel * 0.45, 0.2, 0.98);
      float finalAlpha = clamp(baseAlpha * (0.40 + 0.60 * uForegroundFactor), 0.0, 1.0);

      gl_FragColor = vec4(finalRgb, finalAlpha);
    }
  `
};
