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

server.listen(4182, async () => {
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
    await page.goto('http://localhost:4182', { waitUntil: 'domcontentloaded' });

    async function waitForCycleTime(targetSec) {
      await page.waitForFunction(
        (target) => typeof window.__elapsedTime === 'number' && (window.__elapsedTime % 16.0) >= target,
        { timeout: 30000 },
        targetSec
      );
    }

    // Phase 1: t = 2.0s (Dispersed Orbiting Petals, Center Empty)
    await waitForCycleTime(2.0);
    const shot1 = path.join(outDir, 'bouquet_phase1_orbit.png');
    await page.screenshot({ path: shot1 });
    console.log(`Saved ${shot1}`);

    // Phase 2: t = 6.0s (Convergent Spiral Gathering & Flowers Blooming)
    await waitForCycleTime(6.0);
    const shot2 = path.join(outDir, 'bouquet_phase2_gather.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved ${shot2}`);

    // Phase 3: t = 9.5s (Wrapping Paper and Ribbon Bow Tying with UI Overlay)
    await waitForCycleTime(9.5);
    const shot3 = path.join(outDir, 'bouquet_phase3_wrapping.png');
    await page.screenshot({ path: shot3 });
    console.log(`Saved ${shot3}`);

    const shotUI = path.join(outDir, 'ui_overview_phase3.png');
    await page.screenshot({ path: shotUI });
    console.log(`Saved ${shotUI}`);

    // Test Opening 20/10 Greeting Letter Modal
    await page.click('#btn-open-letter');
    await new Promise((r) => setTimeout(r, 600)); // wait for popIn animation
    const shotModal = path.join(outDir, 'ui_letter_modal.png');
    await page.screenshot({ path: shotModal });
    console.log(`Saved ${shotModal}`);

    // Close letter modal
    await page.click('#btn-close-letter');
    await new Promise((r) => setTimeout(r, 300));

    // Test Opening Playlist Drawer Modal
    await page.click('#btn-open-playlist');
    await new Promise((r) => setTimeout(r, 600)); // wait for popIn animation
    const shotPlaylist = path.join(outDir, 'ui_playlist_drawer.png');
    await page.screenshot({ path: shotPlaylist });
    console.log(`Saved ${shotPlaylist}`);

    // Test selecting a track (e.g. track index 3: Chờ trong trăng)
    const track3 = await page.$('.track-item[data-track-index="3"]');
    if (track3) {
      await track3.click();
      await new Promise((r) => setTimeout(r, 300));
    }

    // Close Playlist Drawer
    await page.click('#btn-close-playlist');
    await new Promise((r) => setTimeout(r, 300));

    // Phase 4: t = 12.0s (Complete Bouquet Presentation & Gentle Sway)
    await waitForCycleTime(12.0);
    const shot4 = path.join(outDir, 'bouquet_phase4_complete.png');
    await page.screenshot({ path: shot4 });
    console.log(`Saved ${shot4}`);

    // Verification of Persistence Beyond 16s (continuous time >= 18.0s):
    // Prior to this change, time wrapped around at 16.0s and reset to empty center.
    // Now it must stay fully assembled and wrapped indefinitely.
    await page.waitForFunction(
      () => typeof window.__continuousTime === 'number' && window.__continuousTime >= 18.0,
      { timeout: 30000 }
    );
    const shotPersist = path.join(outDir, 'bouquet_phase4_persisted_t18.png');
    await page.screenshot({ path: shotPersist });
    console.log(`Saved ${shotPersist}`);

    await browser.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
