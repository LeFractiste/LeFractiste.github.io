export class PaletteEditor {
  constructor(containerId, onChangeCallback) {
    this.container = document.getElementById(containerId);
    this.onChange = onChangeCallback;
    // Paramètres par défaut de la palette HSV (1024 couleurs)
    this.params = {
      cyclesH: 1.0,
      cyclesS: 0.0,
      cyclesV: 2.0,
      phaseH: 0.0,
      offsetV: 0.5,
      size: 1024,
    }; //TODO 0:semble 256 dans drawPreview
    this.lut = new Uint8Array(this.params.size * 4); // Lookup Table RGBA
    this.initUI();
    // Mettre à jour la LookUpTable (lut) interne SANS déclencher onChange à la construction
    this.generateLut();
  }

  //HTML update and interaction
  initUI() {
    this.container.innerHTML = `
            <div style="background: #222; padding: 10px; border-radius: 6px; font-family: sans-serif; font-size: 12px; color: #fff;">
                <canvas id="palettePreview" width="256" height="5" style="width: 100%; border: 1px solid #555; border-radius: 3px;"></canvas>
                <div style="display: flex; gap: 10px; margin-top: 8px;">
                    <label>Cycles H: <input type="range" id="palCyclesH" min="0" max="10" step="0.1" value="1"></label>
                    <label>Phase: <input type="range" id="palPhaseH" min="0" max="6.28" step="0.1" value="0"></label>
                </div>
            </div>
        `;
    this.previewCanvas = document.getElementById("palettePreview");
    this.previewCtx = this.previewCanvas.getContext("2d");
    //Listen to UI palCycleH
    document.getElementById("palCyclesH").addEventListener("input", (e) => {
      this.params.cyclesH = parseFloat(e.target.value);
      this.updatePalette();
    });
    //Listen to UI palPhaseH
    document.getElementById("palPhaseH").addEventListener("input", (e) => {
      this.params.phaseH = parseFloat(e.target.value);
      this.updatePalette();
    });
  }

  // Génération de la LUT, interpolation sinusoïdales. Appel séparé du callback.
  generateLut() {
    const N = this.params.size;
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const h =
        360 *
        (0.5 +
          0.5 *
            Math.sin(
              2.0 * Math.PI * this.params.cyclesH * t + this.params.phaseH,
            ));
      const s = 0.85;
      const v = 0.6 + 0.4 * Math.sin(2.0 * Math.PI * this.params.cyclesV * t);
      const [r, g, b] = hsvToRgb(h, s, v);
      this.lut[i * 4] = r;
      this.lut[i * 4 + 1] = g;
      this.lut[i * 4 + 2] = b;
      this.lut[i * 4 + 3] = 255;
    }
    this.drawPreview();
  }
  //Update palette: initie le callback(lut)
  updatePalette() {
    this.generateLut();
    if (this.onChange) this.onChange(this.lut);
  }
  //Charge une image dans le canvas (contexte previewCtx)
  drawPreview() {
    const imgData = this.previewCtx.createImageData(256, 1);
    for (let x = 0; x < 256; x++) {
      const lutIdx = Math.floor((x / 256) * this.params.size) * 4;
      imgData.data[x * 4] = this.lut[lutIdx];
      imgData.data[x * 4 + 1] = this.lut[lutIdx + 1];
      imgData.data[x * 4 + 2] = this.lut[lutIdx + 2];
      imgData.data[x * 4 + 3] = 255;
    }
    this.previewCtx.putImageData(imgData, 0, 0);
  }

  // VRAIE MÉTHODE : Échantillonne la LUT à partir d'une valeur t dans [0, 1[
  getColorFromNormalized(t) {
    // Clamping entre 0.0 et 0.9999
    const clampedT = Math.max(0, Math.min(0.9999, t));
    const idx = Math.floor(clampedT * this.params.size) * 4;
    return {
      r: this.lut[idx],
      g: this.lut[idx + 1],
      b: this.lut[idx + 2],
    };
  }

  // VRAIE MÉTHODE : Interroge la LUT selon le nombre d'itérations
  getColor(iter, maxIter = 500) {
    // Intérieur du bulbe M : NOIR
    if (iter >= maxIter) {
      return { r: 0, g: 0, b: 0 };
    }
    // Extérieur : normalisation sur la taille de la LUT
    const t = (iter % maxIter) / maxIter;
    return this.getColorFromNormalized(t);
  }
}

// Fonction utilitaire de conversion HSV -> RGB
function hsvToRgb(h, s, v) {
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}
