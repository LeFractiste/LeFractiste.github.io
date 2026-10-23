/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 */
export declare class cTest {
    traceIsOn: boolean;
    private module;
    private lastSource;
    private errorLevel;
    constructor(moduleName: string, traceState?: boolean);
    log(msg: string): void;
    trace(source: string, args?: string): void;
    assert(condition: boolean, msg?: string, source?: string): void;
    eq(varA: any, varB: any, msg?: string, source?: string): boolean;
    warn(msg: string, source?: string): void;
    error(msg: string, source?: string): void;
    UserMsgAbort(msg: string, source?: string): void;
}
//# sourceMappingURL=cTest.d.ts.map