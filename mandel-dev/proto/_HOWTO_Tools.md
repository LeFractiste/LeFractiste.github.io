# HOW TO NOTES !

# VScode

- launch.json # config de déboguage à la racine du projet
- tasks.json # Raccourcis de tâches de compilation dans VS Code.
- package.json # **???**
- Compare # Selectionner deux fichiers et click-droit compare selected.

# Coding practice

- Vertical slice: modifier le code là où il faut pour amener la fonctionalité, sans faire joli.
- Deux chapeaux: ne jamais faire en même temps de l'ajout de fonctions et du refactoring de code. Sinon, refactoring divergent.
- Mettre au frigo: noter les bonnes idées quelque part, mais ne pas les exécuter de suite !
- Test SmartPhone: npm run dev --> site accessible via http://192.168.x.x:5173

# JavaScript.js

- MD: **formater** un peu mieux
- Utiliser JDoc: // @type cFract déclare ma variable. Autres: @return, @param, @customerFunction. Toujours entre /\*_ REM _/
- Utiliser ou non // @ts-check en début de fichier .js (génère erreurs?)
- Linter (ESLint) - Analyse statique de code, signale les erreurs en rouge dans le code
  - Possibilité d'utiliser eslint-plugin-jsdoc pour détecter la présence de tes tags @myTag
- Formatter (Prettier) : gère le rendu visuel, indentations... Config: .prettierrc
- Version target de TS: ES2022. Version de GoogleAppScript: ES2005?
- Debuggage: utiliser debugger; (stop) ou console.table, console.trace (stack), console.group(structure des messages)
- Code HTML de la pge via F12 et l'onglet elements. Normalement l'arbre actuel des objets.
- querySelector("truc"). Mettre # devant les ID "#truc" et . devant les classes ".cFract-card" , rien devant les balises "div"

# TypeScript tsconfig.json

- cd mandel-dev # bien se mettre dans le répertoire de tsconfig
- npx tsc -w # Transpiler à la volée:
- npx tsc --noEmit # Recompile tout, et liste les erreurs dans la console:
- Améliorer la **complétion dynamique**
- Décorateurs @tag - avant la fonction, hors commentaire! Activer experimentalDecorators dans tsconfig.

# TypeDoc

- Settings: typedoc.json
- Générer docs: npx typedoc --entryPointStrategy expand ./src --out ./docs
- Générer api-doc: npm run docs **WHY** difference entre npx et npm ?
- Générer arborsecence: dir /B /S mandel-dev

# VScode

- Settings de VS - CTRL+,
- Scripts: npm run myScript (cfig file: tasks.json - Build divers à programmer: tsc, clasp, cargo wasm, docs,...)
- Javascript - Suggest: auto imports : oui => oui (tentative résoudre bug: this-->globalThis)
- JS/TS: Complete function calls : non => oui
- Interfaces: add ., commit, synchro, add/rename, reset, compare & update
- **refactoring** de code: déplacement de propriété et fonction ?

# Gestion des packages

- Vérifier si un package est installé ou sa version
- Installer, mettre à jour
- Différence entre npm et npx ?

# Commandes GIT ==========

## principales

- git add . # Stagging = Empaquetage de tout le dossier (vérifier le CD directory !)
- git commit -m "fix(): comment" # Commiter = sauvegarder le dossier empaqueté. Avec un commentaire: fix = correction
- git push origin main # envoyer vers github
- git pull # Rapatrie de l'info. Concept: stash = commit temporaire où VScode sauve les infos écrasées par l'opération
- git reflog # liste des commit (hors stash)
- git fetch origin # rapatrie l'historique

# debug

- git stash list # liste les commandes de stash=sauvegarde temporaire
- git log -g refs/stash # voir le journal des mouvements de stash
- git log -p -n 3 -- src/calc/cFractCalc.ts # voir l'historique du fichier
- git ls-tree -r --name-only 32c3649 #liste le contenu d'un commit, par hash
- git status -- . ":(exclude)dist" # exclure dist de l'affichage (un peu tordu)
- git show 32c3649:mandel/src/calc/cFractParams.ts # Afficher le fichier du stash 32c3649 sans modifier le disque
- git diff HEAD 32c3649 -- mandel-dev/src/calc/cFractParams.ts # Comparer ton fichier actuel avec la version du stash
- git diff --no-index file1 file2 # comparer deux fichiers actuels
- copy file1 file2 # Faire une copie locale avant écrasement
- git checkout 32c3649 -- src/calc/cFractParams.ts # Extraire la version du stash directement dans ton répertoire de travail

## Envoi vers GitHub

- git push origin main #standard
- git push -u origin main #option -u = --set-upstream définit un défaut de git push
- git push # après

## Gestion branches

- git branch #affiche la branche en cours. "." est le parent
- git checkout main # active la branche main
- git checkout -b branch # crée la branche "branch"
- git checkout mandel-V4 -- path/oneFile.js #récupère un fichier de la branche mandel-V4
- git push -u origin branch # lie branche locale à branche distante, pour faire des commandes pull/push sans paramètres.
- git merge branch # pour appliquer la branche au main. Main doit être activé sur le PC !!
- git reset --soft TAG # Revenir au commit/tag V4.0 tout en conservant tes fichiers modifiés dans ton dossier de travail (?)
- git reset --hard origin/branch # plus violent... écrase la branche locale active par la branche.

Procédure de merge: Procédure merge branche

1.  commit & push la branche
2.  git checkout main #reprend le contexte de main
3.  rm -rf dist # Optionnel : nettoie le dossier dist local si besoin (et d'autres)

- 3b: commit (pour confirmer dist vide)

4.  git merge branche # de main vers la branche
5.  résoudre les conflits # sinon "git merge --abort"

- 5b. git add . # quand tout est bon, pousser dans le stash ("continue" est bloqué sinon)

6.  commit & push origin main (ou "sync").

## special

- git --help, git help -a # aide / liste les commandes "q" pour sortir !!! - git help command # ouvre l'aide d'une commande sur le web
- git add path -f #force l'ajout d'un répertoire/fichier (ex: après effacement tag gitignore)
- git mv mandel-dev mandel_V3 # renomme un répertoire (avantage: garde les liens)
- git apply modification.patch # applique un patch/diff - pas encore testé
- git log --diff-filter=D --summary #récupère la liste des fichiers effacés - marche pas fort
- git log --all --full-history -- _fileName_ #recherche un nom dans l'historique
- git log -p -- src/app/monFichier.ts #les modifications d'un fichier précis Mail
- git commit --amend --author="LeFractiste <285131110+LeFractiste@users.noreply.github.com>" --no-edit
- git config --global user.email "285131110+LeFractiste@users.noreply.github.com"
- git config --global user.name "LeFractiste"
- git log -1 --pretty=format:"%an <%ae>" #inspecter le commit
- git log --oneline --pretty=format:"%h - %an <%ae> : %s" #inspecter la branche

## diff (touche de sortie: "q")

- git diff --stat main..mandel-V4 #from mandel.V4 to main
- git diff main..mandel-V4 -- pathToOneFile/anyFile.js

# Commandes Rust ========

- cargo.toml #config: déclarations Rust et dépendences, à la racine du projet
- \pkg\package.json #créé par wasm-pack pour le navigateur. Pas toucher!
- cargo clean #nettoyer tout avant de recompiler
- Aller dans le bon répertoire et y importer \src + lib.rs + cargo.toml !
- wasm-pack build --target web #compiler le truc vers \pkg en créant \target !
- cargo build --message-format=short
- wasm-pack build --dev -- --message-format=short #recompilation concise

# package.json - définir des macros

- package.json #Script global du projet, à la racine du projet
- "build": "wasm-pack build --dev --target web"

Next step:

- git add .
- git commit -m "feat(v4): intégration de fractal_core.js et mise à jour du moteur Rust"
- git push origin zoom

# Techniques

Déclencheurs de code / triggers :

- CLI / Terminal : Exec (bash/cmd/powershell), npm scripts (**npm run build**), hooks Git (pre-commit, post-merge), tâches VS Code (tasks.json).
  - Et les **@decorators** ?
- Navigateur / Web : URL / Query Params (?action=test), Event Handlers (DOM events), **Web Workers** / Service Workers (arrière-plan), Custom Protocols (**myprotocol://**).
- Google Workspace / Apps Script : Fonctions personnalisées Sheets (=MY_FUNC()), déclencheurs d'évènements (onEdit, onOpen, time-driven), boutons / macros liés à des scripts.
- Système / Automation : **Tâches planifiées** (cron / Windows Task Scheduler), **raccourcis système**, extensions/macros d'éditeurs (VS Code / **AutoHotkey**).
