import { IPaletteEditor, IPalOptions } from "../fractTypes.js";
export declare class ContPalette implements IPalOptions {
    cyclesH: number;
    cyclesS: number;
    cyclesV: number;
    phaseH: number;
    offsetV: number;
    size: number;
    constructor();
}
/** Editeur de palette, version 1. Self-installing in HTML
 *  @todo: version 2: avec handles + colorer ITerSmooth et DEM en range 1.0) */
export declare class PaletteEditor implements IPaletteEditor {
    container: HTMLElement;
    options: IPalOptions;
    lut: Uint8Array;
    onChange: (lookUpTable: Uint8Array) => void;
    previewCanvas: HTMLCanvasElement | null;
    previewCtx: CanvasRenderingContext2D | null;
    constructor(containerId: string, onChangeCallback: (lookUpTable: Uint8Array) => void);
    generateLut(): void;
    updatePalette(): void;
    drawPreview(): void;
    getColorFromNormalized(t: any): {
        r: number;
        g: number;
        b: number;
    };
    getColor(iter: any, maxIter?: number): {
        r: number;
        g: number;
        b: number;
    };
}
//# sourceMappingURL=palette.d.ts.map