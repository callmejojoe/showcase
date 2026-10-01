/* scroll-utils.js — go-to-top button controller
 *
 * Shows/hides a floating button based on scroll position.
 */

export function initGoTop() {
  const btn = document.querySelector('.go-top');
  if (!btn) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const scrolled = window.scrollY > 400;
      btn.classList.toggle('visible', scrolled);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  onScroll(); /* initial check */
}
