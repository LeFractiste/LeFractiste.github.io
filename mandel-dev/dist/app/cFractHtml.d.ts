/** // Helpers d'injection HTML/CSS pour cFract
 * The main HTML class is .fract-card holding other elements.
 * fract-card id="type" -  type as FractType, unique !  (limitation if I want to "activate" more than one image)
 * @todo 1: implement data to url
 * @todo 1: link cFractCard to code (change HTML /!\ so far, no access to modified DOM ?)
 * @todo 2: implement read url and create card (objective: image server)
 * @todo 3: implement read image meta data and create card (objective: make an image active) - todo: cImage.saveAsImage
 * @todo 3: allow JuliaSet for url ? */
import { FractType, IParams } from "../fractTypes.js";
export interface IFractCardIds {
    cardId: string;
    canvasId: string;
    statusId: string;
    resetId: string;
}
export interface IFractCard {
    isOk: boolean;
    type: FractType;
    cardEl: HTMLElement;
    canvasEl: HTMLCanvasElement;
    resetEl: HTMLElement;
    statusEl: HTMLElement;
}
export interface IHTMLSetupOptions {
    containerId: string;
    width?: number;
    height?: number;
    showControls?: boolean;
    showStatusBar?: boolean;
}
export type HTMLSearchOptions = {
    typeName: string;
    re: number;
    im: number;
    dia: number;
};
/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export declare function setupFractalCanvas(options: IHTMLSetupOptions): IFractCard;
export declare function updateParamsFromURL(params: IParams): void;
export declare function updateURLfromParams(params: IParams): void;
//# sourceMappingURL=cFractHtml.d.ts.map