// Реалистичная прогулка по квартире 64,5 м² - неоклассика
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const H = 2.7, EYE = 1.6;
const mobile = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
const host = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(68, 16 / 9, 0.05, 200);
const manager = new THREE.LoadingManager();
const bar = document.getElementById('bar'), loadTxt = document.getElementById('loadTxt');
manager.onProgress = (u, a, b) => { const p = Math.round(a / b * 100); bar.style.width = p + '%'; loadTxt.textContent = p + '%'; };

// ---------- материалы ----------
const texL = new THREE.TextureLoader(manager);
const texCache = {};
function tset(name) {
  if (!texCache[name]) {
    const d = texL.load(`tex/${name}/diff.jpg`); d.colorSpace = THREE.SRGBColorSpace;
    const n = texL.load(`tex/${name}/nor.jpg`), r = texL.load(`tex/${name}/rough.jpg`);
    [d, n, r].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
    texCache[name] = { d, n, r };
  }
  return texCache[name];
}
// size - сколько метров покрывает одна текстура; w,h - размер поверхности
function pbr(name, size, w, h, o = {}) {
  const s = tset(name), rep = (t) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(w / size, h / size); if (o.rot) { c.rotation = o.rot; } return c; };
  const m = new THREE.MeshStandardMaterial({ map: o.noMap ? null : rep(s.d), normalMap: rep(s.n), roughnessMap: rep(s.r), color: o.color || 0xffffff, roughness: o.roughness ?? 1, metalness: 0, normalScale: new THREE.Vector2(o.ns ?? 1, o.ns ?? 1) });
  return m;
}
const C = (color, roughness = 0.85, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const WALL = C('#e7e0d5', 0.92), CEIL = C('#f7f5f0', 0.95), WHITE = C('#f6f4ef', 0.45), TRIM = C('#f8f6f2', 0.5);
const BRASS = new THREE.MeshStandardMaterial({ color: '#c49a55', roughness: 0.28, metalness: 1 });
const CERAMIC = new THREE.MeshPhysicalMaterial({ color: '#fbfbf9', roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 });
const GLASS = new THREE.MeshPhysicalMaterial({ color: '#e8f2f5', roughness: 0.02, transmission: 0.0, transparent: true, opacity: 0.12, metalness: 0 });
const MIRROR = new THREE.MeshStandardMaterial({ color: '#e9eef0', roughness: 0.02, metalness: 1 });
const DARK = C('#141414', 0.35);
const FRONT = C('#ece6db', 0.55);
const NAVY = () => pbr('velour_velvet', 0.6, 1, 1, { color: '#3b4c72', ns: 0.6, noMap: true });
const LINEN = (c = '#f4efe6', w = 1, h = 1) => pbr('rough_linen', 0.5, w, h, { color: c, ns: 0.5, noMap: true });
// белый мрамор Калакатта: свой рисунок прожилок + рельеф из marble_01
let calc = null;
function calacatta() {
  if (calc) return calc;
  const N = 1024, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d');
  let sd = 11; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  x.fillStyle = '#f5f3ef'; x.fillRect(0, 0, N, N);
  for (let i = 0; i < 90; i++) { const g = x.createRadialGradient(r() * N, r() * N, 0, r() * N, r() * N, 80 + r() * 200); g.addColorStop(0, 'rgba(225,220,212,.18)'); g.addColorStop(1, 'rgba(225,220,212,0)'); x.fillStyle = g; x.fillRect(0, 0, N, N); }
  const vein = (col, a, wmax, n) => { for (let v = 0; v < n; v++) { x.strokeStyle = col; x.globalAlpha = a * (0.3 + r() * 0.7); x.lineWidth = 0.5 + r() * wmax; x.beginPath(); let vx = r() * N, vy = -30; x.moveTo(vx, vy); while (vy < N + 30) { vx += (r() - 0.48) * 60; vy += 14 + r() * 40; x.lineTo(vx, vy); } x.stroke(); } };
  vein('#9b958f', 0.55, 2.2, 14); vein('#b9a27a', 0.45, 1.6, 6); vein('#7d7872', 0.35, 4, 4);
  x.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return calc = t;
}
const MARBLE = (w, h) => { const m = pbr('marble_01', 1.6, w, h, { noMap: true, ns: 0.25 }); const t = calacatta().clone(); t.needsUpdate = true; t.repeat.set(w / 1.6, h / 1.6); m.map = t; m.roughnessMap = null; m.roughness = 0.18; return m; };

// ---------- примитивы ----------
const world = new THREE.Group(); scene.add(world);
const ceilings = new THREE.Group(); scene.add(ceilings);
const obstacles = [];
function box(x0, y0, z0, x1, y1, z1, mat, opt = {}) {
  const g = opt.r ? new RoundedBoxGeometry(x1 - x0, y1 - y0, z1 - z0, 3, opt.r) : new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  const m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = opt.cast !== false; m.receiveShadow = true; (opt.parent || world).add(m); return m;
}
function cyl(x, y0, z, r, h, mat, seg = 32, rTop) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop ?? r, r, h, seg), mat); m.position.set(x, y0 + h / 2, z);
  m.castShadow = m.receiveShadow = true; world.add(m); return m;
}
function wall(x0, z0, x1, z1, holes = []) {
  const alongX = (x1 - x0) >= (z1 - z0), a0 = alongX ? x0 : z0, a1 = alongX ? x1 : z1;
  let cur = a0;
  const piece = (b0, b1, y0, y1) => {
    if (b1 - b0 < 0.001 || y1 - y0 < 0.001) return;
    if (alongX) box(b0, y0, z0, b1, y1, z1, WALL); else box(x0, y0, b0, x1, y1, b1, WALL);
    if (y0 < 1) obstacles.push(alongX ? [b0, z0, b1, z1] : [x0, b0, x1, b1]);
  };
  holes.slice().sort((a, b) => a[0] - b[0]).forEach(c => { piece(cur, c[0], 0, H); piece(c[0], c[1], 0, c[2]); piece(c[0], c[1], c[3], H); cur = c[1]; });
  piece(cur, a1, 0, H);
}
function floor(x0, z0, x1, z1, mat) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0), m = new THREE.Mesh(g, mat);
  m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.002, (z0 + z1) / 2); m.receiveShadow = true; world.add(m);
  const c = new THREE.Mesh(g, CEIL); c.rotation.x = Math.PI / 2; c.position.set((x0 + x1) / 2, H, (z0 + z1) / 2); ceilings.add(c);
}
// молдинг-рамка на стене: плоскость стены по оси (axis 'z' - стена вдоль X)
function moldFrame(axis, fixed, a0, a1, y0, y1, dir = 1) {
  const t = 0.028, d = 0.016;
  if (axis === 'z') {
    const z0 = fixed, z1 = fixed + d * dir;
    box(a0, y0, Math.min(z0, z1), a1, y0 + t, Math.max(z0, z1), TRIM, { cast: false }); box(a0, y1 - t, Math.min(z0, z1), a1, y1, Math.max(z0, z1), TRIM, { cast: false });
    box(a0, y0, Math.min(z0, z1), a0 + t, y1, Math.max(z0, z1), TRIM, { cast: false }); box(a1 - t, y0, Math.min(z0, z1), a1, y1, Math.max(z0, z1), TRIM, { cast: false });
  } else {
    const x0 = fixed, x1 = fixed + d * dir;
    box(Math.min(x0, x1), y0, a0, Math.max(x0, x1), y0 + t, a1, TRIM, { cast: false }); box(Math.min(x0, x1), y1 - t, a0, Math.max(x0, x1), y1, a1, TRIM, { cast: false });
    box(Math.min(x0, x1), y0, a0, Math.max(x0, x1), y1, a0 + t, TRIM, { cast: false }); box(Math.min(x0, x1), y0, a1 - t, Math.max(x0, x1), y1, a1, TRIM, { cast: false });
  }
}
function panelWall(axis, fixed, a0, a1, dir, n) {
  const w = (a1 - a0 - 0.12 * (n + 1)) / n;
  for (let i = 0; i < n; i++) { const s = a0 + 0.12 + i * (w + 0.12); moldFrame(axis, fixed, s, s + w, 1.0, 2.38, dir); moldFrame(axis, fixed, s, s + w, 0.16, 0.86, dir); }
  // поясок
  if (axis === 'z') box(a0, 0.9, Math.min(fixed, fixed + 0.03 * dir), a1, 0.95, Math.max(fixed, fixed + 0.03 * dir), TRIM, { cast: false });
  else box(Math.min(fixed, fixed + 0.03 * dir), 0.9, a0, Math.max(fixed, fixed + 0.03 * dir), 0.95, a1, TRIM, { cast: false });
}

// ---------- планировка (по выписке ЕГРН) ----------
const PARQ = (w, h) => pbr('herringbone_parquet', 1.4, w, h, { color: '#f6e9da', roughness: 0.85 });
floor(0, 0, 5.68, 3.15, PARQ(5.68, 3.15));
floor(0, 3.15, 4.37, 10.23, PARQ(4.37, 7.08));
floor(4.37, 3.15, 5.74, 10.4, PARQ(1.37, 7.25));
floor(3.9, 10.23, 5.74, 12.9, MARBLE(1.84, 2.67));
floor(5.74, 3.27, 7.4, 4.55, MARBLE(1.66, 1.28));
floor(5.74, 4.67, 7.4, 6.93, MARBLE(1.66, 2.26));
floor(-1.82, 6.95, -0.4, 10.26, PARQ(1.42, 3.31));

const WIN = 0.82, WT = 2.4;
wall(-0.4, -0.4, 0, 10.6, [[0.7, 2.1, WIN, WT], [4.4, 6.1, WIN, WT], [7.95, 8.75, 0, 2.25], [8.95, 9.95, WIN, WT]]);
wall(-0.4, -0.4, 7.6, 0);
wall(5.68, 0, 6.08, 3.15);
wall(0, 3.15, 7.6, 3.27, [[4.65, 5.45, 0, 2.2]]);
wall(4.37, 3.27, 4.49, 10.23, [[5.9, 7.4, 0, 2.3]]);
wall(-0.4, 10.23, 4.49, 10.6);
wall(5.74, 3.27, 5.86, 10.4, [[3.5, 4.2, 0, 2.15], [5.95, 6.65, 0, 2.15]]);
wall(5.86, 4.55, 7.4, 4.67);
wall(7.4, 3.15, 7.6, 7.05);
wall(5.74, 6.93, 7.6, 7.05);
wall(3.78, 10.6, 3.9, 13.1);
wall(3.78, 12.9, 5.98, 13.1);
wall(5.74, 10.4, 5.98, 12.9, [[11.5, 12.4, 0, 2.15]]);
// лоджия
const PAR = C('#ece8e1', 0.8);
box(-1.9, 0, 6.87, -0.4, 1.0, 6.95, PAR); box(-1.9, 0, 10.26, -0.4, 1.0, 10.34, PAR); box(-1.9, 0, 6.87, -1.82, 1.0, 10.34, PAR);
box(-1.89, 1.0, 6.9, -1.86, 2.5, 10.3, GLASS, { cast: false });

// окна
function windowAt(z0, z1, y0, y1) {
  box(-0.26, y0, z0, -0.18, y0 + 0.06, z1, WHITE); box(-0.26, y1 - 0.06, z0, -0.18, y1, z1, WHITE);
  box(-0.26, y0, z0, -0.18, y1, z0 + 0.06, WHITE); box(-0.26, y0, z1 - 0.06, -0.18, y1, z1, WHITE);
  box(-0.26, y0, (z0 + z1) / 2 - 0.03, -0.18, y1, (z0 + z1) / 2 + 0.03, WHITE);
  box(-0.23, y0, z0, -0.21, y1, z1, GLASS, { cast: false });
  if (y0 > 0.1) box(-0.2, y0 - 0.04, z0 - 0.06, 0.08, y0, z1 + 0.06, MARBLE(z1 - z0 + 0.12, 0.3));
}
windowAt(0.7, 2.1, WIN, WT); windowAt(4.4, 6.1, WIN, WT); windowAt(8.95, 9.95, WIN, WT); windowAt(7.95, 8.75, 0.02, 2.25);
// шторы из льна
function curtain(z0, z1) {
  const mat = LINEN('#efe7da', 1, 2.6); mat.side = THREE.DoubleSide;
  [[z0 - 0.42, z0 + 0.08], [z1 - 0.08, z1 + 0.42]].forEach(p => {
    const w = p[1] - p[0], g = new THREE.PlaneGeometry(w, 2.58, 40, 1), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) / w * Math.PI * 9) * 0.03);
    g.computeVertexNormals(); const c = new THREE.Mesh(g, mat); c.rotation.y = Math.PI / 2; c.position.set(0.11, 0.02 + 1.29, (p[0] + p[1]) / 2); c.castShadow = true; world.add(c);
  });
  box(0.05, 2.6, z0 - 0.45, 0.08, 2.62, z1 + 0.45, BRASS);
}
curtain(0.7, 2.1); curtain(4.4, 6.1); curtain(8.95, 9.95);

// плинтус и карниз
[[0, 0, 5.68, 0.02], [0, 3.13, 4.65, 3.15], [0, 0, 0.02, 3.15], [0, 3.27, 0.02, 10.23], [0, 3.27, 4.37, 3.29], [4.35, 3.27, 4.37, 5.9], [4.35, 7.4, 4.37, 8.4], [0, 10.21, 0.45, 10.23], [5.66, 0, 5.68, 3.15], [4.49, 3.27, 4.51, 5.9], [4.49, 7.4, 4.51, 10.23], [5.72, 3.27, 5.74, 3.5], [5.72, 4.2, 5.74, 5.95], [5.72, 6.65, 5.74, 10.4]]
  .forEach(b => { box(b[0], 0, b[1], b[2], 0.11, b[3], TRIM, { cast: false }); box(b[0], H - 0.09, b[1], b[2], H, b[3], TRIM, { cast: false }); });
// стены с молдингами: ТВ-стена гостиной и стена изголовья
panelWall('z', 3.27, 0.15, 4.25, 1, 3);
panelWall('z', 0.0, 0.25, 5.0, 1, 4);
panelWall('x', 4.37, 7.5, 8.35, -1, 1);

// ---------- двери ----------
function doorLeaf(hx, hz, w, ang) {
  const g = new THREE.Group(); const leaf = new THREE.Mesh(new THREE.BoxGeometry(w, 2.08, 0.04), TRIM); leaf.position.set(w / 2, 1.04, 0); leaf.castShadow = true; g.add(leaf);
  [[0.5, 1.6], [0.3, 0.7]].forEach(() => {});
  const fr = (y0, y1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w - 0.24, y1 - y0, 0.012), C('#efece6', 0.5)); m.position.set(w / 2, (y0 + y1) / 2, 0.026); g.add(m); };
  fr(1.15, 1.9); fr(0.18, 0.95);
  const kn = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), BRASS); kn.position.set(w - 0.07, 1.0, 0.05); g.add(kn);
  g.position.set(hx, 0, hz); g.rotation.y = ang; world.add(g);
}
doorLeaf(5.45, 3.21, 0.78, Math.PI * 0.55);
doorLeaf(5.8, 4.2, 0.68, -Math.PI * 0.95);
doorLeaf(5.8, 6.65, 0.68, -Math.PI * 0.95);

// ---------- кухня ----------
function shakerFront(x0, y0, x1, y1, z) { // фасад с рамкой, лицом к -z
  box(x0 + 0.002, y0, z - 0.02, x1 - 0.002, y1, z, FRONT);
  const t = 0.06, d = 0.012, zz = z - 0.02;
  box(x0 + 0.002, y0, zz - d, x1 - 0.002, y0 + t, zz, FRONT, { cast: false }); box(x0 + 0.002, y1 - t, zz - d, x1 - 0.002, y1, zz, FRONT, { cast: false });
  box(x0 + 0.002, y0, zz - d, x0 + t, y1, zz, FRONT, { cast: false }); box(x1 - t, y0, zz - d, x1 - 0.002, y1, zz, FRONT, { cast: false });
}
box(0.45, 0, 9.66, 3.77, 0.1, 10.21, C('#d9d2c6', 0.7));
for (let x = 0.45; x < 3.76; x += 0.6) { const x1 = Math.min(x + 0.6, 3.77); box(x, 0.1, 9.66, x1, 0.86, 10.21, FRONT); shakerFront(x, 0.1, x1, 0.86, 9.66); box((x + x1) / 2 - 0.08, 0.76, 9.61, (x + x1) / 2 + 0.08, 0.775, 9.625, BRASS); }
box(0.43, 0.86, 9.6, 3.79, 0.9, 10.22, MARBLE(3.36, 0.62), {});
box(0.45, 0.9, 10.19, 3.77, 1.5, 10.23, MARBLE(3.32, 0.6), { cast: false });
box(2.95, 0.882, 9.72, 3.55, 0.902, 10.1, C('#cfcfcd', 0.2, 0.9), { cast: false });
cyl(3.25, 0.9, 10.12, 0.018, 0.34, BRASS, 16); box(3.24, 1.21, 9.95, 3.26, 1.235, 10.13, BRASS);
box(1.05, 0.9, 9.7, 1.65, 0.906, 10.16, C('#0b0b0b', 0.12));
box(1.08, 0.18, 9.635, 1.62, 0.78, 9.66, C('#151515', 0.15));
for (let u = 0.45; u < 2.85; u += 0.6) { if (u > 0.9 && u < 1.6) continue; box(u, 1.55, 9.88, u + 0.6, 2.4, 10.21, FRONT); shakerFront(u, 1.55, u + 0.6, 2.4, 9.88); }
box(1.05, 1.62, 9.82, 1.65, 2.4, 10.21, FRONT); shakerFront(1.05, 1.62, 1.65, 2.4, 9.82);
// колонна с холодильником и духовкой
box(3.79, 0, 8.4, 4.37, 2.4, 10.23, FRONT);
for (let z = 8.4; z < 10.2; z += 0.6) { const z1 = Math.min(z + 0.6, 10.23); box(3.77, 0.1, z + 0.002, 3.79, 2.4, z1 - 0.002, FRONT); box(3.755, 1.0, z + 0.05, 3.77, 1.4, z + 0.065, BRASS); }

// столовая: стол с мраморной столешницей на латунных ножках
box(1.2, 0.72, 7.55, 2.9, 0.76, 8.45, MARBLE(1.7, 0.9), { r: 0.012 });
[[1.35, 7.7], [2.75, 7.7], [1.35, 8.3], [2.75, 8.3]].forEach(p => cyl(p[0], 0, p[1], 0.022, 0.72, BRASS, 16, 0.016));

// ---------- спальня ----------
(function () {
  const bx0 = 1.95, bx1 = 3.55;
  const head = NAVY(); head.color.set('#d9cfbf');
  box(bx0 - 0.15, 0.1, 0.0, bx1 + 0.15, 1.5, 0.12, pbr('velour_velvet', 0.6, 1.9, 1.4, { color: '#d6ccbb', ns: 0.6, noMap: true }), { r: 0.04 });
  box(bx0 - 0.06, 0.06, 0.12, bx1 + 0.06, 0.34, 2.15, pbr('velour_velvet', 0.6, 1.7, 2, { color: '#d6ccbb', ns: 0.6, noMap: true }), { r: 0.03 });
  box(bx0, 0.34, 0.14, bx1, 0.58, 2.1, LINEN('#f7f4ee', 1.6, 2), { r: 0.06 });
  box(bx0 - 0.02, 0.52, 0.85, bx1 + 0.02, 0.62, 2.13, LINEN('#f2ede5', 1.6, 1.3), { r: 0.04 });
  box(bx0 - 0.03, 0.58, 1.55, bx1 + 0.03, 0.645, 2.15, LINEN('#c79a45', 1.6, 0.6), { r: 0.03 });
  [bx0 + 0.42, bx1 - 0.42].forEach(x => box(x - 0.33, 0.58, 0.18, x + 0.33, 0.78, 0.4, LINEN('#fbf9f5', 0.6, 0.3), { r: 0.08 }));
  [[bx0 - 0.62, bx0 - 0.12], [bx1 + 0.12, bx1 + 0.62]].forEach(n => {
    box(n[0], 0.1, 0.02, n[1], 0.55, 0.45, FRONT, { r: 0.01 }); [0.1, 0.42].forEach(x => cyl(n[0] + x * (n[1] - n[0]) / 0.5, 0, 0.12, 0.01, 0.1, BRASS, 8));
    const cx = (n[0] + n[1]) / 2; cyl(cx, 0.55, 0.22, 0.07, 0.03, BRASS); cyl(cx, 0.58, 0.22, 0.012, 0.32, BRASS, 12);
    const shade = cyl(cx, 0.8, 0.22, 0.16, 0.2, new THREE.MeshStandardMaterial({ color: '#f3ece0', roughness: 0.9, emissive: '#ffd9a8', emissiveIntensity: 0.25, side: THREE.DoubleSide }), 32, 0.11);
    const l = new THREE.PointLight('#ffcf98', 1.2, 3, 2); l.position.set(cx, 0.85, 0.3); scene.add(l);
  });
  for (let z = 0.05; z < 2.4; z += 0.6) { box(5.08, 0, z + 0.002, 5.68, 2.5, z + 0.598, FRONT); }
  for (let z = 0.05; z < 2.4; z += 0.6) { const z1 = z + 0.598; box(5.06, 0.1, z + 0.004, 5.08, 2.4, z1 - 0.004, FRONT); box(5.045, 1.1, z + 0.5, 5.06, 1.5, z + 0.515, BRASS); }
  box(1.0, 0, 0.9, 4.6, 0.012, 3.0, LINEN('#d8cdbb', 3.6, 2.1), { cast: false });
  // туалетный столик у окна
  box(0.04, 0.72, 0.8, 0.5, 0.76, 1.95, MARBLE(0.5, 1.2)); [[0.08, 0.84], [0.46, 0.84], [0.08, 1.91], [0.46, 1.91]].forEach(p => cyl(p[0], 0, p[1], 0.012, 0.72, BRASS, 12));
})();

// ---------- ванная (мрамор, латунь) ----------
function marbleRoom(x0, z0, x1, z1, top, doorZ) {
  const t = 0.01;
  box(x0, 0, z0, x1, top, z0 + t, MARBLE(x1 - x0, top), { cast: false });
  box(x0, 0, z1 - t, x1, top, z1, MARBLE(x1 - x0, top), { cast: false });
  box(x1 - t, 0, z0, x1, top, z1, MARBLE(z1 - z0, top), { cast: false });
  box(x0, 0, z0, x0 + t, top, doorZ[0], MARBLE(doorZ[0] - z0, top), { cast: false });
  box(x0, 0, doorZ[1], x0 + t, top, z1, MARBLE(z1 - doorZ[1], top), { cast: false });
  if (top > 2.15) box(x0, 2.15, doorZ[0], x0 + t, top, doorZ[1], MARBLE(0.7, top - 2.15), { cast: false });
}
marbleRoom(5.86, 4.67, 7.4, 6.93, H, [5.95, 6.65]);
marbleRoom(5.86, 3.27, 7.4, 4.55, 1.2, [3.5, 4.2]);
const GREEN = C('#2f4a3e', 0.9);
box(5.86, 1.2, 3.27, 7.4, H, 3.282, GREEN, { cast: false }); box(7.388, 1.2, 3.27, 7.4, H, 4.55, GREEN, { cast: false }); box(5.86, 1.2, 4.538, 7.4, H, 4.55, GREEN, { cast: false });
box(5.86, 1.2, 3.282, 5.872, H, 3.5, GREEN, { cast: false }); box(5.86, 1.2, 4.2, 5.872, H, 4.538, GREEN, { cast: false });
// ванна
box(5.88, 0, 4.69, 7.38, 0.57, 5.42, MARBLE(1.5, 0.6));
box(5.95, 0.42, 4.76, 7.31, 0.575, 5.35, CERAMIC, { r: 0.08, cast: false });
cyl(6.62, 1.0, 4.72, 0.016, 1.0, BRASS, 16); cyl(6.62, 1.98, 4.83, 0.12, 0.012, BRASS, 32); box(6.6, 1.97, 4.72, 6.64, 1.985, 4.83, BRASS);
box(6.55, 0.95, 4.68, 6.69, 1.03, 4.73, BRASS);
box(6.6, 0.57, 5.39, 7.38, 2.05, 5.405, GLASS, { cast: false }); box(6.6, 2.03, 5.385, 7.38, 2.05, 5.41, BRASS);
// тумба с раковиной
box(6.94, 0.32, 5.55, 7.39, 0.82, 6.2, FRONT, { r: 0.01 }); box(6.92, 0.82, 5.53, 7.39, 0.86, 6.22, MARBLE(0.47, 0.69));
cyl(7.13, 0.86, 5.875, 0.19, 0.13, CERAMIC, 48, 0.21);
cyl(7.36, 0.86, 5.875, 0.013, 0.26, BRASS, 16); box(7.2, 1.1, 5.862, 7.36, 1.118, 5.888, BRASS);
{ const mr = new Reflector(new THREE.PlaneGeometry(0.55, 0.82), { textureWidth: mobile ? 512 : 1024, textureHeight: mobile ? 768 : 1536, color: '#d9dcdc' }); mr.rotation.y = -Math.PI / 2; mr.position.set(7.378, 1.59, 5.875); world.add(mr); }
box(7.388, 1.16, 5.58, 7.398, 2.02, 6.17, BRASS, { cast: false });
// стиральная машина в нише, полотенцесушитель
box(6.1, 0, 6.34, 6.7, 0.85, 6.91, C('#f3f3f1', 0.3), { r: 0.02 });
const drum = new THREE.Mesh(new THREE.CircleGeometry(0.19, 48), C('#2c3337', 0.1, 0.4)); drum.position.set(6.4, 0.47, 6.335); drum.rotation.y = Math.PI; world.add(drum);
for (let y = 0.9; y < 1.7; y += 0.11) box(6.92, y, 6.88, 7.32, y + 0.022, 6.905, BRASS);
// туалет
box(7.16, 0, 3.55, 7.39, 1.15, 4.25, MARBLE(0.7, 1.15));
box(7.2, 0.95, 3.82, 7.21, 1.08, 3.98, BRASS, { cast: false });
const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), CERAMIC); bowl.scale.set(0.27, 0.2, 0.18); bowl.rotation.x = Math.PI; bowl.position.set(6.88, 0.42, 3.9); bowl.castShadow = true; world.add(bowl);
box(6.62, 0.4, 3.72, 7.16, 0.44, 4.08, CERAMIC, { r: 0.08 });
box(6.3, 0.76, 3.29, 6.72, 0.84, 3.52, CERAMIC, { r: 0.03 }); cyl(6.51, 0.84, 3.33, 0.011, 0.16, BRASS, 12);
box(6.33, 1.3, 3.283, 6.69, 1.9, 3.29, C('#b9c0c2', 0.15, 0.3), { cast: false }); box(6.31, 1.28, 3.282, 6.71, 1.92, 3.286, BRASS, { cast: false });

// прихожая: входная дверь
box(5.76, 0, 11.5, 5.82, 2.15, 12.4, C('#3a3330', 0.45));
[[0.25, 0.95], [1.15, 1.95]].forEach(([y0, y1]) => box(5.735, y0, 11.62, 5.76, y1, 12.28, C('#463d39', 0.4)));
box(5.71, 1.0, 11.6, 5.74, 1.02, 11.75, BRASS);
// прихожая
for (let z = 10.75; z < 12.75; z += 0.6) { const z1 = Math.min(z + 0.598, 12.85); box(3.9, 0, z, 4.5, 2.5, z1, FRONT); box(4.5, 0.1, z + 0.004, 4.52, 2.4, z1 - 0.004, FRONT); box(4.52, 1.0, z + 0.5, 4.535, 1.4, z + 0.515, BRASS); }
box(5.3, 0.0, 10.75, 5.72, 0.46, 11.4, pbr('velour_velvet', 0.6, 0.4, 0.6, { color: '#3b4c72', ns: 0.6, noMap: true }), { r: 0.03 });

// картины (абстракция, нарисованная на canvas)
function artTex(seed, cols) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 640; const x = c.getContext('2d');
  x.fillStyle = cols[0]; x.fillRect(0, 0, 512, 640); let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 7; i++) { x.fillStyle = cols[1 + (i % (cols.length - 1))]; x.globalAlpha = 0.55 + r() * 0.4; x.beginPath(); x.ellipse(r() * 512, r() * 640, 60 + r() * 180, 40 + r() * 140, r() * 3, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function art(x0, z0, x1, z1, y0, y1, seed, cols) {
  box(x0, y0, z0, x1, y1, z1, BRASS, { cast: false });
  const m = new THREE.MeshStandardMaterial({ map: artTex(seed, cols), roughness: 0.9 }), d = 0.03;
  const p = new THREE.Mesh(new THREE.PlaneGeometry((x1 - x0 > z1 - z0 ? x1 - x0 : z1 - z0) - 2 * d, y1 - y0 - 2 * d), m);
  if (x1 - x0 > z1 - z0) p.position.set((x0 + x1) / 2, (y0 + y1) / 2, z1 + 0.002); else { p.rotation.y = -Math.PI / 2; p.position.set(x0 - 0.002, (y0 + y1) / 2, (z0 + z1) / 2); }
  world.add(p);
}
art(2.25, 0.0, 3.25, 0.03, 1.62, 2.3, 7, ['#efe8dc', '#c79a45', '#3b4c72', '#d9cfbf']);
art(4.335, 4.3, 4.37, 5.5, 1.15, 2.05, 3, ['#e9e2d6', '#2f4a3e', '#c79a45', '#b9a88f']);

// ---------- 3D-модели (Poly Haven, CC0) ----------
const gltf = new GLTFLoader(manager);
const models = {};
function load(id) { return new Promise((res, rej) => gltf.load(`models/${id}/${id}.gltf`, g => { g.scene.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); res(g.scene); }, undefined, rej)); }
function place(src, { x, z, y = 0, rot = 0, w, clone = true }) {
  const o = clone ? src.clone(true) : src;
  const b0 = new THREE.Box3().setFromObject(o), s0 = b0.getSize(new THREE.Vector3());
  if (w) o.scale.setScalar(w / s0.x);
  o.rotation.y = rot; o.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3());
  o.position.x += x - c.x; o.position.z += z - c.z; o.position.y += y - b.min.y; world.add(o); return o;
}
const ids = ['Sofa_01', 'ArmChair_01', 'coffee_table_round_01', 'Chandelier_02', 'modern_wooden_cabinet', 'potted_plant_02', 'potted_plant_01', 'ornate_mirror_01', 'dining_chair_02', 'brass_vase_01', 'brass_candleholders', 'ceramic_vase_01'];
const ready = Promise.all(ids.map(id => load(id).then(m => { models[id] = m; }).catch(e => console.warn(id, e))));

ready.then(() => {
  const M = models;
  // гостиная: диван лицом к ТВ-стене, кресло у окна, стол из мрамора
  M.Sofa_01 && place(M.Sofa_01, { x: 2.15, z: 6.2, rot: Math.PI, w: 2.1 });
  M.ArmChair_01 && place(M.ArmChair_01, { x: 0.75, z: 4.25, rot: Math.PI * 0.72, w: 0.85 });
  M.coffee_table_round_01 && place(M.coffee_table_round_01, { x: 2.15, z: 4.95, w: 0.85 });
  M.modern_wooden_cabinet && place(M.modern_wooden_cabinet, { x: 2.2, z: 3.52, rot: 0, w: 1.7 });
  M.potted_plant_02 && place(M.potted_plant_02, { x: 0.45, z: 6.6, w: 0.8 });
  M.potted_plant_01 && place(M.potted_plant_01, { x: 4.0, z: 3.65, w: 0.6 });
  M.brass_vase_01 && place(M.brass_vase_01, { x: 1.55, z: 3.5, y: 0.7, w: 0.16 });
  M.brass_candleholders && place(M.brass_candleholders, { x: 2.15, z: 4.95, y: 0.44, w: 0.28 });
  M.ceramic_vase_01 && place(M.ceramic_vase_01, { x: 2.05, z: 8.0, y: 0.76, w: 0.2 });
  // столовая
  if (M.dining_chair_02) [[1.65, 7.2, 0], [2.45, 7.2, 0], [1.65, 8.8, Math.PI], [2.45, 8.8, Math.PI]].forEach(p => place(M.dining_chair_02, { x: p[0], z: p[1], rot: p[2], w: 0.5 }));
  if (M.Chandelier_02) { place(M.Chandelier_02, { x: 2.05, z: 8.0, y: 1.75, w: 0.8 }); place(M.Chandelier_02, { x: 2.15, z: 4.95, y: 1.9, w: 0.7 }); }
  // прихожая и спальня
  M.ornate_mirror_01 && place(M.ornate_mirror_01, { x: 5.71, z: 8.0, y: 0.6, rot: -Math.PI / 2, w: 0.9 });
  M.potted_plant_02 && place(M.potted_plant_02, { x: 0.45, z: 2.75, w: 0.6 });
  // материалы моделей: мягче отражения окружения
  world.traverse(o => { if (o.isMesh && o.material && 'envMapIntensity' in o.material) o.material.envMapIntensity = 0.45; });
  ceilings.traverse(o => { if (o.isMesh) o.material.envMapIntensity = 0.3; });
});

// ---------- свет ----------
new RGBELoader(manager).load('hdri/sky.hdr', t => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = t; scene.backgroundBlurriness = 0.05; scene.backgroundIntensity = 0.9;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(t).texture;
  world.traverse(o => { if (o.isMesh && o.material && 'envMapIntensity' in o.material) o.material.envMapIntensity = 0.45; });
});
scene.add(new THREE.HemisphereLight('#fff6ea', '#8a7a68', 0.35));
const sun = new THREE.DirectionalLight('#fff0d8', 4.2); sun.position.set(-8, 6.5, 3); sun.target.position.set(2, 0, 6);
sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 2048 : 4096, mobile ? 2048 : 4096);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);
// мягкий дневной свет из окон
[[1.4, 1.4], [5.25, 1.7], [9.45, 1.0], [8.35, 0.8]].forEach(([z, w]) => { const l = new THREE.RectAreaLight('#eaf2ff', 3.2, w, 1.5); l.position.set(0.02, 1.6, z); l.lookAt(3, 1.6, z); scene.add(l); });
// тёплые люстры и бра
[[2.05, 2.1, 8.0, 3.2], [2.15, 2.15, 4.95, 2.6], [2.8, 2.5, 1.6, 1.8], [5.1, 2.5, 6.5, 1.5], [4.8, 2.5, 11.6, 1.6], [6.6, 2.5, 5.8, 1.4], [6.6, 2.5, 3.9, 1.0]].forEach(([x, y, z, i]) => { const l = new THREE.PointLight('#ffd6a3', i, 6, 2); l.position.set(x, y, z); scene.add(l); });

// ---------- постобработка ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
let gtao = null;
if (!mobile) { gtao = new GTAOPass(scene, camera, 1, 1); gtao.blendIntensity = 0.85; gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.2, thickness: 1, scale: 1 }); composer.addPass(gtao); }
composer.addPass(new OutputPass());

function resize() { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

// ---------- экскурсия и прогулка ----------
const P = (x, z, y = EYE) => new THREE.Vector3(x, y, z);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TOUR = [
  [P(5.25, 12.6), V(5.0, 1.45, 8.0)], [P(5.15, 9.6), V(4.6, 1.5, 6.5)], [P(5.05, 7.2), V(2.4, 1.3, 6.4)],
  [P(3.7, 6.7), V(1.2, 1.15, 4.3)], [P(3.2, 5.0), V(0.3, 1.3, 5.3)], [P(1.4, 6.9), V(3.0, 1.0, 10.0)],
  [P(3.3, 7.6), V(0.4, 1.3, 8.9)], [P(3.6, 6.9), V(4.6, 1.5, 6.7)], [P(5.05, 6.0), V(5.1, 1.5, 3.6)],
  [P(5.05, 3.75), V(3.6, 1.2, 2.2)], [P(4.5, 2.75), V(1.6, 0.9, 0.5)], [P(2.4, 2.75), V(0.1, 1.3, 1.3)],
  [P(4.5, 2.5), V(5.0, 1.4, 4.0)], [P(5.1, 4.6), V(5.1, 1.4, 6.6)], [P(5.3, 6.3), V(7.3, 1.1, 5.2)],
  [P(6.15, 6.55), V(7.2, 0.9, 4.9)], [P(5.3, 6.3), V(5.1, 1.5, 10.0)], [P(5.2, 10.4), V(5.3, 1.4, 12.6)]
];
const posCurve = new THREE.CatmullRomCurve3(TOUR.map(t => t[0]), false, 'centripetal');
const tgtCurve = new THREE.CatmullRomCurve3(TOUR.map(t => t[1]), false, 'centripetal');
const TOUR_SEC = 95;
let mode = 'tour', tt = 0, yaw = 0, pitch = 0;
const keys = {}, look = new THREE.Vector3();
function setLook(from, to) { const d = to.clone().sub(from).normalize(); yaw = Math.atan2(-d.x, -d.z); pitch = Math.asin(d.y); }
function applyLook() { camera.rotation.set(pitch, yaw, 0, 'YXZ'); }
function startWalk(pos, tgt) { mode = 'walk'; camera.position.copy(pos); setLook(pos, tgt); applyLook(); ui(); }
function startTour() { mode = 'tour'; ui(); }
function collide(p) {
  const r = 0.24;
  for (const [x0, z0, x1, z1] of obstacles) {
    const cx = Math.max(x0, Math.min(p.x, x1)), cz = Math.max(z0, Math.min(p.z, z1)), dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) { const d = Math.sqrt(d2) || 1e-4; p.x = cx + dx / d * r; p.z = cz + dz / d * r; }
  }
}
// мышь/палец: тянуть - осматриваться
let drag = null;
renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; if (mode === 'tour') { startWalk(camera.position.clone(), camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()))); } });
addEventListener('pointerup', () => drag = null);
addEventListener('pointermove', e => { if (!drag) return; yaw -= (e.clientX - drag.x) * 0.004; pitch = Math.max(-1.2, Math.min(1.2, pitch - (e.clientY - drag.y) * 0.004)); drag = { x: e.clientX, y: e.clientY }; applyLook(); });
addEventListener('keydown', e => { keys[e.code] = true; if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && mode === 'tour') startWalk(camera.position.clone(), camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()))); });
addEventListener('keyup', e => keys[e.code] = false);
document.querySelectorAll('[data-hold]').forEach(b => {
  const k = b.dataset.hold; const on = e => { e.preventDefault(); keys[k] = true; if (mode === 'tour') startWalk(camera.position.clone(), camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()))); }, off = () => keys[k] = false;
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off);
});
const ROOMS = { living: [P(3.7, 6.7), V(1.2, 1.15, 4.3)], kitchen: [P(1.4, 6.9), V(3.0, 1.0, 10.0)], bedroom: [P(4.5, 2.75), V(1.6, 0.9, 0.5)], bath: [P(6.15, 6.55), V(7.2, 0.9, 4.9)], wc: [P(5.95, 4.45), V(7.3, 0.8, 3.75)], hall: [P(5.25, 12.6), V(5.0, 1.45, 8.0)] };
document.querySelectorAll('[data-room]').forEach(b => b.addEventListener('click', () => { const r = ROOMS[b.dataset.room]; startWalk(r[0].clone(), r[1]); }));
document.getElementById('tourBtn').addEventListener('click', startTour);
function ui() { document.body.dataset.mode = mode; document.getElementById('tourBtn').setAttribute('aria-pressed', mode === 'tour'); }

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === 'tour') {
    tt = (tt + dt / TOUR_SEC) % 1; const e = tt;
    camera.position.copy(posCurve.getPointAt(e)); look.copy(tgtCurve.getPointAt(e)); camera.lookAt(look); setLook(camera.position, look);
  } else {
    const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    if (keys.ArrowLeft) { yaw += dt * 1.6; applyLook(); } if (keys.ArrowRight) { yaw -= dt * 1.6; applyLook(); }
    if (f || s) { const sp = 1.4 * dt, fw = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)), rt = new THREE.Vector3(-fw.z, 0, fw.x);
      camera.position.addScaledVector(fw, f * sp).addScaledVector(rt, s * sp); collide(camera.position); camera.position.y = EYE; }
  }
  composer.render(); requestAnimationFrame(frame);
}
ready.then(() => { document.body.classList.add('loaded'); });
camera.position.copy(TOUR[0][0]); camera.lookAt(TOUR[0][1]); setLook(TOUR[0][0], TOUR[0][1]);
ui(); frame();
window.NEO = { renderOnce: () => composer.render(), camera, startWalk, startTour, ROOMS, setT: v => { tt = v; }, P };
