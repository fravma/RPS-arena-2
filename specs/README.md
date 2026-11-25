# Specs - mode d'emploi

Référence complète : doc « Méthode POC express » du projet Claude (section 2, déroulé).

## Fichiers
- `00-intention.md` : fiche d'intention (cadrage) du POC
- `01-decoupage.md` : liste des tranches T0 à T4
- `Tn-nom/` : une tranche = `spec.md`, `plan.md`, `tasks.md`

## Boucle de tranche (inspirée du SDD)
Chaque étape s'arrête sur une validation avant la suivante.

| Étape | Contenu | Validation |
|---|---|---|
| Spec | Quoi et pourquoi, critères d'acceptation (Étant donné / Quand / Alors), hors scope. Aucune technique. | PM |
| Plan | Comment : fichiers, choix techniques, risques | PM |
| Tâches | 3 à 6 tâches, chacune testable seule | PM (rapide) |
| Implémentation | Une tâche à la fois, tests verts à chaque tâche, sur la branche de la tranche | Agent |
| Vérification | Critères de la spec vérifiés un par un sur la preview Vercel | PM, puis merge = prod |
| Rétro | Ce qui a marché, ce qui a coûté du temps, ce qu'il faut changer | Ensemble |

Rien n'arrive sur `main` avant la vérification : pendant la boucle, tout est sur la branche de la tranche (ex. `t0-moteur`).
