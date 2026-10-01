/* md-utils.js — shared frontmatter & markdown parsing
 *
 * Lightweight, no dependencies. Handles:
 *   - YAML-style frontmatter between --- fences
 *   - Basic markdown → HTML (headings, bold, italic, code, links, paragraphs)
 *
 * Intentionally minimal — not a full markdown spec implementation.
 */

/**
 * Parse frontmatter from a markdown string.
 * Returns { meta: {}, body: string }
 */
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw.trim() };

  const meta = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const kv = line.match(/^(\w[\w\s]*?):\s*(.+)$/);
    if (kv) {
      const key = kv[1].trim().toLowerCase().replace(/\s+/g, '_');
      let val = kv[2].trim();
      /* handle comma-separated lists */
      if (val.includes(',')) {
        val = val.split(',').map(s => s.trim()).filter(Boolean);
      }
      meta[key] = val;
    }
  }

  return { meta, body: match[2].trim() };
}

/**
 * Convert basic markdown to HTML.
 * Supports: h1-h3, bold, italic, inline code, code blocks, links, paragraphs.
 */
export function mdToHtml(md) {
  let html = md
    /* code blocks (``` ... ```) */
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`)
    /* headings */
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    /* bold & italic */
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    /* inline code */
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    /* links */
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  /* wrap loose lines in <p> tags */
  html = html
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[1-6]|pre|ul|ol|li|blockquote)/.test(block)) return block;
      return `<p>${block}</p>`;
    })
    .join('\n');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
