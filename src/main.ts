import { SceneManager } from './core/SceneManager';
import { GiftUIOverlay } from './ui/GiftUIOverlay';
import './style.css';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (!container) {
    console.error('App container not found');
    return;
  }

  const sceneManager = new SceneManager(container);
  (window as any).__sceneManager = sceneManager;
  sceneManager.start();

  // Mount Glassmorphic 20/10 Gift UI Overlay
  new GiftUIOverlay(sceneManager);
});
