/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */
import { IParams, ComplexPoint, PixelPoint, IParent } from "../fractTypes.js";
export declare class cFractParams implements IParams {
    private parent;
    typeName: string;
    size: PixelPoint;
    private _center;
    aspectRatio: number;
    dia: number;
    max_iter: number;
    r2_max: number;
    juliaC: ComplexPoint;
    angleDeg: number;
    private _dirty;
    /** Reads dirty
     * @todo: useful ?)
     */
    get dirty(): boolean;
    set dirty(value: boolean);
    constructor(typeName: string | undefined, parent: IParent);
    toMetadata(): string;
    /** Clonage de l'objet //not used
    clone(): cFractParams {
      const p = new cFractParams(this.type);
      p.center = this.center; //etc
      return p;
    } */
    /** @todo : gérer le recalcul automatique avec calc.callback ou param.onchange ? */
    setJuliaC(juliaC: ComplexPoint): void;
    get span(): ComplexPoint;
    get center(): ComplexPoint;
    set center(c: ComplexPoint);
    setVector(dia: number, angleDeg?: number): void;
    initSize(size: PixelPoint): void;
    pix2c(point: PixelPoint): ComplexPoint;
    c2pix(c: ComplexPoint): PixelPoint;
    zoom(pix: PixelPoint, zoomFactor: number): void;
    reset(): void;
    displayState(action: string, c?: ComplexPoint, pix?: PixelPoint): void;
} /** */
//# sourceMappingURL=cFractParams.d.ts.map