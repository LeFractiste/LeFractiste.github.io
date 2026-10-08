/** // Helper d'injection HTML/CSS pour cFract
 * @todo: placer les appels dans l'autre sens - mandel appelle helper-html ! */
import { FractType } from "../fractTypes.js";
import { cFractParams } from "../calc/cFractParams";
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
    showControls?: boolean;
    showStatusBar?: boolean;
}
/** Initialise le div html avec canvas, boutons, statusBar,...
 * @todo: bouton ZoomReset serait ajouté par le constructeur de cFract ?  (ici canvas minimum) */
export declare function setupFractalCanvas(options: FractSetupOptions): FractContainer;
export declare function parseHashParams(): cFractParams;
/** Lance le serveur d'image sur base des paramètres - ce module est une miniApp ! L'appeler doGet ?
 * todo: à appeler depuis le constructeur de cFract. C'est app le serveur d'image, qui initie cFract je pense
 */
export declare function runImageServer(containerId: string): Promise<void>;
//# sourceMappingURL=cFractHtml.d.ts.map