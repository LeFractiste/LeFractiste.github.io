// app/cFract.ts - Copyright LeFractiste 2026
// Contrôleur principal et façade publique
//TODO 1 : implémenter selectCalcMode
//TODO 2 : vitesse de chargement : init bmp pour mandel
//TODO 2 : regrouper les CSS dans un CSS de site ? (harmonie)
//TODO 0 : génération du html, galère non débuggable !
//TODO 0 : migration ts, galère !
//TODO 0 : migration params, galère
//TODO 1 : serveur d'image et url variable
//TODO 3 : SEO site + copyright + pub Utube

import init, { MandelEngine } from "../../pkg/rust_m.js";
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import {
  htmlFractContainer,
  htmlSetupOptions,
  setupFractalCanvas,
  parseHashParams,
  todo_paramsToURL
} from "../app/cFractHtml.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cFractParams } from "../calc/cFractParams.js";
import { ComplexPoint, PixelPoint } from "../fractTypes.js";

export class cFract {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public cImage: cImage;
  public params: cFractParams;
  public calc: cFractCalc;

  //Calc variables: //todo 2: ce bloc de varaibles doit-il aller dans calc ?
  public statusId: string;
  public calcMode: string;
  public calcCount: number;
  public autoCalc: boolean;
  public isBusy: boolean;
  public isDirty: boolean;

  private wasmEngine: any = null;
  private wasmMemory: any = null;
  private fixedPoints: ComplexPoint[] = [];

  constructor(canvasId: string, type = "MANDELBROT", statusId: string) {
    this.statusId = statusId;
    this.classConsole("Loading...");

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas #${canvasId} introuvable`);
    this.ctx = this.canvas.getContext("2d")!;

    this.cImage = new cImage(this.canvas.width, this.canvas.height);
    this.params = new cFractParams(type);
    this.calc = new cFractCalc();

    this.updateAspect();

    this.calcMode = "DEM"; // Enum: 'DIRECT', 'DEM', 'DEM_QUAD', 'DELEGATE'
    this.calcCount = 0;
    this.isDirty = true;
    this.autoCalc = true;
    this.isBusy = true;

    this.makeDirty();
  }

  async init(paletteLut?: Uint8Array): Promise<void> {
    try {
      const wasmExports = await init();
      this.wasmMemory = wasmExports.memory;
      this.wasmEngine = new MandelEngine(this.canvas.width, this.canvas.height);

      this.calc.setWasmReference(this.wasmEngine, this.wasmMemory);
      this.classConsole("Initialized");
    } catch (e) {
      this.classConsole("Error Wasm init");
    }

    if (paletteLut) this.cImage.updatePalette(paletteLut);
    this.isBusy = false;
    this.makeDirty();
  }

  // #region Manage - Cycle de vie des étapes de calcul
  makeDirty(): void {
    this.isDirty = true;
    if (this.autoCalc && !this.isBusy) this.calcFull();
  }

  makeClean(): void {
    this.render();
    this.isDirty = false;
    this.isBusy = false;
  }

  calcFull(): void {
    if (this.isBusy) return;
    this.isBusy = true;
    this.calcCount++;

    try {
      if (this.wasmEngine) {
        const payload = this.calc.computeWasmPayload(
          this.params,
          this.canvas.width,
          this.canvas.height,
          this.calcMode
        );
        this.cImage.updateFromWasmPayload(payload, this.params.max_iter);
      }
    } catch (err) {
      console.error("[cFract] Erreur lors du calcul :", err);
    } finally {
      this.makeClean();
    }
  }

  render(): void {
    this.ctx.putImageData(this.cImage.imageData, 0, 0);
    this.drawFixedPointsOverlay();
  }

  drawFixedPointsOverlay(): void {
    cFractDraw.drawFixedPointsOverlay(
      this.ctx,
      this.params,
      this.canvas.width,
      this.canvas.height,
      this.fixedPoints
    );
  }

  // #region Getters & Setters
  setType(type: string, juliaC: ComplexPoint | null = null): void {
    this.params.type = type;
    if (juliaC) this.params.juliaC = { ...juliaC };
    this.makeDirty();
  }

  getCenter(): ComplexPoint {
    return { ...this.params.center };
  }

  setCenter(c: ComplexPoint): void {
    this.params.center = { re: c.re, im: c.im };
    this.makeDirty();
  }

  setCalcMode(mode: string): void {
    this.calcMode = mode;
    this.makeDirty();
  }

  updateAspect(): void {
    this.params.updateAspect(this.canvas.width, this.canvas.height);
  }

  pix2c(point: PixelPoint): ComplexPoint {
    return this.params.pix2c(point, this.canvas.width, this.canvas.height);
  }

  c2pix(c: ComplexPoint): PixelPoint {
    return this.params.c2pix(c, this.canvas.width, this.canvas.height);
  }

  zoom(px: number, py: number, zoomFactor: number): void {
    const mouseC = this.pix2c({ x: px, y: py });
    this.updateStatusBar(mouseC, px, py);

    const w = this.canvas.width;
    const h = this.canvas.height;
    const alpha = px / w - 0.5;
    const beta = 0.5 - py / h;

    this.params.center.re += alpha * this.params.span.re * (1 - zoomFactor);
    this.params.center.im += beta * this.params.span.im * (1 - zoomFactor);
    this.params.span.re *= zoomFactor;
    this.params.span.im *= zoomFactor;

    this.makeDirty();
  }

  resetZoom(): void {
    this.params.center.re = this.params.type === "JULIA" ? 0.0 : -0.7;
    this.params.center.im = 0.0;
    this.params.dia = 3.0;
    this.updateAspect();
    this.makeDirty();
  }

  // #region Status UI & Helpers
  complexToString(c: ComplexPoint, digits = 7): string {
    return `${c.re.toFixed(digits)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(digits)}i`;
  }

  updateStatusBar(c: ComplexPoint, px: number, py: number): void {
    const status = document.getElementById(this.statusId);
    if (!status) return;

    let msg = `${this.complexToString(c)} | counter: ${this.calcCount}`;
    if (this.params.type === "JULIA") {
      msg += ` | JULIA: ${this.complexToString(this.params.juliaC)}`;
    }
    msg += ` | px=${Math.floor(px)} py=${Math.floor(py)}`;
    status.textContent = msg;
  }

  classConsole(msg: string): void {
    const status = document.getElementById(this.statusId);
    if (status) {
      status.textContent = `[INFO] ${msg}`;
    }
  }
}

export async function appInit(containerId = "MANDELBROT") {
  // 1. Déduction des paramètres depuis l'URL ou fallback par défaut
  const param = parseHashParams() || new cFractParams(containerId);

  // 2. Préparation du DOM
  const containerInfo = setupFractalCanvas({ containerId: param.type as any });

  // 3. Création et initialisation du moteur cFract
  const engine = new cFract(containerInfo.canvasId, param.type, containerInfo.statusId);
  engine.params = param; // Injection des paramètres
  await engine.init();

  return engine;
}

/** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
 * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
 */
export async function runImageServer(containerId: string) {
  // 1. Instanciation du DOM via htmlHelper
  const options: htmlSetupOptions = { containerId: containerId };
  const FC: htmlFractContainer = setupFractalCanvas(options);
  // 2. Initialisation du moteur cFract
  const engine = new cFract(FC.canvasId, FC.type, FC.statusId);
  await engine.init();
  // 3. Application des paramètres d'URL
  const cfg: cFractParams = parseHashParams();
  engine.setType(cfg.type);
  engine.setCenter(cfg.center);
  engine.params.dia = cfg.dia; //contourne l'interface setSpan qui n'existe pas encore !
  engine.updateAspect();
  // 4. Calcul et rendu initial
  engine.makeDirty();
}
