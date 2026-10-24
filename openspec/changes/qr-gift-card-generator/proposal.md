# Proposal: QR Gift Card Generator

## Why

The 3D interactive flower bouquet gift needs a seamless bridge between the physical and digital worlds for Vietnamese Women's Day (20/10). Senders want to attach a physical greeting card or gift tag to flowers or gift boxes, while recipients need to open the 3D bouquet and musical experience on their mobile devices simply by pointing their smartphone camera at the card. To ensure instant recognition across diverse camera devices (iOS Camera, Android Google Lens, Zalo), the system requires a generator for high-contrast, standard-compliant QR codes and an elegant printable gift card.

## What Changes

- Introduce a high-contrast QR code generator producing both raster (PNG 1024x1024px) and vector (SVG) formats adhering to ISO/IEC 18004 standards (minimum 4-module quiet zone, high contrast, Error Correction Level H).
- Create an elegant printable 20/10 gift card design matching the web app's romantic aesthetics (A6 postcard standard, 300 DPI print fidelity, celebratory typography, handwritten note area, and an isolated white zone for the QR code).
- Implement a CLI/Node generation tool (`scripts/generateGiftCard.mjs` and npm script `generate-card`) that outputs standalone QR files and print-ready card images.
- Provide an interactive preview page (`gift-card-preview.html`) allowing users to inspect the card layout, customize recipient/sender text and destination URL, and trigger standard browser printing (`Ctrl+P`).

## Capabilities

### New Capabilities
- `qr-gift-card`: Generates high-contrast, camera-optimized QR codes and high-definition printable 20/10 celebration gift cards with configurable URLs and print-ready dimensions.

### Modified Capabilities
*(None)*

## Impact

- **New files**: `scripts/generateGiftCard.mjs`, `public/gift-card-preview.html`, and generated card artifacts in `output/gift-card/`.
- **Dependencies**: Adds `qrcode` for robust QR generation and leverages existing `puppeteer-core` for headless rendering.
- **Existing code**: Zero breaking changes to existing 3D shaders, audio playlist, or UI overlay.
