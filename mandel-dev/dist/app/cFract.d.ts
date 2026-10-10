/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Plan V4: affichier c en hover et ajouter le touch zoom
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Plan V5: ordre de récupération: basic.html + bmp, fractTypes + cFract + cFractParams + overlay, + cImage + cCalc.test
 * Suite: cCalc(iter),  DEM + palette, mouseEvents
 * @todo 0: migration ts, galère !
 * @todo 0: migration params, galère*
 * @todo 0: génération du html, galère non débuggable ! Revenir en arrière, et générer du code console ?
 * @todo 1: Utiliser le parent pour accéder à params (pour calc, analysis, input Router, fractDraw, externalRay = tous)
 * @todo 2: Gérer param.calcMode et implémenter cFractCalc.setMode ?
 * @todo 2: Mandel utilise html-helper pour faire url<-->params
 * @todo 1: Aménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo 2: MaxIter ? Le calculer pour la bonne résolution DEM. Critère: un point "noir" est à une distance/pixel > 2
 * @todo 2: extRay: avancer jusqu'au dernier pixel, puis zoomer (x10) et avancer jusqu'au derier pixel.
 * @todo 3: historique de zoom : push, pop position (&vecteur: dia/rotation)
 * @todo 1: html - ajout automatisé de boutons d'interface maxIter & setCalc (interface UX(btnX): html.addBtn(X, onclick): id=btnX, onClickX?)
 * @todo 2: vitesse de chargement : init bmp pour mandel
 * @todo 0: regrouper les CSS dans un CSS de site ? (harmonie) 50%: couleurs des palletes et boutons
 * @todo 1: serveur d'image et url variable. 50%: manque update url (revoir svg)
 * @todo 3: SEO site + copyright + pub Utube
 */
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { cFractParams } from "../calc/cFractParams.js";
import { ComplexPoint, PixelPoint } from "../fractTypes.js";
export declare class cFract {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cImage: cImage;
    params: cFractParams;
    calc: cFractCalc;
    statusId: string;
    calcMode: string;
    calcCount: number;
    autoCalc: boolean;
    isBusy: boolean;
    isDirty: boolean;
    private wasmEngine;
    private wasmMemory;
    private fixedPoints;
    constructor(canvasId: string, type: string | undefined, statusId: string);
    init(paletteLut?: Uint8Array): Promise<void>;
    makeDirty(): void;
    makeClean(): void;
    calcFull(): void;
    render(): void;
    drawFixedPointsOverlay(): void;
    setType(type: string, juliaC?: ComplexPoint | null): void;
    getCenter(): ComplexPoint;
    setCenter(c: ComplexPoint): void;
    setCalcMode(mode: string): void;
    updateAspect(): void;
    pix2c(point: PixelPoint): ComplexPoint;
    c2pix(c: ComplexPoint): PixelPoint;
    zoom(px: number, py: number, zoomFactor: number): void;
    resetZoom(): void;
    complexToString(c: ComplexPoint, digits?: number): string;
    updateStatusBar(c: ComplexPoint, px: number, py: number): void;
    classConsole(msg: string): void;
}
export declare function appInit(containerId?: string): Promise<cFract>;
/** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
 * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
 */
export declare function runImageServer(containerId: string): Promise<void>;
//# sourceMappingURL=cFract.d.ts.map