/** cFractEvents.ts - V0.1 - Copyright LeFractiste 2026
 * Gestionnaire d'événements
 *  Définit les événements standards de cFract- todo: AppDEv peut les activer ou non
 *  Utilise InputRouter pour les associer aux événements natifs.
 *  Pan (Glisser), Zoom (Molette & Pinch), Survol (Hoover).
 *  @todo:  la sélection de points complexes et la manipulation de poignées (InteractiveHandles).
 */
// #region Imports
import { InputRouter } from "../app/inputRouter.js";
// Gère les événements désactivables - à initialiser
export class cFractEvents {
    parent;
    cFP;
    router;
    MouseC;
    defaultCallback;
    onHover;
    onClick;
    onZoom;
    onDrag;
    onReset;
    constructor(parent) {
        this.parent = parent;
        this.cFP = parent.params;
        const init = undefined;
        this.onHover = init;
        this.onClick = init;
        this.onZoom = init;
        this.onDrag = init;
        this.router = new InputRouter(parent.canvas);
    }
    initEvents(type) {
    }
    defaultCallback;
    onReset;
    onHoverBasic(pix) {
        this.MouseC = this.cFP.pix2c(pix);
        onHover: (px) => {
            updateStatusBar("Mandel:", mouseC, px.x, px.y);
            mandel.cDeep = mouseC;
        },
            onClick;
        (targetC, px) => {
            lockedC = targetC;
            updateStatusBar("Locked:", lockedC, px.x, px.y);
            julia.params.juliaC = lockedC;
        },
            onZoom;
        (centerPx, factor) => mandel.params.zoom(centerPx, factor),
            onPan;
        deltaC => (mandel.params.center = deltaC);
    }
    ;
    routerJulia = new InputRouter(julia, julia.canvas);
    routerJulia;
    bindDOMEvents({ onHover:  }) { }
}
(mouseC, px) => {
    updateStatusBar("Julia:", mouseC, px.x, px.y);
},
    onClick;
undefined,
    onZoom;
(centerPx, factor) => julia.params.zoom(centerPx, factor),
    onPan;
deltaC => (julia.params.center = deltaC);
;
// #endregion
//# sourceMappingURL=cFractEvents.js.map