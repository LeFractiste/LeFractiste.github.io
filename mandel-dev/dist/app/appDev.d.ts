export {};
/** @todo 1: // Prochaine procédure d'initialisation */
/**
  // Au chargement complet de la page (ou dans ton point d'entrée appDev.ts)
  document.addEventListener("DOMContentLoaded", () => {
    // 1. On récupère TOUTES les div possédant la classe .cFract
    const cardElements = document.querySelectorAll<HTMLElement>(".cFract");

    // 2. On les parcourt et on instancie une classe par élément
    const activeCards: cFractCard[] = [];
    cardElements.forEach((el) => {
      const card = new cFractCard(el);
      if (card.isOk) {
        activeCards.push(card);
      }
    });

    console.log(`[App] ${activeCards.length} cartes fractales initialisées et prêtes.`);
  });

*/
/**
// --- ÉCOUTEURS D'ÉVÉNEMENTS (INTERACTION UX) ---
function testEventListener() {
  //Areas to activate -@todo 1: move to cFract.html
  // const canvasM = mandel.canvas;
  // const canvasJ = julia.canvas;
  const btnCopy = document.getElementById("btnCopyCsv");
  const btnTest = document.getElementById("btnTest");

  // Button test: lance l'analyse d'orbite complète
  if (btnTest) {
    // inactivé: mandel.sélection du point à faire !
    btnTest.addEventListener("click", () => {
      // const result = analysis_test();
      const result = this.mandel.autoTest();
      const status = document.getElementById("appStatus");
      if (status) {
        status.innerText = result;
        //setTimeout(() => (status.innerText = ""), 3000);
      }
    });
  }
} /**/
/**function appConsole(msg: string) {
  const appStatus = document.getElementById("appStatus");
  if (appStatus) {
    appStatus.textContent = `[INFO] ${msg} })`;
  }
} /**/
/** @todo : Button copie csv: lance l'analyse d'orbite complète
  if (btnCopy && false) {
    // inactivé: mandel.sélection du point à faire !
    btnCopy.addEventListener("click", () => {
      const csv = mandel.calc.get_orbit_csv();
      navigator.clipboard.writeText(csv);
      const status = document.getElementById("appStatus");
      if (status) {
        status.innerText = `Orbite copiée !`;
        setTimeout(() => (status.innerText = ""), 3000);
      }
    });
  }

  // mandel: cFract.OnPosition event



  }
  /** LISTBOX INTERFACE CALC MODE
   * @todo 2: implement on html !
  const selectMode = document.getElementById("selectCalcMode");
  if (selectMode) {
    selectMode.addEventListener("change", e => {
      const mode = e.target.value; // 'DIRECT' ou 'DEM'
      mandel.calc.setCalcMode(mode);
      julia.calc.etCalcMode(mode);
      //mandel.render(); //auto
      //julia.render(); //auto
    });
  }
} /*initEventListeners*/
/**
//@todo 1: prendre la version de mandel
//CALCUL ET EXPORTATION D'ORBITE POUR GOOGLE SHEETS
function old_exportOrbitToSheets(c: ComplexPoint): void {
  const maxIter = this.mandel.params.max_iter;
  let zRe = 0.0;
  let zIm = 0.0;
  // Formatage tabulaire (TSV) prêt à copier-coller dans Excel/Google Sheets
  let tsvContent = "n\tz_re\tz_im\t|z|^2\n";
  tsvContent += `0\t0.000000\t0.000000\t0.000000\n`;
  for (let n = 1; n <= maxIter; n++) {
    const nextRe = zRe * zRe - zIm * zIm + c.re;
    const nextIm = 2.0 * zRe * zIm + c.im;
    zRe = nextRe;
    zIm = nextIm;
    const mod2 = zRe * zRe + zIm * zIm;
    tsvContent += `${n}\t${zRe.toFixed(6)}\t${zIm.toFixed(6)}\t${mod2.toFixed(6)}\n`;
    if (mod2 > mandel.params.r2_max) break; // Évasion
  }
  // Copie dans le presse-papier
  navigator.clipboard
    .writeText(tsvContent)
    .then(() => {
      console.log(
        `[Orbites] Données pour c=(${c.re}, ${c.im}) copiées dans le presse-papier !`
      );
      const statusEl = document.getElementById("statusBar");
      if (statusEl) {
        statusEl.textContent += `| [Orbite copiée dans le presse-papier]`;
      }
    })
    .catch(err => {
      console.error("Erreur lors de la copie dans le presse-papier:", err);
    });
} /**/
//# sourceMappingURL=appDev.d.ts.map