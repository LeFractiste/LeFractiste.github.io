/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Spec V4: Affichage parallèle de Mandelbrot et Julia, avec affichage des valeurs de c et interactions souris.
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Spec V5: Version en TypeScript, proche du petit package(?)
 *   Il reste à : gérer les mouse touch events, et documenter, puis étoffer: intégrer analyse, cTest, zoonorama en Rust.
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
    displayState(action: string, c?: ComplexPoint, pix?: PixelPoint): void;
}
//# sourceMappingURL=cFract.d.ts.map