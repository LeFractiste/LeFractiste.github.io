// app/cFract.ts - Copyright LeFractiste 2026
/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Spec V4: Affichage parallèle de Mandelbrot et Julia, avec affichage des valeurs de c et interactions souris.
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Spec V5: Version en TypeScript, proche du petit package(?)
 *   Il reste à : gérer les mouse touch events, et documenter, puis étoffer: intégrer analyse, cTest, zoonorama en Rust.
 */

// #region IMPORT

import init, { MandelEngine } from "../../pkg/rust_m.js";
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import {
  IHTMLFractContainer,
  IHTMLSetupOptions,
  setupFractalCanvas,
  updateParamsFromURL,
  updateURLfromParams
} from "../app/cFractHtml.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cFractParams } from "../calc/cFractParams.js";
import { cUtils } from "../calc/utils.js";
import { ComplexPoint, PixelPoint, IParent, IParams } from "../fractTypes.js";

// #region CFRACT
export class cFract implements IParent {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public cImage: cImage;
  private _params: cFractParams;
  public calc: cFractCalc;

  //Calc variables: //todo 2: envoyer des variables dans calc ? StateMachine ici
  public statusId: string;
  //public autoCalc: boolean = true; //event app...
  public orbit: ComplexPoint[] = [{ re: 0.0, im: 0.0 }];
  private fixedPoints: ComplexPoint[] = [];
  get params(): IParams {
    return this._params as IParams;
  }

  constructor(canvasId: string, type = "MANDELBROT", statusId: string) {
    this.statusId = statusId;
    this.classConsole("Loading...");
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas #${canvasId} introuvable`);
    this.ctx = this.canvas.getContext("2d")!;
    // Crée cImage / pres
    this.cImage = new cImage(this.canvas.width, this.canvas.height); //passer canvas et déléguer DrawOverlay ?
    // Crée params - pourquoi private?
    this._params = new cFractParams(type, this);
    // Crée calc - sasn calcul
    this.calc = new cFractCalc(this);
  }

  // Launch the objet, up to calc.initCalc(handling wasm)
  async initParent(paletteLut?: Uint8Array): Promise<void> {
    // initialiser tout sauf calc
    if (paletteLut) this.cImage.updatePalette(paletteLut);
    // Last step: calc & rust & calcul up to render (point dur !)
    try {
      await this.calc.initCalc();
      this.classConsole("Initialized");
      this.render();
    } catch (e) {
      this.classConsole("Error cFract init");
    }
    // InitCalc appelle render à la fin
  }

  // #region Render

  /** Handles the display, as necessary
   */
  render(): void {
    console.trace("cFract.render");
    // recomputes if necessary (dirty) and possible (busy)
    if (this._params.dirty) {
      this.calc.calcFull();
      // recalcul des overlay ?
      // à faire
      // Envoi de l'image
      this.ctx.putImageData(this.cImage.imageData, 0, 0);
      // Envoi de l'orbite
      cFractDraw.drawComplexPath(this, this.orbit);
      // Envoi des overlay
      this.drawFixedPointsOverlay(); //via image ou Pres ?
    }
  }

  /** Draw overlay with default options
  drawOrbitOverlay(orbit: ComplexPoint[]): void {
    console.trace("cFract.Overlay");
    this.render(); // lent mais...
    cFractDraw.drawComplexPath(this, orbit, {});
  } /**/

  // Computes a new orbit
  set cDeep(c: ComplexPoint) {
    this.orbit = this.calc.calcOrbit(c);
    this.render();
  }

  drawFixedPointsOverlay(): void {
    cFractDraw.drawFixedPointsOverlay(
      this.ctx,
      this._params,
      this.canvas.width,
      this.canvas.height,
      this.fixedPoints
    );
  }

  // #region Status UI & Helpers

  updateStatusBar(c: ComplexPoint, px: number, py: number): void {
    const status = document.getElementById(this.statusId);
    if (!status) return;

    let msg = `${cUtils.complexToString(c)} | counter: ${this.calc.calcCount}`;
    if (this._params.typeName === "JULIA") {
      msg += ` | JULIA: ${cUtils.complexToString(this._params.juliaC)}`;
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

  /** Creation d'objet standard : à revoir
  static newMandelbrot(): cFractParams {
    return new cFractParams("MANDELBROT");
  } 
  static newJulia(c: ComplexPoint): cFractParams {
    const params = new cFractParams("JULIA");
    params.juliaC = c;
    return params;
  } /** */

  /** A déplacer vers appDev et corriger
  // appInit - Fonction .ts temporairemnt ici  (pour appDev)
  async appInit(containerId = "MANDELBROT") {
    // 1. Déduction des paramètres depuis l'URL ou fallback par défaut
    const params = updateParamsFromURL(this._params);

    // 2. Préparation du DOM
    const containerInfo = setupFractalCanvas({ containerId: params.typeName as any });

    // 3. Création et initialisation du moteur cFract
    const mainFract = new cFract(
      containerInfo.canvasId,
      params.typeName,
      containerInfo.statusId
    );
    mainFract.params = params; // Injection des paramètres
    await mainFract.initParent();

    return mainFract;
  } /** */

  /** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
   * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
   
  async runImageServer(containerId: string) {
    // 1. Instanciation du DOM via htmlHelper
    const options: IHTMLSetupOptions = { containerId: containerId };
    const FC: IHTMLFractContainer = setupFractalCanvas(options);
    // 2. Initialisation du moteur cFract
    const myFract = new cFract(FC.canvasId, FC.type, FC.statusId);
    await myFract.initParent();
    // 3. Application des paramètres d'URL
    updateParamsFromURL(myFract.params);
    // 4. Calcul et rendu initial
    myFract.render();
  } /** */
}
