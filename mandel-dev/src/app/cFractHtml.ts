// app/cFractHtml.ts - Copyright LeFractiste 2026
// Exports: htmlFractContainer, htmlSetupOptions, setupFractalCanvas, parseHashParams, todo_paramstoURL

/** // Helpers d'injection HTML/CSS pour cFract
 * The main HTML class is .fract-card holding other elements.
 * fract-card id="type" -  type as FractType, unique !  (limitation if I want to "activate" more than one image)
 * @todo 1: implement data to url
 * @todo 1: link cFractCard to code (change HTML /!\ so far, no access to modified DOM ?)
 * @todo 2: implement read url and create card (objective: image server)
 * @todo 3: implement read image meta data and create card (objective: make an image active) - todo: cImage.saveAsImage
 * @todo 3: allow JuliaSet for url ? */

import { FractType, IParams } from "../fractTypes.js";
//import { cFractParams } from "../calc/cFractParams"; //utile ?

// IHTMLFractCard: links to HTML container
export interface IFractCardIds {
  cardId: string; // must be Fracttype
  canvasId: string;
  statusId: string;
  resetId: string;
}

// Contains HTML objects of interaction
export interface IFractCard {
  // todo: move to fractTypes
  isOk: boolean;
  type: FractType;
  cardEl: HTMLElement;
  canvasEl: HTMLCanvasElement;
  resetEl: HTMLElement;
  statusEl: HTMLElement;
}
// Returns pointeurs to the CSS-HTML .cFract-card class
class cFractCard implements IFractCard {
  isOk: boolean = false;
  type!: FractType; // ! to shut-up the compiler: a block try can fail to set a value
  cardEl!: HTMLElement;
  canvasEl!: HTMLCanvasElement;
  statusEl!: HTMLElement;
  resetEl!: HTMLElement;
  constructor(cardIds: IFractCardIds) {
    const cardId = cardIds.cardId;
    try {
      const card = document.getElementById(cardId);
      if (!card) throw new Error(`Element #${cardId} not found`);
      const fType: string = card.dataset.type!.toUpperCase();
      this.type = (fType as FractType) || "MANDELBROT";
      this.cardEl = card;
      this.canvasEl = card.querySelector(".cfract-canvas") as HTMLCanvasElement;
      this.statusEl = card.querySelector(".cfract-status") as HTMLElement;
      this.resetEl = card.querySelector(".cfract-reset") as HTMLElement;
      // Vérification globale que tous les enfants existent bien
      if (!this.canvasEl || !this.statusEl || !this.resetEl) {
        throw new Error(`Missing elements in #${cardId}`);
      }
      this.isOk = true;
    } catch (e: any) {
      console.error(`[cFractCard(${cardId}) Erreur]`, e.message);
    }
  }
}
// IHTMLSetupOptions: contents of HTML container
export interface IHTMLSetupOptions {
  containerId: string;
  width?: number;
  height?: number;
  showControls?: boolean; //non implémenté?
  showStatusBar?: boolean; //true
}
// IHTMLSearchOptions: data for URL (Mandelbrot only)
export type HTMLSearchOptions = {
  typeName: string; //Mandelbrot!
  re: number;
  im: number;
  dia: number;
  //pal?: string; //à faire: nom de palette
};

// Prepares the list of Ids for cFractCard and builds HTML code
class cFractCardIds implements IFractCardIds {
  cardId: string;
  type: FractType;
  canvasId: string;
  statusId: string;
  resetId: string;
  constructor(cardId: string) {
    this.cardId = cardId;
    this.type = (cardId.toUpperCase() as FractType) || "MANDELBROT";
    this.canvasId = `${cardId}-canvas`;
    this.statusId = `${cardId}-statusBar`;
    this.resetId = `${cardId}-resetBtn`;
  }
  buildHTMLcode(options: IHTMLSetupOptions): string {
    const { width = 800, height = 600, showStatusBar = true } = options;
    return `
    <div class="cfract-card" id="${this.cardId}" data-type=${this.type as string}>
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
export function setupFractalCanvas(options: IHTMLSetupOptions): IFractCard {
  const { containerId, width = 800, height = 600, showStatusBar = true } = options;
  const ftype: FractType = (containerId as FractType) || "MANDELBROT";
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`[htmlHelper] Conteneur #${containerId} introuvable`);
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
  const canvasEl = container.querySelector(".cfract-canvas") as HTMLCanvasElement;
  const statusEl = container.querySelector(".cfract-status") as HTMLElement;
  const resetEl = container.querySelector(".cfract-reset") as HTMLElement;
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
export function updateParamsFromURL(params: IParams) {
  const hash = window.location.hash.substring(1);
  const paramsData = new URLSearchParams(hash);
  if (params.isJulia) return; //excluded so far
  // params.typeName: paramsData.get("type") || "MANDELBROT"; //type
  const re: number = parseFloat(paramsData.get("re") || "-0.75") as number; //centreRe
  const im: number = parseFloat(paramsData.get("im") || "0.0") as number; //centreIm
  const dia: number = parseFloat(paramsData.get("dia") || "2.25") as number; //dia
  //error: params.setCalcMode(paramsData.get("calc") || "DIRECT");      //mode
  params.center = { re: re, im: im };
  params.dia = dia;
  params.dirty = true;
}

// todo 2: Updates URL with (some) params
export function updateURLfromParams(params: IParams): void {
  const data = `re=${params.center.re},im=${params.center.im},dia=${params.dia}`;
  // update url
}
