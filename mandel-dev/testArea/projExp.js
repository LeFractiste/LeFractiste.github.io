/**
 * Mappe un pixel (x, y) vers le plan complexe z via une transformation holomorphe
 * z(x, y) = c + exp( w(x, y) ) avec rotation et pixels 100% conformes (carrés).
 *
 * @param {number} x - Pixel X (0 à W-1)
 * @param {number} y - Pixel Y (0 à H-1)
 * @param {Object} c - Point cible profond {re, im}
 * @param {number} A - Dimension/Échelle de départ
 * @param {number} zoom - Facteur de zoom (Z)
 * @param {number} theta - Angle d'approche oblique (en radians)
 * @param {number} L - Ratio de longueur du ruban (W / H)
 * @param {number} H - Hauteur du canvas en pixels
 * @returns {Object} Coordonnée complexe {re, im}
 */
export function pixelToComplexExp(
  x,
  y,
  c,
  A = 1.0,
  zoom = 1000.0,
  theta = 0.0,
  L = 8,
  H = 200,
) {
  const W = H * L;

  // Échelles min et max en domaine logarithmique
  const logA = Math.log(A);
  const logB = Math.log(A / zoom);

  // u(x) décroît linéairement de log(A) à log(B)
  const u = logA + (x / W) * (logB - logA);

  // Pour garantir la conformité locale (pixels carrés) :
  // dv/dy doit valoir du/dx * (W / H)
  const dv_dy = (logB - logA) / L;
  const v = theta + ((y - H / 2) / H) * dv_dy;

  // Transformation holomorphe z = c + exp(u + i*v)
  const r = Math.exp(u);

  return {
    re: c.re + r * Math.cos(v),
    im: c.im + r * Math.sin(v),
  };
}

// Génère la matrice complète z0 Matrix pour Zoonorama Holomorphe
export function zoonoramaExpProj(
  c,
  A = 1.0,
  zoom = 1000.0,
  theta = Math.PI / 4,
  L = 8,
  H = 200,
) {
  const W = H * L;
  const z0Matrix = new Array(H);

  for (let y = 0; y < H; y++) {
    z0Matrix[y] = new Array(W);
    for (let x = 0; x < W; x++) {
      z0Matrix[y][x] = pixelToComplexExp(x, y, c, A, zoom, theta, L, H);
    }
  }

  return z0Matrix;
}

//Dessine un reticule de ciblage sur le point cible c.
export function drawTarget(ctx, W, H) {
  const cx = W; // Le point c se trouve au bord droit extrême
  const cy = H / 2;
  ctx.save();
  ctx.strokeStyle = "#ff0055";
  ctx.lineWidth = 1.5;
  // Lignes de visée
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy);
  ctx.lineTo(cx + 15, cy);
  ctx.moveTo(cx, cy - 15);
  ctx.lineTo(cx, cy + 15);
  ctx.stroke();
  // Cercle de cible
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 6, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

/**
 * Calcule la distance au bord du Mandelbrot exprimée DIRECTEMENT EN PIXELS.
 * Élimine l'aliasing dû à la variation d'échelle exponentielle.
 */
export function calcPixelDEM(z, cDeep, zoom, W, maxIter = 500) {
  let zx = z.re,
    zy = z.im;
  let dzx = 1.0,
    dzy = 0.0;
  let iter = 0;
  //Boucle
  while (zx * zx + zy * zy < 10000.0 && iter < maxIter) {
    // Dérivée z' = 2 * z * z' + 1
    const new_dzx = 2.0 * (zx * dzx - zy * dzy) + 1.0;
    dzy = 2.0 * (zx * dzy + zy * dzx);
    dzx = new_dzx;
    // z = z^2 + c
    const new_zx = zx * zx - zy * zy + z.re;
    zy = 2.0 * zx * zy + z.im;
    zx = new_zx;
    iter++;
  }
  if (iter === maxIter) return 0; // Intérieur de l'ensemble
  const r = Math.sqrt(zx * zx + zy * zy);
  const dr = Math.sqrt(dzx * dzx + dzy * dzy);
  // Distance complexe brute
  const distComplex = (2.0 * r * Math.log(r)) / dr;
  // Taille du pixel local dans le plan complexe
  const distToC = Math.hypot(z.re - cDeep.re, z.im - cDeep.im);
  const pixelSize = (distToC * Math.log(zoom)) / W;
  // Distance convertie en nombre de pixels écran
  return distComplex / pixelSize;
}

/**
 * Alloue la matrice H x W et calcule le DEM exprimé en pixels pour chaque point.
 *
 * @param {Array<Array<{re: number, im: number}>>} z0Matrix - Matrice des coordonnées
 * @param {Object} cDeep - Point cible profond {re, im}
 * @param {number} zoom - Facteur de zoom (Z)
 * @param {number} maxIter - Nombre maximal d'itérations
 * @returns {Array<Array<number>>} Matrice H x W contenant la distance en pixels
 */
export function calcMatrixPixelDEM(z0Matrix, cDeep, zoom, maxIter = 500) {
  const H = z0Matrix.length;
  const W = z0Matrix[0].length;
  // 1. Allocation dynamique de la matrice [H][W]
  const demMatrix = new Array(H);
  for (let y = 0; y < H; y++) {
    demMatrix[y] = new Array(W);
    for (let x = 0; x < W; x++) {
      const z = z0Matrix[y][x];
      // Calcul et stockage directement dans la matrice
      demMatrix[y][x] = calcPixelDEM(z, cDeep, zoom, W, maxIter);
    }
  }

  return demMatrix;
}

//Convertit une matrice DEM (en pixels) directement en ImageData pour le Canvas.
export function DemPixToImage(demMatrix, ctx) {
  const H = demMatrix.length;
  const W = demMatrix[0].length;
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;
  const distCrit = 30;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const distPx = demMatrix[y][x];
      const idx = (y * W + x) * 4;

      if (distPx <= 0.2) {
        data[idx] = 0; // black
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      } else if (distPx < distCrit) {
        let col = Math.floor(255 * (1 - distPx / distCrit));
        data[idx] = col * 0.7; // white to black
        data[idx + 1] = col * 0.7;
        data[idx + 2] = col;
        data[idx + 3] = 255;
      } else {
        const val = Math.sin(50 * (distPx - distCrit));
        data[idx] = Math.floor(val * 0.1); // black to
        data[idx + 1] = val;
        data[idx + 2] = Math.floor(val * 0.9);
        data[idx + 3] = 255;
      }
    }
  }

  return imgData;
}
