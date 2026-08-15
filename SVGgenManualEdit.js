"use strict";
// Support de l'interface de SVGgenStaticServer (Index.html: toutes nommées ainsi !)
// Utilise la lib de génération: SVG SVGgenerator.js :

// Main (entrée du code)
// Mots par défaut au chargement
const defaultData = "cycle, This, is, Fun";
let debugConsole; // élément de page
let rawData; //lecture de l'url
let svgContent; //le SVG généré

// Initialisation de page (variable)
window.addEventListener("DOMContentLoaded", () => {
  try {
    // 1. Analyse de l'URL pour extraire les paramètres (ex: ?data=cycle,One,Two,Three)
    const urlParams = new URLSearchParams(window.location.search);
    rawData = urlParams.get("data") || defaultData; // Récupère "cycle,One,Two,Three"

    // and returns data to user
    debugConsole = document.getElementById("debug-console");
    debugConsole.textContent = "Page called with data=" + rawData;

    // 2. Découpage du texte : "cycle,One,Two,Three"
    const parts = rawData.split(",").map((s) => s.trim());
    const shape = parts[0] || "cycle";
    const myWords = parts.slice(1);

    // Adapte la page pour la forme et ses éléments de texte
    setShape(shape);
    myWords.forEach((word) => addTextBox(word));

    // 3. Génération et affichage du SVG
    svgContent = SVGgen(shape, ...myWords);
    displaySVG(svgContent);
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la page:", error);
    debugConsole.textContent +=
      "\nErreur lors de l'initialisation de la page: " + error.message;
  }
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

// Mettre à jour la sélection
function setShape(value="cycle") {
  const shapeSelect = document.getElementById("shape-select");
  if (shapeSelect) {
    const normalizedShape = String(shape).trim();
    // If the select already has this option, just select it
    const hasOption = Array.from(shapeSelect.options).some(
      (opt) => opt.value === normalizedShape
    );
    if (hasOption) {
      shapeSelect.value = normalizedShape;
    } else {
      // Option not present: take the first from html
      shapeSelect.value = shapeselect.options(0);
    }
  }
}

// OnClick: Récupérer les valeurs et appeler SVGgen
function btn_generateSVG() {
  const shape = document.getElementById("shape-select").value;
  const inputs = document.querySelectorAll(".arg-input");

  // Extraction de toutes les valeurs saisies
  const args = Array.from(inputs).map((input) => input.value);

  // Vérification que la fonction externe existe bien et affichage
  if (typeof SVGgen === "function") {
    // SVGgen('cycle', 'This', 'is', 'Fun', ...)
    svgContent = SVGgen(shape, ...args);
    displaySVG(svgContent);
    // Affichage dans la console de validation, sous forme de 'mots'
    debugConsole.textContent = `genSVG('${shape}', ${args.map((arg) => "'" + arg + "'").join(", ")}) = \n`;
    debugConsole.textContent += svgContent;
  } else {
    alert("La fonction SVGgen() n'est pas définie dans ce contexte !");
  }

  // Mise à jour de l'url affichée dans la barre d'adresse du navigateur
  //avec nettoyage du texte des argumentspour usage en URL
  const params = new URLSearchParams();
  params.set("data", `${shape},${args.join(",")}`);
  const newUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", newUrl);
}

// Injection propre du SVG généré par SVGgen
function displaySVG(svgData) {
  const outputDiv = document.getElementById("svg-output");
  outputDiv.innerHTML = ""; // Nettoyage de la zone

  if (svgData instanceof Node) {
    // Si SVGgen renvoie un objet DOM (ex: Document, Element XML/SVG)
    outputDiv.appendChild(svgData);
  } else if (typeof svgData === "string") {
    // Si SVGgen renvoie une chaîne texte <svg>...</svg>
    outputDiv.innerHTML = svgData;
  } else {
    outputDiv.textContent = "Format de retour SVG inconnu.";
  }
}
