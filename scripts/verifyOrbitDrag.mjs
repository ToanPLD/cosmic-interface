import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const distDir = path.resolve('dist');
const outDir = path.resolve('C:\\Users\\tarou\\.gemini\\antigravity\\brain\\05b06b75-2c78-4e86-af9b-e14c801d0888');

const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) filePath = path.join(distDir, 'index.html');
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.js') contentType = 'application/javascript';
  if (ext === '.css') contentType = 'text/css';
  if (ext === '.mp3') contentType = 'audio/mpeg';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.svg') contentType = 'image/svg+xml';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4183, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-webgl',
        '--enable-gpu',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=1280,720'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('http://localhost:4183', { waitUntil: 'domcontentloaded' });

    // Wait until bouquet is assembled (t >= 11.5s)
    console.log('Waiting for bouquet assembly...');
    await page.waitForFunction(
      () => typeof window.__elapsedTime === 'number' && window.__elapsedTime >= 11.5,
      { timeout: 30000 }
    );

    // Initial capture before user drag
    const shot1 = path.join(outDir, 'bouquet_orbit_before_drag.png');
    await page.screenshot({ path: shot1 });
    console.log(`Saved ${shot1}`);

    // Perform mouse drag: start at center (640, 360), drag left to (300, 300)
    console.log('Simulating mouse drag to rotate bouquet...');
    await page.mouse.move(640, 360);
    await page.mouse.down();
    // Move in increments to simulate natural hand swipe
    for (let x = 640; x >= 320; x -= 20) {
      await page.mouse.move(x, 360 - (640 - x) * 0.2);
      await new Promise(r => setTimeout(r, 20));
    }

    const shot2 = path.join(outDir, 'bouquet_orbit_during_drag.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved ${shot2}`);

    // Release mouse
    await page.mouse.up();
    console.log('Mouse released! Observing auto-rotation resume...');

    // Wait 2.5 seconds for auto-rotation to run on its own
    await new Promise(r => setTimeout(r, 2500));

    const shot3 = path.join(outDir, 'bouquet_orbit_auto_rotated.png');
    await page.screenshot({ path: shot3 });
    console.log(`Saved ${shot3}`);

    await browser.close();
    server.close();
    console.log('Verification completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during verification:', err);
    server.close();
    process.exit(1);
  }
});
