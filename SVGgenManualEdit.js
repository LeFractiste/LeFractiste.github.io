"use strict";
// Support de l'interface de SVGserver (Index.html: toutes nommées ainsi !)
// Utilise la lib de génération: SVG SVGgenerator.js :
const http = require("http"); // ou import http from 'http'
const url = require("url");

// Mots par défaut au chargement
const defaultData = "cycle, This, is Fun";

// Initialisation des champs au chargement de la page
const server = http.createServer((req, res) => {
  // 1. Analyse de l'URL pour extraire les paramètres (ex: ?data=cycle,One,Two,Three)
  const parsedUrl = url.parse(req.url, true);
  const rawData = parsedUrl.query.data || defaultData;

  // 2. Découpage du texte : "cycle,One,Two,Three"
  const parts = rawData.split(",").map((s) => s.trim());
  const shape = parts[0] || "cycle";
  const myWords = parts.slice(1);

  // 3. Génération du SVG
  const svgContent = SVGgen(shape, ...myWords);

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

// Initialisation de page (variable)
window.addEventListener("DOMContentLoaded", () => {
  myWords.forEach((word) => addTextBox(word));
});

// Ajouter une boîte de texte
function addTextBox(value = "") {
  const container = document.getElementById("text-boxes-container");

  const row = document.createElement("div");
  row.className = "input-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "arg-input";
  input.value = value;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn-remove";
  removeBtn.textContent = "✕";
  removeBtn.onclick = () => row.remove(); // supprimer la boîte

  row.appendChild(input);
  row.appendChild(removeBtn);
  container.appendChild(row);
}

// Récupérer les valeurs et appeler SVGgen
function generateSVG() {
  const shape = document.getElementById("shape-select").value;
  const inputs = document.querySelectorAll(".arg-input");
  const debugConsole = document.getElementById("debug-console");

  // Extraction de toutes les valeurs saisies
  const args = Array.from(inputs).map((input) => input.value);

  // Affichage dans la console de validation
  debugConsole.textContent =
    "genSVG('" +
    shape +
    "', " +
    args.map((arg) => "'" + arg + "'").join(", ") +
    ")";

  // Vérification que la fonction externe existe bien et affichage
  if (typeof SVGgen === "function") {
    // SVGgen('cycle', 'This', 'is', 'Fun', ...)
    const svgResult = SVGgen(shape, ...args);
    displaySVG(svgResult, debugConsole);
  } else {
    alert("La fonction SVGgen() n'est pas définie dans ce contexte !");
  }

  // Mise à jour de l'url affichée dans la barre d'adresse du navigateur
  const newUrl =
    `${window.location.origin}${window.location.pathname}` +
    `?data=${shape},${args.join(",")}`;
  window.history.replaceState(null, "", newUrl);
}

// Injection propre du SVG généré par SVGgen
function displaySVG(svgData, debugConsole) {
  const outputDiv = document.getElementById("svg-output");
  outputDiv.innerHTML = ""; // Nettoyage de la zone

  if (svgData instanceof Node) {
    // Si SVGgen renvoie un objet DOM (ex: Document, Element XML/SVG)
    outputDiv.appendChild(svgData);
  } else if (typeof svgData === "string") {
    // Si SVGgen renvoie une chaîne texte <svg>...</svg>
    outputDiv.innerHTML = svgData;
    debugConsole.textContent += "=" + svgData;
  } else {
    outputDiv.textContent = "Format de retour SVG inconnu.";
  }
}
