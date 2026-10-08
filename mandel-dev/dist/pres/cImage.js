// cImage.ts - Copyright LeFractiste 2026
// Gestionnaire de buffer d'image et de LUT (LookUp Table) autonome
const PAYLOAD_SIZE = 5; // [iter, smooth_iter, z_re, z_im, distance/escape angle]
export class cImage {
    width;
    height;
    imageData;
    lut;
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.imageData = new ImageData(width, height);
        // LUT de 1024 couleurs x 4 canaux (RGBA) = 4096 octets
        this.lut = new Uint8Array(1024 * 4);
        // Génération automatique d'une palette par défaut
        this.initDefaultPalette();
    }
    /**
     * Génère une palette arc-en-ciel / bleu-or fluide par défaut
     * Évite l'écran noir si aucun PaletteEditor n'est fourni.
     */
    initDefaultPalette() {
        const lutSize = 1024;
        for (let i = 0; i < lutSize; i++) {
            const t = i / lutSize;
            const idx = i * 4;
            // Dégradésinusoidal classique (Bleu -> Cyan -> Or -> Rouge)
            this.lut[idx] = Math.floor(127.5 * (1 + Math.sin(2 * Math.PI * t))); // R
            this.lut[idx + 1] = Math.floor(127.5 * (1 + Math.sin(2 * Math.PI * t + 2))); // G
            this.lut[idx + 2] = Math.floor(127.5 * (1 + Math.sin(2 * Math.PI * t + 4))); // B
            this.lut[idx + 3] = 255; // Alpha
        }
    }
    /**
     * Reçoit une nouvelle LUT de l'extérieur (ex: PaletteEditor)
     */
    updatePalette(lookUpTable) {
        if (lookUpTable && lookUpTable.length === 1024 * 4) {
            this.lut = lookUpTable;
        }
        else if (lookUpTable) {
            // Sécurité si la taille reçue diffère
            this.lut.set(lookUpTable);
        }
    }
    /** Projection du buffer Wasm Float32 vers le buffer d'image Canvas (Uint8ClampedArray)
     */
    updateFromWasmPayload(wasmFloatBuffer, maxIter = 500) {
        const pixels = this.imageData.data;
        const lutSize = this.lut.length / 4;
        for (let i = 0; i < this.width * this.height; i++) {
            const payloadIdx = i * PAYLOAD_SIZE;
            const iter = wasmFloatBuffer[payloadIdx];
            const imgIdx = i * 4;
            if (iter >= maxIter) {
                // Intérieur de l'ensemble : NOIR OPAQUE
                pixels[imgIdx] = 0;
                pixels[imgIdx + 1] = 0;
                pixels[imgIdx + 2] = 0;
                pixels[imgIdx + 3] = 255;
            }
            else {
                // Extérieur : Mappage sur la LUT via le modulo
                const lutIdx = Math.floor(iter % lutSize) * 4;
                pixels[imgIdx] = this.lut[lutIdx];
                pixels[imgIdx + 1] = this.lut[lutIdx + 1];
                pixels[imgIdx + 2] = this.lut[lutIdx + 2];
                pixels[imgIdx + 3] = 255;
            }
        }
    }
    /** Rendu de la matrice de distances DEM */
    distToImage(demMatrix, ctx) {
        const H = demMatrix.length;
        const W = demMatrix[0].length;
        const imgData = ctx.createImageData(W, H);
        const data = imgData.data;
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const dist = demMatrix[y][x];
                const pixelIdx = (y * W + x) * 4;
                if (dist === 0.0) {
                    data[pixelIdx] = 0;
                    data[pixelIdx + 1] = 0;
                    data[pixelIdx + 2] = 0;
                    data[pixelIdx + 3] = 255;
                }
                else {
                    // Normalisation logarithmique pour le rendu de la distance
                    const val = Math.sin(Math.log(dist) * 2.0);
                    const intensity = Math.floor((val + 1.0) * 127.5);
                    data[pixelIdx] = intensity;
                    data[pixelIdx + 1] = Math.floor(intensity * 0.8);
                    data[pixelIdx + 2] = 255 - intensity;
                    data[pixelIdx + 3] = 255;
                }
            }
        }
        return imgData;
    }
}
//# sourceMappingURL=cImage.js.map