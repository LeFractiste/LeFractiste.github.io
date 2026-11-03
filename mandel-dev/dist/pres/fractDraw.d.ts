/** Calque de surimpressions (Overlay)
 *  V1: list of static functions (called par parent.render with parameters and PixelPoint coordinates).
 * @todo 1: constructeur pour avoir les infos du canvas ! (V1.1: commented)
 * @todo 2: VectorOverlay pour controle de zoom et rotation
 * @todo 2: logic - is this a cFract or agnostic Overlay module ?
 */
import type { ComplexPoint, PixelPoint, IParent, IParams, IDrawOverlay, DrawOptions } from "../fractTypes.js";
/** Fonctions de rendu graphique pour orbites, lignes et rayons externes

 */
export declare class cFractDraw implements IDrawOverlay {
    static drawReticle(canvas: HTMLCanvasElement, pix: PixelPoint): void;
    /** Draw fixed points for Julia set
     * @todo 2: simplify the interface */
    static drawFixedPointsOverlay(ctx: CanvasRenderingContext2D, param: IParams, width: number, height: number, fixedPoints?: ComplexPoint[]): void;
    static drawComplexPath(parent: IParent, points: ComplexPoint[], options?: DrawOptions): void;
}
//# sourceMappingURL=fractDraw.d.ts.map