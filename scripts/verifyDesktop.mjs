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

server.listen(4186, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--enable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('http://localhost:4186', { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
      () => typeof window.__elapsedTime === 'number' && window.__elapsedTime >= 11.0,
      { timeout: 30000 }
    );

    const shotDesktop = path.join(outDir, 'desktop_view_final.png');
    await page.screenshot({ path: shotDesktop });
    console.log(`Saved ${shotDesktop}`);

    await browser.close();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    server.close();
    process.exit(1);
  }
});
