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

server.listen(4185, async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--enable-gpu']
    });

    // 1. Test iPhone 14/15 Viewport (393 x 852)
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto('http://localhost:4185', { waitUntil: 'domcontentloaded' });

    console.log('Waiting for bouquet assembly at t >= 11s...');
    await page.waitForFunction(
      () => typeof window.__elapsedTime === 'number' && window.__elapsedTime >= 11.0,
      { timeout: 30000 }
    );

    // 1. Main View (iPhone 14)
    const shotMain = path.join(outDir, 'mobile_responsive_main.png');
    await page.screenshot({ path: shotMain });
    console.log(`Saved ${shotMain}`);

    // 2. Open Greeting Letter Modal
    console.log('Opening letter modal...');
    const letterBtn = await page.$('.header-letter-pill');
    if (letterBtn) {
      await letterBtn.click();
      // Wait for card animation and modal pop-in
      await new Promise(r => setTimeout(r, 1200));
      const shotLetter = path.join(outDir, 'mobile_responsive_letter.png');
      await page.screenshot({ path: shotLetter });
      console.log(`Saved ${shotLetter}`);

      // Close modal
      const closeBtn = await page.$('.letter-close-btn');
      if (closeBtn) await closeBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // 3. Open Playlist Drawer
    console.log('Opening playlist drawer...');
    const playlistBtn = await page.$('.playlist-toggle-btn');
    if (playlistBtn) {
      await playlistBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const shotPlaylist = path.join(outDir, 'mobile_responsive_playlist.png');
      await page.screenshot({ path: shotPlaylist });
      console.log(`Saved ${shotPlaylist}`);

      const closePlBtn = await page.$('.playlist-close-btn');
      if (closePlBtn) await closePlBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // 4. Test iPhone SE (375 x 667)
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await new Promise(r => setTimeout(r, 400));
    const shotSE = path.join(outDir, 'mobile_responsive_iphonese.png');
    await page.screenshot({ path: shotSE });
    console.log(`Saved ${shotSE}`);

    await browser.close();
    server.close();
    console.log('All responsive tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during mobile test:', err);
    server.close();
    process.exit(1);
  }
});
