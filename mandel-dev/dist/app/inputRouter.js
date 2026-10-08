/**
 * Routeur d'événements unifié (InputRouter) - Mouse, touch et gestures.
 * - Gère le Pan (Glisser), Zoom (Molette & Pinch), Survol et Clics et Touches.
 * - Anticipe @todo:  la sélection de points complexes et la manipulation de poignées (Handles).
 */
// #region InputRouter Class
export class InputRouter {
    activeMode = "PAN_ZOOM";
    handles = [];
    canvasEl;
    parent;
    isDragging = false;
    lastMouse = { x: 0, y: 0 };
    touchStartDist = 0; // Pour le Pinch-to-zoom Smartphone
    /** @todo: modifier la déclaration pour injecter les événements via mandel.onHoover */
    constructor(parent, canvasEl) {
        this.parent = parent;
        this.canvasEl = canvasEl;
    }
    /** Attache les écouteurs natifs DOM au canvas (Mouse & Touch) */
    bindDOMEvents(cb) {
        this.canvasEl.style.touchAction = "none"; // Bloque le scroll natif mobile
        this.bindMouseEvents(cb);
        this.bindTouchEvents(cb);
    }
    /** @todo: implement interfaces*/
    RegisterHandle(handle) { }
    dispatch(command) { }
    // #region Private Mouse Listeners
    // Ajout des events MOUSE - les callbacks peuvent être indéfinis !
    bindMouseEvents(cb) {
        let hasMoved;
        // MOUSE WHEEL: zoom on point
        this.canvasEl.addEventListener("wheel", e => {
            e.preventDefault();
            const pt = this.getCanvasPx(e.clientX, e.clientY);
            const factor = e.deltaY < 0 ? 0.82 : 1.22;
            if (cb.onZoom)
                cb.onZoom(pt, factor);
        });
        // MOUSE DOWN: isdragging from lastMouse
        this.canvasEl.addEventListener("mousedown", e => {
            if (e.button !== 0)
                return;
            this.isDragging = true;
            hasMoved = false;
            this.lastMouse = this.getCanvasPx(e.clientX, e.clientY);
        });
        // MOUSE MOVE: onHoover(pix2c) OU isDragging: onPan(deltaC)
        window.addEventListener("mousemove", e => {
            const pt = this.getCanvasPx(e.clientX, e.clientY);
            const inBounds = pt.x >= 0 &&
                pt.x <= this.canvasEl.width &&
                pt.y >= 0 &&
                pt.y <= this.canvasEl.height;
            if (!inBounds) {
                this.isDragging = false;
                return;
            } //sortie écran
            if (cb.onHover && !this.isDragging)
                cb.onHover(this.parent.pix2c(pt), pt);
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouse.x;
                const dy = e.clientY - this.lastMouse.y;
                if (Math.hypot(dx, dy) > 3)
                    hasMoved = true;
                this.lastMouse = { x: e.clientX, y: e.clientY };
                if (cb.onPan)
                    cb.onPan(this.calculateDeltaC(dx, dy));
            }
        });
        // MOUSE UP: envoie onClick(c) et clôture isDragging
        window.addEventListener("mouseup", e => {
            if (this.isDragging && cb.onClick && !hasMoved) {
                const pC = this.parent.pix2c(this.lastMouse);
                cb.onClick(pC, this.lastMouse);
            }
            this.isDragging = false;
        });
    }
    // #endregion
    // #region Private Touch Listeners (Smartphone)
    // Ajout des events TOUCH - les callbacks peuvent être indéfinis !
    bindTouchEvents(cb) {
        let hasMoved;
        // TOUCHSTART: initie isDragging, lastMove et touchStartThis
        this.canvasEl.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                hasMoved = false;
                this.lastMouse = this.getCanvasPx(e.touches[0].clientX, e.touches[0].clientY);
            }
            else if (e.touches.length === 2) {
                this.isDragging = false;
                this.touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            }
        });
        // TOUCHMOVE: onPan du déplacement (un doigt) ou onZoom autour du centre (2 doigts)
        this.canvasEl.addEventListener("touchmove", e => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isDragging && cb.onPan) {
                hasMoved = true;
                const touch = e.touches[0];
                const dx = touch.clientX - this.lastMouse.x;
                const dy = touch.clientY - this.lastMouse.y;
                this.lastMouse = { x: touch.clientX, y: touch.clientY };
                cb.onPan(this.calculateDeltaC(dx, dy));
            }
            else if (e.touches.length === 2 && cb.onZoom) {
                const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                if (this.touchStartDist > 0) {
                    const factor = this.touchStartDist / dist;
                    const centerPx = this.getCanvasPx((e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
                    cb.onZoom(centerPx, factor);
                    this.touchStartDist = dist;
                }
            }
        });
        // TOUCHEND: fin move ou onClick
        this.canvasEl.addEventListener("touchend", () => {
            if (this.isDragging && !hasMoved && cb.onClick) {
                cb.onClick(this.parent.pix2c(this.lastMouse), this.lastMouse);
            }
            this.isDragging = false;
            this.touchStartDist = 0;
        });
    }
    // #endregion
    // #region helpers
    getCanvasPx(clientX, clientY) {
        const rect = this.canvasEl.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    }
    calculateDeltaC(dxPx, dyPx) {
        const p0 = this.parent.pix2c({ x: 0, y: 0 });
        const p1 = this.parent.pix2c({ x: dxPx, y: dyPx });
        return { re: p0.re - p1.re, im: p0.im - p1.im };
    }
}
// #endregion
//# sourceMappingURL=inputRouter.js.map