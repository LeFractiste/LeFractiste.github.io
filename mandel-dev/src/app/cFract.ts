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
  IFractCard,
  IHTMLSetupOptions,
  setupFractalCanvas,
  updateParamsFromURL,
  updateURLfromParams
} from "../app/cFractHtml.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cFractParams } from "../calc/cFractParams.js";
import { cUtils } from "../calc/utils.js";
import { InputRouter } from "../app/inputRouter.js";
import {
  ComplexPoint,
  PixelPoint,
  IParent,
  IParams,
  IInputRouter,
  PointerEventCallbacks
} from "../fractTypes.js";

// #region CFRACT
export class cFract implements IParent {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public cImage: cImage;
  private _params: cFractParams;
  public calc: cFractCalc;
  public draw: cFractDraw;
  public inputRouter: IInputRouter;

  //Calc variables: //todo 2: envoyer des variables dans calc ? StateMachine ici
  public statusId: string;
  private lockedC: ComplexPoint | null = null;
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
    this.draw = new cFractDraw(this);
    this.inputRouter = new InputRouter(this.canvas);
  }

  // #region Init

  // Launch the objet: calc, render, palette and events
  async initParent(paletteLut?: Uint8Array, resetId?: string): Promise<void> {
    // initialiser tout sauf calc
    if (paletteLut) this.cImage.updatePalette(paletteLut);
    // Last step: calc & rust & calcul up to render (point dur !)
    await this.calc.initCalc();
    this.classConsole("Initialized");
    this.render();
    // Initialisation des événements
    const cb = this.genCbEvents(resetId);
    this.inputRouter.bindDOMEvents(cb);
  }

  // #region Events-UX
  // Câblage des PointerEventCallbacks
  genCbEvents(resetId?: string): PointerEventCallbacks {
    const callbacks: PointerEventCallbacks = {
      // SURVOL (HOVER) : Met à jour le statut avec les coordonnées complexes sous la souris
      onHover: (px: PixelPoint) => {
        const pC = this._params.pix2c(px);
        this.updateStatusBar(pC, px.x, px.y); /// XXXX ramener cette version ici !
      },
      // CLIC : Sélectionne ou fixe un point
      onClick: (px: PixelPoint) => {
        const pC = this._params.pix2c(px);
        this._params.displayState("[Click]", pC, px);
        // Logique spécifique Mandelbrot/Julia ici si besoin
      },
      // ZOOM (Molette) : Utilise la méthode zoom de cFractParams
      onZoom: (px: PixelPoint, factor: number) => {
        const cFP = this._params;
        cFP.onZoom(px, factor); // zoom autour du point
        cFP.displayState("[Zoom]", cFP.center, px);
      },
      // PAN (Glisser) : Déplace le centre
      onDrag: (deltaPx: PixelPoint) => {
        this._params.onDrag(deltaPx);
      },
      // RESET
      onReset: () => {
        this._params.onReset();
      }
    };
    return callbacks;
  }

  // #region Render

  /** Handles the display, as necessary
   */
  render(): void {
    console.trace("cFract.render");
    // recomputes if necessary (dirty) and possible (busy)
    const cFP = this._params;
    if (cFP.dirty) {
      this.calc.calcFull(); //reset of dirty
      // recalcul des overlay ?
      // à faire
      // Envoi de l'image
      this.ctx.putImageData(this.cImage.imageData, 0, 0);
    }
    // Envoi de l'orbite
    this.draw.drawComplexPath(this.orbit);
    // Envoi des overlay
    if ((cFP.typeName = "JULIA")) {
      //this.draw.drawFixedPointsOverlay(this); /** @todo mal initialisé */
      this.draw.drawReticle(cFP.c2pix(cFP.juliaC));
    } else {
      if (this.lockedC) this.draw.drawReticle(cFP.c2pix(this.lockedC));
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
