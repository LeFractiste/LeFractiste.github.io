/** cFractEvents.ts - V0.1 - Copyright LeFractiste 2026
 * Gestionnaire d'événements
 *  Définit les événements standards de cFract- todo: AppDEv peut les activer ou non
 *  Utilise InputRouter pour les associer aux événements natifs.
 *  Pan (Glisser), Zoom (Molette & Pinch), Survol (Hoover).
 *  @todo:  la sélection de points complexes et la manipulation de poignées (InteractiveHandles).
 */
import { InputRouter } from "../app/inputRouter.js";
import { ComplexPoint, PixelPoint, IParent, FractType, PointerEventCallbacks } from "../fractTypes.js";
export declare class cFractEvents implements PointerEventCallbacks {
    private parent;
    private cFP;
    private router;
    MouseC: ComplexPoint;
    defaultCallback?: () => void;
    onHover?: (pPx: PixelPoint) => void;
    onClick?: (pPx: PixelPoint) => void;
    onZoom?: (centerPx: PixelPoint, factor: number) => void;
    onDrag?: (deltaC: PixelPoint) => void;
    onReset?: () => void;
    constructor(parent: IParent);
    initEvents(type: FractType): void;
    defaultCallback?: () => void;
    onClick(pC: ComplexPoint, pPx: PixelPoint): void;
    onZoom(centerPx: PixelPoint, factor: number): void;
    onDrag(deltaC: PixelPoint): void;
    onReset: () => void;
    onHoverBasic(pix: PixelPoint): void;
    const routerJulia: InputRouter;
    routerJulia: InputRouter;
    bindDOMEvents({ onHover:  }: {
        onHover: any;
    }): any;
}
//# sourceMappingURL=cFractEvents.d.ts.map