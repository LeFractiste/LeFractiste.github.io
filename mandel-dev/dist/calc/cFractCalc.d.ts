import { cFractParams } from "../calc/cFractParams.js";
import { ComplexPoint } from "../fractTypes.js";
export declare class cFractCalc {
    private wasmEngine;
    private wasmMemory;
    constructor(wasmEngine?: any, wasmMemory?: any);
    setWasmReference(wasmEngine: any, wasmMemory: any): void;
    setCalcMode(mode: any): void;
    directIter(z0: ComplexPoint, c: ComplexPoint, maxIter: number, r2Max: number): number;
    computeWasmPayload(param: cFractParams, width: number, height: number, calcMode: string): Float32Array;
}
//# sourceMappingURL=cFractCalc.d.ts.map