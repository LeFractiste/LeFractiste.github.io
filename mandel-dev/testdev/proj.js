// Calcul de projections depuis les pixels d'écran vers le plan complexe et retour

let z0Matrix;
/**
 * Calcule la grille de coordonnées complexes z0 pour la bande Zoonorama.
 * H = 200 (hauteur), L = nombre de blocs de 200px de large (ex: L=8 -> W=1600)
 */
export function ZonoramaProj(c, A = 0.02, zoom = 8, L = 8, H = 200) {
  const W = Math.floor(H * L);
  const p = Math.log2(zoom);
  const B = A / Math.pow(2, p);
  // Initialisation du tableau [H][W]
  z0Matrix = Array.from({ length: H }, () => new Array(W));
  // BOUCLE EXTERNE : xPx (Colonnes)
  for (let xPx = 0; xPx < W; xPx++) {
    const u = xPx / W; //0 à 1
    // t(x) et xOffset calculés 1 SEULE FOIS par colonne !
    const t = A * Math.pow(B / A, u); // A à B, taille du pixel
    const xOffset = (u - 0.5) * t; // -0.5 A à 0.5 B
    const z_re = c.re + xOffset;
    // BOUCLE INTERNE : yPx (Lignes)
    for (let yPx = 0; yPx < H; yPx++) {
      const yNorm = (H / 2 - yPx) / H; // -0.5 à 0.5
      const z_im = c.im + yNorm * t; // * taille du pixel
      z0Matrix[yPx][xPx] = { re: z_re, im: z_im };
    }
  }
  return z0Matrix;
}
/**
 * Applique l'algorithme Distance Estimator Method (DEM) sur la matrice des z0.
 */
export function CalcMatrixDEM(z0Matrix, maxIter = 500) {
  const H = z0Matrix.length;
  const W = z0Matrix[0].length;
  const demMatrix = new Array(H);

  for (let y = 0; y < H; y++) {
    demMatrix[y] = new Float64Array(W);

    for (let x = 0; x < W; x++) {
      const z0 = z0Matrix[y][x];
      let zr = z0.re;
      let zi = z0.im;

      // Dérivée dz/dc initialisée à 1
      let dzr = 1.0;
      let dzi = 0.0;

      let iter = 0;
      let r2 = zr * zr + zi * zi;

      while (r2 <= 10000.0 && iter < maxIter) {
        // dz = 2 * z * dz + 1
        const new_dzr = 2.0 * (zr * dzr - zi * dzi) + 1.0;
        dzi = 2.0 * (zr * dzi + zi * dzr);
        dzr = new_dzr;

        // z = z^2 + z0
        const new_zr = zr * zr - zi * zi + z0.re;
        zi = 2.0 * zr * zi + z0.im;
        zr = new_zr;

        r2 = zr * zr + zi * zi;
        iter++;
      }

      if (iter === maxIter) {
        demMatrix[y][x] = 0.0; // Intérieur de l'ensemble (lac)
      } else {
        const r = Math.sqrt(r2);
        const dr = Math.sqrt(dzr * dzr + dzi * dzi);
        // Formule de Peitgen & Saupe pour la distance : 2 * |z| * ln|z| / |dz|
        demMatrix[y][x] = (2.0 * r * Math.log(r)) / dr;
      }
    }
  }

  return demMatrix;
}

/**
 * Convertit la matrice de distances DEM en un ImageData prêt à être affiché dans le Canvas.
 */
export function distToImage(demMatrix, ctx) {
  const H = demMatrix.length;
  const W = demMatrix[0].length;
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dist = demMatrix[y][x];
      const pixelIdx = (y * W + x) * 4;

      if (dist === 0.0) {
        // Intérieur : Noir
        data[pixelIdx] = 0;
        data[pixelIdx + 1] = 0;
        data[pixelIdx + 2] = 0;
        data[pixelIdx + 3] = 255;
      } else {
        // Normalisation logarithmique pour le rendu de la distance
        const val = Math.sin(Math.log(dist) * 2.0);
        const intensity = Math.floor((val + 1.0) * 127.5);

        data[pixelIdx] = intensity; // R
        data[pixelIdx + 1] = Math.floor(intensity * 0.8); // G
        data[pixelIdx + 2] = 255 - intensity; // B
        data[pixelIdx + 3] = 255; // Alpha
      }
    }
  }

  return imgData;
}
