import { cFractParams } from "../calc/cFractParams.js";
import { ComplexPoint } from "../fractTypes.js";
/** Expose compute algorithms and Wasm bridge */
export declare class cFractCalc {
    private width;
    private height;
    private wasmEngine;
    private wasmMemory;
    private isWasmReady;
    private iterBuffer;
    constructor(width?: number, height?: number);
    init(): Promise<void>;
    setWasmReference(wasmEngine: any, wasmMemory: any): void;
    setCalcMode(mode: string): void;
    directIter(z0: ComplexPoint, c: ComplexPoint, maxIter: number, r2Max: number): number;
    /** Calcul principal, avec fallback */
    calcFullJS(params: cFractParams): Uint32Array;
    computeWasmPayload(param: cFractParams, width: number, height: number, calcMode: string): Float32Array;
}
//# sourceMappingURL=cFractCalc.d.ts.map