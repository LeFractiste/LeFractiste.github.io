/** calc/cFractParam.ts - V0.4 - Copyright LeFractiste 2026
 *  Classe de metadonnées pour le calcul : seule source de donnée pour le calcul !  (il manque des paramètres encore)
 */
import { IParams, ComplexPoint, PixelPoint, IParent, FractType } from "../fractTypes.js";
export declare class cFractParams implements IParams {
    private parent;
    center: ComplexPoint;
    dirty: boolean;
    type: FractType;
    size: PixelPoint;
    aspectRatio: number;
    dia: number;
    iterMax: number;
    r2Max: number;
    juliaC: ComplexPoint;
    angleDeg: number;
    constructor(typeName: string, parent: IParent);
    /**  */
    toMetadata(): string;
    /** Clonage de l'objet //not used
    clone(): cFractParams {
      const p = new cFractParams(this.type);
      p.center = this.center; //etc
      return p;
    } */
    get typeName(): string;
    setDirty(value: boolean): void;
    get isJulia(): boolean;
    setJuliaC(juliaC: ComplexPoint): void;
    setSize(size: PixelPoint): void;
    get span(): ComplexPoint;
    setCenter(c: ComplexPoint): void;
    setVector(dia: number, angleDeg?: number): void;
    pix2c(point: PixelPoint): ComplexPoint;
    c2pix(c: ComplexPoint): PixelPoint;
    onDrag(deltaPx: PixelPoint): void;
    onClick(pix: PixelPoint): void;
    onZoom_centered(zoomFactor: number): void;
    onZoom(pix: PixelPoint, zoomFactor: number): void;
    onReset(): void;
    spyPixelMemory(): void;
} /** */
//# sourceMappingURL=cFractParams.d.ts.map