// infrastructure & test module - copyright LeFractiste 2026
// Export T, logger and testable interface
// Usage:  import { T, testableFun, testableGrid } from "../app/appCoding.js"
/** Test class for module or class */
class TestRunner {
    /** function(input: In): Out under test */
    fun;
    lastErr;
    result;
    testCase = "Runner";
    errMsgs = [];
    passedCount = 0;
    /** Réinitialise le compteur de test */
    reset() {
        this.errMsgs = [];
        this.passedCount = 0;
        this.fun = undefined;
    }
    /** Exécute un test unitaire */
    test(input, expected, msg) {
        if (!this.fun) {
            throw new Error("TestRunner: Aucune fonction définie (functionUnderTest est vide).");
        }
        const actual = this.fun(input);
        // Comparaison basique ou sérialisée (pratique pour les tableaux/objets)
        this.result = this.isEqual(actual, expected);
        if () {
            this.passedCount++;
        }
        else {
            const errorMsg = `FAIL [${msg || "Test"}]: Entrée=${JSON.stringify(input)} | Attendu=${JSON.stringify(expected)} | Obtenu=${JSON.stringify(actual)}`;
            this.errMsgs.push(errorMsg);
        }
    }
    /** Résumé des résultats */
    get report() {
        return {
            success: this.errMsgs.length === 0,
            passed: this.passedCount,
            failed: this.errMsgs.length,
            details: this.errMsgs
        };
    }
    isEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }
}
// Instance globale ou locale de test
export const T = new TestRunner();
/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 */
class myConsole {
    //public fileCopy : boolean = false;  //@todo: implement
    traceIsOn = true;
    module = "";
    lastSource = "";
    errorLevel;
    // Build a module specific cTest - usage: private T = new cTest(moduleName);
    constructor(moduleName, traceState = false) {
        this.module = moduleName;
        this.trace("new");
        this.traceIsOn = traceState;
        this.errorLevel = "OK";
        logger = console;
    }
    log(msg) {
        console.log(msg);
    }
    trace(source, args = "") {
        this.lastSource = source;
        if (this.traceIsOn)
            this.log(`  [TRACE] ${this.module}.${source}(${args})`);
    }
    assert(condition, msg = "(false)", source = "") {
        if (!condition)
            throw this.error(`[ASSERT] ${msg}`, source);
    }
    eq(varA, varB, msg = "assertEq", source = "") {
        const pass = JSON.stringify(varA) === JSON.stringify(varB);
        if (!pass)
            this.warn(`${msg} | Received: ${varA} [NEQ] Expected: ${varB}`, source);
        return pass;
    }
    warn(msg, source = "") {
        console.warn(`* [WARN] [${this.module}] ${source} ${msg}`);
    }
    error(msg, source = "") {
        console.error(`**[ERROR][${source}] ${msg}`);
    }
    UserMsgAbort(msg, source = "") {
        alert(`[ABORT] ${source} ${msg}`);
        throw new Error(msg);
    }
}
// testClass: classe de test
//# sourceMappingURL=appCoding.js.map