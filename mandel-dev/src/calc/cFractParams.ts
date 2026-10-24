/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */

console.log("cFractParams 1");

import { IParams, ComplexPoint, PixelPoint, IParent } from "../fractTypes.js";
import { cUtils } from "../calc/utils.js";
import { cTest } from "../analysis/cTest.js";

const T = new cTest("cFractCalc");
console.log("cFractParams 2");

// cFractparams : paramètres du calcul asynchrone
export class cFractParams implements IParams {
  private parent: IParent; // utilisé pour l'affichage sans event
  public typeName: string; //à remplacer par get quand Rust changera (exige JuliaC alors que Mandelbrot=(JuliaC= Undefined)
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

  constructor(typeName: string = "MANDELBROT", parent: IParent) {
    this.parent = parent;
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
    this.displayState("[JuliaC]", this.juliaC);
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
    this.displayState("[Drag]", this.center);
  }
  // Vector: diameter and rotation angle in deg
  setVector(dia: number, angleDeg: number = 0.0) {
    this.dia = dia;
    this.angleDeg = angleDeg;
    this.dirty = true;
    this.displayState("[Vector] dia=${dia} angle=${angleDeg}");
  }
  initSize(size: PixelPoint) {
    this.size = size;
    this.aspectRatio = size.y / size.x;
    this.dirty = true;
    this.displayState(`[Size] size=${this.size.x} x ${this.size.y}`);
  }

  // Transformation (linéaire) du plan - canvas vers complexe
  pix2c(point: PixelPoint): ComplexPoint {
    const cFP = this;
    const re = cFP.center.re + (point.x / cFP.size.x - 0.5) * cFP.span.re;
    const im = cFP.center.im - (point.y / cFP.size.y - 0.5) * cFP.span.im;
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
    const cFP: cFractParams = this;
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
    cFP.span.re *= zoomFactor;
    cFP.span.im *= zoomFactor;
    // Relance
    this.dirty = true;
    this.displayState("[Zoom]", cFP.center, pix);
  }
  resetZoom(): void {
    const cFP = this;
    cFP.center.re = cFP.typeName === "JULIA" ? 0.0 : -0.7;
    cFP.center.im = 0.0;
    cFP.dia = 2.25; // 9/4
    this.dirty = true;
    this.displayState("[Reset]", cFP.center);
  }

  displayState(action: string, c?: ComplexPoint, pix?: PixelPoint): void {
    if (!this.parent) return;
    // Prepare display msg
    const cF = this.parent;
    let msg = action;
    if (c) msg = `${cUtils.complexToString(c)}` + msg;
    if (cF.params.typeName === "JULIA") {
      msg += ` | JULIA: ${cUtils.complexToString(cF.params.juliaC)}`;
    }
    if (pix) {
      msg += ` | px=${Math.floor(pix.x)} py=${Math.floor(pix.y)}`;
    }
    msg += ` | counter: ${cF.calc.calcCount}`;
    this.parent.classConsole(msg);
  }
} /** */
