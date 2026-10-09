/** calc/cFractParam.ts - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul
 *
 * @todo  mandel utilise html-helper pour faire url<-->params
 * @todo  aménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo: Eliminer MaxIter ? Le calculer pour la bonne résolution DEM
 */

import { IParams, ComplexPoint, PixelPoint, FractType } from "../fractTypes.js";

export class cFractParams implements IParams {
  public type: string; //à supprimer quand Rust changera (exige JuliaC alors que Mandelbrot=(JuliaC= Undefined)
  public center: ComplexPoint;
  public aspectRatio: number = 4 / 3; //800-600 par défaut!
  public dia: number;
  public max_iter: number;
  public r2_max: number;
  public juliaC: ComplexPoint; //exigé par rust-m, à rendre optionel?
  public angleDeg: number = 0.0;
  constructor(type = "MANDELBROT") {
    this.type = type;
    this.center = type === "MANDELBROT" ? { re: -0.7, im: 0.0 } : { re: 0.0, im: 0.0 };
    this.dia = 3.0;
    this.max_iter = type === "MANDELBROT" ? 300 : 100;
    this.r2_max = 100000.0;
    // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
    this.juliaC = { re: -0.7, im: 0.27015 };
  }

  public get span(): { re: number; im: number } {
    return {
      re: this.dia,
      im: this.dia / this.aspectRatio
    };
  }

  static newMandelbrot(): cFractParams {
    return new cFractParams("MANDELBROT");
  }
  static newJulia(c: ComplexPoint): cFractParams {
    const params = new cFractParams("JULIA");
    params.juliaC = c;
    return params;
  }

  // Métadonnées d'export (Format propre pour Exif/PNG/HEIC JSON)
  toMetadata(): string {
    return JSON.stringify({
      type: this.type,
      center: [this.center.re, this.center.im],
      dia: [this.span.re, this.span.im],
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
  makeDirty(): void {}

  // Gestion du type (encore non utilisé)
  setType(type: FractType, juliaC = null) {
    this.type = type; // 'MANDELBROT' ou 'JULIA'
    if (juliaC) this.juliaC = juliaC;
    this.makeDirty();
  }

  // Centrage (pan)
  setCenter(c: ComplexPoint) {
    //modifié: était setCenter(re, im) !
    this.center = { re: c.re, im: c.im };
    this.makeDirty();
  }

  // helper: aspect ratio adjustment
  updateAspect(width: number, height: number): void {
    const aspect = height / width;
    this.span.im = this.span.re * aspect;
  }
  // Transformation (linéaire) du plan //@todo: erreur, tester
  pix2c(point: PixelPoint, width: number, height: number): ComplexPoint {
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

  c2pix(c: ComplexPoint, width: number, height: number): PixelPoint {
    const px = ((c.re - this.center.re) / this.span.re + 0.5) * width;
    const py = (0.5 - (c.im - this.center.im) / this.span.im) * height;
    return { x: px, y: py };
  }
  /*jsc2pix(c) {
    const cF = this.param;
    const px = ((c.re - cF.center.re) / cF.span.re + 0.5) * this.canvas.width;
    const py = (0.5 - (c.im - cF.center.im) / cF.span.im) * this.canvas.height;
    return { x: px, y: py };
  }

  //Zoom around a fixed point (used for Mouse scroll)
  // Algorithme: l'écart sous la souris est réduit par (1 - zoomFactor)
  zoom(px, py, zoomFactor) : void {
    const cF = this.param;
    // Fixed pointc, et affichage
    const mouseC = this.pix2c({ x: px, y: py });
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
  resetZoom() : void {
    const cF = this.param;
    cF.center.re = cF.type === "JULIA" ? 0.0 : -0.7;
    cF.center.im = 0.0;
    cF.span.re = 3.0;
    this.updateAspect(); // Calcule span.im
    this.makeDirty();
  } /**/
}
