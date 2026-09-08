import { PaletteEditor } from "./palette.js";
import { cFractParam, cImage, MandelController } from "./mandel.js"; //V4.0

/** Configuration
//const WIDTH = 500;
//const HEIGHT = 500;

// État de l'application
const mandelParam = new cFractParam(-0.65, 0.0, 2.7, 2.7, 500, 100000.0);
let targetC = { x: -0.7, y: 0.27015 };
let lockedC = { x: -0.7, y: 0.27015 };

// Éléments DOM & Objets Rendu
const mandelCanvas = document.getElementById("mandelCanvas");
const ctxMandel = mandelCanvas.getContext("2d");
const mandelImage = new cImage(mandelCanvas);

const controller = new MandelController(WIDTH, HEIGHT);
let palette = null;

// --- FONCTIONS DE DESSIN UI ---

function drawMandel() {
  // 1. Rendu pixels
  const imgData = mandelImage.renderToImageData(palette);
  ctxMandel.putImageData(imgData, 0, 0);

  // 2. Overlay UI : Réticule vert
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



// --- ATTACHEMENT DES ÉVÉNEMENTS ---

function setupEventListeners() {
  // Survol Canvas Mandelbrot
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
      drawMandel(); // Seul le réticule a besoin d'être redessiné
    }
  });

  // Clic : Verrouillage c
  mandelCanvas.addEventListener("click", (e) => {
    const rect = mandelCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const c = mandelParam.pixelToComplex(px, py, WIDTH, HEIGHT);
    lockedC = { x: c.re, y: c.im };
    targetC = { ...lockedC };

    drawMandel();
  });

  // Zoom Molette
  mandelCanvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.8 : 1.25;

    const rect = mandelCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const mouseC = mandelParam.pixelToComplex(px, py, WIDTH, HEIGHT);
    mandelParam.center.re =
      mouseC.re + (mandelParam.center.re - mouseC.re) * zoomFactor;
    mandelParam.center.im =
      mouseC.im + (mandelParam.center.im - mouseC.im) * zoomFactor;
    mandelParam.span.re *= zoomFactor;
    mandelParam.span.im *= zoomFactor;

    updateAndRenderMandel();
  });

  // Export CSV
  const btnCopy = document.getElementById("btnCopyCsv");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const csv = controller.computeOrbitCsv(
        lockedC.x,
        lockedC.y,
        mandelParam.max_iter,
      );
      if (csv) {
        navigator.clipboard.writeText(csv);
        const status = document.getElementById("csvStatus");
        if (status) {
          status.innerText = `Orbite pour c = (${lockedC.x.toFixed(4)}, ${lockedC.y.toFixed(4)}) copiée !`;
          setTimeout(() => (status.innerText = ""), 3000);
        }
      }
    });
  }
}

// --- INITIALISATION PROPRE (Au chargement du DOM) ---

async function initApp() {
  await controller.initWasm();

  palette = new PaletteEditor("paletteContainer", () => {
    drawMandel(); // Redessine instantanément depuis le buffer attaché
  });

  setupEventListeners();
  updateAndRenderMandel();
}

// Démarrage dès que le HTML est prêt
window.addEventListener("DOMContentLoaded", initApp);
*/
