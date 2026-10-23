// infrastructure & test module - copyright LeFractiste 2026

import { ErrorLevel } from "../fractTypes.js";

/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 */
export class cTest {
  //public fileCopy : boolean = false;  //@todo: implement
  public traceIsOn: boolean = true;
  private module: string = "";
  private lastSource: string = "";
  private errorLevel: ErrorLevel;
  // Build a module specific cTest - usage: private T = new cTest(moduleName);
  constructor(moduleName: string, traceState: boolean = false) {
    this.module = moduleName;
    this.trace("new");
    this.traceIsOn = traceState;
    this.errorLevel = "OK";
  }
  public log(msg: string) {
    console.log(msg);
  }
  public trace(source: string, args: string = ""): void {
    this.lastSource = source;
    if (this.traceIsOn) this.log(`  [TRACE] ${this.module}.${source}(${args})`);
  }
  assert(condition: boolean, msg = "(false)", source = "") {
    if (!condition) throw this.error(`[ASSERT] ${msg}`, source);
  }
  eq(varA: any, varB: any, msg = "assertEq", source = "") {
    const pass = JSON.stringify(varA) === JSON.stringify(varB);
    if (!pass) this.warn(`${msg} | Received: ${varA} [NEQ] Expected: ${varB}`, source);
    return pass;
  }
  warn(msg: string, source = "") {
    console.warn(`* [WARN] [${this.module}] ${source} ${msg}`);
  }
  error(msg: string, source = "") {
    console.error(`**[ERROR][${source}] ${msg}`);
  }
  UserMsgAbort(msg: string, source = "") {
    alert(`[ABORT] ${source} ${msg}`);
    throw new Error(msg);
  }
}

// testClass: classe de test
