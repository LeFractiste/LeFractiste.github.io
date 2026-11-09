// pres/cfractDraw.ts - V1 - copyright LeFractiste 2026
/** Calque de surimpressions (Overlay)
 *  V1: list of static functions (called par parent.render with parameters and PixelPoint coordinates).
 * @todo 1: constructeur pour avoir les infos du canvas ! (V1.1: commented)
 * @todo 2: VectorOverlay pour controle de zoom et rotation
 * @todo 2: logic - is this a cFract or agnostic Overlay module ?
 */

import type {
  ComplexPoint,
  PixelPoint,
  IParent,
  IParams,
  IDrawOverlay,
  IDrawOptions
} from "../fractTypes.js";

/** Fonctions de rendu graphique pour orbites, lignes et rayons externes
 */
export class cFractDraw implements IDrawOverlay {
  private parent: IParent;
  public drawOptions: IDrawOptions;
  //private ctx:CanvasRenderingContext2D;
  //public drawOptions: DrawOptions;
  constructor(parent: IParent) {
    this.parent = parent;
    this.drawOptions = {
      lineColor: "#ff0055",
      lineWidth: 1.5,
      showPoints: true,
      fillStyle: "#fbff27",
      pointSize: 1.5
    };
  }

  // #region Reticle

  // Draw reticle: a circle with a cross
  drawReticle(pix: PixelPoint): void {
    // Rendre l'image de base pour effacer l'ancien réticule
    const canvas = this.parent.canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const px = pix.x;
    const py = pix.y;
    ctx.save();
    // Croix orthogonale
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - 10, py);
    ctx.lineTo(px + 10, py);
    ctx.moveTo(px, py - 10);
    ctx.lineTo(px, py + 10);
    ctx.stroke();
    // Cercle de ciblage
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.stroke();
    //affiche ?
    ctx.restore();
  }

  // #region FixedPoints

  /** Draw fixed points for Julia set */
  drawFixedPointsOverlay(fixedPoints: ComplexPoint[] = []): void {
    if (!fixedPoints || fixedPoints.length === 0) return;
    const canvas = this.parent.canvas;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = "#ff0000";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    for (const cPoint of fixedPoints) {
      const pix = this.parent.params.c2pix(cPoint);
      // Ne dessiner que si le point est dans la zone visible
      if (pix.x >= 0 && pix.x <= canvas.width && pix.y >= 0 && pix.y <= canvas.height) {
        ctx.beginPath();
        ctx.arc(pix.x, pix.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // #region Path

  /* Gère le tracé vectoriel au-dessus du canvas de pixels
   *(points fixes, axes, orbites, repères). */
  drawComplexPath(
    points: ComplexPoint[],
    options: IDrawOptions = this.drawOptions
  ): void {
    // input check and init
    const canvas = this.parent.canvas;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;
    const cP = this.parent.params;
    if (points.length === 0) return;
    const color = options.lineColor; // || this.parent.palette?.trajectoryColor
    const lineWidth = options.lineWidth;
    // Convert to pixels
    const N: number = points.length;
    const pix: PixelPoint[] = Array<PixelPoint>(N);
    for (let i = 0; i < points.length; i++) {
      pix[i] = cP.c2pix(points[i]);
    }
    // Render lines and points
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(pix[0].x, pix[0].y);
    for (let i = 1; i < N; i++) {
      ctx.lineTo(pix[i].x, pix[i].y);
    }
    ctx.stroke();
    if (options.showPoints) {
      ctx.fillStyle = options.fillStyle || "#fafc9c"; // this.parent.palette?.pointColor ||
      for (let i = 0; i < N; i++) {
        const size: number = options.pointSize || 2.0;
        ctx.fillRect(pix[i].x - size, pix[i].y - size, 2 * size, 2 * size);
      }
    }
    ctx.restore();
  }
}
