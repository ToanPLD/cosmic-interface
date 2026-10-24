# Spec Delta

## Purpose

Provides a romantic glassmorphic user interface overlay for the 3D flower bouquet gift, featuring 20/10 celebration branding, an interactive 4-phase timeline playback controller, greeting letter modal, and keepsake controls.

## ADDED Requirements

### Requirement: Celebratory Header Banner
The system SHALL display a floating glassmorphic header overlay containing celebratory Vietnamese Women's Day (20/10) typography and a background music toggle button with animated audio equalizer wave bars.

#### Scenario: Header display on scene load
- **WHEN** the web application loads
- **THEN** a responsive glassmorphic top header appears with the badge "20 · 10 Edition", the title "Chúc Mừng Ngày Phụ Nữ Việt Nam", and an audio toggle button indicating sound state

### Requirement: Interactive Timeline Stepper
The system SHALL provide an interactive bottom timeline navigation bar allowing users to play, pause, replay, and seek directly between the four choreographed animation phases.

#### Scenario: Seeking to specific animation phase
- **WHEN** the user clicks on any of the phase buttons (1. Petal Orbit, 2. Golden Vortex Gathering, 3. Origami Bouquet Wrapping, 4. Completed Showcase)
- **THEN** the animation timeline immediately jumps to the start timestamp of that selected phase and updates scene elements accordingly

#### Scenario: Pausing and resuming timeline playback
- **WHEN** the user toggles the play/pause button on the timeline controller
- **THEN** the animation time halts at the current frame allowing uninterrupted inspection, and resumes seamlessly when clicked again

### Requirement: Romantic Greeting Letter Modal
The system SHALL provide a modal dialog displaying a heartfelt greeting message when the user activates the floating letter button.

#### Scenario: Opening and closing the greeting letter
- **WHEN** the user clicks the floating letter button (`💌`)
- **THEN** a frosted glassmorphic card modal appears displaying a romantic 20/10 greeting message, with a smooth close button to return to the 3D view

### Requirement: Keepsake Snapshot and Audio Controls
The system SHALL enable recipients to export a commemorative high-definition image of the 3D bouquet and toggle between automatic 360-degree orbital tour and manual touch/pointer rotation.

#### Scenario: Capturing commemorative photo
- **WHEN** the user clicks the snapshot camera button (`📸`)
- **THEN** the system renders the current 3D frame at high resolution and prompts a PNG download of the keepsake
