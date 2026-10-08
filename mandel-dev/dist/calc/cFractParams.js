/** calc/cFractParam.ts - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul
 *
 * @todo  mandel utilise html-helper pour faire url<-->params
 * @todo  aménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo: Eliminer MaxIter ? Le calculer pour la bonne résolution DEM
 */
export class cFractParams {
    type; //supprimer !
    center;
    spanRe;
    max_iter;
    r2_max;
    juliaC; //exigé par rust-m, à rendre optionel?
    constructor(type = "MANDELBROT") {
        this.type = type;
        this.center = type === "MANDELBROT" ? { re: -0.7, im: 0.0 } : { re: 0.0, im: 0.0 };
        this.spanRe = 3.0;
        this.max_iter = type === "MANDELBROT" ? 300 : 100;
        this.r2_max = 100000.0;
        // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
        this.juliaC = { re: -0.7, im: 0.27015 };
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
            type: this.type,
            center: [this.center.re, this.center.im],
            span: [this.span.re, this.span.im],
            max_iter: this.max_iter,
            r2_max: this.r2_max,
            juliaC: [this.juliaC.re, this.juliaC.im]
        });
    }
    //Clonage de l'objet
    clone() {
        const p = new cFractParams(this.type, this.center.re, this.center.im, this.span.re, this.max_iter, this.r2_max, this.juliaC);
        p.span.im = this.span.im;
        return p;
    }
    /** @todo : gérer le recalcul automatique avec calc.callback ou param.onchange ? */
    makeDirty() { }
    // Gestion du type (encore non utilisé)
    setType(type, juliaC = null) {
        this.type = type; // 'MANDELBROT' ou 'JULIA'
        if (juliaC)
            this.juliaC = juliaC;
        this.makeDirty();
    }
    // Centrage (pan)
    setCenter(c) {
        //modifié: était setCenter(re, im) !
        this.center = { re: c.re, im: c.im };
        this.makeDirty();
    }
    //moved to calc !
    setCalcMode() { }
    // helper: aspect ratio adjustment
    updateAspect(width, height) {
        const aspect = height / width;
        this.span.im = this.span.re * aspect;
    }
    // Transformation (linéaire) du plan //@todo: erreur, tester
    pix2c(point, width, height) {
        const re = this.center.re + (point.x / width - 0.5) * this.span.re;
        const im = this.center.im - (point.y / height - 0.5) * this.span.im;
        return { re, im };
    }
    /** Transformation (linéaire) du plan //@todo: erreur, tester
    js-pix2c(point) {
      const cF = this.param;
      const re = cF.center.re + (point.x / this.canvas.width - 0.5) * cF.span.re;
      const im = cF.center.im - (point.y / this.canvas.height - 0.5) * cF.span.im;
      return { re: re, im: im };*/
    c2pix(c, width, height) {
        const px = ((c.re - this.center.re) / this.span.re + 0.5) * width;
        const py = (0.5 - (c.im - this.center.im) / this.span.im) * height;
        return { x: px, y: py };
    }
}
//# sourceMappingURL=cFractParams.js.map