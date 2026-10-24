/** Point dans le plans complexe
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
export type FractType = "MAIN" | "MANDELBROT" | "JULIA";
export type CalcMode = "DIRECT" | "DEM";
/** Defines the shared parameters
 * @todo 2: add width/height and r2max/iterMax
 * */
export interface IAlgoParams {
    typeName: string;
    cDeep?: ComplexPoint;
    iterTry?: number; /** @todo: to compute new iterMax when zooming */
    max_iter: number;
    r2_max: number;
    juliaC: ComplexPoint;
    dirty: boolean;
}
export interface IViewportParams {
    center: ComplexPoint;
    dia: number;
    size: PixelPoint;
    angleDeg?: number;
    aspectRatio: number;
    span: ComplexPoint;
    pix2c(pix: PixelPoint): ComplexPoint;
    c2pix(c: ComplexPoint): PixelPoint;
}
export interface IParams extends IViewportParams, IAlgoParams {
}
/** Interface d'accès minimal au moteur cFract (parent)
 * @todo 1: move functions to params !
 */
export interface IParent {
    params: IParams;
    calc: ICalc;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cImage: Iimage;
    palette?: {
        orbitColor?: string;
        trajectoryColor?: string;
        pointColor?: string;
    };
    initParent(paletteLut?: Uint8Array): void;
    render(): void;
    updateStatusBar(c: ComplexPoint, px: number, py: number): void;
    classConsole(msg: string): void;
}
export interface ICalcOptions {
    mode: CalcMode;
    resX: number;
    resY: number;
}
export interface CalcAppState {
    currentMode: AppMode;
    isDirty: boolean;
    overlayDirty: boolean;
    selectedPoint?: ComplexPoint;
    lockedPoint?: ComplexPoint;
    deepAnchor?: ComplexPoint;
}
export interface ICalc {
    isBusy: boolean;
    autoCalc: boolean;
    calcCount: number;
    calcBuffer: Float32Array;
    wasmActive: boolean;
    initCalc(): void;
}
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
export type AppMode = "PAN_ZOOM" | "ZOONORAMA_EXPLORE" | "EXTERNAL_RAY" | "PALETTE_EDIT";
export type ErrorLevel = "OK" | "WARN" | "ERROR" | "STOP";
export type LogLevel = "ALL" | "NOTRACE" | "NOLOG" | "NOWARN";
export interface AppState {
    currentMode: AppMode;
    isDirty: boolean;
    overlayDirty: boolean;
    selectedPoint?: ComplexPoint;
    lockedPoint?: ComplexPoint;
    deepAnchor?: ComplexPoint;
}
export type HandleType = "cDeep" | "zoonoramaA" | "zoonoramaB" | "paletteNode";
/** Object for mouse interaction */
export interface InteractiveHandle {
    id: string;
    type: HandleType;
    posPix: PixelPoint;
    posC?: ComplexPoint;
    radiusPx: number;
    color: string;
    isDragged: boolean;
    onDrag?: (newC: ComplexPoint) => void;
}
export type UserActionType = "NAVIGATE_PAN" | "NAVIGATE_ZOOM" | "SELECT_POINT" | "DRAG_HANDLE" | "SWITCH_MODE" | "TRIGGER_ANALYSIS";
export interface UserCommand {
    type: UserActionType;
    payload?: any;
}
/** Contrat du Gestionnaire d'Événements : EventRouterCallBacks
 * todo 2: rendre cohérent - tout en pix, avec pC optionnel ou non fourni, à calculer par le callback ?)
 * todo 2: ajouter la rotation: roller+right click / two fingers rotation / angles entiers à ajouter à URL
 */
export interface EventRouterCallbacks {
    defaultCallback?: () => void;
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
    bindDOMEvents: (cb: EventRouterCallbacks) => void;
    registerHandle: (handle: InteractiveHandle) => void;
    dispatch: (command: UserCommand) => void;
}
export interface Iimage {
    width: number;
    height: number;
    imageData: ImageData;
    updatePalette(lookUpTable: Uint8Array): void;
    updateFromWasmPayload(wasmFloatBuffer: Float32Array, maxIter?: number): void;
}
export interface ColorRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface IPalOptions {
    cyclesH: number;
    cyclesS: number;
    cyclesV: number;
    phaseH: number;
    offsetV: number;
    size: number;
}
export interface PaletteControlPoint {
    index: number;
    color: ColorRGBA;
    handleId?: string;
}
export interface IPalette {
    indexColor0: number;
    indexColorClose: number;
    indexColorLines: number;
    indexColorPoints: number;
    pixelsClose: number;
    readonly SIZE: number;
    nodes: PaletteControlPoint[];
    drawColor: PaletteControlPoint;
    getColorAt(IterSmooth: number): ColorRGBA;
}
export interface IPaletteEditor {
    container: HTMLElement;
    params: IPalOptions;
    lut: Uint8Array;
}
/** Contrat de perception pour l'Agent d' Exploration
 * @todo 2: définir des types pour les sorties ? */
export interface IAgentVision {
    /** 1. Mesure le potentiel/gradient local pour détecter le centre du filament */
    getPotentialGradient(c: ComplexPoint): {
        gradRe: number;
        gradIm: number;
        dist: number;
    };
    /** 2. Détecte la période locale du motif en S (cycle limite) */
    detectLocalPeriod(c: ComplexPoint, maxIter: number): {
        period: number;
        stability: number;
    };
    /** 3. Trouve le centre exact du minibrot / point fixe de Julia le plus proche via Newton 2D */
    findLocalAttractor(cInit: ComplexPoint, period: number): ComplexPoint;
}
//# sourceMappingURL=fractTypes.d.ts.map