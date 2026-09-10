// Utilitaires associés au calcul de fractales, ou Sheets, ou...
// Fonctions déclarées static car sans instance de classe !

export class cUtils {
  // Calcul de la racine carrée d'un nombre complexe
  static complexSqrt(c) {
    const r = Math.hypot(c.re, c.im);
    const re = Math.sqrt((r + c.re) / 2);
    const im = Math.sign(c.im || 1) * Math.sqrt((r - c.re) / 2);
    return { re: re, im: im };
  }

  // Calcule les 2 points fixes pour un paramètre c donné
  static getFixedPoints(c) {
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
      { root: z2, stable: isStable2 },
    ];
  }

  // Formatte une liste de complexes {re, im} en format texte copiable.
  static complexListToString(complexList, decimals) {
    // Table format ready for copy in Excel/Google Sheets (TSV).
    const maxN = complexList.length;
    if (decimals > 15) decimals = 15;
    let tsvContent = "n\tz_re\tz_im\t|z|^2\n"; //title line
    //table scan
    for (let n = 0; n <= maxIter; n++) {
      zRe = complexList(n).re;
      zIm = complexList(n).im;
      let mod2 = zRe * zRe + zIm * zIm;
      tsvContent += `${n}\t${zRe.toFixed(decimals)}\t${zIm.toFixed(decimals)}\t${mod2.toFixed(decimals)}\n`;
    }
    return tsvContent;
  }

  // Copie dans le presse-papier
  static tryClipBoardCopy(textExpected) {
    navigator.clipboard
      .writeText(textExpected)
      .then(() => {
        console.log(`[Info] Data copied to clipbaord !`);
      })
      .catch((err) => {
        console.error("Error during clipboard copy", err);
      });
  }
} /** cUtils */
