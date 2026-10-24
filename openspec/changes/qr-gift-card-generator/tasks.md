# Tasks: QR Gift Card Generator

## 1. Setup and QR Generation Core

- [x] 1.1 Install `qrcode` dependency and verify successful installation via `npm list qrcode`
- [x] 1.2 Implement QR generator logic in `scripts/generateQr.mjs` to output `qr-code.png` (1024x1024) and `qr-code.svg` with minimum 4-module quiet zone and ECC Level H, verifying outputs exist and match specs

## 2. Printable Gift Card Template and Interactive Preview

- [x] 2.1 Create `public/gift-card-preview.html` with romantic 20/10 styling, isolated high-contrast QR container, customizable recipient/message fields, and `@media print` stylesheet for A6 dimensions
- [x] 2.2 Implement dynamic QR updating and print trigger in `public/gift-card-preview.html`, verifying real-time rendering when the destination URL or message changes

## 3. Headless Print Generation Script & NPM Integration

- [x] 3.1 Implement `scripts/generateGiftCard.mjs` using headless Puppeteer to render `gift-card-20-10.png` at 300 DPI into `output/gift-card/`, verifying image creation and clarity
- [x] 3.2 Add `generate-card` script to `package.json` supporting custom `--url` arguments and verify running `npm run generate-card` produces all output assets (`qr-code.png`, `qr-code.svg`, and `gift-card-20-10.png`)

## 4. End-to-End Verification

- [x] 4.1 Run full generation test and verify output file dimensions, contrast ratios, and camera decodability
