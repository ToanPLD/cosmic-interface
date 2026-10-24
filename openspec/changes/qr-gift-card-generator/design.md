# Design: QR Gift Card Generator

## Context

The web gift is an interactive 3D WebGL flower bouquet celebration for Vietnamese Women's Day (20/10). Senders need a physical card containing a camera-scannable QR code to attach to real flower bouquets or gift boxes. The project currently has `puppeteer-core` with local Chrome configured in `scripts/captureShots.mjs`, a Vite dev server, and standard TypeScript web assets. See `proposal.md` for motivation and `specs/qr-gift-card/spec.md` for requirements.

## Goals / Non-Goals

**Goals:**
- Provide reliable, instant camera scanning (<0.5s) on iOS Camera, Google Lens, and Zalo QR scanners.
- Generate standalone high-res QR files (`qr-code.png` at 1024x1024 and `qr-code.svg`).
- Produce an A6-proportioned, 300-DPI equivalent printable card (`gift-card-20-10.png`).
- Provide an interactive preview page (`public/gift-card-preview.html`) with real-time text/URL editing and browser print stylesheet (`@media print`).
- Provide an automated CLI tool runnable via `npm run generate-card`.

**Non-Goals:**
- Building a backend database or user account service for shortened dynamic redirect links.
- Modifying the WebGL 3D rendering pipeline or Three.js postprocessing passes.

## Decisions

### 1. QR Generation Engine: `qrcode` NPM Package
- **Choice**: Use the standard `qrcode` library in Node.js and a lightweight bundle/CDN for client preview.
- **Rationale**: Implements ISO/IEC 18004 error correction, supports strict ECC Level H (30%), customizable quiet zone (margin >= 4), and outputs both SVG strings and PNG buffers cleanly.
- **Alternatives considered**:
  - *External API (e.g. api.qrserver.com)*: Rejected due to offline requirement, potential latency, and lack of deterministic offline build artifacts.
  - *Hand-rolled QR encoder*: Rejected due to Reed-Solomon polynomial complexity and risk of non-standard corner pattern proportions.

### 2. Dual Generation Architecture: Headless Puppeteer + Web Preview
- **Choice**:
  - **Headless Pipeline**: `scripts/generateGiftCard.mjs` invokes `qrcode` to generate vector/raster QR assets, injects them into an HTML card template, and uses `puppeteer-core` (reusing the existing local Chrome setup) with `deviceScaleFactor: 3` to capture a 300 DPI print-ready PNG.
  - **Interactive Preview**: `public/gift-card-preview.html` allows senders to test their URL, customize handwritten message fields, preview changes instantly, and trigger `Ctrl+P` for direct paper printing.
- **Rationale**: HTML/CSS flexbox and typography (Playfair Display, Montserrat) ensure elegant typography without the fragile pixel math of pure Canvas 2D `ctx.fillText`.

### 3. Camera Scannability Guardrails
- **Quiet Zone**: Enforce `margin: 4` in QR generator settings plus an additional outer white card container with at least 12px padding.
- **Color Polarity**: Strictly pure black `#000000` on white `#FFFFFF`. Avoid transparent backgrounds, drop shadows on QR modules, or dark-mode color inversion.
- **Error Correction**: Default to Level H (30%) recovery capacity, ensuring camera scan reliability even if paper is slightly bent, wrinkled, or marked.

## Architecture & Data Flow

```
+-------------------------------------------------------------+
| CLI: npm run generate-card -- --url "https://..."           |
+-------------------------------------------------------------+
                              |
                              v
             [scripts/generateGiftCard.mjs]
              |                          |
       (1. Generate QR)           (2. Inject into Card)
              |                          |
              v                          v
    +-------------------+      +-------------------+
    | qr-code.png (1024)|      | Card HTML Template|
    | qr-code.svg       |      +-------------------+
    +-------------------+                |
                                         v (Puppeteer 300 DPI)
                               +-------------------+
                               |gift-card-20-10.png|
                               +-------------------+
```

## Risks / Trade-offs

- **[Risk] Long URLs create dense QR matrices**: If the user inputs a very long URL, the QR matrix increases in version (e.g. Version 6+), resulting in tiny modules that low-end phone cameras struggle to resolve.
  - *Mitigation*: The generator logs a warning when URL length exceeds 80 characters, and advises using a short domain or redirect link.
- **[Risk] Printer margin clipping**: Standard desktop home printers cannot print borderless on standard A4/A6 paper.
  - *Mitigation*: The card template includes a safe printable inset margin (>= 8mm) so content is never clipped by standard printer feed rollers.
