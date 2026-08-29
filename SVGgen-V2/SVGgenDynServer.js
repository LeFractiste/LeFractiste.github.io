// #untested - Code serveur de fichier (doit tourner sur un server Node.js)
// Code exemple, non utilisé dans le projet final.

// Librairies de Node.js (sur serveur, pas dans le navigateur)
const http = require("http"); // ou import http from 'http'
const url = require("url");

// Eléments de l'application exemple
const defaultData = "cycle, This, is Fun";
let rawData; //lecture de l'url
let svgContent; //le SVG généré

// Initialisation des champs au chargement de la page
const server = http.createServer((req, res) => {
  // 1. Analyse de l'URL pour extraire les paramètres (ex: ?data=cycle,One,Two,Three)
  const parsedUrl = url.parse(req.url, true);
  const rawData = parsedUrl.query.data || defaultData;

  //debugConsole.textContent =

  // 2. Découpage du texte : "cycle,One,Two,Three"
  const parts = rawData.split(",").map((s) => s.trim());
  const shape = parts[0] || "cycle";
  const myWords = parts.slice(1);

  // 3. Génération du SVG
  svgContent = SVGgen(shape, ...myWords);

  // 4. Étape (2) : Réponse HTTP avec les bons en-têtes (CORS + type de contenu SVG)
  res.writeHead(200, {
    "Content-Type": "image/svg+xml", // Indique au navigateur que c'est une image SVG
    "Access-Control-Allow-Origin": "*", // Autorise les requêtes cross-domain (CORS)
  });

  // Envoi du flux SVG et fermeture de la connexion
  res.end(svgContent);
});

// Le serveur écoute sur le port 3000
server.listen(3000, () => {
  console.log(
    "Serveur SVG démarré sur http://localhost:3000/?data=cycle,One,Two,Three",
  );
});
