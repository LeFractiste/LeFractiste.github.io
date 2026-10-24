// app/cFract.ts - Copyright LeFractiste 2026
/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Plan V4: affichier c en hover et ajouter le touch zoom
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Plan V5: ordre de récupération: basic.html + bmp, fractTypes + cFract + cFractParams + overlay, + cImage + cCalc.test
 * Suite: cCalc(iter),  DEM + palette, mouseEvents
 
// #region TODO
 * @todo 0: code/refactor : migration ts, galère !
 * @todo 1: code/refactor/appDev.js --> ts !  oui, il faut le faire, après diminution AddDev --> cFract functions / events !
 * @todo 0: code/refact: migration params, galère*
 * @todo 0: pres/html : génération du html, galère non débuggable ! Revenir en arrière, et générer du code console ?
 * @todo 1: code/parent: Utiliser le parent pour accéder à params (pour calc, analysis, input Router, fractDraw, externalRay = tous)
 * @todo 2: code/calc: Gérer param.calcMode et implémenter cFractCalc.setMode ?
 * @todo 3: Rust/IP - copyright, commenter les fonctions! Archi: params-->calcoptions-->Z0matrix-->ZNmatrix-->imageData
 * @todo 3: Rust/vitesse - recalcul des points noirs (iter bouge) - zoom*2 récup! - taille image (zoom GPU) - quadTree
 * @todo 2: calc/Speed - Algorithme de calcul local de Mandelbrot via Julia précalculée (validité de la zone ?)
 * @todo 2: pres/Grid - afficher grille + viser des coordonnées "entières" - pixSize = dia / min(W, H) pixSize0=3/600=1/200 zoom 2 ou 2.5
 * @todo 2: code/HTML : Mandel utilise html-helper pour faire url<-->params
 * @todo 1: UX/AppAménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo 2: Calc/MaxIter ? Le calculer pour la bonne résolution DEM. Critère: un point "noir" est à une distance/pixel > 2
 * @todo 2: UX/extRay: avancer jusqu'au dernier pixel, puis zoomer (x10) et avancer jusqu'au derier pixel.
 * @todo 3: UX/data: istorique de zoom : push, pop position (&vecteur: dia/rotation)
 * @todo 1: UX/html - ajout automatisé de boutons d'interface maxIter & setCalc (interface UX(btnX): html.addBtn(X, onclick): id=btnX, onClickX?)
 * @todo 2: calc/perfo: vitesse de chargement : init bmp pour mandel
 * @todo 0: UX/CSS: regrouper les CSS dans un CSS de site ? (harmonie) 50%: couleurs des palettes et boutons
 * @todo 1: UX/srv: serveur d'image et url variable. 50%: manque update url (revoir svg)
 * @todo 2: UX/cImage - definir l'interface commun à Iter float et Dist/pix (négative ou reuse des Iter petits ? Mais dist0=iter grands !)
 * @todo 1*: UX/PaletteEditor: le respécifier avec nodes et le fAIre. Voir chez Lily.
 * @todo 3: Web/SEO : SEO site + copyright + pub Utube
 */
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { cFractDraw } from "../pres/fractDraw.js";
import { cFractParams } from "../calc/cFractParams.js";
import { cUtils } from "../calc/utils.js";
// #region CFRACT
export class cFract {
    canvas;
    ctx;
    cImage;
    _params;
    calc;
    //Calc variables: //todo 2: envoyer des variables dans calc ? StateMachine ici
    statusId;
    //public autoCalc: boolean = true; //event app...
    fixedPoints = [];
    get params() {
        return this._params;
    }
    constructor(canvasId, type = "MANDELBROT", statusId) {
        this.statusId = statusId;
        this.classConsole("Loading...");
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas)
            throw new Error(`Canvas #${canvasId} introuvable`);
        this.ctx = this.canvas.getContext("2d");
        // Crée cImage / pres
        this.cImage = new cImage(this.canvas.width, this.canvas.height); //passer canvas et déléguer DrawOverlay ?
        // Crée params, autoCalc=false
        this._params = new cFractParams(type, this);
        // Crée calc - sasn calcul
        this.calc = new cFractCalc(this);
    }
    // Launch the objet, up to calc.initCalc(handling wasm)
    async initParent(paletteLut) {
        // initialiser tout sauf calc
        if (paletteLut)
            this.cImage.updatePalette(paletteLut);
        // Last step: calc & rust & calcul up to render (point dur !)
        try {
            await this.calc.initCalc();
            this.classConsole("Initialized");
        }
        catch (e) {
            this.classConsole("Error cFract init");
        }
        // InitCalc appelle render à la fin
    }
    // Creates the image based on calc output
    // #region Manage - Cycle de vie des étapes de calcul
    render() {
        this.ctx.putImageData(this.cImage.imageData, 0, 0);
        this.drawFixedPointsOverlay(); //via image ou Pres ?
    }
    // Draw overlay with default options
    drawOrbitOverlay(orbit) {
        cFractDraw.drawComplexPath(this, orbit, {});
    }
    drawFixedPointsOverlay() {
        cFractDraw.drawFixedPointsOverlay(this.ctx, this.params, this.canvas.width, this.canvas.height, this.fixedPoints);
    }
    // Getters & Setters --> IParams !
    // #region Status UI & Helpers
    updateStatusBar(c, px, py) {
        const status = document.getElementById(this.statusId);
        if (!status)
            return;
        let msg = `${cUtils.complexToString(c)} | counter: ${this.calc.calcCount}`;
        if (this._params.typeName === "JULIA") {
            msg += ` | JULIA: ${cUtils.complexToString(this._params.juliaC)}`;
        }
        msg += ` | px=${Math.floor(px)} py=${Math.floor(py)}`;
        status.textContent = msg;
    }
    classConsole(msg) {
        const status = document.getElementById(this.statusId);
        if (status) {
            status.textContent = `[INFO] ${msg}`;
        }
    }
}
//# sourceMappingURL=cFract.js.map