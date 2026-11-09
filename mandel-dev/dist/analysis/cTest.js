// infrastructure & test module - copyright LeFractiste 2026
import { APP_VERSION } from "../app/version.js";
/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 */
export class cTest {
    //public fileCopy : boolean = false;  //@todo: implement
    statusEl;
    traceIsOn = false;
    errorLevel;
    // Build a module specific cTest - usage: private T = new cTest(moduleName);
    constructor(statusEl) {
        this.statusEl = statusEl;
        this.errorLevel = "OK";
    }
    log(msg) {
        console.log(msg);
    }
    assert(condition, msg = "(false)", source = "") {
        if (!condition)
            throw this.error(`[ASSERT] ${msg}`, source);
    }
    eq(received, expected, msg = "assertEq", source = "") {
        const pass = JSON.stringify(received) === JSON.stringify(expected);
        if (!pass)
            this.warn(`${msg} | Received: ${received} [NEQ] Expected: ${expected}`, source);
        return pass;
    }
    reset() {
        this.errorLevel = "OK";
    }
    warn(msg, source = "") {
        this.errorLevel = "WARN";
        console.warn(`* [WARN][${source}] ${msg}`);
    }
    error(msg, source = "") {
        this.errorLevel = "ERROR";
        console.error(`**[ERROR][${source}] ${msg}`);
    }
    userAbort(msg, source = "") {
        this.errorLevel = "STOP";
        alert(`[ABORT] ${source} ${msg}`);
        throw new Error(msg);
    }
    userInfo(msg) {
        this.statusEl.innerText = msg;
    }
    // Identifie
    autotest() {
        const msg = `Mandel v${this.version(false)} - Status=${this.errorLevel}`;
        this.userInfo(msg);
        //setTimeout(() => (status.innerText = ""), 3000);
        const result = this.errorLevel === "OK";
        return result;
    }
    // Retourne la version
    version(full = false) {
        return full
            ? `Mandel-Dev v${APP_VERSION.version} | Build: ${APP_VERSION.buildDate} | Git: ${APP_VERSION.gitTag}`
            : APP_VERSION.version;
    }
    logVersion() {
        console.log(`%c ${this.version(true)}`, "color: #0088ff; font-weight: bold; font-size: 12px;");
    }
} /*testClass*/
//# sourceMappingURL=cTest.js.map