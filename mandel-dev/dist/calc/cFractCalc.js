import init, { MandelEngine } from "../../pkg/rust_m.js"; //todo 0: initWasm ou InitSync ou __wbg_Init ? Pq sans {}
// #region CalcOptions
/** Helper class - Copy of all cFract.params required for Wasm-Rust and computing */
class CalcOptions {
    typeName;
    resX; // different for Rust in case of fast zoom and QuadTree
    resY;
    mode = "DIRECT";
    center_re;
    center_im;
    span_re;
    span_im;
    iterMax;
    r2max;
    isJulia;
    juliaC_re;
    juliaC_im;
    PAYLOAD_SIZE = 5;
    get payloadLen() {
        return this.resX * this.resY * this.PAYLOAD_SIZE;
    }
    // helper temporaire de refactorisation
    get calcMode() {
        return this.mode === "DIRECT" ? 0 : this.mode === "DEM" ? 1 : 99;
    }
    /** Constructor: attendue par les fonctions de Wasm-Rust */
    constructor(params, canvas) {
        //todo 2: check the best object to pass !
        this.typeName = params.typeName;
        this.resX = canvas.width;
        this.resY = canvas.height;
        // copy params to allow refactoring here
        this.center_re = params.center.re;
        this.center_im = params.center.im;
        this.span_re = params.span.re;
        this.span_im = params.span.im;
        this.iterMax = params.max_iter;
        this.r2max = params.r2_max;
        this.isJulia = !(params.typeName === "MANDELBROT");
        this.juliaC_re = params.juliaC.re;
        this.juliaC_im = params.juliaC.im;
    }
}
// #region cFractCalc
/** cFractCalc: Expose compute algorithms and Wasm bridge */
export class cFractCalc {
    parent;
    options;
    isBusy = false;
    autoCalc;
    calcCount = 0;
    wasmEngine;
    wasmMemory;
    _calcBuffer;
    iterBuffer; //Exposed : iterSmooth to derive a color (<0 for small DEM ?)
    Z0buffer = [];
    ZNdataBuffer = [];
    get wasmActive() {
        return this.wasmMemory !== null && this.wasmEngine !== null;
    }
    // Provides a link to _calcBuffer (readonly)
    get calcBuffer() {
        return this._calcBuffer; //nettoyer le truc
    } /**/
    /* cFractCalc : fast constructor - call async initCalc() to complete.
       Rendering: calcFull --> calcBuffer --> cImage --> display */
    constructor(parent) {
        this.parent = parent;
        // Get all options - do not use anything else, update excepted
        this.options = new CalcOptions(parent.params, parent.canvas); //exposed
        this.autoCalc = true;
        this.calcCount = 0;
        this.wasmEngine = null;
        this.wasmMemory = null;
        this._calcBuffer = new Float32Array(this.options.payloadLen); //shared by Wasm
        this.iterBuffer = new Uint32Array(this.options.resX * this.options.resY); // juste des Iter(Smooth)
    }
    // #region initCalc()
    // Launch the wasm module or prepare to compute by script
    async initCalc() {
        console.trace("cFractCalc.initCalc");
        const op = this.options;
        try {
            const wasmExports = await init(); //Wasm
            this.wasmMemory = wasmExports.memory;
            this.wasmEngine = new MandelEngine(op.resX, op.resY);
            if (this.wasmActive) {
                // Création d'une vue Float32Array directe sur la mémoire Wasm
                const ptr = this.wasmEngine.buffer_ptr(); // Float32 Wasm
                this._calcBuffer = new Float32Array(this.wasmMemory.buffer, ptr, op.payloadLen);
            }
            else {
                this._calcBuffer = new Float32Array(op.payloadLen);
                this.parent.classConsole("cFract: Wasm not initialised");
            }
        }
        catch (e) {
            this.parent.classConsole("Error Calc init");
        }
    }
    /** Computation mode: // 'DEM', 'DIRECT', etc. */
    setCalcMode(mode) {
        //this.calcMode = mode; //@todo 2: sécuriser l'interface!
        //this.makeDirty();
    }
    // #region calcIter
    /** Calcul d'orbite z(n+1):= z^2 + c
     * @todo 2: déléguer iter au Wasm */
    calcIter(z0, maxIter = this.options.iterMax) {
        const Op = this.options;
        const r2max = Op.r2max;
        const { re: c_re, im: c_im } = Op.isJulia
            ? { re: Op.juliaC_im, im: Op.juliaC_re }
            : z0;
        /* not implemented yet
          if (this.wasmEngine && typeof this.wasmEngine.compute_orbit_iter === "function") {
          return this.wasmEngine.compute_orbit_iter(z0.re, z0.im, c_re, c_im, maxIter, r2max);
        } */
        // Fallback JS
        let zRe = z0.re;
        let zIm = z0.im;
        let iter = 0;
        while (iter < maxIter) {
            const zRe2 = zRe * zRe;
            const zIm2 = zIm * zIm;
            if (zRe2 + zIm2 > r2max)
                break;
            const newIm = 2.0 * zRe * zIm + c_im;
            zRe = zRe2 - zIm2 + c_re;
            zIm = newIm;
            iter++;
        }
        return iter; // todo: return smoothIter ?
    }
    // #region calcFull()
    // Launch full recomputing based on (dirty) parameters;
    calcFull() {
        if (this.isBusy)
            return;
        this.isBusy = true;
        // copy parameters : not dirty!
        this.options = new CalcOptions(this.parent.params, this.parent.canvas); //exposed
        this.parent.params.dirty = false;
        const op = this.options;
        try {
            if (op.calcMode >= 99) {
                throw new Error("Bug 99 calc_mode");
                return;
            }
            //computes data and image
            if (this.wasmActive) {
                this.computeWasmPayload();
                this.parent.cImage.updateFromWasmPayload(this._calcBuffer, op.iterMax);
            }
            else {
                this.calcFull_fallBack();
            }
            this.calcCount++;
        }
        catch (err) {
            console.error("[cFract] Erreur lors du calcul :", err);
        }
        finally {
            this.isBusy = false;
        }
    }
    // #region calcFull_fallBack
    /** Calcul principal, avec fallback */
    calcFull_fallBack() {
        const op = this.options;
        const w = op.resX;
        const h = op.resY;
        const maxIter = op.iterMax;
        const r2Max = op.r2max;
        const centerRe = op.center_re;
        const centerIm = op.center_im;
        const spanRe = op.span_re;
        const spanIm = op.span_im;
        /** if (this.wasmEngine && typeof this.wasmEngine.compute_orbit_iter === "function") {
          return this.wasmEngine.compute_full();
        }/**/
        let idx = 0;
        for (let py = 0; py < h; py++) {
            const cy = centerIm - (py / h - 0.5) * spanIm;
            for (let px = 0; px < w; px++) {
                const cx = centerRe + (px / w - 0.5) * spanRe;
                // Algorithme de Mandelbrot de base en JS
                let zx = 0;
                let zy = 0;
                let iter = 0;
                while (zx * zx + zy * zy <= r2Max && iter < maxIter) {
                    const tmp = zx * zx - zy * zy + cx;
                    zy = 2 * zx * zy + cy;
                    zx = tmp;
                    iter++;
                }
                this.iterBuffer[idx++] = iter;
            }
        }
    }
    // #region computeWasmPayload
    // Exécution Wasm complète sur toute la grille de pixels
    computeWasmPayload() {
        if (!this.wasmEngine || !this.wasmMemory) {
            throw new Error("[cFractCalc] WasmEngine non initialisé");
        }
        // Appel direct WebAssembly, qui calcule dans le buffer partagé
        const Op = this.options;
        this.wasmEngine.compute_generic(Op.isJulia, Op.juliaC_re, Op.juliaC_im, Op.center_re, Op.center_im, Op.span_re, Op.span_im, Op.iterMax, Op.r2max, Op.calcMode);
        /* buffer déjà récupéré dans this._buffer
        const rawPtr: number = this.wasmEngine.buffer_ptr(); // Float32 Wasm
        this Float32Array(this.wasmMemory.buffer, rawPtr, this.options.payloadLen); */
    }
    // #region to refactor
    //Calcul d'orbite z(n+1):= z^2 + c (@todo: déléguer au Wasm)
    /* return this.wasmEngine.compute_orbit_array(
          z0.re, z0.im, c.re, c.im, maxIter); */
    calcOrbit(z0, maxIter = this.options.iterMax) {
        const op = this.options;
        const r2max = op.r2max;
        const c = op.typeName === "JULIA" ? { re: op.juliaC_re, im: op.juliaC_im } : z0;
        const cRe = c.re;
        const cIm = c.im;
        let zRe = z0.re;
        let zIm = z0.im; //M & J: z0 = le point du plan
        let mod2 = zRe * zRe + zIm * zIm;
        const orbit = [{ re: zRe, im: zIm }];
        for (let n = 1; n <= maxIter; n++) {
            const zx2 = zRe * zRe;
            const zy2 = zIm * zIm;
            const tmp = zx2 - zy2 + cRe;
            zIm = 2.0 * zRe * zIm + cIm;
            zRe = tmp;
            mod2 = zx2 + zy2;
            orbit.push({ re: zRe, im: zIm });
            if (mod2 > r2max)
                break; // escaped
        }
        return orbit;
    }
}
//# sourceMappingURL=cFractCalc.js.map