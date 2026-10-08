import type { ComplexPoint, PointAnalysisResult, ICFractParent } from "../fractTypes.js";
/**
 * Combined Exports:
 * - cFractAnalysis: Classe de pilotage d'analyse liée ou autonome.
 * - t_test, t_analysis: Fonctions de test et d'expérimentation.
 * - findMinibrotsInWindow: Recherche guidée par Quadtree.
 */
export declare function t_test(): void;
export declare function t_analysis(cDeep?: ComplexPoint): string;
export declare class cFractAnalysis {
    parent?: ICFractParent | undefined;
    detectedMinibrots: ComplexPoint[];
    constructor(parent?: ICFractParent | undefined);
    analyzePoint(c_re: number, c_im: number, maxIter?: number): PointAnalysisResult;
    findMinibrotCenter(cInit_re: number, cInit_im: number, period: number, maxSteps?: number): ComplexPoint;
    generateReportText(analysisResult: PointAnalysisResult): string;
}
export declare function findMinibrotsInWindow(analyzer: cFractAnalysis, windowX: number, windowY: number, windowSize: number, periodP?: number): ComplexPoint[];
//# sourceMappingURL=analysis.d.ts.map