// App.js - 4.2 - copyright LeFractiste 2026
// Seraitinspiré de Philippe Lhoste 2024 selon Copilot (Hei copi, t'es fou?)
// TODO 0: init by await mandel.initEngine(MandelEngine)
// TODO 2: Fast init

import { cFract } from "./mandel.js";
import { PaletteEditor } from "./palette.js";

// --- ÉTATS GLOBAUX ---
let mandel;
let julia;
let palette = null;
let lockedC = null; // Point c verrouillé par clic pour l'analyse d'orbite

// --- INITIALISATION DU MOTEUR & DE L'APPLICATION ---
async function startApp() {
  appConsole("Loading...");
  mandel = new cFract("mandelCanvas", "MANDELBROT", "mandelStatus");
  julia = new cFract("juliaCanvas", "JULIA", "juliaStatus");
  // Initialiser l'éditeur de Palette V2/V3 et son callback
  palette = new PaletteEditor("paletteContainer", (lut) => {
    mandel.cImage.updatePalette(lut);
    mandel.render();
    julia.cImage.updatePalette(lut);
    julia.render();
  });
  palette.generateLut();
  // Amorce de chaque cFract autonome
  await mandel.init(palette.lut);
  await julia.init(palette.lut);
  // Installer les écouteurs d'événements
  initEventListeners();
  appConsole("Ready");
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS (INTERACTION UX) ---
function initEventListeners() {
  const canvasM = mandel.canvas;
  const canvasJ = julia.canvas;
  // SURVOL DE MOUSE (Mandelbrot -> Orbite & Ligne de statut)
  canvasM.addEventListener("mousemove", (e) => {
    const rect = canvasM.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const mouseC = mandel.pixelToComplex({ x: px, y: py });
    // Met à jour la ligne de statut
    updateStatusBar("Mandel:", mouseC, px, py);
    // Calcul et affichage de l'orbite
    const orbit = mandel.directIter(mouseC);
    mandel.render();
    mandel.drawOrbitOverlay(orbit);
    julia.render();
    julia.drawOrbitOverlay(orbit);
    // Affiche le curseur
    //drawReticle(canvasM, px, py);
  });
  // JULIA: SURVOL DE MOUSE (Mise à jour Ligne de statut)
  canvasJ.addEventListener("mousemove", (e) => {
    const rect = canvasM.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const mouseC = julia.pixelToComplex({ x: px, y: py });
    // Mise à jour de Julia : non
    // Met à jour la ligne de statut
    updateStatusBar("Julia:", mouseC, px, py);
    // Affiche un curseur
    drawReticle(canvasJ, px, py);
  });
  // MANDEL: CLIC - Verrouillage lockedC & Export Orbite vers Sheets
  canvasM.addEventListener("click", (e) => {
    const rect = canvasM.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const targetC = mandel.pixelToComplex({ x: px, y: py });
    //Affiche le réticule
    lockedC = targetC;
    // Met à jour la ligne de statut
    updateStatusBar("Locked:", lockedC, px, py);
    drawReticle(canvasM, px, py);
    // Interaction: changer le paramètre de Julia sur ce point
    julia.setType("JULIA", lockedC);
  });
  // MANDEL: MOLETTE DE SOURIS (Zoom sous le curseur)
  canvasM.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvasM.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const zoomFactor = e.deltaY < 0 ? 0.8 : 1.25; // 0.8 = In, 1.25 = Out
    mandel.zoom(px, py, zoomFactor);
    // Rétablir le réticule si un point était verrouillé
    if (lockedC) {
      const reticlePx = mandel.complexToPixel(lockedC);
      drawReticle(canvasM, reticlePx.x, reticlePx.y);
    }
    // Met à jour la ligne de statut
    const c = mandel.pixelToComplex({ x: px, y: py });
    updateStatusBar("Zoom:", c, px, py);
  });
  //#new JULIA: MOLETTE DE SOURIS (Zoom sous le curseur)
  canvasJ.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvasJ.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const zoomFactor = e.deltaY < 0 ? 0.8 : 1.25; // 0.8 = In, 1.25 = Out
    julia.zoom(px, py, zoomFactor);
  });
  // MANDEL: BOUTON INTERFACE RESET ZOOM
  const btnResetM = document.getElementById("btnResetMandel");
  if (btnResetM) {
    btnResetM.addEventListener("click", () => {
      mandel.resetZoom();
      //lockedC = null; //mieux de garder le point visible
      if (lockedC) {
        const reticlePx = mandel.complexToPixel(lockedC);
        drawReticle(canvasM, reticlePx.x, reticlePx.y);
      }
    });
  }
  // JULIA: BOUTON INTERFACE RESET ZOOM
  const btnResetJ = document.getElementById("btnResetJulia");
  if (btnResetJ) {
    btnResetJ.addEventListener("click", () => {
      julia.resetZoom();
    });
  }
  // LISTBOX INTERFACE CALC MODE  //TODO 2: implement on html !
  const selectMode = document.getElementById("selectCalcMode");
  if (selectMode) {
    selectMode.addEventListener("change", (e) => {
      const mode = e.target.value; // 'DIRECT' ou 'DEM'
      mandel.setCalcMode(mode);
      julia.setCalcMode(mode);
      //mandel.render(); //auto
      //julia.render(); //auto
    });
  }
} /*initEventListeners*/

// ---Helpers---
//TODO 0 : réflexion d'architecture pour décider où ceci est implémenté !
//Si nous implémentons en rendu opengl rapide lors des transitions de souris,
//il faut passer par cImage au lieu de cFract (pas de calcul) et regénérer une image
// avec zoom, centrage, render, puis nouveau lockedC et orbite
// DESSIN DU RÉTICULE (Aide visuelle sur Mandelbrot)
function drawReticle(canvas, px, py) {
  // Rendre l'image de base pour effacer l'ancien réticule
  mandel.render();
  const ctx = canvas.getContext("2d");
  ctx.save();
  // Croix orthogonale
  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px - 10, py);
  ctx.lineTo(px + 10, py);
  ctx.moveTo(px, py - 10);
  ctx.lineTo(px, py + 10);
  ctx.stroke();
  // Cercle de ciblage
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, 2 * Math.PI);
  ctx.stroke();
  //affiche ?
  ctx.restore();
}

// BANDEAU D'INFORMATION ET STATUT
// TODO 1: en cours - séparation des statuts de App et cFract
function updateStatusBar(msg, c, px, py) {
  const appStatus = document.getElementById("appStatusBar");
  if (appStatus) {
    appStatus.textContent = `${msg} c = ${c.re.toFixed(7)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(7)}i  |  Px: (${Math.round(px)}, ${Math.round(py)})`;
  }
}
function appConsole(msg) {
  const appStatus = document.getElementById("appStatus");
  if (appStatus) {
    appStatus.textContent = `[INFO] ${msg} })`;
  }
}

//TODO 1: prendre la version de mandel
//CALCUL ET EXPORTATION D'ORBITE POUR GOOGLE SHEETS
function exportOrbitToSheets(c) {
  const maxIter = mandel.param.max_iter;
  let zRe = 0.0;
  let zIm = 0.0;
  // Formatage tabulaire (TSV) prêt à copier-coller dans Excel/Google Sheets
  let tsvContent = "n\tz_re\tz_im\t|z|^2\n";
  tsvContent += `0\t0.000000\t0.000000\t0.000000\n`;
  for (let n = 1; n <= maxIter; n++) {
    const nextRe = zRe * zRe - zIm * zIm + c.re;
    const nextIm = 2.0 * zRe * zIm + c.im;
    zRe = nextRe;
    zIm = nextIm;
    const mod2 = zRe * zRe + zIm * zIm;
    tsvContent += `${n}\t${zRe.toFixed(6)}\t${zIm.toFixed(6)}\t${mod2.toFixed(6)}\n`;
    if (mod2 > mandel.param.r2_max) break; // Évasion
  }
  // Copie dans le presse-papier
  navigator.clipboard
    .writeText(tsvContent)
    .then(() => {
      console.log(
        `[Orbites] Données pour c=(${c.re}, ${c.im}) copiées dans le presse-papier !`,
      );
      const statusEl = document.getElementById("statusBar");
      if (statusEl) {
        statusEl.textContent += `| [Orbite copiée dans le presse-papier]`;
      }
    })
    .catch((err) => {
      console.error("Erreur lors de la copie dans le presse-papier:", err);
    });
}

// Démarrage de l'application dès le chargement du DOM
window.addEventListener("DOMContentLoaded", startApp);
