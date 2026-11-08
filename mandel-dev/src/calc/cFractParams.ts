/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */

import { IParams, ComplexPoint, PixelPoint, IParent, FractType } from "../fractTypes.js";
import { cUtils } from "../calc/utils.js";

// #region cFractParams

// cFractparams : paramètres du calcul asynchrone
export class cFractParams implements IParams {
  private parent: IParent; // utilisé pour l'affichage sans event
  public center: ComplexPoint; //controled property
  public dirty: boolean;
  public type: FractType;
  public size: PixelPoint;
  public aspectRatio: number; //800-600 par défaut!
  public dia: number;
  public iterMax: number;
  public r2Max: number;
  public juliaC: ComplexPoint; //exigé par rust-m, à rendre optionel?
  //public dirty: boolean;
  public angleDeg: number = 0.0;
  // #region constructor

  constructor(typeName: string, parent: IParent) {
    this.parent = parent;
    const defaultType: FractType = "MANDELBROT";
    const testType: string = typeName.toUpperCase();
    this.type = (testType as FractType) || defaultType;
    this.center = this.isJulia ? { re: 0.0, im: 0.0 } : { re: -0.7, im: 0.0 };
    this.dia = 2.25; // 2.25
    this.iterMax = typeName === defaultType ? 300 : 100;
    this.r2Max = 100000.0;
    // Toujours initialisé pour satisfaire Rust-M même en Mandelbrot
    this.juliaC = { re: -0.7, im: 0.27015 };
    this.size = { x: this.parent.canvas.width, y: this.parent.canvas.height };
    this.aspectRatio = this.size.y / this.size.x;
    this.dirty = true; // no calc here
  }
  /**  */

  // Métadonnées d'export (Format propre pour Exif/PNG/HEIC JSON)
  public toMetadata(): string {
    return JSON.stringify({
      type: this.typeName,
      center: [this.center.re, this.center.im],
      vector: [this.dia, this.angleDeg],
      max_iter: this.iterMax,
      r2_max: this.r2Max,
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

  get typeName(): string {
    return this.type as string;
  }
  // Sets dirty and launches new rendering
  setDirty(value: boolean) {
    this.dirty = value;
    if (value) this.parent.render();
  }

  get isJulia(): boolean {
    return this.type === "JULIA";
  }
  setJuliaC(juliaC: ComplexPoint) {
    this.juliaC = juliaC;
    this.setDirty(true);
  }
  // Changes the size (not be used now !!!)
  setSize(size: PixelPoint) {
    this.size = size;
    this.aspectRatio = size.y / size.x;
    this.setDirty(true);
  }
  // Computed span, so that dia is represented
  get span(): ComplexPoint {
    if (this.size.y > this.size.x) {
      // aspectRatio= y/x
      return { re: this.dia, im: this.dia * this.aspectRatio };
    } else {
      return { re: this.dia / this.aspectRatio, im: this.dia };
    }
  }
  // New center value
  public setCenter(c: ComplexPoint) {
    this.center = c;
    this.setDirty(true);
  }
  // Vector: diameter and rotation angle in deg
  setVector(dia: number, angleDeg: number = 0.0) {
    this.dia = dia;
    this.angleDeg = angleDeg;
    this.setDirty(true);
  }

  // #region Proj

  // Transformation (linéaire) du plan - canvas vers complexe
  pix2c(point: PixelPoint): ComplexPoint {
    const cFP = this;
    const re = cFP.center.re + (point.x / cFP.size.x - 0.5) * cFP.span.re;
    const im = cFP.center.im - (point.y / cFP.size.y - 0.5) * cFP.span.im;
    return { re: re, im: im };
  }
  // Transformation linéaire du plan - complexe vers canvas pixel (integer)
  c2pix(c: ComplexPoint): PixelPoint {
    const cF = this;
    const px = Math.round(((c.re - cF.center.re) / cF.span.re + 0.5) * cF.size.x);
    const py = Math.round((0.5 - (c.im - cF.center.im) / cF.span.im) * cF.size.y);
    return { x: px, y: py };
  }

  // PAN (Glisser) : Déplace le centre
  onDrag(deltaPx: PixelPoint): void {
    const cFP = this;
    // Conversion du delta pixel en delta complexe et mise à jour du centre
    // (Exemple d'implémentation de pan basée sur ton span et taille)
    const span = cFP.span;
    const w = cFP.size.x;
    const h = cFP.size.y;
    cFP.center.re -= (deltaPx.x / w) * span.re;
    cFP.center.im += (deltaPx.y / h) * span.im; // y inversé
    this.setDirty(true);
  }
  onClick(pix: PixelPoint) {
    this.parent.render(); // to display the locked reticle
  }

  // Simple zoom from center
  onZoom_centered(zoomFactor: number): void {
    this.dia /= zoomFactor;
    this.setDirty(true);
  }

  // Zoom around a fixed point (used for Mouse scroll) or 2 fingers-touch
  onZoom(pix: PixelPoint, zoomFactor: number): void {
    const cFP: cFractParams = this;
    // Fixed pointc, et affichage
    const mouseC = this.pix2c(pix);
    // Ajustement du facteur d'échelle
    cFP.dia /= zoomFactor; // zoomFactor > 1 = deeper
    //todo: event ! this.parent.updateStatusBar(mouseC, pix);
    // Ratio normalisé du pointeur par rapport au centre du canvas (-0.5 à +0.5)
    const w = cFP.size.x;
    const h = cFP.size.y;
    const alpha = pix.x / w - 0.5;
    const beta = 0.5 - pix.y / h; // pix.y positif vers le bas
    // Déplacement du centre : l'écart sous la souris est réduit par (1 - zoomFactor)
    cFP.center = {
      re: mouseC.re - alpha * this.span.re,
      im: mouseC.im - beta * this.span.im
    };
    this.setDirty(true);
  }
  onReset(): void {
    const cFP = this;
    cFP.center.re = cFP.isJulia ? 0 : -0.7;
    cFP.center.im = 0.0;
    cFP.dia = 2.25; // 9/4
    this.setDirty(true);
  }

  // #region display
  // untested
  spyPixelMemory(): void {
    if (!this.parent) return;
    // Prepare display msg
    const cFP = this;
    const cF = cFP.parent;
    const spyImage = cF.cImage.buffer.data.subarray(0, 5).join(",");
    const spyWasmPayload = cF.calc.calcBuffer;
  }
} /** */
