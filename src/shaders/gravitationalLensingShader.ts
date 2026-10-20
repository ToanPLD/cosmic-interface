import * as THREE from 'three';

export const GravitationalLensingShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorInner: { value: new THREE.Color(0xffffff) },
    uColorOuter: { value: new THREE.Color(0x00d4ff) },
    uColorEdge: { value: new THREE.Color(0x1d4ed8) },
    uFresnelPower: { value: 2.8 },
    uIntensity: { value: 2.4 }
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

      // Fresnel factor: peak intensity at the tangent perimeter (Einstein ring)
      float NdotV = abs(dot(normal, viewDir));
      float fresnel = pow(1.0 - NdotV, uFresnelPower);

      // Subtle dynamic gravitational ripple (harmonic 12s loop)
      float wave = sin(uTime * (6.28318530718 / 12.0) * 2.0 + vWorldPosition.y * 3.0) * 0.08 + 0.92;

      // Color gradient from white-hot inner tangent to intense cyan and deep electric blue
      vec3 color = mix(uColorEdge, uColorOuter, pow(fresnel, 1.5));
      color = mix(color, uColorInner, pow(fresnel, 4.0));

      float alpha = clamp(pow(fresnel, 1.8) * uIntensity * wave, 0.0, 1.0);

      gl_FragColor = vec4(color * uIntensity, alpha);
    }
  `
};
