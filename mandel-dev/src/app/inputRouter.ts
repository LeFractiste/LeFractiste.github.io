/** InputRouter.ts - V1.2 - Copyright LeFractiste 2026
 * Update: 1.2: changed EventCallbacks to be agnostic (only pixels plane)
 * @todo : intégrer à cFract via cFractEvents
 *  @todo:  la sélection de points complexes et la manipulation de poignées (InteractiveHandles).
 */

// #region Imports
import {
  PixelPoint,
  InteractiveHandle,
  PointerEventCallbacks, // cb events: onPan, onHoover, onZoom, onClick
  IInputRouter, // Interface
  UserCommand,
  AppMode
} from "../fractTypes.js";

// #region InputRouter Class

/** Routeur d'événements
 *  Pointeur: récupère les événements natifs (DOM) Mouse, Touch and gestures, et les attache (bind) aux callBacks (cb: eventRouterCallBack)
 *  Click (single touch), Pan (Glisser), Zoom (Molette & Pinch), Survol (Hoover). */
export class InputRouter implements IInputRouter {
  public canvasEl: HTMLCanvasElement; //node.js
  private isDragging = false;
  private lastMouse: PixelPoint = { x: 0, y: 0 };
  private touchStartDist = 0; // Pour le Pinch-to-zoom Smartphone
  constructor(canvasEl: HTMLCanvasElement) {
    this.canvasEl = canvasEl;
  }

  /** Attache les écouteurs natifs DOM au canvas (Mouse & Touch) */
  public bindDOMEvents(cb: PointerEventCallbacks): void {
    this.canvasEl.style.touchAction = "none"; // Bloque le scroll natif mobile
    this.bindMouseEvents(cb);
    this.bindTouchEvents(cb);
  }

  // #region Mouse Listeners
  // Ajout des events MOUSE - les callbacks peuvent être indéfinis !
  private bindMouseEvents(cb: PointerEventCallbacks): void {
    let hasMoved: boolean;

    // MOUSE WHEEL: zoom on point
    this.canvasEl.addEventListener("wheel", e => {
      e.preventDefault();
      const pt = this.getCanvasPx(e.clientX, e.clientY);
      const factor = e.deltaY < 0 ? 0.82 : 1.22;
      if (cb.onZoom) cb.onZoom(pt, factor);
    });
    // MOUSE DOWN: isdragging from lastMouse
    this.canvasEl.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      this.isDragging = true;
      hasMoved = false;
      this.lastMouse = this.getCanvasPx(e.clientX, e.clientY);
    });
    // MOUSE MOVE: onHoover(pix2c) OU isDragging: onPan(deltaC)
    window.addEventListener("mousemove", e => {
      const pt = this.getCanvasPx(e.clientX, e.clientY);
      // teste la sortie de canvas
      const inBounds =
        pt.x >= 0 &&
        pt.x <= this.canvasEl.width &&
        pt.y >= 0 &&
        pt.y <= this.canvasEl.height;
      if (!inBounds) {
        this.isDragging = false;
        return;
      }
      if (cb.onHover && !this.isDragging) cb.onHover(pt);
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        if (Math.hypot(dx, dy) > 3) hasMoved = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        if (cb.onDrag) cb.onDrag({ x: dx, y: dy });
      }
    });
    // MOUSE UP: envoie onClick(c) et clôture isDragging
    window.addEventListener("mouseup", e => {
      if (this.isDragging && cb.onClick && !hasMoved) {
        cb.onClick(this.lastMouse);
      }
      this.isDragging = false;
    });
  } /*class InputRouter */
  // #endregion

  // #region Touch Listeners

  // Ajout des events TOUCH Smartphone - les callbacks peuvent être indéfinis !
  private bindTouchEvents(cb: PointerEventCallbacks): void {
    let hasMoved: boolean;
    // TOUCHSTART: initie isDragging, lastMove et touchStartThis
    this.canvasEl.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        hasMoved = false;
        this.lastMouse = this.getCanvasPx(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        this.touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });
    // TOUCHMOVE: onPan du déplacement (un doigt) ou onZoom autour du centre (2 doigts)
    this.canvasEl.addEventListener("touchmove", e => {
      e.preventDefault();
      if (e.touches.length === 1 && this.isDragging && cb.onDrag) {
        // single touch
        hasMoved = true;
        const touch = e.touches[0];
        const dx = touch.clientX - this.lastMouse.x;
        const dy = touch.clientY - this.lastMouse.y;
        this.lastMouse = { x: touch.clientX, y: touch.clientY };
        cb.onDrag({ x: dx, y: dy });
      } else if (e.touches.length === 2 && cb.onZoom) {
        // dual touch  - zoom  (or todo: implement rotation)
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (this.touchStartDist > 0) {
          const factor = this.touchStartDist / dist;
          const centerPx = this.getCanvasPx(
            (e.touches[0].clientX + e.touches[1].clientX) / 2,
            (e.touches[0].clientY + e.touches[1].clientY) / 2
          );
          cb.onZoom(centerPx, factor);
          this.touchStartDist = dist;
        }
      }
    });
    // TOUCHEND: fin move ou onClick
    this.canvasEl.addEventListener("touchend", () => {
      if (this.isDragging && !hasMoved && cb.onClick) {
        cb.onClick(this.lastMouse);
      }
      this.isDragging = false;
      this.touchStartDist = 0;
    });
  }
  // #endregion

  // #region helpers
  // Read pixel, for window-level events
  private getCanvasPx(clientX: number, clientY: number): PixelPoint {
    const rect = this.canvasEl.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
}

// #endregion
