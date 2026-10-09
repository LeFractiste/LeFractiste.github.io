/** // Helper d'injection HTML/CSS pour cFract
 * @todo: placer les appels dans l'autre sens - mandel appelle helper-html ! */
import { FractType } from "../fractTypes.js";
import { cFractParams } from "../calc/cFractParams";
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
    showControls?: boolean;
    showStatusBar?: boolean;
}
/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export declare function setupFractalCanvas(options: htmlSetupOptions): htmlFractContainer;
export declare function parseHashParams(): cFractParams;
export declare function todo_paramsToURL(params: cFractParams): void;
//# sourceMappingURL=cFractHtml.d.ts.map