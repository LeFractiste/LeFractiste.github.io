import type { ComplexPoint, IParent, DrawOptions } from "../fractTypes.js";
import { cFractParams } from "../calc/cFractParams.js";
export declare class cFractDraw {
    static drawFixedPointsOverlay(ctx: CanvasRenderingContext2D, param: cFractParams, width: number, height: number, fixedPoints?: ComplexPoint[]): void;
}
export declare function drawComplexPath(parent: IParent, points: ComplexPoint[], options?: DrawOptions): void;
//# sourceMappingURL=fractDraw.d.ts.map