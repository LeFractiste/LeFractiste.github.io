/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */

console.log("cFractParams 1");

import { IParams, ComplexPoint, PixelPoint, IParent } from "../fractTypes.js";
import { cUtils } from "../calc/utils.js";
import { cTest } from "../analysis/cTest.js";

const T = new cTest("cFractCalc");
console.log("cFractParams 2");

export class cFractParams implements IParams {
  public parent: IParent | undefined; //access to cFract (for all)
  public typeName: string; //à supprimer quand Rust changera (exige JuliaC alors que Mandelbrot=(JuliaC= Undefined)
  public size: PixelPoint = { x: 400, y: 300 };
  private _center: ComplexPoint; //controled property
  public aspectRatio: number = 4 / 3; //800-600 par défaut!
  public dia: number;
  public max_iter: number;
  public r2_max: number;
  public juliaC: ComplexPoint; //exigé par rust-m, à rendre optionel?
  public dirty: boolean;
  public angleDeg: number = 0.0;
  //public FractConsole: event;

  constructor(typeName: string = "MANDELBROT", parent?: IParent) {
    if (parent) this.parent = parent;
    this.typeName = typeName;
    this._center =
      typeName === "MANDELBROT" ? { re: -0.7, im: 0.0 } : { re: 0.0, im: 0.0 };
    this.dia = 2.25; // 2.25
    this.max_iter = typeName === "MANDELBROT" ? 300 : 100;
    this.r2_max = 100000.0;
    // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
    this.juliaC = { re: -0.7, im: 0.27015 };
    this.dirty = true;
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
  public toMetadata(): string {
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
  public setJuliaC(juliaC: ComplexPoint) {
    this.juliaC = juliaC;
    this.dirty = true;
    this.displayState("[Zoom]");
  }
  // Computed span, so that dia is represented
  public get span(): ComplexPoint {
    if (this.size.y > this.size.x) {
      return { re: this.dia, im: this.dia / this.aspectRatio };
    } else {
      return { re: this.dia * this.aspectRatio, im: this.dia };
    }
  }
  // Centrage (pan)
  // GETTER: direct access
  public get center(): ComplexPoint {
    return this._center;
  }
  // SETTER: activates dirty for recalc
  public set center(c: ComplexPoint) {
    this._center = c;
    this.dirty = true;
    this.displayState("[Drag]");
  }
  // Vector: diameter and rotation angle in deg
  setVector(dia: number, angleDeg: number = 0.0) {
    this.dia = dia;
    this.angleDeg = angleDeg;
    this.dirty = true;
    this.displayState("[Vector]");
  }
  initSize(size: PixelPoint) {
    this.size = size;
    this.aspectRatio = size.y / size.x;
    this.dirty = true;
    this.displayState("[Size]");
  }

  // Transformation (linéaire) du plan - canvas vers complexe
  pix2c(point: PixelPoint): ComplexPoint {
    const cF = this;
    const re = cF.center.re + (point.x / cF.size.x - 0.5) * cF.span.re;
    const im = cF.center.im - (point.y / cF.size.y - 0.5) * cF.span.im;
    return { re, im };
  }
  // Transformation linéaire du plan - complexe vers canvas
  c2pix(c: ComplexPoint): PixelPoint {
    const cF = this;
    const px = ((c.re - cF.center.re) / cF.span.re + 0.5) * cF.size.x;
    const py = (0.5 - (c.im - cF.center.im) / cF.span.im) * cF.size.y;
    return { x: px, y: py };
  }

  // Zoom around a fixed point (used for Mouse scroll)
  // Algorithme: l'écart sous la souris est réduit par (1 - zoomFactor)
  zoom(pix: PixelPoint, zoomFactor: number): void {
    const cF: cFractParams = this;
    // Fixed pointc, et affichage
    const mouseC = this.pix2c(pix);
    //todo: event ! this.parent.updateStatusBar(mouseC, pix);
    // Ratio normalisé du pointeur par rapport au centre du canvas (-0.5 à +0.5)
    const w = this.size.x;
    const h = this.size.y;
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
    this.displayState("[Zoom]");
  }
  resetZoom(): void {
    const cF = this;
    cF.center.re = cF.typeName === "JULIA" ? 0.0 : -0.7;
    cF.center.im = 0.0;
    cF.dia = 2.25; // 9/4
    this.dirty = true;
    this.displayState("[Reset]");
  }
  displayState(action: string): void {
    const status = document.getElementById(this.statusId);
    if (!status) return;

    let msg = `${cUtils.complexToString(c)} | counter: ${this.calcCount}`;
    if (this.params.typeName === "JULIA") {
      msg += ` | JULIA: ${cUtils.complexToString(this.params.juliaC)}`;
    }
    msg += ` | px=${Math.floor(px)} py=${Math.floor(py)}`;
    status.textContent = msg;
    if (this.parent) {
      this.parent.classConsole(msg);
    }
  }
} /** */
