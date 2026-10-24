import type { ComplexPoint, IParent, IParams, DrawOptions } from "../fractTypes.js";
export declare class cFractDraw {
    static drawFixedPointsOverlay(ctx: CanvasRenderingContext2D, param: IParams, width: number, height: number, fixedPoints?: ComplexPoint[]): void;
    static drawComplexPath(parent: IParent, points: ComplexPoint[], options?: DrawOptions): void;
}
//# sourceMappingURL=fractDraw.d.ts.map