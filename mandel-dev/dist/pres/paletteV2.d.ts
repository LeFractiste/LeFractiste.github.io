export declare class Palette {
    constructor();
}
export declare class PaletteEditor {
    constructor(containerId: string, onChangeCallback: () => void);
    initUI(): void;
    generateLut(): void;
    updatePalette(): void;
    drawPreview(): void;
    getColorFromNormalized(t: any): {
        r: any;
        g: any;
        b: any;
    };
    getColor(iter: any, maxIter?: number): {
        r: any;
        g: any;
        b: any;
    };
}
//# sourceMappingURL=paletteV2.d.ts.map