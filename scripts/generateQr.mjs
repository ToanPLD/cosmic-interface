import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Auto-detect local Wi-Fi / LAN IP so smartphones on the same network can access
 */
export function detectLanIp() {
  const nets = os.networkInterfaces();
  for (const [name, list] of Object.entries(nets)) {
    for (const net of list) {
      if (net.family === 'IPv4' && !net.internal) {
        const lower = name.toLowerCase();
        if (!lower.includes('vethernet') && !lower.includes('virtual') && !lower.includes('hyper-v')) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

/**
 * Generate camera-optimized QR code files (PNG 1024x1024 and SVG vector).
 * Strict ISO/IEC 18004 compliance:
 * - Error Correction Level H (30%)
 * - Quiet zone margin >= 4 modules
 * - Absolute high contrast: #000000 on #ffffff
 *
 * @param {string} targetUrl - Destination URL to encode
 * @param {string} outputDir - Directory to save generated assets
 * @returns {Promise<{ pngPath: string, svgPath: string, svgString: string, dataUrl: string }>}
 */
export async function generateQrFiles(targetUrl, outputDir = path.resolve('output/gift-card')) {
  if (!targetUrl) {
    const lanIp = detectLanIp();
    targetUrl = `http://${lanIp}:3000`;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const pngPath = path.join(outputDir, 'qr-code.png');
  const svgPath = path.join(outputDir, 'qr-code.svg');

  const commonOptions = {
    errorCorrectionLevel: 'H',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  };

  // 1. Generate PNG (1024x1024 for high-resolution print and screen)
  await QRCode.toFile(pngPath, targetUrl, {
    ...commonOptions,
    width: 1024
  });

  // 2. Generate SVG vector file
  const svgString = await QRCode.toString(targetUrl, {
    ...commonOptions,
    type: 'svg'
  });
  fs.writeFileSync(svgPath, svgString, 'utf-8');

  // 3. Generate Base64 Data URL for easy embedding in HTML templates
  const dataUrl = await QRCode.toDataURL(targetUrl, {
    ...commonOptions,
    width: 600
  });

  console.log(`[QR Generator] Successfully generated:`);
  console.log(` - Target URL: ${targetUrl}`);
  console.log(` - PNG (1024x1024): ${pngPath}`);
  console.log(` - SVG (Vector):    ${svgPath}`);

  return { pngPath, svgPath, svgString, dataUrl };
}

// CLI direct execution
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve('scripts/generateQr.mjs'));
if (isDirectRun) {
  const args = process.argv.slice(2);
  let url = '';
  let out = path.resolve('output/gift-card');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      url = args[i + 1];
      i++;
    } else if (args[i] === '--out' && args[i + 1]) {
      out = path.resolve(args[i + 1]);
      i++;
    }
  }

  generateQrFiles(url, out).catch((err) => {
    console.error('[QR Generator] Error generating QR code:', err);
    process.exit(1);
  });
}
