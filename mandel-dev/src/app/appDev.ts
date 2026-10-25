// App.js - 4.7 dev - copyright LeFractiste 2026

/** @todo: passer aussi en ts ! */
// @ts-check

import { PaletteEditor } from "../pres/palette.js";
import { analysis_test } from "../analysis/analysis.js";
import { InputRouter } from "./inputRouter.js";
import { cFract } from "./cFract.js"; // main Object
import { logAppHeader } from "./version.js";
import { ComplexPoint } from "../fractTypes.js";

// Ecriture de la version directement
logAppHeader();

// --- ÉTATS GLOBAUX ---
let Mandel: cFract;
let julia: cFract;
let palette: PaletteEditor;
let lockedC: ComplexPoint; // Point c verrouillé par clic pour l'analyse d'orbite

// --- INITIALISATION DU MOTEUR & DE L'APPLICATION ---

/** Démarrage de mandel
 *  @todo 2: refactorer app+mandel pour que mandel s'injecte ses boutons status et zoomReset, ainsi que Julia ad-hoc */
async function startApp() {
  appConsole("Loading...");
  Mandel = new cFract("mandelCanvas", "MANDELBROT", "mandelStatus");
  julia = new cFract("juliaCanvas", "JULIA", "juliaStatus");
  // Initialiser l'éditeur de Palette V2/V3 et son callback
  palette = new PaletteEditor("paletteContainer", lut => {
    Mandel.cImage.updatePalette(lut);
    Mandel.render();
    julia.cImage.updatePalette(lut);
    julia.render();
  });
  palette.generateLut();
  // Amorce de chaque cFract autonome
  await Mandel.initParent(palette.lut);
  await julia.initParent(palette.lut);
  // Installer les écouteurs d'événements
  setupAppRouter();
  oldEventListeners(); // @todo 2: vider!
  // The same for Julia Set
  appConsole("Ready");
}

// Définit les evénements, à la place de initEventListeners(), déconnecté
function setupAppRouter() {
  const routerMandel = new InputRouter(Mandel, Mandel.canvas);
  routerMandel.bindDOMEvents({
    onHover: (mouseC, px) => {
      updateStatusBar("Mandel:", mouseC, px.x, px.y);
      const orbit: ComplexPoint[] = Mandel.calc.calcOrbit(mouseC);
      Mandel.render();
      Mandel.drawOrbitOverlay(orbit);
      julia.render();
      julia.drawOrbitOverlay(orbit);
    },
    onClick: (targetC, px) => {
      lockedC = targetC;
      updateStatusBar("Locked:", lockedC, px.x, px.y);
      julia.params.juliaC = lockedC;
    },
    onZoom: (centerPx, factor) => Mandel.params.zoom(centerPx, factor),
    onPan: deltaC => (Mandel.params.center = deltaC)
  });
  const routerJulia = new InputRouter(julia, julia.canvas);
  routerJulia.bindDOMEvents({
    onHover: (mouseC, px) => {
      updateStatusBar("Julia:", mouseC, px.x, px.y);
    },
    onClick: undefined,
    onZoom: (centerPx, factor) => julia.params.zoom(centerPx, factor),
    onPan: deltaC => (julia.params.center = deltaC)
  });
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS (INTERACTION UX) ---
function oldEventListeners() {
  //Areas to activate -@todo 1: move to cFract.html
  const canvasM = Mandel.canvas;
  const canvasJ = julia.canvas;
  const btnCopy = document.getElementById("btnCopyCsv");
  const btnTest = document.getElementById("btnTest");

  // Button test: lance l'analyse d'orbite complète
  if (btnTest) {
    // inactivé: mandel.sélection du point à faire !
    btnTest.addEventListener("click", () => {
      const result = analysis_test();
      const status = document.getElementById("appStatus");
      if (status) {
        status.innerText = result;
        //setTimeout(() => (status.innerText = ""), 3000);
      }
    });
  }

  /** @todo : Button copie csv: lance l'analyse d'orbite complète
  if (btnCopy && false) {
    // inactivé: mandel.sélection du point à faire !
    btnCopy.addEventListener("click", () => {
      const csv = mandel.calc.get_orbit_csv();
      navigator.clipboard.writeText(csv);
      const status = document.getElementById("appStatus");
      if (status) {
        status.innerText = `Orbite copiée !`;
        setTimeout(() => (status.innerText = ""), 3000);
      }
    });
  } /**/

  // mandel: cFract.OnPosition event
  // @todo: trouver comment émettre et consommer ses événements de classe

  // MANDEL: BOUTON INTERFACE RESET ZOOM
  const btnResetM = document.getElementById("btnResetMandel");
  if (btnResetM) {
    btnResetM.addEventListener("click", () => {
      Mandel.params.reset();
      //lockedC = null; //mieux de garder le point visible
      if (lockedC) {
        const reticlePx = Mandel.params.c2pix(lockedC);
        drawReticle(canvasM, reticlePx.x, reticlePx.y);
      }
    });
  }
  // JULIA: BOUTON INTERFACE RESET ZOOM
  const btnResetJ = document.getElementById("btnResetJulia");
  if (btnResetJ) {
    btnResetJ.addEventListener("click", () => {
      julia.params.reset();
    });
  }
  /** LISTBOX INTERFACE CALC MODE
   * @todo 2: implement on html !
  const selectMode = document.getElementById("selectCalcMode");
  if (selectMode) {
    selectMode.addEventListener("change", e => {
      const mode = e.target.value; // 'DIRECT' ou 'DEM'
      mandel.calc.setCalcMode(mode);
      julia.calc.etCalcMode(mode);
      //mandel.render(); //auto
      //julia.render(); //auto
    });
  } /**/
} /*initEventListeners*/

// ---Helpers---
//@todo 0 : réflexion d'architecture pour décider où ceci est implémenté !
//Si nous implémentons en rendu opengl rapide lors des transitions de souris,
//il faut passer par cImage au lieu de cFract (pas de calcul) et regénérer une image
// avec zoom, centrage, render, puis nouveau lockedC et orbite
// DESSIN DU RÉTICULE (Aide visuelle sur Mandelbrot)
function drawReticle(canvas, px, py) {
  // Rendre l'image de base pour effacer l'ancien réticule
  Mandel.render();
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
function updateStatusBar(msg, c, px, py) {
  const appStatus = document.getElementById("appStatus");
  if (appStatus) {
    appStatus.textContent = `${msg} c = ${c.re.toFixed(12)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(12)}i  |  Px: (${Math.round(px)}, ${Math.round(py)})`;
  }
}
function appConsole(msg) {
  const appStatus = document.getElementById("appStatus");
  if (appStatus) {
    appStatus.textContent = `[INFO] ${msg} })`;
  }
}

//@todo 1: prendre la version de mandel
//CALCUL ET EXPORTATION D'ORBITE POUR GOOGLE SHEETS
function old_exportOrbitToSheets(c: ComplexPoint): void {
  const maxIter = Mandel.params.max_iter;
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
    if (mod2 > Mandel.params.r2_max) break; // Évasion
  }
  // Copie dans le presse-papier
  navigator.clipboard
    .writeText(tsvContent)
    .then(() => {
      console.log(
        `[Orbites] Données pour c=(${c.re}, ${c.im}) copiées dans le presse-papier !`
      );
      const statusEl = document.getElementById("statusBar");
      if (statusEl) {
        statusEl.textContent += `| [Orbite copiée dans le presse-papier]`;
      }
    })
    .catch(err => {
      console.error("Erreur lors de la copie dans le presse-papier:", err);
    });
}

// Démarrage de l'application dès le chargement du DOM
window.addEventListener("DOMContentLoaded", startApp);
