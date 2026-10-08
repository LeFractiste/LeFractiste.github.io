// app/cFractHtml.ts - Copyright LeFractiste 2026

/** // Helper d'injection HTML/CSS pour cFract
 * @todo: placer les appels dans l'autre sens - mandel appelle helper-html ! */

import { ICFractParent, ComplexPoint, FractType } from "../fractTypes.js";
import { cFractParams } from "../calc/cFractParams"; //utile ?
import { cFract } from "../app/cFract.js"; //nécessaire ?

export interface FractContainer {
  canvasId: string;
  type: FractType;
  statusId: string;
  containerEl: HTMLElement;
  canvasEl: HTMLCanvasElement;
  statusEl: HTMLElement;
}

export interface FractSetupOptions {
  containerId: FractType;
  width?: number;
  height?: number;
  showControls?: boolean; //non implémenté?
  showStatusBar?: boolean; //true
}

/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export function setupFractalCanvas(options: FractSetupOptions): FractContainer {
  const { containerId, width = 800, height = 600, showStatusBar = true } = options;
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`[htmlHelper] Conteneur #${containerId} introuvable`);
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
  const canvasEl = container.querySelector(".cfract-canvas") as HTMLCanvasElement;
  const statusEl = container.querySelector(".cfract-status") as HTMLElement;
  return {
    canvasId,
    type: containerId,
    statusId,
    containerEl: container,
    canvasEl,
    statusEl
  };
}

// Lit les paramètres dans l'url, si définis - devrait renvoyer un objet Params je pense
export function parseHashParams(): cFractParams {
  const hash = window.location.hash.substring(1);
  const paramsData = new URLSearchParams(hash);
  const type: string = paramsData.get("type") || "MANDELBROT"; //type
  const params = new cFractParams(type);
  (parseFloat(paramsData.get("re") || "-0.75"), //centreRe
    parseFloat(paramsData.get("im") || "0.0"), //centreIm
    parseFloat(paramsData.get("span") || "3.0"), //spanRe
    paramsData.get("calc") || "DIRECT"); //mode
}

/** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
 * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
 */
export async function runImageServer(containerId: string) {
  // 1. Instanciation du DOM via htmlHelper
  const containerName: FractType =
    (containerId as FractType) || ("MANDELBROT" as FractType);
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
