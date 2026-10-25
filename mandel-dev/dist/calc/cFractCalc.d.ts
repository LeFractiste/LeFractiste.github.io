import { ComplexPoint, IParent, ICalc } from "../fractTypes.js";
/** cFractCalc: Expose compute algorithms and Wasm bridge */
export declare class cFractCalc implements ICalc {
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
    get wasmActive(): boolean;
    get calcBuffer(): Float32Array;
    constructor(parent: IParent);
    initCalc(): Promise<void>;
    /** Computation mode: // 'DEM', 'DIRECT', etc. */
    setCalcMode(mode: string): void;
    /** Calcul d'orbite z(n+1):= z^2 + c
     * @todo 2: déléguer iter au Wasm */
    calcIter(z0: ComplexPoint, maxIter?: number): number;
    calcFull(): void;
    /** Calcul principal, avec fallback */
    private calcFull_fallBack;
    computeWasmPayload(): void;
    calcOrbit(z0: ComplexPoint, maxIter?: number): ComplexPoint[];
}
//# sourceMappingURL=cFractCalc.d.ts.map