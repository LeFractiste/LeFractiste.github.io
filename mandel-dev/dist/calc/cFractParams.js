/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */
import { cUtils } from "../calc/utils.js";
// #region cFractParams
// cFractparams : paramètres du calcul asynchrone
export class cFractParams {
    parent; // utilisé pour l'affichage sans event
    _center; //controled property
    _dirty;
    typeName; //à remplacer par get quand Rust changera (exige JuliaC alors que Mandelbrot=(JuliaC= Undefined)
    size = { x: 400, y: 300 };
    aspectRatio = 4 / 3; //800-600 par défaut!
    dia;
    max_iter;
    r2_max;
    juliaC; //exigé par rust-m, à rendre optionel?
    angleDeg = 0.0;
    /** Reads dirty */
    get dirty() {
        return this._dirty;
    }
    // Sets dirty and launches new rendering
    set dirty(value) {
        this._dirty = value;
        if (value)
            this.parent.render();
    }
    // #region constructor
    constructor(typeName = "", parent) {
        const defaultType = "MANDELBROT";
        this.parent = parent;
        this.typeName = typeName ? typeName : defaultType;
        this._center =
            typeName === defaultType ? { re: -0.7, im: 0.0 } : { re: 0.0, im: 0.0 };
        this.dia = 2.25; // 2.25
        this.max_iter = typeName === defaultType ? 300 : 100;
        this.r2_max = 100000.0;
        // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
        this.juliaC = { re: -0.7, im: 0.27015 };
        this._dirty = true;
    }
    /**  */
    initSize(size) {
        this.size = size;
        this.aspectRatio = size.y / size.x;
        this.dirty = true;
        this.displayState(`[Size] size=${this.size.x} x ${this.size.y}`);
    }
    // Métadonnées d'export (Format propre pour Exif/PNG/HEIC JSON)
    toMetadata() {
        return JSON.stringify({
            type: this.typeName,
            center: [this.center.re, this.center.im],
            vector: [this.dia, this.angleDeg],
            max_iter: this.max_iter,
            r2_max: this.r2_max,
            juliaC: [this.juliaC.re, this.juliaC.im]
        });
    }
    /** Clonage de l'objet //not used
    clone(): cFractParams {
      const p = new cFractParams(this.type);
      p.center = this.center; //etc
      return p;
    } */
    // #region Getters - Setters
    /** @todo : gérer le recalcul automatique avec calc.callback ou param.onchange ? */
    // Gestion du type (encore non utilisé)
    setJuliaC(juliaC) {
        this.juliaC = juliaC;
        this.dirty = true;
        this.displayState("[JuliaC]", this.juliaC);
    }
    // Computed span, so that dia is represented
    get span() {
        if (this.size.y > this.size.x) {
            return { re: this.dia, im: this.dia / this.aspectRatio };
        }
        else {
            return { re: this.dia * this.aspectRatio, im: this.dia };
        }
    }
    // Centrage (pan)
    // GETTER: direct access
    get center() {
        return this._center;
    }
    // SETTER: activates dirty for recalc
    set center(c) {
        this._center = c;
        this.dirty = true;
        this.displayState("[Drag]", this.center);
    }
    // Vector: diameter and rotation angle in deg
    setVector(dia, angleDeg = 0.0) {
        this.dia = dia;
        this.angleDeg = angleDeg;
        this.dirty = true;
        this.displayState("[Vector] dia=${dia} angle=${angleDeg}");
    }
    // #region Proj
    // Transformation (linéaire) du plan - canvas vers complexe
    pix2c(point) {
        const cFP = this;
        const re = cFP.center.re + (point.x / cFP.size.x - 0.5) * cFP.span.re;
        const im = cFP.center.im - (point.y / cFP.size.y - 0.5) * cFP.span.im;
        return { re, im };
    }
    // Transformation linéaire du plan - complexe vers canvas
    c2pix(c) {
        const cF = this;
        const px = ((c.re - cF.center.re) / cF.span.re + 0.5) * cF.size.x;
        const py = (0.5 - (c.im - cF.center.im) / cF.span.im) * cF.size.y;
        return { x: px, y: py };
    }
    // Simple zoom from center
    zoom(pix, zoomFactor) {
        this.dia /= zoomFactor;
        this.dirty = true;
        this.displayState("[Zoom]", this.center, pix);
    }
    // Zoom around a fixed point (used for Mouse scroll)
    // Algorithme: l'écart sous la souris est réduit par (1 - zoomFactor)
    old_zoom(pix, zoomFactor) {
        const cFP = this;
        // Fixed pointc, et affichage
        const mouseC = this.pix2c(pix);
        //todo: event ! this.parent.updateStatusBar(mouseC, pix);
        // Ratio normalisé du pointeur par rapport au centre du canvas (-0.5 à +0.5)
        const w = this.size.x;
        const h = this.size.y;
        const alpha = pix.x / w - 0.5;
        const beta = 0.5 - pix.y / h;
        // Déplacement du centre : l'écart sous la souris est réduit par (1 - zoomFactor)
        cFP.center.re += alpha * cFP.span.re * (1 - zoomFactor);
        cFP.center.im += beta * cFP.span.im * (1 - zoomFactor);
        // Ajustement final des échelles (spans)
        cFP.dia /= zoomFactor;
        // Relance
        this.dirty = true;
        this.displayState("[Zoom]", cFP.center, pix);
    }
    reset() {
        const cFP = this;
        cFP.center.re = cFP.typeName === "MANDELBROT" ? -0.7 : 0;
        cFP.center.im = 0.0;
        cFP.dia = 2.25; // 9/4
        this.dirty = true;
        this.displayState("[Reset]", cFP.center);
    }
    // #region display
    // Display the cfract state
    displayState(action, c, pix) {
        console.trace("cFractParams.displayState");
        if (!this.parent)
            return;
        // Prepare display msg
        const cFP = this;
        const cF = this.parent;
        const spyImage = cF.cImage.imageData.data.subarray(0, 5).join(",");
        const spyWasmPayload = cF.calc.calcBuffer;
        let msg = action;
        if (c)
            msg = `${cUtils.complexToString(c)}` + msg;
        if (cF.params.typeName === "JULIA") {
            msg += ` | JULIA: ${cUtils.complexToString(cFP.juliaC)}`;
        }
        if (pix) {
            msg += ` | px=${Math.floor(pix.x)} py=${Math.floor(pix.y)}`;
        }
        msg += ` | dia=${cFP.dia.toExponential(2)}`;
        msg += ` | counter: ${cF.calc.calcCount}`;
        cF.classConsole(msg);
    }
} /** */
//# sourceMappingURL=cFractParams.js.map