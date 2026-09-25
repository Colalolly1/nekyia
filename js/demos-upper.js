/* Nekyia — demonstrations for consciousness and the personal unconscious. */
(function () {
  const N = window.N, D = (N.demos = N.demos || {});
  const { TAU, clamp, lerp, sstep } = N.util;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function vignette(g, W, H, a = 0.6) {
    const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  function wrapText(g, text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '', yy = y;
    for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test; }
    if (line) g.fillText(line, x, yy); return yy;
  }
  N.wrapText = wrapText; N.vignette = vignette;

  /* ── Ego: the lamp of consciousness ── */
  D.ego = (kit) => {
    const g = kit.ctx;
    const CONTENTS = ['the smell of rain', 'an unanswered message', 'your mother\'s voice', 'a debt', 'the weight of your body', 'a tune from this morning',
      'a grudge', 'the colour of this screen', 'hunger', 'an old dream', 'a name you forgot', 'tomorrow\'s appointment', 'the sound of traffic',
      'a childhood kitchen', 'an ambition', 'a small shame', 'the taste of coffee', 'someone you miss', 'your breathing', 'a fear of heights',
      'the last argument', 'a phrase in another language', 'the temperature of the room', 'a promise', 'your left hand', 'a face from the bus',
      'what you ate yesterday', 'a wish you never say', 'the date', 'an itch', 'a line from a poem', 'a door left unlocked', 'the ache in your back', 'a joke'];
    let items = [], lamp = { x: 0, y: 0 }, wide = false, intrusion = { t: 6, i: -1 };
    kit.onResize((W, H) => {
      if (!items.length) items = CONTENTS.map((s) => ({ s, x: rnd(0.05, 0.95) * W, y: rnd(0.08, 0.92) * H, vx: rnd(-8, 8), vy: rnd(-6, 6), ph: rnd(0, TAU) }));
      lamp.x = W * 0.5; lamp.y = H * 0.5;
    });
    const btn = kit.button('Widen the lamp', (b) => { wide = !wide; b.setAttribute('aria-pressed', String(wide)); }, { pressed: false });
    kit.onFrame((t, dt) => {
      const { W, H } = kit, p = kit.pointer;
      const tx = p.inside ? p.x : W / 2 + Math.cos(t * 0.23) * W * 0.25, ty = p.inside ? p.y : H / 2 + Math.sin(t * 0.31) * H * 0.22;
      lamp.x = lerp(lamp.x, tx, 1 - Math.pow(0.001, dt)); lamp.y = lerp(lamp.y, ty, 1 - Math.pow(0.001, dt));
      const R = Math.min(W, H) * (wide ? 0.3 : 0.16);
      g.fillStyle = '#07040c'; g.fillRect(0, 0, W, H);
      const gr = g.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, R * 1.25);
      gr.addColorStop(0, wide ? 'rgba(255,226,170,.30)' : 'rgba(255,230,180,.55)'); gr.addColorStop(0.75, 'rgba(255,210,150,.10)'); gr.addColorStop(1, 'rgba(255,200,140,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      intrusion.t -= dt;
      if (intrusion.t < 0) { intrusion.t = rnd(7, 12); intrusion.i = Math.floor(Math.random() * items.length); }
      let inside = [];
      g.textAlign = 'center'; g.textBaseline = 'middle';
      items.forEach((it, i) => {
        if (i === intrusion.i && intrusion.t > 4) { it.vx += (lamp.x - it.x) * 0.6 * dt; it.vy += (lamp.y - it.y) * 0.6 * dt; }
        it.vx *= 0.995; it.vy *= 0.995;
        it.x += it.vx * dt + Math.sin(t * 0.5 + it.ph) * 4 * dt; it.y += it.vy * dt;
        if (it.x < 10 || it.x > W - 10) it.vx *= -1; if (it.y < 10 || it.y > H - 10) it.vy *= -1;
        const d = Math.hypot(it.x - lamp.x, it.y - lamp.y), inL = d < R;
        if (inL) inside.push(it.s);
        const k = 1 - sstep(R * 0.6, R, d);
        const blur = wide ? 0.55 : 1;
        g.font = `${Math.round(14 + k * 6)}px Spectral, Georgia, serif`;
        g.fillStyle = `rgba(${k > 0 ? '255,244,225' : '190,175,215'},${(0.1 + k * 0.85 * blur).toFixed(3)})`;
        const jit = wide && inL ? Math.sin(t * 9 + i) * 1.6 : 0;
        g.fillText(it.s, it.x + jit, it.y);
        if (!inL) { g.fillStyle = 'rgba(200,180,230,.35)'; g.beginPath(); g.arc(it.x, it.y + 12, 1.6, 0, TAU); g.fill(); }
      });
      g.strokeStyle = 'rgba(255,226,170,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(lamp.x, lamp.y, R, 0, TAU); g.stroke();
      const intr = intrusion.i >= 0 && intrusion.t > 4 ? items[intrusion.i].s : null;
      kit.caption(`<b>In the light: ${inside.length}</b> of ${items.length}. ${wide ? 'The lamp is wider, and everything in it is dimmer: attention spread thin holds less clearly.' : 'Everything else is still here, moving, unconscious for now.'}${intr ? ` <i>“${intr}” is drifting toward the light on its own.</i>` : ''}`);
      N.vignette(g, W, H, 0.5);
    });
    return {};
  };

  /* ── Persona: masks and the face beneath ── */
  D.persona = (kit) => {
    const g = kit.ctx;
    const TRUE = { brow: 0, smile: 0.05, eye: 1, tilt: 0 };
    const MASKS = [
      { name: 'Work', expr: { brow: 0.15, smile: 0.45, eye: 0.85, tilt: 0 }, col: '#c9c2d8', line: 'Composed. Competent. Never tired.' },
      { name: 'Family', expr: { brow: -0.25, smile: 0.3, eye: 1.05, tilt: 0.06 }, col: '#e6c7a8', line: 'The one who keeps the peace.' },
      { name: 'Strangers', expr: { brow: 0.25, smile: 0.2, eye: 0.75, tilt: -0.03 }, col: '#a9b7c9', line: 'Polite. Unreadable.' },
      { name: 'Online', expr: { brow: -0.45, smile: 0.95, eye: 1.2, tilt: 0.1 }, col: '#f0b7c8', line: 'Bright, witty, always doing well.' },
    ];
    let wearing = -1, lastMask = 0, worn = [0, 0, 0, 0], lift = 1, tries = 0, cracked = 0;
    const face = { ...TRUE };
    const btns = MASKS.map((m, i) => kit.button(m.name, () => { wearing = i; lastMask = i; lift = 0; tries = 0; btns.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); }, { pressed: false }));
    const off = kit.button('Take it off', () => {
      if (wearing < 0) return;
      tries++;
      if (worn[wearing] > 30 && tries < 3) { lift = 0.35; return; }
      if (worn[wearing] > 30) cracked = 1;
      wearing = -1; btns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    });
    kit.button('Let years pass', () => { if (wearing >= 0) worn[wearing] += 12; });
    kit.onFrame((t, dt) => {
      const { W, H } = kit;
      g.fillStyle = '#0d0918'; g.fillRect(0, 0, W, H);
      if (wearing >= 0) worn[wearing] += dt;
      for (let i = 0; i < 4; i++) if (i !== wearing) worn[i] = Math.max(0, worn[i] - dt * 0.6);
      const w = worn[lastMask], conform = clamp(w / 24, 0, 1);
      const m = MASKS[lastMask].expr;
      const tgt = wearing >= 0 || conform > 0 ? m : TRUE;
      for (const k in face) face[k] = lerp(face[k], lerp(TRUE[k], tgt[k], conform), 1 - Math.pow(0.2, dt));
      lift = lerp(lift, wearing >= 0 ? (lift > 0.3 && tries ? lift : 0) : 1, 1 - Math.pow(0.05, dt));
      cracked = Math.max(0, cracked - dt * 0.15);
      const cx = W / 2, cy = H * 0.48, s = Math.min(W, H) * 0.32;
      drawFace(cx, cy, s, face, t, 'rgba(236,222,238,0.95)');
      if (wearing >= 0 || lift < 0.98) {
        const mk = MASKS[wearing >= 0 ? wearing : lastMask];
        drawMask(cx, cy - lift * s * 1.4, s, mk, t, 1 - lift * 0.7);
      }
      if (cracked > 0) { g.strokeStyle = `rgba(241,212,154,${cracked})`; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * 1.1; g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * s * 0.9, cy + Math.sin(a) * s * 1.1); } g.stroke(); }
      // time meter
      const barW = Math.min(260, W * 0.6);
      g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect((W - barW) / 2, H - 26, barW, 4);
      g.fillStyle = conform > 0.99 ? '#e0a5b3' : '#f1d49a'; g.fillRect((W - barW) / 2, H - 26, barW * conform, 4);
      g.font = '12px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(239,231,244,.7)'; g.textAlign = 'center';
      g.fillText(`worn: ${MASKS[lastMask].name.toLowerCase()} · ${Math.round(conform * 100)}%`, W / 2, H - 34);
      let cap;
      if (wearing >= 0 && w > 30 && tries > 0) cap = 'The mask will not come away. <b>Identification with the persona</b>: the role has become the person. Keep trying.';
      else if (wearing >= 0) cap = `<b>${MASKS[wearing].name}.</b> ${MASKS[wearing].line} ${conform > 0.5 ? 'The face underneath is starting to take the mask\'s shape.' : 'Underneath, the face is still its own.'}`;
      else if (cracked > 0.3) cap = 'It broke, and it took some force. What is underneath has been shaped by years in the role. Watch it slowly find its own expression again.';
      else if (conform > 0.05) cap = 'The mask is off, but the face still holds its expression for a while.';
      else cap = 'This is the face with no mask on. Choose a situation.';
      kit.caption(cap);
      N.vignette(g, W, H, 0.55);
    });
    function drawFace(x, y, s, e, t, col) {
      g.save(); g.translate(x, y); g.rotate(e.tilt + Math.sin(t * 0.5) * 0.015);
      g.fillStyle = 'rgba(214,196,226,0.18)'; g.beginPath(); g.ellipse(0, 0, s * 0.62, s * 0.82, 0, 0, TAU); g.fill();
      g.strokeStyle = col; g.lineWidth = 2; g.lineCap = 'round'; g.stroke();
      const blink = (Math.sin(t * 0.9) > 0.985) ? 0.1 : 1;
      [-1, 1].forEach((sx) => {
        g.beginPath(); g.ellipse(sx * s * 0.22, -s * 0.12, s * 0.09, s * 0.06 * e.eye * blink, 0, 0, TAU); g.stroke();
        g.beginPath(); g.arc(sx * s * 0.22, -s * 0.12, s * 0.025, 0, TAU); g.fillStyle = col; g.fill();
        g.beginPath(); g.moveTo(sx * s * 0.34, -s * 0.28 - e.brow * s * 0.08 * sx * 0 - e.brow * s * 0.06); g.lineTo(sx * s * 0.1, -s * 0.26 + e.brow * s * 0.07); g.stroke();
      });
      g.beginPath(); g.moveTo(0, -s * 0.02); g.lineTo(-s * 0.04, s * 0.14); g.lineTo(s * 0.02, s * 0.16); g.stroke();
      g.beginPath(); g.moveTo(-s * 0.18, s * 0.34); g.quadraticCurveTo(0, s * (0.34 + e.smile * 0.22), s * 0.18, s * 0.34); g.stroke();
      g.restore();
    }
    function drawMask(x, y, s, m, t, a) {
      g.save(); g.translate(x, y); g.rotate(m.expr.tilt); g.globalAlpha = a;
      g.fillStyle = m.col; g.beginPath(); g.ellipse(0, -s * 0.06, s * 0.6, s * 0.66, 0, 0, TAU); g.fill();
      g.globalCompositeOperation = 'destination-out';
      [-1, 1].forEach((sx) => { g.beginPath(); g.ellipse(sx * s * 0.22, -s * 0.12, s * 0.1, s * 0.065 * m.expr.eye, 0, 0, TAU); g.fill(); });
      g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(40,28,60,.55)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-s * 0.2, s * 0.3); g.quadraticCurveTo(0, s * (0.3 + m.expr.smile * 0.25), s * 0.2, s * 0.3); g.stroke();
      [-1, 1].forEach((sx) => { g.beginPath(); g.moveTo(sx * s * 0.34, -s * 0.28 - m.expr.brow * s * 0.05); g.lineTo(sx * s * 0.1, -s * 0.25 + m.expr.brow * s * 0.07); g.stroke(); });
      g.fillStyle = 'rgba(40,28,60,.35)'; g.font = `${Math.round(s * 0.09)}px Marcellus, serif`; g.textAlign = 'center'; g.fillText(m.name.toUpperCase(), 0, -s * 0.44);
      g.restore();
    }
    return {};
  };

  /* ── Psychological Types: the wheel ── */
  D.types = (kit) => {
    const g = kit.ctx;
    const F = ['Thinking', 'Intuition', 'Feeling', 'Sensation']; // clockwise from the top: thinking opposite feeling, intuition opposite sensation
    const RATIONAL = { Thinking: 1, Feeling: 1, Intuition: 0, Sensation: 0 };
    const OPP = { Thinking: 'Feeling', Feeling: 'Thinking', Intuition: 'Sensation', Sensation: 'Intuition' };
    const DESC = {
      'Extraverted Thinking': 'Orients by objective facts and generally accepted ideas, and orders life by a formula. What does not fit the formula, feeling above all, tends to be pushed aside.',
      'Introverted Thinking': 'Driven by an inner idea rather than by outer facts. Seeks depth over breadth, and would rather ask the right question than collect data. Can seem remote and indifferent to practicalities.',
      'Extraverted Feeling': 'Values attune to what is fitting and accepted in the surroundings. Warm, sociable and harmonising, at the risk of the feeling becoming conventional rather than personal.',
      'Introverted Feeling': 'Intense inner values with little outward show; Jung used the phrase “still waters run deep”. Can appear cool or silent while feeling strongly.',
      'Extraverted Sensation': 'Lives in the concrete present, with a strong sense for facts, objects and enjoyment. A realist, at home in the world as it is.',
      'Introverted Sensation': 'Perceives the subjective impression a thing makes, the inner image a sensation calls up, more than the thing itself.',
      'Extraverted Intuition': 'Sees possibilities in outer situations and people, and is restless for new ones. Often starts things and moves on before the harvest.',
      'Introverted Intuition': 'Perceives the images rising from the unconscious. The mystic, the seer and the artist, sometimes at odds with ordinary reality.',
    };
    const INFERIOR = { // after Marie-Louise von Franz, Lectures on Jung's Typology (1971)
      Feeling: 'Inferior feeling tends to be all-or-nothing: sudden sentimentality, touchiness, or strong loyalties that cannot be explained.',
      Thinking: 'Inferior thinking tends to arrive as crude, rigid ideas held with surprising dogmatism.',
      Intuition: 'Inferior intuition tends to show up as dark hunches and ominous possibilities that grip suddenly.',
      Sensation: 'Inferior sensation tends to mean neglect of the body and practical life, then sudden compulsive indulgence or worry about health.',
    };
    let dom = 'Thinking', att = 'Introverted', aux = 'Intuition', rot = 0, rotT = 0;
    const domBtns = kit.group(F.map((f) => f), (i, f) => { dom = f; const opts = auxOptions(); if (!opts.includes(aux)) aux = opts[0]; rebuildAux(); }, 0);
    const attBtns = kit.group(['Introverted', 'Extraverted'], (i, a) => { att = a; }, 0);
    let auxBtns = [];
    const auxOptions = () => F.filter((f) => RATIONAL[f] !== RATIONAL[dom]);
    function rebuildAux() {
      auxBtns.forEach((b) => b.remove());
      const opts = auxOptions();
      auxBtns = opts.map((f, i) => kit.button('Auxiliary: ' + f, () => { aux = f; auxBtns.forEach((b, j) => b.setAttribute('aria-pressed', String(opts[j] === f))); }, { pressed: f === aux }));
    }
    rebuildAux();
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H * 0.46, R = Math.min(W, H * 1.1) * 0.32;
      rotT = -F.indexOf(dom) * TAU / 4;
      let diff = rotT - rot; diff = Math.atan2(Math.sin(diff), Math.cos(diff)); rot += diff * (1 - Math.pow(0.02, dt));
      g.fillStyle = '#0d0a1c'; g.fillRect(0, 0, W, H);
      // the unconscious below the waterline
      const wl = cy + R * 0.35;
      const gr = g.createLinearGradient(0, wl, 0, H); gr.addColorStop(0, 'rgba(40,20,70,.2)'); gr.addColorStop(1, 'rgba(10,4,24,.95)');
      g.fillStyle = gr; g.fillRect(0, wl, W, H - wl);
      g.strokeStyle = 'rgba(230,220,250,.35)'; g.lineWidth = 1; g.beginPath();
      for (let x = 0; x <= W; x += 8) g.lineTo(x, wl + Math.sin(x * 0.03 + t * 1.2) * 2.5); g.stroke();
      g.fillStyle = 'rgba(190,175,215,.6)'; g.font = '11px "IBM Plex Mono", monospace'; g.textAlign = 'left'; g.fillText('CONSCIOUSNESS', 14, wl - 10); g.fillText('THE UNCONSCIOUS', 14, wl + 20);
      // axes
      g.save(); g.translate(cx, cy);
      g.strokeStyle = 'rgba(230,220,250,.25)'; g.lineWidth = 1.5;
      for (let i = 0; i < 2; i++) { const a = rot + i * TAU / 4 - Math.PI / 2; g.beginPath(); g.moveTo(Math.cos(a) * R, Math.sin(a) * R); g.lineTo(-Math.cos(a) * R, -Math.sin(a) * R); g.stroke(); }
      // attitude flow along the dominant axis
      const flowOut = att === 'Extraverted';
      for (let i = 0; i < 14; i++) {
        const u = ((t * 0.25 + i / 14) % 1), r = flowOut ? u * R * 1.3 : (1 - u) * R * 1.3;
        const a = rot - Math.PI / 2 + (i % 4) * TAU / 4;
        g.fillStyle = `rgba(241,212,154,${0.55 * Math.sin(u * Math.PI)})`; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 2.2, 0, TAU); g.fill();
      }
      g.restore();
      F.forEach((f, i) => {
        const a = rot + i * TAU / 4 - Math.PI / 2;
        let x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        const role = f === dom ? 'dominant' : f === aux ? 'auxiliary' : f === OPP[dom] ? 'inferior' : 'tertiary';
        if (role === 'inferior') y += 18 + Math.sin(t * 0.8) * 6;
        const size = { dominant: 34, auxiliary: 25, tertiary: 18, inferior: 16 }[role];
        const alpha = { dominant: 1, auxiliary: 0.85, tertiary: 0.5, inferior: 0.35 }[role];
        const gl = g.createRadialGradient(x, y, 0, x, y, size * 2.2);
        gl.addColorStop(0, role === 'dominant' ? `rgba(241,212,154,${0.5})` : `rgba(183,154,232,${0.35 * alpha})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gl; g.fillRect(x - size * 2.2, y - size * 2.2, size * 4.4, size * 4.4);
        g.fillStyle = role === 'dominant' ? '#f1d49a' : `rgba(226,214,248,${alpha})`;
        g.beginPath(); g.arc(x, y, size * 0.45, 0, TAU); g.fill();
        g.font = `${role === 'dominant' ? 20 : 16}px Marcellus, serif`; g.textAlign = 'center';
        g.fillStyle = `rgba(239,231,244,${Math.max(alpha, 0.55)})`; g.fillText(f, x, y - size * 0.75);
        g.font = '11px "IBM Plex Mono", monospace'; g.fillStyle = `rgba(183,171,200,${Math.max(alpha, 0.6)})`;
        g.fillText(role.toUpperCase() + (RATIONAL[f] ? ' · RATIONAL' : ' · IRRATIONAL'), x, y + size * 0.95);
      });
      const key = `${att} ${dom}`;
      kit.caption(`<b>${key}</b>, auxiliary ${aux.toLowerCase()}. ${DESC[key]} <br><span style="color:#e0a5b3">Inferior ${OPP[dom].toLowerCase()}.</span> ${INFERIOR[OPP[dom]]} <span style="color:#8e82a3">Jung did not fix the attitude of the auxiliary; the rule that it takes the opposite one comes from Myers-Briggs.</span>`);
    });
    return {};
  };

  /* ── Compensation: the balance and the answering dreams ── */
  D.compensation = (kit) => {
    const g = kit.ctx;
    const ATT = [
      { name: 'Always agreeable', dreams: ['a dog barking at the door', 'a guest who breaks every glass', 'a riot inside your own house'], flip: 'a sudden, uncontrollable outburst' },
      { name: 'Pure reason', dreams: ['an old woman reading your palm', 'candles you cannot put out', 'a flood no argument can stop'], flip: 'a gripping superstition' },
      { name: 'All work', dreams: ['a garden going to seed', 'a child waiting at an empty station', 'the office on fire, and you feel relief'], flip: 'collapse into complete inertia' },
      { name: 'Always in control', dreams: ['a car whose brakes feel soft', 'an animal slipping its lead', 'a storm tearing the roof away'], flip: 'panic, or total surrender' },
    ];
    let a = 0, lean = 0.3, bubbles = [], spawn = 0, over = 0, flipped = 0;
    kit.group(ATT.map((x) => x.name), (i) => { a = i; bubbles = []; flipped = 0; over = 0; }, 0);
    const sl = kit.slider('How far you lean', 0, 1, lean, 0.01, (v) => { lean = v; });
    kit.onFrame((t, dt) => {
      const { W, H } = kit, cx = W / 2, cy = H * 0.34, L = Math.min(W * 0.36, 260);
      g.fillStyle = '#0c0a1d'; g.fillRect(0, 0, W, H);
      const wl = H * 0.55, gr = g.createLinearGradient(0, wl, 0, H); gr.addColorStop(0, 'rgba(50,30,90,.35)'); gr.addColorStop(1, 'rgba(8,4,20,1)');
      g.fillStyle = gr; g.fillRect(0, wl, W, H - wl);
      if (lean > 0.9 && !flipped) { over += dt; if (over > 2.5) { flipped = 1; N.sound.pluck(98, 0.12, 4); } } else if (!flipped) over = Math.max(0, over - dt);
      const tiltTarget = flipped ? 0.75 : -lean * 0.55 + (bubbles.length ? Math.min(0.35, bubbles.reduce((s, b) => s + b.w, 0) * 0.012) : 0);
      const tilt = lerp(D._tilt || 0, tiltTarget, 1 - Math.pow(flipped ? 0.2 : 0.05, dt)); D._tilt = tilt;
      if (flipped) { flipped += dt; if (flipped > 7) { flipped = 0; over = 0; lean = 0.4; sl.value = lean; bubbles = []; } }
      spawn -= dt * (0.2 + lean * lean * 2.2);
      if (spawn < 0 && !flipped) { spawn = 1; const lvl = lean < 0.35 ? 0 : lean < 0.7 ? 1 : 2; bubbles.push({ s: ATT[a].dreams[lvl], x: cx + L * rnd(0.3, 1.1), y: H + 10, w: 1 + lvl * 1.5, v: rnd(18, 30) * (1 + lvl * 0.4), life: 0 }); }
      // beam
      g.save(); g.translate(cx, cy);
      g.strokeStyle = '#d9cdee'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(-14, 26); g.lineTo(14, 26); g.closePath(); g.stroke();
      g.rotate(tilt); g.beginPath(); g.moveTo(-L, 0); g.lineTo(L, 0); g.stroke(); g.restore();
      const lx = cx - Math.cos(tilt) * L, ly = cy - Math.sin(tilt) * L, rx = cx + Math.cos(tilt) * L, ry = cy + Math.sin(tilt) * L;
      g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx, ly + 40); g.moveTo(rx, ry); g.lineTo(rx, ry + 40); g.stroke();
      g.fillStyle = '#f1d49a'; g.beginPath(); g.ellipse(lx, ly + 48, 34, 10, 0, 0, TAU); g.fill();
      g.fillStyle = '#6d4fa6'; g.beginPath(); g.ellipse(rx, ry + 48, 34, 10, 0, 0, TAU); g.fill();
      g.font = '12px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillStyle = 'rgba(239,231,244,.8)';
      g.fillText('CONSCIOUS ATTITUDE', lx, ly + 80); g.fillText('THE UNCONSCIOUS', rx, ry + 80);
      g.font = '17px Marcellus, serif'; g.fillStyle = flipped ? '#e0a5b3' : '#f1d49a';
      g.fillText(flipped ? ATT[a].flip : ATT[a].name, lx, ly + 102);
      // dream images rising
      bubbles.forEach((b) => {
        b.life += dt; b.y -= b.v * dt; b.x += Math.sin(b.life * 1.3) * 10 * dt;
        const tgtY = ry + 60 + (b.w > 3 ? 0 : 30);
        if (b.y < tgtY) b.y = tgtY;
        const k = clamp(b.life / 1.5, 0, 1);
        g.font = `italic ${Math.round(13 + b.w * 3)}px Spectral, serif`; g.fillStyle = `rgba(226,214,248,${0.85 * k})`; g.textAlign = 'center';
        N.wrapText(g, b.s, clamp(b.x, 90, W - 90), b.y, 180, 18 + b.w * 2);
      });
      bubbles = bubbles.filter((b) => b.life < 6);
      let cap;
      if (flipped) cap = `<b>Enantiodromia.</b> Pushed far enough, the attitude has turned into its opposite: ${ATT[a].flip}. What was excluded took over.`;
      else if (lean > 0.9) cap = 'The images are now loud and frequent. Hold here a moment longer…';
      else if (lean > 0.55) cap = 'The more one-sided the attitude, the more insistent the compensating images become.';
      else cap = 'A mild lean draws a mild answer. These dream images are illustrations, invented for the demonstration.';
      kit.caption(cap);
    });
    return { stop() { D._tilt = 0; } };
  };

  /* ── Shadow: the one that follows, and the one we throw ── */
  D.shadow = (kit) => {
    const g = kit.ctx;
    const TRAITS = { Arrogance: 'So full of themselves.', Laziness: 'Never lifts a finger.', Neediness: 'Always wanting something.', Ambition: 'Would step on anyone.', Anger: 'Such a temper.' };
    let mode = 0, trait = 'Arrogance', proj = -1, projT = 0;
    const me = { x: 0, y: 0 }, sh = { x: 0, y: 0 }, will = { x: 0, y: 0, t: 0 };
    let others = [];
    kit.onResize((W, H) => { if (!me.x) { me.x = sh.x = W * 0.3; me.y = sh.y = H * 0.62; } others = [[0.62, 0.55], [0.78, 0.66], [0.9, 0.5]].map(([x, y]) => ({ x: x * W, y: y * H })); });
    kit.group(['Walk with it', 'Project it'], (i) => { mode = i; if (i === 0) { proj = -1; } else startProjection(); }, 0);
    const traitBtns = kit.group(Object.keys(TRAITS), (i, k) => { trait = k; if (mode === 1) startProjection(); }, 0);
    const withdraw = kit.button('Withdraw the projection', () => doWithdraw()); withdraw.disabled = true;
    function startProjection() { proj = Math.floor(Math.random() * 3); projT = 0; withdraw.disabled = false; N.sound.pluck(110, 0.08, 2.5); }
    function doWithdraw() { if (proj < 0) return; proj = -1; withdraw.disabled = true; N.sound.pluck(329.63, 0.06, 2); }
    kit.onDown = (p) => { if (proj >= 0) { const o = others[proj]; if (Math.hypot(p.x - o.x, p.y - o.y) < 60) doWithdraw(); } };
    kit.onFrame((t, dt) => {
      const { W, H } = kit, p = kit.pointer, S = Math.min(W, H) * 0.2;
      const tx = p.inside ? p.x : W * 0.3 + Math.sin(t * 0.4) * W * 0.12, ty = p.inside ? clamp(p.y, H * 0.35, H * 0.85) : H * 0.62;
      me.x = lerp(me.x, tx, 1 - Math.pow(0.02, dt)); me.y = lerp(me.y, ty, 1 - Math.pow(0.02, dt));
      will.t -= dt;
      if (will.t < 0) { will.t = rnd(2.5, 5); will.x = rnd(-1, 1) * S * 1.2; will.y = rnd(-0.3, 0.3) * S; }
      let sx, sy;
      if (proj >= 0) { projT += dt; const o = others[proj]; sx = o.x + S * 0.25; sy = o.y + S * 0.62; }
      else { sx = me.x + S * 0.45 + (will.t > 3.5 ? will.x : 0); sy = me.y + S * 0.62 + (will.t > 3.5 ? will.y : 0); }
      sh.x = lerp(sh.x, sx, 1 - Math.pow(proj >= 0 ? 0.1 : 0.35, dt)); sh.y = lerp(sh.y, sy, 1 - Math.pow(proj >= 0 ? 0.1 : 0.35, dt));
      g.fillStyle = '#1b1530'; g.fillRect(0, 0, W, H);
      const ground = g.createLinearGradient(0, H * 0.5, 0, H); ground.addColorStop(0, '#2a2146'); ground.addColorStop(1, '#141024');
      g.fillStyle = ground; g.fillRect(0, H * 0.5, W, H * 0.5);
      const lg = g.createRadialGradient(W * 0.1, H * 0.05, 0, W * 0.1, H * 0.05, W * 0.8); lg.addColorStop(0, 'rgba(255,236,200,.18)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H);
      const drawShadowAt = (x, y, k) => { g.save(); g.translate(x, y); g.transform(1, 0, -0.9, 0.35, 0, 0); g.fillStyle = `rgba(4,2,10,${0.8 * k})`; N.figure(g, 0, -S * 0.5, S * 1.1); g.restore(); };
      if (mode === 1) others.forEach((o, i) => {
        const hit = i === proj, k = hit ? sstep(0, 1.5, projT) : 0;
        drawShadowAt(o.x + S * 0.25, o.y + S * 0.62, 0.35);
        g.fillStyle = `rgb(${lerp(200, 70, k)},${lerp(190, 50, k)},${lerp(220, 90, k)})`; N.figure(g, o.x, o.y, S * 0.95);
        if (hit && k > 0.5) {
          g.font = 'italic 17px Spectral, serif'; g.textAlign = 'center'; g.fillStyle = `rgba(224,165,179,${k})`;
          g.fillText('“' + TRAITS[trait] + '”', o.x, o.y - S * 0.95);
        }
      });
      if (proj < 0) drawShadowAt(sh.x, sh.y, 1); else { const k = 1 - sstep(0, 1.2, projT); if (k > 0) drawShadowAt(sh.x, sh.y, k); }
      const bright = proj >= 0 ? 255 : 236;
      g.fillStyle = `rgb(${bright},${proj >= 0 ? 248 : 228},${proj >= 0 ? 238 : 244})`; N.figure(g, me.x, me.y, S);
      if (proj >= 0) { g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.beginPath(); g.ellipse(me.x, me.y + S * 0.58, S * 0.3, S * 0.06, 0, 0, TAU); g.stroke(); }
      let cap;
      if (mode === 0) cap = will.t > 3.5 ? 'Your shadow has gone its own way for a moment.' : 'It follows you, a little late, not quite matching your movements.';
      else if (proj >= 0) cap = `The trait you would not own, <b>${trait.toLowerCase()}</b>, has landed on someone else. You feel lighter and cleaner, with no shadow at your feet, and they seem unbearable. Tap them, or use the button, to take it back.`;
      else cap = `Projection withdrawn. <b>${trait}</b> is back where it came from: in you. That is less comfortable, and more honest. It is also where it can be worked with.`;
      kit.caption(cap);
      N.vignette(g, W, H, 0.5);
    });
    return {};
  };

  /* ── Complexes: the word-association experiment ── */
  D.complexes = (kit) => {
    const g = kit.ctx;
    const WORDS = ['head', 'green', 'water', 'to sing', 'death', 'long', 'ship', 'to pay', 'window', 'friendly', 'mother', 'money', 'to hit', 'proud', 'home', 'alone'];
    let phase = 'intro', idx = 0, shownAt = 0, results = [], recall = false, nodes = [];
    const start = kit.button('Begin the test', () => { phase = 'test'; idx = 0; results = []; recall = false; showWord(); start.disabled = true; input.focus(); });
    const input = kit.text('Your answer', (v, el) => {
      if (phase !== 'test') return;
      const rt = (performance.now() - shownAt) / 1000;
      if (!recall) results.push({ w: WORDS[idx], a: v.trim(), rt });
      else results[idx].recalled = v.trim();
      el.value = ''; idx++;
      if (idx >= WORDS.length) finish(); else showWord();
    });
    const again = kit.button('Try to recall your answers', () => { recall = true; phase = 'test'; idx = 0; showWord(); input.focus(); again.disabled = true; });
    again.disabled = true;
    function showWord() { shownAt = performance.now(); N.sound.pluck(recall ? 440 : 523.25, 0.04, 0.8); }
    function finish() {
      phase = 'result'; start.disabled = false; start.textContent = 'Start again';
      if (!recall) again.disabled = false;
      const rts = results.map((r) => r.rt).sort((a, b) => a - b), med = rts[Math.floor(rts.length / 2)] || 1;
      results.forEach((r) => {
        r.why = [];
        if (!r.a) r.why.push('no answer');
        if (r.rt > med * 1.5) r.why.push(`slow (${r.rt.toFixed(1)}s against a median of ${med.toFixed(1)}s)`);
        if (r.a && r.a.toLowerCase() === r.w.toLowerCase()) r.why.push('repeated the word');
        if (r.a && r.a.split(/\s+/).length > 2) r.why.push('a long answer');
        if (recall && r.recalled !== undefined && r.recalled.toLowerCase() !== r.a.toLowerCase()) r.why.push('answer not recalled');
      });
      const { W, H } = kit;
      nodes = results.map((r, i) => ({ r, x: W / 2 + Math.cos(i / results.length * TAU) * W * 0.36, y: H / 2 + Math.sin(i / results.length * TAU) * H * 0.34, vx: 0, vy: 0 }));
    }
    kit.onFrame((t, dt) => {
      const { W, H } = kit;
      g.fillStyle = '#0d0a1e'; g.fillRect(0, 0, W, H);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (phase === 'intro') {
        g.font = '20px Marcellus, serif'; g.fillStyle = 'rgba(239,231,244,.9)';
        N.wrapText(g, 'Sixteen words, one at a time. Type the first word that comes to mind and press Enter. Speed matters more than sense.', W / 2, H * 0.42, Math.min(460, W - 40), 28);
        kit.caption('The disturbances in answering, not the answers themselves, are what Jung measured. This is a teaching sketch of his method, not a psychological test.');
      } else if (phase === 'test') {
        const el = (performance.now() - shownAt) / 1000;
        g.font = `${Math.round(Math.min(W, H) * 0.12)}px Marcellus, serif`; g.fillStyle = '#f1d49a';
        g.fillText(WORDS[idx], W / 2, H * 0.45);
        g.font = '13px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(183,171,200,.8)';
        g.fillText(`${recall ? 'RECALL · ' : ''}${idx + 1} / ${WORDS.length} · ${el.toFixed(1)}s`, W / 2, H * 0.62);
        kit.caption(recall ? 'Now type the answer you gave the first time. Jung called this the reproduction test.' : 'Type your answer below and press Enter.');
      } else {
        const flagged = nodes.filter((n) => n.r.why.length);
        nodes.forEach((n) => {
          const hot = n.r.why.length > 0;
          const tx = hot ? W / 2 + Math.cos(t * 0.2 + flagged.indexOf(n)) * W * 0.12 : n.x, ty = hot ? H / 2 + Math.sin(t * 0.25 + flagged.indexOf(n) * 1.7) * H * 0.12 : n.y;
          n.vx = (n.vx + (tx - (n.cx ?? n.x)) * 2 * dt) * 0.9; n.vy = (n.vy + (ty - (n.cy ?? n.y)) * 2 * dt) * 0.9;
          n.cx = (n.cx ?? n.x) + n.vx; n.cy = (n.cy ?? n.y) + n.vy;
        });
        g.strokeStyle = 'rgba(224,165,179,.25)'; g.lineWidth = 1;
        for (let i = 0; i < flagged.length; i++) for (let j = i + 1; j < flagged.length; j++) { g.beginPath(); g.moveTo(flagged[i].cx, flagged[i].cy); g.lineTo(flagged[j].cx, flagged[j].cy); g.stroke(); }
        nodes.forEach((n) => {
          const hot = n.r.why.length > 0, pulse = hot ? 1 + 0.15 * Math.sin(t * 3) : 1;
          if (hot) { const gl = g.createRadialGradient(n.cx, n.cy, 0, n.cx, n.cy, 46 * pulse); gl.addColorStop(0, 'rgba(224,165,179,.45)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(n.cx - 50, n.cy - 50, 100, 100); }
          g.font = `${hot ? 18 : 15}px Marcellus, serif`; g.fillStyle = hot ? '#fbe3ea' : 'rgba(183,171,200,.55)';
          g.fillText(n.r.w, n.cx, n.cy - 9);
          g.font = 'italic 13px Spectral, serif'; g.fillStyle = hot ? '#e0a5b3' : 'rgba(183,171,200,.45)';
          g.fillText(n.r.a || '—', n.cx, n.cy + 10);
        });
        kit.caption(flagged.length
          ? `<b>${flagged.length} words showed disturbances</b>: ${flagged.map((n) => `<i>${n.r.w}</i> (${n.r.why.join(', ')})`).join('; ')}. Jung would ask whether they share a theme. Sometimes they do, and sometimes a slow answer is only a slow answer.`
          : 'No clear disturbances this time. Speed is not virtue here, and one run proves little either way.');
      }
    });
    return {};
  };

  /* ── Dreams: Jung's house dream in four acts ── */
  D.dreams = (kit) => {
    const g = kit.ctx;
    const ACTS = [
      { name: 'Exposition', floor: 0, text: 'Jung, 1909: he is in a house he does not know, and yet it is “my house”. He stands on the upper floor, in a salon furnished in old rococo style, with fine paintings on the walls.' },
      { name: 'Development', floor: 1, text: 'He goes down the stairs. The ground floor is much older: medieval, perhaps fifteenth or sixteenth century, dark, with brick floors. He goes from room to room exploring it.' },
      { name: 'Culmination', floor: 2, text: 'A heavy door leads down to a vaulted cellar of Roman age. In the stone floor is a slab with a ring. He lifts it: narrow stairs lead down into a low cave, thick with dust, scattered bones and broken pottery, and two very old human skulls.' },
      { name: 'Lysis', floor: 3, text: 'The dream stops there, among the skulls. Its resolution came later, in Jung\'s understanding of it: the house as an image of the psyche, each floor a deeper and older layer, down to what is shared with all humanity.' },
    ];
    const SYMBOLS = {
      house: { label: 'The house', jung: 'Jung read the house as an image of the psyche itself. The salon was consciousness, the ground floor the first level of the unconscious, and the cellar and cave went down into the collective, “the world of the primitive man within myself”.', amp: 'Houses in dreams widely stand for the self or the body: rooms not yet discovered are a common motif for unknown parts of oneself.' },
      stairs: { label: 'The way down', jung: 'For Jung each descent reached further back in history and further from personal experience.', amp: 'The descent is the katabasis or nekyia of myth: Odysseus calling up the dead, Inanna passing through the seven gates, Dante entering the Inferno.' },
      skulls: { label: 'The two skulls', jung: 'Freud, to whom he told the dream, pressed him to name whose death he wished. Jung, unwilling to argue, named his wife and sister-in-law. He felt Freud had missed the dream\'s real meaning.', amp: 'Skulls point to the ancestors and to death, the memento mori, and to what lies at the base of human history: Golgotha is the place of the skull.' },
    };
    let act = 0, cam = 0, sym = null;
    kit.group(ACTS.map((a) => a.name), (i) => { act = i; sym = null; }, 0);
    Object.keys(SYMBOLS).forEach((k) => kit.button(SYMBOLS[k].label, () => { sym = k; }));
    kit.onFrame((t, dt) => {
      const { W, H } = kit;
      cam = lerp(cam, ACTS[act].floor, 1 - Math.pow(0.1, dt));
      g.fillStyle = '#0a0716'; g.fillRect(0, 0, W, H);
      const fh = H * 0.62, x0 = W * 0.2, w = W * 0.6, top = H * 0.2 - cam * fh;
      const floors = [
        { c: '#6c5a86', label: 'Salon · rococo' }, { c: '#4d3d66', label: 'Ground floor · medieval' },
        { c: '#33264a', label: 'Cellar · Roman' }, { c: '#1d1430', label: 'Cave · prehistoric' },
      ];
      floors.forEach((f, i) => {
        const y = top + i * fh, lit = Math.abs(cam - i) < 0.6 ? 1 : 0.35;
        g.fillStyle = f.c; g.globalAlpha = lit; g.fillRect(x0, y, w, fh - 6); g.globalAlpha = 1;
        g.strokeStyle = 'rgba(239,231,244,.25)'; g.strokeRect(x0, y, w, fh - 6);
        g.font = '12px "IBM Plex Mono", monospace'; g.fillStyle = 'rgba(239,231,244,.7)'; g.textAlign = 'left';
        g.fillText(f.label.toUpperCase(), x0 + 12, y + 20);
        g.strokeStyle = 'rgba(241,212,154,.5)'; g.lineWidth = 1.5;
        if (i === 0) { for (let k = 0; k < 3; k++) { g.strokeRect(x0 + w * (0.15 + k * 0.28), y + fh * 0.25, w * 0.14, fh * 0.22); } g.beginPath(); g.arc(x0 + w * 0.5, y + fh * 0.9, w * 0.12, Math.PI, TAU); g.stroke(); }
        if (i === 1) { for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(x0 + w * (0.1 + k * 0.15), y + fh * 0.2); g.lineTo(x0 + w * (0.1 + k * 0.15), y + fh * 0.9); g.stroke(); } }
        if (i === 2) { for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x0 + w * (0.2 + k * 0.3), y + fh * 0.7, w * 0.13, Math.PI, TAU); g.stroke(); } g.strokeRect(x0 + w * 0.44, y + fh * 0.78, w * 0.12, fh * 0.08); g.beginPath(); g.arc(x0 + w * 0.5, y + fh * 0.82, 5, 0, TAU); g.stroke(); }
        if (i === 3) {
          g.fillStyle = 'rgba(230,220,200,.75)';
          for (let k = 0; k < 14; k++) { const bx = x0 + w * (0.1 + (k * 0.37 % 0.8)), by = y + fh * (0.6 + (k * 0.23 % 0.25)); g.fillRect(bx, by, 10 + (k % 3) * 6, 2); }
          [0.38, 0.6].forEach((sx) => { const cx = x0 + w * sx, cy = y + fh * 0.5; g.beginPath(); g.arc(cx, cy, 20, 0, TAU); g.fill(); g.fillStyle = '#1d1430'; g.beginPath(); g.arc(cx - 7, cy - 2, 5, 0, TAU); g.arc(cx + 7, cy - 2, 5, 0, TAU); g.fill(); g.fillStyle = 'rgba(230,220,200,.75)'; g.fillRect(cx - 9, cy + 16, 18, 7); });
        }
        if (i < 3) { g.strokeStyle = 'rgba(239,231,244,.4)'; g.beginPath(); for (let s = 0; s < 6; s++) { g.moveTo(x0 + w * 0.82 + s * 6, y + fh - 10 - s * 8); g.lineTo(x0 + w * 0.82 + s * 6 + 6, y + fh - 10 - s * 8); } g.stroke(); }
      });
      const lampY = H * 0.2 + fh * 0.55;
      const gl = g.createRadialGradient(W / 2, lampY, 0, W / 2, lampY, Math.min(W, H) * 0.35); gl.addColorStop(0, 'rgba(255,226,170,.22)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
      N.vignette(g, W, H, 0.7);
      if (sym) { const s = SYMBOLS[sym]; kit.caption(`<b>${s.label}.</b> <span style="color:#f1d49a">Jung's own association:</span> ${s.jung} <br><span style="color:#b79ae8">Amplification:</span> ${s.amp}`); }
      else kit.caption(`<b>${ACTS[act].name}.</b> ${ACTS[act].text} <span style="color:#8e82a3">Paraphrased from Memories, Dreams, Reflections.</span>`);
    });
    return {};
  };

  /* ── Active imagination: an image with a life of its own ── */
  D.active = (kit) => {
    const g = kit.ctx;
    const SEEDS = [
      { name: 'A bird', words: ['follow', 'past the tree line', 'not that way', 'higher'] },
      { name: 'A door', words: ['not yet', 'knock', 'it is already open', 'behind you'] },
      { name: 'A figure by the water', words: ['you are late', 'sit down', 'look at the water', 'who sent you?'] },
    ];
    let seed = 0, steer = false, life = 0.3, pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, target = { x: 0, y: 0, t: 0 }, speech = [], spoke = 0, turned = 0;
    const trail = [];
    kit.onResize((W, H) => { if (!pos.x) { pos.x = W / 2; pos.y = H / 2; } });
    kit.group(SEEDS.map((s) => s.name), (i) => { seed = i; life = 0.3; speech = []; trail.length = 0; }, 0);
    kit.group(['Watch it', 'Steer it'], (i) => { steer = i === 1; }, 0);
    kit.text('Speak to it', (v, el) => { if (!v.trim()) return; spoke++; turned = 3; el.value = ''; life = Math.min(1, life + 0.15); speech.push({ s: '“' + v.trim() + '”', x: kit.W / 2, y: kit.H * 0.88, a: 1, you: true }); });
    kit.onFrame((t, dt) => {
      const { W, H } = kit, p = kit.pointer;
      if (steer && p.inside) { pos.x = lerp(pos.x, p.x, 1 - Math.pow(0.001, dt)); pos.y = lerp(pos.y, p.y, 1 - Math.pow(0.001, dt)); life = Math.max(0.05, life - dt * 0.18); vel.x = vel.y = 0; }
      else {
        life = Math.min(1, life + dt * (steer ? 0 : 0.05));
        target.t -= dt; if (target.t < 0) { target.t = rnd(2, 5); target.x = rnd(0.15, 0.85) * W; target.y = rnd(0.15, 0.75) * H; }
        const ax = (target.x - pos.x) * 0.4 + Math.sin(t * 1.7) * 30, ay = (target.y - pos.y) * 0.4 + Math.cos(t * 1.3) * 30;
        vel.x = (vel.x + ax * dt) * 0.97; vel.y = (vel.y + ay * dt) * 0.97;
        if (turned > 0) { turned -= dt; vel.x *= 0.9; vel.y *= 0.9; }
        pos.x += vel.x * dt * (0.4 + life); pos.y += vel.y * dt * (0.4 + life);
        if (Math.random() < dt * 0.25 * life) speech.push({ s: pick(SEEDS[seed].words), x: pos.x, y: pos.y - 30, a: 1 });
      }
      trail.push([pos.x, pos.y]); if (trail.length > 60) trail.shift();
      g.fillStyle = `rgb(${10 + life * 8},${7 + life * 4},${22 + life * 14})`; g.fillRect(0, 0, W, H);
      g.strokeStyle = `rgba(216,186,255,${0.15 + life * 0.35})`; g.lineWidth = 2; g.beginPath(); trail.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
      const s = Math.min(W, H) * 0.09, hue = life;
      g.save(); g.translate(pos.x, pos.y); g.globalAlpha = 0.3 + life * 0.7;
      g.shadowColor = 'rgba(216,186,255,.8)'; g.shadowBlur = 30 * life; g.fillStyle = `rgb(${200 + hue * 55},${180 + hue * 46},${240})`; g.strokeStyle = g.fillStyle; g.lineWidth = 2;
      if (seed === 0) { const flap = Math.sin(t * (2 + life * 6)) * 0.6 * life; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-s, -s * flap - s * 0.3, -s * 1.3, s * 0.1); g.moveTo(0, 0); g.quadraticCurveTo(s, -s * flap - s * 0.3, s * 1.3, s * 0.1); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.12, 0, TAU); g.fill(); }
      else if (seed === 1) { g.strokeRect(-s * 0.5, -s * 0.9, s, s * 1.8); const open = 0.5 + 0.5 * Math.sin(t * 0.7) * life; g.fillStyle = 'rgba(255,236,200,.8)'; g.fillRect(-s * 0.5, -s * 0.9, s * open, s * 1.8); }
      else { N.figure(g, 0, 0, s * 1.4); g.strokeStyle = 'rgba(183,154,232,.6)'; g.beginPath(); g.moveTo(-s * 1.5, s * 0.8); g.lineTo(s * 1.5, s * 0.8); g.stroke(); }
      g.restore();
      speech.forEach((q) => { q.a -= dt * 0.25; q.y -= dt * 12; g.font = q.you ? 'italic 16px Spectral, serif' : 'italic 18px Spectral, serif'; g.fillStyle = q.you ? `rgba(241,212,154,${q.a})` : `rgba(226,214,248,${q.a})`; g.textAlign = 'center'; g.fillText(q.s, clamp(q.x, 80, W - 80), q.y); });
      speech = speech.filter((q) => q.a > 0);
      N.vignette(g, W, H, 0.6);
      let cap;
      if (steer) cap = life < 0.2 ? 'Steered hard, it has gone stiff and dim. Directed fantasy is only the ego talking to itself.' : 'You are steering. Notice what happens to its life.';
      else if (spoke) cap = 'It turned toward you. In active imagination the ego takes part as itself, and then writes down, paints or reflects on what happened. That last step is what makes it work rather than daydream.';
      else cap = life > 0.7 ? 'Left alone, it has its own intentions. This is the attitude Jung describes: attentive, not controlling.' : 'Watch without steering. Give it a minute.';
      kit.caption(cap + ' <span style="color:#8e82a3">Jung warned the method is not for everyone; if images become overwhelming, stop and ground yourself.</span>');
    });
    return {};
  };
})();
