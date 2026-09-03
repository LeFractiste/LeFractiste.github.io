import init, { MandelEngine } from "./pkg/rust_m.js";
import { PaletteEditor } from "./palette.js";
import { cFractParam, cFractImage } from "./fractal_core.js";

// Configuration de base
const WIDTH = 500;
const HEIGHT = 500;
const PAYLOAD_SIZE = 5; // [iter, smooth_iter, z_re, z_im, angle_lut_idx]

let engine = null;
let wasmMemory = null;

async function run() {
  // 1. Initialisation Wasm et récupération du module mémoire
  const wasmModule = await init();
  wasmMemory = wasmModule.memory;

  // 2. Instanciation du moteur Rust V4
  try {
    engine = MandelEngine.new(WIDTH, HEIGHT);
  } catch (e) {
    engine = new MandelEngine(WIDTH, HEIGHT);
  }

  // 3. Objets de domaine et de buffer d'image (fractal_core.js)
  const mandelParam = new cFractParam(-0.65, 0.0, 2.7, 2.7, 500, 100000.0);
  const juliaParam = new cFractParam(0.0, 0.0, 4.0, 4.0, 500, 100000.0);

  const mandelImage = new cFractImage(WIDTH, HEIGHT, mandelParam);
  const juliaImage = new cFractImage(WIDTH, HEIGHT, juliaParam);

  // targetC : Le point 'c' actuellement visualisé dans le canvas Julia.
  // Il varie en temps réel quand la souris survole le canvas Mandelbrot.
  let targetC = { x: -0.7, y: 0.27015 };

  // lockedC : Le point 'c' mémorisé lors d'un CLIC sur Mandelbrot.
  // Il sert de point d'ancrage fixe (par exemple pour calculer/copier l'orbite CSV).
  let lockedC = { x: -0.7, y: 0.27015 };

  // 4. Éléments DOM & Contextes 2D
  const mandelCanvas = document.getElementById("mandelCanvas");
  const juliaCanvas = document.getElementById("juliaCanvas");
  const ctxMandel = mandelCanvas.getContext("2d");
  const ctxJulia = juliaCanvas.getContext("2d");

  // 5. Initialisation Éditeur de Palette
  const palette = new PaletteEditor("paletteContainer", () => {
    // Redessine instantanément à partir des buffers déjà calculés !
    drawMandelFromBuffer();
    drawJuliaFromBuffer();
  });

  // --- MOTEUR DE RENDU DÉCOUPLE ---

  // Obtient une vue Float32Array directe sur la mémoire Wasm sans copie
  function getWasmBufferSlice() {
    const ptr = engine.buffer_ptr();
    const bufferLength = WIDTH * HEIGHT * PAYLOAD_SIZE;
    return new Float32Array(wasmMemory.buffer, ptr, bufferLength);
  }

  // A. Calcul Mandelbrot + Rendu
  function computeAndRenderMandel() {
    if (!engine) return;

    // 1. Calcul lourd Rust (remplit le buffer Wasm)
    engine.compute_full(
      mandelParam.centerRe,
      mandelParam.centerIm,
      mandelParam.spanRe,
      mandelParam.spanIm,
      mandelParam.maxIter,
      mandelParam.r2Max,
    );

    // 2. Transmutation buffer Wasm -> cFractImage
    const rawBuffer = getWasmBufferSlice();
    mandelImage.attachBuffer(rawBuffer);

    // 3. Rendu pixels
    drawMandelFromBuffer();
  }

  // B. Rendu visuel Mandelbrot depuis le buffer (changement palette / visuel fast)
  function drawMandelFromBuffer() {
    const imgData = mandelImage.renderToImageData(palette);
    ctxMandel.putImageData(imgData, 0, 0);

    // Dessin du reticule / pointeur c
    const coords = mandelParam.complexToPixel(
      targetC.x,
      targetC.y,
      WIDTH,
      HEIGHT,
    );
    ctxMandel.strokeStyle = "#00ff00";
    ctxMandel.lineWidth = 1.5;
    ctxMandel.beginPath();
    ctxMandel.arc(coords.px, coords.py, 5, 0, 2 * Math.PI);
    ctxMandel.stroke();
  }

  // C. Calcul Julia + Rendu
  function computeAndRenderJulia() {
    if (!engine) return;
    return; // TODO 1: Activer le calcul Julia complet dans le moteur Rust V4

    // Note: Utilise compute_julia_full dans le moteur Rust si disponible
    if (typeof engine.compute_julia_full === "function") {
      engine.compute_julia_full(
        targetC.x,
        targetC.y,
        juliaParam.centerRe,
        juliaParam.centerIm,
        juliaParam.spanRe,
        juliaParam.spanIm,
        juliaParam.maxIter,
        juliaParam.r2Max,
      );
      const rawBuffer = getWasmBufferSlice();
      juliaImage.attachBuffer(rawBuffer);
    }
    drawJuliaFromBuffer();
  }

  function drawJuliaFromBuffer() {
    const imgData = juliaImage.renderToImageData(palette);
    ctxJulia.putImageData(imgData, 0, 0);
  }

  function renderAll() {
    computeAndRenderMandel();
    computeAndRenderJulia();
  }

  // --- GESTIONNAIRES D'ÉVÉNEMENTS & INTERACTION (ZOOM / SURVOL) ---

  // Survol Mandelbrot : mise à jour dynamic de Julia
  mandelCanvas.addEventListener("mousemove", (e) => {
    const rect = mandelCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const c = mandelParam.pixelToComplex(px, py, WIDTH, HEIGHT);

    const mandelPosElem = document.getElementById("mandelPos");
    if (mandelPosElem) {
      mandelPosElem.innerText = `c = ${c.re.toFixed(6)} + ${c.im.toFixed(6)}i`;
    }

    if (!e.buttons) {
      targetC = { x: c.re, y: c.im };
      const juliaPosElem = document.getElementById("juliaPos");
      if (juliaPosElem) {
        juliaPosElem.innerText = `Target c = ${c.re.toFixed(6)} + ${c.im.toFixed(6)}i`;
      }
      // Seul Julia et le viseur ont besoin d'être rafraîchis au survol
      drawMandelFromBuffer();
      computeAndRenderJulia();
    }
  });

  // Clic : Verrouillage du point c
  mandelCanvas.addEventListener("click", (e) => {
    const rect = mandelCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const c = mandelParam.pixelToComplex(px, py, WIDTH, HEIGHT);
    lockedC = { x: c.re, y: c.im };
    targetC = { ...lockedC };

    renderAll();
  });

  // Zoom Molette sur Mandelbrot (Ré-encodage Mandel-V2)
  mandelCanvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.8 : 1.25; // In = 0.8x span, Out = 1.25x span

    const rect = mandelCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Recentre progressivement vers le pointeur
    const mouseC = mandelParam.pixelToComplex(px, py, WIDTH, HEIGHT);
    mandelParam.centerRe =
      mouseC.re + (mandelParam.centerRe - mouseC.re) * zoomFactor;
    mandelParam.centerIm =
      mouseC.im + (mandelParam.centerIm - mouseC.im) * zoomFactor;
    mandelParam.spanRe *= zoomFactor;
    mandelParam.spanIm *= zoomFactor;

    computeAndRenderMandel();
  });

  // Export CSV de l'orbite (Option préservée)
  const btnCopy = document.getElementById("btnCopyCsv");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      if (typeof engine.compute_orbit_csv === "function") {
        const csv = engine.compute_orbit_csv(lockedC.x, lockedC.y);
        navigator.clipboard.writeText(csv);
        const status = document.getElementById("csvStatus");
        if (status) {
          status.innerText = `Orbite pour c = (${lockedC.x.toFixed(4)}, ${lockedC.y.toFixed(4)}) copiée !`;
          setTimeout(() => (status.innerText = ""), 3000);
        }
      }
    });
  }

  // Lancement initial
  renderAll();
}

run();
