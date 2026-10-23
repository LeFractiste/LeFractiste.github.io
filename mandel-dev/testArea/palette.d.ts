export class PaletteEditor {
    constructor(containerId: any, onChangeCallback: any);
    container: HTMLElement | null;
    onChange: any;
    params: {
        cyclesH: number;
        cyclesS: number;
        cyclesV: number;
        phaseH: number;
        offsetV: number;
        size: number;
    };
    lut: Uint8Array<ArrayBuffer>;
    initUI(): void;
    previewCanvas: HTMLElement | null | undefined;
    previewCtx: any;
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