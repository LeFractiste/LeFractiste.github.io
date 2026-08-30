/* tslint:disable */
/* eslint-disable */

export class MandelEngine {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Extrait la sous-suite d'itérations d'un point c(x, y)
     * Renvoie une chaîne de caractères au format CSV : "iter,zx,zy,modulus\n"
     */
    compute_orbit_csv(cx: number, cy: number): string;
    static new(width: number, height: number, max_iter: number): MandelEngine;
    /**
     * Rendu de la fractale avec Distance Estimator Method (DEM)
     * Remplit un buffer RGBA (4 octets par pixel)
     */
    render_dem(xmin: number, xmax: number, ymin: number, ymax: number, output_buf: Uint8Array): void;
    /**
     * Rendu d'un ensemble de Julia J_c pour un c_fixed fixe avec DEM
     */
    render_julia_dem(cx_fixed: number, cy_fixed: number, xmin: number, xmax: number, ymin: number, ymax: number, output_buf: Uint8Array): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_mandelengine_free: (a: number, b: number) => void;
    readonly mandelengine_compute_orbit_csv: (a: number, b: number, c: number) => [number, number];
    readonly mandelengine_new: (a: number, b: number, c: number) => number;
    readonly mandelengine_render_dem: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: any) => void;
    readonly mandelengine_render_julia_dem: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: any) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
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
