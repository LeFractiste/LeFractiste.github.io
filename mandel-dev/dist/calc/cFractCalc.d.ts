import { ComplexPoint, IParent, ICalc } from "../fractTypes.js";
/** cFractCalc: Expose compute algorithms and Wasm bridge */
export declare class cFractCalc implements ICalc {
    private parent;
    private options;
    isBusy: boolean;
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
    setCalcMode(mode: string): void;
    recalcAll(): void;
    /** Calcul d'orbite z(n+1):= z^2 + c
     * @todo 2: déléguer iter au Wasm */
    directIter(z0: ComplexPoint, maxIter?: number): number;
    /** Calcul principal, avec fallback */
    calcFull(): Uint32Array;
    computeWasmPayload(): Float32Array;
}
//# sourceMappingURL=cFractCalc.d.ts.map