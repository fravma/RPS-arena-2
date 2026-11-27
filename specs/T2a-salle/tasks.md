# Tâches T2a - Salle partagée

Statut : brouillon, en attente de validation PM.

Chaque tâche n'écrit que son propre code, tests d'abord, tests verts avant le commit. Les numéros entre crochets renvoient aux critères de la spec, « R » aux risques du plan.

1. **Logique de la salle d'attente** [1, 2, 3, 4, 8, 9]
   Créer (code de 4 lettres), rejoindre, refus « Salle pleine », « Prénom déjà pris », « Partie déjà commencée », lancer (2 joueurs minimum, administrateur seul), présence et passage de l'administration au joueur suivant.
   Fait quand : chaque règle a son test, sans Redis.

2. **Logique de la partie** [5, 6, 7, 9]
   Jouer un coup, vue de chaque joueur (coups des autres cachés, « a joué » visible), révélation déduite quand tous les joueurs présents ont joué, manche suivante (administrateur seul), classement final ; un joueur parti ne bloque pas la révélation.
   Fait quand : chaque règle a son test, sans Redis.

3. **Serveur et branchement Redis** [R5]
   Les 6 routes, un stockage Redis et un faux stockage en mémoire pour les tests. Étapes pour toi : créer la base Redis sur Vercel. Première preview déployée pour tester tout de suite le branchement (créer une salle puis la relire).
   Fait quand : routes testées avec le faux stockage, et une salle créée puis relue sur la preview.

4. **Écrans** [1 à 9, Expérience]
   Accueil, salle d'attente, manche, révélation, classement, selon la maquette ; mise à jour toutes les 2 s ; mode solo déplacé sur `/solo` et passé au nouveau style.
   Fait quand : build OK, boutons d'action visibles sans défiler en 1512 × 860 à 10 joueurs.

5. **Vérification et PR**
   Partie automatique à 3 navigateurs en local (faux stockage), puis partie sur la preview dans ton navigateur intégré (2 ou 3 onglets, avec ton accord), puis description de PR au gabarit F.
