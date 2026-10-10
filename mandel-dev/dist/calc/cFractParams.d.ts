/** calc/cFractParam.ts - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */
import { IParams, ComplexPoint, PixelPoint, FractType } from "../fractTypes.js";
export declare class cFractParams implements IParams {
    type: string;
    center: ComplexPoint;
    aspectRatio: number;
    dia: number;
    max_iter: number;
    r2_max: number;
    juliaC: ComplexPoint;
    angleDeg: number;
    constructor(type?: string);
    get span(): {
        re: number;
        im: number;
    };
    static newMandelbrot(): cFractParams;
    static newJulia(c: ComplexPoint): cFractParams;
    toMetadata(): string;
    /** Exporte la structure exacte attendue par les fonctions de Wasm-Rust */
    toRustArgs(width: number, height: number): {
        width: number;
        height: number;
        center_re: number;
        center_im: number;
        span_Re: number;
        span_Im: number;
        max_iter: number;
        r2_max: number;
        julia_re: number;
        julia_im: number;
    };
    /** Clonage de l'objet //not used
    clone(): cFractParams {
      const p = new cFractParams(this.type);
      p.center = this.center; //etc
      return p;
    } */
    /** @todo : gérer le recalcul automatique avec calc.callback ou param.onchange ? */
    makeDirty(): void;
    setType(type: FractType, juliaC?: null): void;
    setCenter(c: ComplexPoint): void;
    updateAspect(width: number, height: number): void;
    pix2c(point: PixelPoint, width: number, height: number): ComplexPoint;
    /** Transformation (linéaire) du plan //@todo: erreur, tester
    js-pix2c(point) {
      const cF = this.param;
      const re = cF.center.re + (point.x / this.canvas.width - 0.5) * cF.span.re;
      const im = cF.center.im - (point.y / this.canvas.height - 0.5) * cF.span.im;
      return { re: re, im: im };*/
    c2pix(c: ComplexPoint, width: number, height: number): PixelPoint;
}
//# sourceMappingURL=cFractParams.d.ts.map