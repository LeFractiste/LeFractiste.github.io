/** Contrôleur principal et façade publique
 * Refactoring - actions en cours, migration vers ts
 * Spec V4: Affichage parallèle de Mandelbrot et Julia, avec affichage des valeurs de c et interactions souris.
 * Code de test + typeDoc + myGenDoc  (test: debuggage sous Navigateur, eq, assert, testStates) - frame de debug.AI ? Jester?
 * Spec V5: Version en TypeScript, proche du petit package(?)
 *   Il reste à : gérer les mouse touch events, et documenter, puis étoffer: intégrer analyse, cTest, zoonorama en Rust.
 */
import { cImage } from "../pres/cImage.js";
import { cFractCalc } from "../calc/cFractCalc.js";
import { ComplexPoint, IParent, IParams } from "../fractTypes.js";
export declare class cFract implements IParent {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cImage: cImage;
    private _params;
    calc: cFractCalc;
    statusId: string;
    orbit: ComplexPoint[];
    private fixedPoints;
    get params(): IParams;
    constructor(canvasId: string, type: string | undefined, statusId: string);
    initParent(paletteLut?: Uint8Array): Promise<void>;
    /** Handles the display, as necessary
     */
    render(): void;
    /** Draw overlay with default options
    drawOrbitOverlay(orbit: ComplexPoint[]): void {
      console.trace("cFract.Overlay");
      this.render(); // lent mais...
      cFractDraw.drawComplexPath(this, orbit, {});
    } /**/
    set cDeep(c: ComplexPoint);
    drawFixedPointsOverlay(): void;
    updateStatusBar(c: ComplexPoint, px: number, py: number): void;
    classConsole(msg: string): void;
}
//# sourceMappingURL=cFract.d.ts.map