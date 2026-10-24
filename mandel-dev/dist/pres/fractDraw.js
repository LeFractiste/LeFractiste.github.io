// pres/cfractDraw.ts - copyright LeFractiste 2026
/* Calque de surimpressions (Overlay)
@todo : constructor pour avoir les infos du canvas !
*/
/* Fonctions de rendu graphique pour orbites, lignes et rayons externes.
 * @todo: renommer Overlay et constructeur pour passer les infos */
export class cFractDraw {
    // Tracé des repères et points d'intérêt
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
}
/* Gère le tracé vectoriel au-dessus du canvas de pixels
 *(points fixes, axes, orbites, repères). */
export function drawComplexPath(parent, points, options = {}) {
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
//# sourceMappingURL=fractDraw.js.map