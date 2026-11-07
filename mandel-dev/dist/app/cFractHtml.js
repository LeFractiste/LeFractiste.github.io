// app/cFractHtml.ts - Copyright LeFractiste 2026
// Exports: htmlFractContainer, htmlSetupOptions, setupFractalCanvas, parseHashParams, todo_paramstoURL
// Returns pointeurs to the CSS-HTML .cFract-card class
class cFractCard {
    isOk = false;
    type; // ! to shut-up the compiler: a block try can fail to set a value
    cardEl;
    canvasEl;
    statusEl;
    resetEl;
    constructor(cardIds) {
        const cardId = cardIds.cardId;
        try {
            const card = document.getElementById(cardId);
            if (!card)
                throw new Error(`Element #${cardId} not found`);
            const fType = card.dataset.type.toUpperCase();
            this.type = fType || "MANDELBROT";
            this.cardEl = card;
            this.canvasEl = card.querySelector(".cfract-canvas");
            this.statusEl = card.querySelector(".cfract-status");
            this.resetEl = card.querySelector(".cfract-reset");
            // Vérification globale que tous les enfants existent bien
            if (!this.canvasEl || !this.statusEl || !this.resetEl) {
                throw new Error(`Missing elements in #${cardId}`);
            }
            this.isOk = true;
        }
        catch (e) {
            console.error(`[cFractCard(${cardId}) Erreur]`, e.message);
        }
    }
}
// Prepares the list of Ids for cFractCard and builds HTML code
class cFractCardIds {
    cardId;
    type;
    canvasId;
    statusId;
    resetId;
    constructor(cardId) {
        this.cardId = cardId;
        this.type = cardId.toUpperCase() || "MANDELBROT";
        this.canvasId = `${cardId}-canvas`;
        this.statusId = `${cardId}-statusBar`;
        this.resetId = `${cardId}-resetBtn`;
    }
    buildHTMLcode(options) {
        const { width = 800, height = 600, showStatusBar = true } = options;
        return `
    <div class="cfract-card" id="${this.cardId}" data-type=${this.type}>
      <h4>
        <span>Plan de Mandelbrot</span>
         <button id="${this.resetId}" style="font-size: 11px">Reset Zoom</button>
      </h4>
      <div class="cfract-canvas-wrapper">
        <canvas class="cfract-canvas" id="${this.canvasId}" width="${width}" height="${height}"></canvas>
      </div>
      ${showStatusBar ? `<div class="cfract-status" id="${this.statusId}">Initialisation...</div>` : ""}
    </div>
  `;
    }
}
/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export function setupFractalCanvas(options) {
    const { containerId, width = 800, height = 600, showStatusBar = true } = options;
    const ftype = containerId || "MANDELBROT";
    const container = document.getElementById(containerId);
    if (!container)
        throw new Error(`[htmlHelper] Conteneur #${containerId} introuvable`);
    // Nettoyage et injection de la structure HTML
    const canvasId = `${containerId}-canvas`;
    const statusId = `${containerId}-statusBar`;
    // todo: verifier qui contient quoi + impact de la modification si cFract existe !
    container.innerHTML = `
    <div class="cfract-card">
      <div class="cfract-canvas-wrapper">
        <canvas class="cfract-canvas" id="${canvasId}" width="${width}" height="${height}"></canvas>
      </div>
      ${showStatusBar ? `<div class="cfract-status" id="${statusId}">Initialisation...</div>` : ""}
    </div>
  `;
    // Test et préparation de la prochaine interface
    const canvasEl = container.querySelector(".cfract-canvas");
    const statusEl = container.querySelector(".cfract-status");
    const resetEl = container.querySelector(".cfract-reset");
    const isOk = !(!canvasEl || !statusEl || !resetEl);
    return {
        isOk: isOk,
        type: ftype,
        cardEl: container,
        canvasEl: canvasEl,
        statusEl: statusEl,
        resetEl: resetEl
    };
}
// Lit les paramètres dans l'url, et modifie params (en direct)
export function updateParamsFromURL(params) {
    const hash = window.location.hash.substring(1);
    const paramsData = new URLSearchParams(hash);
    if (params.isJulia)
        return; //excluded so far
    // params.typeName: paramsData.get("type") || "MANDELBROT"; //type
    const re = parseFloat(paramsData.get("re") || "-0.75"); //centreRe
    const im = parseFloat(paramsData.get("im") || "0.0"); //centreIm
    const dia = parseFloat(paramsData.get("dia") || "2.25"); //dia
    //error: params.setCalcMode(paramsData.get("calc") || "DIRECT");      //mode
    params.center = { re: re, im: im };
    params.dia = dia;
    params.dirty = true;
}
// todo 2: Updates URL with (some) params
export function updateURLfromParams(params) {
    const data = `re=${params.center.re},im=${params.center.im},dia=${params.dia}`;
    // update url
}
//# sourceMappingURL=cFractHtml.js.map