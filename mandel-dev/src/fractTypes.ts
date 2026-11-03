// src/fractTypes.ts - V1.0 - copyright LeFractiste 2026
// Helper pour cFract: définit les interfaces utiles à l'application.
// Sert à cadrer le refactoring (et la génération de code compatible du legacy).
// Utile pour donner à App les billes pour utiliser les données générées.

/** charger:
 import { } from "..fractTypes.js";
 */

/** V1.0: homogène et utilisé
 * IParent partage une copie des objets cFract.x, via leur interface
 * @todo 2: supprimer les accès perturbants (pour la console, pour le recalcul...)
 * @todo 2: définir les interfaces associées aux aspects html (div.content, image, events)
 * @todo 2: définir les interfaces associées au code Rust et aux calculs distribués partout, y compris les outputs (distance/potential -> palette)
 */

// #region Coding

// Gestion de version
export interface AppVersionInfo {
  version: string;
  buildDate: string;
  gitTag: string;
  environment: string;
}

// Error levels for code and tests
export type ErrorLevel = "OK" | "WARN" | "ERROR" | "STOP";
// Log levels : ALL, NOTRACE, NOLOG, NOWARN
export type LogLevel = "ALL" | "NOTRACE" | "NOLOG" | "NOWARN";
// ILogger
export interface ILogger {
  logLevel: LogLevel;
}

// Pour suivi local (Todo / Done) spécifique à la branche courante
export interface TaskTrack {
  id: string;
  type: "TODO" | "DONE" | "WIP";
  description: string;
  file?: string;
}

// #region Bases

/** Point dans le plans complexe
 * //@todo 2: préparer le passage à la précision multiple!
 */
export interface ComplexPoint {
  re: number;
  im: number;
}
// Coordonnées canvas ou écran (souvent entier) - y positive down !
export interface PixelPoint {
  x: number;
  y: number;
}

// Classes - Main sera le Mandelbrot d'analyse, avec les objets Julia + analyse / palette associés
export type FractType = "MAIN" | "MANDELBROT" | "JULIA";
// Computation mode, handled by cFractCalc
export type CalcMode = "DIRECT" | "DEM"; // todo 2+3: | "Hybrid" | "QuadHybrid" | "BigNumQH";

// #region IParams

/** Defines the shared parameters
 * @todo 2: add width/height and r2max/iterMax
 * */
export interface IAlgoParams {
  //type?: string; //inutile: if (Param.JuliaC) {type="JULIA";}
  typeName: string;
  cDeep?: ComplexPoint; // point of interest - mouse hover/zoom
  iterTry?: number; /** @todo: to compute new iterMax when zooming */
  max_iter: number; //à renommer iterMax et R2Max dès que compilable //@todo 2: remove: for calc only
  r2_max: number; //à renommer R2max
  juliaC: ComplexPoint; //defined for Julia and MandelMain. Undefined for Mandelbrot set
  // Used for auto recalc
  dirty: boolean; //for asynchroneous recalc
}

export interface IViewportParams {
  get center(): ComplexPoint; // centre of image
  set center(c: ComplexPoint);
  dia: number; //diameter represented around centre.re //@todo 2: depending on min(W,H)
  size: PixelPoint; //computed window x=width (to right), y=height (to bottom)
  angleDeg?: number; //rotation around re axis //@todo: not implemented
  get aspectRatio(): number; //canvas width/heigth
  get span(): ComplexPoint; // Propriété calculée
  //pixelVector2c?: ComplexPoint; // pix2c(deltax, deltay);

  pix2c(pix: PixelPoint): ComplexPoint;
  c2pix(c: ComplexPoint): PixelPoint;
  onZoom(pix: PixelPoint, zoomFactor: number): void;
  onReset(): void;

  //c2pix and pix2c ? (no: different projection = other params & arguments)
}

// Composition d'interfaces :
export interface IParams extends IViewportParams, IAlgoParams {}

// #region IParent

/** Interface d'accès minimal au moteur cFract (parent)
 * @todo 1: move functions to params !
 */
export interface IParent {
  // Graphisme
  params: IParams;
  calc: ICalc;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cImage: IImage;
  palette?: {
    orbitColor?: string;
    trajectoryColor?: string;
    pointColor?: string;
  };
  initParent(paletteLut?: Uint8Array): void;
  render(): void;
  updateStatusBar(c: ComplexPoint, px: number, py: number): void;
  classConsole(msg: string): void;
  // orbit
}

// #region Calc
// CalcOptions: required to launch cFractCalc
export interface ICalcOptions {
  mode: CalcMode;
  resX: number; // different for Rust in case of fast zoom and QuadTree
  resY: number;
}

// For calc state machine
export interface CalcAppState {
  currentMode: AppMode;
  isDirty: boolean; // Nécessite un re-calcul du canvas principal
  overlayDirty: boolean; // Nécessite un re-calcul de l'overlay vectoriel
  selectedPoint?: ComplexPoint;
  lockedPoint?: ComplexPoint;
  deepAnchor?: ComplexPoint; // Point 'S' d'intérêt pour la descente
}

// ICalc: interface de calcul - cFract à un accès plus grand
export interface ICalc {
  autoCalc: boolean; // non implementé !
  calcCount: number;
  calcBuffer: Float32Array;
  wasmActive: boolean;
  initCalc(): void;
  calcIter(c: ComplexPoint, IterMax: number): number;
  calcOrbit(c: ComplexPoint, IterMax: number): ComplexPoint[];
  calcFull(): void;
}

// #end region
// #region Analysis
/** Types de trajectoires/collections pour adapter le mode de dessin */
export type TrajectoryType = "extRay" | "orbit" | "minibrots";

/** Interface générique pour le déplacement et le rendu d'une trajectoire */
export interface Trajectory {
  current: ComplexPoint;
  type: TrajectoryType;
  points?: ComplexPoint[];
  parent?: IParent;
  moveAlong?(stepSize: number, field: (p: ComplexPoint) => ComplexPoint): ComplexPoint;
  draw?(options?: DrawOptions): void;
}

/** Calcul d'external ray */
export interface ExternalRayConfig {
  angle: number;
  maxIter: number;
  bailout: number;
}

// Valeur mémorisée de calcul à définir (intégrer DEM dedans)
/* type ou class IterSmooth : number {
} /**/

/** Analyse de point */
export interface PointAnalysisResult {
  escaped: boolean;
  iterations: number;
  period: number;
  demDistance?: number;
  externalAngle?: number;
  lambda?: number;
  scaleFactor?: number;
  angleAntenna?: number;
}
// #end region
// #region StateMachine
// App: mode à revoir ?
export type AppMode = "PAN_ZOOM" | "ZOONORAMA_EXPLORE" | "EXTERNAL_RAY" | "PALETTE_EDIT";

export interface AppState {
  currentMode: AppMode;
  isDirty: boolean; // Nécessite un re-calcul du canvas principal
  overlayDirty: boolean; // Nécessite un re-calcul de l'overlay vectoriel
  selectedPoint?: ComplexPoint;
  lockedPoint?: ComplexPoint;
  deepAnchor?: ComplexPoint; // Point 'S' d'intérêt pour la descente
}
// #endregion

// #region Graph
// Objets Graphiques Interactifs (Handles / Controls)
export type HandleType = "cDeep" | "zoonoramaA" | "zoonoramaB" | "paletteNode";

/** Object for mouse interaction */
export interface InteractiveHandle {
  id: string;
  type: HandleType;
  posPix: PixelPoint;
  posC?: ComplexPoint; // Position dans le plan complexe
  radiusPx: number; // Rayon d'interaction à l'écran
  color: string;
  isDragged: boolean;
  onDrag?: (newC: ComplexPoint) => void;
}
// #endregion

// #region Router
// Router d'Événements & Commandes
export type UserActionType =
  | "NAVIGATE_PAN"
  | "NAVIGATE_ZOOM"
  | "SELECT_POINT"
  | "DRAG_HANDLE"
  | "SWITCH_MODE"
  | "TRIGGER_ANALYSIS";

export interface UserCommand {
  type: UserActionType;
  payload?: any;
}

/** Contrat du Gestionnaire d'Événements : EventRouterCallBacks
 * todo 2: rendre cohérent - tout en pix, avec pC optionnel ou non fourni, à calculer par le callback ?)
 * todo 2: ajouter la rotation: roller+right click / two fingers rotation / angles entiers à ajouter à URL
 */
export interface old_EventRouterCallbacks {
  onHover?: (pC: ComplexPoint, pPx: PixelPoint) => void;
  onClick?: (pC: ComplexPoint, pPx: PixelPoint) => void;
  onZoom?: (centerPx: PixelPoint, factor: number) => void;
  onDrag?: (deltaC: ComplexPoint) => void;
}
export interface PointerEventCallbacks {
  onHover?: (pPx: PixelPoint) => void;
  onClick?: (pPx: PixelPoint) => void;
  onZoom?: (centerPx: PixelPoint, factor: number) => void;
  onDrag?: (deltaPx: PixelPoint) => void;
  onRotate?: (centerPx: PixelPoint, angle: number) => void;
  onReset?: () => void;
}

/** Contrat du Gestionnaire d'Événements / InputRouter */
export interface IInputRouter {
  canvasEl: HTMLCanvasElement;
  bindDOMEvents: (cb: PointerEventCallbacks) => void;
}
/** reserved */
export interface IIHandlesRouter extends IInputRouter {
  handles: InteractiveHandle[];
  activeMode: AppMode;
  registerHandle: (handle: InteractiveHandle) => void;
  dispatch: (command: UserCommand) => void;
}
// #region Presentation

export interface IImage {
  width: number;
  height: number;
  imageData: ImageData;
  updatePalette(lookUpTable: Uint8Array): void;
  updateFromWasmPayload(wasmFloatBuffer: Float32Array, maxIter?: number): void;
}

export type DrawType = "continuous" | "points" | "groupedPoints";
// DrawOverlay: called by parent.render
export interface IDrawOverlay {
  //ctx: CanvasRenderingContext2D;
  drawReticle(pix: PixelPoint): void;
  drawFixedPointsOverlay(fixedPoints: ComplexPoint[]): void;
  drawComplexPath(points: ComplexPoint[], options: DrawOptions): void;
  /** @todo intégrer à pres et mémoriser canvas et ctx et width */
}

/** Options de dessin optionnelles qui surchargent celles du parent */
export interface DrawOptions {
  color?: string;
  lineWidth?: number;
  showPoints?: boolean;
}

// Gestion Simplifiée de la Palette
// ColorRGBA, PaletteControlPoint, IPalette
export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Options de palette continue
export interface IPalOptions {
  cyclesH: number;
  cyclesS: number;
  cyclesV: number;
  phaseH: number;
  offsetV: number;
  size: number;
}

export interface PaletteControlPoint {
  index: number; // rename ColorIndex - Position dans la rampe [0..1] ?
  color: ColorRGBA;
  handleId?: string; // Lié à un handle graphique si en mode édition
}

export interface IPalette {
  // lut
  indexColor0: number;
  indexColorClose: number;
  indexColorLines: number;
  indexColorPoints: number;
  pixelsClose: number;
  readonly SIZE: number;
  nodes: PaletteControlPoint[];
  drawColor: PaletteControlPoint; //overlayColor

  getColorAt(IterSmooth: number): ColorRGBA; //number -> type IterCalc
}

/* Palette editor */
export interface IPaletteEditor {
  container: HTMLElement; //rename: id
  params: IPalOptions; //rename options
  lut: Uint8Array; //rename lookUpTable --> palette ?
}
// #endregion

/** Contrat de perception pour l'Agent d' Exploration
 * @todo 2: définir des types pour les sorties ? */
export interface IAgentVision {
  /** 1. Mesure le potentiel/gradient local pour détecter le centre du filament */
  getPotentialGradient(c: ComplexPoint): { gradRe: number; gradIm: number; dist: number };
  /** 2. Détecte la période locale du motif en S (cycle limite) */
  detectLocalPeriod(
    c: ComplexPoint,
    maxIter: number
  ): { period: number; stability: number };
  /** 3. Trouve le centre exact du minibrot / point fixe de Julia le plus proche via Newton 2D */
  findLocalAttractor(cInit: ComplexPoint, period: number): ComplexPoint;
}
