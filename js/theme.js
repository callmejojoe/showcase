/* theme.js — studio-editorial palette with light/dark modes
 *
 * Single source of truth for accent color, ink, paper, and rule colors.
 * Injects CSS custom properties into :root on load.
 * Supports toggling between light and dark themes.
 */

import { emit } from './state.js';

const darkPalette = {
  '--ink':        '#e8e0d8',
  '--ink-muted':  'rgba(232,224,216,0.55)',
  '--paper':      '#141211',
  '--paper-rgb':  '20,18,17',
  '--accent':     '#c4453a',
  '--accent-hover':'#d8564b',
  '--line':       'rgba(232,224,216,0.12)',
  '--scrim':      'rgba(20,18,17,0.72)',
  '--blur':       '18px',
};

const lightPalette = {
  '--ink':        '#1a1a1a',
  '--ink-muted':  'rgba(26,26,26,0.6)',
  '--paper':      '#f5f3f0',
  '--paper-rgb':  '245,243,240',
  '--accent':     '#c4453a',
  '--accent-hover':'#d8564b',
  '--line':       'rgba(26,26,26,0.15)',
  '--scrim':      'rgba(245,243,240,0.75)',
  '--blur':       '18px',
};

function applyTheme(palette) {
  const root = document.documentElement.style;
  for (const [prop, value] of Object.entries(palette)) {
    root.setProperty(prop, value);
  }
}

export function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    document.body.classList.add('light-theme');
    applyTheme(lightPalette);
  } else {
    applyTheme(darkPalette);
  }
  emit('theme:ready');
}

export function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  applyTheme(isLight ? lightPalette : darkPalette);
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  emit('theme:changed', isLight ? 'light' : 'dark');
}

export function getTheme() {
  return document.body.classList.contains('light-theme') ? 'light' : 'dark';
}
