/** // Helper d'injection HTML/CSS pour cFract
 * @todo: placer les appels dans l'autre sens - mandel appelle helper-html ! */
import { FractType, IParams } from "../fractTypes.js";
export interface IHTMLFractContainer {
    canvasId: string;
    type: FractType;
    statusId: string;
    containerEl: HTMLElement;
    canvasEl: HTMLCanvasElement;
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
    typeName: String;
    re: number;
    im: number;
    dia: number;
};
/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export declare function setupFractalCanvas(options: IHTMLSetupOptions): IHTMLFractContainer;
export declare function updateParamsFromURL(params: IParams): void;
export declare function updateURLfromParams(params: IParams): void;
//# sourceMappingURL=cFractHtml.d.ts.map