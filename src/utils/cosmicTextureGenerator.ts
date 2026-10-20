import * as THREE from 'three';

export function createProceduralCosmicTexture(index: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark space background
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(0.5, '#040d21');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Render different cosmic themes based on index
  switch (index % 6) {
    case 0: {
      // Spiral Galaxy
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 180);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.15, '#38bdf8');
      grad.addColorStop(0.4, '#1d4ed8');
      grad.addColorStop(0.7, '#0f172a');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spiral arms
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 3;
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        const armOffset = (arm * Math.PI * 2) / 3;
        for (let a = 0; a < 6.0; a += 0.05) {
          const r = a * 25;
          const x = cx + Math.cos(a + armOffset) * r;
          const y = cy + Math.sin(a + armOffset) * r * 0.6;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }

    case 1: {
      // Cosmic Nebula Cloud
      const g1 = ctx.createRadialGradient(cx - 60, cy - 20, 10, cx - 60, cy - 20, 160);
      g1.addColorStop(0, 'rgba(0, 245, 255, 0.8)');
      g1.addColorStop(0.5, 'rgba(30, 64, 175, 0.5)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g2 = ctx.createRadialGradient(cx + 80, cy + 30, 5, cx + 80, cy + 30, 140);
      g2.addColorStop(0, 'rgba(147, 51, 234, 0.7)');
      g2.addColorStop(0.6, 'rgba(37, 99, 235, 0.3)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
    }

    case 2: {
      // Gravitational Singularity Arc
      const arcGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 120);
      arcGrad.addColorStop(0, 'transparent');
      arcGrad.addColorStop(0.5, '#00f5ff');
      arcGrad.addColorStop(0.7, '#1e3a8a');
      arcGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = arcGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.fill();

      // Bright focal point
      const pGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.4, '#38bdf8');
      pGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 3: {
      // Celestial Star Cluster
      for (let i = 0; i < 40; i++) {
        const sx = cx + (Math.random() - 0.5) * 260;
        const sy = cy + (Math.random() - 0.5) * 160;
        const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
        sGrad.addColorStop(0, '#ffffff');
        sGrad.addColorStop(0.3, '#00d4ff');
        sGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 4: {
      // Quantum Geometric Wavefront
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1.5;
      for (let r = 20; r < 140; r += 22) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.4, r * 0.7, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      const cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
      cG.addColorStop(0, '#ffffff');
      cG.addColorStop(0.5, '#0284c7');
      cG.addColorStop(1, 'transparent');
      ctx.fillStyle = cG;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 5: {
      // Stellar Supernova Flare
      const flare = ctx.createRadialGradient(cx, cy, 2, cx, cy, 150);
      flare.addColorStop(0, '#ffffff');
      flare.addColorStop(0.2, '#67e8f9');
      flare.addColorStop(0.5, '#2563eb');
      flare.addColorStop(1, 'transparent');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cross flare spikes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(cx - 180, cy - 1, 360, 2);
      ctx.fillRect(cx - 1, cy - 110, 2, 220);
      break;
    }
  }

  // Common high-tech overlay: subtle cosmic stardust & holographic grid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let s = 0; s < 70; s++) {
    const px = Math.random() * canvas.width;
    const py = Math.random() * canvas.height;
    ctx.fillRect(px, py, 1.2, 1.2);
  }

  // Holographic border frame lines
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Corner marks
  ctx.fillStyle = '#00f5ff';
  const cLen = 14;
  ctx.fillRect(8, 8, cLen, 3);
  ctx.fillRect(8, 8, 3, cLen);
  ctx.fillRect(canvas.width - 8 - cLen, 8, cLen, 3);
  ctx.fillRect(canvas.width - 11, 8, 3, cLen);
  ctx.fillRect(8, canvas.height - 11, cLen, 3);
  ctx.fillRect(8, canvas.height - 8 - cLen, 3, cLen);
  ctx.fillRect(canvas.width - 8 - cLen, canvas.height - 11, cLen, 3);
  ctx.fillRect(canvas.width - 11, canvas.height - 8 - cLen, 3, cLen);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}
