/* Drawing to room. Replaces the material atelier with a comparison the
   visitor drives: the same space as a drawing on one side and as built
   on the other, so the two halves are the same room rather than two
   unrelated stock photographs. */
(() => {
  const host = document.querySelector('.intro');
  if (!host) return;

  const study = document.createElement('section');
  study.id = 'atelier';
  study.className = 'reveal-study';
  study.innerHTML = [
    '<div class="rs-top">',
    '<div class="eyebrow"><i></i> FROM DRAWING TO ROOM / 02</div>',
    '<span>THE SAME SPACE, TWICE</span>',
    '</div>',
    '<div class="rs-head">',
    '<h2>From the line.<br><em>To the light.</em></h2>',
    '<p>Every room is a drawing before it is a place. Take the handle and see how far it travels.</p>',
    '</div>',
    '<div class="rs-stage">',
    '<img class="rs-shot rs-built" alt="The finished living room" src="assets/study/built.webp" srcset="assets/study/built-760.webp 760w, assets/study/built-1100.webp 1100w, assets/study/built.webp 1672w" sizes="88vw" decoding="async" loading="lazy">',
    '<div class="rs-drawn"><img class="rs-shot" alt="The same room as a dimensioned construction drawing" src="assets/study/drawn.webp" srcset="assets/study/drawn-760.webp 760w, assets/study/drawn-1100.webp 1100w, assets/study/drawn.webp 1672w" sizes="88vw" decoding="async" loading="lazy"></div>',
    '<div class="rs-bar"><b></b></div>',
    '<input class="rs-input" type="range" min="0" max="100" step="0.1" value="92" aria-label="Reveal the drawing or the finished room">',
    '</div>',
    '<div class="rs-foot">',
    '<span class="rs-tag rs-tag-l"><b>Drawn</b> Construction set · sheet 04</span>',
    '<span class="rs-tag rs-tag-r">Built on site <b>2026</b></span>',
    '</div>',
  ].join('');

  host.after(study);

  const stage = study.querySelector('.rs-stage');
  const input = study.querySelector('.rs-input');
  const put = (v) => {
    stage.style.setProperty('--split', v + '%');
    study.classList.toggle('rs-lo', v < 13);
    study.classList.toggle('rs-hi', v > 87);
  };
  put(92);

  input.addEventListener('input', () => { study.classList.add('rs-touched'); put(input.value); });

  /* On the way in it performs the wipe once, so the interaction explains
     itself without a label telling anyone to drag. Cancelled the moment
     the visitor takes over. */
  let played = false, raf = 0;
  const demo = () => {
    if (played || study.classList.contains('rs-touched')) return;
    played = true;
    const from = 92, to = 46, start = performance.now(), ms = 1150;
    const step = (now) => {
      if (study.classList.contains('rs-touched')) return;
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * e;
      put(v); input.value = v;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { put(50); input.value = 50; played = true; }

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    study.classList.toggle('is-inview', e.isIntersecting);
    if (e.isIntersecting) setTimeout(demo, 420);
  }), { threshold: 0.28 });
  io.observe(study);

  /* Dragging anywhere on the picture, not just on the handle. */
  let down = false;
  const fromPointer = (x) => {
    const r = stage.getBoundingClientRect();
    const v = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
    study.classList.add('rs-touched');
    cancelAnimationFrame(raf);
    put(v); input.value = v;
  };
  stage.addEventListener('pointerdown', (e) => {
    if (e.target === input) return;
    down = true; stage.setPointerCapture(e.pointerId); fromPointer(e.clientX);
  });
  stage.addEventListener('pointermove', (e) => { if (down) fromPointer(e.clientX); });
  stage.addEventListener('pointerup', () => { down = false; });
  stage.addEventListener('pointercancel', () => { down = false; });
})();
