// app/cFractHtml.ts - Copyright LeFractiste 2026
// Exports: htmlFractContainer, htmlSetupOptions, setupFractalCanvas, parseHashParams, todo_paramstoURL

/** // Helper d'injection HTML/CSS pour cFract
 * @todo: placer les appels dans l'autre sens - mandel appelle helper-html ! */

import { ICFractParent, ComplexPoint, FractType } from "../fractTypes.js";
import { cFractParams } from "../calc/cFractParams"; //utile ?
import { cFract } from "../app/cFract.js"; //nécessaire ?

export interface htmlFractContainer {
  canvasId: string;
  type: FractType;
  statusId: string;
  containerEl: HTMLElement;
  canvasEl: HTMLCanvasElement;
  statusEl: HTMLElement;
}

export interface htmlSetupOptions {
  containerId: string;
  width?: number;
  height?: number;
  showControls?: boolean; //non implémenté?
  showStatusBar?: boolean; //true
}

/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export function setupFractalCanvas(options: htmlSetupOptions): htmlFractContainer {
  const { containerId, width = 800, height = 600, showStatusBar = true } = options;
  const ftype: FractType = (containerId as FractType) || ("MANDELBROT" as FractType);
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`[htmlHelper] Conteneur #${containerId} introuvable`);
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
  const canvasEl = container.querySelector(".cfract-canvas") as HTMLCanvasElement;
  const statusEl = container.querySelector(".cfract-status") as HTMLElement;
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
export function parseHashParams(): cFractParams {
  const hash = window.location.hash.substring(1);
  const paramsData = new URLSearchParams(hash);
  const type: string = paramsData.get("type") || "MANDELBROT"; //type
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
export function todo_paramsToURL(params: cFractParams): void {
  const data = `re:${params.center.re}, im:${params.center.im}, dia:${params.dia}`;
  // update url
}
