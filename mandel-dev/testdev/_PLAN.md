## TODO

- @todo 0: code/refactor : migration ts, galère !
- @todo 1: code/refactor/appDev.js --> ts ! oui, il faut le faire, après diminution AddDev --> cFract functions / events !
- @todo 0: code/refact: migration params, galère\*
- @todo 0: pres/html : génération du html, galère non débuggable ! Revenir en arrière, et générer du code console ?
- @todo 1: code/parent: Utiliser le parent pour accéder à params (pour calc, analysis, input Router, fractDraw, externalRay = tous)
- @todo 2: code/calc: Gérer param.calcMode et implémenter cFractCalc.setMode ?
- @todo 3: Rust/IP - copyright, commenter les fonctions! Archi: params-->calcoptions-->Z0matrix-->ZNmatrix-->imageData
- @todo 3: Rust/vitesse - recalcul des points noirs (iter bouge) - zoom\*2 récup! - taille image (zoom GPU) - quadTree
- @todo 2: calc/Speed - Algorithme de calcul local de Mandelbrot via Julia précalculée (validité de la zone ?)
- @todo 2: pres/Grid - afficher grille + viser des coordonnées "entières" - pixSize = dia / min(W, H) pixSize0=3/600=1/200 zoom 2 ou 2.5
- @todo 2: code/HTML : Mandel utilise html-helper pour faire url<-->params
- @todo 1: UX/AppAménager l'interface de création de Julia ou Mandelbrot. Eliminer type. Constructor(string) ?
- @todo 2: Calc/MaxIter ? Le calculer pour la bonne résolution DEM. Critère: un point "noir" est à une distance/pixel > 2
- @todo 2: UX/extRay: avancer jusqu'au dernier pixel, puis zoomer (x10) et avancer jusqu'au derier pixel.
- @todo 3: UX/data: historique de zoom : push, pop position (&vecteur: dia/rotation)
- @todo 1: UX/html - ajout automatisé de boutons d'interface maxIter & setCalc (interface UX(btnX): html.addBtn(X, onclick): id=btnX, onClickX?)
- @todo 2: code/string : grouper les utils.toString et les cFract.Console dans cFractConsole
- @todo 2: calc/perfo: vitesse de chargement : init bmp pour mandel
- @todo 0: UX/CSS: regrouper les CSS dans un CSS de site ? (harmonie) 50%: couleurs des palettes et boutons
- @todo 1: UX/srv: serveur d'image et url variable. 50%: manque update url (revoir svg)
- @todo 2: UX/cImage - definir l'interface commun à Iter float et Dist/pix (négative ou reuse des Iter petits ? Mais dist0=iter grands !)
- @todo 1\*: UX/PaletteEditor: le respécifier avec nodes et le fAIre. Voir chez Lily.
- @todo 3: Web/SEO : SEO site + copyright + pub Utube \*/

# DONE

# VERSIONS

Spécifications d'idées pour le moteur de Fractales [V1] Rendu de base Mandelbrot/Julia Canvas2D/Wasm - OK [V2] PaletteEditor interactif + export JSON/URL - OK [V3] Moteur d'itération optimisé (AVX2/SIMD via Rust Wasm) - OK [V4] Intégration de V2 et V3 - troisième codeur. [V4-Core] Pipeline d'affichage à 5 champs :

- Jauge Intérieure : Ratio pixels intérieurs / total
- Question de contrôle : "Stabilité du zoom ?"
- État : Vert (Fluide), Orange (Lag), Rouge (Saturation Wasm)
- Action associée : Ajuster Max_Iter / Résolution dynamic
- Mesure : FPS + Temps de calcul Frame (ms) [V4-Zoom] Pre-Transformer & Zoom Continu 2.5D :
- Mappage linéaire Canvas (px) -> Plan Complexe (C_re, C_im)
- Blending bi-buffer : Fondu/Scaler entre FractImage_N et FractImage_N+1
- Rendu progressif multi-passe pendant l'animation [V4-Angle] Sortie d'itération étendue :
- Restitution de l'argument (angle) du point d'échappement via LUT [V5] Graphisme optimisé
- Palette de type Fraqtive, en HSV - helper: gestionnaire graphique drag-n-drop
- Transformer manuel non linéaire
- Zoonorama (transformer adaptatif avancé - moteur polaire)
- Anti-aliasing? Affichage fin des frontières ?
- Modes variables
- Création de grandes images en batch (4000x4000, ou un buffer de 1Go précalculé ?)

Spec en mode structuré (je préfère): prio / titre / description 1 User interface et esthétique - recruter graphiste 1.1 ok Dual View Synchronisée : Affichage côte à côte de la carte Mandelbrot et du Julia dédié au point c survolé. 1.2 ok Overlay d'Analyse d'Orbites : Tracé vectoriel des sous-suites d'itérations 19k+p pour visualiser les géométries de convergence. 1.3 3 Suggestion Automatique POI : Marqueurs visuels sur l'image indiquant les bifurcations, spirales et minibrots détectés. 1.4 1 Pont Export Sheets / CSV : Exportation textuelle des données d'orbites et métriques pour analyse dans Google Sheets. 1.5 2 Pipeline Métriques de Forme : Extraction textuelle des propriétés géométriques (angles, courbures, lambda) sans flux d'images lourds. 1.6 2 Moteur Couleurs HSV / Sinus : Palette de 1024 couleurs interpolées par fonctions trigonométriques dans l'espace HSV (module palette.js). 1.7 2 Sheets : en interaction avec mandel.js et Rust : calculer image et orbite 1.8 ok Affichage de paramètres - coordonnées, itérations, distance, harmoniques ? 1.9 2 Gestion html par cFract (et événements internes: ok). 1.10 2: DataArt grand format - fresque murale sur base de zoonorama. 2. Moteur de calcul - aspects math et de programmation 2.1 1 Calcul Évasion Hte Précision : Moteur d'itération f64 avec bascule vers précision arbitraire. Multi-thred. 2.2 2 Détecteur de points spéciaux - minibrots et points pré-périodiques. Algo de Newton sur P'p(c)=c 2.3 ok Distance Estimator (DEM) : Calcul simultané de z'n pour obtenir la distance exacte aux frontières et tracer les contours fins. 2.4 2 Filtres Phase Cyclique : Coloration continue (NIC) et filtres harmoniques modulo P pour faire apparaître les structures en S. 2.5 3 Quadtree & Interpolation : Subdivision dichotomique évitant de calculer 90% des zones lisses (gain de vitesse x10). 2.6 2 Axe temps - zoom infini ou piloté. Caméraman virtuel. 2.7 2 Compression / streaming d'animation: pré-calcul de trajectoire zoonorama + décompression 2.8 1 Transistion vers du code structuré en ts + refactoring de cFract + objets annexes + analyse 3. Moteur de CALCUL, performance & base de de code 3.1 ok Core Rust / Wasm : Compilation de lib.rs vers mandel.wasm via wasm-pack pour exécution native dans le navigateur. 3.2 ok Canvas Memory Buffer : Transfert direct du buffer d'octets RGBA de Wasm vers Canvas JS via ImageData. 3.3 ok Architecture Multi-Files + git: Découpage modulaire : index.html, app.js, mandel.js/rs, palette.js pour évolutivité mobile/backend. 3.4 2 Zoom GPU Continu : Étirement bilinéaire temps réel sur Canvas avec remplacement asynchrone par le tampon Wasm. 3.5 ok Isolation Multi-Pages N-1/N : Structure multi-dossiers (v1-stable et v2-dev) pour préserver le banc d'essai N-1. 3.6 1 Coding rules pour nous et AIstudio. Tester AIstudio. 3.7 ok Interfaces app-mandel: classe cFract, export unique, avec les membres: constructor(type, canvas), setCentre/getCentre, zoom, resetZoom, CalcFull(), setType(C), setMandel(), set/getCalc=enum(direct, DEM, DEMquad), get/set autoCalc, isDirty, get/set SmoothZoom, setTransform, calcOrbit(z,iter=maxIter) 3.8 ok Zoonorama - FractScape: plongée multizoom. Extension: film de plongée à partir du zoonorama? 4. Présentation: Rendu graphique, couleurs,... 4.1. CSS global pour le site, avec thèmes 4.2. cImage: rendu - couleurs par défaut (bug: initialiser palette sans paletteEditor !) 4.3. Editeur de palette, ou édition direte de couleurs 5. Base de données, popularité du site, visiteurs 5.1. Sauvegarde des paramètres - Zc + zoom, palettes 5.2. Utilisation d'un e-mail caché/protégé 5.3. Recruter un partenaire 5.4. Sauvegarde des données git (attention: git checkout efface mon disque !) robocopy ou 7z 5.5. Publier cFract : package ts/js ou injecter zoonorama à un package standard ?

# PROMPTS

Récrivons palette --> ts ! (c'était un objet indépendant trop spécifique) J'aimerais le programmer moi-même, MAIS je ne connais pas encore assez ts pour faire cette migration... avoir: palette.default pour envoyer qqch à cFract. Architecture: j'aimerais que mandel.cFract soit l'objet central. Il faut gérer des canvas ad-hoc comme Julia, palette pour implémenter une analyse visuelle ou un mode EDIT. Le code "App" pourra appeler paramAny = "Mandelbrot" mandel=new cFract(param) mandel.palette=new paletteEditor (on dissocie palette et paletteEditor, et le foutu "paletteEditor.lut" deviendra mandel.palette ou mandel.pres.palette (palette est un fichier de src/pres) Peux-tu déplacer ce test dans palette, de manière à générer une palette par défaut si aucun canvas palette n'est transmis ? (donc juste générer du code pour générer la palette par défaut. Peut-on d'ailleurs lire/utiliser les couleurs de css:root ? (même si c'est risqué: trop d'interactions complexes pourraient planter le script).
