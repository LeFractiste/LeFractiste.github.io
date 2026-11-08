// app/cFract.ts - Copyright LeFractiste 2026
/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Spec V4: Affichage parallèle de Mandelbrot et Julia, avec affichage des valeurs de c et interactions souris.
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
<<<<<<< HEAD
 * Plan V5: ordre de récupération: basic.html + bmp, fractTypes + cFract + cFractParams + overlay, + cImage + cCalc.test
 * Suite: cCalc(iter),  DEM + palette, mouseEvents
 
// #region TODO
 * @todo 0: code/refactor : migration ts, galère !
 * @todo 1: code/refactor/appDev.js --> ts !  oui, il faut le faire, après diminution AddDev --> cFract functions / events !
 * @todo 0: code/refact: migration params, galère*
 * @todo 0: génération du html, galère non débuggable ! Revenir en arrière, et générer du code console ?
 * @todo 1: 
 * @todo 1: code/parent: Utiliser le parent pour accéder à params (pour calc, analysis, input Router, fractDraw, externalRay = tous)
 * @todo 2: code/calc: Gérer param.calcMode et implémenter cFractCalc.setMode ?
 * @todo 2: code/HTML : Mandel utilise html-helper pour faire url<-->params
 * @todo 1: UX/App - Aménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo 2: Calc/maxIter ? Le calculer pour la bonne résolution DEM. Critère: un point "noir" est à une distance/pixel > 2
 * @todo 2: UX/extRay: avancer jusqu'au dernier pixel, puis zoomer (x10) et avancer jusqu'au derier pixel.
 * @todo 2*: UX/data: historique de zoom : push, pop position (&vecteur: dia/rotation) + mémoriser customer data et options d'image.
 * @todo 1: UX/html - ajout automatisé de boutons d'interface maxIter & setCalc (interface UX(btnX): html.addBtn(X, onclick): id=btnX, onClickX?)
 * @todo 2: Calc/perfo: - vitesse de chargement : init bmp pour mandel
 * @todo 0: Pres - CSS: regrouper les CSS dans un CSS de site ? (harmonie) 50%: couleurs des palletes et boutons
 * @todo 1: UX/srv: serveur d'image et url variable. 50%: manque update url (revoir svg)
 * @todo 2: UX/cImage - definir l'interface commun à Iter float et Dist/pix (négative ou reuse des Iter petits ? Mais dist0=iter grands !)
 * @todo 1*: UX/PaletteEditor: le respécifier avec nodes et le fAIre. Voir chez Lily.
 * @todo 3: Web/SEO : SEO site + copyright + pub Utube
=======
 * Spec V5: Version en TypeScript, proche du petit package(?)
 *   Il reste à : gérer les mouse touch events, et documenter, puis étoffer: intégrer analyse, cTest, zoonorama en Rust.
>>>>>>> rescue-stash
 */

// #region IMPORT

import init, { MandelEngine } from "../../pkg/rust_m.js";
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { IFractCard, IHTMLSetupOptions, setupFractalCanvas } from "../app/cFractHtml.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cFractParams } from "../calc/cFractParams.js";
import { cUtils } from "../calc/utils.js";
import { PointerRouter } from "../app/inputRouter.js";
import { cTest } from "../analysis/cTest.js";
import {
  ComplexPoint,
  PixelPoint,
  IParent,
  IParams,
  ColorRGBA,
  IPointerRouter,
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
  public inputRouter: IPointerRouter;
  public T: cTest;
  //Calc variables: //todo 2: envoyer des variables dans calc ? StateMachine ici
  //public statusId: string;
  private resetEl: HTMLElement;
  // special points
  public lockedJulia: IParent | null = null; // close minibrot in analysis
  public cDeep: ComplexPoint = { re: 0.0, im: 0.0 }; // hoverPoint
  public orbit: ComplexPoint[] = [this.cDeep]; // related orbit
  public fixedPoints: ComplexPoint[] = []; // for Julia
  // remote access through IParent (stupid: there is access write via params.centre=newC) !
  get params(): IParams {
    return this._params as IParams;
  }

  constructor(canvasId: string, type = "MANDELBROT", statusId: string, resetId: string) {
    statusEl: HTMLElement;
    const statusEl = document.getElementById(statusId) as HTMLElement;
    if (!statusEl) debugger;
    this.T = new cTest(statusEl);
    this.T.userInfo("Loading...");
    this.resetEl = document.getElementById(resetId) as HTMLElement;
    if (!this.resetEl) throw new Error(`Button #${resetId} introuvable`);
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas #${canvasId} introuvable`);
    this.ctx = this.canvas.getContext("2d")!;
    // Crée cImage / pres
    this.cImage = new cImage(this.canvas.width, this.canvas.height); //passer canvas et déléguer DrawOverlay ?
    // Crée params - pourquoi private?
    this._params = new cFractParams(type, this);
    // Crée calc - sans calcul
    this.calc = new cFractCalc(this);
    this.draw = new cFractDraw(this);
    this.inputRouter = new PointerRouter(this.canvas);
  }

  // #region Init

  // Launch the objet: calc, render, palette and events
  async initParent(paletteLut?: Uint8Array): Promise<void> {
    // initialiser tout sauf calc
    if (paletteLut) this.cImage.updatePalette(paletteLut);
    // Last step: calc & rust & calcul up to render (point dur !)
    await this.calc.initCalc();
    this.T.userInfo("Initialized");
    this.render();
    // Initialisation des événements
    const cb = this.genCbEvents();
    this.inputRouter.bindDOMEvents(cb, this.resetEl);
  }

  // #region Events-UX
  // Câblage des PointerEventCallbacks
  genCbEvents(): PointerEventCallbacks {
    const callbacks: PointerEventCallbacks = {
      // SURVOL (HOVER) : Met à jour le statut avec les coordonnées complexes sous la souris
      onHover: (px: PixelPoint) => {
        this.cDeep = this._params.pix2c(px);
        // Logique spécifique Main
        if (this.lockedJulia) this.orbit = this.calc.calcOrbit(this.cDeep); // debugger d'abord !
        const testIter: number = this.calc.getAt(px);
        const testRgba: ColorRGBA = this.cImage.getAt(px);
        this.displayState(
          `[Hoover] iter=${this.orbit.length}/${testIter} | ${JSON.stringify(testIter)} | `,
          this.cDeep,
          px
        );
        this.render();
      },
      // CLIC : Sélectionne ou fixe un point
      onClick: (px: PixelPoint) => {
        const pC = this._params.pix2c(px);
        // Logique spécifique Main
        if (this.lockedJulia) this.lockedJulia.params.setJuliaC(pC);
        this._params.onClick(px); // render this
        this.displayState("[Click]", pC, px);
      },
      // ZOOM (Molette) : Utilise la méthode zoom de cFractParams
      onZoom: (px: PixelPoint, factor: number) => {
        const pC = this._params.pix2c(px);
        this._params.onZoom(px, factor); // zoom autour du point
        this.displayState("[Zoom]", pC, px);
      },
      // PAN (Glisser) : Déplace le centre
      onDrag: (deltaPx: PixelPoint) => {
        this._params.onDrag(deltaPx);
        const pC = this._params.center;
        //const px = { x: 0.0, y: 0.0 };
        this.displayState("[OnDrag]", pC, deltaPx);
      },
      // RESET
      onReset: () => {
        this._params.onReset();
        const pC = this._params.center;
        const px = this._params.c2pix(pC);
        this.displayState("[Reset]", pC, px);
      }
    };
    return callbacks;
  }

  // #region Render

  /** Handles the display, as necessary
   */
  render(): void {
    // console.trace("cFract.render");
    // recomputes if necessary (dirty) and possible (busy)
    const cFP = this._params;
    if (cFP.dirty) {
      this.calc.reCalcGrid(); //reset of dirty
      // recalcul des overlay ?
      // à faire
    }
    // Envoi de l'image (pour effacer overlay)
    this.ctx.putImageData(this.cImage.buffer, 0, 0);
    // Envoi de l'orbite
    this.draw.drawComplexPath(this.orbit);
    // Envoi des overlay
    if (cFP.isJulia) {
      //this.draw.drawFixedPointsOverlay(this); /** @todo mal initialisé */
      this.draw.drawReticle(cFP.c2pix(cFP.juliaC));
    } else {
      if (this.lockedJulia)
        this.draw.drawReticle(cFP.c2pix(this.lockedJulia.params.juliaC));
    }
  }

  /** Draw overlay with default options
  drawOrbitOverlay(orbit: ComplexPoint[]): void {
    console.trace("cFract.Overlay");
    this.render(); // lent mais...
    cFractDraw.drawComplexPath(this, orbit, {});
  } /**/

  // #region Status UI & Helpers

  // Display the cfract state
  displayState(action: string, c?: ComplexPoint, pix?: PixelPoint): void {
    // Prepare display msg
    const cF = this;
    const cFP = this._params;
    //const spyImage = cF.cImage.imageData.data.subarray(0, 5).join(","); //move to spy()
    //const spyWasmPayload = cF.calc.calcBuffer;
    let msg = action;
    if (cF.params.isJulia) {
      msg += ` | JuliaC: ${cUtils.complexToString(cFP.juliaC)}\n`;
    }
    if (c) msg += `${cUtils.complexToString(c)}`;
    if (pix) {
      msg += ` | px=${Math.floor(pix.x)} py=${Math.floor(pix.y)}`;
    }
    msg += ` | dia=${cFP.dia.toExponential(1)}`;
    msg += ` | calc: ${cF.calc.calcCount}`;
    this.T.userInfo(msg);
  }

  // #region OLD_STUFF

  /** updateStatusBar(c: ComplexPoint, px: number, py: number): void {
    const status = document.getElementById(this.statusId);
    if (!status) return;

    let msg = `${cUtils.complexToString(c)} | counter: ${this.calc.calcCount}`;
    /** if (this._params.typeName === "JULIA") {
      msg += ` | JULIA: ${cUtils.complexToString(this._params.juliaC)}`;
    } 
    msg += ` | px=${Math.floor(px)} py=${Math.floor(py)}`;
    status.textContent = msg;
  }

  //classConsole(msg: string): void {
    const status = document.getElementById(this.statusId);
    if (status) {
      status.textContent = `[INFO] ${msg}`;
    }
  } /**/

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

// #end region
