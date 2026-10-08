// src/app/html-helper.ts - Copyright LeFractiste 2026
import { cFract } from "./mandel.js"; //nécessaire ?
/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export function setupFractalCanvas(options) {
    const { containerId, width = 800, height = 600, showStatusBar = true } = options;
    const container = document.getElementById(containerId);
    if (!container)
        throw new Error(`[htmlHelper] Conteneur #${containerId} introuvable`);
    // Nettoyage et injection de la structure HTML
    const canvasId = `${containerId}-canvas`;
    const statusId = `${containerId}-statusBar`;
    const type = containerId; //TODO : gérer via params !
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
        type: containerId,
        statusId,
        containerEl: container,
        canvasEl,
        statusEl
    };
}
() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return {
        type: params.get("type") || "MANDELBROT",
        re: parseFloat(params.get("re") || "-0.75"),
        im: parseFloat(params.get("im") || "0.0"),
        span: parseFloat(params.get("span") || "3.0"),
        mode: params.get("calc") || "DIRECT"
    };
};
/** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
 * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
 */
export async function runImageServer(containerId) {
    // 1. Instanciation du DOM via htmlHelper
    const containerName = containerId || "MANDELBROT";
    const FC = setupFractalCanvas(containerName, 800, 600); //fractContainer
    // 2. Initialisation du moteur cFract
    const engine = new cFract(FC.canvasId, FC.type, FC.statusId);
    await engine.init();
    // 3. Application des paramètres d'URL
    const cfg = parseHashParams();
    engine.setType(cfg.type);
    engine.setCenter({ re: cfg.re, im: cfg.im });
    engine.param.span.re = cfg.span; //contourne l'interface setSpan qui n'existe pas encore !
    engine.updateAspect();
    engine.setCalcMode(cfg.mode);
    // 4. Calcul et rendu initial
    engine.makeDirty();
}
//# sourceMappingURL=html-helper.js.map