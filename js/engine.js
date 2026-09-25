/* Nekyia — engine: descent, backdrop shader, living forms, spiral, sound, chambers. */
(function () {
  const N = window.N;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  N.util = { TAU, clamp, lerp, sstep };

  /* ───────────── State (per-viewer convenience only) ───────────── */
  const KEY = 'nekyia.v1';
  N.state = { visited: [], integrated: [], ascended: false };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) Object.assign(N.state, s); } catch (e) {}
  N.save = () => { try { localStorage.setItem(KEY, JSON.stringify(N.state)); } catch (e) {} };
  N.mark = (list, id) => { if (!N.state[list].includes(id)) { N.state[list].push(id); N.save(); } };

  /* ───────────── Motion preferences ───────────── */
  const mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  N.reduced = mq.matches;
  N.still = false;
  N.speed = () => (N.still ? 0 : N.reduced ? 0.35 : 1);

  /* ───────────── Colour ramp: one function for shader and ink ───────────── */
  const STOPS = [
    [0.000, [0.86, 0.78, 0.70]],
    [0.100, [0.74, 0.66, 0.72]],
    [0.190, [0.52, 0.46, 0.62]],
    [0.235, [0.30, 0.27, 0.48]],
    [0.320, [0.15, 0.13, 0.31]],
    [0.520, [0.08, 0.06, 0.20]],
    [0.640, [0.05, 0.02, 0.12]],
    [0.860, [0.018, 0.008, 0.045]],
    [1.000, [0.035, 0.018, 0.06]],
  ];
  function ramp(w) {
    let c = STOPS[0][1].slice();
    for (let i = 1; i < STOPS.length; i++) {
      const t = sstep(STOPS[i - 1][0], STOPS[i][0], w);
      c = c.map((v, k) => lerp(v, STOPS[i][1][k], t));
    }
    return c;
  }
  const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  /* Ink for forms and labels at a world depth: dark on the dusk, light below. */
  function inkAt(d) {
    const bright = lum(ramp(d)) > 0.55;
    if (bright) return { ink: 'rgb(40,29,66)', glow: 'rgba(255,246,236,0.75)', lbl: '#241a3c', lblglow: 'rgba(255,246,236,.8)', dark: true };
    let col;
    if (d < 0.52) col = [226, 214, 248];
    else if (d < 0.88) col = [216, 186, 255];
    else col = [255, 226, 172];
    const s = `rgb(${col.join(',')})`;
    return { ink: s, glow: `rgba(${col.join(',')},0.55)`, lbl: s, lblglow: 'rgba(0,0,0,.75)', dark: false };
  }
  N.inkAt = inkAt;

  /* ───────────── Depth & scroll ───────────── */
  const SCREENS = 12;
  let W = innerWidth, H = innerHeight, worldPx = H * (SCREENS - 1);
  let depth = 0, target = 0;
  const track = document.getElementById('track');
  function layout() {
    W = innerWidth; H = innerHeight;
    track.style.height = (H * SCREENS) + 'px';
    worldPx = H * (SCREENS - 1);
    sizeCanvases();
    dirty = true;
  }
  function readScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    target = clamp(scrollY / max, 0, 1);
    dirty = true;
  }
  N.depth = () => depth;
  N.scrollToDepth = (d, smooth = true) => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    window.scrollTo({ top: d * max, behavior: smooth && !N.reduced ? 'smooth' : 'auto' });
  };
  N.layerAt = (d) => N.layers.find((l) => d >= l.from && d < l.to) || N.layers[N.layers.length - 1];
  const screenY = (d) => H / 2 + (d - depth) * worldPx;

  /* ───────────── Backdrop (WebGL) ───────────── */
  const bg = document.getElementById('bg');
  let gl = null, prog = null, uni = {}, bgScale = 0.5;
  const FRAG = `
precision mediump float;
uniform vec2 r; uniform float t, depth, span, aspect;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*n(p); p*=2.03; a*=.5; } return v; }
vec3 ramp(float w){
  vec3 c=vec3(.86,.78,.70);
  c=mix(c,vec3(.74,.66,.72),smoothstep(0.,.10,w));
  c=mix(c,vec3(.52,.46,.62),smoothstep(.10,.19,w));
  c=mix(c,vec3(.30,.27,.48),smoothstep(.19,.235,w));
  c=mix(c,vec3(.15,.13,.31),smoothstep(.235,.32,w));
  c=mix(c,vec3(.08,.06,.20),smoothstep(.32,.52,w));
  c=mix(c,vec3(.05,.02,.12),smoothstep(.52,.64,w));
  c=mix(c,vec3(.018,.008,.045),smoothstep(.64,.86,w));
  c=mix(c,vec3(.035,.018,.06),smoothstep(.86,1.,w));
  return c; }
void main(){
  vec2 uv = gl_FragCoord.xy / r;
  float yy = 1. - uv.y;
  float w = depth + (yy - .5) * span;
  vec3 col = ramp(clamp(w, 0., 1.));
  vec2 q = vec2(uv.x * aspect * 2.2, w * 18.);
  float fog = fbm(q + vec2(t * .015, -t * .02));
  col += (fog - .5) * mix(.10, .05, smoothstep(.2, .6, w));
  float mist = fbm(q * .6 + vec2(-t * .01, t * .012) + 7.);
  col += vec3(.30, .12, .48) * pow(mist, 3.) * smoothstep(.45, .6, w) * (1. - smoothstep(.85, .95, w)) * .9;
  col += vec3(.20, .10, .30) * pow(fbm(q*.35 + 3.1 + t*.004), 4.) * smoothstep(.25, .45, w) * .7;
  float wave = sin(uv.x * aspect * 16. + t * .8) * .0016 + sin(uv.x * aspect * 5. - t * .5) * .0024;
  float wl = abs(w - .225 - wave);
  col += vec3(.95, .9, 1.) * smoothstep(.0035, 0., wl) * .55;
  col += vec3(.9, .85, .95) * smoothstep(.02, 0., wl) * .08;
  float below = smoothstep(.225, .235, w) * (1. - smoothstep(.3, .48, w));
  float shaft = pow(abs(sin(uv.x * aspect * 9. + w * 30. + sin(t * .2 + uv.x * 3.) * 1.4)), 18.);
  col += vec3(.75, .72, .95) * shaft * below * .12;
  float cy = .5 + (.955 - depth) / span;
  float dd = length(vec2((uv.x - .5) * aspect, yy - cy));
  float pulse = .85 + .15 * sin(t * .6);
  col += vec3(1., .82, .55) * exp(-dd * 3.2) * .55 * pulse;
  col += vec3(.9, .6, .8) * exp(-dd * 9.) * .25;
  vec2 v = uv - .5; col *= 1. - .38 * pow(length(v) * 1.35, 2.6);
  col += (h(gl_FragCoord.xy + t) - .5) * .018;
  gl_FragColor = vec4(col, 1.);
}`;
  function initGL() {
    try { gl = bg.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['r', 't', 'depth', 'span', 'aspect'].forEach((k) => (uni[k] = gl.getUniformLocation(prog, k)));
    } catch (e) { console.warn('Backdrop shader unavailable, using gradient.', e); gl = null; }
  }
  function drawBG(t) {
    if (!gl) return;
    gl.viewport(0, 0, bg.width, bg.height);
    gl.uniform2f(uni.r, bg.width, bg.height);
    gl.uniform1f(uni.t, t);
    gl.uniform1f(uni.depth, depth);
    gl.uniform1f(uni.span, H / worldPx);
    gl.uniform1f(uni.aspect, W / H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ───────────── Foreground canvas ───────────── */
  const fg = document.getElementById('fg');
  let ctx = fg.getContext('2d');
  let dpr = 1;
  function sizeCanvases() {
    dpr = Math.min(window.devicePixelRatio || 1, W < 760 ? 1.5 : 2);
    fg.width = Math.round(W * dpr); fg.height = Math.round(H * dpr);
    bg.width = Math.max(2, Math.round(W * bgScale)); bg.height = Math.max(2, Math.round(H * bgScale));
    if (!particles.length) seedParticles();
  }

  /* Particles: motes above the water, plankton below, sparks near the core. */
  let particles = [], particleBudget = 1;
  function seedParticles() {
    const count = Math.round((W < 760 ? 70 : 140) * particleBudget);
    particles = [];
    for (let i = 0; i < count; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, z: 0.25 + Math.random() * 0.75, ph: Math.random() * TAU, s: 0.6 + Math.random() * 1.8 });
  }
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  })();
  function drawParticles(t, dDepth) {
    const d = depth;
    const warm = 1 - sstep(0.2, 0.26, d), core = sstep(0.86, 0.97, d);
    const alphaBase = warm ? 0.35 : lerp(0.45, 0.22, sstep(0.3, 0.8, d));
    for (const p of particles) {
      p.y -= dDepth * worldPx * p.z;                       // parallax with the descent
      p.y -= (warm ? -0.04 : 0.12 + core * 0.2) * p.z * N.speed();   // dust settles; below, things rise
      p.x += Math.sin(t * 0.3 + p.ph) * 0.08 * N.speed();
      if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      const r = p.s * (1.5 + (1 - p.z) * 5);               // far motes are bigger and softer: depth of field
      const a = alphaBase * (0.3 + 0.7 * (1 - Math.abs(p.z - 0.6))) * (0.6 + 0.4 * Math.sin(t * 0.8 + p.ph));
      ctx.globalAlpha = clamp(a, 0, 1) * (N.still ? 0.5 : 1);
      ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  /* ───────────── Living forms ───────────── */
  const hits = document.getElementById('hits');
  const forms = [];
  function buildHits() {
    N.concepts.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'hit'; b.type = 'button'; b.setAttribute('role', 'listitem');
      b.setAttribute('aria-label', `${c.title}. ${c.short} Open the demonstration.`);
      b.innerHTML = `<span class="lbl">${c.title}<small>${c.short}</small></span>`;
      b.addEventListener('click', () => N.openChamber(c.id, b));
      b.addEventListener('focus', () => { const y = screenY(c.d); if (y < H * 0.15 || y > H * 0.85) N.scrollToDepth(c.d); });
      hits.appendChild(b);
      forms.push({ c, i, el: b, lbl: b.querySelector('.lbl'), seed: Math.random() * 100 });
    });
  }
  function formRadius() { return clamp(Math.min(W, H) * 0.085, 42, 104); }

  const G = N.glyphs = {};
  const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); };
  const figure = (g, x, y, s) => { // a simple standing person
    g.beginPath(); g.arc(x, y - s * 0.62, s * 0.2, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(x - s * 0.26, y + s * 0.55); g.quadraticCurveTo(x - s * 0.3, y - s * 0.3, x, y - s * 0.36);
    g.quadraticCurveTo(x + s * 0.3, y - s * 0.3, x + s * 0.26, y + s * 0.55); g.closePath(); g.fill();
  };
  N.figure = figure;

  G.lamp = (R, t, k) => {
    const br = 1 + 0.06 * Math.sin(t * 1.3);
    ctx.globalAlpha = 0.25; circle(0, 0, R * 0.95 * br); ctx.stroke();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + t * 0.08, l = R * (0.55 + 0.12 * Math.sin(t * 1.1 + i));
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t + i);
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.42, Math.sin(a) * R * 0.42); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.stroke();
    }
    ctx.globalAlpha = 0.9; circle(0, 0, R * 0.26 * br); ctx.fill();
    ctx.globalAlpha = 1;
  };
  G.mask = (R, t) => {
    ctx.save(); ctx.translate(Math.sin(t * 0.3) * R * 0.14, R * 0.04); ctx.globalAlpha = 0.28;
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.5, R * 0.66, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.rotate(Math.sin(t * 0.4) * 0.12);
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.52, R * 0.68, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-R * 0.2, -R * 0.14, R * 0.12, R * 0.07, 0.1, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(R * 0.2, -R * 0.14, R * 0.12, R * 0.07, -0.1, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-R * 0.2, R * 0.28); ctx.quadraticCurveTo(0, R * (0.36 + 0.06 * Math.sin(t)), R * 0.2, R * 0.28); ctx.stroke();
    ctx.restore();
  };
  G.cross = (R, t) => {
    ctx.save(); ctx.rotate(t * 0.05);
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(-R * 0.85, 0); ctx.lineTo(R * 0.85, 0); ctx.moveTo(0, -R * 0.85); ctx.lineTo(0, R * 0.85); ctx.stroke();
    ctx.globalAlpha = 0.3; circle(0, 0, R * 0.5); ctx.stroke(); ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4, pul = 0.5 + 0.5 * Math.sin(t * 1.2 - i * 1.4);
      ctx.globalAlpha = 0.4 + 0.6 * pul; circle(Math.cos(a) * R * 0.85, Math.sin(a) * R * 0.85, R * (0.08 + 0.05 * pul)); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  };
  G.balance = (R, t) => {
    const tilt = Math.sin(t * 0.5) * 0.28;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-R * 0.14, R * 0.26); ctx.lineTo(R * 0.14, R * 0.26); ctx.closePath(); ctx.stroke();
    ctx.save(); ctx.rotate(tilt);
    ctx.beginPath(); ctx.moveTo(-R * 0.85, 0); ctx.lineTo(R * 0.85, 0); ctx.stroke();
    ctx.restore();
    const lx = -Math.cos(tilt) * R * 0.85, ly = -Math.sin(tilt) * R * 0.85, rx = -lx, ry = -ly;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + R * 0.3); ctx.moveTo(rx, ry); ctx.lineTo(rx, ry + R * 0.3); ctx.stroke();
    circle(lx, ly + R * 0.42, R * 0.13 * (1 + 0.2 * Math.sin(t))); ctx.fill();
    ctx.globalAlpha = 0.45; circle(rx, ry + R * 0.42, R * 0.13 * (1 - 0.2 * Math.sin(t))); ctx.fill(); ctx.globalAlpha = 1;
  };
  G.shadow = (R, t) => {
    const fx = -R * 0.18;
    const sx = fx + Math.sin(t * 0.7 - 0.9) * R * 0.34 + Math.sin(t * 1.9) * R * 0.05, sy = R * 0.08 + Math.cos(t * 0.5) * R * 0.05;
    ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = 'rgba(5,3,12,0.85)';
    ctx.translate(sx + R * 0.2, sy); ctx.scale(1.15, 1.1); figure(ctx, 0, 0, R * 0.9); ctx.restore();
    ctx.globalAlpha = 1; figure(ctx, fx, 0, R * 0.85);
  };
  G.cluster = (R, t, k, f) => {
    const nodes = f.nodes || (f.nodes = Array.from({ length: 8 }, (_, i) => ({ a: i / 8 * TAU, r: 0.6 + Math.random() * 0.35, s: 0.3 + Math.random() * 0.4 })));
    const pull = 0.5 + 0.5 * Math.sin(t * 0.7);
    const cr = R * (0.2 + 0.05 * Math.sin(t * 2.1));
    ctx.globalAlpha = 0.35;
    nodes.forEach((n, i) => {
      const r = R * n.r * (1 - 0.35 * pull * (i % 3 === 0 ? 1 : 0.4)), a = n.a + t * 0.12 * n.s;
      n.x = Math.cos(a) * r; n.y = Math.sin(a) * r;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(n.x, n.y); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    nodes.forEach((n) => { circle(n.x, n.y, R * 0.05); ctx.fill(); });
    circle(0, 0, cr); ctx.fill();
    ctx.globalAlpha = 0.3; circle(0, 0, cr * 1.9); ctx.fill(); ctx.globalAlpha = 1;
  };
  G.moon = (R, t) => {
    ctx.save(); ctx.rotate(-0.4 + Math.sin(t * 0.2) * 0.2);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.55, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(R * 0.18, 0, R * 0.5, Math.PI * 1.45, Math.PI * 0.55, true); ctx.closePath(); ctx.fill();
    ctx.restore();
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + t * 0.1, r = R * (0.75 + 0.12 * Math.sin(t * 0.6 + i));
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 1.4 + i * 2);
      circle(Math.cos(a) * r, Math.sin(a) * r * 0.7, R * 0.04); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  G.wisp = (R, t, k, f) => {
    const tr = f.trail || (f.trail = []);
    const hx = Math.sin(t * 0.9) * R * 0.7 + Math.sin(t * 2.3) * R * 0.12, hy = Math.sin(t * 1.3 + 1) * R * 0.45;
    tr.push([hx, hy]); if (tr.length > 34) tr.shift();
    ctx.beginPath(); tr.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
    circle(hx, hy, R * 0.07); ctx.fill();
  };
  G.islands = (R, t) => {
    const base = R * 0.05;
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(-R, base); ctx.lineTo(R, base); ctx.stroke(); ctx.globalAlpha = 1;
    const xs = [-0.7, -0.25, 0.2, 0.65];
    xs.forEach((x, i) => {
      const hgt = R * (0.22 + 0.08 * Math.sin(t * 0.5 + i));
      ctx.beginPath(); ctx.moveTo(x * R - R * 0.16, base); ctx.quadraticCurveTo(x * R, base - hgt * 2, x * R + R * 0.16, base); ctx.fill();
      ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.moveTo(x * R, base);
      ctx.bezierCurveTo(x * R, base + R * 0.4, 0, R * 0.5, 0, R * (0.85 + 0.03 * Math.sin(t))); ctx.stroke(); ctx.globalAlpha = 1;
    });
    circle(0, R * 0.88, R * 0.07); ctx.fill();
  };
  G.gather = (R, t, k, f) => {
    const n = 36, phase = (t * 0.12) % 3, i0 = Math.floor(phase), m = sstep(0.55, 1, phase - i0);
    const shapeAt = (s, i) => {
      const u = i / n;
      if (s === 0) return [Math.cos(u * TAU) * R * 0.7, Math.sin(u * TAU) * R * 0.7];
      if (s === 1) { const side = Math.floor(u * 3), v = u * 3 - side, a1 = side * TAU / 3 - Math.PI / 2, a2 = (side + 1) * TAU / 3 - Math.PI / 2;
        return [lerp(Math.cos(a1), Math.cos(a2), v) * R * 0.8, lerp(Math.sin(a1), Math.sin(a2), v) * R * 0.8]; }
      const side = Math.floor(u * 4), v = u * 4 - side, a1 = side * TAU / 4 + Math.PI / 4, a2 = (side + 1) * TAU / 4 + Math.PI / 4;
      return [lerp(Math.cos(a1), Math.cos(a2), v) * R * 0.78, lerp(Math.sin(a1), Math.sin(a2), v) * R * 0.78];
    };
    for (let i = 0; i < n; i++) {
      const a = shapeAt(i0 % 3, i), b = shapeAt((i0 + 1) % 3, i);
      const jit = Math.sin(t * 2 + i) * R * 0.03;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t + i);
      circle(lerp(a[0], b[0], m) + jit, lerp(a[1], b[1], m) - jit, R * 0.035); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  G.reflection = (R, t) => {
    ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(-R * 0.9, 0); ctx.lineTo(R * 0.9, 0); ctx.stroke(); ctx.globalAlpha = 1;
    figure(ctx, 0, -R * 0.42, R * 0.7);
    for (let s = 0; s < 10; s++) {
      const y0 = s * R * 0.08;
      ctx.save(); ctx.beginPath(); ctx.rect(-R, y0, R * 2, R * 0.08); ctx.clip();
      ctx.translate(Math.sin(t * 1.5 + s * 0.8) * R * 0.04, 0);
      ctx.globalAlpha = 0.55 * (1 - s / 11);
      ctx.beginPath(); ctx.arc(0, R * 0.2, R * 0.13, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-R * 0.26, R * 0.2); ctx.quadraticCurveTo(-R * 0.34, R * 0.55, -R * 0.2, R * 0.82); ctx.lineTo(R * 0.2, R * 0.82); ctx.quadraticCurveTo(R * 0.34, R * 0.55, R * 0.26, R * 0.2); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };
  G.shells = (R, t) => {
    for (let i = 0; i < 5; i++) {
      const r = R * (0.25 + i * 0.16) * (1 + 0.05 * Math.sin(t * 0.8 - i * 0.6));
      const gap = 0.6 + 0.5 * Math.sin(t * 0.4 + i);
      ctx.globalAlpha = 0.25 + 0.12 * (4 - i);
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.86, 0, -Math.PI / 2 + gap / 2, -Math.PI / 2 - gap / 2 + TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const a = t * 0.3 + i * 2.1; circle(Math.cos(a) * R * 0.14, Math.sin(a) * R * 0.12, R * 0.04); ctx.fill(); }
  };
  G.star = (R, t) => {
    ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(0, R * 0.8); ctx.lineTo(0, -R * 0.2); ctx.stroke(); ctx.globalAlpha = 1;
    const s = R * (0.3 + 0.06 * Math.sin(t * 1.7));
    ctx.save(); ctx.translate(0, -R * 0.45); ctx.rotate(t * 0.05);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? s * 0.32 : s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2 - i); circle(-R * 0.5 + i * R * 0.12, R * (0.75 - i * 0.12), R * 0.03); ctx.fill(); }
    ctx.globalAlpha = 1;
  };
  G.zigzag = (R, t, k, f) => {
    const flip = Math.floor(t / 2.7) % 2 ? -1 : 1;
    ctx.save(); ctx.scale(flip, 1);
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const x = -R * 0.8 + i * R * 0.2, y = (i % 2 ? -1 : 1) * R * 0.35 + Math.sin(t * 5 + i * 3) * R * 0.08;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); circle(R * 0.8, -R * 0.35, R * 0.08); ctx.fill(); ctx.restore();
  };
  G.arc = (R, t) => {
    ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(R, 0); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(0, 0, R * 0.7, Math.PI, TAU); ctx.stroke();
    ctx.setLineDash([3, 5]); ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0, Math.PI); ctx.stroke(); ctx.setLineDash([]);
    const a = Math.PI + t * 0.35;
    ctx.globalAlpha = Math.sin(a) < 0 ? 1 : 0.45; circle(Math.cos(a) * R * 0.7, Math.sin(a) * R * 0.7, R * 0.12); ctx.fill(); ctx.globalAlpha = 1;
  };
  G.seed = (R, t) => {
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.3; ctx.beginPath();
      const a0 = t * (0.6 + i * 0.2) + i * 2;
      ctx.arc(0, 0, R * (0.6 + i * 0.13), a0, a0 + 1.4); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU - Math.PI / 2, l = R * (0.18 + 0.14 * (0.5 + 0.5 * Math.sin(t * 0.9 + i)));
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.stroke();
    }
    circle(0, 0, R * 0.1); ctx.fill();
  };
  G.swell = (R, t) => {
    const s = 0.5 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.45));
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = i / 48 * TAU, wob = 1 + (s - 0.5) * 0.25 * Math.sin(a * 5 + t * 3);
      const r = R * s * wob; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
    circle(0, 0, R * 0.12); ctx.fill();
  };
  G.waves = (R, t) => {
    const w1 = (x) => Math.sin(x * 3.1 + t * 0.9) * R * 0.3, w2 = (x) => Math.sin(x * 4.7 - t * 0.6 + 1) * R * 0.3;
    [w1, w2].forEach((w, j) => {
      ctx.globalAlpha = j ? 0.5 : 0.85; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40 * 2 - 1; const y = w(u) + (j ? R * 0.02 : -R * 0.02); i ? ctx.lineTo(u * R, y) : ctx.moveTo(u * R, y); }
      ctx.stroke();
    });
    for (let i = 0; i < 40; i++) {
      const u = i / 40 * 2 - 1, d = Math.abs(w1(u) - w2(u));
      if (d < R * 0.035) { ctx.globalAlpha = 1 - d / (R * 0.035); circle(u * R, w1(u), R * 0.07); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  };
  G.mandala = (R, t) => {
    const seen = N.state.visited.length, total = N.concepts.length;
    ctx.save(); ctx.scale(1.35, 1.35);
    for (let ring = 0; ring < 3; ring++) {
      const petals = [4, 8, 16][ring], rr = R * (0.28 + ring * 0.22), dir = ring % 2 ? -1 : 1;
      ctx.save(); ctx.rotate(t * 0.04 * dir);
      for (let i = 0; i < petals; i++) {
        const lit = (ring * 7 + i) % total < seen;
        ctx.globalAlpha = lit ? 0.9 : 0.25;
        ctx.save(); ctx.rotate(i / petals * TAU);
        ctx.beginPath(); ctx.ellipse(rr, 0, R * 0.1, R * 0.045 * (3 - ring) * 0.6, 0, 0, TAU); lit ? ctx.fill() : ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 0.35; circle(0, 0, rr + R * 0.1); ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1; circle(0, 0, R * (0.1 + 0.02 * Math.sin(t))); ctx.fill();
    ctx.restore();
  };
  G.spiral = (R, t) => {
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const u = i / 200, a = u * TAU * 3, r = R * 0.85 * (1 - u); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.globalAlpha = 0.45; ctx.stroke(); ctx.globalAlpha = 1;
    const u = (t * 0.05) % 1, a = u * TAU * 3, r = R * 0.85 * (1 - u);
    circle(Math.cos(a) * r, Math.sin(a) * r, R * 0.07); ctx.fill();
  };

  N.drawGlyphTo = (canvas, c, t = 3) => {
    const r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
    const g = canvas.getContext('2d'), prev = ctx; ctx = g;
    g.setTransform(d, 0, 0, d, 0, 0); g.translate(r.width / 2, r.height / 2);
    g.strokeStyle = g.fillStyle = '#1a1030'; g.lineWidth = 2; g.lineCap = 'round'; g.lineJoin = 'round';
    try { G[c.glyph] && G[c.glyph](Math.min(r.width, r.height) * 0.38, t, 1, {}); } catch (e) {}
    ctx = prev;
  };

  function drawForms(t) {
    const R = formRadius();
    for (const f of forms) {
      const y = screenY(f.c.d);
      const visible = y > -R * 3 && y < H + R * 3;
      if (!visible) { if (f.shown) { f.el.style.transform = 'translate(-9999px,0)'; f.shown = false; } continue; }
      const scale = f.c.id === 'self' ? 1.9 : f.c.id === 'individuation' ? 0.8 : 1;
      const x = f.c.x * W + Math.sin(t * 0.15 + f.seed) * R * 0.25;
      const yy = y + Math.sin(t * 0.4 + f.seed) * R * 0.08;
      const col = inkAt(f.c.d);
      const tt = t + f.seed;
      ctx.save(); ctx.translate(x, yy);
      ctx.strokeStyle = col.ink; ctx.fillStyle = col.ink; ctx.lineWidth = Math.max(1.4, R * 0.028); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (!N.still) { ctx.shadowColor = col.glow; ctx.shadowBlur = R * 0.35; }
      const fn = G[f.c.glyph];
      if (fn) fn(R * scale, tt, 1, f);
      ctx.restore();
      const size = R * 2 * scale;
      f.el.style.width = f.el.style.height = size + 'px';
      f.el.style.transform = `translate(${x - size / 2}px, ${yy - size / 2}px)`;
      f.el.classList.toggle('seen', N.state.visited.includes(f.c.id));
      f.el.style.setProperty('--lbl', col.lbl); f.el.style.setProperty('--lblglow', col.lblglow);
      const near = 1 - clamp(Math.abs(yy - H / 2) / (H * 0.45), 0, 1);
      f.lbl.style.opacity = (0.25 + 0.75 * near).toFixed(2);
      f.shown = true;
    }
  }

  /* The return: a thread of light carried up through every layer. */
  function drawThread(t) {
    if (depth < 0.004) { N.ascending = false; return; }
    const x = W / 2 + Math.sin(t * 0.7) * 6;
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(241,212,154,0)'); gr.addColorStop(0.5, 'rgba(241,212,154,.85)'); gr.addColorStop(1, 'rgba(241,212,154,.25)');
    ctx.strokeStyle = gr; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(241,212,154,.8)'; ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let y = 0; y <= H; y += 12) ctx.lineTo(x + Math.sin(y * 0.02 + t * 1.5) * 5, y);
    ctx.stroke(); ctx.shadowBlur = 0;
  }

  /* ───────────── HUD: layer chip + individuation spiral ───────────── */
  const chip = document.getElementById('layerChip');
  const numerals = { surface: 'I', threshold: '·', personal: 'II', boundary: '·', collective: 'III', core: 'IV' };
  let lastLayer = '';
  function updateChip() {
    const l = N.layerAt(depth);
    if (l.id !== lastLayer) {
      lastLayer = l.id;
      chip.innerHTML = `<b>${numerals[l.id]}</b><span>${l.name}</span>`;
      N.sound.setLayer && N.sound.setLayer(l.id);
    }
  }
  const svg = document.getElementById('spiral');
  const NS = 'http://www.w3.org/2000/svg';
  const spiralPt = (u, out) => { // u 0..1 along the arm; out = the returning arm, offset half a turn
    const turns = 2.4, a = u * TAU * turns + (out ? Math.PI : 0) - Math.PI / 2, r = 56 * (1 - u) + 4;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  const pathFor = (from, to, out) => { let d = ''; for (let i = 0; i <= 120; i++) { const u = lerp(from, to, i / 120); const p = spiralPt(u, out); d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); } return d; };
  let spMarker, spReturn, spNodes = [];
  function buildSpiral() {
    svg.innerHTML = '';
    const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
    mk('path', { d: pathFor(0, 1, false), fill: 'none', stroke: 'rgba(222,206,246,.35)', 'stroke-width': 1.2 });
    mk('path', { d: pathFor(0, 1, true), fill: 'none', stroke: 'rgba(241,212,154,.18)', 'stroke-width': 1.2, 'stroke-dasharray': '2 3' });
    spReturn = mk('path', { d: '', fill: 'none', stroke: '#f1d49a', 'stroke-width': 2, 'stroke-linecap': 'round' });
    spNodes = N.concepts.map((c) => {
      const p = spiralPt(c.d, false);
      const g = mk('circle', { cx: p[0], cy: p[1], r: 3.2, class: 'node', fill: 'none', stroke: 'rgba(222,206,246,.6)', 'stroke-width': 1 });
      const title = document.createElementNS(NS, 'title'); title.textContent = c.title; g.appendChild(title);
      g.addEventListener('click', () => N.scrollToDepth(c.d));
      return { c, g };
    });
    mk('circle', { cx: 0, cy: 0, r: 4, fill: '#f1d49a', opacity: 0.8 });
    spMarker = mk('circle', { r: 4.5, fill: '#fff', stroke: '#f1d49a', 'stroke-width': 1.5 });
  }
  function updateSpiral(t) {
    const p = spiralPt(depth, false);
    spMarker.setAttribute('cx', p[0]); spMarker.setAttribute('cy', p[1]);
    spMarker.setAttribute('r', 4 + (N.still ? 0 : Math.sin(t * 3) * 0.8));
    spNodes.forEach(({ c, g }) => {
      const v = N.state.visited.includes(c.id), i = N.state.integrated.includes(c.id);
      g.setAttribute('fill', i ? '#f1d49a' : v ? 'rgba(239,231,244,.85)' : 'none');
      g.setAttribute('stroke', i ? '#f1d49a' : 'rgba(222,206,246,.6)');
    });
    const frac = N.state.integrated.length / N.concepts.length;
    spReturn.setAttribute('d', frac > 0 ? pathFor(1, 1 - frac, true) : '');
    document.getElementById('spiralCap').textContent = `Individuation · ${N.state.integrated.length}/${N.concepts.length} integrated`;
  }

  /* ───────────── Sound: procedural, off by default ───────────── */
  N.sound = (() => {
    let ac = null, master, on = false, voices = {}, chimeTimer = 0;
    function noiseBuffer(sec) {
      const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0);
      let l = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } // brown-ish
      return b;
    }
    function reverbIR(sec) {
      const len = ac.sampleRate * sec, b = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      return b;
    }
    function gain(v, dest) { const g = ac.createGain(); g.gain.value = v; g.connect(dest); return g; }
    function build() {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      const verb = ac.createConvolver(); verb.buffer = reverbIR(5); const verbOut = gain(0.55, master); verb.connect(verbOut);
      const dry = gain(0.6, master);
      const bus = (v) => { const g = gain(v, dry); g.connect(verb); return g; };
      const nb = noiseBuffer(4);
      const noiseSrc = (freq, type, q) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; s.connect(f); s.start(); return f; };
      // air: breathy high band near the surface
      voices.air = bus(0); noiseSrc(1400, 'bandpass', 0.6).connect(voices.air);
      const airLfo = ac.createOscillator(); airLfo.frequency.value = 0.07; const airDepth = ac.createGain(); airDepth.gain.value = 0.05; airLfo.connect(airDepth); airDepth.connect(voices.air.gain); airLfo.start();
      // partials: soft high sines
      voices.partials = bus(0);
      [523.25, 783.99, 1046.5].forEach((f, i) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = ac.createGain(); g.gain.value = 0.02; const l = ac.createOscillator(); l.frequency.value = 0.05 + i * 0.03; const ld = ac.createGain(); ld.gain.value = 0.018; l.connect(ld); ld.connect(g.gain); l.start(); o.connect(g); g.connect(voices.partials); o.start(); });
      // water: low band noise, slow swell
      voices.water = bus(0); noiseSrc(380, 'lowpass', 0.7).connect(voices.water);
      // drone: detuned low triangles through a closing filter
      voices.drone = bus(0);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.connect(voices.drone);
      [55, 55.6, 82.4].forEach((f) => { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const g = ac.createGain(); g.gain.value = 0.18; o.connect(g); g.connect(lp); o.start(); });
      voices.droneFilter = lp;
      // sub: a slow deep pulse
      voices.sub = bus(0);
      const sub = ac.createOscillator(); sub.frequency.value = 41.2; const sg = ac.createGain(); sg.gain.value = 0.3; const sl = ac.createOscillator(); sl.frequency.value = 0.09; const sld = ac.createGain(); sld.gain.value = 0.2; sl.connect(sld); sld.connect(sg.gain); sl.start(); sub.connect(sg); sg.connect(voices.sub); sub.start();
      // core: a warm consonant bloom
      voices.core = bus(0);
      [220, 277.18, 329.63, 440, 554.37].forEach((f, i) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.detune.value = (i - 2) * 3; const g = ac.createGain(); g.gain.value = 0.05; o.connect(g); g.connect(voices.core); o.start(); });
      voices.chime = bus(0.5);
    }
    function mixFor(d) {
      const k = {
        air: 0.9 * (1 - sstep(0.18, 0.26, d)),
        partials: 1 - sstep(0.2, 0.34, d),
        water: sstep(0.18, 0.3, d) * (1 - sstep(0.5, 0.65, d)) * 0.8,
        drone: sstep(0.28, 0.5, d) * (1 - sstep(0.9, 1, d) * 0.6) * 0.55,
        sub: sstep(0.55, 0.75, d) * (1 - sstep(0.92, 1, d) * 0.5) * 0.8,
        core: sstep(0.84, 0.96, d) * 0.9,
      };
      return k;
    }
    function update(d, dt) {
      if (!on || !ac) return;
      const k = mixFor(d), now = ac.currentTime;
      for (const name in k) voices[name] && voices[name].gain.setTargetAtTime(k[name] * 0.9, now, 0.8);
      voices.droneFilter.frequency.setTargetAtTime(lerp(420, 140, sstep(0.3, 0.85, d)), now, 1);
      chimeTimer -= dt;
      if (chimeTimer <= 0) {
        chimeTimer = 4 + Math.random() * 6;
        const bright = 1 - sstep(0.1, 0.4, d), deep = sstep(0.6, 0.9, d);
        const scale = [392, 440, 523.25, 587.33, 659.25, 783.99];
        const f = scale[Math.floor(Math.random() * scale.length)] / (deep > 0.5 ? 4 : bright > 0.5 ? 1 : 2);
        pluck(f, 0.08 * (0.4 + bright), 3 + deep * 4);
      }
    }
    function pluck(f, v, len) {
      if (!ac || !on) return;
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ac.createGain(); g.gain.value = 0; o.connect(g); g.connect(voices.chime);
      const now = ac.currentTime; g.gain.linearRampToValueAtTime(v, now + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + len);
      o.start(); o.stop(now + len + 0.1);
    }
    function toggle() {
      if (!ac) build();
      on = !on;
      if (ac.state === 'suspended') ac.resume();
      master.gain.setTargetAtTime(on ? 0.7 : 0, ac.currentTime, 0.6);
      return on;
    }
    return { toggle, update, pluck, isOn: () => on, setLayer: () => {} };
  })();

  /* ───────────── Chamber: the demonstration room ───────────── */
  const chamber = document.getElementById('chamber');
  const wrap = document.getElementById('chCanvasWrap');
  const controls = document.getElementById('chControls');
  const captionEl = document.getElementById('chCaption');
  let current = null, returnFocus = null;
  N.demos = N.demos || {};

  function makeKit() {
    const cv = document.createElement('canvas'); cv.className = 'demo'; wrap.appendChild(cv);
    const g = cv.getContext('2d');
    const kit = { canvas: cv, ctx: g, W: 0, H: 0, dpr: 1, pointer: { x: 0, y: 0, down: false, inside: false, moved: 0 }, frames: [], resizers: [], cleanups: [] };
    function resize() {
      const r = wrap.getBoundingClientRect();
      kit.dpr = Math.min(window.devicePixelRatio || 1, 2);
      kit.W = r.width; kit.H = r.height;
      cv.width = Math.round(r.width * kit.dpr); cv.height = Math.round(r.height * kit.dpr);
      kit.resizers.forEach((f) => f(kit.W, kit.H));
    }
    const pos = (e) => { const r = cv.getBoundingClientRect(); kit.pointer.x = e.clientX - r.left; kit.pointer.y = e.clientY - r.top; };
    const onDown = (e) => { pos(e); kit.pointer.down = true; kit.pointer.inside = true; kit.pointer.moved = 0; kit.pointer.lastInput = performance.now(); try { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); } catch (err) {} kit.onDown && kit.onDown(kit.pointer); };
    const onMove = (e) => { pos(e); kit.pointer.inside = true; kit.pointer.moved++; kit.pointer.lastInput = performance.now(); kit.onMove && kit.onMove(kit.pointer); };
    const onUp = () => { kit.pointer.down = false; kit.onUp && kit.onUp(kit.pointer); };
    const onLeave = () => { kit.pointer.inside = false; };
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp); cv.addEventListener('pointerleave', onLeave);
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    kit.cleanups.push(() => ro.disconnect());
    kit.onFrame = (f) => kit.frames.push(f);
    kit.onResize = (f) => { kit.resizers.push(f); if (kit.W) f(kit.W, kit.H); };
    kit.begin = () => { g.setTransform(kit.dpr, 0, 0, kit.dpr, 0, 0); g.clearRect(0, 0, kit.W, kit.H); };
    kit.caption = (html) => { captionEl.innerHTML = html; };
    kit.button = (label, onClick, opts = {}) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = label;
      if (opts.pressed !== undefined) b.setAttribute('aria-pressed', String(!!opts.pressed));
      b.addEventListener('click', () => onClick(b)); controls.appendChild(b); return b;
    };
    kit.group = (labels, onPick, start = 0) => {
      const bs = labels.map((l, i) => kit.button(l, () => { bs.forEach((x, j) => x.setAttribute('aria-pressed', String(i === j))); onPick(i, l); }, { pressed: i === start }));
      return bs;
    };
    kit.slider = (label, min, max, val, step, onInput) => {
      const id = 'sl-' + Math.random().toString(36).slice(2, 8);
      const l = document.createElement('label'); l.className = 'field'; l.htmlFor = id; l.textContent = label;
      const s = document.createElement('input'); s.type = 'range'; s.id = id; s.min = min; s.max = max; s.value = val; s.step = step;
      s.addEventListener('input', () => onInput(parseFloat(s.value))); l.appendChild(s); controls.appendChild(l); return s;
    };
    kit.text = (label, onEnter) => {
      const id = 'tx-' + Math.random().toString(36).slice(2, 8);
      const l = document.createElement('label'); l.className = 'field'; l.htmlFor = id; l.textContent = label;
      const s = document.createElement('input'); s.type = 'text'; s.id = id; s.autocomplete = 'off'; s.autocapitalize = 'off'; s.spellcheck = false;
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(s.value, s); } });
      l.appendChild(s); controls.appendChild(l); return s;
    };
    kit.clearControls = () => { controls.innerHTML = ''; };
    kit.tone = (f, v = 0.06, len = 1.5) => N.sound.pluck(f, v, len);
    kit.speed = () => (N.still ? 0.25 : N.reduced ? 0.45 : 1);
    kit.ink = { text: '#efe7f4', muted: '#b7abc8', gold: '#f1d49a', violet: '#b79ae8', rose: '#e0a5b3', deep: '#0b0714' };
    resize();                         // size now, so the first frame is drawn, not blank
    requestAnimationFrame(resize);
    return kit;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function renderArticle(c) {
    const layer = N.layers.find((l) => l.id === c.layer);
    const art = document.getElementById('chArticle');
    const integrated = N.state.integrated.includes(c.id);
    art.innerHTML = `
      <p class="eyebrow">${esc(layer.name)}</p>
      <h2 id="chTitle">${esc(c.title)}</h2>
      <p class="lede">${esc(c.short)}</p>
      ${c.body.map((p) => `<p>${esc(p)}</p>`).join('')}
      ${c.quote ? `<h3>In his words</h3><blockquote>“${esc(c.quote.text)}”<cite>${esc(c.quote.source)}</cite></blockquote>` : ''}
      <h3>Where Jung develops it</h3>
      <ul class="src">${c.sources.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      ${c.popular ? `<h3>Popular versions</h3><p class="popular">${esc(c.popular)}</p>` : ''}
      <div class="reflect">
        <h3 style="margin-top:0">To sit with</h3>
        <p>${esc(c.question)}</p>
        <small>A question for reflection, not a diagnosis. There is no right answer.</small>
        <label class="note-label" for="note-${c.id}">Your answer, if you want to write one. It stays on this device only.</label>
        <textarea class="note" id="note-${c.id}" rows="4" placeholder="Write here…"></textarea>
        <button class="btn ${integrated ? 'on' : ''}" id="sitBtn" type="button" aria-pressed="${integrated}">${integrated ? 'Carried up the spiral' : 'I’ll sit with this'}</button>
      </div>`;
    art.scrollTop = 0;
    const note = document.getElementById('note-' + c.id);
    try { note.value = localStorage.getItem('nekyia.note.' + c.id) || ''; } catch (e) {}
    note.addEventListener('input', () => { try { localStorage.setItem('nekyia.note.' + c.id, note.value); } catch (e) {} });
    document.getElementById('sitBtn').addEventListener('click', (e) => {
      N.mark('integrated', c.id);
      e.currentTarget.classList.add('on'); e.currentTarget.setAttribute('aria-pressed', 'true');
      e.currentTarget.textContent = 'Carried up the spiral';
      N.sound.pluck(659.25, 0.07, 3); N.sound.pluck(987.77, 0.04, 3.5);
      dirty = true;
    });
  }

  N.openChamber = (id, fromEl) => {
    const c = N.concepts.find((x) => x.id === id);
    if (!c) return;
    if (current) N.closeChamber(true);
    returnFocus = fromEl || document.activeElement;
    N.mark('visited', id);
    chamber.style.setProperty('--tint', inkAt(Math.max(c.d, 0.3)).ink);
    document.getElementById('chHow').textContent = c.instructions;
    captionEl.innerHTML = ''; controls.innerHTML = ''; wrap.innerHTML = '';
    renderArticle(c);
    chamber.hidden = false; document.body.style.overflow = 'hidden';
    N.poke();
    const kit = makeKit();
    let api = {};
    try { api = (N.demos[id] || N.demos.placeholder)(kit, c) || {}; } catch (e) { console.error('demo failed', id, e); }
    current = { c, kit, api, t: 0 };
    document.getElementById('chClose').focus();
    dirty = true;
  };
  N.closeChamber = (silent) => {
    if (!current) return;
    try { current.api.stop && current.api.stop(); } catch (e) {}
    current.kit.cleanups.forEach((f) => f());
    current = null; wrap.innerHTML = ''; controls.innerHTML = ''; captionEl.innerHTML = '';
    chamber.hidden = true; document.body.style.overflow = '';
    if (N.eink) N.renderPaper();
    if (!silent && returnFocus && returnFocus.focus && document.contains(returnFocus)) returnFocus.focus();
    dirty = true;
  };
  N.inChamber = () => !!current;
  let lastPoke = 0, einkAcc = 0;
  N.poke = () => { lastPoke = performance.now(); };
  function chamberFrame(dt) {
    const k = current.kit; if (!k.W) return;
    if (N.eink) {
      // A slow screen ghosts under constant motion, so draw a few frames a
      // second, and only for a few seconds after a touch. Then hold still.
      const idle = performance.now() - lastPoke > 6000;
      document.getElementById('chamber').classList.toggle('paused', idle);
      if (idle) return;
      einkAcc += dt; if (einkAcc < 0.12) return;
      dt = einkAcc; einkAcc = 0;
    }
    current.t += dt * k.speed();
    k.begin();
    for (const f of k.frames) {
      try { f(current.t, dt * k.speed()); }
      catch (e) { if (!k.failed) { k.failed = true; console.error('demo frame failed', current.c.id, e); } }
    }
  }

  /* ───────────── Drawers ───────────── */
  function openDrawer(el, html) {
    el.innerHTML = `<button class="close" type="button">Close</button>` + html;
    el.hidden = false;
    const closeBtn = el.querySelector('.close'); closeBtn.focus();
    closeBtn.addEventListener('click', () => { el.hidden = true; });
  }
  function lifeHTML() {
    return `<h2 id="lifeTitle">Jung's life</h2><p class="lede">Carl Gustav Jung, 1875–1961.</p>
      <ol class="life">${N.biography.map((b) => `<li><span class="y">${esc(b.year)}</span><p>${esc(b.text)}</p></li>`).join('')}</ol>`;
  }
  function readingHTML() {
    const r = N.reading;
    const list = (a) => `<dl>${a.map((x) => `<dt>${esc(x.title)}</dt><dd>${esc(x.note)}</dd>`).join('')}</dl>`;
    return `<h2 id="readTitle">Further reading</h2><p class="lede">Jung's own books, in a sensible order. CW means the Collected Works (Princeton, Bollingen Series XX; Routledge in the UK).</p>
      <h3>Where to start</h3>${list(r.start)}
      <h3>From the Collected Works</h3>${list(r.collected)}
      <h3>The primary record</h3>${list(r.primary)}
      <h3>Not quite Jung</h3>
      ${N.misattributed.map((m) => `<div class="misq"><q>${esc(m.text)}</q><p>${esc(m.note)}</p></div>`).join('')}
      <h3>Links</h3><ul>${r.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul>`;
  }

  /* ───────────── Paper: the e-ink descent, one page per layer ───────────── */
  const PAGES = [
    { layers: ['surface', 'threshold'], num: 'I', name: 'Consciousness',
      intro: 'What you know that you know. Its centre is the ego. It meets the world through the persona and orients itself in habitual ways, the psychological types. At the waterline below, the unconscious already answers back.' },
    { layers: ['personal', 'boundary'], num: 'II', name: 'The personal unconscious',
      intro: 'Below the waterline: everything once conscious and since forgotten or pushed away, and what was never strong enough to reach consciousness. Its contents are the complexes, and its first figure is the shadow.' },
    { layers: ['collective'], num: 'III', name: 'The collective unconscious',
      intro: 'The deepest layer, which is inherited rather than acquired. Its contents are the archetypes: typical forms that each person and culture fills with its own images.' },
    { layers: ['core'], num: 'IV', name: 'The Self',
      intro: 'The centre and the whole. The Self is known only through symbols such as the mandala. Individuation is the path toward it, and back up again.' },
  ];
  let page = -1;
  const paper = document.getElementById('paper');
  const VEIL_LINES = [
    'The surface. Everything you can name.',
    'Below the waterline, what you have forgotten is still here.',
    'Deeper than any one life. The forms everyone shares.',
    'The centre, which is also the whole.',
  ];
  function veil(p, down, then) {
    const v = document.getElementById('veil');
    const P = PAGES[p];
    v.innerHTML = p < 0 ? '<p class="vl-name">Nekyia</p>' :
      `<p class="vl-dir">${down ? 'Descending' : 'Rising'}</p><p class="vl-num">${P.num}</p><p class="vl-name">${P.name}</p><p class="vl-line">${VEIL_LINES[p]}</p>`;
    v.hidden = false;
    if (N.sound.isOn()) { const f = [392, 293.66, 196, 130.81][Math.max(0, p)] * (down ? 1 : 1.5); N.sound.pluck(f, 0.1, 4); N.sound.pluck(f * 1.5, 0.05, 5); }
    setTimeout(() => { then(); v.hidden = true; }, 1300);
  }
  N.goPaper = (p) => { if (p === page) return N.renderPaper(p); veil(p, p > page, () => N.renderPaper(p)); };
  // Glyphs come alive for a few seconds when a page arrives or a card is touched, at a rate the screen can show.
  function animateGlyph(cv, c, secs) {
    let t = 3, ticks = Math.round(secs * 8);
    const tick = () => { N.drawGlyphTo(cv, c, t); t += 0.125 * 1.6; if (--ticks > 0 && document.contains(cv)) setTimeout(tick, 125); };
    tick();
  }
  N.renderPaper = (p = page) => {
    page = clamp(p, -1, PAGES.length - 1);
    try { localStorage.setItem('nekyia.page', String(page)); } catch (e) {}
    const done = N.state.integrated.length, total = N.concepts.length;
    let html;
    if (page < 0) {
      html = `<section class="pp-intro"><h1>Nekyia</h1><p class="sub">A descent into the psyche with C.&nbsp;G.&nbsp;Jung, in four pages: from consciousness down to the Self.</p>
        <p>Each page is one layer of the psyche. Tap a concept to open it: a demonstration you can try, Jung's ideas and sources, and a question to sit with.</p>
        <p class="pp-quiet">Nekyia is the old Greek word for a journey to the underworld. Jung used it for the descent into the unconscious.</p>
        <button class="btn big" type="button" data-go="0">Begin the descent</button></section>`;
    } else {
      const P = PAGES[page];
      const cs = N.concepts.filter((c) => P.layers.includes(c.layer));
      html = `<section class="pp-page">
        <p class="pp-eyebrow">Layer ${P.num} of IV</p>
        <h2>${P.name}</h2><p class="pp-lede">${P.intro}</p>
        <ul class="pp-cards">${cs.map((c) => {
          const v = N.state.visited.includes(c.id), k = N.state.integrated.includes(c.id);
          return `<li><button class="pp-card" type="button" data-open="${c.id}">
            <canvas class="pp-glyph" data-glyph="${c.id}" aria-hidden="true"></canvas>
            <span class="pp-text"><b>${c.title}</b><span>${c.short}</span>${k ? '<em>Carried up</em>' : v ? '<em class="v">Visited</em>' : ''}</span>
          </button></li>`; }).join('')}</ul>
      </section>`;
    }
    const prev = page > -1 ? `<button class="btn big" type="button" data-go="${page - 1}">↑ ${page === 0 ? 'Title' : PAGES[page - 1].name}</button>` : '<span></span>';
    const next = page < PAGES.length - 1 ? `<button class="btn big solid" type="button" data-go="${page + 1}">Deeper: ${PAGES[page + 1].name} ↓</button>` : '<span></span>';
    paper.innerHTML = html + (page >= 0 ? `<nav class="pp-nav">${prev}${next}</nav><p class="pp-progress">Individuation: ${done} of ${total} carried up</p>` : '');
    window.scrollTo(0, 0);
    paper.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => N.goPaper(parseInt(b.dataset.go, 10))));
    paper.querySelectorAll('[data-open]').forEach((b) => {
      const cv = b.querySelector('canvas'), c = N.concepts.find((x) => x.id === b.dataset.open);
      b.addEventListener('pointerdown', () => animateGlyph(cv, c, 1.2));
      b.addEventListener('click', () => setTimeout(() => N.openChamber(c.id, b), 180));
    });
    requestAnimationFrame(() => paper.querySelectorAll('canvas[data-glyph]').forEach((cv, i) => {
      const c = N.concepts.find((x) => x.id === cv.dataset.glyph);
      N.drawGlyphTo(cv, c);
      setTimeout(() => animateGlyph(cv, c, 2.5), i * 350);   // one after another, down the page
    }));
  };
  N.setEink = (on) => {
    N.eink = on;
    document.body.classList.toggle('eink', on);
    paper.hidden = !on;
    try { localStorage.setItem('nekyia.eink', on ? '1' : '0'); } catch (e) {}
    const b = document.getElementById('einkBtn'); if (b) { b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Animated' : 'E-ink'; }
    if (on) { let p = -1; try { p = parseInt(localStorage.getItem('nekyia.page') || '-1', 10); } catch (e) {} N.renderPaper(isNaN(p) ? -1 : p); }
    else { layout(); readScroll(); }
    dirty = true;
  };

  /* ───────────── Loop & quality ───────────── */
  let dirty = true, last = performance.now(), T = 0, slowFrames = 0, lastDepth = 0;
  function step(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05); last = Math.max(last, now);
    if (dt > 0.022) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 90) { // about a second and a half of struggling: lighten the load
      slowFrames = 0;
      if (bgScale > 0.34) { bgScale -= 0.08; sizeCanvases(); }
      else if (particleBudget > 0.4) { particleBudget -= 0.2; seedParticles(); }
    }
    if (current) { chamberFrame(dt); return; }
    if (N.eink) return;
    const moving = Math.abs(target - depth) > 0.00005;
    if (N.still && !moving && !dirty) return;
    T += dt * N.speed();
    const k = N.reduced || N.still ? 1 : 1 - Math.pow(0.0015, dt);  // sinking: depth eases toward the scroll
    depth = lerp(depth, target, k);
    const dDepth = depth - lastDepth; lastDepth = depth;
    drawBG(T);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    drawParticles(T, dDepth);
    drawForms(T);
    if (N.ascending) drawThread(T);
    updateChip(); updateSpiral(T);
    N.sound.update(depth, dt);
    dirty = false;
  }
  function frame(now) { step(now); requestAnimationFrame(frame); }
  N._step = step; // lets an automated test drive frames where rAF does not tick

  /* ───────────── Boot ───────────── */
  N.boot = () => {
    initGL();
    layout();
    buildHits();
    buildSpiral();
    readScroll(); depth = target; lastDepth = depth;
    addEventListener('scroll', readScroll, { passive: true });
    addEventListener('resize', () => { layout(); readScroll(); });
    if (mq.addEventListener) mq.addEventListener('change', (e) => { N.reduced = e.matches; });
    const soundBtn = document.getElementById('soundBtn'), introSound = document.getElementById('introSound');
    const setSound = () => { const on = N.sound.toggle(); soundBtn.setAttribute('aria-pressed', String(on)); soundBtn.textContent = on ? 'Sound on' : 'Sound off'; introSound.textContent = on ? 'Turn off sound' : 'Turn on sound'; };
    soundBtn.addEventListener('click', setSound); introSound.addEventListener('click', setSound);
    const stillBtn = document.getElementById('stillBtn');
    stillBtn.addEventListener('click', () => { N.still = !N.still; stillBtn.setAttribute('aria-pressed', String(N.still)); dirty = true; });
    document.getElementById('einkBtn').addEventListener('click', () => N.setEink(!N.eink));
    ['pointerdown', 'pointermove', 'input', 'click', 'keydown'].forEach((ev) => chamber.addEventListener(ev, N.poke, true));
    let savedEink = null; try { savedEink = localStorage.getItem('nekyia.eink'); } catch (e) {}
    const looksEink = /HiBreak|Bigme|Kompakt|Mudita|Boox|Onyx|reMarkable|Kindle/i.test(navigator.userAgent) || location.hash === '#eink';
    N.setEink(savedEink === null ? looksEink : savedEink === '1' || location.hash === '#eink');
    document.getElementById('beginBtn').addEventListener('click', () => N.scrollToDepth(N.concepts[0].d));
    document.getElementById('lifeBtn').addEventListener('click', () => openDrawer(document.getElementById('lifeDrawer'), lifeHTML()));
    document.getElementById('readBtn').addEventListener('click', () => openDrawer(document.getElementById('readDrawer'), readingHTML()));
    document.getElementById('chClose').addEventListener('click', () => N.closeChamber());
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (current) { N.closeChamber(); return; }
        document.querySelectorAll('.drawer').forEach((d) => (d.hidden = true));
      }
    });
    requestAnimationFrame(frame);
  };
})();
