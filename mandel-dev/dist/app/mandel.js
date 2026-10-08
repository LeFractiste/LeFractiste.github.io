"use strict"; // sera inutile en ts et en JS script type=module (y-suis-je?)
// mandel.js - 4.3 dev - copyright LeFractiste 2026
// Module de calcul de fractales (Mandelbrot, Julia), contient:
// cFractParam: internal class for fractal parameters
// cFract: exported class for managing fractal rendering and interaction
// cImage: helper class for image buffer management and rendering
// MandelController: wrapper for the WebAssembly engine (MandelEngine)
// Rust Webassembly module : for orbits and fractal calculations
import init, { MandelEngine } from "../../pkg/rust_m.js"; //Web assembly package
import { cUtils } from "./utils.js"; //fonctions utilitaires
import { IParams, cFractParams } from "../calc/cFractParams.js"; //migration en cours
import { InputRouter } from "./inputRouter.js";
import { cImage } from "../pres/cImage.js";
// Size of pixel computed data
const PAYLOAD_SIZE = 5; // [iter, smooth_iter, z_re, z_im, distance/escape angle]
/** Classe exportée vers l'extérieur: gère tout.
 * @todo tout coordonner d'ici, et présenter les "domaines" à l'extérieur html, params, events, analyse,...
 * @todo: passage en ts:
 * export class cFract {
  public image: cImage;
  public param: FractParams;
  constructor(options: FractSetupOptions) {
    this.param = new FractParams();
    this.image = new cImage(options.width || 800, options.height || 600);
  }
}*/
export class cFract {
    constructor(canvasId, type = "MANDELBROT", statusId) {
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
            if (engine)
                this.wasmEngine = engine; //instance liée !!
            this.classConsole("Initialized");
        }
        catch (e) {
            this.classConsole("Error Wasm init");
        }
        console.log("Instance Engine créée :", this.wasmEngine);
        // Si une LUT est transmise, on l'applique.
        // Sinon cImage garde sa palette arc-en-ciel par défaut !
        if (paletteLut) {
            this.cImage.updatePalette(paletteLut);
        }
        this.isBusy = false;
        this.makeDirty();
        //Attache les événements autonomes
        //this.attachEvents();
    }
    // #Region Manage - Gestion des étapes du calcul (asynchrone)
    // makedirty-->calcFull-->makeClean-->render
    // Relance calcFull après changement de paramètre
    makeDirty() {
        this.isDirty = true;
        if (this.autoCalc && !this.isBusy)
            this.calcFull();
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
    // Affichage complexe - //@todo 2: à passer dans utils
    complexToString(c, digits = 7) {
        return `${c.re.toFixed(digits)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(digits)}i`;
    }
    // Gestion du statut : affichage de c
    updateStatusBar(c, px, py) {
        const status = document.getElementById(this.statusId);
        if (!status)
            return;
        let msg = this.complexToString(c) + ` | counter: ${this.calcCount}`;
        //Affichage optionnel de la constante de Julia //@todo titre !
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
    // #end region manage ------------------------------
    // #region computing  -----------------
    // Affiche les points fixes sur le canvas
    drawFixedPointsOverlay() {
        const c = this.param.type === "JULIA" ? this.param.juliaC : this.param.center;
        const fixedPoints = cUtils.getFixedPoints(c);
        const ctx = this.ctx;
        ctx.save();
        fixedPoints.forEach(fp => {
            const pt = this.c2pix(fp.root);
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
        //@todo 0: to refactor as drawOrbitOverlay() <-- after this.directIter
        if (!orbit || orbit.length === 0)
            return;
        const n = orbit.length; //property, not function!
        const ctx = this.ctx;
        //bounds = limits of screen in c plane
        ctx.save();
        ctx.strokeStyle = "#ff3366"; // Ligne rose fluo
        ctx.fillStyle = "#ffff00"; // Points jaunes
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let startpt = this.c2pix(orbit[0]);
        startpt = { x: 200, y: 200 }; // point test, visible
        ctx.moveTo(startpt.x, startpt.y);
        for (let i = 1; i < n; i++) {
            let pt = this.c2pix(orbit[i]);
            ctx.lineTo(pt.x, pt.y);
            // Trace un petit carré sur chaque itération
            ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
        }
        ctx.stroke();
        ctx.restore();
    } /*drawOrbit*/
    // #new @todo 1: Orbite de Mandelbrot.lockedC seulement //@todo 3: généraliser à Julia
    getOrbitCsv() {
        if (this.wasmEngine && typeof this.wasmEngine.compute_orbit_csv === "function") {
            return this.wasmEngine.compute_orbit_csv(cRe, cIm, maxIter);
        }
        return "#Not initialized";
    }
    // Gestion des événements de l'objet //@todo 1 activer les principaux ici
    // @todo 1 : continuer à vider, puisque remplacé par setUpAppRouter
    attachEvents(onPointSelected = null) {
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        // ZOOM À LA MOLETTE   //@todo: two-fingers zoom onSmartphone !
        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18; // In / Out doux
            this.zoom(px, py, zoomFactor);
        });
        // CLICK ET GLISSER-DÉPLACER (DRAG) POUR DÉPLACER LE CENTRE (1/3)
        this.canvas.addEventListener("mousedown", e => {
            if (e.button === 0) {
                // Clic gauche
                isDragging = true;
                dragStart = { x: e.clientX, y: e.clientY };
                /* @todo: automatismes au click
                const mouseC = this.pixelToComplex({ x: px, y: py });
                if (isAnalysisOn) {} else
                if (isTraceOn) {this.updateStatusBar(mouseC, px, py);}
                if (isJuliaActive) {;}
                if (isGoingDeep) {isGoingDeep=false;}  //end automated descent
                /** */
            }
        });
        // GLISSER-DÉPLACER (DRAG) POUR DÉPLACER LE CENTRE (2/3)
        window.addEventListener("mousemove", e => {
            // Mise à jour de la barre de statut de ce cFract
            const rect = this.canvas.getBoundingClientRect();
            const px = e.clientX - rect.left;
            const py = e.clientY - rect.top;
            const cF = this.param;
            // Dans la fenêtre ?
            if (px >= 0 && px <= this.canvas.width && py >= 0 && py <= this.canvas.height) {
                const mouseC = this.pix2c({ x: px, y: py });
                this.updateStatusBar(mouseC, px, py);
                // Notification externe (ex: Mandelbrot avertit App pour rafraîchir Julia)
                if (onPointSelected && !isDragging) {
                    //@todo 1: implémenter callback dans App
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
            }
            else {
                // Sortie de la fenêtre !
                isDragging = false;
            }
        }); /*mouse move*/
        // DÉPLACER (DRAG) POUR DÉPLACER LE CENTRE (3/3)
        window.addEventListener("mouseup", () => {
            isDragging = false; //fin
        });
    } /* attach events*/
} /**cFract*/
//# sourceMappingURL=mandel.js.map