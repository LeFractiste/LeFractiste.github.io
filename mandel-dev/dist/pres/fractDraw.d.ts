/** Calque de surimpressions (Overlay)
 *  V1: list of static functions (called par parent.render with parameters and PixelPoint coordinates).
 * @todo 1: constructeur pour avoir les infos du canvas ! (V1.1: commented)
 * @todo 2: VectorOverlay pour controle de zoom et rotation
 * @todo 2: logic - is this a cFract or agnostic Overlay module ?
 */
import type { ComplexPoint, PixelPoint, IParent, IDrawOverlay, DrawOptions } from "../fractTypes.js";
/** Fonctions de rendu graphique pour orbites, lignes et rayons externes

 */
export declare class cFractDraw implements IDrawOverlay {
    private parent;
    constructor(parent: IParent);
    drawReticle(pix: PixelPoint): void;
    /** Draw fixed points for Julia set */
    drawFixedPointsOverlay(fixedPoints?: ComplexPoint[]): void;
    drawComplexPath(points: ComplexPoint[], options?: DrawOptions): void;
}
//# sourceMappingURL=fractDraw.d.ts.map