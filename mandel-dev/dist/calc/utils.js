// utils - V1.1 - Copyright LeFractiste 2026
// Helper functions
export class cUtils {
    // To display a ComplexPoint with digits=7 precision
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
            { root: z2, stable: isStable2 }
        ];
    }
    // #region toString
    // Affichage complexe - //@todo 2: à passer dans utils
    static complexToString(c, digits = 7) {
        return `${c.re.toFixed(digits)} ${c.im >= 0 ? "+" : ""}${c.im.toFixed(digits)}i`;
    }
    // Formatte une liste de complexes {re, im} en format texte copiable.
    static complexListToString(complexList, decimals) {
        // Table format ready for copy in Excel/Google Sheets (TSV).
        const maxN = complexList.length;
        if (decimals > 15)
            decimals = 15;
        let tsvContent = "n\tz_re\tz_im\t|z|^2\n"; //title line
        //table scan
        for (let n = 0; n <= maxN; n++) {
            let zRe = complexList[n].re;
            let zIm = complexList[n].im;
            let mod2 = zRe * zRe + zIm * zIm;
            tsvContent += `${n}\t${zRe.toFixed(decimals)}\t${zIm.toFixed(decimals)}\t${mod2.toFixed(decimals)}\n`;
        }
        return tsvContent;
    }
    // Copie dans le presse-papier
    static tryClipBoardCopy(text) {
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
// Complex calculator - In preparation of bigNumber implementation - use only in Params & event calc (not calc, iter,... yet: too slow)
class zMath {
    re = 0.0;
    im = 0.0;
    tag;
    constructor(re = 0.0, im) {
        this.re = re;
        if (im)
            this.im = im;
    }
    toString(digits = 7) {
        return `${this.tag ? this.tag + "=" : ""}${this.re.toFixed(digits)} ${this.im >= 0 ? "+" : ""}${this.im.toFixed(digits)}i`;
    }
    t(tag) {
        this.tag = tag;
        console.log(this.toString());
        return this;
    }
    add(z1) {
        this.re += z1.re;
        this.im += z1.im;
        return this;
    }
    min(z1) {
        this.re -= z1.re;
        this.im -= z1.im;
        return this;
    }
    mul(z1) {
        const tmp = this.re * z1.re - this.im * z1.im;
        this.im = this.re * z1.im - this.im * z1.re;
        this.re = tmp;
        return this;
    }
    div(z1) {
        return this.mul(z1.inv());
    }
    plus(n) {
        this.re += n;
        return this;
    }
    scale(n) {
        this.re *= n;
        this.im *= n;
        return this;
    }
    sq() {
        const tmp = this.re * this.re - this.im * this.im;
        this.im = 2.0 * this.re * this.im;
        this.re = tmp;
        return this;
    }
    sqrt() {
        const r = Math.hypot(this.re, this.im);
        return this.conj().scale(1 / r);
    }
    conj() {
        this.im = -this.im;
        return this;
    }
    inv() {
        const r2 = this.norm2;
        this.re /= r2;
        this.im /= r2;
        return this;
    }
    get norm() {
        return Math.hypot(this.re, this.im);
    }
    get norm2() {
        return this.re * this.re + this.im * this.im;
    }
}
function T_zMath() {
    const Z = new zMath();
    Z.plus(1);
}
//# sourceMappingURL=utils.js.map