import { IParent, InteractiveHandle, EventRouterCallbacks, //cb events: onPan, onHoover, onZoom, onClick
IInputRouter, UserCommand, AppMode } from "../fractTypes.js";
/**
 * Routeur d'événements unifié (InputRouter) - Mouse, touch et gestures.
 * - Gère le Pan (Glisser), Zoom (Molette & Pinch), Survol (Hoover) et Clics et Touches.
 * - Gère les callbacks (cb)
 * - Anticipe @todo:  la sélection de points complexes et la manipulation de poignées (Handles).
 */
export declare class InputRouter implements IInputRouter {
    activeMode: AppMode;
    handles: InteractiveHandle[];
    canvasEl: HTMLCanvasElement;
    private parent;
    private params;
    private isDragging;
    private lastMouse;
    private touchStartDist;
    /** @todo: modifier la déclaration pour injecter les événements via mandel.onHoover */
    constructor(parent: IParent, canvasEl: HTMLCanvasElement);
    registerHandle(handle: InteractiveHandle): void;
    /** Attache les écouteurs natifs DOM au canvas (Mouse & Touch) */
    bindDOMEvents(cb: EventRouterCallbacks): void;
    dispatch(command: UserCommand): void;
    private bindMouseEvents;
    private bindTouchEvents;
    private getCanvasPx;
    private pix2cVector;
}
//# sourceMappingURL=inputRouter.d.ts.map