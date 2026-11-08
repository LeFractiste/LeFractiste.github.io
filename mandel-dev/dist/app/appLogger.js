"use strict";
// appLogger.ts - V0.8 - copyright LeFractiste 2026
// Infrastructure class : trace, debug
/** disconnected

import { ILogger, ErrorLevel, LogLevel } from "../fractTypes.js";


class MyLogger implements ILogger {
  static msg()
  warn(msg: string, source = "") {
    this.log(`* [WARN] [${this.module}] ${msg} from ${source}`);
  }
  error(msg: string, source = "") {
    this.log(`**[ERROR] ${msg} from ${source} `);
  }
  alert(msg: string, source = "") {
    this.log(`[ALERT] ${source} ${msg}`);
    throw new Error(msg);
  }
} /**/
/** Lightweight VBA-inspired Trace/Debug helper V0.2 - shared instance is "T"
 * @todo 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
 * @todo 1: Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
 
class myConsole implements ILogger {
  //public fileCopy : boolean = false;  //@todo: implement
  public old_traceIsOn: boolean = true;
  public logLevel: LogLevel = "NOTRACE";
  private module: string = "";
  private lastSource: string = "";
  private errorLevel: ErrorLevel;
  private logDevice: { log(): void)}
  // Build a module specific cTest - usage: private T = new cTest(moduleName);
  constructor(moduleName: string) {
    this.module = moduleName;
    this.errorLevel = "OK";
    this.logDevice = console;
  }
  public log(msg: string) {
    outDevice.log(msg);
  }
  public trace(source: string, args: string = ""): void {
    this.lastSource = source;
    if (this.old_traceIsOn) this.log(`  [TRACE] ${this.module}.${source}(${args})`);
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

// Instance globale ou locale de test
export const T = new myConsole();

/**/
//# sourceMappingURL=appLogger.js.map