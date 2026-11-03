// Code snippets - examples

//Sujets codage// Option - Répondre par texte et fenêtre de code unique contenant des snippets de code commenté, non liés:
// ts.types: Faut-il utiliser les types de ts ou de js (VoidFunction, Number, String, Boolean, ...).
// Refuse tout, même "this" --> globalThis  (merdouille)
// Bug_import: Même en vérifiant, je reçois pour (un des nombreux) import "../calc/cFractParams.js" une erreur Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
// Tsc.reInit: Comment réinitialiser proprement "/dist/" ?  Le compilateur va apparemment chercher des définitions dans tous les fichiers. Ennuyeux.
// Import trick: comment forcer l'import, éventuellement en vidant les fichiers ?
// Classe: faut-il utiliser des propriétés private x (this.x), ou une variable let x privée ? Si variable, comment la partager entre les fonctions?
// Illustrer le mot static appliqué à variable, propriété (applicable) et fonction.
// Property: Peux-tu me donner un exemple de property get/set (pour cFractParams.center : ComplexPoint)
// Abstraction: est-il mieux de structurer les interfaces ? (grouper les propriétés liées en sous-interface). Critère pour "assez d'abstraction" ?
// Events: comment émettre / consommer un event ? (isDirty --> parent.recalc(), mouseEvent(e) --> parent.f(pix))
// IA: est-il possible/avéré qu'une "pollution par modification des faits" (refactoring + modifs manuelles) ait rendu ton contexte instable ?

// #region LIBDOM
/** Lecture de libDom.d.ts: quels sont les objets utiles pour faire un site ? Je vois: {
  window, navigator (clientInformation), selection, Console: usage général.
  URL, webkitURL; URLsearchParams pour récupérer les paramètres - interface FTP ? - interface imageServer
  Events:
    Touch, TouchEvent, TouchList: interface SmartPhone/touchScreen - ajouter le Touch pour Mandel-V4 et a rotation à implémenter
    WheelEvent, MouseEvent: souris & divers événements utiles
    HTMLOptionElement : select
    UIEvents, WindowEventMap (acceleromètre ici?) : autres événements externes
    WindowEventHandlers, WindowEventHandlersEventMap : list of all window.events (onPrint, page)
    WindowOrWorkerGlobalScope.setInterval, .timeOut
    ? : comment définir un menu "setting" en popup ? (changer paramètres et onHoover/onClick events, sélectionner paramètres/boutons favoris=visibles)
  Data:
    window.Document
    window.navigator, window.navigation
    Storage, StorageManager, webSocket, Window.cookieStore : enregistrer de l'info sur gitHub ou sur mon drive ? (ou sur OneDrive du Fractiste)
    ValidityState: contrôle des input texte?
  UserData:
    UserActivation, User? : comment identifier l'utilisateur   Exploiter UserActivation.hasBeenActive
    ? : comment définir une interface de communication (mail caché github : à faire plus tard)
    window.prompt, .alert, .confirm : fenêtres
    window.history, window.getSelection
  Image:
     window, window.devicePixelRatio (entre pixel et CSS : zoom actif du PixelPoint)
     window.screen : pour identifier SmartPhone / PC,
     Video: utilisables ? ViewTransition=effets; VisualViewport=structure page;, WebGLDrawBuffers & WebGL2RenderingContext: rendering avancé ?
     ? : comment générer une image "sur" une sphère/cube ou un visu 3D d'une fractale ?
  Divers
    Namespaces: CSS, WebAssembly.
    console : debug data    .error, .debug, .groupCollapsed(data), .trace?
    window.requestIdleCallback, Worker : calcul (rapide: limité) en background; Worklet: plus rapide
    payment: dommage !
    TransformStream : usage particulier (musique fractale en 1/f beaucoup plus tard. D'abord les couleurs qui dépendentent des harmoniques de iter !)
    TreeWalker: plus tard (des documents fractals ? Une page web arborescente à tiroirs des cDeep harmoniques avec leur vues 2D)
    HTMLElementTagNameMap : liste des tag HTML
    XMLDocument, XMLHttpRequest, XSLTProcessor: un jour... JSON ou XML ? Databases.
    PositionCallback

} */


// ============================================================================
// #region TYPAGE
// TYPAGE STRICT TS vs WRAPPERS JS
// ============================================================================
// En TS, utilise TOUJOURS les types primitifs en minuscules (number, string, boolean).
// Les types avec majuscule (Number, String, Boolean) sont des objets wrappers JS lourds.
// Pour les fonctions sans retour, utilise void.

type ComplexPoint = { re: number; im: number };
type VoidFunction = () => void; // Fonction qui ne renvoie rien

// Exemple d'usage correct des types TS :
export function addPoints(p1: ComplexPoint, p2: ComplexPoint): ComplexPoint {
    return { re: p1.re + p2.re, im: p1.im + p2.im };
}


// ============================================================================
// #region DEBUG
2. BUG IMPORT & "STRICT MIME TYPE CHECKING"
// ============================================================================
/*
CAUSE DU BUG :
Le serveur web renvoie une page HTML (404 Not Found) au lieu du fichier JavaScript.
Le navigateur tente de lire ce HTML comme du JS, déclenchant le rejet MIME.

VERIFICATIONS A FAIRE :
1. Dans le code TS source, garder l'extension .js :
   import { cFractParams } from "../calc/cFractParams.js";

2. Dans tsconfig.json, vérifier la racine et le dossier de sortie :
   "rootDir": "./src",
   "outDir": "./dist"

3. Si src/app/cFract.ts importe ../calc/cFractParams.js, le fichier DOIT être
   compilé dans dist/calc/cFractParams.js. Si ton HTML est à la racine, vérifie
   les chemins relatifs par rapport au fichier HTML hôte.
*/


// ============================================================================
// 3. TSC / REINITIALISATION PROPRE DE /DIST/
// ============================================================================
/*
Pour réinitialiser le dossier dist/ et éviter que tsc ne scanne des vieux fichiers :

1. Dans le terminal :
   rm -rf dist/            (Linux/Mac/Bash)
   rd /s /q dist           (Windows CMD)
   Remove-Item -Recurse dist (PowerShell)

2. Dans tsconfig.json, exclure dist et include uniquement src :
   "include": ["src/**_/*"],    //   /**_/  _blanc_ pour rester /*commenté*_/ !
   "exclude": ["node_modules", "dist", "**_/*.spec.ts"]
*/


// ============================================================================
// 4. TRICK POUR FORCER UN IMPORT EN VIDANT UN FICHIER
// ============================================================================
// Pour isoler un bug sans supprimer un fichier, transforme-le en module vide.
// TypeScript exige le mot-clé export pour le traiter comme un module ES.

export {}; // Dit à TS : "Ce fichier est un ES Module valide mais vide"


// ============================================================================
// #region SCOPE
// 5. MEMBRES PRIVÉS : `private x` vs `let x` HORS CLASSE
// ============================================================================
export class EngineState {
    // APPROCHE RECOMMANDEE : private (ou #x en JS natif).
    // Accessibles dans TOUTES les méthodes de cette instance via `this.x`.
    private instanceCounter: number = 0;
    #nativePrivateField: boolean = true; // Privé au niveau de l'exécuteur JS

    public increment(): void {
        this.instanceCounter++;
    }
}

// APPROCHE MODULE-SCOPE (let x hors classe) :
// Variable partagée par TOUTES les instances de la classe dans ce fichier.
let globalModuleState: number = 0; 

export class Helper {
    public getValue(): number {
        return globalModuleState; // Partagé entre toutes les méthodes et instances
    }
}


// ============================================================================
// 6. MOT-CLÉ STATIC (PROPRIÉTÉS ET MÉTHODES)
// ============================================================================
// Un membre static appartient à la CLASSE elle-même, pas aux instances (`new`).

export class MathUtils {
    // Propriété statique (Constante globale liée à la classe)
    public static readonly DEFAULT_MAX_ITER: number = 500;

    // Propriété statique modifiable
    public static instanceCount: number = 0;

    constructor() {
        MathUtils.instanceCount++; // Accès via le NOM de la classe
    }

    // Méthode statique (Factory / Fonction utilitaire sans instantiation)
    public static createDefaultCenter(): ComplexPoint {
        return { re: -0.7, im: 0.0 };
    }
}

// Utilisation sans faire `new MathUtils()` :
const max = MathUtils.DEFAULT_MAX_ITER;
const center = MathUtils.createDefaultCenter();


// ============================================================================
// #region PROPERTIES
// 7. GETTER / SETTER POUR `cFractParams.center`
// ============================================================================
export class cFractParamsExample {
    private _center: ComplexPoint = { re: -0.7, im: 0.0 };
    public isDirty: boolean = false;

    // GETTER : Permet de lire `obj.center`
    public get center(): ComplexPoint {
        return this._center;
    }

    // SETTER : Permet de modifier `obj.center = { re: 1, im: 2 }`
    public set center(val: ComplexPoint) {
        this._center = val;
        this.isDirty = true; // Notification interne du changement de valeur
    }
}


// ============================================================================
// #region INTERFACES
// 8. ABSTRACTION ET SOUS-INTERFACES
// ============================================================================
// Oui, il vaut mieux grouper par domaine fonctionnel (ISP - Interface Segregation).
// Critère pour "assez d'abstraction" : Si un composant n'a besoin que du calcul,
// il ne doit pas dépendre des propriétés d'IHM ou de rendu.

export interface IViewportParams {
    center: ComplexPoint;
    spanRe: number;
    rotation: number;
}

export interface IAlgoParams {
    max_iter: number;
    r2_max: number;
    juliaC: ComplexPoint;
}

// Composition d'interfaces :
export interface IFractalParams extends IViewportParams, IAlgoParams {
    aspectRatio: number;
}


// ============================================================================
// #region EVENTS
// 9. PATRON ÉVÉNEMENTIEL (OBSERVER / CALLBACKS)
// ============================================================================
// Permet de notifier le parent sans couplage fort.

type EventCallback = () => void;
type PixelClickCallback = (point: { x: number; y: number }) => void;

export class InputHandler {
    // Stockage des abonnés (Callbacks)
    private onRecalcRequired?: EventCallback;
    private OnPixelClick?: PixelClickCallback;

    // Inscription par le parent (ex: cFract)
    public bindRecalc(cb: EventCallback): void {
        this.onRecalcRequired = cb;
    }

    public bindPixelClick(cb: PixelClickCallback): void {
        this.OnPixelClick = cb;
    }

    // Émission lors d'une action utilisateur
    public handleMouseClick(event: MouseEvent): void {
        const coords = { x: event.clientX, y: event.clientY };
        
        // Propagation vers le parent
        if (this.OnPixelClick) {
            this.OnPixelClick(coords);
        }
        if (this.onRecalcRequired) {
            this.onRecalcRequired();
        }
    }
}

//#region decorators
// Exemple de décorateur personnalisé pour marquer "non editable" ou sérialiser une propriété
// Activer experimentalDecorators dans tsconfig
function ReadOnly(target: any, propertyKey: string) {
  let value = target[propertyKey];

  const getter = () => value;
  const setter = (newVal: any) => {
    console.warn(`Attention : tentative de modification de la propriété verrouillée '${propertyKey}'`);
    // On pourrait bloquer, logger, ou transformer la valeur ici à la compilation/exécution
  };

  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

// Utilisation dans une classe :
class FractalConfig {
  @ReadOnly
  public maxIterations: number = 1000;
}

// #region write version file -----------------------
const { execSync } = require('child_process');
const fs = require('fs');
const gitTag = execSync('git describe --tags --always --dirty').toString().trim();
const buildDate = new Date().toISOString();
const content = `// Généré automatiquement - Ne pas modifier à la main\n` +
                `export const APP_VERSION = {\n` +
                `  gitTag: "${gitTag}",\n` +
                `  buildDate: "${buildDate}"\n` +
                `};\n`;
fs.writeFileSync('./src/version.ts', content);
// #endRegion