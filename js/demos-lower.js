/* Nekyia — demonstrations for the collective unconscious and the core. */
(function () {
  const N = window.N, D = (N.demos = N.demos || {});
  const { TAU, clamp, lerp, sstep } = N.util;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ── The collective unconscious: islands on one floor ── */
  D.collective = (kit) => {
    const g = kit.ctx;
    const ISLES = ['you', 'a scribe in Ur', 'a Hopi grandmother', 'a child in Belfast', 'an alchemist in Basel', 'a fisherman in Kerala'];
    const MOTIFS = ['the flood', 'the journey below', 'the dying and rising god', 'the dark forest', 'the divine child', 'the great mother', 'the night sea crossing', 'the tree of the world'];
    let level = 0;
    kit.slider('Lower the water', 0, 1, 0, 0.01, (v) => { level = v; });
    kit.onFrame((t, dt) => {
      const { W, H } = kit, n = ISLES.length;
      const floorY = H * 0.9, water = lerp(H * 0.42, H * 0.93, level);
      g.fillStyle = '#0a0619'; g.fillRect(0, 0, W, H);
      // seabed and roots
      g.fillStyle = '#281a40'; g.beginPath(); g.moveTo(0, H);
      for (let i = 0; i <= 60; i++) { const x = i / 60 * W; g.lineTo(x, floorY - 18 * Math.sin(i * 0.5) - 10); } g.lineTo(W, H); g.fill();
      ISLES.forEach((name, i) => {
        const x = (i + 0.5) / n * W, peak = H * (0.3 + (i % 2) * 0.06), base = floorY - 20;
        const wiggle = Math.sin(t * 0.3 + i) * 6;
        g.fillStyle = '#3c2a5a'; g.beginPath(); g.moveTo(x - W / n * 0.5, base); g.quadraticCurveTo(x - W / n * 0.25, peak + 40, x + wiggle, peak); g.quadraticCurveTo(x + W / n * 0.25, peak + 40, x + W / n * 0.5, base); g.fill();
        g.strokeStyle = `rgba(216,186,255,${0.25 + 0.35 * level})`; g.lineWidth = 1.5;
        for (let r = 0; r < 3; r++) { g.beginPath(); g.moveTo(x, base - 30); g.bezierCurveTo(x + (r - 1) * 30, base + 10, W / 2 + (r - 1) * 40, floorY + 10, W / 2, H * 0.985); g.stroke(); }
        const above = peak < water;
        g.font = `${i === 0 ? 17 : 15}px Marcellus, serif`; g.textAlign = 'center'; g.fillStyle = above ? (i === 0 ? '#f1d49a' : 'rgba(239,231,244,.9)') : 'rgba(239,231,244,.4)';
        g.fillText(name, x, peak - 12);
      });
      // motifs appear as the floor is revealed
      MOTIFS.forEach((m, i) => {
        const x = (i + 0.5) / MOTIFS.length * W, y = floorY - 34 - (i % 2) * 26;
        const vis = sstep(0.35 + i * 0.07, 0.45 + i * 0.07, level);
        if (vis > 0) { g.font = 'italic 14px Spectral, serif'; g.fillStyle = `rgba(241,212,154,${vis * 0.9})`; g.fillText(m, x, y); }
      });
      // water
      const wg = g.createLinearGradient(0, water, 0, H); wg.addColorStop(0, 'rgba(70,60,140,.55)'); wg.addColorStop(1, 'rgba(20,12,50,.85)');
      g.fillStyle = wg; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 10) g.lineTo(x, water + Math.sin(x * 0.02 + t * 1.1) * 3); g.lineTo(W, H); g.fill();
      g.strokeStyle = 'rgba(230,225,255,.55)'; g.lineWidth = 1.2; g.beginPath(); for (let x = 0; x <= W; x += 10) g.lineTo(x, water + Math.sin(x * 0.02 + t * 1.1) * 3); g.stroke();
      N.vignette(g, W, H, 0.5);
      kit.caption(level < 0.3 ? 'Above the water, six separate lives across four thousand years. Nothing connects them that you can see.'
        : level < 0.75 ? 'Below the surface the islands widen and their roots run toward one another.'
        : 'They stand on a single floor. What they share is not memories but forms: the same motifs, filled with different lives. The people are illustrations; the motifs recur in myths worldwide.');
    });
    return {};
  };

  /* ── Archetypes: one pattern, many images ── */
  D.archetypes = (kit) => {
    const g = kit.ctx;
    const NP = 220;
    const CULT = [
      { name: 'The pattern', col: [226, 214, 248], text: 'Particles gathering into a shape that holds a smaller one. No face yet, no culture, no name: a form of relation.' },
      { name: 'Isis and Horus', col: [241, 205, 120], text: 'Egypt: Isis enthroned, nursing the infant Horus, with the sun disc between cow horns. One of the oldest images of the divine mother.' },
      { name: 'Madonna and Child', col: [150, 185, 255], text: 'Christian Europe: Mary with the Christ child, haloed, in a blue mantle. Scholars have long noted the visual echo of Isis and Horus.' },
      { name: 'Demeter and Persephone', col: [236, 190, 120], text: 'Greece: the grain mother and the daughter lost to the underworld and returned each spring. Jung wrote about them with Karl Kerényi.' },
      { name: 'Guanyin', col: [200, 240, 220], text: 'China: the bodhisattva of compassion, often seated on a lotus with a willow branch and vase, and in one popular form bringing children.' },
      { name: 'The archetype as such', col: [183, 154, 232], text: 'The archetype itself never settles into any image. Jung called it irrepresentable: we only ever see its images, coloured by the consciousness they appear in.' },
    ];
    let mode = 0;
    const P = Array.from({ length: NP }, () => ({ x: rnd(0, 1), y: rnd(0, 1), vx: 0, vy: 0, tx: 0.5, ty: 0.5 }));
    let col = [226, 214, 248];
    function shape(m) {
      const pts = [];
      const add = (x, y) => pts.push([x, y]);
      const arc = (cx, cy, r, a0, a1, n) => { for (let i = 0; i < n; i++) { const a = lerp(a0, a1, i / (n - 1)); add(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } };
      const line = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) add(lerp(x0, x1, i / (n - 1)), lerp(y0, y1, i / (n - 1))); };
      // shared pattern: enclosing arc + held figure
      arc(0.5, 0.48, 0.24, Math.PI * 0.15, Math.PI * 1.05, 60);
      arc(0.5, 0.2, 0.07, 0, TAU, 22);
      arc(0.55, 0.52, 0.06, 0, TAU, 18);
      if (m === 1) { line(0.3, 0.78, 0.7, 0.78, 20); line(0.3, 0.78, 0.3, 0.92, 8); line(0.7, 0.78, 0.7, 0.92, 8); arc(0.5, 0.1, 0.035, 0, TAU, 12); arc(0.44, 0.12, 0.05, Math.PI, TAU, 8); arc(0.56, 0.12, 0.05, Math.PI, TAU, 8); }
      if (m === 2) { arc(0.5, 0.2, 0.12, 0, TAU, 30); line(0.5, 0.26, 0.26, 0.86, 16); line(0.5, 0.26, 0.74, 0.86, 16); arc(0.55, 0.52, 0.1, 0, TAU, 12); }
      if (m === 3) { for (let k = 0; k < 5; k++) line(0.8, 0.8, 0.8 + (k - 2) * 0.03, 0.55, 8); arc(0.22, 0.62, 0.05, 0, TAU, 14); line(0.22, 0.67, 0.22, 0.85, 8); }
      if (m === 4) { for (let k = 0; k < 7; k++) arc(0.5 + (k - 3) * 0.06, 0.86, 0.045, Math.PI, TAU, 6); line(0.8, 0.3, 0.86, 0.55, 8); arc(0.8, 0.62, 0.035, 0, TAU, 10); }
      while (pts.length < NP) pts.push(pts[Math.floor(Math.random() * pts.length)]);
      return pts.slice(0, NP);
    }
    let targets = shape(0);
    kit.group(CULT.map((c) => c.name), (i) => { mode = i; if (i < 5) targets = shape(i); }, 0);
    kit.onFrame((t, dt) => {
      const { W, H } = kit, S = Math.min(W, H) * 0.95, ox = (W - S) / 2, oy = (H - S) / 2 + 10;
      g.fillStyle = '#08051a'; g.fillRect(0, 0, W, H);
      col = col.map((v, k) => lerp(v, CULT[mode].col[k], 1 - Math.pow(0.1, dt)));
      P.forEach((p, i) => {
        let tx, ty;
        if (mode === 5) { tx = 0.5 + Math.sin(t * 0.21 + i) * 0.34 * Math.sin(t * 0.07 + i * 0.3); ty = 0.5 + Math.cos(t * 0.17 + i * 1.3) * 0.34 * Math.cos(t * 0.05 + i); }
        else { tx = targets[i][0] + Math.sin(t + i) * 0.004; ty = targets[i][1] + Math.cos(t * 1.1 + i) * 0.004; }
        p.vx = (p.vx + (tx - p.x) * 3 * dt) * 0.92; p.vy = (p.vy + (ty - p.y) * 3 * dt) * 0.92;
        p.x += p.vx; p.y += p.vy;
        const x = ox + p.x * S, y = oy + p.y * S;
        g.fillStyle = `rgba(${col.map(Math.round).join(',')},${0.4 + 0.5 * Math.sin(t * 2 + i) ** 2})`;
        g.beginPath(); g.arc(x, y, 1.6 + (i % 5) * 0.4, 0, TAU); g.fill();
      });
      const gl = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, S * 0.5); gl.addColorStop(0, `rgba(${col.map(Math.round).join(',')},.08)`); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
      N.vignette(g, W, H, 0.5);
      kit.caption(`<b>${CULT[mode].name}.</b> ${CULT[mode].text}`);
    });
    return {};
  };

  /* ── Anima and animus: the figure in the water ── */
  D.anima = (kit) => {
    const g = kit.ctx;
    const STAGES = {
      anima: [['Eve', 'the purely instinctual, biological'], ['Helen', 'the romantic and aesthetic, still sexual'], ['Mary', 'love raised to spiritual devotion'], ['Sophia', 'wisdom beyond the purely human']],
      animus: [['Physical power', 'the athlete, the man of the body'], ['Initiative', 'the man of action and romance'], ['The word', 'the professor, the preacher, the one who speaks'], ['Meaning', 'a guide to spiritual meaning']],
    };
    let kind = 'anima', stage = 0, ripple = 0, projected = 0, projT = 0;
    kit.group(['Anima', 'Animus'], (i) => { kind = i ? 'animus' : 'anima'; }, 0);
    kit.slider('Stage', 0, 3, 0, 1, (v) => { stage = v; });
    const fall = kit.button('Fall for someone', () => { projected = !projected; projT = 0; fall.textContent = projected ? 'Take it back' : 'Fall for someone'; N.sound.pluck(projected ? 659.25 : 392, 0.06, 2.5); });
    kit.onDown = () => { ripple = 1; };
    kit.onFrame((t, dt) => {
      const { W, H } = kit, wl = H * 0.52, me = W * 0.34, S = Math.min(W, H) * 0.22;
      ripple = Math.max(0, ripple - dt * 0.5); if (projected) projT += dt;
      g.fillStyle = '#120b26'; g.fillRect(0, 0, W, wl);
      const wg = g.createLinearGradient(0, wl, 0, H); wg.addColorStop(0, '#221847'); wg.addColorStop(1, '#07041a'); g.fillStyle = wg; g.fillRect(0, wl, W, H - wl);
      g.fillStyle = 'rgb(236,228,244)'; N.figure(g, me, wl - S * 0.55, S);
      // the reflection: another figure
      const glow = projected ? 1 - sstep(0, 1.2, projT) : 1;
      for (let s = 0; s < 22; s++) {
        const y0 = wl + s * S * 0.06;
        g.save(); g.beginPath(); g.rect(0, y0, W, S * 0.06); g.clip();
        g.translate(Math.sin(t * 1.6 + s * 0.7) * (3 + ripple * 18), 0);
        g.globalAlpha = (0.75 - s * 0.03) * glow;
        drawOther(me, wl + S * 0.55, S, true, t);
        g.restore();
      }
      g.globalAlpha = 1;
      g.strokeStyle = 'rgba(236,228,255,.5)'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= W; x += 8) g.lineTo(x, wl + Math.sin(x * 0.04 + t * 1.3) * (1.5 + ripple * 5)); g.stroke();
      if (projected) {
        const k = sstep(0.3, 1.5, projT), ox = W * 0.74;
        const gl = g.createRadialGradient(ox, wl - S * 0.55, 0, ox, wl - S * 0.55, S * 1.4); gl.addColorStop(0, `rgba(241,212,154,${0.45 * k})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
        g.fillStyle = `rgb(${lerp(170, 255, k)},${lerp(160, 236, k)},${lerp(190, 200, k)})`; N.figure(g, ox, wl - S * 0.55, S * 0.95);
      }
      N.vignette(g, W, H, 0.55);
      const [nm, desc] = STAGES[kind][stage];
      kit.caption(projected
        ? `The figure has left the water and is now seen in someone else, who suddenly seems luminous and fated. Jung saw this fascination as projection of the ${kind}. Taking it back does not end love; it lets you see the actual person.`
        : `<b>${kind === 'anima' ? 'Anima' : 'Animus'}, stage ${stage + 1}: ${nm}</b>, ${desc}. ${kind === 'anima' ? 'The four stages are Jung\'s, in “The Psychology of the Transference”.' : 'These four stages were set out by Marie-Louise von Franz.'} Tap the water to disturb it.`);
    });
    function drawOther(x, y, S, flipped, t) {
      g.save(); g.translate(x, y); if (flipped) g.scale(1, -1);
      const c = kind === 'anima' ? [226, 190, 240] : [180, 200, 250];
      g.fillStyle = `rgb(${c.join(',')})`;
      N.figure(g, 0, 0, S);
      g.strokeStyle = g.fillStyle; g.lineWidth = 2;
      if (kind === 'anima') {
        if (stage === 0) { g.beginPath(); g.arc(0, -S * 0.62, S * 0.3, Math.PI * 0.8, Math.PI * 2.2); g.stroke(); }
        if (stage === 1) { for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-S * 0.16 + k * S * 0.08, -S * 0.5); g.quadraticCurveTo(-S * 0.3 + k * S * 0.14, -S * 0.1, -S * 0.2 + k * S * 0.1, S * 0.1); g.stroke(); } }
        if (stage === 2) { g.globalAlpha *= 0.6; g.beginPath(); g.arc(0, -S * 0.62, S * 0.34, 0, TAU); g.stroke(); }
        if (stage === 3) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t * 0.2; g.beginPath(); g.moveTo(Math.cos(a) * S * 0.3, -S * 0.62 + Math.sin(a) * S * 0.3); g.lineTo(Math.cos(a) * S * 0.45, -S * 0.62 + Math.sin(a) * S * 0.45); g.stroke(); } }
      } else {
        if (stage === 0) { g.lineWidth = 6; g.beginPath(); g.moveTo(-S * 0.3, -S * 0.3); g.lineTo(S * 0.3, -S * 0.3); g.stroke(); }
        if (stage === 1) { g.beginPath(); g.moveTo(S * 0.28, -S * 0.2); g.lineTo(S * 0.6, -S * 0.7); g.stroke(); }
        if (stage === 2) { g.fillRect(-S * 0.18, -S * 0.1, S * 0.36, S * 0.24); }
        if (stage === 3) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, r = k % 2 ? S * 0.08 : S * 0.2; g.lineTo(Math.cos(a) * r, -S * 1.05 + Math.sin(a) * r); } g.closePath(); g.fill(); }
      }
      g.restore();
    }
    return {};
  };

  /* ── The Great Mother: holding and holding on ── */
  D.mother = (kit) => {
    const g = kit.ctx;
    let hold = 0.2;
    const lights = Array.from({ length: 16 }, (_, i) => ({ a: rnd(0, TAU), r: rnd(0.1, 0.6), s: rnd(0.4, 1), grow: 0.5 }));
    kit.slider('Holding  ·  holding on', 0, 1, hold, 0.01, (v) => { hold = v; });
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H * 0.55, R = Math.min(W, H) * 0.38;
      const warm = 1 - hold;
      g.fillStyle = `rgb(${lerp(10, 26, warm)},${lerp(4, 14, warm)},${lerp(14, 30, warm)})`; g.fillRect(0, 0, W, H);
      const gl = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      gl.addColorStop(0, `rgba(${lerp(90, 255, warm)},${lerp(30, 200, warm)},${lerp(80, 150, warm)},${lerp(0.25, 0.3, warm)})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gl; g.fillRect(0, 0, W, H);
      const open = lerp(1.25, 0.1, hold), beat = 1 + 0.03 * Math.sin(t * lerp(1.2, 2.6, hold));
      for (let i = 0; i < 4; i++) {
        const rr = R * (0.55 + i * 0.16) * beat, gap = open * (1 + i * 0.15);
        g.strokeStyle = `rgba(${lerp(170, 241, warm)},${lerp(110, 212, warm)},${lerp(200, 154, warm)},${0.55 - i * 0.1})`; g.lineWidth = 3 - i * 0.5;
        g.beginPath(); g.arc(cx, cy, rr, -Math.PI / 2 + gap / 2, -Math.PI / 2 - gap / 2 + TAU); g.stroke();
      }
      lights.forEach((l, i) => {
        const free = warm > 0.5;
        l.grow = clamp(l.grow + dt * (warm - 0.45) * 0.2, 0.15, 1.2);
        const pull = lerp(1.25, 0.25, hold);
        l.r = lerp(l.r, free ? Math.min(1.25, l.r + 0.002) : 0.12, dt * 0.2 * (free ? 0.4 : pull));
        if (l.r > 1.2 && free) { l.r = rnd(0.08, 0.3); l.grow = 0.4; }
        l.a += dt * 0.1 * l.s;
        const x = cx + Math.cos(l.a) * l.r * R, y = cy + Math.sin(l.a) * l.r * R - (free ? l.r * R * 0.3 : 0);
        g.fillStyle = `rgba(255,${lerp(170, 236, warm)},${lerp(150, 200, warm)},${0.35 + 0.5 * l.grow})`;
        g.beginPath(); g.arc(x, y, 2 + l.grow * 4, 0, TAU); g.fill();
      });
      N.vignette(g, W, H, 0.6);
      kit.caption(hold < 0.3 ? 'The loving mother: nourishing, warm, and open. What she holds is free to grow and leave.'
        : hold < 0.7 ? 'Both faces at once. The same arms that shelter can begin to close.'
        : 'The terrible mother: the grip that will not release, the dark that swallows. Jung listed the devouring, the secret and the inescapable as her other side. What she holds is kept small.');
    });
    return {};
  };

  /* ── The Wise Old Man: help that comes when will runs out ── */
  D.wise = (kit) => {
    const g = kit.ctx;
    let fails = 0, state = 'lost', walk = null, arrive = 0, trees = [];
    const LINES = { push: 'You push on. The forest thickens, and after an hour you are back at the same crossroads.', back: 'You turn back. The path you came by has closed over. You are back at the crossroads.', wait: 'You wait for someone to come. No one does. It gets darker.' };
    kit.onResize((W, H) => { trees = Array.from({ length: 34 }, (_, i) => ({ x: rnd(0, W), y: rnd(H * 0.2, H * 0.95), s: rnd(40, 120) })).sort((a, b) => a.y - b.y); });
    const acts = [['Push on', 'push'], ['Turn back', 'back'], ['Wait to be rescued', 'wait']].map(([l, k]) => kit.button(l, () => { if (state !== 'lost') return; walk = { k, t: 0 }; fails++; }));
    kit.button('Admit you are lost', () => { if (state === 'lost') { state = 'coming'; arrive = 0; N.sound.pluck(329.63, 0.06, 4); N.sound.pluck(493.88, 0.04, 4.5); } });
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H * 0.66;
      g.fillStyle = '#070513'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(183,154,232,.35)'; g.lineWidth = 16; g.lineCap = 'round';
      [[-1, -0.6], [1, -0.6], [-0.5, 1], [0.6, 1]].forEach(([dx, dy]) => { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * W * 0.45, cy + dy * H * 0.35); g.stroke(); });
      trees.forEach((tr) => { g.fillStyle = `rgba(20,14,40,${0.7 + tr.y / H * 0.3})`; g.beginPath(); g.moveTo(tr.x, tr.y - tr.s); g.lineTo(tr.x - tr.s * 0.35, tr.y); g.lineTo(tr.x + tr.s * 0.35, tr.y); g.fill(); });
      let tx = cx, ty = cy;
      if (walk) { walk.t += dt; const u = Math.sin(clamp(walk.t / 2.5, 0, 1) * Math.PI); const dir = walk.k === 'push' ? [1, -0.6] : walk.k === 'back' ? [-0.5, 1] : [0, 0]; tx += dir[0] * u * W * 0.3; ty += dir[1] * u * H * 0.25; if (walk.t > 2.5) walk = null; }
      g.fillStyle = '#efe7f4'; N.figure(g, tx, ty - 18, 34);
      if (state !== 'lost') {
        arrive = Math.min(1, arrive + dt * 0.35);
        const ox = lerp(W * 0.95, cx + 70, sstep(0, 1, arrive)), oy = cy - 26;
        const gl = g.createRadialGradient(ox, oy - 40, 0, ox, oy - 40, 200 * arrive); gl.addColorStop(0, 'rgba(255,230,170,.5)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
        g.fillStyle = '#fff1d0'; N.figure(g, ox, oy + 8, 38);
        g.strokeStyle = '#fff1d0'; g.lineWidth = 2; g.beginPath(); g.moveTo(ox + 18, oy + 30); g.lineTo(ox + 26, oy - 40); g.stroke();
        g.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t * 0.3, r = k % 2 ? 4 : 10; g.lineTo(ox + 26 + Math.cos(a) * r, oy - 48 + Math.sin(a) * r); } g.closePath(); g.fillStyle = '#ffe2a6'; g.fill();
        if (arrive >= 1) {
          state = 'spoken';
          g.strokeStyle = 'rgba(255,226,166,.6)'; g.lineWidth = 3; g.setLineDash([2, 10]); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 0.6 * W * 0.45, cy + H * 0.35); g.stroke(); g.setLineDash([]);
        }
      }
      N.vignette(g, W, H, 0.7);
      let cap;
      if (state === 'spoken') cap = '“What did you come into the forest looking for?” The question changes the situation. The way was there all along; it needed a different kind of seeing. Jung notes that the old man appears exactly when the hero is in a hopeless situation that only reflection or a lucky idea can resolve.';
      else if (state === 'coming') cap = 'Someone is coming through the trees, carrying a light.';
      else if (walk) cap = LINES[walk.k];
      else cap = fails === 0 ? 'A traveller at a crossroads in a dark forest, with no idea which way.' : fails < 3 ? 'Back at the crossroads.' : 'Every effort of will brings you back here. Perhaps effort is not the answer.';
      kit.caption(cap);
    });
    return {};
  };

  /* ── The Trickster: the room misbehaves ── */
  D.trickster = (kit) => {
    const g = kit.ctx;
    const close = document.getElementById('chClose');
    const cap = document.getElementById('chCaption');
    const origClose = close.textContent;
    let dodges = 0;
    const dodge = () => { if (dodges < 2) { dodges++; close.style.transform = `translate(${-80 - Math.random() * 120}px, ${40 + Math.random() * 60}px)`; close.textContent = 'Close?'; } else { close.style.transform = ''; close.textContent = origClose; } };
    close.addEventListener('pointerenter', dodge);
    cap.style.transform = 'scaleX(-1)'; cap.style.transition = 'transform 1.2s';
    const unflip = setTimeout(() => { cap.style.transform = ''; }, 3200);
    const THINGS = ['Order', 'Plans', 'Dignity', 'Rules', 'Certainty'];
    let fallen = THINGS.map(() => 0), tr = { x: 0, y: 0, t: 0, i: 0 }, bloom = 0, inverted = false;
    const inv = kit.button('Put things right', () => { inverted = !inverted; fallen = fallen.map(() => 0); bloom = 0; });
    kit.onDown = (p) => { if (Math.hypot(p.x - tr.x, p.y - tr.y) < 50) { const i = fallen.findIndex((f) => f === 0); if (i >= 0) { fallen[i] = 0.001; N.sound.pluck(784, 0.05, 0.6); } } };
    kit.onFrame((t, dt) => {
      const { W, H } = kit;
      g.fillStyle = inverted ? '#e9e1f2' : '#0e0a1d'; g.fillRect(0, 0, W, H);
      const ink = inverted ? '#1a1030' : '#efe7f4';
      tr.t -= dt; if (tr.t < 0) { tr.t = rnd(0.9, 1.8); tr.i = Math.floor(rnd(0, 5)); }
      const hx = W * (0.14 + tr.i * 0.18), hy = H * 0.35 - Math.abs(Math.sin(t * 5)) * 30;
      tr.x = lerp(tr.x || hx, hx, 1 - Math.pow(0.001, dt)); tr.y = hy;
      THINGS.forEach((name, i) => {
        const x = W * (0.14 + i * 0.18), y = H * 0.66;
        if (fallen[i] > 0) fallen[i] = Math.min(1, fallen[i] + dt * 1.5);
        g.save(); g.translate(x, y); g.rotate(fallen[i] * 1.4);
        g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(-26, -60 * (1 - fallen[i] * 0.3), 52, 60);
        g.font = '14px Marcellus, serif'; g.fillStyle = ink; g.textAlign = 'center'; g.fillText(name, 0, -25); g.restore();
      });
      if (fallen.every((f) => f >= 1)) bloom = Math.min(1, bloom + dt * 0.3);
      if (bloom > 0) { for (let k = 0; k < 40; k++) { const a = k / 40 * TAU + t * 0.1, r = bloom * Math.min(W, H) * (0.2 + (k % 5) * 0.04); g.fillStyle = `rgba(241,212,154,${bloom * 0.6})`; g.beginPath(); g.arc(W / 2 + Math.cos(a) * r, H * 0.55 + Math.sin(a) * r * 0.6, 3, 0, TAU); g.fill(); } }
      g.save(); g.translate(tr.x, tr.y); g.rotate(Math.sin(t * 6) * 0.3);
      g.fillStyle = inverted ? '#7a3b8f' : '#e0a5b3'; N.figure(g, 0, 0, 44);
      g.beginPath(); g.moveTo(-12, -38); g.lineTo(-22, -58); g.lineTo(-4, -44); g.moveTo(12, -38); g.lineTo(22, -58); g.lineTo(4, -44); g.fill(); g.restore();
      kit.caption(bloom > 0.5 ? 'Everything is down, and something new is growing where it stood. Jung noted the trickster\'s closeness to the healer: the upset carries the renewal.'
        : fallen.some((f) => f > 0) ? 'Catch him again. Each thing he knocks over was a little too rigid anyway.'
        : 'Catch the one who keeps hopping about. (The room is behaving strangely on purpose. Esc always works.)');
    });
    return { stop() { clearTimeout(unflip); close.removeEventListener('pointerenter', dodge); close.style.transform = ''; close.textContent = origClose; cap.style.transform = ''; } };
  };

  /* ── The Hero: the sun's path, and the night sea journey ── */
  D.hero = (kit) => {
    const g = kit.ctx;
    let ang = Math.PI * 0.95, dragging = false, auto = true;
    kit.onDown = () => { dragging = true; auto = false; };
    kit.onUp = () => { dragging = false; };
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H * 0.5, R = Math.min(W, H) * 0.34, p = kit.pointer;
      if (dragging) ang = Math.atan2(p.y - cy, p.x - cx);
      else if (auto) ang += dt * 0.22;
      const a = ((ang % TAU) + TAU) % TAU;          // 0 = east (right), PI/2 = below
      const below = Math.sin(a) > 0;
      const sky = below ? [8, 5, 22] : [lerp(40, 70, -Math.sin(a)), lerp(30, 50, -Math.sin(a)), lerp(60, 90, -Math.sin(a))];
      g.fillStyle = `rgb(${sky.map(Math.round).join(',')})`; g.fillRect(0, 0, W, cy);
      g.fillStyle = '#0a0620'; g.fillRect(0, cy, W, H - cy);
      g.strokeStyle = 'rgba(239,231,244,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, cy); g.lineTo(W, cy); g.stroke();
      g.strokeStyle = 'rgba(241,212,154,.3)'; g.beginPath(); g.arc(cx, cy, R, Math.PI, TAU); g.stroke();
      g.setLineDash([3, 6]); g.strokeStyle = 'rgba(183,154,232,.35)'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI); g.stroke(); g.setLineDash([]);
      // the monster below
      const mx = cx, my = cy + R * 0.95, jaw = 0.3 + 0.2 * Math.sin(t * 0.8);
      g.fillStyle = 'rgba(40,20,70,.9)'; g.beginPath(); g.ellipse(mx, my, R * 0.9, R * 0.25, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(183,154,232,.5)'; g.beginPath(); g.moveTo(mx - R * 0.9, my); g.lineTo(mx - R * 0.5, my - R * jaw * 0.5); g.moveTo(mx - R * 0.9, my); g.lineTo(mx - R * 0.5, my + R * jaw * 0.5); g.stroke();
      const sx = cx + Math.cos(a) * R, sy = cy + Math.sin(a) * R;
      const gl = g.createRadialGradient(sx, sy, 0, sx, sy, R * 0.5); gl.addColorStop(0, below ? 'rgba(183,154,232,.35)' : 'rgba(255,220,150,.6)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
      g.fillStyle = below ? '#b79ae8' : '#ffe0a0'; g.beginPath(); g.arc(sx, sy, R * 0.1, 0, TAU); g.fill();
      const deg = a * 180 / Math.PI;
      let cap;
      if (deg > 190 && deg < 250) cap = '<b>Birth and departure.</b> The hero rises out of the waters of origin and leaves home.';
      else if (deg >= 250 && deg < 290) cap = '<b>The height of strength.</b> The hero at the zenith, the conscious ego at its most capable.';
      else if (deg >= 290 && deg <= 360) cap = '<b>The descent.</b> The sun sinks toward the west. The hero turns, willingly or not, toward the dark.';
      else if (deg >= 0 && deg < 150) cap = '<b>The night sea journey.</b> Swallowed by the monster, travelling under the world in its belly. For Jung this is the regression into the unconscious that makes renewal possible.';
      else cap = '<b>Rebirth.</b> The hero breaks out and rises again at dawn, renewed. Drag the sun to go round again.';
      kit.caption(cap);
      N.vignette(g, W, H, 0.5);
    });
    return {};
  };

  /* ── The Child: abandoned, invincible, futurity ── */
  D.child = (kit) => {
    const g = kit.ctx;
    let size = 0.3, sheltered = 0, alone = 0, winds = Array.from({ length: 60 }, () => ({ x: rnd(0, 1), y: rnd(0, 1), v: rnd(0.2, 0.6), l: rnd(20, 60) }));
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H * 0.5, p = kit.pointer;
      const shelter = p.inside && Math.hypot(p.x - cx, p.y - cy) < Math.min(W, H) * 0.3;
      if (shelter) sheltered += dt; else alone += dt;
      size = clamp(size + dt * (shelter ? -0.002 : 0.012), 0.25, 1.4);
      g.fillStyle = '#07040f'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(183,154,232,.35)'; g.lineWidth = 1.4;
      winds.forEach((w) => {
        w.x -= w.v * dt * 0.6; if (w.x < -0.1) { w.x = 1.1; w.y = rnd(0, 1); }
        const y = w.y * H + Math.sin(t * 2 + w.y * 10) * 10;
        g.beginPath(); g.moveTo(w.x * W, y); g.lineTo(w.x * W + w.l, y); g.stroke();
      });
      const flick = shelter ? 1 : 0.7 + 0.3 * Math.sin(t * 13) * Math.sin(t * 7);
      const r = Math.min(W, H) * 0.035 * (1 + size) * flick;
      const gl = g.createRadialGradient(cx, cy, 0, cx, cy, r * 6); gl.addColorStop(0, 'rgba(255,236,190,.8)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,236,190,.7)'; g.lineWidth = 1.5;
      const rays = Math.floor(size * 8);
      for (let i = 0; i < rays; i++) { const a = i / rays * TAU + t * 0.1, l = r * (2 + size * 3); g.beginPath(); g.moveTo(cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3); g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); g.stroke(); }
      g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
      if (shelter) { g.strokeStyle = 'rgba(241,212,154,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(p.x, p.y, 60, Math.PI * 0.7, Math.PI * 1.9); g.stroke(); }
      N.vignette(g, W, H, 0.55);
      let cap;
      if (shelter) cap = 'Sheltered, it is safe, and it stays small. Protection is not what it needs to grow.';
      else if (size > 1.1) cap = '<b>Futurity.</b> Left to the winds, it has grown. The child points toward what is not yet: the possible wholeness of the personality.';
      else if (alone > 3) cap = '<b>Invincibility.</b> Exposed, flickering, and not going out. The abandoned child of myth always survives.';
      else cap = '<b>Abandonment.</b> A small light, alone among forces much larger than it. Move your pointer close to shelter it, or leave it.';
      kit.caption(cap);
    });
    return {};
  };

  /* ── Inflation: the ego swells ── */
  D.inflation = (kit) => {
    const g = kit.ctx;
    const POWERS = [
      { name: 'The Hero', say: 'Only I can do this.' }, { name: 'The Healer', say: 'Everyone depends on me.' },
      { name: 'The Wise One', say: 'I understand what others cannot.' }, { name: 'The Great Mother', say: 'Without me they would all be lost.' },
      { name: 'The Sinner', say: 'I am the worst of all.', neg: true },
    ];
    let mana = 0, sayings = [], neg = 0;
    POWERS.forEach((p) => kit.button('Take on ' + p.name.toLowerCase(), () => { mana = Math.min(4, mana + 1); if (p.neg) neg++; sayings.push({ s: p.say, a: 1, ang: rnd(0, TAU) }); N.sound.pluck(p.neg ? 73.4 : 110 + mana * 40, 0.08, 2); }));
    kit.button('Come back to human size', () => { mana = 0; neg = 0; sayings = []; N.sound.pluck(440, 0.05, 2); });
    let r = 0;
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H * 0.5, base = Math.min(W, H) * 0.14;
      const target = base * (1 + mana * 0.55);
      r = lerp(r || base, target, 1 - Math.pow(0.05, dt));
      g.fillStyle = '#0b0718'; g.fillRect(0, 0, W, H);
      g.setLineDash([4, 6]); g.strokeStyle = 'rgba(239,231,244,.5)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, base, 0, TAU); g.stroke(); g.setLineDash([]);
      g.font = '11px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(239,231,244,.6)'; g.textAlign = 'center'; g.fillText('HUMAN SIZE', cx, cy + base + 16);
      const wob = mana * 0.05;
      g.beginPath();
      for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU, rr = r * (1 + wob * Math.sin(a * 6 + t * (2 + mana))); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      g.closePath();
      const col = neg > 0 ? '90,50,110' : '255,214,150';
      const gl = g.createRadialGradient(cx, cy, 0, cx, cy, r); gl.addColorStop(0, `rgba(${col},.55)`); gl.addColorStop(1, `rgba(${col},.08)`); g.fillStyle = gl; g.fill();
      g.strokeStyle = `rgba(${col},.8)`; g.lineWidth = 2; g.stroke();
      sayings.forEach((s, i) => { g.font = `italic ${16 + mana * 2}px Spectral, serif`; g.fillStyle = `rgba(${col},.95)`; g.fillText(s.s, cx + Math.cos(s.ang + t * 0.1) * r * 0.9, cy + Math.sin(s.ang + t * 0.1) * r * 0.6); });
      N.vignette(g, W, H, 0.6);
      kit.caption(mana === 0 ? 'The ego at human size. Take on the powers of the figures met below.'
        : neg > 0 ? '<b>Negative inflation</b> is inflation too: being the worst sinner is still being more than human.'
        : mana < 3 ? 'The ego is borrowing the mana of the archetype. It feels like strength.'
        : '<b>Inflation.</b> The ego has swollen past human size and is wobbling. Jung\'s remedy is to distinguish yourself from what you met, and come back.');
    });
    return {};
  };

  /* ── Synchronicity: two streams, and what chance predicts ── */
  D.synchronicity = (kit) => {
    const g = kit.ctx;
    const SYM = ['scarab', 'bird', 'water', 'key', 'fire', 'moon', 'snake', 'door'];
    let items = [], spawn = 0, shown = 0, matches = 0, noticed = 0, missed = 0, flash = 0;
    const nb = kit.button('Notice', () => {
      const mid = items.find((it) => Math.abs(it.x - kit.W / 2) < 60 && !it.done);
      if (mid) { mid.done = true; if (mid.a === mid.b) { noticed++; flash = 1; N.sound.pluck(880, 0.07, 1.5); } else { flash = -1; } }
    });
    kit.onDown = () => nb.click();
    kit.onFrame((t, dt) => {
      const { W, H } = kit, topY = H * 0.33, botY = H * 0.62;
      spawn -= dt; if (spawn < 0) { spawn = 1.3; const a = Math.floor(rnd(0, SYM.length)), b = Math.floor(rnd(0, SYM.length)); items.push({ a, b, x: W + 60, done: false }); shown++; if (a === b) matches++; }
      g.fillStyle = '#0a0619'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(241,212,154,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(W / 2, H * 0.15); g.lineTo(W / 2, H * 0.8); g.stroke();
      g.font = '11px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(183,171,200,.8)'; g.textAlign = 'left';
      g.fillText('INNER · DREAMS, THOUGHTS', 14, topY - 40); g.fillText('OUTER · EVENTS', 14, botY + 52);
      items.forEach((it) => {
        it.x -= dt * 110;
        if (it.x < W / 2 - 60 && !it.done) { it.done = true; if (it.a === it.b) missed++; }
        const match = it.a === it.b;
        g.font = '20px Marcellus, serif'; g.textAlign = 'center';
        g.fillStyle = 'rgba(226,214,248,.9)'; g.fillText(SYM[it.a], it.x, topY);
        g.fillStyle = 'rgba(241,212,154,.9)'; g.fillText(SYM[it.b], it.x, botY);
        if (match && it.x > W / 2 - 60 && it.x < W / 2 + 60) { g.strokeStyle = 'rgba(241,212,154,.25)'; g.beginPath(); g.moveTo(it.x, topY + 8); g.lineTo(it.x, botY - 20); g.stroke(); }
      });
      items = items.filter((it) => it.x > -80);
      if (flash) { g.fillStyle = flash > 0 ? `rgba(241,212,154,${flash * 0.25})` : `rgba(224,165,179,${-flash * 0.2})`; g.fillRect(0, 0, W, H); flash = flash > 0 ? Math.max(0, flash - dt * 2) : Math.min(0, flash + dt * 2); }
      const expected = (shown / SYM.length).toFixed(1);
      N.vignette(g, W, H, 0.5);
      kit.caption(`Pairs so far: <b>${shown}</b>. Matching pairs: <b>${matches}</b>, and chance alone predicts about <b>${expected}</b>. You noticed <b>${noticed}</b>${missed ? `; ${missed} went past unnoticed` : ''}. <span style="color:#8e82a3">Jung's claim was never that matches happen, which chance guarantees, but that some coincide with an intense inner state and carry meaning for the person. Critics answer that we remember the hits and forget the misses. Both are on this screen.</span>`);
    });
    return {};
  };

  /* ── The Self: a mandala built from the descent ── */
  D.self = (kit) => {
    const g = kit.ctx;
    const rings = [['surface', 'threshold'], ['personal', 'boundary'], ['collective']];
    let rot = 0, dragA = null, sel = null, slots = [];
    kit.onDown = (p) => {
      const { W, H } = kit;
      dragA = Math.atan2(p.y - H / 2, p.x - W / 2);
      const hit = slots.find((s) => Math.hypot(s.x - p.x, s.y - p.y) < 22);
      if (hit) sel = hit.c;
    };
    kit.onMove = (p) => { if (!p.down || dragA === null) return; const a = Math.atan2(p.y - kit.H / 2, p.x - kit.W / 2); rot += a - dragA; dragA = a; };
    kit.onUp = () => { dragA = null; };
    const go = kit.button('Visit this one', () => { if (sel) N.openChamber(sel.id); }); go.disabled = true;
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42;
      if (dragA === null) rot += dt * 0.03;
      g.fillStyle = '#0b0714'; g.fillRect(0, 0, W, H);
      const gl = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1); gl.addColorStop(0, 'rgba(255,214,150,.22)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(241,212,154,.25)'; g.lineWidth = 1;
      g.save(); g.translate(cx, cy); g.rotate(rot);
      g.strokeRect(-R * 0.72, -R * 0.72, R * 1.44, R * 1.44);
      g.beginPath(); g.moveTo(0, -R); g.lineTo(0, R); g.moveTo(-R, 0); g.lineTo(R, 0); g.stroke();
      g.restore();
      slots = [];
      const seen = N.state.visited, integ = N.state.integrated;
      rings.forEach((layers, ri) => {
        const cs = N.concepts.filter((c) => layers.includes(c.layer));
        const rr = R * (0.32 + ri * 0.27);
        g.strokeStyle = 'rgba(239,231,244,.2)'; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.stroke();
        cs.forEach((c, i) => {
          const a = i / cs.length * TAU + rot * (ri % 2 ? -1 : 1) - Math.PI / 2;
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
          const v = seen.includes(c.id), k = integ.includes(c.id);
          slots.push({ x, y, c });
          g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
          g.beginPath(); g.ellipse(0, 0, 11, 22, 0, 0, TAU);
          if (v) { g.fillStyle = k ? 'rgba(241,212,154,.9)' : 'rgba(216,186,255,.75)'; g.fill(); }
          g.strokeStyle = sel === c ? '#fff' : 'rgba(239,231,244,.45)'; g.lineWidth = sel === c ? 2 : 1; g.stroke();
          g.restore();
        });
      });
      const core = 10 + 3 * Math.sin(t);
      g.fillStyle = '#fff1d0'; g.beginPath(); g.arc(cx, cy, core, 0, TAU); g.fill();
      go.disabled = !sel;
      const n = seen.filter((id) => !['self', 'individuation'].includes(id)).length;
      kit.caption(sel ? `<b>${sel.title}</b>: ${sel.short} ${seen.includes(sel.id) ? '' : '<i>Not yet visited.</i>'}` : `${n} of ${N.concepts.length - 2} petals gathered on the way down; the gold ones you chose to sit with. Drag to turn it. The centre is never one of the pieces.`);
    });
    return {};
  };

  /* ── Individuation: the path walked, and the ascent ── */
  D.individuation = (kit) => {
    const g = kit.ctx;
    kit.button('Begin the ascent', () => { N.state.ascended = true; N.save(); N.ascending = true; N.closeChamber(true); N.scrollToDepth(0); });
    kit.onFrame((t) => {
      const { W, H } = kit, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42;
      g.fillStyle = '#0b0714'; g.fillRect(0, 0, W, H);
      const pt = (u, out) => { const a = u * TAU * 2.5 + (out ? Math.PI : 0) - Math.PI / 2, r = R * (1 - u) + 6; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
      g.lineWidth = 1.5; g.strokeStyle = 'rgba(216,186,255,.35)'; g.beginPath(); for (let i = 0; i <= 200; i++) { const p = pt(i / 200, false); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
      g.strokeStyle = 'rgba(241,212,154,.2)'; g.setLineDash([2, 5]); g.beginPath(); for (let i = 0; i <= 200; i++) { const p = pt(i / 200, true); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); g.setLineDash([]);
      const order = N.state.visited;
      order.forEach((id, i) => {
        const c = N.concepts.find((x) => x.id === id); if (!c) return;
        const p = pt(c.d, false);
        g.fillStyle = 'rgba(239,231,244,.9)'; g.beginPath(); g.arc(p[0], p[1], 4, 0, TAU); g.fill();
        if (i < 14) { g.font = '12px Spectral, serif'; g.fillStyle = 'rgba(239,231,244,.6)'; g.textAlign = 'center'; g.fillText(c.title, p[0], p[1] - 9); }
        if (N.state.integrated.includes(id)) { const q = pt(c.d, true); g.fillStyle = '#f1d49a'; g.beginPath(); g.arc(q[0], q[1], 4.5, 0, TAU); g.fill(); }
      });
      const u = (t * 0.04) % 1, h = pt(u, false);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(h[0], h[1], 3, 0, TAU); g.fill();
      g.fillStyle = '#fff1d0'; g.beginPath(); g.arc(cx, cy, 7, 0, TAU); g.fill();
      const ni = N.state.integrated.length;
      kit.caption(`You have visited ${order.length} of ${N.concepts.length} places and sat with ${ni}. The inward arm is the descent, the gold arm the return: what you carried back. The spiral never quite reaches its centre; it circles it, closer each turn.`);
    });
    return {};
  };

  D.placeholder = (kit, c) => { kit.onFrame(() => { const g = kit.ctx; g.fillStyle = '#0b0714'; g.fillRect(0, 0, kit.W, kit.H); }); kit.caption(c ? c.short : ''); return {}; };
})();
