/** calc/cFractParam.ts - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul
 *
 * @todo  mandel utilise html-helper pour faire url<-->params
 * @todo  aménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
 * @todo: Eliminer MaxIter ? Le calculer pour la bonne résolution DEM
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