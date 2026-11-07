/** InputRouter.ts - V1.2 - Copyright LeFractiste 2026
 * Update: 1.2: changed EventCallbacks to be agnostic (only pixels plane)
 * @todo : intégrer à cFract via cFractEvents
 *  @todo:  la sélection de points complexes et la manipulation de poignées (InteractiveHandles).
 */
import { PointerEventCallbacks, // cb events: onPan, onHoover, onZoom, onClick
IInputRouter } from "../fractTypes.js";
/** Routeur d'événements
 *  Pointeur: récupère les événements natifs (DOM) Mouse, Touch and gestures, et les attache (bind) aux callBacks (cb: eventRouterCallBack)
 *  Click (single touch), Pan (Glisser), Zoom (Molette & Pinch), Survol (Hoover). */
export declare class InputRouter implements IInputRouter {
    canvasEl: HTMLCanvasElement;
    private isDragging;
    private lastMouse;
    private touchStartDist;
    constructor(canvasEl: HTMLCanvasElement);
    /** Attache les écouteurs natifs DOM au canvas (Mouse & Touch) */
    bindDOMEvents(cb: PointerEventCallbacks, reset?: HTMLElement): void;
    private bindMouseEvents;
    private bindTouchEvents;
    private getCanvasPx;
}
//# sourceMappingURL=inputRouter.d.ts.map