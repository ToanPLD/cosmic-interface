import { SceneManager } from './core/SceneManager';
import './style.css';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (!container) {
    console.error('App container not found');
    return;
  }

  const sceneManager = new SceneManager(container);
  sceneManager.start();
});
