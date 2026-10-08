/** Classe exportée vers l'extérieur: gère tout.
 * @todo tout coordonner d'ici, et présenter les "domaines" à l'extérieur html, params, events, analyse,...
 * @todo: passage en ts:
 * export class cFract {
  public image: cImage;
  public param: FractParams;
  constructor(options: FractSetupOptions) {
    this.param = new FractParams();
    this.image = new cImage(options.width || 800, options.height || 600);
  }
}*/
export class cFract {
    constructor(canvasId: any, type: string | undefined, statusId: any);
    statusId: any;
    canvas: HTMLElement | null;
    ctx: any;
    cImage: cImage;
    param: any;
    calcMode: string;
    calcCount: number;
    autoCalc: boolean;
    wasmEngine: MandelEngine | null;
    memory: any;
    isBusy: boolean;
    init(paletteLut: any): Promise<void>;
    wasmMemory: WebAssembly.Memory | undefined;
    makeDirty(): void;
    isDirty: boolean | undefined;
    makeClean(): void;
    render(): void;
    complexToString(c: any, digits?: number): string;
    updateStatusBar(c: any, px: any, py: any): void;
    classConsole(msg: any): void;
    drawFixedPointsOverlay(): void;
    drawOrbitOverlay(orbit: any): void;
    getOrbitCsv(): string;
    attachEvents(onPointSelected?: null): void;
} /**cFract*/
import { cImage } from "../pres/cImage.js";
import { MandelEngine } from "../../pkg/rust_m.js";
//# sourceMappingURL=mandel.d.ts.map