import init, { render_mandelbrot, mandelbrot_iter } from "./pkg/mandelbrot.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

const width = canvas.width;
const height = canvas.height;
let maxIter = 150;

// Bounding box du plan complexe
let xmin = -2.0,
  xmax = 1.0;
let ymin = -1.5,
  ymax = 1.5;

let showOrbit = false;
let currentPoint = { cx: 0, cy: 0 };

async function run() {
  await init();
  info.innerText =
    "Clic gauche: Zoom avant | Molette: Zoom in/out | Clic droit: Activer orbite";

  function render() {
    const t0 = performance.now();

    // 1. Appel du calcul lourd en Rust
    const bytes = render_mandelbrot(
      width,
      height,
      xmin,
      xmax,
      ymin,
      ymax,
      maxIter,
    );
    const imgData = new ImageData(
      new Uint8ClampedArray(bytes.buffer),
      width,
      height,
    );
    ctx.putImageData(imgData, 0, 0);

    const t1 = performance.now();

    // 2. Si le mode orbite est activé, tracer par-dessus
    if (showOrbit) {
      drawOrbit(currentPoint.cx, currentPoint.cy);
    }

    const zoomLevel = (3.0 / (xmax - xmin)).toFixed(1);
    info.innerText = `Zoom: x${zoomLevel} | Rust: ${(t1 - t0).toFixed(2)} ms | Iter max: ${maxIter}`;
  }

  function drawOrbit(cx, cy) {
    ctx.beginPath();
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 1.5;

    let zx = 0.0,
      zy = 0.0,
      i = 0;
    let currPx = ((zx - xmin) / (xmax - xmin)) * width;
    let currPy = ((zy - ymin) / (ymax - ymin)) * height;
    ctx.moveTo(currPx, currPy);

    while (zx * zx + zy * zy <= 4.0 && i < 100) {
      let tmp = zx * zx - zy * zy + cx;
      zy = 2.0 * zx * zy + cy;
      zx = tmp;

      let screenX = ((zx - xmin) / (xmax - xmin)) * width;
      let screenY = ((zy - ymin) / (ymax - ymin)) * height;
      ctx.lineTo(screenX, screenY);
      i++;
    }
    ctx.stroke();

    // Test de validation via la fonction unitaire Rust
    const nRust = mandelbrot_iter(cx, cy, maxIter);
    console.log(
      `Point (${cx.toFixed(4)}, ${cy.toFixed(4)}) -> Itérations Rust: ${nRust}`,
    );
  }

  // --- Interaction : Clic Gauche = Zoom Avant (Center sur clic) ---
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const cx = xmin + (px / width) * (xmax - xmin);
    const cy = ymin + (py / height) * (ymax - ymin);

    // Zoom par 2 centré sur le point cliqué
    const w = (xmax - xmin) / 2;
    const h = (ymax - ymin) / 2;
    xmin = cx - w / 2;
    xmax = cx + w / 2;
    ymin = cy - h / 2;
    ymax = cy + h / 2;

    render();
  });

  // --- Interaction : Clic Droit = Basculer Orbite ---
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Empêche le menu contextuel du navigateur
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    currentPoint.cx = xmin + (px / width) * (xmax - xmin);
    currentPoint.cy = ymin + (py / height) * (ymax - ymin);
    showOrbit = !showOrbit;

    render();
  });

  // --- Interaction : Roulette = Zoom continu ---
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.8 : 1.25;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const cx = xmin + (px / width) * (xmax - xmin);
    const cy = ymin + (py / height) * (ymax - ymin);

    const w = (xmax - xmin) * zoomFactor;
    const h = (ymax - ymin) * zoomFactor;

    xmin = cx - (px / width) * w;
    xmax = xmin + w;
    ymin = cy - (py / height) * h;
    ymax = ymin + h;

    render();
  });

  render();
}

run();
