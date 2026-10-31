// 3D-модель квартиры 64,5 м² (план из выписки ЕГРН), три стиля отделки
(function () {
  var H = 2.7;
  var STYLES = {
    skandi: {
      sky: 0xe6edf1,
      wall: '#f1efea', ceil: '#ffffff', accentBed: '#a9bba9', door: '#f4f2ee',
      floor: { kind: 'planks', a: '#dcc39d', b: '#cdb087', w: 0.19, l: 1.4 },
      entry: { kind: 'tile', c: '#d6d1c8', g: '#bdb7ac', s: 0.6 },
      kitchenFront: '#f6f5f2', kitchenTop: '#c9a77a', upper: true, shelves: '#c9a77a',
      splash: { kind: 'tile', c: '#f7f7f5', g: '#c8c8c4', w: 0.075, h: 0.3, gloss: 0.15 },
      bathWall: { kind: 'tile', c: '#f4f4f1', g: '#cfcfca', w: 0.1, h: 0.3, gloss: 0.12 },
      bathFloor: { kind: 'terrazzo', c: '#e3dfd8' },
      wcWall: { kind: 'tile', c: '#9fb3a2', g: '#e8ebe5', w: 0.1, h: 0.1, gloss: 0.15 }, wcHigh: 1.2,
      metal: '#1d1d1d', metalRough: 0.45, metalness: 0.6,
      sofa: '#c9c7c1', sofaLegs: '#c9a77a', chair: '#c9a77a', table: '#d7bd94', tableRound: true,
      rug: '#ece6da', bedLinen: '#f3f1ec', bedThrow: '#a9bba9', headboard: '#d7bd94',
      curtain: '#f2efe8', tvWall: 'shelves', pendants: 'dome', pendantColor: '#f2f0ea',
      deck: '#cfb48f', plants: true
    },
    neo: {
      sky: 0xe9e6df,
      wall: '#e3dbcf', ceil: '#f7f4ee', accentBed: '#d8cfc1', door: '#f3efe7', moldings: true,
      floor: { kind: 'herring', a: '#b98c5c', b: '#a97d4f', w: 0.09, l: 0.6 },
      entry: { kind: 'marble', c: '#f1eeea', v: '#b9b3ad', s: 0.6, gloss: 0.08 },
      kitchenFront: '#e8e2d6', shaker: true, kitchenTop: '#f2efea', marbleTop: true, upper: true,
      splash: { kind: 'marble', c: '#f2efea', v: '#b5aea7', s: 1.2, gloss: 0.06 },
      bathWall: { kind: 'marble', c: '#f3f0ec', v: '#a9a29b', s: 1.2, gloss: 0.06 },
      bathFloor: { kind: 'marble', c: '#ebe7e2', v: '#9f9890', s: 0.6, gloss: 0.08 },
      wcWall: { kind: 'marble', c: '#f3f0ec', v: '#a9a29b', s: 1.2, gloss: 0.06 }, wcHigh: 1.2, wcPaint: '#2f4a3e',
      metal: '#b8914f', metalRough: 0.3, metalness: 0.9,
      sofa: '#2c3a55', sofaLegs: '#b8914f', chair: '#e8e0d2', table: '#f2efea', tableRound: true,
      rug: '#cfc3b0', bedLinen: '#f5f1ea', bedThrow: '#c49a3a', headboard: '#d8cdbb', tallHead: true,
      curtain: '#e9e1d3', tvWall: 'moldings', pendants: 'chandelier', pendantColor: '#b8914f',
      deck: '#c9b79e', plants: true
    },
    loft: {
      sky: 0xdfe3e6,
      wall: '#b9b5ae', concreteWalls: true, ceil: '#a9a6a1', accentBed: 'brick', door: '#2b2b2b',
      floor: { kind: 'planks', a: '#6f4f35', b: '#5f432c', w: 0.22, l: 1.8 },
      entry: { kind: 'tile', c: '#4a4a48', g: '#3a3a38', s: 0.6 },
      kitchenFront: '#3a3d40', kitchenTop: '#9c9a95', concreteTop: true, upper: false, shelves: '#6f4f35',
      splash: { kind: 'tile', c: '#1f2022', g: '#5a5a5a', w: 0.075, h: 0.15, gloss: 0.1 },
      bathWall: { kind: 'concrete', c: '#9e9b96', s: 1.2 },
      bathFloor: { kind: 'tile', c: '#2a2b2c', g: '#5c5c5c', w: 0.6, h: 0.6, gloss: 0.3 },
      wcWall: { kind: 'concrete', c: '#9e9b96', s: 1.2 }, wcHigh: 2.7,
      metal: '#151515', metalRough: 0.5, metalness: 0.5,
      sofa: '#8a4f2a', leather: true, sofaLegs: '#151515', chair: '#151515', table: '#6f4f35', tableRound: false,
      rug: '#4b4b4a', bedLinen: '#d9d6d0', bedThrow: '#4b5a52', headboard: '#5f432c',
      curtain: '#6b6b69', tvWall: 'brick', pendants: 'cage', pendantColor: '#151515',
      deck: '#6f4f35', plants: true
    }
  };

  var S = STYLES[window.STYLE_ID || 'skandi'];
  var root = document.getElementById(window.VIEW_ID || 'view');
  var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  root.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(S.sky);
  var camera = new THREE.PerspectiveCamera(60, 16 / 10, 0.05, 100);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // ---------- текстуры ----------
  var R = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, r * k)); g = Math.max(0, Math.min(255, g * k)); b = Math.max(0, Math.min(255, b * k));
    return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
  }
  function noise(ctx, w, h, amt, n) {
    for (var i = 0; i < n; i++) { ctx.fillStyle = 'rgba(' + (R() < .5 ? '0,0,0' : '255,255,255') + ',' + (R() * amt) + ')'; ctx.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); }
  }
  var texCache = {};
  // каждая текстура покрывает size×size метров
  function makeTex(spec) {
    var key = JSON.stringify(spec);
    if (texCache[key]) return texCache[key];
    var N = 1024, c = canvas(N, N), x = c.getContext('2d'), size = 1;
    if (spec.kind === 'planks') {
      size = 2.4; var pw = N * spec.w / size, pl = N * spec.l / size;
      for (var row = 0; row * pw < N; row++) {
        var off = (row * 0.37 % 1) * pl;
        for (var px = -off; px < N; px += pl) {
          var k = 0.9 + R() * 0.18; x.fillStyle = shade(R() < .5 ? spec.a : spec.b, k); x.fillRect(px, row * pw, pl, pw);
          for (var gi = 0; gi < 14; gi++) { x.strokeStyle = 'rgba(60,35,15,' + (0.04 + R() * 0.06) + ')'; x.lineWidth = 1 + R() * 2; x.beginPath(); var yy = row * pw + R() * pw; x.moveTo(px, yy); x.bezierCurveTo(px + pl * .3, yy + R() * 6 - 3, px + pl * .6, yy + R() * 6 - 3, px + pl, yy + R() * 4 - 2); x.stroke(); }
          x.fillStyle = 'rgba(40,25,10,.35)'; x.fillRect(px, row * pw, 2, pw);
        }
        x.fillStyle = 'rgba(40,25,10,.3)'; x.fillRect(0, row * pw, N, 2);
      }
    } else if (spec.kind === 'herring') {
      size = 1.2; var u = N * spec.w / size, L = N * spec.l / size;
      x.fillStyle = spec.a; x.fillRect(0, 0, N, N);
      for (var gy = -L; gy < N + L; gy += u * 2) for (var gx = -L; gx < N + L; gx += L) {
        [[0, 1], [1, -1]].forEach(function (d, j) {
          x.save(); x.translate(gx + j * u, gy + j * u); x.rotate(d[1] * Math.PI / 4);
          x.fillStyle = shade(R() < .5 ? spec.a : spec.b, 0.9 + R() * .2); x.fillRect(0, 0, L, u);
          x.strokeStyle = 'rgba(50,30,10,.35)'; x.lineWidth = 2; x.strokeRect(0, 0, L, u);
          for (var q = 0; q < 5; q++) { x.strokeStyle = 'rgba(60,35,15,.06)'; x.beginPath(); var y2 = R() * u; x.moveTo(0, y2); x.lineTo(L, y2 + R() * 3); x.stroke(); }
          x.restore();
        });
      }
    } else if (spec.kind === 'tile') {
      var tw = spec.w || spec.s, th = spec.h || spec.s; size = Math.max(1.2, tw * 4);
      var cw = N * tw / size, ch = N * th / size, gr = Math.max(2, N * 0.003 / size);
      x.fillStyle = spec.g; x.fillRect(0, 0, N, N);
      for (var ty = 0; ty < N; ty += ch) for (var tx = (spec.offset && (ty / ch) % 2 ? -cw / 2 : 0); tx < N; tx += cw) {
        x.fillStyle = shade(spec.c, 0.96 + R() * 0.07); x.fillRect(tx + gr / 2, ty + gr / 2, cw - gr, ch - gr);
      }
      noise(x, N, N, 0.05, 6000);
    } else if (spec.kind === 'marble') {
      size = spec.s * 2; x.fillStyle = spec.c; x.fillRect(0, 0, N, N);
      for (var v = 0; v < 26; v++) {
        x.strokeStyle = spec.v; x.globalAlpha = 0.08 + R() * 0.35; x.lineWidth = 0.6 + R() * 2.4;
        x.beginPath(); var vx = R() * N, vy = -20; x.moveTo(vx, vy);
        while (vy < N + 20) { vx += (R() - .45) * 70; vy += 20 + R() * 50; x.lineTo(vx, vy); }
        x.stroke();
      }
      x.globalAlpha = 1; var cells = N / (spec.s * 2 / spec.s); // шов плитки
      x.fillStyle = 'rgba(150,140,130,.35)'; for (var m = 0; m <= N; m += N / 2) { x.fillRect(m - 1, 0, 2, N); x.fillRect(0, m - 1, N, 2); }
    } else if (spec.kind === 'terrazzo') {
      size = 1.2; x.fillStyle = spec.c; x.fillRect(0, 0, N, N);
      var cols = ['#b9b2a6', '#8e8a84', '#d8c9b4', '#a8b5ab', '#6d6a66', '#f4f1ec'];
      for (var t = 0; t < 2200; t++) { x.fillStyle = cols[(R() * cols.length) | 0]; x.beginPath(); var r = 1 + R() * 7; x.ellipse(R() * N, R() * N, r, r * (0.5 + R() * .6), R() * 3, 0, 7); x.fill(); }
      x.fillStyle = 'rgba(150,140,130,.4)'; for (var m2 = 0; m2 <= N; m2 += N / 2) { x.fillRect(m2 - 1, 0, 2, N); x.fillRect(0, m2 - 1, N, 2); }
    } else if (spec.kind === 'concrete') {
      size = 2.4; x.fillStyle = spec.c; x.fillRect(0, 0, N, N);
      for (var b = 0; b < 160; b++) { var gg = x.createRadialGradient(R() * N, R() * N, 0, R() * N, R() * N, 60 + R() * 160); gg.addColorStop(0, 'rgba(' + (R() < .5 ? '0,0,0' : '255,255,255') + ',.022)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(0, 0, N, N); }
      noise(x, N, N, 0.05, 30000);
      if (spec.seams) { x.fillStyle = 'rgba(60,60,60,.25)'; for (var m3 = 0; m3 <= N; m3 += N / 2) { x.fillRect(m3 - 1, 0, 2, N); x.fillRect(0, m3 - 1, N, 2); } }
    } else if (spec.kind === 'brick') {
      size = 1.3; var bw = N * 0.25 / size, bh = N * 0.065 / size, mo = N * 0.012 / size;
      x.fillStyle = '#cfc6ba'; x.fillRect(0, 0, N, N);
      for (var by = 0, rr = 0; by < N; by += bh + mo, rr++) for (var bx = (rr % 2 ? -bw / 2 : 0); bx < N; bx += bw + mo) {
        x.fillStyle = shade(spec.c, 0.78 + R() * 0.35); x.fillRect(bx, by, bw, bh);
      }
      noise(x, N, N, 0.12, 40000);
    } else if (spec.kind === 'panels') { // стена с молдингами
      size = 1.2; x.fillStyle = spec.c; x.fillRect(0, 0, N, N);
      x.strokeStyle = shade(spec.c, 0.82); x.lineWidth = 7; x.strokeRect(70, 90, N - 140, N - 180);
      x.strokeStyle = shade(spec.c, 1.08); x.lineWidth = 3; x.strokeRect(78, 98, N - 156, N - 196);
    } else if (spec.kind === 'fabric') {
      size = 0.5; x.fillStyle = spec.c; x.fillRect(0, 0, N, N);
      for (var f = 0; f < N; f += 4) { x.fillStyle = 'rgba(0,0,0,.04)'; x.fillRect(f, 0, 2, N); x.fillRect(0, f, N, 2); }
      noise(x, N, N, 0.06, 20000);
    } else if (spec.kind === 'leather') {
      size = 0.8; x.fillStyle = spec.c; x.fillRect(0, 0, N, N);
      for (var l = 0; l < 200; l++) { var lg = x.createRadialGradient(R() * N, R() * N, 0, R() * N, R() * N, 40 + R() * 90); lg.addColorStop(0, 'rgba(255,220,180,.07)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = lg; x.fillRect(0, 0, N, N); }
      noise(x, N, N, 0.1, 30000);
    } else if (spec.kind === 'shaker') {
      size = 0.6; x.fillStyle = spec.c; x.fillRect(0, 0, N, N);
      x.strokeStyle = shade(spec.c, 0.85); x.lineWidth = 10; x.strokeRect(80, 80, N - 160, N - 160);
      x.strokeStyle = shade(spec.c, 1.06); x.lineWidth = 4; x.strokeRect(92, 92, N - 184, N - 184);
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 0, N, 4); x.fillRect(0, 0, 4, N);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    tex.userData = { size: size };
    texCache[key] = tex; return tex;
  }
  function matTex(spec, w, h, opts) {
    var base = makeTex(spec), t = base.clone(); t.needsUpdate = true;
    t.repeat.set(w / base.userData.size, h / base.userData.size);
    var m = new THREE.MeshStandardMaterial(Object.assign({ map: t, roughness: spec.gloss != null ? spec.gloss : 0.75 }, opts || {}));
    return m;
  }
  function matC(color, rough, metal) { return new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? 0.8 : rough, metalness: metal || 0 }); }
  var METAL = new THREE.MeshStandardMaterial({ color: S.metal, roughness: S.metalRough, metalness: S.metalness });
  var WHITE = matC('#f7f7f5', 0.25);
  var CERAMIC = new THREE.MeshStandardMaterial({ color: '#fbfbfa', roughness: 0.12 });
  var DARK = matC('#1b1c1d', 0.4);
  var GLASS = new THREE.MeshStandardMaterial({ color: '#cfe3ea', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25 });
  var MIRROR = new THREE.MeshStandardMaterial({ color: '#c9d5d9', roughness: 0.08, metalness: 0.15 });

  // ---------- геометрия ----------
  var all = new THREE.Group(); scene.add(all);
  var ceilings = new THREE.Group(); scene.add(ceilings);
  function box(x0, y0, z0, x1, y1, z1, mat, parent, noShadow) {
    var g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    var m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = !noShadow; m.receiveShadow = true; (parent || all).add(m); return m;
  }
  function cyl(x, y0, z, r, h, mat, seg, r2) {
    var m = new THREE.Mesh(new THREE.CylinderGeometry(r2 == null ? r : r2, r, h, seg || 24), mat);
    m.position.set(x, y0 + h / 2, z); m.castShadow = true; m.receiveShadow = true; all.add(m); return m;
  }
  function sph(x, y, z, sx, sy, sz, mat) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; all.add(m); return m;
  }
  function wallMat() {
    if (S.concreteWalls) return function (w, h) { return matTex({ kind: 'concrete', c: S.wall }, w, h, { roughness: 0.9 }); };
    return function () { return matC(S.wall, 0.92); };
  }
  var WM = wallMat();
  // стена-прямоугольник в плане с проёмами вдоль длинной стороны
  function wall(x0, z0, x1, z1, holes, parent) {
    holes = holes || []; var alongX = (x1 - x0) >= (z1 - z0), a0 = alongX ? x0 : z0, a1 = alongX ? x1 : z1;
    var cuts = holes.slice().sort(function (p, q) { return p[0] - q[0]; }), cur = a0;
    function piece(b0, b1, y0, y1) {
      if (b1 - b0 < 0.001 || y1 - y0 < 0.001) return;
      var len = b1 - b0, mt = WM(len, y1 - y0);
      if (alongX) box(b0, y0, z0, b1, y1, z1, mt, parent); else box(x0, y0, b0, x1, y1, b1, mt, parent);
    }
    cuts.forEach(function (c) { piece(cur, c[0], 0, H); piece(c[0], c[1], 0, c[2]); piece(c[0], c[1], c[3], H); cur = c[1]; });
    piece(cur, a1, 0, H);
  }
  // облицовка: тонкая плита на грани стены
  function skin(x0, z0, x1, z1, y0, y1, spec, opts) {
    var w = Math.max(x1 - x0, z1 - z0), m = spec.kind ? matTex(spec, w, y1 - y0, opts) : matC(spec, 0.9);
    return box(x0, y0, z0, x1, y1, z1, m, null, true);
  }
  function floor(x0, z0, x1, z1, spec) {
    var g = new THREE.PlaneGeometry(x1 - x0, z1 - z0), m = new THREE.Mesh(g, matTex(spec, x1 - x0, z1 - z0, { roughness: spec.gloss != null ? spec.gloss + 0.1 : 0.55 }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.001, (z0 + z1) / 2); m.receiveShadow = true; all.add(m);
    var c = new THREE.Mesh(g, matC(S.ceil, 0.95)); c.rotation.x = Math.PI / 2; c.position.set((x0 + x1) / 2, H, (z0 + z1) / 2);
    if (S.concreteWalls) c.material = matTex({ kind: 'concrete', c: S.ceil }, x1 - x0, z1 - z0);
    ceilings.add(c);
  }

  // ---------- планировка (метры; x вправо, z вниз по плану) ----------
  floor(0, 0, 5.68, 3.15, S.floor);              // спальня 16,4
  floor(0, 3.15, 4.37, 10.23, S.floor);          // кухня-гостиная 18,9 + 11,0
  floor(4.37, 3.15, 5.74, 10.4, S.floor);        // коридор
  floor(3.9, 10.23, 5.74, 12.9, S.entry);        // прихожая
  floor(5.74, 3.27, 7.4, 4.55, S.bathFloor);     // туалет 1,4
  floor(5.74, 4.67, 7.4, 6.93, S.bathFloor);     // ванная 3,4
  floor(-1.82, 6.95, -0.4, 10.26, { kind: 'planks', a: S.deck, b: shade(S.deck, 0.9).replace(/rgb\((\d+),(\d+),(\d+)\)/, function (_, r, g, b) { return '#' + [r, g, b].map(function (v) { return (+v).toString(16).padStart(2, '0'); }).join(''); }), w: 0.14, l: 1.4 });

  var WIN = 0.85, WIN_TOP = 2.35;
  wall(-0.4, -0.4, 0, 10.6, [[0.7, 2.1, WIN, WIN_TOP], [4.4, 6.1, WIN, WIN_TOP], [7.95, 8.75, 0, 2.2], [8.95, 9.95, WIN, WIN_TOP]]);
  wall(-0.4, -0.4, 7.6, 0);
  wall(5.68, 0, 6.08, 3.15);
  wall(0, 3.15, 7.6, 3.27, [[4.65, 5.45, 0, 2.1]]);
  wall(4.37, 3.27, 4.49, 10.23, [[5.9, 7.4, 0, 2.25]]);
  wall(-0.4, 10.23, 4.49, 10.6);
  wall(5.74, 3.27, 5.86, 10.4, [[3.5, 4.2, 0, 2.1], [5.95, 6.65, 0, 2.1]]);
  wall(5.86, 4.55, 7.4, 4.67);
  wall(7.4, 3.15, 7.6, 7.05);
  wall(5.74, 6.93, 7.6, 7.05);
  wall(3.78, 10.6, 3.9, 13.1);
  wall(3.78, 12.9, 5.98, 13.1);
  wall(5.74, 10.4, 5.98, 12.9, [[11.5, 12.4, 0, 2.1]]);
  // лоджия: парапет и остекление
  box(-1.9, 0, 6.87, -0.4, 1.0, 6.95, matC('#e9e6e0')); box(-1.9, 0, 10.26, -0.4, 1.0, 10.34, matC('#e9e6e0')); box(-1.9, 0, 6.87, -1.82, 1.0, 10.34, matC('#e9e6e0'));
  box(-1.89, 1.0, 6.9, -1.85, 2.5, 10.3, GLASS, null, true);

  // стена кухня/комната для режима «без сноса»
  var partition = new THREE.Group(); scene.add(partition);
  wall(0, 7.59, 4.37, 7.71, [[3.45, 4.25, 0, 2.1]], partition);
  partition.visible = false;

  // окна: рамы и стекло
  function windowAt(z0, z1, y0, y1) {
    var fm = matC(S.concreteWalls ? '#202020' : '#f5f5f3', 0.4);
    box(-0.24, y0, z0, -0.16, y0 + 0.05, z1, fm); box(-0.24, y1 - 0.05, z0, -0.16, y1, z1, fm);
    box(-0.24, y0, z0, -0.16, y1, z0 + 0.05, fm); box(-0.24, y0, z1 - 0.05, -0.16, y1, z1, fm); box(-0.24, y0, (z0 + z1) / 2 - 0.025, -0.16, y1, (z0 + z1) / 2 + 0.025, fm);
    box(-0.21, y0, z0, -0.19, y1, z1, GLASS, null, true);
    box(-0.16, y0 - 0.04, z0 - 0.05, 0.08, y0, z1 + 0.05, S.concreteWalls ? matC('#3a3a3a', .6) : WHITE); // подоконник
  }
  windowAt(0.7, 2.1, WIN, WIN_TOP); windowAt(4.4, 6.1, WIN, WIN_TOP); windowAt(8.95, 9.95, WIN, WIN_TOP);
  windowAt(7.95, 8.75, 0.02, 2.2);
  // шторы
  function curtain(z0, z1, y1) {
    var m = matTex({ kind: 'fabric', c: S.curtain }, 1, 2.6, { roughness: 1, side: THREE.DoubleSide });
    [[z0 - 0.35, z0 + 0.05], [z1 - 0.05, z1 + 0.35]].forEach(function (p) {
      var w = p[1] - p[0], g = new THREE.PlaneGeometry(w, 2.55, 24, 1), pos = g.attributes.position;
      for (var i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) / w * Math.PI * 7) * 0.035);
      g.computeVertexNormals(); var c = new THREE.Mesh(g, m); c.rotation.y = Math.PI / 2; c.position.set(0.12, 0.05 + 2.55 / 2, (p[0] + p[1]) / 2); c.castShadow = true; all.add(c);
    });
    box(0.06, 2.62, z0 - 0.4, 0.09, 2.65, z1 + 0.4, METAL);
  }
  curtain(0.7, 2.1); curtain(4.4, 6.1); curtain(8.95, 9.95);

  // плинтус
  var BASE = S.concreteWalls ? matC('#2a2a2a', 0.6) : WHITE;
  [[0, 0.0, 5.68, 0.02], [0, 3.13, 4.65, 3.15], [0.0, 0, 0.02, 3.15], [0.0, 3.27, 0.02, 10.23], [4.35, 3.27, 4.37, 5.9], [4.35, 7.4, 4.37, 10.23], [0, 10.21, 4.37, 10.23]].forEach(function (b) { box(b[0], 0, b[1], b[2], 0.08, b[3], BASE, null, true); });

  // ---------- отделка стен по стилю ----------
  // ТВ-стена гостиной (грань z=3.27)
  if (S.tvWall === 'brick') skin(0, 3.27, 4.37, 3.3, 0, H, { kind: 'brick', c: '#9a4f35' }, { roughness: 0.95 });
  if (S.moldings) {
    var pan = { kind: 'panels', c: S.wall };
    skin(0, 3.27, 4.37, 3.285, 0.1, 2.55, pan, { roughness: 0.9 });
    skin(0.0, 0.0, 5.68, 0.015, 0.1, 2.55, pan, { roughness: 0.9 });
    skin(0.0, 3.3, 0.015, 4.4, 0.1, 2.55, pan); skin(0.0, 6.1, 0.015, 7.95, 0.1, 2.55, pan);
    box(0, 2.55, 3.27, 4.37, 2.7, 3.33, WHITE); box(0, 2.55, 0, 5.68, 2.7, 0.06, WHITE); // карниз
  }
  // стена изголовья
  if (S.accentBed === 'brick') skin(0.0, 0.0, 5.68, 0.03, 0, H, { kind: 'brick', c: '#8e4a33' }, { roughness: 0.95 });
  else if (!S.moldings) skin(0.0, 0.0, 5.68, 0.012, 0, H, S.accentBed);
  // фартук кухни
  skin(0.45, 10.2, 3.77, 10.23, 0.9, 1.48, S.splash, { roughness: S.splash.gloss || 0.4 });

  // санузлы: облицовка
  function tiled(x0, z0, x1, z1, top, spec, holes) { // 4 стены помещения изнутри
    var t = 0.012, o = { roughness: spec.gloss != null ? spec.gloss : 0.6 };
    skin(x0, z0, x1, z0 + t, 0, top, spec, o);
    skin(x0, z1 - t, x1, z1, 0, top, spec, o);
    skin(x1 - t, z0, x1, z1, 0, top, spec, o);
    // левая стена с дверью
    var cur = z0; (holes || []).forEach(function (h) { skin(x0, cur, x0 + t, h[0], 0, top, spec, o); if (top > 2.1) skin(x0, h[0], x0 + t, h[1], 2.1, top, spec, o); cur = h[1]; });
    skin(x0, cur, x0 + t, z1, 0, top, spec, o);
  }
  tiled(5.86, 4.67, 7.4, 6.93, H, S.bathWall, [[5.95, 6.65]]);
  tiled(5.86, 3.27, 7.4, 4.55, S.wcHigh, S.wcWall, [[3.5, 4.2]]);
  if (S.wcPaint) { var wp = matC(S.wcPaint, 0.9); box(5.86, S.wcHigh, 3.27, 7.4, H, 3.282, wp, null, true); box(7.388, S.wcHigh, 3.27, 7.4, H, 4.55, wp, null, true); box(5.86, S.wcHigh, 4.538, 7.4, H, 4.55, wp, null, true); }

  // ---------- мебель ----------
  var FAB = S.leather ? matTex({ kind: 'leather', c: S.sofa }, 1, 1, { roughness: 0.55 }) : matTex({ kind: 'fabric', c: S.sofa }, 1, 1, { roughness: 1 });
  var WOOD = matTex({ kind: 'planks', a: S.table, b: S.table, w: 0.3, l: 2 }, 1, 1, { roughness: 0.55 });
  function legs(x0, z0, x1, z1, h, r, mat) { [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (p) { cyl(p[0], 0, p[1], r, h, mat || METAL, 10); }); }

  // диван (спинка к кухне, смотрит на ТВ)
  (function () {
    var x0 = 0.85, x1 = 3.35, z0 = 5.75, z1 = 6.7;
    legs(x0 + .08, z0 + .08, x1 - .08, z1 - .08, 0.14, 0.02, matC(S.sofaLegs, 0.5, S.sofaLegs === S.metal ? .6 : 0));
    box(x0, 0.14, z0, x1, 0.42, z1, FAB); box(x0, 0.42, z1 - 0.22, x1, 0.86, z1, FAB);
    box(x0, 0.42, z0, x0 + 0.2, 0.66, z1, FAB); box(x1 - 0.2, 0.42, z0, x1, 0.66, z1, FAB);
    for (var i = 0; i < 2; i++) box(x0 + 0.21 + i * 1.04, 0.42, z0 + 0.04, x0 + 0.21 + (i + 1) * 1.04 - 0.02, 0.56, z1 - 0.22, FAB);
    sph(x0 + 0.45, 0.68, z1 - 0.32, 0.2, 0.18, 0.07, matC(S.bedThrow, 1)); sph(x1 - 0.45, 0.68, z1 - 0.32, 0.2, 0.18, 0.07, matC(S.rug, 1));
  })();
  // ковёр, журнальный столик, кресло
  box(0.7, 0.0, 3.95, 3.55, 0.012, 6.4, matTex({ kind: 'fabric', c: S.rug }, 1, 1, { roughness: 1 }), null, true);
  if (S.tableRound) { cyl(2.1, 0.0, 4.85, 0.04, 0.38, METAL, 12); cyl(2.1, 0.38, 4.85, 0.45, 0.04, S.marbleTop ? matTex({ kind: 'marble', c: '#f2efea', v: '#b5aea7', s: 1 }, 1, 1, { roughness: .1 }) : WOOD, 40); }
  else { box(1.5, 0.0, 4.55, 2.7, 0.36, 5.15, METAL); box(1.48, 0.36, 4.53, 2.72, 0.4, 5.17, WOOD); }
  (function () { // кресло у окна
    var x0 = 0.35, z0 = 3.55, w = 0.8; legs(x0 + .06, z0 + .06, x0 + w - .06, z0 + w - .06, 0.18, 0.018, matC(S.sofaLegs, .5));
    var mt = S.pendants === 'chandelier' ? matTex({ kind: 'fabric', c: '#c49a3a' }, 1, 1, { roughness: 1 }) : FAB;
    box(x0, 0.18, z0, x0 + w, 0.44, z0 + w, mt); box(x0, 0.44, z0, x0 + 0.16, 0.95, z0 + w, mt); box(x0, 0.44, z0, x0 + w, 0.68, z0 + 0.14, mt);
  })();
  // ТВ и тумба
  box(0.9, 0.25, 3.27, 3.3, 0.62, 3.67, S.pendants === 'chandelier' ? matC('#f3efe7', .4) : (S.concreteWalls ? DARK : WOOD));
  box(1.45, 1.05, 3.3, 2.75, 1.78, 3.34, DARK);
  if (S.tvWall === 'shelves') { [1.95, 2.3].forEach(function (y) { box(3.45, y, 3.27, 4.25, y + 0.03, 3.5, WOOD); }); box(0.15, 1.9, 3.27, 0.8, 1.93, 3.5, WOOD); }
  // торшер
  cyl(3.6, 0, 6.55, 0.13, 0.03, METAL); cyl(3.6, 0.03, 6.55, 0.012, 1.5, METAL, 8); cyl(3.6, 1.45, 6.55, 0.2, 0.3, matC(S.pendantColor === '#151515' ? '#151515' : '#f1ede4', .8), 24, 0.14);

  // обеденная зона
  (function () {
    var x0 = 1.2, x1 = 2.9, z0 = 7.55, z1 = 8.45, top = S.marbleTop ? matTex({ kind: 'marble', c: '#f2efea', v: '#b5aea7', s: 1 }, 1, 1, { roughness: .1 }) : WOOD;
    legs(x0 + .1, z0 + .1, x1 - .1, z1 - .1, 0.72, 0.025, S.pendants === 'dome' ? WOOD : METAL);
    box(x0, 0.72, z0, x1, 0.76, z1, top);
    var cm = S.pendants === 'chandelier' ? matTex({ kind: 'fabric', c: S.chair }, 1, 1, { roughness: 1 }) : matC(S.chair, 0.6);
    [[1.6, z0 - 0.32, 1], [2.5, z0 - 0.32, 1], [1.6, z1 + 0.32, -1], [2.5, z1 + 0.32, -1]].forEach(function (c) {
      var cx = c[0], cz = c[1], d = c[2]; legs(cx - .19, cz - .19, cx + .19, cz + .19, 0.45, 0.014, S.pendants === 'dome' ? WOOD : METAL);
      box(cx - .22, 0.45, cz - .22, cx + .22, 0.49, cz + .22, cm); box(cx - .22, 0.49, cz - d * 0.22 - (d > 0 ? 0 : 0.04), cx + .22, 0.9, cz - d * 0.22 + (d > 0 ? -0.04 : 0) + (d > 0 ? 0 : 0.04), cm);
    });
  })();

  // кухня вдоль стены z=10.23
  (function () {
    var front = S.shaker ? matTex({ kind: 'shaker', c: S.kitchenFront }, 0.6, 0.72, { roughness: 0.5 }) : matC(S.kitchenFront, 0.5);
    var topM = S.marbleTop ? matTex({ kind: 'marble', c: '#f2efea', v: '#b5aea7', s: 1 }, 3.5, 0.6, { roughness: 0.12 })
      : S.concreteTop ? matTex({ kind: 'concrete', c: S.kitchenTop }, 3.5, 0.6, { roughness: 0.6 }) : matTex({ kind: 'planks', a: S.kitchenTop, b: S.kitchenTop, w: 0.6, l: 3 }, 3.5, 0.6, { roughness: 0.5 });
    box(0.45, 0, 9.63, 3.77, 0.1, 10.2, DARK, null, true);
    for (var x = 0.45; x < 3.76; x += 0.6) box(x + 0.003, 0.1, 9.6, Math.min(x + 0.6, 3.77) - 0.003, 0.86, 10.2, front);
    box(0.43, 0.86, 9.58, 3.79, 0.9, 10.22, topM);
    // мойка и смеситель
    box(2.95, 0.88, 9.72, 3.55, 0.905, 10.1, matC('#2b2b2b', .3, .4), null, true);
    cyl(3.25, 0.9, 10.12, 0.02, 0.32, METAL, 12); box(3.24, 1.2, 9.96, 3.26, 1.22, 10.13, METAL);
    // варочная панель и духовка (на месте плиты по плану)
    box(1.05, 0.9, 9.68, 1.65, 0.905, 10.17, matC('#0e0e0e', .15)); box(1.08, 0.2, 9.59, 1.62, 0.78, 9.61, matC('#151515', .2));
    // колонна с холодильником у стены коридора
    box(3.77, 0, 9.0, 4.37, 2.3, 10.23, front);
    box(3.77, 0, 8.4, 4.37, 2.3, 9.0, front);
    if (S.upper) { for (var u = 0.45; u < 2.85; u += 0.6) { if (u > 0.9 && u < 1.6) continue; box(u + .003, 1.5, 9.88, u + 0.6 - .003, 2.25, 10.23, front); } }
    else { [1.6, 1.98].forEach(function (y) { box(2.0, y, 9.95, 3.6, y + 0.04, 10.23, WOOD); }); }
    // вытяжка
    if (S.pendants === 'cage') box(1.1, 1.6, 9.85, 1.6, 2.7, 10.23, matC('#1d1d1d', .5, .4));
    else box(1.05, 1.55, 9.8, 1.65, 2.25, 10.23, S.upper ? front : METAL);
    // полки/посуда
    if (S.shelves && S.upper) box(2.85, 1.65, 10.0, 3.77, 1.68, 10.23, WOOD);
  })();

  // подвесные светильники
  function pendant(x, z, drop) {
    var y = H - drop; cyl(x, y, z, 0.004, drop, METAL, 4);
    if (S.pendants === 'dome') cyl(x, y - 0.18, z, 0.2, 0.2, matC(S.pendantColor, .5), 32, 0.05);
    else if (S.pendants === 'cage') { cyl(x, y - 0.3, z, 0.11, 0.3, new THREE.MeshStandardMaterial({ color: '#151515', wireframe: true }), 8); sph(x, y - 0.16, z, 0.05, 0.07, 0.05, new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ffb860', emissiveIntensity: 2 })); }
    else { cyl(x, y - 0.12, z, 0.32, 0.03, METAL, 32); for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2; sph(x + Math.cos(a) * 0.3, y - 0.05, z + Math.sin(a) * 0.3, 0.035, 0.05, 0.035, new THREE.MeshStandardMaterial({ color: '#fff3dd', emissive: '#ffd9a0', emissiveIntensity: 1.5 })); } }
  }
  if (S.pendants === 'chandelier') { pendant(2.05, 8.0, 0.75); pendant(2.1, 4.85, 0.6); }
  else { pendant(1.65, 8.0, 0.9); pendant(2.45, 8.0, 0.9); }

  // спальня
  (function () {
    var bx0 = 1.9, bx1 = 3.5, bz0 = 0.0, bz1 = 2.1;
    var head = S.tallHead ? matTex({ kind: 'fabric', c: S.headboard }, 1, 1, { roughness: 1 }) : (S.pendants === 'cage' ? WOOD : matTex({ kind: 'fabric', c: S.headboard }, 1, 1, { roughness: 1 }));
    box(bx0 - 0.1, 0, bz0, bx1 + 0.1, S.tallHead ? 1.45 : 1.05, bz0 + 0.1, head);
    box(bx0 - 0.05, 0.08, bz0 + 0.1, bx1 + 0.05, 0.32, bz1, S.pendants === 'chandelier' ? head : WOOD);
    box(bx0, 0.32, bz0 + 0.12, bx1, 0.55, bz1 - 0.03, matC(S.bedLinen, 1));
    box(bx0 - 0.01, 0.5, bz0 + 0.8, bx1 + 0.01, 0.6, bz1 - 0.02, matTex({ kind: 'fabric', c: S.bedLinen }, 1, 1, { roughness: 1 }));
    box(bx0 - 0.02, 0.56, bz1 - 0.6, bx1 + 0.02, 0.62, bz1 - 0.02, matTex({ kind: 'fabric', c: S.bedThrow }, 1, 1, { roughness: 1 }));
    sph(bx0 + 0.4, 0.66, bz0 + 0.35, 0.3, 0.1, 0.18, matC(S.bedLinen, 1)); sph(bx1 - 0.4, 0.66, bz0 + 0.35, 0.3, 0.1, 0.18, matC(S.bedLinen, 1));
    [[bx0 - 0.6, bx0 - 0.12], [bx1 + 0.12, bx1 + 0.6]].forEach(function (n) {
      box(n[0], 0.0, 0.02, n[1], 0.5, 0.45, S.pendants === 'chandelier' ? matC('#f3efe7', .4) : WOOD);
      cyl((n[0] + n[1]) / 2, 0.5, 0.22, 0.07, 0.02, METAL); cyl((n[0] + n[1]) / 2, 0.52, 0.22, 0.01, 0.3, METAL, 8); cyl((n[0] + n[1]) / 2, 0.75, 0.22, 0.13, 0.18, matC('#f1ede4', .8), 24, 0.1);
    });
    // шкаф
    var wf = S.shaker ? matTex({ kind: 'shaker', c: '#efe9df' }, 0.6, 2.4, { roughness: .5 }) : matC(S.pendants === 'cage' ? '#2f3133' : '#f4f2ee', 0.5);
    for (var z = 0.05; z < 2.4; z += 0.6) box(5.08, 0, z, 5.68, 2.45, z + 0.598, wf);
    // стол у окна
    box(0.02, 0.73, 0.75, 0.62, 0.76, 1.95, WOOD); legs(0.08, 0.8, 0.56, 1.9, 0.73, 0.015);
    cyl(0.9, 0, 1.35, 0.2, 0.45, matC(S.chair, .6), 24, 0.22);
    // ковёр
    box(1.2, 0, 1.2, 4.2, 0.01, 2.9, matTex({ kind: 'fabric', c: S.rug }, 1, 1, { roughness: 1 }), null, true);
  })();

  // ванная 1,54×2,23: ванна у дальней стены, тумба с раковиной справа, стиралка
  (function () {
    box(5.88, 0, 4.69, 7.38, 0.56, 5.4, CERAMIC);
    box(5.95, 0.4, 4.76, 7.31, 0.565, 5.33, new THREE.MeshStandardMaterial({ color: '#e9eef0', roughness: 0.05 }), null, true);
    cyl(6.6, 1.0, 4.7, 0.015, 0.9, METAL, 10); cyl(6.6, 1.9, 4.8, 0.11, 0.015, METAL, 24); box(6.55, 0.9, 4.68, 6.65, 1.0, 4.74, METAL);
    // душевая шторка/стекло
    box(6.6, 0.56, 5.37, 7.38, 2.0, 5.39, GLASS, null, true);
    // тумба + раковина
    var vf = S.pendants === 'cage' ? matC('#2f3133', .5) : S.pendants === 'chandelier' ? matC('#f3efe7', .4) : WOOD;
    box(6.92, 0.35, 5.55, 7.39, 0.82, 6.2, vf); box(6.9, 0.82, 5.53, 7.39, 0.86, 6.22, S.marbleTop ? matTex({ kind: 'marble', c: '#f2efea', v: '#b5aea7', s: 1 }, 1, 1, { roughness: .1 }) : CERAMIC);
    cyl(7.12, 0.86, 5.875, 0.19, 0.12, CERAMIC, 32, 0.2);
    cyl(7.35, 0.86, 5.875, 0.012, 0.22, METAL, 10); box(7.2, 1.06, 5.86, 7.36, 1.075, 5.89, METAL);
    box(7.37, 1.2, 5.55, 7.39, 2.0, 6.2, MIRROR, null, true);
    // стиральная машина
    box(6.1, 0, 6.33, 6.7, 0.85, 6.91, WHITE); var dr = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), matC('#3a4a52', .1, .3)); dr.position.set(6.4, 0.45, 6.325); dr.rotation.y = Math.PI; all.add(dr);
    box(6.1, 1.25, 6.75, 6.7, 1.28, 6.92, vf);
    // полотенцесушитель
    for (var y = 0.9; y < 1.6; y += 0.12) box(6.9, y, 6.9, 7.3, y + 0.02, 6.92, METAL);
  })();

  // туалет 1,4: инсталляция, подвесной унитаз, мини-раковина
  (function () {
    box(7.15, 0, 3.55, 7.39, 1.15, 4.25, S.wcHigh < 2 ? matTex(S.wcWall, 0.7, 1.15, { roughness: S.wcWall.gloss || .6 }) : matTex(S.wcWall, 0.7, 1.15));
    box(7.19, 0.9, 3.8, 7.21, 1.05, 4.0, METAL);
    sph(6.85, 0.37, 3.9, 0.3, 0.12, 0.19, CERAMIC); box(6.95, 0.25, 3.72, 7.15, 0.45, 4.08, CERAMIC);
    box(6.3, 0.78, 3.28, 6.72, 0.86, 3.52, CERAMIC); cyl(6.51, 0.86, 3.32, 0.01, 0.15, METAL, 8);
    box(6.32, 1.15, 3.28, 6.7, 1.7, 3.29, MIRROR, null, true);
    box(5.95, 1.35, 3.27, 6.25, 1.37, 3.42, METAL);
  })();

  // прихожая: шкаф, банкетка, зеркало
  (function () {
    var wf = S.shaker ? matTex({ kind: 'shaker', c: '#efe9df' }, 0.6, 2.4, { roughness: .5 }) : matC(S.pendants === 'cage' ? '#2f3133' : '#f4f2ee', 0.5);
    for (var z = 10.75; z < 12.75; z += 0.6) box(3.9, 0, z, 4.5, 2.45, Math.min(z + 0.598, 12.85), wf);
    box(5.3, 0.0, 10.7, 5.72, 0.45, 11.4, WOOD);
    box(5.72, 0.3, 7.6, 5.735, 2.1, 8.4, MIRROR, null, true);
    box(5.4, 0, 8.4, 5.74, 0.8, 9.6, S.pendants === 'chandelier' ? matC('#f3efe7', .4) : WOOD);
  })();

  // растения
  function plant(x, z, h) { cyl(x, 0, z, 0.16, 0.32, matC(S.concreteWalls ? '#3a3a3a' : '#e9e4da', .7), 20, 0.18); for (var i = 0; i < 7; i++) sph(x + (R() - .5) * .3, 0.45 + R() * h, z + (R() - .5) * .3, 0.14 + R() * .1, 0.16 + R() * .12, 0.14 + R() * .1, matC(i % 2 ? '#5d7a52' : '#4b6743', 0.9)); }
  plant(0.4, 6.4, 0.8); plant(4.0, 3.55, 0.6); plant(-1.5, 7.2, 0.5); plant(0.35, 2.75, 0.5);
  // лоджия: кресло
  box(-1.65, 0.0, 8.2, -0.95, 0.4, 8.9, FAB); box(-1.65, 0.4, 8.2, -1.5, 0.85, 8.9, FAB);
  // картины
  function art(x0, z0, x1, z1, y0, y1, c) { box(x0, y0, z0, x1, y1, z1, matC(S.metal, .4, .3), null, true); var m = matC(c, .9); var d = 0.03; if (x1 - x0 > z1 - z0) box(x0 + d, y0 + d, z0, x1 - d, y1 - d, z1 + 0.005, m, null, true); else box(x0, y0 + d, z0 + d, x1 + 0.005, y1 - d, z1 - d, m, null, true); }
  art(0.9, 0.0, 1.5, 0.03, 1.2, 1.8, S.bedThrow); art(4.34, 4.4, 4.37, 5.4, 1.2, 1.9, S.rug);

  // ---------- свет ----------
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x8a7f72, 0.42));
  scene.add(new THREE.AmbientLight(0xffffff, 0.08));
  var sun = new THREE.DirectionalLight(0xfff1dc, 3.2); sun.position.set(-9, 7, 2); sun.target.position.set(2, 0, 6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); var sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 30; sun.shadow.bias = -0.0005;
  scene.add(sun); scene.add(sun.target);
  [[2.8, 1.6], [2.2, 5.0], [2.2, 8.6], [5.1, 6.5], [4.8, 11.6], [6.6, 3.9], [6.6, 5.8]].forEach(function (p, i) {
    var l = new THREE.PointLight(0xffe2bd, i > 4 ? 0.55 : 0.75, 7, 1.6); l.position.set(p[0], H - 0.3, p[1]); scene.add(l);
  });

  // ---------- виды ----------
  var VIEWS = {
    living: { name: 'Гостиная', p: [3.55, 1.5, 8.2], t: [0.9, 1.05, 3.9], fov: 64 },
    kitchen: { name: 'Кухня', p: [0.7, 1.6, 6.3], t: [2.7, 1.0, 10.1], fov: 66 },
    bedroom: { name: 'Спальня', p: [5.0, 1.6, 3.0], t: [1.6, 0.8, 0.4], fov: 66 },
    bath: { name: 'Ванная', p: [6.0, 1.6, 6.8], t: [7.0, 0.9, 4.7], fov: 82 },
    wc: { name: 'Туалет', p: [5.95, 1.45, 4.45], t: [7.4, 0.8, 3.7], fov: 72 },
    hall: { name: 'Прихожая', p: [5.25, 1.6, 12.75], t: [4.9, 1.15, 6.5], fov: 66 },
    top: { name: 'Вся квартира', p: [4.2, 15.5, 13.2], t: [2.9, 0, 6.0], fov: 46, open: true }
  };
  function setView(k) {
    var v = VIEWS[k]; camera.fov = v.fov; camera.updateProjectionMatrix();
    camera.position.set(v.p[0], v.p[1], v.p[2]); controls.target.set(v.t[0], v.t[1], v.t[2]); controls.update();
    ceilings.visible = !v.open;
    document.querySelectorAll('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === k ? 'true' : 'false'); });
  }
  function resize() { var w = root.clientWidth, h = root.clientHeight || w * 0.62; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', resize); resize();
  // если камера над стенами - убираем потолки
  controls.addEventListener('change', function () { ceilings.visible = camera.position.y < H - 0.05; });
  (function loop() { controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop); })();
  document.querySelectorAll('[data-view]').forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
  var tg = document.getElementById('wallToggle');
  if (tg) tg.addEventListener('change', function () { partition.visible = tg.checked; });
  window.KV = { setView: setView, partition: partition, render: function () { renderer.render(scene, camera); }, resize: resize };
  setView(window.START_VIEW || 'top');
})();
