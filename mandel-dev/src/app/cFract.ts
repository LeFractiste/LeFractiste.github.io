// app/cFract.ts - Copyright LeFractiste 2026
/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Plan V4: affichier c en hover et ajouter le touch zoom
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Plan V5: ordre de récupération: basic.html + bmp, fractTypes + cFract + cFractParams + overlay, + cImage + cCalc.test
 * Suite: cCalc(iter),  DEM + palette, mouseEvents
 * @todo 0: migration ts, galère ! (focus calc)
 * @todo 0: migration params, galère - params --> calcOptions
 * @todo 0: génération du html, galère non débuggable ! Revenir en arrière, et générer du code console ?
 * @todo 1: Utiliser le parent pour accéder à params (pour calc, analysis, input Router, fractDraw, externalRay = tous)
 * @todo 2: Gérer param.calcMode et implémenter cFractCalc.setMode ?
 * @todo 3: Rust - copyright, commenter les fonctions! Archi: params-->calcoptions-->Z0matrix-->ZNmatrix-->imageData
 * @todo 3: Rust - vitesse - recalcul des points noirs (iter bouge) - zoom*2 récup! - taille image (zoom GPU) - quadTree
 * @todo 2: Speed - Algorithme de calcul local de Mandelbrot via Julia précalculée (validité de la zone ?)
 * @todo 2: Résolution/Grid - afficher grille + viser des coordonnées "entières" - pixSize = dia / min(W, H) pixSize0=3/600=1/200 zoom 2 ou 2.5
 * @todo 2: Mandel utilise html-helper pour faire url<-->params
 * @todo 1: Aménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo 2: MaxIter ? Le calculer pour la bonne résolution DEM. Critère: un point "noir" est à une distance/pixel > 2
 * @todo 2: extRay: avancer jusqu'au dernier pixel, puis zoomer (x10) et avancer jusqu'au derier pixel.
 * @todo 3: historique de zoom : push, pop position (&vecteur: dia/rotation)
 * @todo 1: html - ajout automatisé de boutons d'interface maxIter & setCalc (interface UX(btnX): html.addBtn(X, onclick): id=btnX, onClickX?)
 * @todo 2: vitesse de chargement : init bmp pour mandel
 * @todo 0: regrouper les CSS dans un CSS de site ? (harmonie) 50%: couleurs des palettes et boutons
 * @todo 1: serveur d'image et url variable. 50%: manque update url (revoir svg)
 * @todo 3: SEO site + copyright + pub Utube
 */

import { ComplexPoint, PixelPoint, IParent, ICalc } from "../fractTypes.js";
import { cFractParams } from "../calc/cFractParams.js";
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
import { cUtils } from "../calc/utils.js";

console.log("cFract started");

export class cFract implements IParent {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public cImage: cImage;
  public params: cFractParams;
  public calc: ICalc;

  //Calc variables: //todo 2: envoyer des variables dans calc ? StateMachine ici
  public statusId: string;
  public autoCalc: boolean = true; //event app...
  private fixedPoints: ComplexPoint[] = [];

  constructor(canvasId: string, type = "MANDELBROT", statusId: string) {
    this.statusId = statusId;
    this.classConsole("Loading...");

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) throw new Error(`Canvas #${canvasId} introuvable`);
    this.ctx = this.canvas.getContext("2d")!;

    this.cImage = new cImage(this.canvas.width, this.canvas.height); //passer canvas et déléguer DrawOverlay ?
    this.params = new cFractParams(type, this);
    this.calc = new cFractCalc(this);

    this.autoCalc = true;
  }

  // Launch the objet, up to calc.initCalc(handling wasm)
  async initParent(paletteLut?: Uint8Array): Promise<void> {
    // initialiser tout sauf calc
    if (paletteLut) this.cImage.updatePalette(paletteLut);
    // Last step: calc & rust & calcul up to render (point dur !)
    try {
      await this.calc.initCalc();
      this.classConsole("Initialized");
    } catch (e) {
      this.classConsole("Error cFract init");
    }
    // InitCalc appelle render à la fin
  }

  // Creates the image based on calc output
  del_render(): void {
    this.ctx.putImageData(this.cImage.imageData, 0, 0);
    //this.drawFixedPointsOverlay();  via image ou Pres ?
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

  // Getters & Setters --> IParams !

  // #region Status UI & Helpers

  updateStatusBar(c: ComplexPoint, px: number, py: number): void {
    const status = document.getElementById(this.statusId);
    if (!status) return;

    let msg = `${cUtils.complexToString(c)} | counter: ${this.calcCount}`;
    if (this.params.typeName === "JULIA") {
      msg += ` | JULIA: ${cUtils.complexToString(this.params.juliaC)}`;
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
  const params = updateParamsFromURL() || new cFractParams(containerId);

  // 2. Préparation du DOM
  const containerInfo = setupFractalCanvas({ containerId: params.typeName as any });

  // 3. Création et initialisation du moteur cFract
  const engine = new cFract(
    containerInfo.canvasId,
    params.typeName,
    containerInfo.statusId
  );
  engine.params = params; // Injection des paramètres
  await engine.init();

  return engine;
}

/** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
 * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
 */
export async function runImageServer(containerId: string) {
  // 1. Instanciation du DOM via htmlHelper
  const options: IHTMLSetupOptions = { containerId: containerId };
  const FC: IHTMLFractContainer = setupFractalCanvas(options);
  // 2. Initialisation du moteur cFract
  const myFract = new cFract(FC.canvasId, FC.type, FC.statusId);
  await myFract.init();
  // 3. Application des paramètres d'URL
  const cfg: cFractParams = updateParamsFromURL();
  myFract.del_setType(cfg.typeName);
  myFract.del_setCenter(cfg.center);
  myFract.params.dia = cfg.dia;
  // 4. Calcul et rendu initial
  myFract.makeDirty();
}
