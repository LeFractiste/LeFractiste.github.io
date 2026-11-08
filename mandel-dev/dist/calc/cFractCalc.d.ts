import { ComplexPoint, PixelPoint, IParent, ICalc, ITestableGrid } from "../fractTypes.js";
/** cFractCalc: Expose compute algorithms and Wasm bridge */
export declare class cFractCalc implements ICalc, ITestableGrid<PixelPoint, number> {
    private parent;
    private options;
    private isBusy;
    autoCalc: boolean;
    calcCount: number;
    private wasmEngine;
    private wasmMemory;
    private _calcBuffer;
    private iterBuffer;
    private Z0buffer;
    private ZNdataBuffer;
    constructor(parent: IParent);
    initCalc(): Promise<void>;
    /** Computation mode: // 'DEM', 'DIRECT', etc. */
    setCalcMode(mode: string): void;
    get wasmActive(): boolean;
    get calcBuffer(): Float32Array;
    /** Calcul d'orbite z(n+1):= z^2 + c
     * @todo 2: déléguer iter au Wasm */
    calcIter(z0: ComplexPoint, maxIter?: number): number;
    getAt(pt: PixelPoint): number;
    reCalcGrid(): void;
    /** Fallback du calcul : lent...
     * pas optimisé pour mandel ou julia, ni zx*zx, ni DEM
     */
    private calcFull_Direct_FallBack;
    computeWasmPayload(): void;
    calcOrbit(z0: ComplexPoint, maxIter?: number): ComplexPoint[];
}
//# sourceMappingURL=cFractCalc.d.ts.map