/* hero-morph.js — scroll-linked morph controller
 *
 * Computes t ∈ [0, 1] based on scroll position over a configurable
 * morph distance. Interpolates hero title size, bio opacity/height,
 * nav pill visibility, dropdown trigger visibility, and bar padding.
 *
 * Publishes scroll:progress via state.js for any other module that
 * needs the morph value.
 */

import { emit } from './state.js';

const MORPH_DISTANCE = 260; /* px — tune against real content */

export function initHeroMorph() {
  const title    = document.querySelector('.hero-title');
  const bio      = document.querySelector('.hero-bio');
  const eyebrow  = document.querySelector('.hero-index');
  const nav      = document.querySelector('.site-nav');
  const pills    = document.querySelector('.nav-pills');
  const dropdown = document.querySelector('.nav-dropdown-trigger');
  const scrollCue = document.querySelector('.scroll-cue');

  if (!title || !nav) return;

  /* cache initial computed sizes */
  const titleStyle  = getComputedStyle(title);
  const startSize   = parseFloat(titleStyle.fontSize);
  const endSize     = Math.max(startSize * 0.35, 18); /* floor at 18px */

  const startPad = 1.2; /* rem */
  const endPad   = 0.5; /* rem */

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const t = Math.min(scrollY / MORPH_DISTANCE, 1);

      emit('scroll:progress', t);

      /* title font-size */
      const size = startSize + (endSize - startSize) * t;
      title.style.fontSize = size + 'px';

      /* bio collapse */
      if (bio) {
        bio.style.opacity = 1 - t;
        bio.style.maxHeight = (1 - t) * 400 + 'px';
      }

      /* eyebrow fade */
      if (eyebrow) {
        eyebrow.style.opacity = 1 - t;
      }

      /* nav bar padding */
      const pad = startPad + (endPad - startPad) * t;
      nav.style.padding = pad + 'rem 0';

      /* nav pills fade out, dropdown fades in */
      if (pills) pills.style.opacity = 1 - t;
      // for the sake of debugging
      // console.log(pills.style.opacity);
      if (dropdown) {
        dropdown.style.opacity = t;
        console.log(dropdown.style.opacity);
        console.log(!dropdown.style.opacity == pills.style.opacity);
        dropdown.style.display = t > 0.9 ? 'block' : 'none';
        dropdown.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
      }

      /* scroll cue fade */
      if (scrollCue) {
        scrollCue.style.opacity = Math.max(0, 0.4 - t * 2);
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* run once on init in case page loaded scrolled */
}
