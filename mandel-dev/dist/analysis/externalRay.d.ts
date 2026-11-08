import type { ComplexPoint, TrajectoryType, Trajectory, ExternalRayConfig } from "../fractTypes.js";
export declare function t_externalRay(): ComplexPoint[];
/**
 * Calcule la valeur du potentiel d'échappement G(c) et son gradient local gradG(c)
 */
export declare function computePotentialAndGradient(c: ComplexPoint, maxIter?: number, bailout?: number): {
    potential: number;
    grad: ComplexPoint;
};
/**
 * Champ de vecteur d'orientation pour descendre le long du rayon externe
 */
export declare function externalRayVectorField(c: ComplexPoint, config: ExternalRayConfig): ComplexPoint;
/**
 * Implémentation du moteur de trajectoire de Rayon Externe
 */
export declare class ExternalRayTrajectory implements Trajectory {
    type: TrajectoryType;
    current: ComplexPoint;
    private config;
    constructor(startPoint: ComplexPoint, config: ExternalRayConfig);
    /**
     * Avance le long de la trajectoire du rayon externe avec une méthode d'Euler ou Runge-Kutta 2
     */
    moveAlong(stepSize: number, field: (p: ComplexPoint) => ComplexPoint): ComplexPoint;
}
//# sourceMappingURL=externalRay.d.ts.map