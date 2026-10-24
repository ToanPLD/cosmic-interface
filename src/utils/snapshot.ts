import * as THREE from 'three';

/**
 * Captures a commemorative high-resolution photograph of the 3D scene
 * and triggers a download of the keepsake image.
 */
export function exportCanvasSnapshot(
  renderer: THREE.WebGLRenderer,
  filename: string = 'Bó_Hoa_20_10_Yêu_Thương.png'
): void {
  try {
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Failed to capture canvas snapshot:', err);
  }
}
