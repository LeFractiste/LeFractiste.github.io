// app/cFract.ts - Copyright LeFractiste 2026
/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Plan V4: affichier c en hover et ajouter le touch zoom
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Plan V5: ordre de récupération: basic.html + bmp, fractTypes + cFract + cFractParams + overlay, + cImage + cCalc.test
 * Suite: cCalc(iter),  DEM + palette, mouseEvents
 * @todo 0: migration ts, galère !
 * @todo 0: migration params, galère*
 * @todo 0: génération du html, galère non débuggable ! Revenir en arrière, et générer du code console ?
 * @todo 1: Utiliser le parent pour accéder à params (pour calc, analysis, input Router, fractDraw, externalRay = tous)
 * @todo 2: Gérer param.calcMode et implémenter cFractCalc.setMode ?
 * @todo 2: Mandel utilise html-helper pour faire url<-->params
 * @todo 1: Aménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo 2: MaxIter ? Le calculer pour la bonne résolution DEM. Critère: un point "noir" est à une distance/pixel > 2
 * @todo 2: extRay: avancer jusqu'au dernier pixel, puis zoomer (x10) et avancer jusqu'au derier pixel.
 * @todo 3: historique de zoom : push, pop position (&vecteur: dia/rotation)
 * @todo 1: html - ajout automatisé de boutons d'interface maxIter & setCalc (interface UX(btnX): html.addBtn(X, onclick): id=btnX, onClickX?)
 * @todo 2: vitesse de chargement : init bmp pour mandel
 * @todo 0: regrouper les CSS dans un CSS de site ? (harmonie) 50%: couleurs des palletes et boutons
 * @todo 1: serveur d'image et url variable. 50%: manque update url (revoir svg)
 * @todo 3: SEO site + copyright + pub Utube
 */
import init, { MandelEngine } from "../../pkg/rust_m.js";
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { setupFractalCanvas, parseHashParams } from "../app/cFractHtml.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cFractParams } from "../calc/cFractParams.js";
export class cFract {
    canvas;
    ctx;
    cImage;
    params;
    calc;
    //Calc variables: //todo 2: ce bloc de varaibles doit-il aller dans calc ?
    statusId;
    calcMode;
    calcCount;
    autoCalc;
    isBusy;
    isDirty;
    wasmEngine = null;
    wasmMemory = null;
    fixedPoints = [];
    constructor(canvasId, type = "MANDELBROT", statusId) {
        this.statusId = statusId;
        this.classConsole("Loading...");
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas)
            throw new Error(`Canvas #${canvasId} introuvable`);
        this.ctx = this.canvas.getContext("2d");
        this.cImage = new cImage(this.canvas.width, this.canvas.height);
        this.params = new cFractParams(type);
        this.calc = new cFractCalc();
        this.updateAspect();
        this.calcMode = "DEM"; // Enum: 'DIRECT', 'DEM', 'DEM_QUAD', 'DELEGATE'
        this.calcCount = 0;
        this.isDirty = true;
        this.autoCalc = true;
        this.isBusy = true;
        this.makeDirty();
    }
    async init(paletteLut) {
        try {
            const wasmExports = await init();
            this.wasmMemory = wasmExports.memory;
            this.wasmEngine = new MandelEngine(this.canvas.width, this.canvas.height);
            this.calc.setWasmReference(this.wasmEngine, this.wasmMemory);
            this.classConsole("Initialized");
        }
        catch (e) {
            this.classConsole("Error Wasm init");
        }
        if (paletteLut)
            this.cImage.updatePalette(paletteLut);
        this.isBusy = false;
        this.makeDirty();
    }
    // #region Manage - Cycle de vie des étapes de calcul
    makeDirty() {
        this.isDirty = true;
        if (this.autoCalc && !this.isBusy)
            this.calcFull();
    }
    makeClean() {
        this.render();
        this.isDirty = false;
        this.isBusy = false;
    }
    calcFull() {
        if (this.isBusy)
            return;
        this.isBusy = true;
        this.calcCount++;
        try {
            if (this.wasmEngine) {
                const payload = this.calc.computeWasmPayload(this.params, this.canvas.width, this.canvas.height, this.calcMode);
                this.cImage.updateFromWasmPayload(payload, this.params.max_iter);
            }
        }
        catch (err) {
            console.error("[cFract] Erreur lors du calcul :", err);
        }
        finally {
            this.makeClean();
        }
    }
    render() {
        this.ctx.putImageData(this.cImage.imageData, 0, 0);
        this.drawFixedPointsOverlay();
    }
    drawFixedPointsOverlay() {
        cFractDraw.drawFixedPointsOverlay(this.ctx, this.params, this.canvas.width, this.canvas.height, this.fixedPoints);
    }
    // #region Getters & Setters
    setType(type, juliaC = null) {
        this.params.type = type;
        if (juliaC)
            this.params.juliaC = { ...juliaC };
        this.makeDirty();
    }
    getCenter() {
        return { ...this.params.center };
    }
    setCenter(c) {
        this.params.center = { re: c.re, im: c.im };
        this.makeDirty();
    }
    setCalcMode(mode) {
        this.calcMode = mode;
        this.makeDirty();
    }
    updateAspect() {
        this.params.updateAspect(this.canvas.width, this.canvas.height);
    }
    pix2c(point) {
        return this.params.pix2c(point, this.canvas.width, this.canvas.height);
    }
    c2pix(c) {
        return this.params.c2pix(c, this.canvas.width, this.canvas.height);
    }
    zoom(px, py, zoomFactor) {
        const mouseC = this.pix2c({ x: px, y: py });
        this.updateStatusBar(mouseC, px, py);
        const w = this.canvas.width;
        const h = this.canvas.height;
        const alpha = px / w - 0.5;
        const beta = 0.5 - py / h;
        this.params.center.re += alpha * this.params.span.re * (1 - zoomFactor);
        this.params.center.im += beta * this.params.span.im * (1 - zoomFactor);
        this.params.span.re *= zoomFactor;
        this.params.span.im *= zoomFactor;
        this.makeDirty();
    }
    resetZoom() {
        this.params.center.re = this.params.type === "JULIA" ? 0.0 : -0.7;
        this.params.center.im = 0.0;
        this.params.dia = 3.0;
        this.updateAspect();
        this.makeDirty();
    }
    // #region Status UI & Helpers
    complexToString(c, digits = 7) {
        return `${c.re.toFixed(digits)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(digits)}i`;
    }
    updateStatusBar(c, px, py) {
        const status = document.getElementById(this.statusId);
        if (!status)
            return;
        let msg = `${this.complexToString(c)} | counter: ${this.calcCount}`;
        if (this.params.type === "JULIA") {
            msg += ` | JULIA: ${this.complexToString(this.params.juliaC)}`;
        }
        msg += ` | px=${Math.floor(px)} py=${Math.floor(py)}`;
        status.textContent = msg;
    }
    classConsole(msg) {
        const status = document.getElementById(this.statusId);
        if (status) {
            status.textContent = `[INFO] ${msg}`;
        }
    }
}
export async function appInit(containerId = "MANDELBROT") {
    // 1. Déduction des paramètres depuis l'URL ou fallback par défaut
    const param = parseHashParams() || new cFractParams(containerId);
    // 2. Préparation du DOM
    const containerInfo = setupFractalCanvas({ containerId: param.type });
    // 3. Création et initialisation du moteur cFract
    const engine = new cFract(containerInfo.canvasId, param.type, containerInfo.statusId);
    engine.params = param; // Injection des paramètres
    await engine.init();
    return engine;
}
/** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
 * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
 */
export async function runImageServer(containerId) {
    // 1. Instanciation du DOM via htmlHelper
    const options = { containerId: containerId };
    const FC = setupFractalCanvas(options);
    // 2. Initialisation du moteur cFract
    const engine = new cFract(FC.canvasId, FC.type, FC.statusId);
    await engine.init();
    // 3. Application des paramètres d'URL
    const cfg = parseHashParams();
    engine.setType(cfg.type);
    engine.setCenter(cfg.center);
    engine.params.dia = cfg.dia; //contourne l'interface setSpan qui n'existe pas encore !
    engine.updateAspect();
    // 4. Calcul et rendu initial
    engine.makeDirty();
}
//# sourceMappingURL=cFract.js.map