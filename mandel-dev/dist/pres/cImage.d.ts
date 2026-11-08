import { ColorRGBA, PixelPoint, IImage, ITestableGrid } from "../fractTypes.js";
export declare class cImage implements IImage, ITestableGrid<PixelPoint, ColorRGBA> {
    width: number;
    height: number;
    buffer: ImageData;
    private lut;
    constructor(width: number, height: number);
    /**
     * Génère une palette arc-en-ciel / bleu-or fluide par défaut
     * Évite l'écran noir si aucun PaletteEditor n'est fourni.
     */
    private initDefaultPalette;
    /**
     * Reçoit une nouvelle LUT de l'extérieur (ex: PaletteEditor)
     */
    updatePalette(lookUpTable: Uint8Array): void;
    getAt(pt: PixelPoint): ColorRGBA;
    /** Projection du buffer Wasm Float32 vers le buffer d'image Canvas (Uint8ClampedArray)
     */
    reCalcGrid(wasmFloatBuffer: Float32Array, maxIter?: number): void;
    /** Rendu de la matrice de distances DEM */
    distToImage(demMatrix: number[][], ctx: CanvasRenderingContext2D): ImageData;
}
//# sourceMappingURL=cImage.d.ts.map