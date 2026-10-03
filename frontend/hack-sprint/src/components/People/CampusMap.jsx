import React, { useMemo } from "react";

// A static axonometric site plan of the campus, drawn as a fine line drawing
// straight on the page background: buildings with real window bays, roofs and
// shadows, tree-lined roads, groves and woodland, a ring plaza, parking, a
// stadium and a pond. Six buildings are the clickable "fields".
const VW = 1300;
const VH = 780;
const X0 = 650;
const Y0 = 78;
const K = 0.66;
const FLOOR = 14;

const proj = (gx, gy, gz = 0) => [X0 + (gx - gy) * 0.866 * K, Y0 + (gx + gy) * 0.5 * K - gz * K];
const unproj = (sx, sy) => {
  const u = (sx - X0) / (0.866 * K), v = (sy - Y0) / (0.5 * K);
  return [(u + v) / 2, (v - u) / 2];
};
const f1 = (n) => n.toFixed(1);
const pt = (p) => `${f1(p[0])},${f1(p[1])}`;
const poly = (pts) => pts.map(pt).join(" ");
const mulberry = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ── the plan ────────────────────────────────────────────────────────────────
const ROADS = [
  [[50, 50], [950, 50]], [[950, 50], [950, 950]], [[950, 950], [50, 950]], [[50, 950], [50, 50]],
  [[50, 420], [950, 420]], [[50, 760], [950, 760]], [[250, 50], [250, 760]], [[750, 50], [750, 760]], [[500, 490], [500, 950]],
];
const ROAD_HW = 11;

const BOXES = [
  { id: "dev-quarter", x0: 775, y0: 150, x1: 925, y1: 215, f: 5, win: "ribbon", plant: 3 },
  { id: "dev-quarter", x0: 775, y0: 215, x1: 835, y1: 330, f: 4, win: "ribbon", plant: 1 },
  { id: "product-boardroom", x0: 462, y0: 130, x1: 538, y1: 206, f: 12, win: "curtain", tower: true },
  { id: "robotics-workshop", x0: 80, y0: 480, x1: 232, y1: 580, f: 2, win: "punch", saw: true },
  { id: "design-studio", x0: 90, y0: 800, x1: 240, y1: 870, f: 3, win: "punch", gable: true },
  { id: "design-studio", x0: 90, y0: 870, x1: 150, y1: 930, f: 3, win: "punch", gable: true, ridgeY: true },
  { id: "cloud-vault", x0: 775, y0: 480, x1: 915, y1: 570, f: 4, win: "slit", dishes: true },
  { x0: 280, y0: 100, x1: 450, y1: 190, f: 5, win: "ribbon", plant: 3 },
  { x0: 560, y0: 110, x1: 720, y1: 190, f: 2, win: "punch", gable: true },
  { x0: 290, y0: 250, x1: 420, y1: 340, f: 3, win: "punch", plant: 2 },
  { x0: 580, y0: 250, x1: 720, y1: 350, f: 3, win: "ribbon", plant: 2 },
  { x0: 775, y0: 350, x1: 925, y1: 405, f: 5, win: "punch", plant: 2 },
  { x0: 270, y0: 450, x1: 400, y1: 500, f: 5, win: "punch", plant: 2 },
  { x0: 270, y0: 500, x1: 322, y1: 640, f: 5, win: "punch", plant: 2 },
  { x0: 270, y0: 640, x1: 400, y1: 690, f: 5, win: "punch", plant: 2 },
  { x0: 610, y0: 560, x1: 730, y1: 680, f: 3, win: "ribbon", plant: 2 },
  { x0: 770, y0: 800, x1: 860, y1: 870, f: 1, win: "curtain", glass: true },
  { x0: 80, y0: 80, x1: 230, y1: 130, f: 2, win: "punch", gable: true },
  { x0: 615, y0: 445, x1: 725, y1: 520, f: 3, win: "ribbon", plant: 1 },
  { x0: 80, y0: 150, x1: 120, y1: 190, f: 2, win: "punch" },
];
const CYLS = [
  { id: "ai-lab", cx: 160, cy: 230, r: 58, f: 3, dome: true },
  { cx: 560, cy: 470, r: 13, f: 1 }, { cx: 440, cy: 470, r: 13, f: 1 },
];
const PARKING = [[80, 610, 240, 740], [780, 610, 920, 740], [560, 790, 720, 930]];
const FIELD = [290, 790, 470, 910];
const POND = { cx: 880, cy: 880, rx: 62, ry: 38 };
const PLAZA = { cx: 500, cy: 420, r: 85 };

const LABELS = {
  "dev-quarter": { name: "Dev Quarter", at: [850, 182, 5 * FLOOR + 22] },
  "ai-lab": { name: "AI Lab", at: [160, 230, 3 * FLOOR + 62] },
  "robotics-workshop": { name: "Robotics Workshop", at: [156, 530, 2 * FLOOR + 30] },
  "design-studio": { name: "Design Studio", at: [165, 835, 3 * FLOOR + 46] },
  "product-boardroom": { name: "Product Boardroom", at: [500, 168, 12 * FLOOR + 30] },
  "cloud-vault": { name: "Cloud & Security Vault", at: [845, 525, 4 * FLOOR + 40] },
};

// ── geometry helpers ────────────────────────────────────────────────────────
const rectGround = (x0, y0, x1, y1) => [proj(x0, y0), proj(x1, y0), proj(x1, y1), proj(x0, y1)];
const ellipseGround = (cx, cy, rx, ry, n = 48) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return proj(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); });

const insideBox = (gx, gy, m) => {
  if (BOXES.some((b) => gx > b.x0 - m && gx < b.x1 + m && gy > b.y0 - m && gy < b.y1 + m)) return true;
  if (CYLS.some((c) => Math.hypot(gx - c.cx, gy - c.cy) < c.r + m)) return true;
  if (PARKING.some(([a, b, c, d]) => gx > a - m && gx < c + m && gy > b - m && gy < d + m)) return true;
  if (gx > FIELD[0] - m - 30 && gx < FIELD[2] + m && gy > FIELD[1] - m && gy < FIELD[3] + m) return true;
  if (Math.hypot(gx - PLAZA.cx, gy - PLAZA.cy) < PLAZA.r + 24 + m) return true;
  if (Math.hypot((gx - POND.cx) / (POND.rx + m), (gy - POND.cy) / (POND.ry + m)) < 1) return true;
  return ROADS.some(([[ax, ay], [bx, by]]) => gx > Math.min(ax, bx) - ROAD_HW - m && gx < Math.max(ax, bx) + ROAD_HW + m && gy > Math.min(ay, by) - ROAD_HW - m && gy < Math.max(ay, by) + ROAD_HW + m);
};

// walls: right wall faces +gx (u runs along gy), left wall faces +gy (u runs along gx)
const wallPoint = (b, side, u, z) => (side === "R" ? proj(b.x1, u, z) : proj(u, b.y1, z));
const wallRange = (b, side) => (side === "R" ? [b.y0, b.y1] : [b.x0, b.x1]);

const windowsFor = (b, side) => {
  const [u0, u1] = wallRange(b, side);
  const h = b.f * FLOOR;
  let outline = "", detail = "";
  const quad = (ua, ub, za, zb) => `M${pt(wallPoint(b, side, ua, za))}L${pt(wallPoint(b, side, ub, za))}L${pt(wallPoint(b, side, ub, zb))}L${pt(wallPoint(b, side, ua, zb))}Z`;
  const lo = b.tower || b.glass ? 0 : 1;
  if (b.win === "curtain") {
    for (let i = 0; i < b.f; i++) outline += quad(u0 + 3, u1 - 3, i * FLOOR + 2, (i + 1) * FLOOR - 2);
    for (let u = u0 + 3 + 6; u < u1 - 3; u += 6) detail += `M${pt(wallPoint(b, side, u, 2))}L${pt(wallPoint(b, side, u, h - 2))}`;
  } else if (b.win === "ribbon") {
    for (let i = lo; i < b.f; i++) {
      outline += quad(u0 + 5, u1 - 5, i * FLOOR + 4, i * FLOOR + 11);
      for (let u = u0 + 5 + 12; u < u1 - 6; u += 12) detail += `M${pt(wallPoint(b, side, u, i * FLOOR + 4))}L${pt(wallPoint(b, side, u, i * FLOOR + 11))}`;
    }
  } else if (b.win === "slit") {
    for (let i = lo; i < b.f; i++) for (let u = u0 + 10; u < u1 - 10; u += 22) outline += quad(u, u + 5, i * FLOOR + 3, i * FLOOR + 12);
  } else {
    for (let i = lo; i < b.f; i++) for (let u = u0 + 8; u < u1 - 12; u += 14) {
      outline += quad(u, u + 8, i * FLOOR + 3.5, i * FLOOR + 11);
      detail += `M${pt(wallPoint(b, side, u + 4, i * FLOOR + 3.5))}L${pt(wallPoint(b, side, u + 4, i * FLOOR + 11))}`;
    }
  }
  return { outline, detail };
};

const shadeLines = (b) => {
  const h = b.f * FLOOR;
  let d = "";
  for (let y = b.y0 + 1.6; y < b.y1; y += 2.6) d += `M${pt(proj(b.x1, y, 0))}L${pt(proj(b.x1, y, h))}`;
  return d;
};

const buildingParts = (b, rng) => {
  const h = b.f * FLOOR;
  const { x0, y0, x1, y1 } = b;
  const top = [proj(x0, y0, h), proj(x1, y0, h), proj(x1, y1, h), proj(x0, y1, h)];
  const right = [proj(x1, y0, 0), proj(x1, y1, 0), proj(x1, y1, h), proj(x1, y0, h)];
  const left = [proj(x0, y1, 0), proj(x1, y1, 0), proj(x1, y1, h), proj(x0, y1, h)];
  const winR = windowsFor(b, "R"), winL = windowsFor(b, "L");
  const shadow = [proj(x1, y0), proj(x1 + h * 0.34, y0 + h * 0.18), proj(x1 + h * 0.34, y1 + h * 0.18), proj(x1, y1)];
  const shadow2 = [proj(x0, y1), proj(x1, y1), proj(x1 + h * 0.34, y1 + h * 0.18), proj(x0 + h * 0.34, y1 + h * 0.18)];
  const roof = { lines: "", boxes: [], extra: null };
  const long = x1 - x0 >= y1 - y0;
  roof.lines = `M${pt(proj(x0 + 4, y0 + 4, h))}L${pt(proj(x1 - 4, y0 + 4, h))}L${pt(proj(x1 - 4, y1 - 4, h))}L${pt(proj(x0 + 4, y1 - 4, h))}Z`;
  if (!b.gable && !b.tower) {
    if (long) for (let y = y0 + 12; y < y1 - 6; y += 9) roof.lines += `M${pt(proj(x0 + 8, y, h))}L${pt(proj(x1 - 8, y, h))}`;
    else for (let x = x0 + 12; x < x1 - 6; x += 9) roof.lines += `M${pt(proj(x, y0 + 8, h))}L${pt(proj(x, y1 - 8, h))}`;
  }
  for (let i = 0; i < (b.plant || 0); i++) {
    const w = 9 + rng() * 9, d = 7 + rng() * 7, px = x0 + 12 + rng() * Math.max(1, x1 - x0 - 24 - w), py = y0 + 10 + rng() * Math.max(1, y1 - y0 - 20 - d), ph = 5 + rng() * 5;
    roof.boxes.push({ x0: px, y0: py, x1: px + w, y1: py + d, z0: h, z1: h + ph });
  }
  if (b.tower) {
    const px = (x0 + x1) / 2, py = (y0 + y1) / 2;
    roof.boxes.push({ x0: px - 16, y0: py - 14, x1: px + 16, y1: py + 14, z0: h, z1: h + 9 });
    roof.mast = [proj(px, py, h + 9), proj(px, py, h + 36)];
  }
  if (b.gable) {
    const rh = 12;
    if (!b.ridgeY) {
      const ym = (y0 + y1) / 2;
      roof.gable = {
        front: [proj(x0 - 2, ym, h + rh), proj(x1 + 2, ym, h + rh), proj(x1 + 2, y1 + 3, h), proj(x0 - 2, y1 + 3, h)],
        back: [proj(x0 - 2, y0 - 3, h), proj(x1 + 2, y0 - 3, h), proj(x1 + 2, ym, h + rh), proj(x0 - 2, ym, h + rh)],
        end: [proj(x1, y0, h), proj(x1, y1, h), proj(x1, ym, h + rh)],
      };
      let l = "";
      for (let x = x0 + 8; x < x1; x += 7) l += `M${pt(proj(x, ym, h + rh))}L${pt(proj(x, y1 + 3, h))}`;
      roof.gable.lines = l;
    } else {
      const xm = (x0 + x1) / 2;
      roof.gable = {
        front: [proj(xm, y0 - 2, h + rh), proj(xm, y1 + 2, h + rh), proj(x1 + 3, y1 + 2, h), proj(x1 + 3, y0 - 2, h)],
        back: [proj(x0 - 3, y0 - 2, h), proj(x0 - 3, y1 + 2, h), proj(xm, y1 + 2, h + rh), proj(xm, y0 - 2, h + rh)],
        end: [proj(x0, y1, h), proj(x1, y1, h), proj(xm, y1, h + rh)],
      };
      let l = "";
      for (let y = y0 + 8; y < y1; y += 7) l += `M${pt(proj(xm, y, h + rh))}L${pt(proj(x1 + 3, y, h))}`;
      roof.gable.lines = l;
    }
  }
  // entrance on the left wall
  const dx = (x0 + x1) / 2;
  const door = [proj(dx - 6, y1, 0), proj(dx + 6, y1, 0), proj(dx + 6, y1, 11), proj(dx - 6, y1, 11)];
  const canopy = [proj(dx - 10, y1, 13), proj(dx + 10, y1, 13), proj(dx + 10, y1 + 8, 13), proj(dx - 10, y1 + 8, 13)];
  const canopyF = [proj(dx - 10, y1 + 8, 13), proj(dx + 10, y1 + 8, 13), proj(dx + 10, y1 + 8, 11.5), proj(dx - 10, y1 + 8, 11.5)];
  return { top, right, left, winR, winL, shadow, shadow2, roof, door, canopy, canopyF, h, shade: shadeLines(b) };
};

const miniBox = (m) => ({
  left: [proj(m.x0, m.y1, m.z0), proj(m.x1, m.y1, m.z0), proj(m.x1, m.y1, m.z1), proj(m.x0, m.y1, m.z1)],
  right: [proj(m.x1, m.y0, m.z0), proj(m.x1, m.y1, m.z0), proj(m.x1, m.y1, m.z1), proj(m.x1, m.y0, m.z1)],
  top: [proj(m.x0, m.y0, m.z1), proj(m.x1, m.y0, m.z1), proj(m.x1, m.y1, m.z1), proj(m.x0, m.y1, m.z1)],
});

const cylParts = (c) => {
  const h = c.f * FLOOR, n = 48;
  const ring = (z, r = c.r) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return proj(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, z); });
  const front = (z) => ring(z).filter((_, i) => { const a = (i / n) * Math.PI * 2; return Math.cos(a) + Math.sin(a) > -0.02; });
  const top = ring(h), bot = ring(0);
  const xs = top.map((p) => p[0]), minI = xs.indexOf(Math.min(...xs)), maxI = xs.indexOf(Math.max(...xs));
  const frontBot = front(0);
  const silhouette = [...top, ...frontBot.slice().reverse()];
  let lines = `M${pt(top[minI])}L${pt(bot[minI])}M${pt(top[maxI])}L${pt(bot[maxI])}`;
  for (let i = 1; i < c.f; i++) lines += `M${front(i * FLOOR).map(pt).join("L")}`;
  let win = "";
  for (let i = 0; i < c.f; i++) for (let k = 0; k < 36; k++) {
    const a0 = (k / 36) * Math.PI * 2, a1 = a0 + 0.1;
    if (Math.cos(a0) + Math.sin(a0) < 0.1 || Math.cos(a1) + Math.sin(a1) < 0.1) continue;
    const z0 = i * FLOOR + 3.5, z1 = z0 + 7.5, P = (a, z) => proj(c.cx + Math.cos(a) * c.r, c.cy + Math.sin(a) * c.r, z);
    win += `M${pt(P(a0, z0))}L${pt(P(a1, z0))}L${pt(P(a1, z1))}L${pt(P(a0, z1))}Z`;
  }
  const cen = proj(c.cx, c.cy, h), rx = c.r * 1.2247 * K, ry = c.r * 0.7071 * K;
  let dome = null;
  if (c.dome) {
    const dh = c.r * 0.95 * K;
    dome = {
      sil: `M${f1(cen[0] - rx)},${f1(cen[1])}A${f1(rx)},${f1(dh)} 0 0 1 ${f1(cen[0] + rx)},${f1(cen[1])}A${f1(rx)},${f1(ry)} 0 0 1 ${f1(cen[0] - rx)},${f1(cen[1])}Z`,
      mer: [0.38, 0.72].map((k) => `M${f1(cen[0] - rx * k)},${f1(cen[1] + ry * Math.sqrt(1 - k * k) * 0.0)}A${f1(rx * k)},${f1(dh)} 0 0 1 ${f1(cen[0] + rx * k)},${f1(cen[1])}`).join("") + `M${f1(cen[0])},${f1(cen[1] - dh)}L${f1(cen[0])},${f1(cen[1] + ry)}`,
      lat: [0.35, 0.65].map((k) => `M${f1(cen[0] - rx * Math.sqrt(1 - k * k))},${f1(cen[1] - dh * k)}A${f1(rx * Math.sqrt(1 - k * k))},${f1(ry * Math.sqrt(1 - k * k))} 0 0 0 ${f1(cen[0] + rx * Math.sqrt(1 - k * k))},${f1(cen[1] - dh * k)}`).join(""),
      slit: `M${f1(cen[0] + rx * 0.2)},${f1(cen[1] - dh * 0.92)}L${f1(cen[0] + rx * 0.5)},${f1(cen[1] - dh * 0.1)}`,
    };
  }
  return { silhouette, top, lines, win, dome, shadow: [proj(c.cx + c.r, c.cy - c.r * 0.4), proj(c.cx + c.r + h * 0.34, c.cy - c.r * 0.4 + h * 0.18), proj(c.cx + c.r + h * 0.34, c.cy + c.r * 0.8 + h * 0.18), proj(c.cx + c.r * 0.6, c.cy + c.r * 0.8)] };
};

// ── trees: canopy blob + trunk + shaded side, drawn as line art ──────────────
const treeParts = (x, y, r, rng, forceKind) => {
  const conifer = forceKind ? forceKind === "conifer" : rng() < 0.22;
  const trunkW = Math.max(1.2, r * 0.13);
  const ticks = [0.25, 0.5, 0.75].map((t) => `M${f1(x - trunkW + 0.3)},${f1(y + r * (0.9 + 0.5 * t))}l${f1(trunkW * 0.8)},1.4`).join("");
  const shadow = `M${f1(x + r * 0.2)},${f1(y + r * 1.32)}h${f1(r * 1.25)}M${f1(x + r * 0.45)},${f1(y + r * 1.46)}h${f1(r * 1.0)}M${f1(x + r * 0.7)},${f1(y + r * 1.6)}h${f1(r * 0.7)}`;

  if (conifer) {
    const apex = [x, y - r * 1.4];
    const tiers = [[0.5, -0.45], [0.8, 0.1], [1.05, 0.62]];
    let right = [apex], left = [apex];
    tiers.forEach(([w, yy], i) => {
      const prevW = i ? tiers[i - 1][0] * 0.62 : 0.12;
      right.push([x + r * w, y + r * yy], [x + r * prevW, y + r * yy]);
      left.push([x - r * w, y + r * yy], [x - r * prevW, y + r * yy]);
    });
    const last = tiers[tiers.length - 1];
    const outline = [...right.slice(0, -1), [x + r * last[0], y + r * last[1]], [x - r * last[0], y + r * last[1]], ...left.slice(0, -1).reverse()];
    let hatch = "";
    for (let t = 0.12; t < 0.95; t += 0.13) hatch += `M${f1(x + r * t)},${f1(y - r * 1.4 + t * r * 1.5)}L${f1(x + r * t)},${f1(y + r * 0.58)}`;
    let tierLines = "";
    tiers.slice(0, 2).forEach(([w, yy]) => { tierLines += `M${f1(x - r * w * 0.85)},${f1(y + r * yy - 1)}Q${f1(x)},${f1(y + r * yy + r * 0.2)} ${f1(x + r * w * 0.85)},${f1(y + r * yy - 1)}`; });
    return { kind: "conifer", canopy: `M${outline.map(pt).join("L")}Z`, hatch, leaf: tierLines, contour: "", branches: "", trunk: `M${f1(x - trunkW)},${f1(y + r * 0.62)}L${f1(x - trunkW)},${f1(y + r * 1.4)}M${f1(x + trunkW)},${f1(y + r * 0.62)}L${f1(x + trunkW)},${f1(y + r * 1.4)}M${f1(x - trunkW)},${f1(y + r * 1.4)}L${f1(x + trunkW)},${f1(y + r * 1.4)}${ticks}`, shadow };
  }

  // broadleaf: scalloped crown made of overlapping lobes
  const lobes = 6 + Math.floor(rng() * 2), phase = rng() * Math.PI * 2, N = 64;
  const rho = (a) => r * (0.84 + 0.2 * Math.abs(Math.sin((lobes * a) / 2 + phase)));
  const crown = Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [x + Math.cos(a) * rho(a), y + Math.sin(a) * rho(a) * 0.88]; });
  // contour bands that follow the lobes, only on the shaded lower-right side
  let contour = "";
  [0.8, 0.62].forEach((k) => {
    const pts = [];
    for (let i = 0; i <= 26; i++) { const a = -0.25 + (i / 26) * 2.3; pts.push([x + Math.cos(a) * rho(a) * k + r * 0.04, y + Math.sin(a) * rho(a) * 0.88 * k + r * 0.03]); }
    contour += `M${pts.map(pt).join("L")}`;
  });
  // leaf clumps (small scallops) scattered over the lit upper-left
  let leaf = "";
  const clumps = Math.round(r * 0.9);
  for (let i = 0; i < clumps; i++) {
    const a = Math.PI * (0.95 + rng() * 0.95), d = r * (0.18 + rng() * 0.58), cr = r * (0.1 + rng() * 0.07);
    const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d * 0.85;
    leaf += `M${f1(cx - cr)},${f1(cy)}A${f1(cr)},${f1(cr)} 0 0 1 ${f1(cx + cr)},${f1(cy)}`;
  }
  let hatch = "";
  for (let dd = r * 0.2; dd < r * 0.92; dd += Math.max(2, r * 0.15)) {
    const half = Math.sqrt(Math.max(0, r * r - dd * dd)) * 0.9, cx = x + Math.SQRT1_2 * dd, cy = y + Math.SQRT1_2 * dd * 0.88;
    hatch += `M${f1(cx - Math.SQRT1_2 * half)},${f1(cy + Math.SQRT1_2 * half * 0.88)}L${f1(cx + Math.SQRT1_2 * half)},${f1(cy - Math.SQRT1_2 * half * 0.88)}`;
  }
  // limbs seen through the lower crown
  const by = y + r * 0.8;
  const branches = `M${f1(x)},${f1(by)}L${f1(x - r * 0.3)},${f1(y + r * 0.28)}M${f1(x)},${f1(by)}L${f1(x + r * 0.28)},${f1(y + r * 0.22)}M${f1(x - r * 0.3)},${f1(y + r * 0.28)}L${f1(x - r * 0.5)},${f1(y + r * 0.05)}M${f1(x + r * 0.28)},${f1(y + r * 0.22)}L${f1(x + r * 0.46)},${f1(y)}`;
  return {
    kind: "leaf",
    canopy: `M${crown.map(pt).join("L")}Z`,
    hatch, leaf, contour, branches,
    trunk: `M${f1(x - trunkW)},${f1(y + r * 0.82)}Q${f1(x - trunkW * 0.8)},${f1(y + r * 1.2)} ${f1(x - trunkW * 1.6)},${f1(y + r * 1.45)}M${f1(x + trunkW)},${f1(y + r * 0.82)}Q${f1(x + trunkW * 0.8)},${f1(y + r * 1.2)} ${f1(x + trunkW * 1.6)},${f1(y + r * 1.45)}${ticks}`,
    shadow,
  };
};

const noise = (() => {
  const r = mulberry(5), g = Array.from({ length: 64 }, () => r());
  const at = (i, j) => g[((i * 7 + j * 13) & 63 + 64) % 64];
  return (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, s = (t) => t * t * (3 - 2 * t);
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
    return a + (b - a) * s(fx) + (c - a) * s(fy) * (1 - s(fx)) + (d - b) * s(fx) * s(fy) + (c - a) * 0;
  };
})();

const buildForest = () => {
  const rng = mulberry(33);
  const out = [];
  for (let i = 0; i < 9000 && out.length < 560; i++) {
    const sx = 10 + rng() * (VW - 20), sy = 10 + rng() * (VH - 20);
    if ((sx < 350 && sy < 130) || (sx > 400 && sx < 900 && sy > VH - 46)) continue;
    const [gx, gy] = unproj(sx, sy);
    const dx = Math.max(0, -gx, gx - 1000), dy = Math.max(0, -gy, gy - 1000), dist = Math.hypot(dx, dy);
    if (dist < 34) continue; // clear strip around the campus
    const groves = noise(gx / 190 + 3, gy / 190 + 5);
    if (groves < 0.36 && dist < 260) continue;
    const r = 9 + rng() * 6;
    if (out.some(([x, y, rr]) => Math.hypot(x - sx, (y - sy) * 1.1) < (r + rr) * 0.78)) continue;
    out.push([sx, sy, r]);
  }
  return out.sort((a, b) => a[1] - b[1]);
};

const buildCampusTrees = () => {
  const rng = mulberry(71);
  const out = [];
  // avenues just inside the perimeter road and along the main axis
  for (let t = 96; t < 910; t += 34) { [[t, 76], [t, 924], [76, t], [924, t]].forEach(([gx, gy]) => { if (!insideBox(gx, gy, 4)) out.push({ gx, gy, r: 8.5 }); }); }
  for (let t = 530; t < 930; t += 40) { out.push({ gx: 478, gy: t, r: 8.5 }); out.push({ gx: 522, gy: t, r: 8.5 }); }
  // groves on open lawns
  for (let i = 0; i < 1400 && out.length < 150; i++) {
    const gx = 70 + rng() * 860, gy = 70 + rng() * 860;
    if (insideBox(gx, gy, 20)) continue;
    if (out.some((o) => Math.hypot(o.gx - gx, o.gy - gy) < 36)) continue;
    out.push({ gx, gy, r: 8 + rng() * 3.5 });
  }
  return out;
};

const rounded = (pts, rad = 22) => {
  let d = `M${pt(proj(...pts[0]))}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py), l2 = Math.hypot(nx - cx, ny - cy);
    const a = [cx - ((cx - px) / l1) * Math.min(rad, l1 / 2), cy - ((cy - py) / l1) * Math.min(rad, l1 / 2)];
    const b = [cx + ((nx - cx) / l2) * Math.min(rad, l2 / 2), cy + ((ny - cy) / l2) * Math.min(rad, l2 / 2)];
    d += `L${pt(proj(...a))}Q${pt(proj(cx, cy))} ${pt(proj(...b))}`;
  }
  return d + `L${pt(proj(...pts[pts.length - 1]))}`;
};

const css = `
.cmap { --ink: var(--foreground); --paper: var(--background); --route: var(--primary); }
.cmap .ln { fill: none; stroke: var(--ink); stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.cmap .f { fill: var(--paper); stroke: var(--ink); stroke-width: 1; stroke-linejoin: round; transition: fill .18s ease; vector-effect: non-scaling-stroke; }
.cmap .hv { fill: url(#cm-hatch); stroke: none; opacity: .5; }
.cmap .win { fill: var(--paper); stroke: var(--ink); stroke-width: .5; vector-effect: non-scaling-stroke; }
.cmap .bld { cursor: pointer; outline: none; }
.cmap .bld:hover .f, .cmap .bld:focus-visible .f, .cmap .bld.on .f { fill: color-mix(in srgb, var(--route) 20%, var(--paper)); }
.cmap .bld:hover .win, .cmap .bld:focus-visible .win, .cmap .bld.on .win { fill: color-mix(in srgb, var(--route) 12%, var(--paper)); }
.cmap .lab { font: 700 12px 'Plus Jakarta Sans', system-ui, sans-serif; fill: var(--ink); pointer-events: none; letter-spacing: .01em; }
.cmap .labbg { fill: var(--paper); stroke: var(--ink); stroke-width: .9; vector-effect: non-scaling-stroke; transition: stroke .18s, fill .18s; }
.cmap .leader { stroke: var(--ink); stroke-width: .8; vector-effect: non-scaling-stroke; }
.cmap .bld:hover .labbg, .cmap .bld:focus-visible .labbg, .cmap .bld.on .labbg { stroke: var(--route); fill: color-mix(in srgb, var(--route) 12%, var(--paper)); }
.cmap .bld:hover .lab, .cmap .bld:focus-visible .lab, .cmap .bld.on .lab { fill: var(--route); }
`;

const BoxMini = ({ m }) => {
  const k = miniBox(m);
  return <g><polygon className="f" points={poly(k.left)} /><polygon className="f" points={poly(k.right)} /><polygon className="f" points={poly(k.top)} /></g>;
};

const Tree = ({ p }) => (
  <g>
    <path className="ln" strokeWidth=".7" opacity=".5" d={p.shadow} />
    <path className="ln" strokeWidth=".85" d={p.trunk} />
    <path className="f" d={p.canopy} />
    <path className="ln" strokeWidth=".4" opacity=".5" d={p.hatch} />
    {p.contour && <path className="ln" strokeWidth=".45" opacity=".5" d={p.contour} />}
    <path className="ln" strokeWidth=".5" opacity=".65" d={p.leaf} />
    {p.branches && <path className="ln" strokeWidth=".55" opacity=".55" d={p.branches} />}
  </g>
);

const Building = ({ b, seed }) => {
  const rng = mulberry(seed);
  const k = buildingParts(b, rng);
  const sawTeeth = b.saw ? [0, 1, 2, 3].map((n) => ({ x0: b.x0 + 12 + n * 34, x1: b.x0 + 12 + n * 34 + 26, y0: b.y0 + 8, y1: b.y1 - 8 })) : [];
  return (
    <g>
      <polygon className="hv" points={poly(k.shadow)} />
      <polygon className="hv" points={poly(k.shadow2)} />
      <polygon className="f" points={poly(k.left)} />
      <polygon className="f" points={poly(k.right)} />
      <path className="ln" strokeWidth=".45" opacity=".55" d={k.shade} />
      <path className="win" d={k.winR.outline} />
      <path className="win" d={k.winL.outline} />
      <path className="ln" strokeWidth=".4" opacity=".6" d={k.winR.detail} />
      <path className="ln" strokeWidth=".4" opacity=".6" d={k.winL.detail} />
      <polygon className="f" points={poly(k.canopy)} />
      <polygon className="win" points={poly(k.door)} />
      <polygon className="f" points={poly(k.top)} />
      {!b.gable && <path className="ln" strokeWidth=".55" opacity=".55" d={k.roof.lines} />}
      {b.gable && k.roof.gable && (
        <g>
          <polygon className="f" points={poly(k.roof.gable.end)} />
          <polygon className="f" points={poly(k.roof.gable.back)} />
          <polygon className="f" points={poly(k.roof.gable.front)} />
          <path className="ln" strokeWidth=".5" opacity=".55" d={k.roof.gable.lines} />
        </g>
      )}
      {sawTeeth.map((t, i) => {
        const z0 = k.h, z1 = k.h + 13;
        return (
          <g key={i}>
            <polygon className="f" points={poly([proj(t.x0, t.y1, z0), proj(t.x1, t.y1, z0), proj(t.x1, t.y1, z1)])} />
            <polygon className="f" points={poly([proj(t.x1, t.y0, z0), proj(t.x1, t.y1, z0), proj(t.x1, t.y1, z1), proj(t.x1, t.y0, z1)])} />
            <polygon className="f" points={poly([proj(t.x0, t.y0, z0), proj(t.x1, t.y0, z1), proj(t.x1, t.y1, z1), proj(t.x0, t.y1, z0)])} />
          </g>
        );
      })}
      {k.roof.boxes.sort((a, c) => a.x0 + a.y0 - c.x0 - c.y0).map((m, i) => <BoxMini key={i} m={m} />)}
      {k.roof.mast && <path className="ln" strokeWidth="1.2" d={`M${pt(k.roof.mast[0])}L${pt(k.roof.mast[1])}`} />}
      {b.dishes && [[800, 505], [845, 540], [893, 510]].map(([dx, dy], i) => {
        const ring = Array.from({ length: 22 }, (_, q) => { const a = (q / 22) * Math.PI * 2; return proj(dx + Math.cos(a) * 10, dy + Math.sin(a) * 10, k.h + 8); });
        return <g key={i}><path className="ln" strokeWidth="1" d={`M${pt(proj(dx, dy, k.h))}L${pt(proj(dx, dy, k.h + 8))}`} /><polygon className="f" points={poly(ring)} /><path className="ln" strokeWidth=".7" d={`M${pt(proj(dx - 10, dy, k.h + 8))}L${pt(proj(dx, dy, k.h + 2))}L${pt(proj(dx + 10, dy, k.h + 8))}`} /></g>;
      })}
    </g>
  );
};

const Cylinder = ({ c }) => {
  const k = cylParts(c);
  return (
    <g>
      <polygon className="hv" points={poly(k.shadow)} />
      <polygon className="f" points={poly(k.silhouette)} />
      <path className="ln" strokeWidth=".45" opacity=".6" d={k.lines} />
      <path className="win" d={k.win} />
      <polygon className="f" points={poly(k.top)} />
      {k.dome && (
        <g>
          <path className="f" d={k.dome.sil} />
          <path className="ln" strokeWidth=".6" opacity=".7" d={k.dome.mer} />
          <path className="ln" strokeWidth=".6" opacity=".6" d={k.dome.lat} />
          <path className="ln" strokeWidth="1.3" d={k.dome.slit} />
        </g>
      )}
    </g>
  );
};

const CampusMap = ({ districts, activeId, onSelect }) => {
  const forest = useMemo(buildForest, []);
  const forestParts = useMemo(() => { const r = mulberry(4); return forest.map(([x, y, rad]) => ({ x, y, rad, p: treeParts(x, y, rad, r) })); }, [forest]);
  const campusTrees = useMemo(() => { const r = mulberry(9); return buildCampusTrees().map((t) => { const [x, y] = proj(t.gx, t.gy); return { ...t, key: t.gx + t.gy, p: treeParts(x, y - t.r * 0.9, t.r, r) }; }); }, []);

  const route = [
    rounded([[500, 945], [500, 505]]),
    rounded([[428, 420], [250, 420], [250, 520], [236, 530]]),
    rounded([[572, 420], [750, 420], [750, 240], [772, 226]]),
    rounded([[572, 420], [750, 420], [750, 525], [772, 525]]),
    rounded([[500, 345], [500, 232]]),
    rounded([[428, 420], [330, 380], [250, 300], [205, 262]]),
    rounded([[500, 760], [250, 760], [250, 820], [238, 836]]),
  ].join(" ");

  const roadRects = ROADS.map(([[ax, ay], [bx, by]]) => [Math.min(ax, bx) - ROAD_HW, Math.min(ay, by) - ROAD_HW, Math.max(ax, bx) + ROAD_HW, Math.max(ay, by) + ROAD_HW]);
  const centerLines = ROADS.map(([[ax, ay], [bx, by]]) => `M${pt(proj(ax, ay))}L${pt(proj(bx, by))}`).join("");

  const byId = Object.fromEntries(districts.map((d) => [d.id, d]));
  const depth = (b) => (b.x0 + b.x1 + b.y0 + b.y1) / 2 + (b.tower ? 70 : 0);
  const entries = [
    ...BOXES.map((b, i) => ({ t: "box", b, id: b.id, key: depth(b), i })),
    ...CYLS.map((c, i) => ({ t: "cyl", c, id: c.id, key: c.cx + c.cy, i })),
    ...campusTrees.map((tr, i) => ({ t: "tree", tr, key: tr.key, i })),
  ];
  const fieldIds = Object.keys(LABELS);
  const plain = entries.filter((e) => e.t === "tree" || !e.id);
  const fieldGroups = fieldIds.map((id) => {
    const parts = entries.filter((e) => e.id === id);
    return { t: "field", id, parts, key: Math.min(...parts.map((p) => p.key)) };
  });
  const ordered = [...plain, ...fieldGroups].sort((a, b) => a.key - b.key);

  const renderEntry = (e) => {
    if (e.t === "box") return <Building key={`b${e.i}`} b={e.b} seed={e.i + 3} />;
    if (e.t === "cyl") return <Cylinder key={`c${e.i}`} c={e.c} />;
    if (e.t === "tree") return <Tree key={`t${e.i}`} p={e.tr.p} />;
    return null;
  };

  const fieldNode = (g) => {
    const d = byId[g.id], [lx, ly, lz] = LABELS[g.id].at, [sx, sy] = proj(lx, ly, lz), text = LABELS[g.id].name, w = text.length * 6.6 + 26;
    return (
      <g
        key={g.id}
        className={`bld ${g.id === activeId ? "on" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={d ? `${d.name}: ${d.tagline}` : text}
        onClick={() => onSelect(g.id)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(g.id))}
      >
        {g.parts.map((p) => renderEntry(p))}
        <g transform={`translate(${f1(sx)} ${f1(sy)})`}>
          <path className="leader" d="M0,0V14" />
          <rect className="labbg" x={-w / 2} y={-22} width={w} height={22} rx={4} />
          <text className="lab" textAnchor="middle" y={-7}>{text}</text>
        </g>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" className="cmap block w-full h-full" role="group" aria-label="HackSprint campus plan">
      <style>{css}</style>
      <defs>
        <pattern id="cm-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--foreground)" strokeWidth="0.7" />
        </pattern>
      </defs>

      {/* woodland */}
      {forestParts.map((t, i) => <Tree key={i} p={t.p} />)}

      {/* site, roads (outline layer then paper layer so crossings merge) */}
      <polygon className="f" points={poly(rectGround(24, 24, 976, 976))} style={{ strokeDasharray: "1.5 3.5" }} />
      {roadRects.map(([a, b, c, d], i) => <polygon key={`o${i}`} points={poly(rectGround(a, b, c, d))} style={{ fill: "var(--ink)", stroke: "var(--ink)", strokeWidth: 0.8, vectorEffect: "non-scaling-stroke" }} />)}
      {roadRects.map(([a, b, c, d], i) => <polygon key={`i${i}`} points={poly(rectGround(a + 1.1, b + 1.1, c - 1.1, d - 1.1))} style={{ fill: "var(--paper)" }} />)}
      <path className="ln" strokeWidth=".6" opacity=".45" strokeDasharray="5 5" d={centerLines} />

      {/* plaza */}
      <polygon className="f" points={poly(ellipseGround(PLAZA.cx, PLAZA.cy, PLAZA.r + 22, PLAZA.r + 22))} />
      <polygon className="f" points={poly(ellipseGround(PLAZA.cx, PLAZA.cy, PLAZA.r - 8, PLAZA.r - 8))} />
      {[0.42, 0.7].map((k) => <polygon key={k} className="ln" strokeWidth=".6" opacity=".6" points={poly(ellipseGround(PLAZA.cx, PLAZA.cy, PLAZA.r * k, PLAZA.r * k))} />)}
      {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2; return <path key={i} className="ln" strokeWidth=".5" opacity=".55" d={`M${pt(proj(500 + Math.cos(a) * 34, 420 + Math.sin(a) * 34))}L${pt(proj(500 + Math.cos(a) * 77, 420 + Math.sin(a) * 77))}`} />; })}
      {/* the HackSprint mark, laid flat on the plaza in the same projection as the ground */}
      <polygon className="f" points={poly(ellipseGround(PLAZA.cx, PLAZA.cy, 34, 34))} />
      <g transform={`matrix(${0.866 * K} ${0.5 * K} ${-0.866 * K} ${0.5 * K} ${X0} ${Y0})`}>
        <defs><clipPath id="cm-logo"><circle cx={PLAZA.cx} cy={PLAZA.cy} r="29" /></clipPath></defs>
        <image href="/hackSprint.webp" x={PLAZA.cx - 29} y={PLAZA.cy - 29} width="58" height="58" clipPath="url(#cm-logo)" preserveAspectRatio="xMidYMid slice" />
        <circle cx={PLAZA.cx} cy={PLAZA.cy} r="29" fill="none" stroke="var(--ink)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      </g>

      {/* parking */}
      {PARKING.map(([a, b, c, d], i) => {
        let cars = "", lines = "";
        for (let y = b + 8; y < d - 14; y += 22) for (let x = a + 8; x < c - 12; x += 11) {
          cars += `M${pt(proj(x, y))}L${pt(proj(x + 7, y))}L${pt(proj(x + 7, y + 13))}L${pt(proj(x, y + 13))}Z`;
          lines += `M${pt(proj(x + 1.5, y + 4))}L${pt(proj(x + 5.5, y + 4))}`;
        }
        return <g key={i}><polygon className="f" points={poly(rectGround(a, b, c, d))} /><path className="ln" strokeWidth=".55" opacity=".7" d={cars} /><path className="ln" strokeWidth=".4" opacity=".5" d={lines} /></g>;
      })}

      {/* stadium: track, pitch, stands */}
      <polygon className="f" points={poly(rectGround(...FIELD))} />
      <polygon className="f" points={poly(rectGround(FIELD[0] + 16, FIELD[1] + 14, FIELD[2] - 16, FIELD[3] - 14))} />
      <polygon className="ln" strokeWidth=".6" opacity=".6" points={poly(rectGround(FIELD[0] + 26, FIELD[1] + 24, FIELD[2] - 26, FIELD[3] - 24))} />
      <path className="ln" strokeWidth=".6" opacity=".6" d={`M${pt(proj((FIELD[0] + FIELD[2]) / 2, FIELD[1] + 24))}L${pt(proj((FIELD[0] + FIELD[2]) / 2, FIELD[3] - 24))}`} />
      <polygon className="ln" strokeWidth=".6" opacity=".6" points={poly(ellipseGround((FIELD[0] + FIELD[2]) / 2, (FIELD[1] + FIELD[3]) / 2, 18, 18, 28))} />
      {[0, 1, 2, 3].map((i) => {
        const x = FIELD[0] - 6 - i * 5, z0 = i * 4, z1 = z0 + 4;
        return <g key={i}><polygon className="f" points={poly([proj(x, FIELD[1] + 10, z0), proj(x - 5, FIELD[1] + 10, z0), proj(x - 5, FIELD[3] - 10, z0), proj(x, FIELD[3] - 10, z0)])} /><polygon className="f" points={poly([proj(x, FIELD[1] + 10, z0), proj(x, FIELD[3] - 10, z0), proj(x, FIELD[3] - 10, z1), proj(x, FIELD[1] + 10, z1)])} /></g>;
      })}

      {/* pond with ripples and a boardwalk */}
      <polygon className="f" points={poly(ellipseGround(POND.cx, POND.cy, POND.rx + 8, POND.ry + 8))} />
      <polygon className="f" points={poly(ellipseGround(POND.cx, POND.cy, POND.rx, POND.ry))} />
      {[-18, -9, 0, 9, 18].map((o) => <path key={o} className="ln" strokeWidth=".5" opacity=".55" d={`M${pt(proj(POND.cx - 38 + Math.abs(o), POND.cy + o))}L${pt(proj(POND.cx + 38 - Math.abs(o), POND.cy + o))}`} />)}

      {/* route */}
      <path className="ln" style={{ stroke: "var(--route)", strokeWidth: 2.6 }} d={route} />
      <polygon className="ln" style={{ stroke: "var(--route)", strokeWidth: 2.6 }} points={poly(ellipseGround(PLAZA.cx, PLAZA.cy, 72, 72))} />

      {/* buildings and trees, far to near */}
      {ordered.map((e) => (e.t === "field" ? fieldNode(e) : renderEntry(e)))}
    </svg>
  );
};

export default CampusMap;
