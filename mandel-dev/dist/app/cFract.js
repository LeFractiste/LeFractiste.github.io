// app/cFract.ts - Copyright LeFractiste 2026
/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Spec V4: Affichage parallèle de Mandelbrot et Julia, avec affichage des valeurs de c et interactions souris.
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Spec V5: Version en TypeScript, proche du petit package(?)
 *   Il reste à : gérer les mouse touch events, et documenter, puis étoffer: intégrer analyse, cTest, zoonorama en Rust.
 */
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cFractParams } from "../calc/cFractParams.js";
import { cUtils } from "../calc/utils.js";
// #region CFRACT
export class cFract {
    canvas;
    ctx;
    cImage;
    _params;
    calc;
    //Calc variables: //todo 2: envoyer des variables dans calc ? StateMachine ici
    statusId;
    //public autoCalc: boolean = true; //event app...
    fixedPoints = [];
    get params() {
        return this._params;
    }
    constructor(canvasId, type = "MANDELBROT", statusId) {
        this.statusId = statusId;
        this.classConsole("Loading...");
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas)
            throw new Error(`Canvas #${canvasId} introuvable`);
        this.ctx = this.canvas.getContext("2d");
        // Crée cImage / pres
        this.cImage = new cImage(this.canvas.width, this.canvas.height); //passer canvas et déléguer DrawOverlay ?
        // Crée params, autoCalc=false
        this._params = new cFractParams(type, this);
        // Crée calc - sasn calcul
        this.calc = new cFractCalc(this);
    }
    // Launch the objet, up to calc.initCalc(handling wasm)
    async initParent(paletteLut) {
        // initialiser tout sauf calc
        if (paletteLut)
            this.cImage.updatePalette(paletteLut);
        // Last step: calc & rust & calcul up to render (point dur !)
        try {
            await this.calc.initCalc();
            this.classConsole("Initialized");
            this.render();
        }
        catch (e) {
            this.classConsole("Error cFract init");
        }
        // InitCalc appelle render à la fin
    }
    // #region Render
    /** Handles the display, as necessary
     */
    render() {
        console.trace("cFract.render");
        // recomputes if necessary (dirty) and possible (busy)
        if (this._params.dirty) {
            this.calc.calcFull();
            // recalcul des overlay ?
            // à faire
            // Envoi de l'image
            this.ctx.putImageData(this.cImage.imageData, 0, 0);
            // Envoi des overlay
            this.drawFixedPointsOverlay(); //via image ou Pres ?
        }
    }
    // Draw overlay with default options
    drawOrbitOverlay(orbit) {
        console.trace("cFract.Overlay");
        this.render(); // lent mais...
        cFractDraw.drawComplexPath(this, orbit, {});
    }
    drawFixedPointsOverlay() {
        cFractDraw.drawFixedPointsOverlay(this.ctx, this._params, this.canvas.width, this.canvas.height, this.fixedPoints);
    }
    // #region Status UI & Helpers
    updateStatusBar(c, px, py) {
        const status = document.getElementById(this.statusId);
        if (!status)
            return;
        let msg = `${cUtils.complexToString(c)} | counter: ${this.calc.calcCount}`;
        if (this._params.typeName === "JULIA") {
            msg += ` | JULIA: ${cUtils.complexToString(this._params.juliaC)}`;
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
//# sourceMappingURL=cFract.js.map