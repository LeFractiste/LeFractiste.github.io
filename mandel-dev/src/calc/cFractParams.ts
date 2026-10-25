/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */

import { IParams, ComplexPoint, PixelPoint, IParent, FractType } from "../fractTypes.js";
import { cUtils } from "../calc/utils.js";

// #region cFractParams

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
  public angleDeg: number = 0.0;
  private _dirty: boolean;

  /** Reads dirty
   * @todo: useful ?)
   */
  public get dirty(): boolean {
    return this._dirty;
  }
  // Sets dirty and launches new rendering
  public set dirty(value: boolean) {
    this._dirty = value;
    if (value) this.parent.render();
  }

  // #region constructor

  constructor(typeName: string = "", parent: IParent) {
    const defaultType = "MANDELBROT";
    this.parent = parent;
    this.typeName = (typeName as FractType) ? typeName : defaultType;
    this._center =
      typeName === defaultType ? { re: -0.7, im: 0.0 } : { re: 0.0, im: 0.0 };
    this.dia = 2.25; // 2.25
    this.max_iter = typeName === defaultType ? 300 : 100;
    this.r2_max = 100000.0;
    // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
    this.juliaC = { re: -0.7, im: 0.27015 };
    this._dirty = true;
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

  // #region Getters - Setters

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

  // #region Proj

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

  // Simple zoom from center
  zoom(pix: PixelPoint, zoomFactor: number): void {
    this.dia /= zoomFactor;
    this.dirty = true;
    this.displayState("[Zoom]", this.center, pix);
  }

  // Zoom around a fixed point (used for Mouse scroll)
  // Algorithme: l'écart sous la souris est réduit par (1 - zoomFactor)
  old_zoom(pix: PixelPoint, zoomFactor: number): void {
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
    cFP.dia *= zoomFactor;
    // Relance
    this.dirty = true;
    this.displayState("[Zoom]", cFP.center, pix);
  }
  reset(): void {
    const cFP = this;
    cFP.center.re = cFP.typeName === "MANDELBROT" ? -0.7 : 0;
    cFP.center.im = 0.0;
    cFP.dia = 2.25; // 9/4
    this.dirty = true;
    this.displayState("[Reset]", cFP.center);
  }

  // #region display

  // Display the cfract state
  displayState(action: string, c?: ComplexPoint, pix?: PixelPoint): void {
    console.trace("cFractParams.displayState");
    if (!this.parent) return;
    // Prepare display msg
    const cFP = this;
    const cF = this.parent;
    const spyImage = cF.cImage.imageData.data.subarray(0, 5).join(",");
    const spyWasmPayload = cF.calc.calcBuffer;

    let msg = action;
    if (c) msg = `${cUtils.complexToString(c)}` + msg;
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
