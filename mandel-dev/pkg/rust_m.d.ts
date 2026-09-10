/* tslint:disable */
/* eslint-disable */

export class MandelEngine {
    free(): void;
    [Symbol.dispose](): void;
    buffer_ptr(): number;
    compute_full(center_re: number, center_im: number, span_re: number, span_im: number, max_iter: number, r2_max: number): void;
    compute_generic(is_julia: boolean, julia_c_re: number, julia_c_im: number, center_re: number, center_im: number, span_re: number, span_im: number, max_iter: number, r2_max: number, calc_mode: number): void;
    /**
     * Extrait la sous-suite d'itérations d'un point c(x, y)
     * Renvoie une chaîne de caractères au format CSV : "iter,zx,zy,modulus\n"
     */
    compute_orbit_csv(cx: number, cy: number, max_iter: number): string;
    constructor(width: number, height: number);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_mandelengine_free: (a: number, b: number) => void;
    readonly mandelengine_buffer_ptr: (a: number) => number;
    readonly mandelengine_compute_full: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly mandelengine_compute_generic: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
    readonly mandelengine_compute_orbit_csv: (a: number, b: number, c: number, d: number) => [number, number];
    readonly mandelengine_new: (a: number, b: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
