/* nav.js — navigation utilities (mobile menu, theme toggle)
 *
 * Handles:
 *   - Hamburger menu toggle for mobile
 *   - Theme switcher integration
 *   - Active link highlighting
 *   - Nav transparency on scroll
 */

import { toggleTheme, getTheme } from './theme.js';

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

export function initNav() {
  const trigger = document.querySelector('.nav-dropdown-trigger');
  const menu = document.querySelector('.nav-dropdown-menu');
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const nav = document.querySelector('.site-nav');

  if (!trigger || !menu) return;

  /* Toggle menu on click */
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('visible');
  });

  /* Close menu when clicking outside */
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== trigger) {
      menu.classList.remove('visible');
    }
  });

  /* Theme toggle */
  themeToggles.forEach(toggle => {
    updateThemeIcon(toggle);
    toggle.addEventListener('click', () => {
      toggleTheme();
      themeToggles.forEach(t => updateThemeIcon(t));
    });
  });

  /* Nav transparency on scroll */
  if (nav) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
    }, { passive: true });
  }
}

function updateThemeIcon(el) {
  const icon = el.querySelector('.theme-toggle-icon');
  if (!icon) return;
  const isDark = getTheme() === 'dark';
  icon.innerHTML = isDark ? sunIcon : moonIcon;
}
