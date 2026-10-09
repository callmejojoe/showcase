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

const gazettePalette = {
  '--ink':        '#1a1208',
  '--ink-muted':  '#6b5a3e',
  '--paper':      '#ede0c4',
  '--paper-rgb':  '237,224,196',
  '--accent':     '#8b1a1a',
  '--accent-hover':'#a0720c',
  '--line':       '#c4a86b',
  '--scrim':      'rgba(237,224,196,0.85)',
  '--blur':       '12px',
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
  } else if (saved === 'gazette') {
    document.body.classList.add('gazette-theme');
    applyTheme(gazettePalette);
  } else {
    applyTheme(darkPalette);
  }
  emit('theme:ready');
}

export function toggleTheme() {
  const current = getTheme();

  // Cycle: dark → light → gazette → dark
  document.body.classList.remove('light-theme', 'gazette-theme');

  let newTheme, newPalette;
  if (current === 'dark') {
    newTheme = 'light';
    newPalette = lightPalette;
    document.body.classList.add('light-theme');
  } else if (current === 'light') {
    newTheme = 'gazette';
    newPalette = gazettePalette;
    document.body.classList.add('gazette-theme');
  } else {
    newTheme = 'dark';
    newPalette = darkPalette;
  }

  applyTheme(newPalette);
  localStorage.setItem('theme', newTheme);
  emit('theme:changed', newTheme);
}

export function getTheme() {
  if (document.body.classList.contains('light-theme')) return 'light';
  if (document.body.classList.contains('gazette-theme')) return 'gazette';
  return 'dark';
}
