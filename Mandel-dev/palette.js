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
    };

    this.lut = new Uint8Array(this.params.size * 4); // Lookup Table RGBA
    this.initUI();

    // Mettre à jour la LUT interne SANS déclencher onChange à la construction
    this.generateLut();
  }

  initUI() {
    this.container.innerHTML = `
            <div style="background: #222; padding: 10px; border-radius: 6px; font-family: sans-serif; font-size: 12px; color: #fff;">
                <canvas id="palettePreview" width="256" height="20" style="width: 100%; border: 1px solid #555; border-radius: 3px;"></canvas>
                <div style="display: flex; gap: 10px; margin-top: 8px;">
                    <label>Cycles H: <input type="range" id="palCyclesH" min="0" max="10" step="0.1" value="1"></label>
                    <label>Phase: <input type="range" id="palPhaseH" min="0" max="6.28" step="0.1" value="0"></label>
                </div>
            </div>
        `;

    this.previewCanvas = document.getElementById("palettePreview");
    this.previewCtx = this.previewCanvas.getContext("2d");

    document.getElementById("palCyclesH").addEventListener("input", (e) => {
      this.params.cyclesH = parseFloat(e.target.value);
      this.updatePalette();
    });

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
        (Math.sin(
          2.0 * Math.PI * this.params.cyclesH * t + this.params.phaseH,
        ) *
          0.5 +
          0.5) *
        360;
      const s = 0.85;
      const v = Math.sin(2.0 * Math.PI * this.params.cyclesV * t) * 0.4 + 0.6;

      const [r, g, b] = hsvToRgb(h, s, v);

      this.lut[i * 4] = r;
      this.lut[i * 4 + 1] = g;
      this.lut[i * 4 + 2] = b;
      this.lut[i * 4 + 3] = 255;
    }
    this.drawPreview();
  }

  updatePalette() {
    this.generateLut();
    if (this.onChange) this.onChange(this.lut);
  }

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
