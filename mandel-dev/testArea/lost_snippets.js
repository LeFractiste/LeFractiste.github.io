// Snippets: bout de code à récupérer, implémenter, refactirer.

// draw (extRay)

/**
 * import type { ComplexPoint, Trajectory, DrawOptions } from "./fractTypes.js";
 
 /**
  * Représente une collection ordonnée de points dans le plan complexe
  * capable de se dessiner sur un contexte 2D.
  */

/**
 * Dessine la trajectoire sur un CanvasOverlay ou un contexte 2D donné.
 * Utilise la fonction pix2c / c2pix pour convertir les coordonnées complexes en pixels.
 */
/* ts dans js à refactorer car sorti de son contexte
   export function draw(
     ctx: CanvasRenderingContext2D,
     c2pix: (p: ComplexPoint) => { x: number; y: number },
     options: DrawOptions = {},
   ): this {
     if (this.points.length === 0) return this;
 
     const color = options.color || "#ff0055";
     const lineWidth = options.lineWidth || 2;
 
     ctx.save();
     ctx.beginPath();
     ctx.strokeStyle = color;
     ctx.fillStyle = color;
     ctx.lineWidth = lineWidth;
 
     const start = c2pix(this.points[0]);
     ctx.moveTo(start.x, start.y);
 
     for (let i = 1; i < this.points.length; i++) {
       const pt = c2pix(this.points[i]);
       ctx.lineTo(pt.x, pt.y);
     }
     ctx.stroke();
 
     // Optionnel : dessiner des petits cercles sur chaque point calculé
     if (options.showPoints) {
       for (const p of this.points) {
         const pt = c2pix(p);
         ctx.beginPath();
         ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
         ctx.fill();
       }
     }
 
     ctx.restore();
     return this; // Permet de continuer à chaîner si besoin !
   }
 }
 /** */
