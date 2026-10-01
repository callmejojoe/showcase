/* contact-form.js — validation + dual submit (Discord webhook + Google Sheets)
 *
 * Each endpoint fires independently — one failing doesn't block the other.
 * Includes honeypot spam check and submit-button disable on send.
 *
 * Endpoint URLs are placeholders until the real ones are set up.
 */

const DISCORD_WEBHOOK = ''; /* set before launch */
const SHEETS_ENDPOINT = ''; /* Google Apps Script URL — set before launch */

export function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* honeypot check */
    const hp = form.querySelector('[name="website"]');
    if (hp && hp.value) return; /* bot filled it */

    const btn = form.querySelector('.btn-submit');
    const msg = form.querySelector('.form-msg');
    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      showMsg(msg, 'Please fill in all fields.', 'warn');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';

    const payload = { name, email, message, ts: new Date().toISOString() };

    const results = await Promise.allSettled([
      sendDiscord(payload),
      sendSheets(payload),
    ]);

    const anyOk = results.some(r => r.status === 'fulfilled');

    if (anyOk) {
      showMsg(msg, 'Message sent — thank you!', 'ok');
      form.reset();
    } else {
      showMsg(msg, 'Something went wrong. Please try again or reach out directly.', 'warn');
    }

    btn.disabled = false;
    btn.textContent = 'Send Message';
  });
}

async function sendDiscord(payload) {
  if (!DISCORD_WEBHOOK) throw new Error('No Discord webhook configured');
  const res = await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `**New contact**\nName: ${payload.name}\nEmail: ${payload.email}\nMessage: ${payload.message}\nTime: ${payload.ts}`,
    }),
  });
  if (!res.ok) throw new Error(res.status);
}

async function sendSheets(payload) {
  if (!SHEETS_ENDPOINT) throw new Error('No Sheets endpoint configured');
  const res = await fetch(SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(res.status);
}

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.style.color = type === 'ok' ? 'var(--accent)' : 'var(--ink-muted)';
}
