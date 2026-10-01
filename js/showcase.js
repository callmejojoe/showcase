/* showcase.js — generic collapsible category component
 *
 * Config-driven: takes { label, count, items, renderItem } per category.
 * Multiple categories can be open simultaneously (not accordion-exclusive).
 * Wired into state.js via category:toggled events.
 */

import { emit } from './state.js';
import { parseVideos } from './video-parser.js';
import { fetchRepos } from './github.js';

/**
 * Render a collapsible category into a container.
 * @param {HTMLElement} container
 * @param {{ label: string, count: number, items: Array, renderItem: function }} config
 */
function createCategory(container, { label, count, items, renderItem }) {
  const section = document.createElement('div');
  section.className = 'category';

  /* header */
  const header = document.createElement('div');
  header.className = 'category-header';
  header.innerHTML = `
    <span class="t-heading">${label} <span class="category-count t-micro">(${count})</span></span>
    <span class="toggle-icon">+</span>
  `;

  /* body */
  const body = document.createElement('div');
  body.className = 'category-body';

  const grid = document.createElement('div');
  grid.className = 'grid-3';
  grid.style.padding = '1.5rem 0';

  items.forEach(item => {
    const card = renderItem(item);
    if (card) grid.appendChild(card);
  });

  body.appendChild(grid);
  section.appendChild(header);
  section.appendChild(body);
  container.appendChild(section);

  /* toggle */
  header.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    body.classList.toggle('open', open);
    emit('category:toggled', { category: label, open });
  });
}

/* --- Card renderers --------------------------------------- */

function renderVideoCard(item) {
  const card = document.createElement('a');
  card.className = 'work-card';
  card.href = `https://www.youtube.com/watch?v=${item.youtube_id}`;
  card.target = '_blank';
  card.rel = 'noopener';

  card.innerHTML = `
    <div class="thumb clip-torn">
      <img src="https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg"
           alt="${item.title}" loading="lazy">
    </div>
    <div class="play-overlay t-small">▶ Play</div>
    <div class="card-info">
      <p class="t-body">${item.title}</p>
      <p class="t-micro">${item.date || ''}</p>
    </div>
  `;
  return card;
}

function renderRepoCard(repo) {
  const card = document.createElement('a');
  card.className = 'work-card';
  card.href = repo.url;
  card.target = '_blank';
  card.rel = 'noopener';

  card.innerHTML = `
    <div class="card-info" style="padding:1.2rem 1rem;">
      <p class="t-body" style="margin-bottom:0.4rem;">${repo.name}</p>
      <p class="t-small" style="color:var(--ink-muted);margin-bottom:0.8rem;">
        ${repo.description || '<em>No description</em>'}
      </p>
      <div class="repo-meta t-micro">
        ${repo.language ? `<span>${repo.language}</span>` : ''}
        <span>★ ${repo.stars}</span>
      </div>
    </div>
  `;
  return card;
}

/* --- Init ------------------------------------------------- */

export async function initShowcase() {
  const container = document.getElementById('work');
  if (!container) return;

  /* Video entries */
  const videos = await parseVideos();
  const videosByCategory = {};
  videos.forEach(v => {
    (videosByCategory[v.category] ||= []).push(v);
  });

  for (const [cat, items] of Object.entries(videosByCategory)) {
    createCategory(container, {
      label: cat,
      count: items.length,
      items,
      renderItem: renderVideoCard,
    });
  }

  /* GitHub repos */
  const repos = await fetchRepos();
  if (repos.length > 0) {
    createCategory(container, {
      label: 'GitHub',
      count: repos.length,
      items: repos,
      renderItem: renderRepoCard,
    });
  }
}
