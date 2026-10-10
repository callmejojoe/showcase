/* loader.js — custom loading screen controller
 *
 * Shows a minimal dot-pulse overlay until content:ready fires (or window loads),
 * then fades out. Extends to intercept local navigation and show loader before unloading.
 */

import { on, emit } from './state.js';

export function initLoader() {
  const el = document.querySelector('.loader-screen');
  if (!el) return;

  // Make sure it hides even if content:ready isn't emitted by page script
  window.addEventListener('load', () => emit('content:ready'));

  on('content:ready', () => {
    // Add a slight delay so it feels natural
    setTimeout(() => {
      el.classList.add('hidden');
      el.style.pointerEvents = 'none';
      // Don't remove from DOM so we can reuse it on page transition
    }, 150);
  });

  // Intercept links to same site
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');

    // Ignore if not a link, has no href, or targets a new tab
    if (!anchor || !anchor.href || anchor.target === '_blank') return;

    const url = new URL(anchor.href);

    // Only intercept local navigation that isn't just an anchor link (#work)
    if (url.origin === window.location.origin) {
      if (url.pathname !== window.location.pathname) {
        // It's a different local page
        e.preventDefault();

        // Show loader
        el.classList.remove('hidden');
        el.style.pointerEvents = 'all';

        // Wait for fade in, then navigate
        setTimeout(() => {
          window.location.href = url.toString();
        }, 300); // Should match CSS transition duration
      } else if (url.search !== window.location.search) {
        // Only checking query params (like blog.html?post=...)
        e.preventDefault();

        el.classList.remove('hidden');
        el.style.pointerEvents = 'all';

        setTimeout(() => {
          window.location.href = url.toString();
        }, 300);
      }
    }
  });
}
