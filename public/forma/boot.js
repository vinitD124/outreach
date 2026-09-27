/* The title sheet. It holds until the photographs are actually decoded,
   so the hero is never revealed half-painted, and it lifts on a floor
   and a ceiling so a fast connection still gets a beat and a slow one
   is never held hostage. */
(() => {
  const boot = document.getElementById('boot');
  if (!boot) return;

  const out = () => {
    boot.classList.add('is-out');
    document.body.classList.remove('is-booting');
    setTimeout(() => boot.remove(), 1000);
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { boot.remove(); return; }

  document.body.classList.add('is-booting');
  const count = boot.querySelector('.boot-count');

  const imgs = [...document.images].filter(i => !i.loading || i.loading !== 'lazy');
  const total = Math.max(1, imgs.length);
  let done = imgs.filter(i => i.complete).length;
  const tick = () => { done++; };
  imgs.forEach(i => { if (!i.complete) { i.addEventListener('load', tick); i.addEventListener('error', tick); } });

  const MIN = 1000, MAX = 2200;
  /* Timers still run where rAF is throttled, so this is what guarantees
     the hero is handed back its animation. */
  const hardStop = setTimeout(() => finish(), MAX);
  const start = performance.now();
  let shown = 0, closing = false;

  const frame = () => {
    if (closing) return;
    const ms = performance.now() - start;
    const target = Math.min(done / total, ms / MIN);
    shown += (Math.min(1, target) - shown) * .2;
    const pct = Math.round(shown * 100);
    count.textContent = String(Math.min(99, pct)).padStart(2, '0');
    boot.style.setProperty('--p', Math.min(100, pct) + '%');
    if ((ms > MIN && done >= total) || ms > MAX) return finish();
    requestAnimationFrame(frame);
  };

  function finish() {
    if (closing) return;
    closing = true;
    clearTimeout(hardStop);
    count.textContent = '100';
    boot.style.setProperty('--p', '100%');
    setTimeout(out, 150);
  }

  requestAnimationFrame(frame);

  /* Nobody should be trapped behind it. */
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e =>
    addEventListener(e, finish, { once: true, passive: true }));
})();
