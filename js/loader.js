/* loader.js — custom loading screen controller
 *
 * Shows a minimal dot-pulse overlay until content:ready fires,
 * then fades out and removes itself from the DOM.
 */

import { on } from './state.js';

export function initLoader() {
  const el = document.querySelector('.loader-screen');
  if (!el) return;

  on('content:ready', () => {
    el.classList.add('hidden');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  });
}
