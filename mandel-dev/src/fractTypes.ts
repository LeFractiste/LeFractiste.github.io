// src/fractTypes.ts - V0.2 - copyright LeFractiste 2026

// Helper pour cFract: défint les interfaces principales de l'application / package.
// Sert à cadrer le refactoring (et la génération de code compatible du legacy).
// Utile pour donner à App les billes pour utiliser les données générées.

// Pour la V0.3:
// @todo 2: cFract pourrait partager une copie des objets, comme cela App ne doit pas les instancier ? (cDeep, cPath ?)
// @todo 2: définir les interfaces associées aux aspects html (div.content, image, events)
// @todo 2: définir les interfaces associées au code Rust et aux calculs distribués partout, y compris les outputs (distance/potential -> palette)

// #region Params

/** Point dans les plans complexe et écran (pixels)
 * //@todo 2: préparer le passage à la précision multiple!
 */
export interface ComplexPoint {
  re: number;
  im: number;
}
export interface PixelPoint {
  x: number;
  y: number;
}

// Classes - Main sera le Mandelbrot d'analyse, avec les objets Julia + analyse / palette associés
export type FractType = "MAIN" | "MANDELBROT" | "JULIA";
export type CalcMode = "DIRECT" | "DEM";

export interface IParams {
  //type?: string; //inutile: if (Param.JuliaC) {type="JULIA";}
  center: ComplexPoint;
  dia: number; //todo 2: renommer radius plus tard
  span: { re: number; im: number }; // Propriété calculée
  max_iter: number; //renommer iterMax et R2Max dès que compilable
  r2_max: number;
  juliaC?: ComplexPoint;
  angleDeg?: number;
  aspectRatio: number;
  // @todo 2: décider où va la conversion (besoin de taille d'image) - cFract ou params --> params
  //set span(c: ComplexPoint);
  //toMetadata(): string;
  //clone(): IParams;
}

/** Interface d'accès minimal au moteur cFract (parent) pour le rendu */
export interface ICFractParent {
  // Graphisme
  canvas: CanvasRenderingContext2D;
  render(): void;
  palette: {
    orbitColor?: string;
    trajectoryColor?: string;
    pointColor?: string;
  };
  // Projection
  c2pix(p: ComplexPoint): PixelPoint;
  pix2c(pt: PixelPoint): ComplexPoint;
  // Navigation - une sous classe navigation?
  setCenter(c: ComplexPoint): void;
  setSpan(span: number): void;
  resetZoom(): void;
  // Calcul
  setCalcMode(cmode: CalcMode): void;
  // orbit
}

// #end region
// #region Analysis
/** Types de trajectoires/collections pour adapter le mode de dessin */
export type TrajectoryType = "extRay" | "orbit" | "minibrots";
export type DrawType = "continuous" | "points" | "groupedPoints";

/** Options de dessin optionnelles qui surchargent celles du parent */
export interface DrawOptions {
  color?: string;
  lineWidth?: number;
  showPoints?: boolean;
}

/** Interface générique pour le déplacement et le rendu d'une trajectoire */
export interface Trajectory {
  current: ComplexPoint;
  type: TrajectoryType;
  points?: ComplexPoint[];
  parent?: ICFractParent;
  moveAlong?(stepSize: number, field: (p: ComplexPoint) => ComplexPoint): ComplexPoint;
  draw?(options?: DrawOptions): void;
}

/** Calcul d'external ray */
export interface ExternalRayConfig {
  angle: number;
  maxIter: number;
  bailout: number;
}

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
export interface EventRouterCallbacks {
  onHover?: (pC: ComplexPoint, pPx: PixelPoint) => void;
  onClick?: (pC: ComplexPoint, pPx: PixelPoint) => void;
  onZoom?: (centerPx: PixelPoint, factor: number) => void;
  onPan?: (deltaC: ComplexPoint) => void;
}

/** Contrat du Gestionnaire d'Événements / InputRouter */
export interface IInputRouter {
  activeMode: AppMode;
  handles: InteractiveHandle[];
  canvasEl: HTMLCanvasElement;
  registerHandle: (handle: InteractiveHandle) => void;
  bindDOMEvents: (cb: EventRouterCallbacks) => void;
  dispatch: (command: UserCommand) => void;
}
// #endregion

// #region Palette
// Gestion Simplifiée de la Palette
// ColorRGBA, PaletteControlPoint, IPalette
export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface PaletteControlPoint {
  index: number; // Position dans la rampe [0..1]
  color: ColorRGBA;
  handleId?: string; // Lié à un handle graphique si en mode édition
}

export interface IPalette {
  demColor0: ColorRGBA;
  demColorClose: ColorRGBA;
  iterColorN: ColorRGBA;
  drawColor: ColorRGBA; //overlayColor
  nodes: PaletteControlPoint[];
  getColorAt(t: number): ColorRGBA;
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
