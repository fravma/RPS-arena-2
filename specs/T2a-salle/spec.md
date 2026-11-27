# Spec T2a - Salle partagée

Statut : brouillon, en attente de validation PM.

## Pourquoi
Faire jouer plusieurs humains dans la même partie, chacun sur son appareil. C'est la base du critère de démo a) (2 humains et 1 agent IA), et la première tranche avec un serveur : c'est là que se trouve le principal risque technique du projet (état partagé sur Vercel).

## Quoi
Un joueur crée une salle et obtient un code. D'autres le rejoignent avec ce code. Le créateur lance la partie : 10 manches, chacun choisit son coup en secret, la manche se révèle quand tout le monde a validé, puis classement final. Même règle de score et même affichage qu'en T1.

## Critères d'acceptation (vérifiés sur la preview, avec deux navigateurs ou deux appareils)

1. **Créer une salle**
   Étant donné la page d'accueil, quand je saisis mon prénom et clique sur « Créer une salle », alors je vois un code de salle (ex. « KQZT ») et la liste des joueurs présents, avec mon prénom.
2. **Rejoindre une salle**
   Étant donné une salle créée, quand un deuxième joueur saisit le code et son prénom puis clique sur « Rejoindre », alors il voit la salle, et son prénom apparaît chez tous les joueurs en 3 secondes au plus, sans recharger.
3. **Salle pleine**
   Étant donné une salle de 10 joueurs, quand un onzième essaie de la rejoindre, alors il voit « Salle pleine » et n'entre pas.
4. **Lancer la partie**
   Étant donné une salle avec un seul joueur, alors le bouton « Lancer la partie » est désactivé avec la mention « 2 joueurs minimum ». Avec 2 joueurs ou plus, seul le créateur peut lancer, et la manche 1 apparaît chez tous.
5. **Coups cachés**
   Étant donné une manche ouverte, quand un joueur valide son coup, alors les autres voient qu'il « a joué », mais pas son coup.
6. **Révélation**
   Étant donné que tous les joueurs ont validé, alors la manche se révèle chez tous en 3 secondes au plus : coups, points et totaux, calculés avec la même règle qu'en T1.
7. **Manche suivante et fin de partie**
   Étant donné une manche révélée, quand le créateur clique sur « Manche suivante », alors la manche suivante s'ouvre chez tous. Après la manche 10, tous voient le même classement final.
8. **Rejoindre une partie déjà lancée**
   Étant donné une partie en cours, quand quelqu'un essaie de rejoindre avec le code, alors il voit « Partie déjà commencée » et n'entre pas.

## Expérience (UX/UI)
- Même inspiration Apple qu'en T1, même écran de manche et de révélation.
- Sur le MacBook Pro du PM, les boutons d'action (Créer, Rejoindre, Lancer, Valider, Manche suivante) sont visibles sans défiler, même à 10 joueurs.
- Le code de salle est grand et facile à dicter (4 lettres, sans lettres ambiguës comme O et I).
- Chaque joueur voit qui a joué et qui est attendu.

## Hors scope
Timer de manche et joueur absent (T2b), reconnexion après une coupure (T2b), agents IA (T3), comptes utilisateurs, salle conservée après la partie, version mobile soignée.

## Prérequis côté PM
Une base de données Redis (Upstash, via la Marketplace Vercel) devra être reliée au projet Vercel. C'est une action sur ton compte : je te donnerai les étapes au moment du plan.

## Questions ouvertes
1. **Mise à jour automatique (3 s au plus) ou rafraîchissement manuel ?** Le découpage acceptait le rafraîchissement manuel en T2a. La mise à jour automatique rend la démo bien plus fluide pour un surcoût que j'estime faible (inférence).
2. **Qui fait avancer les manches ?** Proposition : le créateur seul. Autre option : chaque joueur clique « Prêt », la manche suivante s'ouvre quand tous sont prêts.
3. **Deux joueurs avec le même prénom ?** Proposition : refusé, avec le message « Prénom déjà pris dans cette salle ».
4. **Écran cible :** MacBook Pro 14 ou 16 pouces ? Par défaut, je vise le 14 pouces (fenêtre d'environ 1512 × 860 dans le navigateur, inférence).
5. **Maquette avant le code ?** La méthode la prévoit pour un écran de démo. Je propose 3 écrans : accueil (créer ou rejoindre), salle d'attente, manche à plusieurs.
