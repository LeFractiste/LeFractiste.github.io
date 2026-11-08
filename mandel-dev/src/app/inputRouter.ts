/** InputRouter.ts - V1.2 - Copyright LeFractiste 2026
 * Update: 1.2: changed EventCallbacks to be agnostic (only pixels plane)
 * @todo : intégrer à cFract via cFractEvents
 * @todo 2:  la sélection de points complexes et la manipulation de poignées (InteractiveHandles).
 * @todo 3: émettre et consommer mes événements de classe (voir snippets)
 */

// #region Imports
import {
  PixelPoint,
  InteractiveHandle,
  PointerEventCallbacks, // cb events: onPan, onHoover, onZoom, onClick
  IPointerRouter, // Interface
  UserCommand,
  AppMode
} from "../fractTypes.js";

// Simple function binder to HTML Id
export function bindClickEvent(btnId: string, callback: () => void) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener("click", callback);
  } else {
    throw new Error("Can't find element ${btnId}");
  }
}

// #region InputRouter Class

/** Routeur d'événements
 *  Pointeur: récupère les événements natifs (DOM) Mouse, Touch and gestures, et les attache (bind) aux callBacks (cb: eventRouterCallBack)
 *  Click (single touch), Pan (Glisser), Zoom (Molette & Pinch), Survol (Hoover). */
export class PointerRouter implements IPointerRouter {
  public canvasEl: HTMLCanvasElement; //node.js
  private isDragging = false;
  private lastMouse: PixelPoint = { x: 0, y: 0 };
  private touchStartDist = 0; // Pour le Pinch-to-zoom Smartphone
  constructor(canvasEl: HTMLCanvasElement) {
    this.canvasEl = canvasEl;
  }

  /** Attache les écouteurs natifs DOM au canvas (Mouse & Touch) */
  public bindDOMEvents(cb: PointerEventCallbacks, reset?: HTMLElement): void {
    this.canvasEl.style.touchAction = "none"; // Bloque le scroll natif mobile
    // pointeur events
    this.bindMouseEvents(cb);
    this.bindTouchEvents(cb);
    // reset button
    if (cb.onReset && reset) {
      reset.addEventListener("click", e => {
        if (cb.onReset) cb.onReset();
      });
    }
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
    // MOUSE DOWN: isdragging from lastMouse - strictly on canvas
    this.canvasEl.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      this.isDragging = true;
      hasMoved = false;
      this.lastMouse = this.getCanvasPx(e.clientX, e.clientY);
    });
    // MOUSE MOVE: onHoover(pix2c) OU isDragging: onPan(deltaC) - window: all cFract get it !
    window.addEventListener("mousemove", e => {
      const pt = this.getCanvasPx(e.clientX, e.clientY);
      // debug !
      console.log(e.clientX, e.clientY, pt.x, pt.y);
      // teste la sortie de canvas ou pour ignorer l'autre cFract
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
        const dx = pt.x - this.lastMouse.x;
        const dy = pt.y - this.lastMouse.y;
        if (Math.hypot(dx, dy) > 3) hasMoved = true;
        this.lastMouse = pt;
        if (cb.onDrag) cb.onDrag({ x: dx, y: dy }); // axe y inversé dans onDrag
      }
    });
    // MOUSE UP: envoie onClick(c) et clôture isDragging - window: all cFract get it !
    window.addEventListener("mouseup", e => {
      if (!this.isDragging) return; //ignore les autres cartes!
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
        this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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
          const factor = dist / this.touchStartDist; // inversé = intuitif
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
