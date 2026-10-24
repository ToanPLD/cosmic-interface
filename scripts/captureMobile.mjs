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

server.listen(4184, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--enable-gpu']
    });

    // Test on iPhone 14/15 size: 393 x 852
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4184', { waitUntil: 'domcontentloaded' });

    // Wait for assembled bouquet (t >= 11s)
    await page.waitForFunction(
      () => typeof window.__elapsedTime === 'number' && window.__elapsedTime >= 11.0,
      { timeout: 30000 }
    );

    // 1. Mobile main view
    const shotMain = path.join(outDir, 'mobile_view_main.png');
    await page.screenshot({ path: shotMain });
    console.log(`Saved ${shotMain}`);

    // 2. Open letter modal on mobile
    const letterBtn = await page.$('.header-letter-pill');
    if (letterBtn) {
      await letterBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const shotModal = path.join(outDir, 'mobile_view_letter_modal.png');
      await page.screenshot({ path: shotModal });
      console.log(`Saved ${shotModal}`);

      // Close modal
      const closeBtn = await page.$('.letter-close-btn');
      if (closeBtn) await closeBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // 3. Open playlist drawer on mobile
    const listBtn = await page.$('.audio-list-btn');
    if (listBtn) {
      await listBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const shotDrawer = path.join(outDir, 'mobile_view_playlist_drawer.png');
      await page.screenshot({ path: shotDrawer });
      console.log(`Saved ${shotDrawer}`);
    }

    await browser.close();
    server.close();
    console.log('Mobile screenshots captured successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error in mobile capture:', err);
    server.close();
    process.exit(1);
  }
});
