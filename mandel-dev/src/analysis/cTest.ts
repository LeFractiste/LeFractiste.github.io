// infrastructure & test module - copyright LeFractiste 2026

import { ErrorLevel, ITestableClass } from "../fractTypes.js";

/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 */
export class cTest implements ITestableClass<HTMLElement> {
  //public fileCopy : boolean = false;  //@todo: implement
  statusEl: HTMLElement;
  public traceIsOn: boolean = false;
  private module: string = "";
  private lastSource: string = "";
  private errorLevel: ErrorLevel;
  // Build a module specific cTest - usage: private T = new cTest(moduleName);
  constructor(statusEl: HTMLElement) {
    this.statusEl = statusEl;
    this.trace("new");
    this.errorLevel = "OK";
  }
  log(msg: string) {
    console.log(msg);
  }
  trace(source: string, args: string = ""): void {
    this.lastSource = source;
    if (this.traceIsOn) this.log(`  [TRACE] ${this.module}.${source}(${args})`);
  }
  assert(condition: boolean, msg = "(false)", source = "") {
    if (!condition) throw this.error(`[ASSERT] ${msg}`, source);
  }
  eq(received: any, expected: any, msg = "assertEq", source = "") {
    const pass = JSON.stringify(received) === JSON.stringify(expected);
    if (!pass)
      this.warn(`${msg} | Received: ${received} [NEQ] Expected: ${expected}`, source);
    return pass;
  }
  warn(msg: string, source = "") {
    console.warn(`* [WARN] [${this.module}] ${source} ${msg}`);
  }
  error(msg: string, source = "") {
    console.error(`**[ERROR][${source}] ${msg}`);
  }
  userAbort(msg: string, source: string = ""): void {
    alert(`[ABORT] ${source} ${msg}`);
    throw new Error(msg);
  }
  userInfo(msg: string) {
    this.statusEl.innerText = msg;
  }
  autotest(): boolean {
    this.statusEl.innerText = `Status=${this.errorLevel as string}`;
    const result = this.errorLevel === "OK";
    //setTimeout(() => (status.innerText = ""), 3000);
    return result;
  }
}

// testClass: classe de test
