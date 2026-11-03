export type ErrorLevel = "OK" | "WARN" | "ERROR" | "STOP";
export type LogLevel = "ALL" | "NOTRACE" | "NOLOG" | "NOWARN";
export type TestableFun<In, Out> = (input: In) => Out;
export interface HTMLLogger {
    outDevice: HTMLElement;
    log(msg: string): void;
}
export interface TestUnit<In, Out> extends TestableFun<In, Out> {
    fun: TestableFun<In, Out>;
    new (myFun: TestableFun<In, Out>): any;
    test(input: In, expected: Out, errMsg?: string): boolean;
    /** when test fails*/
    warn?(errMsg: string): void;
}
export interface TestableGrid<Index, Out> extends TestUnit<Index, Out> {
    /** Componant integrated test */
    autoTest?(): boolean;
    /** Recomputes the grid */
    reCalc(): boolean;
    getAt(index: Index): Out;
    /** Buffer data */
    buffer: ArrayBuffer | Uint8Array;
}
/** Test class for module or class */
declare class TestRunner<In> implements TestUnit<In, boolean> {
    /** function(input: In): Out under test */
    fun: TestableFun<In, Out>;
    constructor(myFun: TestableFun<In, Out>);
    lastErr?: string;
    result?: boolean;
    testCase: string;
    private errMsgs;
    private passedCount;
    /** Réinitialise le compteur de test */
    reset(): void;
    /** Exécute un test unitaire */
    test(input: In, expected: Out, msg?: string): boolean;
    /** Résumé des résultats */
    get report(): {
        success: boolean;
        passed: number;
        failed: number;
        details: string[];
    };
    private isEqual;
}
export declare const T: TestRunner<any>;
export {};
//# sourceMappingURL=appCoding.d.ts.map