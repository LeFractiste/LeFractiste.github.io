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
export declare class PaletteEditor implements IPaletteEditor {
    container: HTMLElement;
    params: IPalOptions;
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