import type {
  ComplexPoint,
  TrajectoryType,
  Trajectory,
  ExternalRayConfig
} from "../fractTypes.js";

// Module de fonctions TS ExternalRay
// @todo 2:  (à découper en interface-->utils? et fonctions (classe extRay?)

//Test external Ray (implementé en ts)
export function t_externalRay(): ComplexPoint[] {
  // Intialise un external ray sur un point de départ éloigné (ex: r = 2.0, angle theta = 1/3 -> 120 degrés)
  const startC: ComplexPoint = { re: -0.5, im: 1.5 };
  const rayConfig = { angle: 1 / 3, maxIter: 1000, bailout: 1e8 };
  const ray = new ExternalRayTrajectory(startC, rayConfig);
  // Trace la trajectoire point par point vers la frontière de Mandelbrot
  const path: ComplexPoint[] = [{ ...ray.current }];
  const stepSize = 0.01;
  for (let i = 0; i < 200; i++) {
    const nextPos = ray.moveAlong(stepSize, p => externalRayVectorField(p, rayConfig));
    path.push({ ...nextPos });
  }
  console.log(`Trajectoire calculée sur ${path.length} points.`);
  return path;
}

/**
 * Calcule la valeur du potentiel d'échappement G(c) et son gradient local gradG(c)
 */
export function computePotentialAndGradient(
  c: ComplexPoint,
  maxIter: number = 500,
  bailout: number = 1e6
): { potential: number; grad: ComplexPoint } {
  let zRe = 0;
  let zIm = 0;
  let dzRe = 0;
  let dzIm = 0;

  let iter = 0;
  for (iter = 0; iter < maxIter; iter++) {
    // dz = 2 * z * dz + 1
    const nextDzRe = 2 * (zRe * dzRe - zIm * dzIm) + 1;
    const nextDzIm = 2 * (zRe * dzIm + zIm * dzRe);
    dzRe = nextDzRe;
    dzIm = nextDzIm;

    // z = z^2 + c
    const nextZRe = zRe * zRe - zIm * zIm + c.re;
    const nextZIm = 2 * zRe * zIm + c.im;
    zRe = nextZRe;
    zIm = nextZIm;

    if (zRe * zRe + zIm * zIm > bailout) break;
  }

  const mod2 = zRe * zRe + zIm * zIm;
  if (mod2 <= 4) {
    return { potential: 0, grad: { re: 0, im: 0 } };
  }

  const mod = Math.sqrt(mod2);
  const logMod = Math.log(mod);
  const twoToN = Math.pow(2, iter);

  // Potentiel G(c) = ln|z_n| / 2^n
  const potential = logMod / twoToN;

  // Calcul du gradient du potentiel d/dc (G(c))
  const dzMod2 = dzRe * dzRe + dzIm * dzIm;
  const factor = 1.0 / (twoToN * mod2 * dzMod2);

  const gradRe = factor * (zRe * dzRe + zIm * dzIm);
  const gradIm = factor * (zIm * dzRe - zRe * dzIm);

  return { potential, grad: { re: gradRe, im: gradIm } };
}

/**
 * Champ de vecteur d'orientation pour descendre le long du rayon externe
 */
export function externalRayVectorField(
  c: ComplexPoint,
  config: ExternalRayConfig
): ComplexPoint {
  const { potential, grad } = computePotentialAndGradient(
    c,
    config.maxIter,
    config.bailout
  );
  const gradNorm2 = grad.re * grad.re + grad.im * grad.im;

  if (gradNorm2 < 1e-12 || potential === 0) {
    return { re: 0, im: 0 }; // Dans l'ensemble de Mandelbrot ou zone stagnante
  }

  // Direction de descente orthogonale aux lignes de potentiel
  return {
    re: -grad.re / gradNorm2,
    im: -grad.im / gradNorm2
  };
}

/**
 * Implémentation du moteur de trajectoire de Rayon Externe
 */
export class ExternalRayTrajectory implements Trajectory {
  public type: TrajectoryType = "extRay";
  public current: ComplexPoint;
  private config: ExternalRayConfig;

  constructor(startPoint: ComplexPoint, config: ExternalRayConfig) {
    this.current = { ...startPoint };
    this.config = config;
  }

  /**
   * Avance le long de la trajectoire du rayon externe avec une méthode d'Euler ou Runge-Kutta 2
   */
  public moveAlong(
    stepSize: number,
    field: (p: ComplexPoint) => ComplexPoint
  ): ComplexPoint {
    // 1. Vecteur au point courant k1
    const k1 = field(this.current);
    const k1Norm = Math.hypot(k1.re, k1.im);

    if (k1Norm === 0) return this.current;

    // Normalisation du pas
    const dir1Re = (k1.re / k1Norm) * stepSize;
    const dir1Im = (k1.im / k1Norm) * stepSize;

    // 2. Point intermédiaire RK2
    const midPoint: ComplexPoint = {
      re: this.current.re + dir1Re * 0.5,
      im: this.current.im + dir1Im * 0.5
    };

    const k2 = field(midPoint);
    const k2Norm = Math.hypot(k2.re, k2.im);

    if (k2Norm === 0) {
      this.current.re += dir1Re;
      this.current.im += dir1Im;
      return this.current;
    }

    // 3. Mise à jour de la position
    this.current.re += (k2.re / k2Norm) * stepSize;
    this.current.im += (k2.im / k2Norm) * stepSize;

    return this.current;
  }
}
