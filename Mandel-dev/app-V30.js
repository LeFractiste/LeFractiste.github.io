import { initMandel, renderMandelToCanvas, getOrbitData } from "./mandel.js";

const width = 800;
const height = 600;
const maxIter = 500;

// Limites de vue initiale
let bounds = { xmin: -2.0, xmax: 0.7, ymin: -1.2, ymax: 1.2 };

const canvas = document.getElementById("mandelCanvas");
const ctx = canvas.getContext("2d");
const exportBtn = document.getElementById("exportBtn");
const statusDiv = document.getElementById("status");

async function main() {
  canvas.width = width;
  canvas.height = height;

  statusDiv.textContent = "Chargement de Wasm...";
  await initMandel(width, height, maxIter);
  statusDiv.textContent = "Prêt. Calcul DEM en cours...";

  // Premier rendu DEM
  render();

  // Survol de la souris pour capturer le point c
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const cx = bounds.xmin + (px / width) * (bounds.xmax - bounds.xmin);
    const cy = bounds.ymin + (py / height) * (bounds.ymax - bounds.ymin);

    statusDiv.textContent = `Point c = (${cx.toFixed(5)}, ${cy.toFixed(5)}i)`;
    canvas.dataset.currentCx = cx;
    canvas.dataset.currentCy = cy;
  });

  // Clic pour exporter les données d'orbites
  exportBtn.addEventListener("click", () => {
    const cx = parseFloat(canvas.dataset.currentCx || -0.7);
    const cy = parseFloat(canvas.dataset.currentCy || 0.27);

    const csvData = getOrbitData(cx, cy);

    // Copie directe dans le presse-papier au format TSV (séparateur tabulations)
    navigator.clipboard.writeText(csvData).then(() => {
      alert(
        `Données de l'orbite pour c=(${cx.toFixed(4)}, ${cy.toFixed(4)}) copiées ! Colle-les directement dans Google Sheets (Ctrl+V).`,
      );
    });
  });
}

function render() {
  console.time("Rendu Wasm DEM");
  renderMandelToCanvas(
    ctx,
    bounds.xmin,
    bounds.xmax,
    bounds.ymin,
    bounds.ymax,
    width,
    height,
  );
  console.timeEnd("Rendu Wasm DEM");
}

main();
