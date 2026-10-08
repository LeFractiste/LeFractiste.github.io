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
export type FractType = "MAIN" | "MANDELBROT" | "JULIA";
export type CalcMode = "DIRECT" | "DEM";
export interface IParams {
    type?: string;
    center: ComplexPoint;
    _spanRe: number;
    max_iter: number;
    r2_max: number;
    juliaC?: ComplexPoint;
    toMetadata(): string;
    clone(): IParams;
}
/** Interface d'accès minimal au moteur cFract (parent) pour le rendu */
export interface ICFractParent {
    canvas: CanvasRenderingContext2D;
    render(): void;
    palette: {
        orbitColor?: string;
        trajectoryColor?: string;
        pointColor?: string;
    };
    c2pix(p: ComplexPoint): PixelPoint;
    pix2c(pt: PixelPoint): ComplexPoint;
    setCenter(c: ComplexPoint): void;
    setSpan(span: number): void;
    resetZoom(): void;
    setCalcMode(cmode: CalcMode): void;
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
export type AppMode = "PAN_ZOOM" | "ZOONORAMA_EXPLORE" | "EXTERNAL_RAY" | "PALETTE_EDIT";
export interface AppState {
    currentMode: AppMode;
    isDirty: boolean;
    overlayDirty: boolean;
    selectedPoint?: ComplexPoint;
    lockedPoint?: ComplexPoint;
    deepAnchor?: ComplexPoint;
}
export type HandleType = "cDeep" | "zoonoramaA" | "zoonoramaB" | "paletteNode";
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
/** Contrat du Gestionnaire d'Événements : EventRouterCallBacks  */
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
export interface ColorRGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface PaletteControlPoint {
    index: number;
    color: ColorRGBA;
    handleId?: string;
}
export interface IPalette {
    demColor0: ColorRGBA;
    demColorClose: ColorRGBA;
    iterColorN: ColorRGBA;
    drawColor: ColorRGBA;
    nodes: PaletteControlPoint[];
    getColorAt(t: number): ColorRGBA;
}
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