// utils - V1.1 - Copyright LeFractiste 2026

// Utils: helpers for fractals & compplex computing.
// rev 1.1: added zMath, not tested
// rev 1.0: ts refactoring

import { ComplexPoint } from "../fractTypes.js";
// Helper functions
export class cUtils {
  // To display a ComplexPoint with digits=7 precision

  // Calcul de la racine carrée d'un nombre complexe
  static complexSqrt(c: ComplexPoint) {
    const r = Math.hypot(c.re, c.im);
    const re = Math.sqrt((r + c.re) / 2);
    const im = Math.sign(c.im || 1) * Math.sqrt((r - c.re) / 2);
    return { re: re, im: im };
  }

  // Calcule les 2 points fixes pour un paramètre c donné
  static getFixedPoints(c: ComplexPoint) {
    // Polynome: z^2 - z + c = 0 - zi = 1/2 (1 +/- sqrt_delta)
    const delta = { re: 1 - 4 * c.re, im: -4 * c.im };
    const sqrtD = this.complexSqrt(delta);
    const z1 = { re: (1 + sqrtD.re) / 2, im: sqrtD.im / 2 };
    const z2 = { re: (1 - sqrtD.re) / 2, im: -sqrtD.im / 2 };
    // Test de stabilité : |2z| < 1
    const isStable1 = Math.hypot(2 * z1.re, 2 * z1.im) < 1.0;
    const isStable2 = Math.hypot(2 * z2.re, 2 * z2.im) < 1.0;
    return [
      { root: z1, stable: isStable1 },
      { root: z2, stable: isStable2 }
    ];
  }

  // #region toString

  // Affichage complexe - //@todo 2: à passer dans utils
  static complexToString(c: ComplexPoint, digits = 7) {
    return `${c.re.toFixed(digits)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(digits)}i`;
  }

  // Formatte une liste de complexes {re, im} en format texte copiable.
  static complexListToString(complexList: ComplexPoint[], decimals: number) {
    // Table format ready for copy in Excel/Google Sheets (TSV).
    const maxN = complexList.length;
    if (decimals > 15) decimals = 15;
    let tsvContent = "n\tz_re\tz_im\t|z|^2\n"; //title line
    //table scan
    for (let n = 0; n <= maxN; n++) {
      let zRe: number = complexList[n].re;
      let zIm: number = complexList[n].im;
      let mod2 = zRe * zRe + zIm * zIm;
      tsvContent += `${n}\t${zRe.toFixed(decimals)}\t${zIm.toFixed(decimals)}\t${mod2.toFixed(decimals)}\n`;
    }
    return tsvContent;
  }

  // Copie dans le presse-papier
  static tryClipBoardCopy(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log(`[Info] Data copied to clipbaord !`);
      })
      .catch(err => {
        console.error("Error during clipboard copy", err);
      });
  }
} /** cUtils */

// #region zMath

type real = number;
interface Complex<T> {
  re: T;
  im: T;
}
// Complex calculator - In preparation of bigNumber implementation - use only in Params & event calc (not calc, iter,... yet: too slow)
class zMath implements Complex<real> {
  re: real = 0.0;
  im: real = 0.0;
  tag?: string;
  constructor(re: real = 0.0, im?: real) {
    this.re = re;
    if (im) this.im = im;
  }
  toString(digits = 7): string {
    return `${this.tag ? this.tag + "=" : ""}${this.re.toFixed(digits)} ${this.im >= 0 ? "+" : ""}${this.im.toFixed(digits)}i`;
  }
  t(tag?: string): zMath {
    this.tag = tag;
    console.log(this.toString());
    return this;
  }
  add(z1: zMath): zMath {
    this.re += z1.re;
    this.im += z1.im;
    return this;
  }
  min(z1: zMath): zMath {
    this.re -= z1.re;
    this.im -= z1.im;
    return this;
  }
  mul(z1: zMath): zMath {
    const tmp = this.re * z1.re - this.im * z1.im;
    this.im = this.re * z1.im - this.im * z1.re;
    this.re = tmp;
    return this;
  }
  div(z1: zMath): zMath {
    return this.mul(z1.inv());
  }
  plus(n: number): zMath {
    this.re += n;
    return this;
  }
  scale(n: number): zMath {
    this.re *= n;
    this.im *= n;
    return this;
  }
  sq(): zMath {
    const tmp = this.re * this.re - this.im * this.im;
    this.im = 2.0 * this.re * this.im;
    this.re = tmp;
    return this;
  }
  sqrt(): zMath {
    const r = Math.hypot(this.re, this.im);
    return this.conj().scale(1 / r);
  }
  conj(): zMath {
    this.im = -this.im;
    return this;
  }
  inv(): zMath {
    const r2 = this.norm2;
    this.re /= r2;
    this.im /= r2;
    return this;
  }
  get norm(): number {
    return Math.hypot(this.re, this.im);
  }
  get norm2(): number {
    return this.re * this.re + this.im * this.im;
  }
}

function T_zMath(): void {
  const Z = new zMath();
  Z.plus(1);
}
