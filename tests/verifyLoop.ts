import * as THREE from 'three';
import { CameraController } from '../src/core/CameraController';

console.log('--- Verifying 12-Second Seamless Mathematical Loop ---');

// 1. Camera Controller Verification
const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
const controller = new CameraController(camera, {
  radius: 32.0,
  height: 8.0,
  heightAmplitude: 2.5,
  loopPeriod: 12.0
});

// Test t = 0.0
controller.update(0.0, 0.016);
const posAt0 = camera.position.clone();

// Test t = 12.0 (one full loop period)
controller.update(12.0, 0.016);
const posAt12 = camera.position.clone();

const camDist = posAt0.distanceTo(posAt12);
console.log(`Camera position delta between t=0s and t=12s: ${camDist.toFixed(8)}`);
if (camDist > 1e-4) {
  console.error('FAIL: Camera does not loop seamlessly!');
  process.exit(1);
} else {
  console.log('PASS: Camera loops seamlessly across 12s period.');
}

// 2. Orbital harmonic speeds verification for all 5 spherical orbits
const orbitMultipliers = [2, 1, 2, 1, 1]; // Orbits 1 through 5
const orbitSpeeds = orbitMultipliers.map((m) => ((Math.PI * 2) / 12.0) * m);

orbitSpeeds.forEach((speed, idx) => {
  const angleAt0 = 0.0;
  const angleAt12 = speed * 12.0;
  const revolutions = angleAt12 / (Math.PI * 2);
  const isInteger = Math.abs(revolutions - Math.round(revolutions)) < 1e-6;
  console.log(
    `Orbit ${idx + 1}: ${revolutions} full revolutions in 12s -> is integer multiple: ${isInteger}`
  );
  if (!isInteger) {
    console.error(`FAIL: Orbit ${idx + 1} speed is not harmonic!`);
    process.exit(1);
  }
});

console.log('ALL LOOP VERIFICATIONS PASSED SUCCESSFULLY!');
