// utils - Copyright LeFractiste 2026

// Utilitaires associés au calcul de fractales, ou Sheets, ou...
// Fonctions déclarées static car sans instance de classe !

import { ComplexPoint } from "../fractTypes.js";

export class cUtils {
  // To display a ComplexPoint with digits=7 precision
  complexToString(c: ComplexPoint, digits = 7): string {
    return `${c.re.toFixed(digits)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(digits)}i`;
  }

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
