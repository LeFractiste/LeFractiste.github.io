// myCodingRules.md - V0.6 - Copyright LeFractste 2026 // Specification for code generation with LLM's.

// @todo 2: peut-on avoir la config de vscode pour le code

# GENERAL RULES

Coding: ts, js, wasm.rs, gs (and vba.xlam on another project) Languages: English (even if the start was in French --> move to English) Names: lowercase files, camelCase variables, PascalCase classes, UPPERCASE constants Layout: use eslint, prettier, and other linters to enforce rules

## Rules for files

Layout: vertical condensing ! No empty line in a block. 15-20 lines per code-block if possible Files: 50 to 150 lines of code - refactoring, specializing... when more Doc: ajouter en début de fichier la liste des fonctions/classes définies Interface: import the fractType.ts interface file - as a way to ensure compatibility with legacy code Region: utiliser // #region SUJET (un/deux mots) pour structurer le code en morceaux (exmaples: INTERFACE, EVENTS, COMPUTE, PARAMS, RENDERING, ...) Todo: use // @TODO p: description, p=0,1,2 for priority of tasks

//Infos//

- Mandel V4 --> V5: refactoring difficile et ambitieux ! (3-4 fichiers.js --> 10 sous-classes.ts)
- Code Mandel-dev (V4.9.36): Je corrige les 100+ éléments à la main... (tentative: compile à 95-100%, mais bug_import "dur"). Non pushé encore. // Questions //

## Rules for coding blocks

Classes {

- Always a single line //description
- Constructor first }

## Rules for functions or coding blocks

// Example of VBA inspired Debug pseudo-class T const T { trace(source, arguments =""), assert(condition, msg ="assert"), //active error eq(varA : any, varB: any, msg="assertEq", source=""), //active warn warn(msg, source = ""), error(msg, source=""), UserMsgAbort(msg, source=""), } jsFunctions() {

- Code length: if possible 20 lines max per function
- //description before (single line = one main function)
- No empty line in a function, never
- Indentation: 2 spaces, no tabs
- Parameters: 1, 2 or 3 is nice.
- No side effect for functions. Use member of an object instead.
- No global variables, excepted on demand
- Static variable authorized in scope
- Last line: final return output; welcome. } testClass //to upgrade and exploit f, inp, out, testModule, testCase, log testCase(function, input, output, ErrMsg), bugCase(function, input, output, successMsg) run(testModule, testCase=all) codeGen //to upgrade and exploit genTest genCallerIF genHtmlIF Infrastructure (interfaces, ts, vs-code, LLM)
  - Pour aider le refactoring avec LLM, créer des déclarations d'interface en ts
  - Pour stabiliser / architecturer le code généré, créer des spécifications
  - Processus: concept, spécification, test code1, (code2...), +tests --> rev majeure
  - VS-code: règler l'installation (bugs: intellisense + chat + tasks.json + prettier/linter)
