import { ComplexPoint, PointAnalysisResult } from "../fractTypes.js";
/**
 * Calculs purs d'analyse fractale (Orbite, Newton 2D, Quadtree).
 * - analyzePointMath: Analyse du comportement d'un point c (échappement, DEM, période).
 * - findMinibrotCenterMath: Raffinement du centre exact d'un minibrot par Newton.
 * - QuadNode: Structure spatiale récursive pour balayage rapide de zones.
 */
export declare function analyzePointMath(c_re: number, c_im: number, maxIter?: number): PointAnalysisResult;
export declare function findMinibrotCenterMath(cInit_re: number, cInit_im: number, period: number, maxSteps?: number): ComplexPoint;
export declare class QuadNode {
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    children: QuadNode[];
    data: any;
    constructor(x: number, y: number, width: number, height: number, depth?: number);
    subdivide(evalFunc: (n: QuadNode) => any, splitCriterion: (n: QuadNode, d: any) => boolean, maxDepth?: number): void;
    collect(results?: any[]): any[];
}
//# sourceMappingURL=analysisMath.d.ts.map