/** calc/cFractParam.ts - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */
export class cFractParams {
    type; //à supprimer quand Rust changera (exige JuliaC alors que Mandelbrot=(JuliaC= Undefined)
    center;
    aspectRatio = 4 / 3; //800-600 par défaut!
    dia;
    max_iter;
    r2_max;
    juliaC; //exigé par rust-m, à rendre optionel?
    angleDeg = 0.0;
    constructor(type = "MANDELBROT") {
        this.type = type;
        this.center = type === "MANDELBROT" ? { re: -0.7, im: 0.0 } : { re: 0.0, im: 0.0 };
        this.dia = 3.0;
        this.max_iter = type === "MANDELBROT" ? 300 : 100;
        this.r2_max = 100000.0;
        // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
        this.juliaC = { re: -0.7, im: 0.27015 };
    }
    get span() {
        return {
            re: this.dia,
            im: this.dia / this.aspectRatio
        };
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
            dia: [this.span.re, this.span.im],
            max_iter: this.max_iter,
            r2_max: this.r2_max,
            juliaC: [this.juliaC.re, this.juliaC.im]
        });
    }
    /** Exporte la structure exacte attendue par les fonctions de Wasm-Rust */
    toRustArgs(width, height) {
        return {
            width,
            height,
            center_re: this.center.re,
            center_im: this.center.im,
            span_Re: this.span.re,
            span_Im: this.span.im,
            max_iter: this.max_iter,
            r2_max: this.r2_max,
            julia_re: this.juliaC.re,
            julia_im: this.juliaC.im
        };
    }
    /** Clonage de l'objet //not used
    clone(): cFractParams {
      const p = new cFractParams(this.type);
      p.center = this.center; //etc
      return p;
    } */
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