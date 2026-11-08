/** InputRouter.ts - V1.2 - Copyright LeFractiste 2026
 * Update: 1.2: changed EventCallbacks to be agnostic (only pixels plane)
 * @todo : intégrer à cFract via cFractEvents
 * @todo 2:  la sélection de points complexes et la manipulation de poignées (InteractiveHandles).
 * @todo 3: émettre et consommer mes événements de classe (voir snippets)
 */
import { PointerEventCallbacks, // cb events: onPan, onHoover, onZoom, onClick
IPointerRouter } from "../fractTypes.js";
export declare function bindClickEvent(btnId: string, callback: () => void): void;
/** Routeur d'événements
 *  Pointeur: récupère les événements natifs (DOM) Mouse, Touch and gestures, et les attache (bind) aux callBacks (cb: eventRouterCallBack)
 *  Click (single touch), Pan (Glisser), Zoom (Molette & Pinch), Survol (Hoover). */
export declare class PointerRouter implements IPointerRouter {
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