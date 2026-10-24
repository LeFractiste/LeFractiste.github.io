import { ComplexPoint, CalcMode, ICalcOptions } from "../fractTypes.js";
import { cFractParams } from "../calc/cFractParams.js";
import { cFract } from "../app/cFract.js";
/** Copy of all data required for Wasm-Rust and computing */
export declare class CalcOptions implements ICalcOptions {
    typeName: string;
    resX: number;
    resY: number;
    mode: CalcMode;
    center_re: number;
    center_im: number;
    span_re: number;
    span_im: number;
    iterMax: number;
    r2max: number;
    isJulia: boolean;
    juliaC_re: number;
    juliaC_im: number;
    readonly PAYLOAD_SIZE = 5;
    get payloadLen(): number;
    get calcMode(): number;
    /** Constructor: attendue par les fonctions de Wasm-Rust */
    constructor(params: cFractParams, canvas: HTMLCanvasElement);
}
/** cFractCalc: Expose compute algorithms and Wasm bridge */
export declare class cFractCalc {
    private parent;
    options: CalcOptions;
    isBusy: boolean;
    calcCount: number;
    private wasmEngine;
    private wasmMemory;
    private calcBuffer;
    private isWasmReady;
    private iterBuffer;
    private Z0buffer;
    private ZNdataBuffer;
    get wasmActive(): boolean;
    constructor(parent: cFract);
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