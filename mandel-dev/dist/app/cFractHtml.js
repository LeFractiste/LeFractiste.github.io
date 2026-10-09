// app/cFractHtml.ts - Copyright LeFractiste 2026
// Exports: htmlFractContainer, htmlSetupOptions, setupFractalCanvas, parseHashParams, todo_paramstoURL
import { cFractParams } from "../calc/cFractParams"; //utile ?
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
    return {
        canvasId,
        type: ftype,
        statusId,
        containerEl: container,
        canvasEl,
        statusEl
    };
}
// Lit les paramètres dans l'url, si définis - devrait renvoyer un objet Params je pense
export function parseHashParams() {
    const hash = window.location.hash.substring(1);
    const paramsData = new URLSearchParams(hash);
    const type = paramsData.get("type") || "MANDELBROT"; //type
    const params = new cFractParams(type);
    params.center = {
        re: parseFloat(paramsData.get("re") || "-0.75"), //centreRe
        im: parseFloat(paramsData.get("im") || "0.0") //centreIm
    };
    params.dia = parseFloat(paramsData.get("dia") || "3.0"); //spanRe
    //error: params.setCalcMode(paramsData.get("calc") || "DIRECT");      //mode
    return params;
}
// todo 2: Updates URL with (some) params
export function todo_paramsToURL(params) {
    const data = `re:${params.center.re}, im:${params.center.im}, dia:${params.dia}`;
    // update url
}
//# sourceMappingURL=cFractHtml.js.map