// calc/cFractCalc.ts - Algorithmes de calcul & Pont Wasm
import {
  ComplexPoint,
  PixelPoint,
  IParent,
  IParams,
  CalcMode,
  ICalcOptions,
  ICalc,
  ITestableGrid,
  FractType
} from "../fractTypes.js";
import init, { MandelEngine } from "../../pkg/rust_m.js"; //todo 0: initWasm ou InitSync ou __wbg_Init ? Pq sans {}

// #region interfaces

// Outputs from DirectIter or DEM for possibility to continue computing
type IterData = {
  iter: number; //integer or liearized
  ZN?: ComplexPoint;
  dZN?: ComplexPoint;
  dist?: number;
};

// #region CalcOptions

/** Helper class - Copy of all cFract.params
 *  required for Wasm-Rust and computing,
 * to allow refactoring by isolation */
class CalcOptions implements ICalcOptions {
  isJulia: boolean;
  juliaC_re: number;
  juliaC_im: number;
  resX: number; // different for Rust in case of fast zoom and QuadTree
  resY: number;
  mode: CalcMode = "DIRECT";
  center_re: number;
  center_im: number;
  span_re: number;
  span_im: number;
  iterMax: number;
  r2max: number;
  readonly PAYLOAD_SIZE = 5;

  /** Constructor: attendue par les fonctions de Wasm-Rust */
  constructor(params: IParams, canvas: HTMLCanvasElement) {
    this.isJulia = params.isJulia; // not fast but ok
    this.juliaC_re = params.juliaC.re;
    this.juliaC_im = params.juliaC.im;
    this.resX = canvas.width;
    this.resY = canvas.height;
    this.center_re = params.center.re;
    this.center_im = params.center.im;
    this.span_re = params.span.re;
    this.span_im = params.span.im;
    this.iterMax = params.iterMax;
    this.r2max = params.r2Max;
  }
  get payloadLen(): number {
    return this.resX * this.resY * this.PAYLOAD_SIZE;
  }
  // helper temporaire de refactorisation
  get calcMode(): number {
    return this.mode === "DIRECT" ? 0 : this.mode === "DEM" ? 1 : 99;
  }
}

// #region cFractCalc

/** cFractCalc: Expose compute algorithms and Wasm bridge */
export class cFractCalc implements ICalc, ITestableGrid<PixelPoint, number> {
  private parent: IParent;
  private options: CalcOptions;
  private isBusy: boolean = false;
  public autoCalc: boolean;
  public calcCount: number = 0;
  private wasmEngine: MandelEngine | null;
  private wasmMemory: WebAssembly.Memory | null;
  private _calcBuffer: Float32Array;
  private iterBuffer: Uint32Array; //Exposed : iterSmooth to derive a color (<0 for small DEM ?)
  private Z0buffer: ComplexPoint[] = [];
  private ZNdataBuffer: IterData[] = [];
  /* cFractCalc : fast constructor - call async initCalc() to complete.
     Rendering: calcFull --> calcBuffer --> cImage --> display */
  constructor(parent: IParent) {
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
  public async initCalc(): Promise<void> {
    //console.trace("cFractCalc.initCalc");
    const op = this.options;
    try {
      const wasmExports = await init(); //Wasm
      this.wasmMemory = wasmExports.memory;
      this.wasmEngine = new MandelEngine(op.resX, op.resY);
      if (this.wasmActive) {
        // Création d'une vue Float32Array directe sur la mémoire Wasm
        const ptr = this.wasmEngine.buffer_ptr(); // Float32 Wasm
        this._calcBuffer = new Float32Array(this.wasmMemory.buffer, ptr, op.payloadLen);
      } else {
        //this._calcBuffer = new Float32Array(op.payloadLen);
        this.parent.T.userInfo("Wasm-Rust not initialised");
      }
    } catch (e) {
      throw new Error("Error Calc init");
    }
  }

  /** Computation mode: // 'DEM', 'DIRECT', etc. */
  public setCalcMode(mode: string): void {
    //this.calcMode = mode; //@todo 2: sécuriser l'interface!
    //this.makeDirty();
  }
  // Computation mode: true if wasm ready
  get wasmActive(): boolean {
    return this.wasmMemory !== null && this.wasmEngine !== null;
  }
  // Provides a link to _calcBuffer (readonly)
  get calcBuffer(): Float32Array {
    return this._calcBuffer; //nettoyer le truc
  } /**/

  // #region calcIter

  /** Calcul d'orbite z(n+1):= z^2 + c
   * @todo 2: déléguer iter au Wasm */
  public calcIter(z0: ComplexPoint, maxIter: number = this.options.iterMax): number {
    const Op = this.options;
    const r2max = Op.r2max;
    const { re: c_re, im: c_im }: ComplexPoint = Op.isJulia
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
      if (zRe2 + zIm2 > r2max) break;
      const newIm = 2.0 * zRe * zIm + c_im;
      zRe = zRe2 - zIm2 + c_re;
      zIm = newIm;
      iter++;
    }
    return iter; // todo: return smoothIter ?
  }
  // test point
  getAt(pt: PixelPoint): number {
    const width = this.options.resX;
    const inBounds = pt.x >= 0 && pt.x <= width && pt.y >= 0 && pt.y <= this.options.resY;
    if (!inBounds) return -1; //error
    const index = Math.floor(pt.x) + width * Math.floor(pt.y);
    const iter = this._calcBuffer[index];
    return iter;
  }

  // #region calcFull()

  // Launch full recomputing based on (dirty) parameters;
  public reCalcGrid(): void {
    if (this.isBusy) return;
    try {
      this.isBusy = true;
      // copy parameters : not dirty!
      this.options = new CalcOptions(this.parent.params, this.parent.canvas); //exposed
      this.parent.params.setDirty(false);
      const op = this.options;

      if (op.calcMode >= 99) {
        throw new Error("Bug 99 calc_mode");
        return;
      }
      //computes data and image - use fresh buffer
      if (this.wasmActive) {
        this.computeWasmPayload();
        // use fresh buffer : may change (both cFract likely to share the code)
        const ptr = this.wasmEngine!.buffer_ptr();
        this._calcBuffer = new Float32Array(
          this.wasmMemory!.buffer,
          ptr,
          this.options.payloadLen
        );
        this.parent.cImage.reCalcGrid(this._calcBuffer, op.iterMax);
      } else {
        this.calcFull_Direct_FallBack();
      }
      this.calcCount++;
    } catch (err) {
      console.error("[cFract] Erreur lors du calcul :", err);
    } finally {
      this.isBusy = false;
    }
  }

  // #region calcFull_fallBack

  /** Fallback du calcul : lent...
   * pas optimisé pour mandel ou julia, ni zx*zx, ni DEM
   */
  private calcFull_Direct_FallBack(): void {
    const op = this.options;
    const w = op.resX;
    const h = op.resY;
    const maxIter = op.iterMax;
    const r2Max = op.r2max;
    const centerRe = op.center_re;
    const centerIm = op.center_im;
    const spanRe = op.span_re;
    const spanIm = op.span_im;
    const jCx: number | undefined = op.isJulia ? op.juliaC_re : undefined;
    const jCy: number | undefined = op.isJulia ? op.juliaC_im : undefined;
    let idx = 0;
    for (let py = 0; py < h; py++) {
      let zx = centerIm - (py / h - 0.5) * spanIm;
      const cx = jCx || zx;
      for (let px = 0; px < w; px++) {
        let zy = centerRe + (px / w - 0.5) * spanRe;
        const cy = jCy || zy;
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
  public computeWasmPayload(): void {
    if (!this.wasmEngine || !this.wasmMemory) {
      throw new Error("[cFractCalc] WasmEngine non initialisé");
    }
    // Appel direct WebAssembly, qui calcule dans le buffer partagé
    const options = this.options;
    console.log(JSON.stringify(options));
    this.wasmEngine.compute_generic(
      options.isJulia,
      options.juliaC_re,
      options.juliaC_im,
      options.center_re,
      options.center_im,
      options.span_re,
      options.span_im,
      options.iterMax,
      options.r2max,
      options.calcMode
    );
    /* buffer déjà récupéré dans this._buffer
    const rawPtr: number = this.wasmEngine.buffer_ptr(); // Float32 Wasm
    this Float32Array(this.wasmMemory.buffer, rawPtr, this.options.payloadLen); */
  }

  // #region CalcOrbit

  /** Calcul d'orbite z(n+1):= z^2 + c
   * @todo: déléguer au Wasm
   * // return this.wasmEngine.compute_orbit_array(
        z0.re, z0.im, c.re, c.im, maxIter); */
  calcOrbit(z0: ComplexPoint, maxIter = this.options.iterMax): ComplexPoint[] {
    const op: CalcOptions = this.options;
    const r2max = op.r2max;
    const c: ComplexPoint = op.isJulia ? { re: op.juliaC_re, im: op.juliaC_im } : z0;
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
  }

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
}
