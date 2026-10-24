// infrastructure module - copyright LeFractiste 2026

// T - Lightweight VBA-inspired Trace/Debug helper V0.1
// TODO 1: trace sert à passer la stack d'appel, ainsi par défaut, erreur sait quelle est la source (en VBA). En js, on peut faire mieux peut-être?
// TODO 1 Il faut tout passer par T.log pour avoir la possibilité de balancer l'info sur console ou un fichier
// C'est notamment utile pour les tests d'avoir la synthèse en fichier, et pouvoir filtrer sur les Error/Warning/Data
export const T = {
  trace(source, args = "") {
    console.log(`[TRACE][${source}]`, args);
  },
  assert(condition, msg = "assert") {
    if (!condition) throw new Error(`[ASSERT] ${msg}`);
  },
  eq(varA, varB, msg = "assertEq", source = "") {
    const pass = JSON.stringify(varA) === JSON.stringify(varB);
    if (!pass)
      console.warn(
        `[WARN][${source}] ${msg} | Received:`,
        varA,
        "Expected:",
        varB,
      );
    return pass;
  },
  warn(msg, source = "") {
    console.warn(`[WARN][${source}] ${msg}`);
  },
  error(msg, source = "") {
    console.error(`[ERROR][${source}] ${msg}`);
  },
  UserMsgAbort(msg, source = "") {
    alert(`[ABORT][${source}] ${msg}`);
    throw new Error(msg);
  },
};

// testClass: classe de test
