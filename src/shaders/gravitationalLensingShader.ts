import * as THREE from 'three';

export const GravitationalLensingShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorInner: { value: new THREE.Color(0xffffff) },
    uColorOuter: { value: new THREE.Color(0x00d4ff) },
    uColorEdge: { value: new THREE.Color(0x1d4ed8) },
    uFresnelPower: { value: 6.0 },
    uIntensity: { value: 1.2 }
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vec4 mvPosition = viewMatrix * worldPosition;
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorInner;
    uniform vec3 uColorOuter;
    uniform vec3 uColorEdge;
    uniform float uFresnelPower;
    uniform float uIntensity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Sharp Fresnel rim: ONLY the perimeter tangent ring radiates light (Einstein ring)
      // When facing directly (center), fresnel is strictly 0.0 -> center remains pure pitch black!
      float NdotV = abs(dot(normal, viewDir));
      float fresnel = pow(1.0 - NdotV, uFresnelPower);

      // Subtle dynamic gravitational ripple (harmonic 12s loop)
      float wave = sin(uTime * (6.28318530718 / 12.0) * 2.0 + vWorldPosition.y * 3.0) * 0.05 + 0.95;

      // Color gradient from white tangent rim to electric cyan
      vec3 color = mix(uColorOuter, uColorInner, pow(fresnel, 2.0));

      // Strictly zero in center, bright on rim
      vec3 finalColor = color * (uIntensity * pow(fresnel, 2.5) * wave);
      float alpha = clamp(pow(fresnel, 3.0) * uIntensity, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
