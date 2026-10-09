/* blog-parser.js — fetch blog index, parse posts, render listing + single post
 *
 * Fetches /content/blog-index.json to discover post filenames,
 * then fetches and parses each .md file via md-utils.js.
 *
 * Renders into:
 *   - .blog-list container (listing view)
 *   - .blog-post container (single post, driven by ?post= query param)
 */

import { parseFrontmatter, mdToHtml } from './md-utils.js';

const BLOG_DIR   = 'content/blog/';
const INDEX_FILE = 'content/blog-index.json';

/**
 * Fetch and parse all blog posts.
 * Returns array of { slug, meta, html } sorted by date descending.
 */
async function loadPosts(basePath = '') {
  const res = await fetch(basePath + INDEX_FILE);
  if (!res.ok) return [];
  const filenames = await res.json();

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      try {
        const r = await fetch(basePath + BLOG_DIR + filename);
        if (!r.ok) return null;
        const raw = await r.text();
        const { meta, body } = parseFrontmatter(raw);
        return {
          slug: filename.replace(/\.md$/, ''),
          meta,
          html: mdToHtml(body),
        };
      } catch (_) { return null; }
    })
  );

  return posts
    .filter(Boolean)
    .sort((a, b) => (b.meta.date || '').localeCompare(a.meta.date || ''));
}

/**
 * Render blog listing into .blog-list container.
 */
function renderListing(container, posts, linkBase = '') {
  container.innerHTML = '';

  if (posts.length === 0) {
    container.innerHTML = '<p class="t-body" style="color:var(--ink-muted);">No posts yet.</p>';
    return;
  }

  for (const post of posts) {
    const entry = document.createElement('article');
    entry.className = 'blog-entry';

    const tags = Array.isArray(post.meta.tags)
      ? post.meta.tags.map(t => `<span class="t-micro">${t}</span>`).join(' · ')
      : '';

    entry.innerHTML = `
      <a href="${linkBase}?post=${post.slug}" style="display:block;">
        <p class="t-micro" style="margin-bottom:0.3rem;">${post.meta.date || ''}</p>
        <h3 class="t-heading" style="margin-bottom:0.4rem;">${post.meta.title || post.slug}</h3>
        ${tags ? `<p style="margin-top:0.3rem;">${tags}</p>` : ''}
      </a>
    `;
    container.appendChild(entry);
  }
}

/**
 * Render a single post into .blog-post container.
 */
function renderPost(container, post) {
  container.innerHTML = `
    <p class="t-micro" style="margin-bottom:0.5rem;">${post.meta.date || ''}</p>
    <h1 class="t-display" style="margin-bottom:1.5rem;">${post.meta.title || ''}</h1>
    <div class="t-body">${post.html}</div>
  `;
}

/* --- Init ------------------------------------------------- */

export async function initBlog({ listContainer, postContainer, navContainer, basePath = '', linkBase = '' } = {}) {
  const params = new URLSearchParams(window.location.search);
  const postSlug = params.get('post');

  const posts = await loadPosts(basePath);
  const bannerContainer = document.querySelector('.blog-banner');

  if (postSlug && postContainer) {
    const post = posts.find(p => p.slug === postSlug);
    if (post) {
      renderPost(postContainer, post);
      if (listContainer) listContainer.style.display = 'none';
      if (bannerContainer) bannerContainer.style.display = 'none';
      if (navContainer) navContainer.style.display = 'block';
    } else {
      /* post not found — show listing */
      if (listContainer) renderListing(listContainer, posts, linkBase);
      if (bannerContainer) bannerContainer.style.display = 'flex';
      if (navContainer) navContainer.style.display = 'none';
    }
  } else {
    if (listContainer) renderListing(listContainer, posts, linkBase);
    if (bannerContainer) bannerContainer.style.display = 'flex';
    if (postContainer) postContainer.style.display = 'none';
    if (navContainer) navContainer.style.display = 'none';
  }

  return posts;
}
