// Module analysis.math - V1.0 - Copyright LeFractiste 2026

// #region Imports & Documentation
import { ComplexPoint, PointAnalysisResult } from "../fractTypes.js";

/**
 * Calculs purs d'analyse fractale (Orbite, Newton 2D, Quadtree).
 * - analyzePointMath: Analyse du comportement d'un point c (échappement, DEM, période).
 * - findMinibrotCenterMath: Raffinement du centre exact d'un minibrot par Newton.
 * - QuadNode: Structure spatiale récursive pour balayage rapide de zones.
 */
// #endregion

// #region Core Math Analysis
export function analyzePointMath(
  c_re: number,
  c_im: number,
  maxIter = 1000
): PointAnalysisResult {
  let z_re = 0,
    z_im = 0,
    dz_re = 0,
    dz_im = 0;
  let orbit: { re: number; im: number; mod2: number }[] = [];
  let detectedPeriod = 0,
    minDiff = Infinity;
  for (let i = 1; i <= maxIter; i++) {
    let new_dz_re = 2 * (z_re * dz_re - z_im * dz_im) + 1;
    let new_dz_im = 2 * (z_re * dz_im + z_im * dz_re);
    dz_re = new_dz_re;
    dz_im = new_dz_im;
    let new_z_re = z_re * z_re - z_im * z_im + c_re;
    let new_z_im = 2 * z_re * z_im + c_im;
    z_re = new_z_re;
    z_im = new_z_im;
    let mod2 = z_re * z_re + z_im * z_im;
    orbit.push({ re: z_re, im: z_im, mod2 });
    if (i > 10 && detectedPeriod === 0) {
      for (let p = 1; p <= Math.min(64, i - 1); p++) {
        let prev = orbit[i - 1 - p];
        let diff = Math.hypot(z_re - prev.re, z_im - prev.im);
        if (diff < 1e-7 && diff < minDiff) {
          minDiff = diff;
          detectedPeriod = p;
        }
      }
    }
    if (mod2 > 4.0) {
      //encore ce 4 qui devrait être grand je crois
      let externalAngle = (Math.atan2(z_im, z_re) / (2 * Math.PI) + 1) % 1;
      let mod = Math.sqrt(mod2),
        dz_mod = Math.hypot(dz_re, dz_im);
      let demDistance = (2 * mod * Math.log(mod)) / dz_mod;
      return {
        escaped: true,
        iterations: i,
        demDistance,
        externalAngle,
        period: 0
      };
    }
  }
  let lambda = Math.hypot(dz_re, dz_im);
  let scaleFactor = lambda > 0 ? 1.0 / lambda : 0;
  return {
    escaped: false,
    iterations: maxIter,
    period: detectedPeriod,
    lambda,
    scaleFactor,
    angleAntenna: Math.atan2(dz_im, dz_re)
  };
}

// Raffinement du centre exact par Newton 2D : F_P(c) = 0
export function findMinibrotCenterMath(
  cInit_re: number,
  cInit_im: number,
  period: number,
  maxSteps = 10
): ComplexPoint {
  let c_re = cInit_re,
    c_im = cInit_im;
  for (let step = 0; step < maxSteps; step++) {
    let z_re = 0,
      z_im = 0,
      dc_re = 0,
      dc_im = 0;
    for (let i = 0; i < period; i++) {
      let next_dc_re = 2 * (z_re * dc_re - z_im * dc_im) + 1;
      let next_dc_im = 2 * (z_re * dc_im + z_im * dc_re);
      dc_re = next_dc_re;
      dc_im = next_dc_im;
      let next_z_re = z_re * z_re - z_im * z_im + c_re;
      let next_z_im = 2 * z_re * z_im + c_im;
      z_re = next_z_re;
      z_im = next_z_im;
    }
    let denom = dc_re * dc_re + dc_im * dc_im;
    if (denom < 1e-12) break;
    let step_re = (z_re * dc_re + z_im * dc_im) / denom;
    let step_im = (z_im * dc_re - z_re * dc_im) / denom;
    c_re -= step_re;
    c_im -= step_im;
    if (Math.hypot(step_re, step_im) < 1e-14) break;
  }
  return { re: c_re, im: c_im };
}
// #endregion

// #region QuadTree Spatial Scan
export class QuadNode {
  public children: QuadNode[] = [];
  public data: any = null;
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public depth = 0
  ) {}
  // division
  subdivide(
    evalFunc: (n: QuadNode) => any,
    splitCriterion: (n: QuadNode, d: any) => boolean,
    maxDepth = 6
  ): void {
    this.data = evalFunc(this);
    if (this.depth < maxDepth && splitCriterion(this, this.data)) {
      let hw = this.width / 2,
        hh = this.height / 2;
      this.children = [
        new QuadNode(this.x, this.y, hw, hh, this.depth + 1),
        new QuadNode(this.x + hw, this.y, hw, hh, this.depth + 1),
        new QuadNode(this.x, this.y + hh, hw, hh, this.depth + 1),
        new QuadNode(this.x + hw, this.y + hh, hw, hh, this.depth + 1)
      ];
      for (let child of this.children)
        child.subdivide(evalFunc, splitCriterion, maxDepth);
    }
  }
  // Collecte arborescente des résultats
  collect(results: any[] = []): any[] {
    if (this.children.length === 0) {
      results.push({
        x: this.x,
        y: this.y,
        w: this.width,
        h: this.height,
        data: this.data
      });
    } else {
      for (let child of this.children) child.collect(results);
    }
    return results;
  }
}
// #endregion
