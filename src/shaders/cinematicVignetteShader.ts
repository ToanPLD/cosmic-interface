import * as THREE from 'three';

export const CinematicVignetteShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uAberrationAmount: { value: 0.0035 },
    uVignetteDarkness: { value: 0.85 },
    uVignetteOffset: { value: 1.15 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uAberrationAmount;
    uniform float uVignetteDarkness;
    uniform float uVignetteOffset;

    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5, 0.5);
      vec2 distFromCenter = vUv - center;
      float dist = length(distFromCenter);

      // Chromatic Aberration: radial displacement scaling with distance from center
      vec2 dir = normalize(distFromCenter + 0.0001);
      float rDist = dist * uAberrationAmount;

      float r = texture2D(tDiffuse, vUv + dir * rDist).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * rDist).b;
      vec3 color = vec3(r, g, b);

      // Cinematic Vignette
      float vignette = smoothstep(uVignetteOffset, uVignetteOffset - 0.45, dist * (uVignetteDarkness + 0.2));
      color *= vignette;

      // Subtle film dither to eliminate color banding in deep space blacks
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      color += (noise - 0.5) * 0.006;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
