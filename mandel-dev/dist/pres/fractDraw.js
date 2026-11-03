// pres/cfractDraw.ts - V1 - copyright LeFractiste 2026
/** Calque de surimpressions (Overlay)
 *  V1: list of static functions (called par parent.render with parameters and PixelPoint coordinates).
 * @todo 1: constructeur pour avoir les infos du canvas ! (V1.1: commented)
 * @todo 2: VectorOverlay pour controle de zoom et rotation
 * @todo 2: logic - is this a cFract or agnostic Overlay module ?
 */
/** Fonctions de rendu graphique pour orbites, lignes et rayons externes

 */
export class cFractDraw {
    //private parent: IParent;
    //private ctx:CanvasRenderingContext2D;
    //public drawOptions: DrawOptions;
    //constructor(parent:IParent)
    // #region Reticle
    // Draw reticle: a circle with a cross
    static drawReticle(canvas, pix) {
        // Rendre l'image de base pour effacer l'ancien réticule
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
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
    /** Draw fixed points for Julia set
     * @todo 2: simplify the interface */
    static drawFixedPointsOverlay(ctx, param, width, height, fixedPoints = []) {
        if (!fixedPoints || fixedPoints.length === 0)
            return;
        ctx.save();
        ctx.fillStyle = "#ff0000";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        for (const cPoint of fixedPoints) {
            const pix = param.c2pix(cPoint);
            // Ne dessiner que si le point est dans la zone visible
            if (pix.x >= 0 && pix.x <= width && pix.y >= 0 && pix.y <= height) {
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
    static drawComplexPath(parent, points, options = {}) {
        if (!parent || !parent.canvas || points.length === 0)
            return;
        const cP = parent.params;
        const ctx = parent.ctx;
        const color = options.color || parent.palette?.trajectoryColor || "#ff0055";
        const lineWidth = options.lineWidth || 1.5;
        // Convert to pixels
        const N = points.length;
        const pix = Array(N);
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
            ctx.fillStyle = parent.palette?.pointColor || "#ffffff";
            for (let i = 0; i < N; i++) {
                ctx.fillRect(pix[N].x - 1.5, pix[N].y - 1.5, 3, 3);
            }
        }
        ctx.restore();
    }
}
//# sourceMappingURL=fractDraw.js.map