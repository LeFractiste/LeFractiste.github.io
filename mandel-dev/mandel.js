// mandel.js - 4.3 - copyright LeFractiste 2026

// Module de calcul de fractales (Mandelbrot, Julia), contient:
// cFractParam: internal class for fractal parameters
// cFract: exported class for managing fractal rendering and interaction
// cImage: helper class for image buffer management and rendering
// MandelController: wrapper for the WebAssembly engine (MandelEngine)
// Rust Webassembly module : for orbits and fractal calculations

"use strict";
import init, { MandelEngine } from "./pkg/rust_m.js"; //Web assembly package
import { cUtils } from "./utils.js"; //fonctions utilitaires

// Size of pixel computed data
const PAYLOAD_SIZE = 5; // [iter, smooth_iter, z_re, z_im, distance/escape angle]

// cFractParam: Classe de metadonnées pour le calcul
export class cFractParam {
  constructor(
    type = "MANDELBROT", // "MANDELBROT" ou "JULIA"
    centerRe = type === "MANDELBROT" ? -0.7 : 0.0,
    centerIm = 0.0,
    spanRe = 3.0,
    spanIm = 3.0, //sera écrasé
    maxIter = 100,
    r2Max = 100000.0,
    juliaC = { re: -0.7, im: 0.27015 }, // Utilisé si type === "JULIA"
  ) {
    this.type = type; // "MANDELBROT" ou "JULIA"
    this.center = { re: centerRe, im: centerIm };
    this.span = { re: spanRe, im: 3.0 }; // span.im sera ajusté par l'aspect ratio
    this.max_iter = maxIter;
    this.r2_max = r2Max;
    this.juliaC = juliaC;
  }
  // Métadonnées d'export (Format propre pour Exif/PNG/HEIC JSON)
  toMetadata() {
    return JSON.stringify({
      type: this.type,
      center: [this.center.re, this.center.im],
      span: [this.span.re, this.span.im],
      max_iter: this.max_iter,
      r2_max: this.r2_max,
      juliaC: [this.juliaC.re, this.juliaC.im],
    });
  }
  //Clonage de l'objet
  clone() {
    const p = new cFractParam(
      this.type,
      this.center.re,
      this.center.im,
      this.span.re,
      this.max_iter,
      this.r2_max,
      { ...this.juliaC },
    );
    p.span.im = this.span.im;
    return p;
  }
}

// Classe exportée vers l'extérieur: gère tout.
export class cFract {
  constructor(canvasId, type = "MANDELBROT", statusId) {
    //TODO 2: changer l'interface
    /* const container = document.getElementById(containerId);
    this.name = name;
    container.innerHTML = `
      <div class="cfract-card">
        <h3 class="cfract-title">${name}</h3>
        <canvas class="cfract-canvas" width="600" height="400"></canvas>
        <div class="cfract-status">Initialisation...</div>
      </div>
    `;
    // Références directes : aucun risque de conflit d'ID !
    this.canvas = container.querySelector('.cfract-canvas');
    this.statusEl = container.querySelector('.cfract-status');
    this.titleEl = container.querySelector('.cfract-title');
    /**/
    // StatusBar ou console
    this.statusId = statusId;
    this.classConsole("Loading...");
    // Canvas et image buffer
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.cImage = new cImage(this.canvas.width, this.canvas.height);
    // Paramètres
    this.param = new cFractParam(type); //valeurs par défaut
    this.updateAspect();
    //Config par défaut
    this.calcMode = "DEM"; // Enum: 'DIRECT', 'DEM', 'DEM_QUAD', 'DELEGATE'
    this.calcCount = 0;
    this.autoCalc = true; //non utilisé encore
    // Propriétés en attente: await init(palette)
    this.wasmEngine = null;
    this.memory = null;
    this.isBusy = true;
    this.makeDirty();
  }
  //Initialisation asynchrone autonome (charge Wasm et instancie Rust)
  async init(paletteLut) {
    const wasmExports = await init(); //rust ready
    this.wasmMemory = wasmExports.memory; //lien mémoire
    const w = this.canvas.width;
    const h = this.canvas.height;
    try {
      const engine = new MandelEngine(w, h);
      if (engine) this.wasmEngine = engine; //instance liée !!
      this.classConsole("Initialized");
    } catch (e) {
      this.classConsole("Error Wasm init");
    }
    console.log("Instance Engine créée :", this.wasmEngine);
    // Injection LUT initiale et lance calcul
    if (paletteLut) this.cImage.updatePalette(paletteLut);
    this.isBusy = false;
    this.makeDirty();
    //Attache les événements autonomes
    //this.attachEvents();
  }
  // #Region Manage - Gestion des étapes du calcul (asynchrone)
  // Relance calcFull après changement de paramètre
  makeDirty() {
    this.isDirty = true;
    if (this.autoCalc && !this.isBusy) this.calcFull();
  }
  // Après calcFull, envoie l'image et réinitialise les compteurs
  makeClean() {
    this.render();
    this.isDirty = false;
    this.isBusy = false;
  }
  // Renvoie le buffer d'image - accessible par l'extérieur (palette)
  render() {
    this.ctx.putImageData(this.cImage.imageData, 0, 0);
    this.drawFixedPointsOverlay();
  }
  // Affichage complexe - //TODO 2: à passer dans utils ?
  complexToString(c, digits = 7) {
    return `${c.re.toFixed(digits)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(digits)}i`;
  }
  // Gestion du statut : affichage de c
  updateStatusBar(c, px, py) {
    const status = document.getElementById(this.statusId);
    if (!status) return;
    let msg = this.complexToString(c) + ` | counter: ${this.calcCount}`;
    //Affichage optionnel de la constante de Julia //todo titre !
    if (this.type === "JULIA") {
      const zC = this.param.juliaC;
      msg += ` | JULIA: ${this.complexToString(zC)}`;
    }
    //position fenêtre
    msg += `  | px=${Math.floor(px)} py=${Math.floor(py)}`;
    status.textContent = msg;
  }
  //Gestion du statut : affichage debug
  classConsole(msg) {
    const status = document.getElementById(this.statusId);
    if (status) {
      status.textContent = `[INFO] ${msg} })`;
    }
  }
  //
  //#Region setters --- getters, setters & states ---
  //
  // Gestion du type (encore non utilisé)
  setType(type, juliaC = null) {
    this.param.type = type; // 'MANDELBROT' ou 'JULIA'
    if (juliaC) this.param.juliaC = juliaC;
    this.makeDirty();
  }
  //Gestion directe du centre image
  getCenter() {
    return { ...this.param.center };
  }
  setCenter(re, im) {
    this.param.center = { re, im };
    this.makeDirty();
  }
  //Computation mode: // 'DEM', 'DIRECT', etc.
  setCalcMode(mode) {
    this.calcMode = mode; //todo 2: sécuriser l'interface!
    this.makeDirty();
  }
  //helper: aspect ratio adjustment
  updateAspect() {
    const aspect = this.canvas.height / this.canvas.width;
    this.param.span.im = this.param.span.re * aspect;
  }
  // Transformation (linéaire) du plan //TODO: erreur, tester
  pixelToComplex(point) {
    const cF = this.param;
    const re = cF.center.re + (point.x / this.canvas.width - 0.5) * cF.span.re;
    const im = cF.center.im - (point.y / this.canvas.height - 0.5) * cF.span.im;
    return { re: re, im: im };
  }
  complexToPixel(c) {
    const cF = this.param;
    const px = ((c.re - cF.center.re) / cF.span.re + 0.5) * this.canvas.width;
    const py = (0.5 - (c.im - cF.center.im) / cF.span.im) * this.canvas.height;
    return { x: px, y: py };
  }
  //Zoom around a fixed point (used for Mouse scroll)
  // Algorithme: l'écart sous la souris est réduit par (1 - zoomFactor)
  zoom(px, py, zoomFactor) {
    const cF = this.param;
    // Fixed pointc, et affichage
    const mouseC = this.pixelToComplex({ x: px, y: py });
    this.updateStatusBar(mouseC, px, py);
    // Ratio normalisé du pointeur par rapport au centre du canvas (-0.5 à +0.5)
    const w = this.canvas.width;
    const h = this.canvas.height;
    const alpha = px / w - 0.5;
    const beta = 0.5 - py / h;
    // Déplacement du centre : l'écart sous la souris est réduit par (1 - zoomFactor)
    cF.center.re += alpha * cF.span.re * (1 - zoomFactor);
    cF.center.im += beta * cF.span.im * (1 - zoomFactor);
    // Ajustement final des échelles (spans)
    cF.span.re *= zoomFactor;
    cF.span.im *= zoomFactor;
    // Relance
    this.makeDirty();
  }
  resetZoom() {
    const cF = this.param;
    cF.center.re = cF.type === "JULIA" ? 0.0 : -0.7;
    cF.center.im = 0.0;
    cF.span.re = 3.0;
    this.updateAspect(); // Calcule span.im
    this.makeDirty();
  }
  //Calcul d'orbite z(n+1):= z^2 + c (TODO: déléguer au Wasm)
  /* return this.wasmEngine.compute_orbit_array(
        z0.re, z0.im, c.re, c.im, maxIter); */
  directIter(z0, maxIter = this.param.max_iter) {
    const r2max = this.param.r2_max;
    const c = this.param.type === "JULIA" ? this.param.juliaC : z0;
    const cRe = c.re;
    const cIm = c.im;
    let zRe = z0.re;
    let zIm = z0.im; //M & J: z0 = le point du plan
    let mod2 = zRe * zRe + zIm * zIm;
    const orbit = [{ re: zRe, im: zIm }];
    for (let n = 1; n <= maxIter; n++) {
      const zx2 = zRe * zRe;
      const zy2 = zIm * zIm;
      const tmp = zx2 - zy2 + cRe;
      zIm = 2.0 * zRe * zIm + cIm;
      zRe = tmp;
      mod2 = zx2 + zy2;
      orbit.push({ re: zRe, im: zIm });
      if (mod2 > r2max) break; // escaped
    }
    return orbit;
  } /*directIter*/
  // Calcul de la fractale via Wasm - interface
  calcFull() {
    if (!this.wasmEngine || !this.wasmMemory) return;
    this.isBusy = true;
    this.calcCount += 1;
    const calcModeInt = this.calcMode === "DEM" ? 1 : 0;
    // Envoi universel vers Rust selon calcMode et param.type
    this.wasmEngine.compute_generic(
      this.param.type === "JULIA", // is_julia (bool)
      this.param.juliaC.re,
      this.param.juliaC.im, // c_re, c_im (ignorés si Mandel)
      this.param.center.re,
      this.param.center.im,
      this.param.span.re,
      this.param.span.im,
      this.param.max_iter,
      this.param.r2_max,
      calcModeInt,
    );
    // Extraction memoire: nouvelle méthode
    const ptr = this.wasmEngine.buffer_ptr(); // Float32 Wasm
    const payloadLen = this.canvas.width * this.canvas.height * PAYLOAD_SIZE;
    // Création d'une vue Float32Array directe sur la mémoire Wasm
    const wasmBuffer = new Float32Array(
      this.wasmMemory.buffer,
      ptr,
      payloadLen,
    );
    // Transmutation du payload Wasm en ImageData via la LUT
    this.cImage.updateFromWasmPayload(wasmBuffer, this.param.max_iter);
    this.makeClean();
  }

  // Affiche les points fixes sur le canvas
  drawFixedPointsOverlay() {
    const c =
      this.param.type === "JULIA" ? this.param.juliaC : this.param.center;
    const fixedPoints = cUtils.getFixedPoints(c);
    const ctx = this.ctx;
    ctx.save();
    fixedPoints.forEach((fp) => {
      const pt = this.complexToPixel(fp.root);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = fp.stable ? "#0066ff" : "#ff0000"; // Bleu = convergent, Rouge = divergent
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    });
    ctx.restore();
  }

  // Draw orbit of {re, im} on canvas
  drawOrbitOverlay(orbit) {
    //TODO 0: to refactor as drawOrbitOverlay() <-- after this.directIter
    if (!orbit || orbit.length === 0) return;
    const n = orbit.length; //property, not function!
    const ctx = this.ctx;
    //bounds = limits of screen in c plane
    ctx.save();
    ctx.strokeStyle = "#ff3366"; // Ligne rose fluo
    ctx.fillStyle = "#ffff00"; // Points jaunes
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let startpt = this.complexToPixel(orbit[0]);
    startpt = { x: 200, y: 200 }; // point test, visible
    ctx.moveTo(startpt.x, startpt.y);
    for (let i = 1; i < n; i++) {
      let pt = this.complexToPixel(orbit[i]);
      ctx.lineTo(pt.x, pt.y);
      // Trace un petit carré sur chaque itération
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    }
    ctx.stroke();
    ctx.restore();
  } /*drawOrbit*/

  //Calcul d'orbite point image TODO 0: finir & déplacer interface App
  calcOrbitArray(point) {
    //TODO: gestion isDirty?
    const mouseC = this.pixelToComplex(point);
    this.directIter(mouseC, this.param.max_iter);
  }

  // #new TODO 1: Orbite de Mandelbrot seulement //TODO 3: généraliser à Julia
  computeOrbitCsv(cRe, cIm, maxIter) {
    if (
      this.wasmEngine &&
      typeof this.wasmEngine.compute_orbit_csv === "function"
    ) {
      return this.wasmEngine.compute_orbit_csv(cRe, cIm, maxIter);
    }
    return "#Not initialized";
  }
  // Gestion des événements de l'objet (ne pas activer)
  attachEvents(statusId = null, onPointSelected = null) {
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    // ZOOM À LA MOLETTE
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18; // In / Out doux
      this.zoom(px, py, zoomFactor);
    });

    // GLISSER-DÉPLACER (DRAG) POUR DÉPLACER LE CENTRE (1/3)
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        // Clic gauche
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
      }
    });

    // GLISSER-DÉPLACER (DRAG) POUR DÉPLACER LE CENTRE (2/3)
    window.addEventListener("mousemove", (e) => {
      // Mise à jour de la barre de statut de ce cFract
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const cF = this.param;
      // Dans la fenêtre ?
      if (
        px >= 0 &&
        px <= this.canvas.width &&
        py >= 0 &&
        py <= this.canvas.height
      ) {
        const mouseC = this.pixelToComplex({ x: px, y: py });
        this.updateStatusBar(mouseC, px, py);
        // Notification externe (ex: Mandelbrot avertit App pour rafraîchir Julia)
        if (onPointSelected && !isDragging) {
          //TODO: implémenter dans App
          onPointSelected(mouseC, px, py);
        }
        //Traitement du delta déplacement
        if (isDragging) {
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          dragStart = { x: e.clientX, y: e.clientY };
          // Conversion du delta pixels en delta complexe
          const deltaRe = (dx / this.canvas.width) * cF.span.re;
          const deltaIm = (dy / this.canvas.height) * cF.span.im;
          cF.center.re -= deltaRe;
          cF.center.im += deltaIm; // Axes inversés en Y
          this.makeDirty; //Préférer update image sans recalcul ici
        }
      } else {
        // Sortie de la fenêtre !
        isDragging = false;
      }
    }); /*mouse move*/

    // DÉPLACER (DRAG) POUR DÉPLACER LE CENTRE (3/3)
    window.addEventListener("mouseup", () => {
      isDragging = false;
    });
  } /* attach events*/
} /**cFract*/

// cImage: Gestionnaire d'image, agnostique du contenu - reçoit ses buffers
// TODO: vérifier la méthode mise à jour du buffer App.s (attach buffer / render)
// Nous avions: return new ImageData(rgbaBuffer, this.width, this.height);
// et getPixelColor(x, y)
export class cImage {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.imageData = new ImageData(width, height);
    this.lut = new Uint8Array(1024 * 4); // Palette par défaut (1024 x 4 octets RGBA)
  }
  /*attachBuffer(rawBuffer) {
    this.buffer = rawBuffer;
  }*/
  // Reçoit la LookUpTable (LUT) de l'extérieur (PaletteEditor)
  updatePalette(LookUpTable) {
    this.lut = LookUpTable; //todo 1: vérifier la taille? JS peut errer en mémoire?
    //updateImage// TODO 1: comment est relancé l'affichage ici ?
  }
  // Application de la LUT sur le buffer Wasm (PAYLOAD_SIZE floats par pixel)
  updateFromWasmPayload(wasmFloatBuffer, maxIter = 500) {
    const pixels = this.imageData.data;
    const lutSize = this.lut.length / 4;
    for (let i = 0; i < this.width * this.height; i++) {
      const payloadIdx = i * PAYLOAD_SIZE;
      const iter = wasmFloatBuffer[payloadIdx];
      const imgIdx = i * 4;
      if (iter >= maxIter) {
        // Intérieur du bulbe : NOIR
        pixels[imgIdx] = 0;
        pixels[imgIdx + 1] = 0;
        pixels[imgIdx + 2] = 0;
        pixels[imgIdx + 3] = 255;
      } else {
        // Extérieur : Mappage sur la LUT via le modulo
        const lutIdx = Math.floor(iter % lutSize) * 4;
        pixels[imgIdx] = this.lut[lutIdx];
        pixels[imgIdx + 1] = this.lut[lutIdx + 1];
        pixels[imgIdx + 2] = this.lut[lutIdx + 2];
        pixels[imgIdx + 3] = 255;
      } //end if
    } // end for
  }
} /*cImage and file*/
