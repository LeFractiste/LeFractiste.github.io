// infrastructure & test module - copyright LeFractiste 2026
// Export T, logger and testable interface
// Usage:  import { T, testableFun, testableGrid } from "../app/appCoding.js"
export {};
/** disconnected

// Basic test function (T.eq(in, out, msg)  or T.test(in, chk, msg) )
export interface ITestUnit<In, Out> extends TestableFun<In, Out> {
  public fun: TestableFun<In, Out>;
  new (myFun: TestableFun<In, Out>);
  test(input: In, expected: Out, errMsg? : string) : boolean;
  // when test fails
  warn?(errMsg: string) : void;
}


// Basic test function (T.eq(in, out, msg)  or T.test(in, chk, msg) )
export class TestUnit<In, Out> implements ITestUnit<In, Out> {
  public fun<In, Out>(input: In) : Out;
  constructor(myFun: TestableFun<In, Out>);
  test(input: In, expected: Out, errMsg? : string) : boolean;
  // when test fails
  warn?(errMsg: string) : void;
}

// Interface globale pour composant testable (image, calc, wasmBuffer, palette)
export interface ITestableGrid<Index, Out> extends TestUnit<Index, Out> {
  autoTest?(): boolean;
  // Recomputes the grid
  reCalc(): boolean;
  getAt(index: Index): Out;
  // Buffer data
  buffer: ArrayBuffer | Uint8Array; //wasm compatible ?
}

// Test class for module or class - doesn't work
class TestRunner<In> extends ITestUnit<In, boolean> {
  // Function under test
  public fun: TestableFun<In, Out>;
  test(input: In, expected: Out, errMsg? : string) : boolean;
  // when test fails
  constructor TestRunner<In>(myFun: TestableFun<In, Out>) {
    lastErr?: string;
    result?: boolean;
    public testCase = "Runner";
    private errMsgs: string[] = [];
    private passedCount = 0;
  }

  // Réinitialise le compteur de test
  public reset(): void {
    this.errMsgs = [];
    this.passedCount = 0;
    this.fun = undefined;
  }
  // Exécute un test unitaire
  public test(input: In, expected: Out, msg?: string): boolean {
    if (!this.fun) {
      throw new Error(
        "TestRunner: Aucune fonction définie (functionUnderTest est vide)."
      );
    }
    const actual = this.fun(input);
    // Comparaison basique ou sérialisée (pratique pour les tableaux/objets)
    this.result = this.isEqual(actual, expected)
    if () {
      this.passedCount++;
    } else {
      const errorMsg = `FAIL [${msg || "Test"}]: Entrée=${JSON.stringify(input)} | Attendu=${JSON.stringify(expected)} | Obtenu=${JSON.stringify(actual)}`;
      this.errMsgs.push(errorMsg);
    }
  }
  // Résumé des résultats
  public get report() {
    return {
      success: this.errMsgs.length === 0,
      passed: this.passedCount,
      failed: this.errMsgs.length,
      details: this.errMsgs
    };
  }
  // Equality test
  private isEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
} /**/
//# sourceMappingURL=appTester.js.map