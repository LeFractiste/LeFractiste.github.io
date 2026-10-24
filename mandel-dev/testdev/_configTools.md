
# HOW TO NOTES !

# VScode
launch.json  #config de déboguage à la racine du projet
tasks.json   #Raccourcis de tâches de compilation dans VS Code.

# JavaScript.js - TypeScript.ts =======
* Améliorer la complétion dynamique
*  Utiliser JDoc: // @type cFract déclare ma variable  (+générer des fichiers .d.ts pour .js) 
*  Ne pas utiliser // @ts-check en début de fichier .js (génère erreurs?)
* 
* Linter (ESLint) - analyse statique de code, signale les erreurs en rouge dans le code
* Formatter (Prettier) : gère le rendu visuel, indentations...
* Transpilation typescript (tsc)
  - Transpiler à la volée tsc -w => npx tsc -w
  - Lister les erreurs de compilation dans la console: npx tsc --noEmit
* TypeDoc 
  * Générer docs: npx typedoc --entryPointStrategy expand ./src --out ./docs
  * Générer api-doc: npm run docs 
* Arborescence: dir /B /S mandel-dev
* Settings de VS - CTRL+,
  - Javascript - Suggest: auto imports : oui => oui     (tentative résoudre bug: this-->globalThis)
  - JS/TS: Complete function calls : non => oui

# Commandes GIT ==========
## principales
git add .                       # Stagging = Empaquetage de tout le dossier (vérifier le CD directory !)
git commit -m "fix(): comment"  # Commiter = sauvegarder le dossier empaqueté. Avec un commentaire: fix = correction
git push origin main            # envoyer vers github
git pull                        # Rapatrie de l'info. Concept: stash = commit temporaire où VScode sauve les infos écrasées par l'opération
git reflog                      # liste des commit (hors stash)

# debug
git stash list                  # liste les commandes de stash=sauvegarde temporaire
git log -g refs/stash           # voir le journal des mouvements de stash
git ls-tree -r --name-only 32c3649  #liste le contenu d'un commit, par hash

## Envoi vers GitHub
git push origin main     #standard
git push -u origin main  #option -u = --set-upstream définit un défaut de git push
git push                 # après

## Gestion branches
git branch  #affiche la branche en cours. * est le parent
git checkout main  #active la branche main
git checkout -b branch  #crée la branche "branch"
git checkout mandel-V4 -- path/oneFile.js  #récupère un fichier de la branche mandel-V4
git push -u origin mandel-dev  #pour publier la branche vers git, à la fin
merge         #pour appliquer la branche au main
git reset --soft TAG  # Revenir au commit/tag V4.0 tout en conservant tes fichiers modifiés dans ton dossier de travail (?)


## special
git --help, git help -a # aide / liste les commandes   "q" pour sortir !!!
git help command        # ouvre l'aide d'une commande sur le web
git add path -f         #force l'ajout d'un répertoire/fichier (ex: après effacement tag gitignore)
git mv mandel-dev mandel_V3   # renomme un répertoire (avantage: garde les liens)
git apply modification.patch  # applique un patch/diff - pas encore testé
git log --diff-filter=D --summary  #récupère la liste des fichiers effacés - marche pas fort
git log --all --full-history -- *fileName* #recherche un nom dans l'historique
git log -p -- src/app/monFichier.ts  #les modifications d'un fichier précis

## diff  (touche de sortie: "q")
git diff --stat main..mandel-V4  #from mandel.V4 to main
git diff main..mandel-V4 -- pathToOneFile/anyFile.js

# Commandes Rust ========
cargo.toml  #config: déclarations Rust et dépendences. A la racine du projet
\pkg\package.json  #créé par wasm-pack pour le navigateur. Pas toucher!
cargo clean  #nettoyer tout avant de recompiler
Aller dans le bon répertoire et y importer \src + lib.rs + cargo.toml !
wasm-pack build --target web   #compiler le truc vers \pkg en créant \target ! 
cargo build --message-format=short
wasm-pack build --dev -- --message-format=short  #recompilation concise

# package.json - définir des macros
package.json  #Script global du projet, à la racine du projet
"build": "wasm-pack build --dev --target web"

Next step:
git add .
git commit -m "feat(v4): intégration de fractal_core.js et mise à jour du moteur Rust"
git push origin zoom