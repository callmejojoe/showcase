/* hero.js — background video layer + fallback
 *
 * On mount:
 *   1. Check prefers-reduced-motion and navigator.connection.saveData.
 *   2. If either is true, skip video — apply fallback gradient.
 *   3. Otherwise attempt to load & play the <video>.
 *   4. If video errors, fall back to gradient.
 *   5. Publish hero:ready once resolved either way.
 *
 * Uses loading="lazy" and defers video load for graceful degradation.
 */

import { emit } from './state.js';

export function initHero() {
  const bg = document.querySelector('.video-bg');
  if (!bg) { emit('hero:ready'); return; }

  const video = bg.querySelector('video');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;

  if (reduceMotion || saveData || !video) {
    applyFallback(bg);
    return;
  }

  /* Defer video load until critical content is ready */
  if (document.readyState === 'complete') {
    loadVideo(bg, video);
  } else {
    window.addEventListener('load', () => loadVideo(bg, video), { once: true });
  }
}

function loadVideo(bg, video) {
  video.addEventListener('canplaythrough', () => {
    video.play().catch(() => applyFallback(bg));
    emit('hero:ready');
  }, { once: true });

  video.addEventListener('error', () => applyFallback(bg), { once: true });

  /* Start loading */
  if (video.src || video.querySelector('source')) {
    video.load();
  }

  /* Fallback timeout */
  setTimeout(() => {
    if (video.readyState < 3) applyFallback(bg);
  }, 8000);
}

function applyFallback(bg) {
  bg.classList.add('fallback');
  emit('hero:ready');
}
