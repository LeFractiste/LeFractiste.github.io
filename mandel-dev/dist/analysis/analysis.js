// Module analysis-V2.ts - copyright LeFractiste 2026
// Implémente: analyse_orbite, extRay, recherche Minibrots
// Utilise AnalysisMath et mandel (cFract)
// TODO 2: recherche des bons zooms pour un cDeep - comment est défini un mniJulia ?
// #region Imports & Index
import { cUtils } from "../app/utils.js";
import { t_externalRay } from "./externalRay.js";
import { analyzePointMath, findMinibrotCenterMath, QuadNode } from "../calc/analysisMath.js";
/**
 * Combined Exports:
 * - cFractAnalysis: Classe de pilotage d'analyse liée ou autonome.
 * - t_test, t_analysis: Fonctions de test et d'expérimentation.
 * - findMinibrotsInWindow: Recherche guidée par Quadtree.
 */
// #endregion
// #region Tests & Experiments
export function t_test() {
    t_externalRay();
}
export function t_analysis(cDeep = {
    re: -0.743643887037158704752191506114774,
    im: 0.131825904205311970493132056385139
}) {
    console.log("Hello");
    const analyzer = new cFractAnalysis();
    console.log(cUtils.complexToString(cDeep));
    const pointInfo = analyzer.analyzePoint(cDeep.re, cDeep.im, 2000);
    const reportText = analyzer.generateReportText(pointInfo);
    console.log(reportText);
    const exactCenter = analyzer.findMinibrotCenter(cDeep.re, cDeep.im, 3);
    const reportCenter = `Centre Minibrot calculé : ${exactCenter.re} + i*${exactCenter.im}`;
    console.log(reportCenter);
    return reportText + "\n" + reportCenter;
}
// #endregion
// #region cFractAnalysis Class
// Analyse d'orbite
export class cFractAnalysis {
    parent;
    detectedMinibrots = [];
    constructor(parent) {
        this.parent = parent;
    }
    analyzePoint(c_re, c_im, maxIter = 1000) {
        return analyzePointMath(c_re, c_im, maxIter);
    }
    findMinibrotCenter(cInit_re, cInit_im, period, maxSteps = 10) {
        return findMinibrotCenterMath(cInit_re, cInit_im, period, maxSteps);
    }
    generateReportText(analysisResult) {
        return `=== RAPPORT D'ANALYSE DU POINT ===
- Statut: ${analysisResult.escaped ? "Extérieur (Échappé)" : "Intérieur / Minibrot"}
- Période (Harmonique): ${analysisResult.period || "N/A"}
- Distance DEM: ${analysisResult.demDistance ? analysisResult.demDistance.toExponential(4) : "0"}
- Multiplicateur (Lambda): ${analysisResult.lambda ? analysisResult.lambda.toFixed(2) : "N/A"}
- Rayon d'influence (Diamètre): ${analysisResult.scaleFactor ? analysisResult.scaleFactor.toExponential(4) : "N/A"}
- Angle Antenne: ${analysisResult.angleAntenna ? ((analysisResult.angleAntenna * 180) / Math.PI).toFixed(2) + "°" : "N/A"}
- External Ray Angle: ${analysisResult.externalAngle ? analysisResult.externalAngle.toFixed(4) : "N/A"}`;
    }
}
// #endregion
// #region Spatial Minibrot Search
// Recherche rapide de Minibrots dans la fenêtre courante via Quadtree
export function findMinibrotsInWindow(analyzer, windowX, windowY, windowSize, periodP = 32) {
    let root = new QuadNode(windowX, windowY, windowSize, windowSize);
    let evalFunc = (node) => analyzer.analyzePoint(node.x + node.width / 2, node.y + node.height / 2, 500);
    let splitCriterion = (node, evalData) => {
        if (evalData.period === periodP)
            return true;
        if (evalData.escaped && evalData.demDistance < node.width)
            return true;
        return false;
    };
    root.subdivide(evalFunc, splitCriterion, 8);
    let candidates = root
        .collect()
        .filter(l => l.data.period === periodP || (l.data.scaleFactor && l.data.scaleFactor > 0));
    let rootsP = [];
    for (let cand of candidates) {
        let exactCenter = analyzer.findMinibrotCenter(cand.x, cand.y, periodP);
        if (!rootsP.some(r => Math.hypot(r.re - exactCenter.re, r.im - exactCenter.im) < 1e-6))
            rootsP.push(exactCenter);
    }
    return rootsP;
}
// #endregion
//# sourceMappingURL=analysis.js.map