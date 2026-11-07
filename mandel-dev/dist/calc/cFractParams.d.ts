/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */
import { IParams, ComplexPoint, PixelPoint, IParent, FractType } from "../fractTypes.js";
export declare class cFractParams implements IParams {
    private parent;
    private _center;
    private _dirty;
    type: FractType;
    size: PixelPoint;
    aspectRatio: number;
    dia: number;
    iterMax: number;
    r2Max: number;
    juliaC: ComplexPoint;
    angleDeg: number;
    get typeName(): string;
    get isJulia(): boolean;
    constructor(typeName: string, parent: IParent);
    /**  */
    toMetadata(): string;
    /** Clonage de l'objet //not used
    clone(): cFractParams {
      const p = new cFractParams(this.type);
      p.center = this.center; //etc
      return p;
    } */
    /** Reads dirty */
    get dirty(): boolean;
    set dirty(value: boolean);
    setJuliaC(juliaC: ComplexPoint): void;
    initSize(size: PixelPoint): void;
    get span(): ComplexPoint;
    get center(): ComplexPoint;
    set center(c: ComplexPoint);
    setVector(dia: number, angleDeg?: number): void;
    pix2c(point: PixelPoint): ComplexPoint;
    c2pix(c: ComplexPoint): PixelPoint;
    onDrag(deltaPx: PixelPoint): void;
    zoom_centered(pix: PixelPoint, zoomFactor: number): void;
    onZoom(pix: PixelPoint, zoomFactor: number): void;
    onReset(): void;
    spyPixelMemory(): void;
} /** */
//# sourceMappingURL=cFractParams.d.ts.map