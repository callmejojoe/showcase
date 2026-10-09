/* md-utils.js — shared frontmatter & markdown parsing
 *
 * Handles both standard Markdown and Obsidian formatting:
 *   - YAML-style frontmatter between --- fences
 *   - Standard markdown (headings, bold, italic, code, links, lists, blockquotes)
 *   - Obsidian features (wiki links, highlights, callouts, strikethrough, footnotes, tables)
 *
 * Converts Obsidian-specific syntax to standard HTML for web display.
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
 * Convert markdown (standard + Obsidian) to HTML.
 */
export function mdToHtml(md) {
  let html = md;

  /* Step 1: Code blocks (must come first to protect their content) */
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`);

  /* Step 2: Obsidian callouts/admonitions */
  html = html.replace(/^> \[!(\w+)\]([+-]?)\s*(.*)$((?:\n> .*)*)/gm, (match, type, fold, title, content) => {
    const typeClass = type.toLowerCase();
    const contentHtml = content.replace(/^> /gm, '').trim();
    const titleText = title || type.charAt(0).toUpperCase() + type.slice(1);
    return `<div class="callout callout-${typeClass}"><div class="callout-title">${titleText}</div><div class="callout-content">${contentHtml}</div></div>`;
  });

  /* Step 3: Obsidian highlights */
  html = html.replace(/==([^=]+)==/g, '<mark>$1</mark>');

  /* Step 4: Obsidian wiki links [[...]] */
  html = html.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (match, target, display) => {
    const linkText = display || target;
    const href = target.replace(/\s+/g, '-').toLowerCase();
    return `<a href="#${href}" class="wiki-link">${linkText}</a>`;
  });

  /* Step 5: Obsidian tags #tag */
  html = html.replace(/(?:^|\s)(#[\w\/-]+)/g, ' <span class="tag">$1</span>');

  /* Step 6: Strikethrough */
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  /* Step 7: Tables */
  html = processMarkdownTables(html);

  /* Step 8: Task lists (Obsidian & standard) */
  html = html.replace(/^- \[ \] (.+)$/gm, '<li class="task-list-item"><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^- \[x\] (.+)$/gmi, '<li class="task-list-item"><input type="checkbox" checked disabled> $1</li>');

  /* Step 9: Blockquotes */
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  /* Step 10: Horizontal rules */
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  /* Step 11: Headings (h1-h6) */
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  /* Step 12: Lists (ordered and unordered) */
  html = processMarkdownLists(html);

  /* Step 13: Inline formatting (order matters!) */
  /* Bold (** or __) */
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  /* Italic (* or _) - avoid already processed bold */
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

  /* Inline code */
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  /* Step 14: Links and images */
  /* Images ![alt](url) */
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

  /* Links [text](url) */
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    const external = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${url}"${external}>${text}</a>`;
  });

  /* Footnotes [^1] */
  html = html.replace(/\[\^(\d+)\]/g, '<sup class="footnote-ref"><a href="#fn$1">$1</a></sup>');

  /* Step 15: Wrap loose text in paragraphs */
  html = html
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      /* Don't wrap if already HTML element */
      if (/^<(h[1-6]|pre|ul|ol|blockquote|hr|div|table|img)/.test(block)) return block;
      /* Don't wrap list items */
      if (/^<li/.test(block)) return block;
      return `<p>${block}</p>`;
    })
    .join('\n');

  return html;
}

/**
 * Process markdown tables
 */
function processMarkdownTables(text) {
  const lines = text.split('\n');
  const result = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    /* Table row detection */
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);

      /* Check if next line exists and is not a table row */
      if (i === lines.length - 1 || !lines[i + 1].trim().startsWith('|')) {
        result.push(buildTable(tableRows));
        inTable = false;
        tableRows = [];
      }
    } else {
      if (inTable) {
        result.push(buildTable(tableRows));
        inTable = false;
        tableRows = [];
      }
      result.push(lines[i]);
    }
  }

  if (inTable && tableRows.length > 0) {
    result.push(buildTable(tableRows));
  }

  return result.join('\n');
}

function buildTable(rows) {
  if (rows.length < 2) return rows.join('\n');

  const header = rows[0].split('|').filter(Boolean).map(cell => cell.trim());
  const alignRow = rows[1];
  const bodyRows = rows.slice(2);

  let html = '<table><thead><tr>';
  header.forEach(cell => {
    html += `<th>${cell}</th>`;
  });
  html += '</tr></thead><tbody>';

  bodyRows.forEach(row => {
    const cells = row.split('|').filter(Boolean).map(cell => cell.trim());
    html += '<tr>';
    cells.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

/**
 * Process markdown lists (nested support)
 */
function processMarkdownLists(text) {
  const lines = text.split('\n');
  const result = [];
  let listStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);

    if (match) {
      const indent = match[1].length;
      const marker = match[2];
      const content = match[3];
      const isOrdered = /^\d+\./.test(marker);
      const listType = isOrdered ? 'ol' : 'ul';

      /* Determine nesting level */
      const level = Math.floor(indent / 2);

      /* Close deeper lists */
      while (listStack.length > level + 1) {
        const closed = listStack.pop();
        result.push(`</${closed}>`);
      }

      /* Open new list if needed */
      if (listStack.length === level) {
        result.push(`<${listType}>`);
        listStack.push(listType);
      }

      result.push(`<li>${content}</li>`);
    } else {
      /* Close all open lists */
      while (listStack.length > 0) {
        const closed = listStack.pop();
        result.push(`</${closed}>`);
      }
      result.push(line);
    }
  }

  /* Close remaining lists */
  while (listStack.length > 0) {
    const closed = listStack.pop();
    result.push(`</${closed}>`);
  }

  return result.join('\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
