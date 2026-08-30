use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct MandelEngine {
    width: u32,
    height: u32,
    max_iter: u32,
}

#[wasm_bindgen]
impl MandelEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32, max_iter: u32) -> MandelEngine {
        MandelEngine { width, height, max_iter }
    }

    /// Rendu de la fractale avec Distance Estimator Method (DEM)
    /// Remplit un buffer RGBA (4 octets par pixel)
    pub fn render_dem(
        &self,
        xmin: f64,
        xmax: f64,
        ymin: f64,
        ymax: f64,
        output_buf: &mut [u8],
    ) {
        let w = self.width as usize;
        let h = self.height as usize;

        for py in 0..h {
            let cy = ymin + (py as f64 / self.height as f64) * (ymax - ymin);
            for px in 0..w {
                let cx = xmin + (px as f64 / self.width as f64) * (xmax - xmin);

                // Variables de calcul
                let mut zx = 0.0;
                let mut zy = 0.0;
                let mut dzx = 0.0; // Dérivée z'x
                let mut dzy = 0.0; // Dérivée z'y
                
                let mut iter = 0;
                let mut escaped = false;

                while iter < self.max_iter {
                    let zx2 = zx * zx;
                    let zy2 = zy * zy;

                    if zx2 + zy2 > 10000.0 { // Évasion
                        escaped = true;
                        break;
                    }

                    // Calcul de la dérivée : z' = 2 * z * z' + 1
                    let new_dzx = 2.0 * (zx * dzx - zy * dzy) + 1.0;
                    let new_dzy = 2.0 * (zx * dzy + zy * dzx);
                    dzx = new_dzx;
                    dzy = new_dzy;

                    // z = z^2 + c
                    let new_zx = zx2 - zy2 + cx;
                    zy = 2.0 * zx * zy + cy;
                    zx = new_zx;

                    iter += 1;
                }

                let idx = (py * w + px) * 4;

                if !escaped {
                    // Intérieur de Mandelbrot : Noir
                    output_buf[idx] = 0;
                    output_buf[idx + 1] = 0;
                    output_buf[idx + 2] = 0;
                    output_buf[idx + 3] = 255;
                } else {
                    // Calcul de la distance d = 2 * |z| * log(|z|) / |z'|
                    let r2 = zx * zx + zy * zy;
                    let r = r2.sqrt();
                    let dr = (dzx * dzx + dzy * dzy).sqrt();
                    let dist = 2.0 * r * r.ln() / dr;

                    // Coloration basée sur la distance (DEM) pour dessiner les contours très fins
                    let intensity = ((dist * 500.0).clamp(0.0, 1.0) * 255.0) as u8;

                    output_buf[idx] = intensity;
                    output_buf[idx + 1] = (intensity as f32 * 0.8) as u8;
                    output_buf[idx + 2] = 255 - intensity;
                    output_buf[idx + 3] = 255;
                }
            }
        }
    }

    /// Rendu d'un ensemble de Julia J_c pour un c_fixed fixe avec DEM
    pub fn render_julia_dem(
        &self,
        cx_fixed: f64,
        cy_fixed: f64,
        xmin: f64,
        xmax: f64,
        ymin: f64,
        ymax: f64,
        output_buf: &mut [u8],
    ) {
        let w = self.width as usize;
        let h = self.height as usize;

        for py in 0..h {
            let zy_init = ymin + (py as f64 / self.height as f64) * (ymax - ymin);
            for px in 0..w {
                let zx_init = xmin + (px as f64 / self.width as f64) * (xmax - xmin);

                let mut zx = zx_init;
                let mut zy = zy_init;
                
                // Pour Julia, z'0 = 1.0
                let mut dzx = 1.0;
                let mut dzy = 0.0;

                let mut iter = 0;
                let mut escaped = false;

                while iter < self.max_iter {
                    let zx2 = zx * zx;
                    let zy2 = zy * zy;

                    if zx2 + zy2 > 10000.0 {
                        escaped = true;
                        break;
                    }

                    // z' = 2 * z * z'
                    let new_dzx = 2.0 * (zx * dzx - zy * dzy);
                    let new_dzy = 2.0 * (zx * dzy + zy * dzx);
                    dzx = new_dzx;
                    dzy = new_dzy;

                    // z = z^2 + c_fixed
                    let new_zx = zx2 - zy2 + cx_fixed;
                    zy = 2.0 * zx * zy + cy_fixed;
                    zx = new_zx;

                    iter += 1;
                }

                let idx = (py * w + px) * 4;
                if !escaped {
                    output_buf[idx] = 0;
                    output_buf[idx + 1] = 0;
                    output_buf[idx + 2] = 0;
                    output_buf[idx + 3] = 255;
                } else {
                    let r2 = zx * zx + zy * zy;
                    let r = r2.sqrt();
                    let dr = (dzx * dzx + dzy * dzy).sqrt();
                    let dist = 2.0 * r * r.ln() / dr;

                    let intensity = ((dist * 400.0).clamp(0.0, 1.0) * 255.0) as u8;
                    output_buf[idx] = intensity;
                    output_buf[idx + 1] = intensity;
                    output_buf[idx + 2] = 255 - intensity;
                    output_buf[idx + 3] = 255;
                }
            }
        }
    }
    
    /// Extrait la sous-suite d'itérations d'un point c(x, y)
    /// Renvoie une chaîne de caractères au format CSV : "iter,zx,zy,modulus\n"
    pub fn compute_orbit_csv(&self, cx: f64, cy: f64) -> String {
        let mut csv = String::from("iter\tzx\tzy\tmodulus\n");
        let mut zx : f64 = 0.0;  //calcul en f64 - sinon bug compilateur
        let mut zy : f64 = 0.0;

        for i in 0..self.max_iter {
            let r2 : f64 = zx * zx + zy * zy;
            csv.push_str(&format!("{}\t{:.6}\t{:.6}\t{:.6}\n", i, zx, zy, r2.sqrt()));

            if r2 > 100.0 {
                break;
            }

            let new_zx : f64 = zx * zx - zy * zy + cx;
            let new_zy : f64 = 2.0 * zx * zy + cy;
            zy = new_zy;
            zx = new_zx;
        }

        csv
    }
}