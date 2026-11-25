// Banner isométrico "fábrica de dados" do README, feito com o kit da skill anatomy.
// Gera ../fabrica-dark.svg e ../fabrica-light.svg. Como rodar: ver README.md desta pasta.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const k = await import(process.env.ANATOMY_KIT ?? "/anatomy/kit/iso-kit.mjs");
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..");
const W = 960, H = 330;

// Mundo: x ao longo da esteira (fluxo), y negativo = fundo, z para cima.
const FLOOR = { x: -262, y: -90, w: 534, d: 136, r: 10 };
const FLOOR_H = 8;
const BELT = { x: -205, y: -13, w: 395, d: 26, r: 4 };
const BELT_Z = 26, BELT_T = 5;
const TOP = BELT_Z + BELT_T;
const ST = { inspect: -130, press: -45, robot: 45, panel: 120 };

const P = k.fitProjection(
  [...k.boxCorners(FLOOR, -FLOOR_H - 4, 0), [ST.press, 0, 112], [ST.robot, -50, 92]],
  W, H - 70, { pad: 16, azimuth: 63 },
);
P.origin[1] += 30;
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const halo = (plan) => `<path class="iso-halo" d="${k.haloOf(plan, 0, 0.1, P)}"/>`;

// Animação: grupos com classe CSS; deslocamentos isométricos viram vetores de tela.
const r2 = (n) => Math.round(n * 100) / 100;
const vec = (dx, dy, dz) => { const a = at([0, 0, 0]), b = at([dx, dy, dz]); return [r2(b[0] - a[0]), r2(b[1] - a[1])]; };
const move = (cls, inner, [tx, ty], delay = 0) =>
  `<g class="${cls}" style="--tx:${tx}px;--ty:${ty}px;animation-delay:${r2(delay)}s">${inner}</g>`;
const pivot = (cls, inner, pt, delay = 0) =>
  `<g class="${cls}" style="transform-origin:${r2(pt[0])}px ${r2(pt[1])}px;animation-delay:${r2(delay)}s">${inner}</g>`;
const ANIM_CSS = `
.a-crate{animation:a-slide 6s linear infinite}
.a-ram,.a-grip,.a-lens{animation:a-push 2s ease-in-out infinite}
.a-grip{animation-duration:4s}
.a-lens{animation:a-sweep 4s ease-in-out infinite}
.a-needle{animation:a-swing 3s ease-in-out infinite}
.a-bar{animation:a-grow 3s ease-in-out infinite}
.a-blink{animation:a-blink 2s ease-in-out infinite}
@keyframes a-slide{0%{transform:translate(0,0);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translate(var(--tx),var(--ty));opacity:0}}
@keyframes a-push{0%,35%,100%{transform:translate(0,0)}55%,65%{transform:translate(var(--tx),var(--ty))}}
@keyframes a-sweep{0%,100%{transform:translate(calc(var(--tx) * -1),calc(var(--ty) * -1))}50%{transform:translate(var(--tx),var(--ty))}}
@keyframes a-swing{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(16deg)}}
@keyframes a-grow{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.7)}}
@keyframes a-blink{0%,100%{opacity:1}50%{opacity:0.35}}
@media (prefers-reduced-motion:reduce){.a-crate,.a-ram,.a-grip,.a-lens,.a-needle,.a-bar,.a-blink{animation:none}}
`;

function floor() {
  const o = [`<path class="iso-halo" d="${k.haloOf(FLOOR, -FLOOR_H - 4, FLOOR_H, P)}"/>`];
  for (const [x, y] of k.corners(FLOOR, 18).sort((a, b) => depth(...a) - depth(...b))) {
    o.push(S(k.cylinder(x, y, 6, -FLOOR_H - 4, 4, P, 24), { tone: "lo" }));
  }
  o.push(S(k.slabOf(FLOOR, -FLOOR_H, FLOOR_H, P, 8, 1.6), { tone: "mid" }));
  o.push(L(k.planOutline(k.insetPlan(FLOOR, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(FLOOR, 10);
  o.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  o.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  // régua do corredor da frente
  const lane = { x: FLOOR.x + 14, y: 31, w: FLOOR.w - 120, d: 5, r: 1 };
  o.push(S(k.slabOf(lane, 0, 0.5, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(lane.x + 4, lane.x + lane.w - 4, 5, 5, lane.y + 0.6, 0.5, [1.6, 3], P);
  o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  o.push(D([at([lane.x + 2, lane.y + 2.5, 0.5]), at([lane.x + lane.w - 2, lane.y + 2.5, 0.5])], { size: 0.45 }));
  // placa de identificação com três linhas gravadas
  const plate = { x: FLOOR.x + FLOOR.w - 96, y: 24, w: 80, d: 18, r: 1.5 };
  o.push(S(k.slabOf(plate, 0, 0.8, P, 3), { tone: "lo" }));
  o.push(k.faceTextSvg(k.topMatrix([plate.x + 5, plate.y + 7], 0.8, P, "x"), "FÁBRICA DE DADOS", { size: 3.6, tone: "mid" }));
  o.push(k.faceTextSvg(k.topMatrix([plate.x + 5, plate.y + 12], 0.8, P, "x"), "F. PIMENTEL · FEIRA DE SANTANA-BA", { size: 2.2, tone: "lo" }));
  o.push(L(k.lineOnTop([plate.x + 5, plate.y + 15.5], [plate.x + plate.w - 5, plate.y + 15.5], 0.8, P), { tone: "faint", free: true }));
  o.push(D(k.corners(plate, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  return o.join("");
}

function beltFrame() {
  const o = [];
  const legs = [];
  for (const x of [BELT.x + 10, -120, -40, 40, 120, BELT.x + BELT.w - 10]) for (const y of [BELT.y + 3, BELT.y + BELT.d - 3]) legs.push([x, y]);
  legs.sort((a, b) => depth(...a) - depth(...b));
  for (const [x, y] of legs) o.push(S(k.slabOf({ x: x - 2, y: y - 2, w: 4, d: 4, r: 0.6 }, 0, BELT_Z, P, 2), { tone: "lo", crease: "none" }));
  o.push(S(k.slabOf(BELT, BELT_Z, BELT_T, P, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(BELT, BELT_Z + 2, P), { tone: "faint" }) }));
  const band = k.insetPlan(BELT, 3);
  o.push(L(k.planOutline(band, TOP, P), { tone: "lo" }));
  const ribs = [];
  for (let x = band.x + 6; x < band.x + band.w - 3; x += 7) ribs.push(k.lineOnTop([x, band.y], [x, band.y + band.d], TOP, P));
  o.push(L(ribs.join(""), { tone: "faint" }));
  o.push(k.faceTextSvg(k.sideMatrix([BELT.x + 18, BELT.y + BELT.d, TOP - 1.4], TOP - 1.4, P, "left"), "ENTRADA ›››", { size: 2.6, tone: "lo" }));
  o.push(k.faceTextSvg(k.sideMatrix([BELT.x + BELT.w - 52, BELT.y + BELT.d, TOP - 1.4], TOP - 1.4, P, "left"), "››› DECISÃO", { size: 2.6, tone: "lo" }));
  return o.join("");
}

// Caixa de dados: "raw" (bruta), "clean" (limpa) ou "shipped" (etiquetada e acesa).
function crate(x, y, z, kind, s = 12) {
  const plan = { x: x - s / 2, y: y - s / 2, w: s, d: s, r: kind === "raw" ? 0.4 : 1 };
  const tone = kind === "raw" ? "lo" : kind === "clean" ? "mid" : "hi";
  const zt = z + s * 0.8;
  const o = [S(k.slabOf(plan, z, s * 0.8, P, 3, kind === "raw" ? 0 : 0.5), { tone, lit: kind === "shipped" })];
  if (kind === "raw") {
    o.push(L(k.lineOnTop([plan.x, plan.y], [plan.x + s, plan.y + s], zt, P) + k.lineOnTop([plan.x, plan.y + s], [plan.x + s, plan.y], zt, P), { tone: "faint" }));
  } else {
    o.push(L(k.lineOnTop([plan.x, y], [plan.x + s, y], zt, P), { tone: "faint" }));
    o.push(L(k.sideSeam(plan, z + s * 0.4, P, 3), { tone: "faint" }));
  }
  if (kind === "shipped") o.push(`<g class="a-blink" style="animation-delay:${r2((x + y) / 40)}s">${D([at([x, y, zt])], { size: 0.6, tone: "hi" })}</g>`);
  return o.join("");
}

function pallet(pal) {
  const o = [halo(pal), S(k.slabOf(pal, 0, 4, P, 3), { tone: "lo" })];
  const slats = [];
  for (let i = 1; i < 4; i++) slats.push(k.lineOnTop([pal.x, pal.y + (i * pal.d) / 4], [pal.x + pal.w, pal.y + (i * pal.d) / 4], 4, P));
  o.push(L(slats.join(""), { tone: "faint" }));
  return o.join("");
}

// Estação 1: doca de entrada, palete com pilha de caixas brutas.
function dock() {
  const o = [pallet({ x: -254, y: -42, w: 40, d: 34, r: 1 })];
  const pile = [[-243, -33, 4], [-229, -33, 4], [-243, -19, 4], [-229, -19, 4], [-236, -26, 13.6], [-236, -26, 23.2]];
  for (const [x, y, z] of pile) o.push(crate(x, y, z, "raw", 12));
  return o.join("");
}

// Estação 2: inspeção, pórtico com lupa e prancheta PDCA.
function inspection(part) {
  const x = ST.inspect, o = [];
  const leg = (y) => S(k.slabOf({ x: x - 3, y, w: 6, d: 4, r: 0.8 }, 0, 74, P, 3), { tone: "mid" });
  if (part === "back") return leg(BELT.y - 9);
  o.push(leg(BELT.y + BELT.d + 5));
  const beam = { x: x - 4, y: BELT.y - 10, w: 8, d: BELT.d + 20, r: 1 };
  o.push(S(k.slabOf(beam, 74, 6, P, 3, 0.4), { tone: "mid" }));
  o.push(D([at([x, BELT.y - 6, 80]), at([x, BELT.y + BELT.d + 6, 80])], { size: 0.45 }));
  o.push(move("a-lens", [
    S(k.cylinder(x, 0, 1.2, 58, 16, P, 14), { tone: "mid", crease: "none" }),
    S(k.cylinder(x, 0, 9, 54, 4, P, 40, 0.4), { tone: "hi", crease: "lo" }),
    L(k.ring(x, 0, 6.8, 58, P, 40), { tone: "lo" }),
    L(k.lineOnTop([x - 4.5, 1], [x - 1, 4.5], 58, P), { tone: "lit", free: true }),
  ].join(""), vec(0, 6, 0)));
  // prancheta no pedestal, à frente da esteira
  const cb = { x: x - 24, y: BELT.y + BELT.d + 12, w: 18, d: 13, r: 1 };
  o.push(halo({ x: cb.x + 5, y: cb.y + 4, w: 6, d: 6, r: 3 }));
  o.push(S(k.slabOf({ x: cb.x + 7.5, y: cb.y + 5, w: 3, d: 3, r: 0.6 }, 0, 30, P, 2), { tone: "lo", crease: "none" }));
  o.push(S(k.slabOf(cb, 30, 1.6, P, 3), { tone: "mid" }));
  ["☑ PLAN", "☑ DO", "☑ CHECK", "☐ ACT"].forEach((t, i) => {
    o.push(k.faceTextSvg(k.topMatrix([cb.x + 2.5, cb.y + 3.4 + i * 2.8], 31.6, P, "x"), t, { size: 2, tone: i === 3 ? "hi" : "lo" }));
  });
  return o.join("");
}

// Estação 3: prensa SQL, duas colunas, travessa, cilindro, martelo e manômetro.
function press(part) {
  const x = ST.press, o = [];
  const post = (y) => S(k.cylinder(x, y, 4, 0, 96, P, 24), { tone: "mid" });
  if (part === "back") return post(BELT.y - 9);
  const fy = BELT.y + BELT.d + 9;
  o.push(post(fy));
  const beam = { x: x - 8, y: BELT.y - 15, w: 16, d: BELT.d + 30, r: 2 };
  o.push(S(k.slabOf(beam, 96, 12, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(beam, 102, P), { tone: "faint" }) }));
  o.push(D([[x - 4, BELT.y - 11], [x + 4, BELT.y - 11], [x - 4, fy + 2], [x + 4, fy + 2]].map(([a, b]) => at([a, b, 108])), { size: 0.45 }));
  o.push(k.faceTextSvg(k.sideMatrix([beam.x + 1.5, beam.y + beam.d, 101], 101, P, "left"), "SQL", { size: 3.6, tone: "mid" }));
  o.push(S(k.cylinder(x, 0, 6, 70, 26, P, 32, 0.4), { tone: "mid" }));
  o.push(L(k.sideArc(x, 0, 6, 82, P, 24), { tone: "faint" }));
  o.push(move("a-ram", [
    S(k.cylinder(x, 0, 2.2, 56, 14, P, 16), { tone: "hi", crease: "none", lit: true }),
    S(k.slabOf({ x: x - 9, y: -9, w: 18, d: 18, r: 1.5 }, 50, 6, P, 3, 0.5), { tone: "hi", lit: true }),
    L(k.planOutline({ x: x - 6, y: -6, w: 12, d: 12, r: 1 }, 56, P, 3), { tone: "lo" }),
  ].join(""), vec(0, 0, -10)));
  // manômetro preso na coluna da frente
  const g = [x + 7, fy];
  o.push(S(k.slabOf({ x: x + 3, y: fy - 1, w: 3, d: 2, r: 0.4 }, 60, 2, P, 2), { tone: "mid", crease: "none" }));
  o.push(S(k.cylinder(g[0], g[1], 4.5, 59, 2.5, P, 28), { tone: "hi", crease: "lo" }));
  const t = k.radialTicks(g[0], g[1], 3.6, 20, 5, 61.5, [0.6, 1.2], P, -2.2, 4.4);
  o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  o.push(L(k.lineOnTop(g, [g[0] + 2.6, g[1] - 2], 61.6, P), { tone: "lit", free: "end" }));
  o.push(D([at([g[0], g[1], 61.6])], { size: 0.45, tone: "hi" }));
  return o.join("");
}

// Estação 4: braço robótico Python, base atrás da esteira e braço sobre ela.
const RB = [ST.robot, -50];
function robot(part) {
  const [bx, by] = RB, o = [];
  if (part === "base") {
    o.push(halo({ x: bx - 17, y: by - 17, w: 34, d: 34, r: 17 }));
    o.push(S(k.cylinder(bx, by, 16, 0, 6, P, 48, 0.8), { tone: "lo" }));
    o.push(D(Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return at([bx + Math.cos(a) * 13, by + Math.sin(a) * 13, 6]); }), { size: 0.45 }));
    o.push(S(k.cylinder(bx, by, 11, 6, 10, P, 40, 0.6), { tone: "mid" }));
    o.push(L(k.knurl(bx, by, 11, 10, 16, 40, P), { tone: "faint" }));
    o.push(S(k.cylinder(bx, by, 7, 16, 58, P, 32), { tone: "mid", crease: "none" }));
    o.push(L([32, 50].map((z) => k.sideArc(bx, by, 7, z, P, 20)).join(""), { tone: "faint" }));
    o.push(S(k.cylinder(bx, by, 9.5, 74, 10, P, 36, 0.6), { tone: "mid" }));
    return o.join("");
  }
  const arm = { x: bx - 4, y: by - 3, w: 8, d: 53, r: 3 };
  o.push(S(k.slabOf(arm, 82, 7, P, 4, 0.6), { tone: "hi" }));
  o.push(k.faceTextSvg(k.topMatrix([bx - 2.5, by + 14], 89, P, "y"), "PYTHON", { size: 3.4, tone: "lo" }));
  o.push(D([at([bx, by + 4, 89]), at([bx, by + 44, 89])], { size: 0.5, tone: "mid" }));
  o.push(S(k.cylinder(bx, 0, 6, 76, 13, P, 32, 0.5), { tone: "mid" }));
  const grip = [
    S(k.cylinder(bx, 0, 2, 60, 16, P, 16), { tone: "hi", crease: "none" }),
    S(k.slabOf({ x: bx - 6, y: -4, w: 12, d: 8, r: 1 }, 57, 3, P, 3), { tone: "mid" }),
    ...[-5, 3].map((dx) => S(k.slabOf({ x: bx + dx, y: -3, w: 2, d: 6, r: 0.5 }, 45, 12, P, 2), { tone: "hi", lit: true })),
  ];
  o.push(move("a-grip", grip.join(""), vec(0, 0, -8), 0.5));
  return o.join("");
}

// Estação 5: painel de controle com mostradores, tela de barras e cabo até a esteira.
function panel() {
  const px = ST.panel, o = [];
  const cab = { x: px - 22, y: -80, w: 44, d: 26, r: 2 };
  o.push(halo(cab));
  o.push(S(k.slabOf(cab, 0, 46, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(cab, 22, P), { tone: "faint" }) }));
  o.push(S(k.slabOf({ x: cab.x - 2, y: cab.y + 1, w: cab.w + 4, d: cab.d + 2, r: 2 }, 46, 4, P, 4, 0.6), { tone: "mid" }));
  [[px - 13, 0.62], [px, 0.4], [px + 13, 0.92]].forEach(([x, share], i) => {
    const y = -66;
    o.push(S(k.cylinder(x, y, 5.4, 50, 2.4, P, 32, 0.3), { tone: "hi", crease: "lo" }));
    const t = k.radialTicks(x, y, 4.4, 24, 6, 52.4, [0.6, 1.3], P, -2.4, 4.8);
    o.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    const a = -2.4 + share * 4.8;
    o.push(pivot("a-needle", L(k.lineOnTop([x, y], [x + Math.sin(a) * 4, y - Math.cos(a) * 4], 52.5, P), { tone: i === 2 ? "lit" : "hi", free: "end" }), at([x, y, 52.5]), -i * 0.9));
    o.push(D([at([x, y, 52.5])], { size: 0.5, tone: "hi" }));
  });
  // tela com gráfico de barras na face frontal
  const fy = cab.y + cab.d;
  o.push(S(k.slabOf({ x: cab.x + 5, y: fy, w: 34, d: 0.8, r: 0.3 }, 24, 18, P, 2), { tone: "lo", crease: "none" }));
  [6, 9, 8, 13, 17, 23].forEach((h, i, all) => {
    const last = i === all.length - 1;
    const bar = S(k.slabOf({ x: cab.x + 8 + i * 5, y: fy + 0.8, w: 3.2, d: 0.6, r: 0 }, 26, h * 0.6, P, 1), { tone: last ? "hi" : "mid", crease: "none", lit: last });
    o.push(pivot("a-bar", bar, at([cab.x + 9.6 + i * 5, fy + 1.4, 26]), -i * 0.4));
  });
  o.push(D([cab.x + 9, cab.x + 15, cab.x + 21].map((x) => at([x, fy, 12])), { size: 1.1, tone: "hi" }));
  o.push(k.faceTextSvg(k.sideMatrix([cab.x + 27, fy, 13.5], 13.5, P, "left"), "KPI", { size: 3.4, tone: "mid" }));
  o.push(k.wireSvg(at([px - 6, fy, 4]), at([px - 6, BELT.y - 0.5, BELT_Z + 2.5]), { via: [at([px - 6, BELT.y - 7, 0.4])], tone: "lo", size: 1 }));
  return o.join("");
}

// Estação 6: expedição, caixas acesas com os resultados.
function shipping() {
  const o = [pallet({ x: 200, y: -38, w: 46, d: 36, r: 1 })];
  const spots = [[211, -28, 4], [227, -28, 4], [211, -12, 4], [227, -12, 4], [219, -20, 15.2]];
  for (const [x, y, z] of spots) o.push(crate(x, y, z, "shipped", 14));
  return o.join("");
}

// Ordem de pintura: fundo (y negativo) → esteira → o que está sobre ela, por x → frente.
const back = [
  { d: depth(...RB), svg: robot("base") },
  { d: depth(ST.panel, -67), svg: panel() },
  { d: depth(-236, -26), svg: dock() },
  { d: depth(ST.inspect, BELT.y - 7), svg: inspection("back") },
  { d: depth(ST.press, BELT.y - 9), svg: press("back") },
  { d: depth(223, -20), svg: shipping() },
].sort((a, b) => a.d - b.d).map((i) => i.svg);

const kinds = [[-185, "raw"], [-162, "raw"], [-100, "raw"], [-12, "clean"], [14, "clean"], [82, "clean"], [150, "shipped"], [172, "shipped"]];
const onBelt = [
  ...kinds.map(([x, kind], i) => ({ x, svg: move("a-crate", crate(x, 0, TOP, kind, 11), vec(14, 0, 0), -i * 0.75) })),
  { x: ST.inspect + 0.5, svg: inspection("front") },
  { x: ST.press + 0.5, svg: press("front") },
  { x: ST.robot + 0.5, svg: robot("arm") },
].sort((a, b) => a.x - b.x).map((i) => i.svg);

const mono = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const text = (x, y, s, anchor, color, weight, size) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" style="fill:var(--anatomy-${color});font:${weight} ${size}px ${mono}">${s}</text>`;
const frame = [
  `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" style="fill:var(--anatomy-card);stroke:var(--anatomy-shade-3)"/>`,
  text(26, 34, "Fig 1", "start", "muted", 400, 12),
  text(W - 26, 34, "Fábrica de dados", "end", "strong", 600, 14),
  text(26, H - 20, "entrada → inspeção → prensa SQL → braço Python → painel → expedição", "start", "muted", 400, 11),
  text(W - 26, H - 20, "R$ 120k/ano · déficit de R$ 800k/mês revertido · R$ 35k/mês", "end", "strong", 400, 11),
];

const label = "Ilustração isométrica de uma fábrica de dados: caixas de dados brutos saem de uma doca, passam por uma inspeção com lupa e checklist PDCA, por uma prensa SQL, por um braço robótico Python e por um painel de indicadores, e chegam acesas à expedição, onde viram resultados.";
const body = [...frame, floor(), ...back, beltFrame(), ...onBelt];
for (const theme of ["dark", "light"]) {
  const svg = k.figureSvg({ width: W, height: H, label, body, standalone: theme }).replace("</style>", `${ANIM_CSS}</style>`);
  writeFileSync(join(OUT, `fabrica-${theme}.svg`), svg);
}
console.log("ok");
