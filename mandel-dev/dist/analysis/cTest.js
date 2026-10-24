// infrastructure & test module - copyright LeFractiste 2026
/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 */
export class cTest {
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
//# sourceMappingURL=cTest.js.map