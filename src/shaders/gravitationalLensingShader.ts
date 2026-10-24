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
      // Safe vector normalizations
      vec3 normal = length(vNormal) > 0.0001 ? normalize(vNormal) : vec3(0.0, 0.0, 1.0);
      vec3 viewDir = length(vViewPosition) > 0.0001 ? normalize(vViewPosition) : vec3(0.0, 0.0, 1.0);

      // Sharp Fresnel rim: ONLY the perimeter tangent ring radiates light (Einstein ring)
      // When facing directly (center), fresnel is strictly 0.0 -> center remains pure pitch black!
      float NdotV = clamp(abs(dot(normal, viewDir)), 0.0, 1.0);
      float fresnel = pow(clamp(1.0 - NdotV, 0.0, 1.0), uFresnelPower);
      float safeFresnel = clamp(fresnel, 0.0, 1.0);

      // Subtle dynamic gravitational ripple (harmonic 12s loop)
      float wave = sin(uTime * (6.28318530718 / 12.0) * 2.0 + vWorldPosition.y * 3.0) * 0.05 + 0.95;

      // Color gradient from white tangent rim to electric cyan
      vec3 color = mix(uColorOuter, uColorInner, pow(safeFresnel, 2.0));

      // Strictly zero in center, bright on rim with HDR bounded output
      vec3 finalColor = clamp(color * (uIntensity * pow(safeFresnel, 2.5) * wave), 0.0, 60.0);
      float alpha = clamp(pow(safeFresnel, 3.0) * uIntensity, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
