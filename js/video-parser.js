/* video-parser.js — parse videos.md into structured data
 *
 * Reads /content/videos.md (category-grouped list format),
 * returns an array of { title, category, youtube_id, date, tags }.
 */

/**
 * Parse videos.md content into structured entries.
 * Expected format:
 *   ## Category Name
 *   - title: ...
 *     youtube_id: ...
 *     date: ...
 *     tags: ...
 */
export async function parseVideos(url = 'content/videos.md') {
  const res = await fetch(url);
  if (!res.ok) return [];
  const raw = await res.text();

  const entries = [];
  let currentCategory = '';

  /* strip frontmatter if present */
  const body = raw.replace(/^---[\s\S]*?---\s*\n/, '');

  for (const line of body.split('\n')) {
    const trimmed = line.trim();

    /* category heading */
    const heading = trimmed.match(/^##\s+(.+)$/);
    if (heading) {
      currentCategory = heading[1].trim();
      continue;
    }

    /* new entry start */
    if (trimmed.startsWith('- title:')) {
      entries.push({
        title: trimmed.replace('- title:', '').trim(),
        category: currentCategory,
        youtube_id: '',
        date: '',
        tags: [],
      });
      continue;
    }

    /* continuation fields (indented under an entry) */
    if (entries.length > 0) {
      const entry = entries[entries.length - 1];
      const kv = trimmed.match(/^(\w+):\s*(.+)$/);
      if (kv) {
        const key = kv[1];
        let val = kv[2].trim();
        if (key === 'tags') {
          val = val.split(',').map(s => s.trim()).filter(Boolean);
        }
        entry[key] = val;
      }
    }
  }

  return entries;
}
