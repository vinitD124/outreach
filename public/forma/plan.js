/* The room draws itself, one stage at a time. A true axonometric
   projected from metres, so the geometry is measured rather than drawn
   by eye — the same language as the blueprint section above it. */
(() => {
  const host = document.querySelector('.services > div:first-child');
  if (!host) return;

  const K = Math.cos(Math.PI / 6);
  const W = 6, D = 4.2, H = 2.7;
  const p = (x, y, z) => ((x - y) * K).toFixed(3) + ',' + ((x + y) * 0.5 - (z || 0)).toFixed(3);
  const pts = list => list.map(q => p(q[0], q[1], q[2])).join(' ');

  let n = 0;
  const el = (tag, attrs) =>
    '<' + tag + ' ' + Object.entries(attrs).map(([k, v]) => k + '="' + v + '"').join(' ') +
    ' pathLength="1" style="--i:' + (n++) + '"></' + tag + '>';
  const line = (a, b, cls) => el('polyline', { points: pts([a, b]), class: cls || 'ln' });
  const face = (list, cls) => el('polygon', { points: pts(list), class: cls || 'ln' });
  const text = (x, y, z, s, cls) =>
    '<text x="' + ((x - y) * K).toFixed(3) + '" y="' + ((x + y) * 0.5 - (z || 0)).toFixed(3) +
    '" class="tx ' + (cls || '') + '" style="--i:' + (n++) + '">' + s + '</text>';

  const box = (x0, y0, x1, y1, h) =>
    face([[x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, y0, h]], 'ln side') +
    face([[x0, y1, 0], [x1, y1, 0], [x1, y1, h], [x0, y1, h]], 'ln side') +
    face([[x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]], 'ln top');

  const dim = (a, b, tick) =>
    line(a, b, 'ln dim') +
    line(tick[0], tick[1], 'ln dim') +
    line(tick[2], tick[3], 'ln dim');

  const stage = html => { n = 0; return html; };

  /* 01 — a plot and its measurements, nothing more. */
  const site = stage(
    face([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], 'ln slab') +
    dim([0, D + .95, 0], [W, D + .95, 0],
        [[0, D + .78, 0], [0, D + 1.12, 0], [W, D + .78, 0], [W, D + 1.12, 0]]) +
    dim([W + .95, 0, 0], [W + .95, D, 0],
        [[W + .78, 0, 0], [W + 1.12, 0, 0], [W + .78, D, 0], [W + 1.12, D, 0]]) +
    text(W / 2 - .5, D + 1.75, 0, '6.00') +
    text(W + 1.95, D / 2 - .35, 0, '4.20')
  );

  /* 02 — two walls rise, with the openings cut from them. */
  const walls = stage(
    face([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]]) +
    face([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]]) +
    face([[1.6, 0, .9], [4.4, 0, .9], [4.4, 0, 2.3], [1.6, 0, 2.3]], 'ln open') +
    face([[0, 2.6, 0], [0, 3.5, 0], [0, 3.5, 2.1], [0, 2.6, 2.1]], 'ln open') +
    dim([W + .95, -.75, 0], [W + .95, -.75, H],
        [[W + .78, -.75, 0], [W + 1.12, -.75, 0], [W + .78, -.75, H], [W + 1.12, -.75, H]]) +
    text(W + 1.95, -1.1, H / 2 - .12, '2.70')
  );

  /* 03 — the surfaces. Plaster, then the fluted oak, then the boards. */
  let mat = face([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], 'fl plaster') +
            face([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], 'fl plaster') +
            face([[1.6, 0, .9], [4.4, 0, .9], [4.4, 0, 2.3], [1.6, 0, 2.3]], 'fl void') +
            face([[0, 2.6, 0], [0, 3.5, 0], [0, 3.5, 2.1], [0, 2.6, 2.1]], 'fl void');
  for (let x = 4.55; x < W; x += .14) mat += line([x, 0, 0], [x, 0, H], 'ln flute');
  for (let y = .42; y < D; y += .42) mat += line([0, y, 0], [W, y, 0], 'ln grain');
  mat = stage(mat);

  /* 04 — daylight through the opening, then the things you live with. */
  const room = stage(
    face([[1.35, .05, 0], [4.65, .05, 0], [5.45, 3.4, 0], [.55, 3.4, 0]], 'fl light') +
    face([[1.1, 1.35, 0], [4.9, 1.35, 0], [4.9, 3.3, 0], [1.1, 3.3, 0]], 'ln rug') +
    box(.25, .6, .8, 2.3, .5) +
    box(1.5, .25, 4.3, 1.2, .8) +
    box(2.3, 1.75, 3.5, 2.55, .42) +
    box(4.7, 2.7, 5.6, 3.6, .85) +
    box(5.1, .5, 5.7, 1.1, 1.3)
  );

  const fig = document.createElement('figure');
  fig.className = 'room-plan';
  fig.dataset.at = 0;
  fig.innerHTML =
    '<svg viewBox="-5 -4.2 12.6 11.6" role="img" aria-label="An axonometric drawing of the room, built up stage by stage">' +
    '<g data-stage="0">' + site + '</g>' +
    '<g data-stage="1">' + walls + '</g>' +
    '<g data-stage="2">' + mat + '</g>' +
    '<g data-stage="3">' + room + '</g>' +
    '</svg>' +
    '<figcaption><span class="plan-step">01 / CONVERSATION</span><span>AXONOMETRIC · 1:50</span></figcaption>';

  host.append(fig);

  const groups = [...fig.querySelectorAll('[data-stage]')];
  const label = fig.querySelector('.plan-step');
  const names = ['CONVERSATION', 'DRAWING', 'MATERIAL', 'HANDOVER'];

  addEventListener('forma:stage', e => {
    const i = e.detail;
    groups.forEach((g, j) => g.classList.toggle('on', j <= i));
    fig.dataset.at = i;
    label.textContent = '0' + (i + 1) + ' / ' + names[i];
  });
})();
