// calc/cFractCalc.ts - Algorithmes de calcul & Pont Wasm
import { cFractParams } from "../calc/cFractParams.js";
import { ComplexPoint } from "../fractTypes.js";

export class cFractCalc {
  private wasmEngine: any;
  private wasmMemory: any;

  constructor(wasmEngine: any = null, wasmMemory: any = null) {
    this.wasmEngine = wasmEngine;
    this.wasmMemory = wasmMemory;
  }

  public setWasmReference(wasmEngine: any, wasmMemory: any): void {
    this.wasmEngine = wasmEngine;
    this.wasmMemory = wasmMemory;
  }

  /* Computation mode: // 'DEM', 'DIRECT', etc. */
  setCalcMode(mode: string): void {
    //this.calcMode = mode; //@todo 2: sécuriser l'interface!
    //this.makeDirty();
  }

  // Calcul d'orbite z(n+1):= z^2 + c (@todo: déléguer au Wasm)
  directIter(z0: ComplexPoint, c: ComplexPoint, maxIter: number, r2Max: number): number {
    if (this.wasmEngine && typeof this.wasmEngine.compute_orbit_iter === "function") {
      return this.wasmEngine.compute_orbit_iter(z0.re, z0.im, c.re, c.im, maxIter, r2Max);
    }
    // Fallback JS
    let zRe = z0.re;
    let zIm = z0.im;
    let iter = 0;
    while (iter < maxIter) {
      const zRe2 = zRe * zRe;
      const zIm2 = zIm * zIm;
      if (zRe2 + zIm2 > r2Max) break;
      const newIm = 2.0 * zRe * zIm + c.im;
      zRe = zRe2 - zIm2 + c.re;
      zIm = newIm;
      iter++;
    }
    return iter;
  }

  // Exécution Wasm complète sur toute la grille de pixels
  computeWasmPayload(
    param: cFractParams,
    width: number,
    height: number,
    calcMode: string
  ): Float32Array {
    if (!this.wasmEngine) {
      throw new Error("[cFractCalc] WasmEngine non initialisé");
    }
    // Appel direct au buffer partagé WebAssembly
    const rawPtr = this.wasmEngine.compute_frame(
      param.type,
      param.center.re,
      param.center.im,
      param.span.re,
      param.span.im,
      param.max_iter,
      param.r2_max,
      param.juliaC.re,
      param.juliaC.im,
      calcMode
    );
    const payloadLength = width * height * 5; // PAYLOAD_SIZE = 5
    return new Float32Array(this.wasmMemory.buffer, rawPtr, payloadLength);
  }
}

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
