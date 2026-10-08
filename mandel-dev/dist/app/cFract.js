// app/cFract.ts - Copyright LeFractiste 2026
// Contrôleur principal et façade publique
import init, { MandelEngine } from "../../pkg/rust_m.js";
import { cFractParams } from "../calc/cFractParams.js";
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { cFractDraw } from "../pres/fractDraw.js";
export class cFract {
    canvas;
    ctx;
    cImage;
    param;
    calc;
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
        this.param = new cFractParams(type);
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
                const payload = this.calc.computeWasmPayload(this.param, this.canvas.width, this.canvas.height, this.calcMode);
                this.cImage.updateFromWasmPayload(payload, this.param.max_iter);
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
        cFractDraw.drawFixedPointsOverlay(this.ctx, this.param, this.canvas.width, this.canvas.height, this.fixedPoints);
    }
    // #region Getters & Setters
    setType(type, juliaC = null) {
        this.param.type = type;
        if (juliaC)
            this.param.juliaC = { ...juliaC };
        this.makeDirty();
    }
    getCenter() {
        return { ...this.param.center };
    }
    setCenter(c) {
        this.param.center = { re: c.re, im: c.im };
        this.makeDirty();
    }
    setCalcMode(mode) {
        this.calcMode = mode;
        this.makeDirty();
    }
    updateAspect() {
        this.param.updateAspect(this.canvas.width, this.canvas.height);
    }
    pix2c(point) {
        return this.param.pix2c(point, this.canvas.width, this.canvas.height);
    }
    c2pix(c) {
        return this.param.c2pix(c, this.canvas.width, this.canvas.height);
    }
    zoom(px, py, zoomFactor) {
        const mouseC = this.pix2c({ x: px, y: py });
        this.updateStatusBar(mouseC, px, py);
        const w = this.canvas.width;
        const h = this.canvas.height;
        const alpha = px / w - 0.5;
        const beta = 0.5 - py / h;
        this.param.center.re += alpha * this.param.span.re * (1 - zoomFactor);
        this.param.center.im += beta * this.param.span.im * (1 - zoomFactor);
        this.param.span.re *= zoomFactor;
        this.param.span.im *= zoomFactor;
        this.makeDirty();
    }
    resetZoom() {
        this.param.center.re = this.param.type === "JULIA" ? 0.0 : -0.7;
        this.param.center.im = 0.0;
        this.param.span.re = 3.0;
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
        if (this.param.type === "JULIA") {
            msg += ` | JULIA: ${this.complexToString(this.param.juliaC)}`;
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
    const param = parseUrlToParams() || new cFractParam(containerId);
    // 2. Préparation du DOM
    const containerInfo = setupFractalCanvas({ containerId: param.type });
    // 3. Création et initialisation du moteur cFract
    const engine = new cFract(containerInfo.canvasId, param.type, containerInfo.statusId);
    engine.param = param; // Injection des paramètres
    await engine.init();
    return engine;
}
//# sourceMappingURL=cFract.js.map