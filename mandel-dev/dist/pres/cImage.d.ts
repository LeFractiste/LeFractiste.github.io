export declare class cImage {
    width: number;
    height: number;
    imageData: ImageData;
    lut: Uint8Array;
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
    /** Projection du buffer Wasm Float32 vers le buffer d'image Canvas (Uint8ClampedArray)
     */
    updateFromWasmPayload(wasmFloatBuffer: Float32Array, maxIter?: number): void;
    /** Rendu de la matrice de distances DEM */
    distToImage(demMatrix: number[][], ctx: CanvasRenderingContext2D): ImageData;
}
//# sourceMappingURL=cImage.d.ts.map