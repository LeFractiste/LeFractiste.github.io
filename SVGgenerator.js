"use strict";
// SVGgenerator : generation de code Svg
// code pour page html interactive encore dans graph

// Entrée unique
function SVGgen(type, ...data) {
  switch (type) {
    case "cycle":
      return cycleTemplate(data);
    case "star":
      return starTemplate(data);
    case "tree":
      return treeTemplate(data);
    case "random":
      return testTemplate(data);
    default:
      return `<text x="10" y="20">Type inconnu</text>`;
  }
}

// Fonction test rapide
function TestSVGs() {
  return {
    cycle: SVGgen("cycle", ["Plan", "Com", "Measure", "Do", "Create"]),
    // star: SVGgen("star", ["Invent","Idea","Analyse","Architect","Plan", "Build", "Test", "Improve", "Enjoy!"]),
    // tree: SVGgen("tree", ["Objective","Task1","Task2"])
  };
}

// ----------------- Templates -----------------

// 1. Cycle circulaire
function cycleTemplate(items) {
  let n = items.length;
  let svgWidth = 600,
    svgHeight = 600;
  let centerX = svgWidth / 2,
    centerY = svgHeight / 2;
  let radius = 200;
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

  for (let i = 0; i < n; i++) {
    let angle = ((2 * Math.PI) / n) * i;
    let x = centerX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);
    svg += `<circle cx="${x}" cy="${y}" r="30" fill="#8ecae6" stroke="#023047" stroke-width="2"/>`;
    svg += `<text x="${x - 20}" y="${y + 5}" font-family="Arial" font-size="14" fill="#023047">${items[i]}</text>`;
    // flèche vers le suivant
    let nextX =
      centerX + radius * Math.cos(((2 * Math.PI) / n) * ((i + 1) % n));
    let nextY =
      centerY + radius * Math.sin(((2 * Math.PI) / n) * ((i + 1) % n));
    svg += `<line x1="${x}" y1="${y}" x2="${nextX}" y2="${nextY}" stroke="#023047" stroke-width="2" marker-end="url(#arrow)"/>`;
  }
  svg += markerDef();
  svg += "</svg>";
  return svg;
}

// 2. Étoile
function starTemplate(items) {
  let n = items.length;
  let svgWidth = 600,
    svgHeight = 600;
  let centerX = svgWidth / 2,
    centerY = svgHeight / 2;
  let radius = 200;
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

  for (let i = 0; i < n; i++) {
    let angle = ((2 * Math.PI) / n) * i;
    let x = centerX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);
    // svg += `<circle cx="${x}" cy="${y}" r="30" fill="#8ecae6" stroke="#023047" stroke-width="2"/>`;
    svg += `<text x="${x - 20}" y="${y + 5}" font-family="Arial" font-size="14" fill="#023047">${items[i]}</text>`;
    // flèche depuis le centre
    svg += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#023047" stroke-width="2" marker-end="url(#arrow)"/>`;
  }
  svg += markerDef();
  svg += "</svg>";
  return svg;
}

// 3. Arbre hiérarchique simple
function treeTemplate(items) {
  let svgWidth = 600,
    svgHeight = 600;
  let levelHeight = 100;
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  let nodes = [];
  items.forEach((label, i) => {
    let x = (svgWidth / (items.length + 1)) * (i + 1);
    let y = levelHeight;
    nodes.push({ x, y, label });
  });
  nodes.forEach((n) => {
    svg += `<circle cx="${n.x}" cy="${n.y}" r="30" fill="#ffb703" stroke="#023047" stroke-width="2"/>`;
    svg += `<text x="${n.x - 20}" y="${n.y + 5}" font-family="Arial" font-size="14" fill="#023047">${n.label}</text>`;
  });
  svg += markerDef();
  svg += "</svg>";
  return svg;
}

// 4. Répulsion à partir de positions aléatoires
// TODO 3: il manque la ligne 1 et la géométrie est assez nulle !
function testTemplate(items) {
  let svgWidth = 600,
    svgHeight = 600;
  let centerX = svgWidth / 2,
    centerY = svgHeight / 2,
    radius = 200;
  let nodes = items.map((label, i) => ({
    label,
    x: centerX + Math.random() * radius - radius / 2,
    y: centerY + Math.random() * radius - radius / 2,
  }));
  // répulsion simple
  let kR = 1000,
    kA = 0.01;
  for (let iter = 0; iter < 100; iter++) {
    nodes.forEach((n, i) => {
      let fx = 0,
        fy = 0;
      nodes.forEach((m, j) => {
        if (i !== j) {
          let dx = m.x - n.x;
          let dy = m.y - n.y;
          let d = Math.sqrt(dx * dx + dy * dy) + 0.1;
          fx -= (kR * dx) / (d * d * d);
          fy -= (kR * dy) / (d * d * d);
        }
      });
      // attraction centre
      if (i !== 0) {
        let dx = centerX - n.x;
        let dy = centerY - n.y;
        fx += kA * dx;
        fy += kA * dy;
      }
      n.x += fx * 0.01;
      n.y += fy * 0.01;
    });
  }
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  nodes.forEach((n) => {
    svg += `<circle cx="${n.x}" cy="${n.y}" r="30" fill="#8ecae6" stroke="#023047" stroke-width="2" class="draggable"/>`;
    svg += `<text x="${n.x - 20}" y="${n.y + 5}" font-family="Arial" font-size="14" fill="#023047">${n.label}</text>`;
    if (n !== nodes[0])
      svg += `<line x1="${centerX}" y1="${centerY}" x2="${n.x}" y2="${n.y}" stroke="#023047" stroke-width="2"/>`;
  });
  svg += markerDef();
  svg += "</svg>";
  return svg;
}

// ----------------- Utils -----------------
function markerDef() {
  return `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,10 L10,5 z" fill="#023047" /></marker></defs>`;
}
