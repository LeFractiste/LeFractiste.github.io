/* fract_core: Classes pour gérer les paramètres de la fractale et de son image */

// Paramètres de la fractale
export class cFractParam {
  constructor() {
    // Cadrage plan complexe
    this.center = { re: -0.7, im: 0.0 };
    this.span = { re: 3.0, im: 3.0 }; // Largeur / Hauteur dans C

    // Paramètres de l'ensemble
    this.c_param = { re: -0.4, im: 0.6 }; // Utile pour Julia (ou point cliqué)
    this.max_iter = 250;
    this.r2_max = 100000.0; // Dynamic escape radius (smooth shading / DEM)

    // Dimensions d'affichage cibles (en pixels)
    this.width = 800;
    this.height = 800;
  }

  // Copie de sécurité pour éviter les mutations involontaires
  clone() {
    const copy = new cFractParam();
    Object.assign(copy, JSON.parse(JSON.stringify(this)));
    return copy;
  }

  // Taille d'un pixel dans le plan complexe (crucial pour le DEM Rust)
  get pixelSize() {
    return this.span.re / this.width;
  }
}

//Paramètres de l'image: buffer de calcul et canvas html de rendu
export class cFractImage {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");

    // Paramètres associés à ce buffer
    this.params = new cFractParam();

    // Buffers plats issus du Wasm
    // Structure par pixel : [iter (u32), smooth_iter (f32), final_re (f32), final_im (f32), angle_idx (u8)]
    this.rawBuffer = null;
    this.imageData = null; // ImageData 2D pour le canvas
  }

  // Initialise l'ImageData à la taille du canvas
  allocateBuffer(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.params.width = width;
    this.params.height = height;
    this.imageData = this.ctx.createImageData(width, height);
  }

  // Extraction directe de la valeur de C depuis des coordonnées pixel (Pre-Transformer basique)
  pixelToComplex(px, py) {
    const re =
      this.params.center.re +
      (px - this.params.width / 2) * (this.params.span.re / this.params.width);
    const im =
      this.params.center.im -
      (py - this.params.height / 2) *
        (this.params.span.im / this.params.height);
    return { re, im };
  }
}
