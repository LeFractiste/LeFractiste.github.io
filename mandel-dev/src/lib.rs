use wasm_bindgen::prelude::*;

// Code Rust: moteur de calcul profond, et moteur de rendu graphique

// TODO 1: directIter(zList, maxIter, rsParam) et DEM(zList, rsParam)

// Taille du buffer par pixel (5 valeurs de type f32)
const PAYLOAD_SIZE: usize = 5;

// Table Look-Up (LUT) précalculée pour l'angle (256 entrées)
lazy_static::lazy_static! {
    static ref ANGLE_LUT: [u8; 256] = {
        let mut lut = [0u8; 256];
        // Remplissage rapide 0..255 reprenant atan2(y, x) - TODO 1: atan !
        for i in 0..256 {
            lut[i] = i as u8;
        }
        lut
    };
}

#[wasm_bindgen]
pub struct MandelEngine {
    width: usize,
    height: usize,
    buffer: Vec<f32>,
}

// TODO: risqué: trois usages du mot MandelEngine, et new ne suit pas l'interface
// TODO 1: maxiter est envoyé par js -> envoyer params à engine (et sortir la taille d'image de cFractParams ?)

#[wasm_bindgen]
impl MandelEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> MandelEngine {
        let buffer_size = width * height * PAYLOAD_SIZE;
        MandelEngine {
            width,
            height,
            buffer: vec![0.0; buffer_size],
        }
    }
    
    // Pointeur brut transmis directement au JS sans copie mémoire
    pub fn buffer_ptr(&self) -> *const f32 {
        self.buffer.as_ptr()
    }

    // Calcul du moteur lourd DEM (R2max = 100 000)
    // Moteur de calcul lourd - mode de calcul dans fract_core.js::cFractparams
    // TODO 1: Jef: ce n'est pas DEM. Nous avons besoin de plusieurs modes de calcul (Mandel, Julia, Direct/DEM) selon le contenu de cFractparams
    // TODO 2 : ne doit-on pas précalculer atan dans lazy et aller le rechercher (plus tard).
    pub fn compute_full(
        &mut self,
        center_re: f64,
        center_im: f64,
        span_re: f64,
        span_im: f64,
        max_iter: u32,
        r2_max: f64,
    ) {
        let pixel_size_re = span_re / (self.width as f64);
        let pixel_size_im = span_im / (self.height as f64);

        for py in 0..self.height {
            let c_im = center_im + (py as f64 - (self.height as f64) / 2.0) * pixel_size_im;
            for px in 0..self.width {
                let c_re = center_re + (px as f64 - (self.width as f64) / 2.0) * pixel_size_re;

                // --- Boucle d'itération Mandelbrot ---
                let mut z_re = 0.0f64;
                let mut z_im = 0.0f64;
                let mut iter = 0u32;
                let mut r2 = 0.0f64;

                while iter < max_iter && r2 < r2_max {
                    let z_re2 = z_re * z_re;
                    let z_im2 = z_im * z_im;
                    z_im = 2.0 * z_re * z_im + c_im;
                    z_re = z_re2 - z_im2 + c_re;
                    r2 = z_re * z_re + z_im * z_im;
                    iter += 1;
                }

                // Index d'écriture dans le buffer plat
                let idx = (py * self.width + px) * PAYLOAD_SIZE;

                if iter < max_iter {
                    // Calcul de la valeur lissée (Continuous Potential)
                    let log_zn = (r2.ln() / 2.0).ln();
                    let nu = (log_zn / std::f64::consts::LN_2).ln() / std::f64::consts::LN_2;
                    let smooth_iter = (iter as f64) + 1.0 - nu;

                    // Angle via approximation / LUT
                    let angle_val = (z_im.atan2(z_re) + std::f64::consts::PI) / (2.0 * std::f64::consts::PI) * 255.0;

                    self.buffer[idx] = iter as f32;
                    self.buffer[idx + 1] = smooth_iter as f32;
                    self.buffer[idx + 2] = z_re as f32;
                    self.buffer[idx + 3] = z_im as f32;
                    self.buffer[idx + 4] = angle_val as f32;
                } else {
                    // Intérieur de l'ensemble (Cœur noir)
                    self.buffer[idx] = max_iter as f32;
                    self.buffer[idx + 1] = max_iter as f32;
                    self.buffer[idx + 2] = 0.0;
                    self.buffer[idx + 3] = 0.0;
                    self.buffer[idx + 4] = 0.0;
                }
            }
        }
    }

    // Calcul du moteur lourd DEM générique Julia-Mandelbrot
    // Retourne la distance dans le buffer[5]
    pub fn compute_generic(
        &mut self,
        is_julia: bool,
        julia_c_re: f64, julia_c_im: f64,
        center_re: f64, center_im: f64,
        span_re: f64, span_im: f64,
        max_iter: u32, r2_max: f64,
        calc_mode: u32, // 0 = Direct, 1 = DEM
    ) {
        let delta_der = if is_julia { 0.0 } else { 1.0 }; // Seule différence du DEM !

        for py in 0..self.height {
            for px in 0..self.width {
                // Coordonnée complexe du pixel (x, y)
                let point_c_re = center_re + (px as f64 / self.width as f64 - 0.5) * span_re;
                let point_c_im = center_im - (py as f64 / self.height as f64 - 0.5) * span_im;

                // Initialisation z0 et c selon type de fractale
                let (mut z_re, mut z_im, c_re, c_im) = if is_julia {
                    (point_c_re, point_c_im, julia_c_re, julia_c_im)
                } else {
                    (0.0, 0.0, point_c_re, point_c_im)
                };

                // Dérivée pour DEM : z'0 = (1.0, 0.0) si Julia, (0.0, 0.0) si Mandelbrot
                let (mut dz_re, mut dz_im) = if is_julia { (1.0, 0.0) } else { (0.0, 0.0) };

                let mut iter = 0;
                while iter < max_iter && (z_re * z_re + z_im * z_im) < r2_max {
                    if calc_mode == 1 { // DEM
                        // dz = 2 * z * dz + delta
                        let new_dz_re = 2.0 * (z_re * dz_re - z_im * dz_im) + delta_der;
                        let new_dz_im = 2.0 * (z_re * dz_im + z_im * dz_re);
                        dz_re = new_dz_re;
                        dz_im = new_dz_im;
                    }

                    // z = z^2 + c
                    let new_z_re = z_re * z_re - z_im * z_im + c_re;
                    let new_z_im = 2.0 * z_re * z_im + c_im;
                    z_re = new_z_re;
                    z_im = new_z_im;

                    iter += 1;
                }

                // Calcul de la distance DEM à l'évasion
                let r2 = z_re * z_re + z_im * z_im;
                let dem_dist = if iter < max_iter && calc_mode == 1 {
                    let dz_mod2 = dz_re * dz_re + dz_im * dz_im;
                    if dz_mod2 > 0.0 {
                        0.5 * (r2 / dz_mod2).sqrt() * r2.ln()
                    } else { 0.0 }
                } else { 0.0 };  //cryptic returns to dem_dist !

                // Stockage dans le payload Wasm (5 floats)
                let idx = (py * self.width + px) * 5;
                self.buffer[idx]     = iter as f32;
                self.buffer[idx + 1] = iter as f32; // Smooth iter à ajouter au besoin
                self.buffer[idx + 2] = z_re as f32;
                self.buffer[idx + 3] = z_im as f32;
                self.buffer[idx + 4] = dem_dist as f32;
            }
        }
    }

    // Extrait la sous-suite d'itérations d'un point c(x, y)
    /// Renvoie une chaîne de caractères au format CSV : "iter,zx,zy,modulus\n"
    pub fn compute_orbit_csv(&self, cx: f64, cy: f64, max_iter: u32) -> String {
        let mut csv = String::from("iter\tzx\tzy\tmodulus\n");
        let mut zx : f64 = 0.0;  //calcul en f64 - sinon bug compilateur
        let mut zy : f64 = 0.0;

        //TODO 1: il faudrait repasser params à engine, afin d'aller rechercher max_iter (ajouté manuellement)
        //TODO 2: séparer le calcul et le rendu en string ?
        for i in 0..max_iter {
            let r2 : f64 = zx * zx + zy * zy;
            csv.push_str(&format!("{}\t{:.6}\t{:.6}\t{:.6}\n", i, zx, zy, r2.sqrt()));

            if r2 > 100.0 {  //TODO 3: R2max à récupérer ?
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

