import init, { MandelEngine } from "./pkg/rust_m.js";

let engine = null;
let wasmMemory = null;

export async function initMandel(width, height, maxIter) {
  const wasm = await init();
  wasmMemory = wasm.memory;
  engine = MandelEngine.new(width, height, maxIter);
  return { engine, memory: wasmMemory };
}

// Structure unifiée de la session de rendu
export const RenderConfig = {
  mode: "MANDELBROT", // ou 'JULIA'
  width: 600,
  height: 600,
  maxIter: 500,
  mandelBounds: { xmin: -2.0, xmax: 0.7, ymin: -1.35, ymax: 1.35 },
  juliaBounds: { xmin: -2.0, xmax: 2.0, ymin: -2.0, ymax: 2.0 },
  targetC: { x: -0.7, y: 0.27015 }, // Le point c sélectionné pour Julia
  paletteLut: null,
};

export function renderMandelToCanvas(
  ctx,
  xmin,
  xmax,
  ymin,
  ymax,
  width,
  height,
) {
  if (!engine) return;

  // Allocation du buffer dans la mémoire partagée Wasm
  const byteLength = width * height * 4;
  const ptr = engine.render_dem_alloc
    ? engine.render_dem_alloc(byteLength)
    : null;

  // Création d'un tableau JS pointant sur la mémoire Wasm
  const pixelArray = new Uint8ClampedArray(width * height * 4);

  engine.render_dem(xmin, xmax, ymin, ymax, pixelArray);

  // Injection directe dans le Canvas
  const imgData = new ImageData(pixelArray, width, height);
  ctx.putImageData(imgData, 0, 0);
}

// Fonction pour superposer l'orbite sur le Canvas
export function drawOrbitOverlay(ctx, cx, cy, bounds, width, height) {
  let zx = 0.0;
  let zy = 0.0;

  ctx.strokeStyle = "#ff3366"; // Ligne rose fluo
  ctx.fillStyle = "#ffff00"; // Points jaunes
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  for (let i = 0; i < 200; i++) {
    // Conversion Coordonnées Complexes -> Pixels Canvas
    const px = ((zx - bounds.xmin) / (bounds.xmax - bounds.xmin)) * width;
    const py = ((zy - bounds.ymin) / (bounds.ymax - bounds.ymin)) * height;

    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }

    // Trace un petit carré sur chaque itération
    ctx.fillRect(px - 2, py - 2, 4, 4);

    const r2 = zx * zx + zy * zy;
    if (r2 > 100.0) break; // Arrêt en cas d'évasion

    const new_zx = zx * zx - zy * zy + cx;
    zy = 2.0 * zx * zy + cy;
    zx = new_zx;
  }
  ctx.stroke();
}

export function getOrbitData(cx, cy) {
  if (!engine) return "";
  return engine.compute_orbit_csv(cx, cy);
}
