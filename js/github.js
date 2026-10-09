/* github.js — GitHub API fetch + localStorage cache + static fallback
 *
 * Fetch chain:
 *   1. Live GitHub API (unauthenticated, 60 req/hr limit)
 *   2. localStorage cache (with TTL check)
 *   3. /content/github-fallback.json (static curated list)
 *
 * Exports normalized { name, description, language, stars, url } objects.
 */

const CACHE_KEY  = 'gh_repos';
const CACHE_TTL  = 1000 * 60 * 30; /* 30 minutes */
const API_URL    = 'https://api.github.com/users/callmejojoe/repos?sort=updated&per_page=20';
const FALLBACK   = 'content/github-fallback.json';
const WHITELIST  = 'content/github-whitelist.json';

export async function fetchRepos() {
  /* Load whitelist first */
  const whitelist = await loadWhitelist();

  /* 1. try localStorage cache first */
  const cached = loadCache();
  if (cached) return filterByWhitelist(cached, whitelist);

  /* 2. try live API */
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const repos = normalize(data);
    saveCache(repos);
    return filterByWhitelist(repos, whitelist);
  } catch (_) {
    /* 3. static fallback */
    const fallback = await loadFallback();
    return filterByWhitelist(fallback, whitelist);
  }
}

function normalize(apiData) {
  return apiData
    .filter(r => !r.fork)
    .map(r => ({
      name:        r.name,
      description: r.description || '',
      language:    r.language || '',
      stars:       r.stargazers_count || 0,
      url:         r.html_url,
    }));
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, repos } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return repos;
  } catch (_) {
    return null;
  }
}

function saveCache(repos) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), repos }));
  } catch (_) { /* storage full or unavailable — ignore */ }
}

async function loadFallback() {
  try {
    const res = await fetch(FALLBACK);
    const data = await res.json();
    return data.repos || [];
  } catch (_) {
    return [];
  }
}

async function loadWhitelist() {
  try {
    const res = await fetch(WHITELIST);
    const data = await res.json();
    return data.repos || [];
  } catch (_) {
    /* If whitelist doesn't exist or fails to load, show all repos */
    return null;
  }
}

function filterByWhitelist(repos, whitelist) {
  /* If no whitelist, return all repos */
  if (!whitelist || whitelist.length === 0) return repos;

  /* Filter repos to only those in the whitelist */
  return repos.filter(repo => whitelist.includes(repo.name));
}
