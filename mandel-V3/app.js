import init, { MandelEngine } from "./pkg/rust_m.js";
import { PaletteEditor } from "./palette.js";

// Variables globales
let engine = null;
const width = 500;
const height = 500;
const maxIter = 500;

// Allocation unique du buffer de pixels
const pixels = new Uint8Array(width * height * 4);

async function run() {
  await init();

  // 1. Instanciation explicite de l'objet Rust - petits soucis!
  // Tente l'instanciation via la méthode statique .new() si la classe brute échoue
  try {
    engine = MandelEngine.new(width, height, maxIter);
  } catch (e) {
    engine = new MandelEngine(width, height, maxIter);
  }
  console.log("Instance Engine créée :", engine);

  // 2. Domaines complexes & Points c
  let mBounds = { xmin: -2.0, xmax: 0.7, ymin: -1.35, ymax: 1.35 };
  let jBounds = { xmin: -2.0, xmax: 2.0, ymin: -2.0, ymax: 2.0 };
  let targetC = { x: -0.7, y: 0.27015 };
  let lockedC = { x: -0.7, y: 0.27015 };

  // 3. Récupération des éléments DOM
  const mandelCanvas = document.getElementById("mandelCanvas");
  const juliaCanvas = document.getElementById("juliaCanvas");
  const ctxMandel = mandelCanvas.getContext("2d");
  const ctxJulia = juliaCanvas.getContext("2d");

  // 4. Initialisation de la Palette
  const palette = new PaletteEditor("paletteContainer", () => {
    renderAll();
  });

  // 5. Fonctions de Rendu interne
  function renderMandel() {
    if (!engine || !engine.__wbg_ptr) return;

    engine.render_dem(
      mBounds.xmin,
      mBounds.xmax,
      mBounds.ymin,
      mBounds.ymax,
      pixels,
    );

    const imgData = new ImageData(
      new Uint8ClampedArray(
        pixels.buffer,
        pixels.byteOffset,
        pixels.byteLength,
      ),
      width,
      height,
    );
    ctxMandel.putImageData(imgData, 0, 0);

    // Repère du point c sur Mandelbrot
    const px =
      ((targetC.x - mBounds.xmin) / (mBounds.xmax - mBounds.xmin)) * width;
    const py =
      ((targetC.y - mBounds.ymin) / (mBounds.ymax - mBounds.ymin)) * height;
    ctxMandel.strokeStyle = "#00ff00";
    ctxMandel.lineWidth = 1.5;
    ctxMandel.beginPath();
    ctxMandel.arc(px, py, 5, 0, 2 * Math.PI);
    ctxMandel.stroke();
  }

  function renderJulia() {
    if (!engine || !engine.__wbg_ptr) return;

    engine.render_julia_dem(
      targetC.x,
      targetC.y,
      jBounds.xmin,
      jBounds.xmax,
      jBounds.ymin,
      jBounds.ymax,
      pixels,
    );

    const imgData = new ImageData(
      new Uint8ClampedArray(
        pixels.buffer,
        pixels.byteOffset,
        pixels.byteLength,
      ),
      width,
      height,
    );
    ctxJulia.putImageData(imgData, 0, 0);
  }

  function renderAll() {
    renderMandel();
    renderJulia();
  }

  // 6. Gestionnaires d'événements Utilisateur (Interactions)
  mandelCanvas.addEventListener("mousemove", (e) => {
    const rect = mandelCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const cx = mBounds.xmin + (px / width) * (mBounds.xmax - mBounds.xmin);
    const cy = mBounds.ymin + (py / height) * (mBounds.ymax - mBounds.ymin);

    document.getElementById("mandelPos").innerText =
      `c = ${cx.toFixed(6)} + ${cy.toFixed(6)}i`;

    // Si le bouton de la souris n'est pas enfoncé, mise à jour dynamique de la Julia au survol
    if (!e.buttons) {
      targetC = { x: cx, y: cy };
      document.getElementById("juliaPos").innerText =
        `Target c = ${cx.toFixed(6)} + ${cy.toFixed(6)}i`;
      renderAll();
    }
  });

  // Clic pour verrouiller le point c
  mandelCanvas.addEventListener("click", (e) => {
    const rect = mandelCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    lockedC.x = mBounds.xmin + (px / width) * (mBounds.xmax - mBounds.xmin);
    lockedC.y = mBounds.ymin + (py / height) * (mBounds.ymax - mBounds.ymin);
    targetC = { ...lockedC };

    renderAll();
  });

  // Copie CSV de l'orbite verrouillée
  const btnCopy = document.getElementById("btnCopyCsv");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const csv = engine.compute_orbit_csv(lockedC.x, lockedC.y);
      navigator.clipboard.writeText(csv);
      const status = document.getElementById("csvStatus");
      if (status) {
        status.innerText = `Orbite pour c = (${lockedC.x.toFixed(4)}, ${lockedC.y.toFixed(4)}) copiée !`;
        setTimeout(() => (status.innerText = ""), 3000);
      }
    });
  }

  // Premier rendu au démarrage
  renderAll();
}

run();
