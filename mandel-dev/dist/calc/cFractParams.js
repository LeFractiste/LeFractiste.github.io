/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */
console.log("cFractParams 1");
import { cTest } from "../analysis/cTest.js";
const T = new cTest("cFractCalc");
console.log("cFractParams 2");
export class cFractParams {
    typeName; //à supprimer quand Rust changera (exige JuliaC alors que Mandelbrot=(JuliaC= Undefined)
    copySize = { x: 400, y: 300 };
    _center; //controled property
    aspectRatio = 4 / 3; //800-600 par défaut!
    dia;
    max_iter;
    r2_max;
    juliaC; //exigé par rust-m, à rendre optionel?
    dirty;
    angleDeg = 0.0;
    constructor(typeName = "MANDELBROT") {
        this.typeName = typeName;
        this._center =
            typeName === "MANDELBROT" ? { re: -0.7, im: 0.0 } : { re: 0.0, im: 0.0 };
        this.dia = 3.0;
        this.max_iter = typeName === "MANDELBROT" ? 300 : 100;
        this.r2_max = 100000.0;
        // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
        this.juliaC = { re: -0.7, im: 0.27015 };
        this.dirty = true;
    }
    static newMandelbrot() {
        return new cFractParams("MANDELBROT");
    }
    static newJulia(c) {
        const params = new cFractParams("JULIA");
        params.juliaC = c;
        return params;
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
    /** @todo : gérer le recalcul automatique avec calc.callback ou param.onchange ? */
    // Gestion du type (encore non utilisé)
    setJuliaC(juliaC) {
        this.juliaC = juliaC;
        this.dirty = true;
    }
    // Computed span, so that dia is represented
    get span() {
        if (this.copySize.y > this.copySize.x) {
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
    }
    // Vector: diameter and rotation angle in deg
    setVector(dia, angleDeg = 0.0) {
        this.dia = dia;
        this.angleDeg = angleDeg;
        this.dirty = true;
    }
    initSize(size) {
        this.copySize = size;
        this.aspectRatio = size.y / size.x;
        this.dirty = true;
    }
    // Transformation (linéaire) du plan - canvas vers complexe
    pix2c(point) {
        const cF = this;
        const re = cF.center.re + (point.x / cF.copySize.x - 0.5) * cF.span.re;
        const im = cF.center.im - (point.y / cF.copySize.y - 0.5) * cF.span.im;
        return { re, im };
    }
    // Transformation linéaire du plan - complexe vers canvas
    c2pix(c) {
        const cF = this;
        const px = ((c.re - cF.center.re) / cF.span.re + 0.5) * cF.copySize.x;
        const py = (0.5 - (c.im - cF.center.im) / cF.span.im) * cF.copySize.y;
        return { x: px, y: py };
    }
    // Zoom around a fixed point (used for Mouse scroll)
    // Algorithme: l'écart sous la souris est réduit par (1 - zoomFactor)
    zoom(pix, zoomFactor) {
        const cF = this;
        // Fixed pointc, et affichage
        const mouseC = this.pix2c(pix);
        //todo: event ! this.parent.updateStatusBar(mouseC, pix);
        // Ratio normalisé du pointeur par rapport au centre du canvas (-0.5 à +0.5)
        const w = this.copySize.x;
        const h = this.copySize.y;
        const alpha = pix.x / w - 0.5;
        const beta = 0.5 - pix.y / h;
        // Déplacement du centre : l'écart sous la souris est réduit par (1 - zoomFactor)
        cF.center.re += alpha * cF.span.re * (1 - zoomFactor);
        cF.center.im += beta * cF.span.im * (1 - zoomFactor);
        // Ajustement final des échelles (spans)
        cF.span.re *= zoomFactor;
        cF.span.im *= zoomFactor;
        // Relance
        this.dirty = true;
    }
    resetZoom() {
        const cF = this;
        cF.center.re = cF.typeName === "JULIA" ? 0.0 : -0.7;
        cF.center.im = 0.0;
        cF.dia = 3.0;
        this.dirty = true;
    }
} /** */
//# sourceMappingURL=cFractParams.js.map