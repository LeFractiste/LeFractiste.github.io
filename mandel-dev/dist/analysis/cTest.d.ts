import { ITestableClass } from "../fractTypes.js";
/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 */
export declare class cTest implements ITestableClass<HTMLElement> {
    statusEl: HTMLElement;
    traceIsOn: boolean;
    private errorLevel;
    constructor(statusEl: HTMLElement);
    log(msg: string): void;
    assert(condition: boolean, msg?: string, source?: string): void;
    eq(received: any, expected: any, msg?: string, source?: string): boolean;
    reset(): void;
    warn(msg: string, source?: string): void;
    error(msg: string, source?: string): void;
    userAbort(msg: string, source?: string): void;
    userInfo(msg: string): void;
    autotest(): boolean;
    version(full?: boolean): string;
    logVersion(): void;
}
//# sourceMappingURL=cTest.d.ts.map