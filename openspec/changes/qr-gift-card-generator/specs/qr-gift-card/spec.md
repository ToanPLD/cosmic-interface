# Spec Delta: QR Gift Card Generator

## Purpose

Enables senders to generate high-contrast, camera-scannable QR codes and elegant printable 20/10 celebration gift cards that open the interactive 3D flower bouquet web experience instantly when scanned.

## ADDED Requirements

### Requirement: High-Contrast QR Code Generation
The system SHALL generate camera-optimized QR codes in both PNG (minimum 1024x1024 resolution) and SVG formats adhering to standard quiet zone margins of at least 4 modules and Error Correction Level H.

#### Scenario: Generating standalone QR codes
- **WHEN** the generator is invoked with a target URL
- **THEN** it outputs `qr-code.png` and `qr-code.svg` featuring dark `#000000` modules on pure white `#FFFFFF` background, minimum 4-module quiet zone, and Level H error correction

### Requirement: Printable 20/10 Gift Card Layout
The system SHALL render an A6-proportioned printable gift card featuring romantic 20/10 celebration typography, an isolated white QR scanning container, and a designated sender note area.

#### Scenario: Rendering print-ready gift card image
- **WHEN** the card generator produces the gift card
- **THEN** it generates a high-definition PNG image (`gift-card-20-10.png`) with celebratory typography, an isolated white card container framing the QR code, and handwriting signature lines

### Requirement: Interactive Card Preview and Print Interface
The system SHALL provide an interactive HTML preview page allowing users to inspect the card layout, customize recipient/sender text or target URL, and initiate browser printing.

#### Scenario: Previewing and printing the card in browser
- **WHEN** the user opens `gift-card-preview.html` in a web browser
- **THEN** the card is rendered with live preview controls and prints accurately to paper dimensions when browser print (`Ctrl+P`) is triggered

### Requirement: Automated Generation Script Command
The system SHALL provide a CLI script executable via npm to automatically generate the QR assets and printable card image directly to an output folder.

#### Scenario: Running batch generation script
- **WHEN** the user executes `npm run generate-card` with optional custom URL arguments
- **THEN** the script outputs `qr-code.png`, `qr-code.svg`, and `gift-card-20-10.png` into `output/gift-card/` and reports generation success
