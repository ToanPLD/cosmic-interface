import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateQrFiles, detectLanIp } from './generateQr.mjs';

// Detect standard Chrome executable paths on Windows
const possibleChromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.CHROME_PATH || ''
];

function findChromePath() {
  for (const p of possibleChromePaths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Generate standalone QR assets and high-resolution 300-DPI printable gift card.
 *
 * @param {object} options
 * @param {string} options.url - Destination URL
 * @param {string} options.recipient - Recipient name
 * @param {string} options.message - Greeting message
 * @param {string} options.sender - Sender signature
 * @param {string} options.outDir - Output directory
 */
export async function generateGiftCardAssets({
  url = `http://${detectLanIp()}:3000`,
  recipient = 'Người Phụ Nữ Tôi Yêu Thương',
  message = 'Nhân ngày Phụ Nữ Việt Nam 20/10, chúc bạn luôn xinh đẹp, rạng rỡ như đóa hồng và ngập tràn niềm vui, hạnh phúc!',
  sender = 'Thương mến gửi tặng',
  outDir = path.resolve('output/gift-card')
} = {}) {
  fs.mkdirSync(outDir, { recursive: true });

  console.log('======================================================');
  console.log('🌹 20/10 GIFT CARD & HIGH-CONTRAST QR GENERATOR');
  console.log('======================================================');
  console.log(`Target URL:  ${url}`);
  console.log(`Recipient:   ${recipient}`);
  console.log(`Output Dir:  ${outDir}`);

  // Step 1: Generate standalone QR codes (PNG 1024x1024 & SVG vector)
  console.log('\n[1/3] Generating camera-optimized QR codes...');
  const { pngPath, svgPath } = await generateQrFiles(url, outDir);

  const publicDir = path.resolve('public');
  // Generate artistic floral QR codes (rose and bouquet)
  try {
    console.log('Generating artistic floral QR codes with blooming rose...');
    execSync(`python scripts/generateArtisticQr.py --url "${url}" --picture "public/artistic-rose-template.png" --out "${outDir}" --name "artistic-qr-rose.png"`, { stdio: 'pipe' });
    execSync(`python scripts/generateArtisticQr.py --url "${url}" --picture "public/bouquet-cropped.png" --out "${outDir}" --name "artistic-qr-bouquet.png"`, { stdio: 'pipe' });
    
    // Copy to public/ for web preview
    fs.copyFileSync(path.join(outDir, 'artistic-qr-rose.png'), path.join(publicDir, 'artistic-qr-rose.png'));
    fs.copyFileSync(path.join(outDir, 'artistic-qr-bouquet.png'), path.join(publicDir, 'artistic-qr-bouquet.png'));
  } catch (err) {
    console.warn('[Warning] Artistic QR generation:', err.message);
  }

  // Step 2: Spin up local static server for public/ folder
  console.log('\n[2/3] Preparing printable card layout template...');
  const server = http.createServer((req, res) => {
    let reqPath = req.url === '/' ? '/gift-card-preview.html' : req.url;
    let filePath = path.join(publicDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  const port = await new Promise((resolve) => {
    server.listen(0, () => {
      resolve(server.address().port);
    });
  });

  const chromePath = findChromePath();
  if (!chromePath) {
    server.close();
    throw new Error('Google Chrome executable not found. Please install Chrome or set CHROME_PATH.');
  }

  // Step 3: Render print-ready card via headless Chrome (300 DPI deviceScaleFactor)
  console.log('\n[3/3] Rendering 300-DPI print-ready gift card image...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    // deviceScaleFactor: 3 scales 420x594 CSS px to 1260x1782 px (exact 300 DPI for A6 paper: 105x148mm)
    await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 3 });
    await page.goto(`http://localhost:${port}/gift-card-preview.html`, { waitUntil: 'networkidle0' });

    // Wait for fonts and QR canvas
    await page.evaluate(async (u, r, m, s) => {
      await document.fonts.ready;
      document.getElementById('input-url').value = u;
      document.getElementById('input-recipient').value = r;
      document.getElementById('input-message').value = m;
      document.getElementById('input-sender').value = s;

      document.getElementById('card-recipient-display').textContent = r;
      document.getElementById('card-message-display').textContent = m;
      document.getElementById('card-sender-display').textContent = s;

      if (window.renderQr) window.renderQr();
    }, url, recipient, message, sender);

    // Short wait for canvas draw
    await new Promise((r) => setTimeout(r, 600));

    const cardElement = await page.$('#gift-card-element');
    if (!cardElement) throw new Error('#gift-card-element not found on page');

    let cardOutputPath = path.join(outDir, 'gift-card-20-10.png');
    try {
      if (fs.existsSync(cardOutputPath)) {
        fs.unlinkSync(cardOutputPath);
      }
    } catch {
      cardOutputPath = path.join(outDir, `gift-card-20-10-${Date.now()}.png`);
    }

    await cardElement.screenshot({
      path: cardOutputPath,
      omitBackground: false
    });

    console.log(`\n🎉 SUCCESS! Generated assets in ${outDir}:`);
    console.log(` ✔ 1. Standalone Classic QR (PNG):   ${pngPath}`);
    console.log(` ✔ 2. Standalone Classic QR (SVG):   ${svgPath}`);
    console.log(` ✔ 3. Artistic Rose QR (PNG):        ${path.join(outDir, 'artistic-qr-rose.png')}`);
    console.log(` ✔ 4. Artistic Bouquet QR (PNG):     ${path.join(outDir, 'artistic-qr-bouquet.png')}`);
    console.log(` ✔ 5. Printable Card (300 DPI PNG):  ${cardOutputPath}`);
    console.log(` ✔ 6. Interactive Web Preview:       http://localhost:3000/gift-card-preview.html`);

    return {
      pngPath,
      svgPath,
      cardOutputPath
    };
  } finally {
    await browser.close();
    server.close();
  }
}

// CLI parsing
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve('scripts/generateGiftCard.mjs'));
if (isDirectRun) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      options.url = args[i + 1];
      i++;
    } else if (args[i] === '--recipient' && args[i + 1]) {
      options.recipient = args[i + 1];
      i++;
    } else if (args[i] === '--message' && args[i + 1]) {
      options.message = args[i + 1];
      i++;
    } else if (args[i] === '--sender' && args[i + 1]) {
      options.sender = args[i + 1];
      i++;
    } else if (args[i] === '--out' && args[i + 1]) {
      options.outDir = path.resolve(args[i + 1]);
      i++;
    }
  }

  generateGiftCardAssets(options).catch((err) => {
    console.error('[Error generating gift card]:', err);
    process.exit(1);
  });
}
