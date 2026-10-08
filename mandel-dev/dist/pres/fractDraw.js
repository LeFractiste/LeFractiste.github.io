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
        for (const pt of fixedPoints) {
            const pix = param.c2pix(pt, width, height);
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
    const ctx = parent.canvas;
    const color = options.color || parent.palette?.trajectoryColor || "#ff0055";
    const lineWidth = options.lineWidth || 1.5;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    const startPix = parent.c2pix(points[0]);
    ctx.moveTo(startPix.x, startPix.y);
    for (let i = 1; i < points.length; i++) {
        const pix = parent.c2pix(points[i]);
        ctx.lineTo(pix.x, pix.y);
    }
    ctx.stroke();
    if (options.showPoints) {
        ctx.fillStyle = parent.palette?.pointColor || "#ffffff";
        for (const pt of points) {
            const pix = parent.c2pix(pt);
            ctx.fillRect(pix.x - 1.5, pix.y - 1.5, 3, 3);
        }
    }
    ctx.restore();
}
//# sourceMappingURL=fractDraw.js.map