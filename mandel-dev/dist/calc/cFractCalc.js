import init, { MandelEngine } from "../../pkg/rust_m.js"; //todo 0: initWasm ou InitSync ou __wbg_Init ? Pq sans {}
/** Copy of all data required for Wasm-Rust and computing */
export class CalcOptions {
    typeName;
    resX; // different for Rust in case of fast zoom and QuadTree
    resY;
    mode;
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
        this.mode = "Direct"; //so far! todo!!!
    }
}
// #region class
/** cFractCalc: Expose compute algorithms and Wasm bridge */
export class cFractCalc {
    parent;
    options;
    isBusy = true;
    calcCount = 0;
    wasmEngine;
    wasmMemory;
    calcBuffer;
    isWasmReady = false;
    iterBuffer; //Exposed : iterSmooth to derive a color (<0 for small DEM ?)
    Z0buffer = [];
    ZNdataBuffer = [];
    get wasmActive() {
        return this.wasmMemory !== null && this.wasmEngine !== null;
    }
    /* Constructeur V5 */
    constructor(parent) {
        this.parent = parent;
        // Get all options - do not use anything else, update excepted
        this.options = new CalcOptions(parent.params, parent.canvas); //exposed
        this.iterBuffer = new Uint32Array(this.options.resX * this.options.resY);
        this.wasmEngine = null;
        this.wasmMemory = null;
        this.calcBuffer = new Float32Array(this.options.payloadLen);
    }
    // Launch the module - last step of parent.init !
    async initCalc() {
        try {
            const op = this.options;
            const wasmExports = await init(); //Wasm
            this.wasmMemory = wasmExports.memory;
            this.wasmEngine = new MandelEngine(op.resX, op.resY);
            if (!this.wasmActive)
                this.parent.classConsole("cFract: Wasm not initialised");
            // Création d'une vue Float32Array directe sur la mémoire Wasm
            const ptr = this.wasmEngine.buffer_ptr(); // Float32 Wasm
            this.calcBuffer = new Float32Array(this.wasmMemory.buffer, ptr, op.payloadLen);
        }
        catch (e) {
            this.parent.classConsole("Error Calc init");
        }
        this.recalcAll(); //termine parent.init
    }
    // #region StateM
    /* Computation mode: // 'DEM', 'DIRECT', etc. */
    setCalcMode(mode) {
        //this.calcMode = mode; //@todo 2: sécuriser l'interface!
        //this.makeDirty();
    }
    // Launch full recomputing based on (dirty) parameters;
    recalcAll() {
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
                this.calcBuffer = this.computeWasmPayload();
            } // else local computes here
            this.calcCount++;
            this.parent.cImage.updateFromWasmPayload(this.calcBuffer, op.iterMax);
            this.parent.render();
        }
        catch (err) {
            console.error("[cFract] Erreur lors du calcul :", err);
        }
        finally {
            this.isBusy = false;
        }
    }
    // #region orbits
    /** Calcul d'orbite z(n+1):= z^2 + c
     * @todo 2: déléguer iter au Wasm */
    directIter(z0, maxIter = this.options.iterMax) {
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
    // #region Calc
    /** Calcul principal, avec fallback */
    calcFull() {
        const op = this.options;
        const w = op.resX;
        const h = op.resY;
        const maxIter = op.iterMax;
        const r2Max = op.r2max;
        const centerRe = op.center_re;
        const centerIm = op.center_im;
        const spanRe = op.span_re;
        const spanIm = op.span_im;
        /*if (this.wasmEngine && typeof this.wasmEngine.compute_orbit_iter === "function") {
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
        return this.iterBuffer;
    }
    // Exécution Wasm complète sur toute la grille de pixels
    computeWasmPayload() {
        if (!this.wasmEngine || !this.wasmMemory) {
            throw new Error("[cFractCalc] WasmEngine non initialisé");
        }
        // Appel direct au buffer partagé WebAssembly
        const Op = this.options;
        this.wasmEngine.compute_generic(Op.isJulia, Op.juliaC_re, Op.juliaC_im, Op.center_re, Op.center_im, Op.span_re, Op.span_im, Op.iterMax, Op.r2max, Op.calcMode);
        const rawPtr = this.wasmEngine.buffer_ptr(); // Float32 Wasm
        return new Float32Array(this.wasmMemory.buffer, rawPtr, this.options.payloadLen);
    }
}
// #region to refactor
//Calcul d'orbite z(n+1):= z^2 + c (@todo: déléguer au Wasm)
/* return this.wasmEngine.compute_orbit_array(
        z0.re, z0.im, c.re, c.im, maxIter); */
/*jsdirectIter(z0, maxIter = this.param.max_iter) {
    const r2max = this.param.r2_max;
    const c = this.param.type === "JULIA" ? this.param.juliaC : z0;
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
      if (mod2 > r2max) break; // escaped
    }
    return orbit;
  } /*directIter*/
// Applique l'algorithme Distance Estimator Method (DEM) sur la matrice des z0.
/*jsCalcMatrixDEM(z0Matrix, maxIter = 500) {
    const H = z0Matrix.length;
    const W = z0Matrix[0].length;
    const demMatrix = new Array(H);
    for (let y = 0; y < H; y++) {
      demMatrix[y] = new Float64Array(W);
      for (let x = 0; x < W; x++) {
        const z0 = z0Matrix[y][x];
        let zr = z0.re;
        let zi = z0.im;

        // Dérivée dz/dc initialisée à 1
        let dzr = 1.0;
        let dzi = 0.0;

        let iter = 0;
        let r2 = zr * zr + zi * zi;

        while (r2 <= 4.0 && iter < maxIter) {
          // dz = 2 * z * dz + 1
          const new_dzr = 2.0 * (zr * dzr - zi * dzi) + 1.0;
          dzi = 2.0 * (zr * dzi + zi * dzr);
          dzr = new_dzr;

          // z = z^2 + z0
          const new_zr = zr * zr - zi * zi + z0.re;
          zi = 2.0 * zr * zi + z0.im;
          zr = new_zr;

          r2 = zr * zr + zi * zi;
          iter++;
        }

        if (iter === maxIter) {
          demMatrix[y][x] = 0.0; // Intérieur de l'ensemble (lac)
        } else {
          const r = Math.sqrt(r2);
          const dr = Math.sqrt(dzr * dzr + dzi * dzi);
          // Formule de Peitgen & Saupe pour la distance : 2 * |z| * ln|z| / |dz|
          demMatrix[y][x] = (2.0 * r * Math.log(r)) / dr;
        }
      }
    }
    return demMatrix;
  } /**/
// Calcul de la fractale via Wasm - interface
/*jscalcFull() {
    if (!this.wasmEngine || !this.wasmMemory) return;
    this.isBusy = true;
    this.calcCount += 1;
    const calcModeInt = this.calcMode === "DEM" ? 1 : 0;
    // Envoi universel vers Rust selon calcMode et param.type
    this.wasmEngine.compute_generic(
      this.param.type === "JULIA", // is_julia (bool)
      this.param.juliaC.re,
      this.param.juliaC.im, // c_re, c_im (ignorés si Mandel)
      this.param.center.re,
      this.param.center.im,
      this.param.span.re,
      this.param.span.im,
      this.param.max_iter,
      this.param.r2_max,
      calcModeInt
    );
    // Extraction memoire: nouvelle méthode
    const ptr = this.wasmEngine.buffer_ptr(); // Float32 Wasm
    const payloadLen = this.canvas.width * this.canvas.height * PAYLOAD_SIZE;
    // Création d'une vue Float32Array directe sur la mémoire Wasm
    const wasmBuffer = new Float32Array(this.wasmMemory.buffer, ptr, payloadLen);
    // Transmutation du payload Wasm en ImageData via la LUT
    this.cImage.updateFromWasmPayload(wasmBuffer, this.param.max_iter);
    this.makeClean();
  } /***/
//# sourceMappingURL=cFractCalc.js.map