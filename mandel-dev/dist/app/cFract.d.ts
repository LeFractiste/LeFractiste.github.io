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