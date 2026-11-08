/**
 * ============================================================================
 * version.ts - Tatouage & Traçabilité du projet Mandel-Dev
 * ============================================================================
 *
 * JSDoc Custom Tags utilisés dans le projet :
 * @IAsk  : Question/Arbitrage technique à trancher avec l'assistant
 * @myTag : Annotation spécifique d'architecture ou de test
 */

import { AppVersionInfo, TaskTrack } from "../fractTypes.js";

//Gestion de version
export const APP_VERSION: AppVersionInfo = {
  version: "4.8.0.  (dev: Republier ts package)",
  buildDate: "2026-11-08 01:50 CET",
  gitTag: "branch rescue-stash", // À synchroniser avec `git describe --tags`
  environment: "development"
};

// Registre de suivi local (Todo / Done) spécifique à la branche courante
export const BRANCH_TRACKER: TaskTrack[] = [
  {
    id: "T1",
    type: "DONE",
    description: "Isolation du Stash 32c3649 sur branche dédiée",
    file: "git"
  },
  {
    id: "T2",
    type: "DONE",
    description: "Restauration du code source src/ et compilation basique",
    file: "src/"
  },
  {
    id: "T3",
    type: "WIP",
    description: "Migration de appDev.js vers appDev.ts",
    file: "src/app/appDev.ts"
  },
  {
    id: "T4",
    type: "TODO",
    description: "Mettre en place la traçabilité version.ts dans la UI",
    file: "src/version.ts"
  },
  {
    id: "T5",
    type: "TODO",
    description: "Audit des tags @IAsk et @myTag avant merge sur main"
  }
];

/**
 * Affiche le tatouage de version dans la console au démarrage
 */
export function logAppHeader(): void {
  console.log(
    `%c Mandel-Dev v${APP_VERSION.version} | Build: ${APP_VERSION.buildDate} | Git: ${APP_VERSION.gitTag}`,
    "color: #0088ff; font-weight: bold; font-size: 12px;"
  );
}
