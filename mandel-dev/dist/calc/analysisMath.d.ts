import { ComplexPoint, PointAnalysisResult } from "../fractTypes.js";
/**
 * Calculs purs d'analyse fractale (Orbite, Newton 2D, Quadtree).
 * - analyzePointMath: Analyse du comportement d'un point c (échappement, DEM, période).
 * - findMinibrotCenterMath: Raffinement du centre exact d'un minibrot par Newton.
 * - QuadNode: Structure spatiale récursive pour balayage rapide de zones.
 */
export declare function analyzePointMath(c_re: number, c_im: number, maxIter?: number, maxR2?: number): PointAnalysisResult;
export declare function findMinibrotCenterMath(cInit_re: number, cInit_im: number, period: number, maxSteps?: number): ComplexPoint;
/** Quadtree: logique de rafinement de l'image par zones, pour ne calculer que les zones d'intérêt.
 *  Usage 1: QuadTree search, pour trouver des minibrots
 *  @todo 2: Optimisation par calcul des zones à fort détail, et interpolation pour les zones où DEM > N pixels.
 *  Il faut changer la collection des données pour rendre une plage 2D, par QuadInterpolation.
 *  La zone de points quadTree doit être zoomable pour conserver les données.
 *  Onpeut aussi définir une grille de points plus serrée dans la zone centraled'image, et zoomer GPU par facteur 2 en récupérant le calcul.
 */
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