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
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cTest } from "../analysis/cTest.js";
import { ComplexPoint, PixelPoint, IParent, IParams, IPointerRouter, PointerEventCallbacks } from "../fractTypes.js";
export declare class cFract implements IParent {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cImage: cImage;
    private _params;
    calc: cFractCalc;
    draw: cFractDraw;
    inputRouter: IPointerRouter;
    T: cTest;
    private resetEl;
    lockedJulia: IParent | null;
    cDeep: ComplexPoint;
    orbit: ComplexPoint[];
    fixedPoints: ComplexPoint[];
    get params(): IParams;
    constructor(canvasId: string, type: string | undefined, statusId: string, resetId: string);
    initParent(paletteLut?: Uint8Array): Promise<void>;
    genCbEvents(): PointerEventCallbacks;
    /** Handles the display, as necessary
     */
    render(): void;
    /** Draw overlay with default options
    drawOrbitOverlay(orbit: ComplexPoint[]): void {
      console.trace("cFract.Overlay");
      this.render(); // lent mais...
      cFractDraw.drawComplexPath(this, orbit, {});
    } /**/
    displayState(action: string, c?: ComplexPoint, pix?: PixelPoint, msg2?: string): void;
}
//# sourceMappingURL=cFract.d.ts.map