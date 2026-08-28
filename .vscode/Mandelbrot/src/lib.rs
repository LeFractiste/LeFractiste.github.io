use wasm_bindgen::prelude::*;

// 1. Fonction unitaire pour tester un point (conservée et exportée)
#[wasm_bindgen]
pub fn mandelbrot_iter(cx: f64, cy: f64, max_iter: u32) -> u32 {
    let mut zx = 0.0;
    let mut zy = 0.0;
    let mut zxx = 0.0;
    let mut zyy = 0.0;
    let mut i = 0;

    while (zxx + zyy <= 4.0) && (i < max_iter) {
        zy = 2.0 * zx * zy + cy;
        zx = zxx - zyy + cx;
        zxx = zx * zx;
        zyy = zy * zy;
        i += 1;
    }

    i
}

// 2. Fonction de rendu d'image complète
#[wasm_bindgen]
pub fn render_mandelbrot(
    width: u32,
    height: u32,
    xmin: f64,
    xmax: f64,
    ymin: f64,
    ymax: f64,
    max_iter: u32,
) -> Vec<u8> {
    let mut buffer = vec![0u8; (width * height * 4) as usize];

    for py in 0..height {
        let cy = ymin + (py as f64 / height as f64) * (ymax - ymin);
        for px in 0..width {
            let cx = xmin + (px as f64 / width as f64) * (xmax - xmin);

            let mut zx = 0.0;
            let mut zy = 0.0;
            let mut zxx = 0.0;
            let mut zyy = 0.0;
            let mut i = 0;

            while (zxx + zyy <= 4.0) && (i < max_iter) {
                zy = 2.0 * zx * zy + cy;
                zx = zxx - zyy + cx;
                zxx = zx * zx;
                zyy = zy * zy;
                i += 1;
            }

            let idx = ((py * width + px) * 4) as usize;
            let val = if i == max_iter { 0 } else { ((i * 12) % 255) as u8 };

            buffer[idx] = val;             // R
            buffer[idx + 1] = val / 2;     // G
            buffer[idx + 2] = 255 - val;   // B
            buffer[idx + 3] = 255;         // Alpha
        }
    }

    buffer
}