use wasm_bindgen::prelude::*;

// L'annotation #[wasm_bindgen] rend la fonction appelable depuis JavaScript
#[wasm_bindgen]
pub fn mandelbrot_iter(cx: f64, cy: f64, max_iter: u32) -> u32 {
    let mut zx = 0.0;
    let mut zy = 0.0;
    let mut i = 0;

    while (zx * zx + zy * zy <= 4.0) && (i < max_iter) {
        let tmp = zx * zx - zy * zy + cx;
        zy = 2.0 * zx * zy + cy;
        zx = tmp;
        i += 1;
    }

    i // Retourne le nombre d'itérations atteintes
}