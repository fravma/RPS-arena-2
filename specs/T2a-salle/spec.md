# Spec T2a - Salle partagée

Statut : validée par le PM le 27/11/2026.

## Pourquoi
Faire jouer plusieurs humains dans la même partie, chacun sur son appareil. C'est la base du critère de démo a) (2 humains et 1 agent IA), et la première tranche avec un serveur : c'est là que se trouve le principal risque technique du projet (état partagé sur Vercel).

## Quoi
Un joueur crée une salle et obtient un code. D'autres le rejoignent avec ce code. Le créateur lance la partie : 10 manches, chacun choisit son coup en secret, la manche se révèle quand tout le monde a validé, puis classement final. Même règle de score et même affichage qu'en T1.

## Critères d'acceptation (vérifiés sur la preview, avec deux navigateurs ou deux appareils)

1. **Créer une salle**
   Étant donné la page d'accueil, quand je saisis mon prénom et clique sur « Créer une salle », alors je vois un code de salle (ex. « KQZT ») et la liste des joueurs présents, avec mon prénom.
2. **Rejoindre une salle**
   Étant donné une salle créée, quand un deuxième joueur saisit le code et son prénom puis clique sur « Rejoindre », alors il voit la salle, et son prénom apparaît chez tous les joueurs en 3 secondes au plus, sans recharger. Un prénom déjà pris dans la salle est refusé avec le message « Prénom déjà pris dans cette salle ».
3. **Salle pleine**
   Étant donné une salle de 10 joueurs, quand un onzième essaie de la rejoindre, alors il voit « Salle pleine » et n'entre pas.
4. **Lancer la partie**
   Étant donné une salle avec un seul joueur, alors le bouton « Lancer la partie » est désactivé avec la mention « 2 joueurs minimum ». Avec 2 joueurs ou plus, seul le créateur peut lancer, et la manche 1 apparaît chez tous.
5. **Coups cachés**
   Étant donné une manche ouverte, quand un joueur valide son coup, alors les autres voient qu'il « a joué », mais pas son coup.
6. **Révélation automatique**
   Étant donné que tous les joueurs ont validé (en T2a, uniquement des humains ; à partir de T3, les agents IA comptent aussi), alors la manche se révèle automatiquement chez tous en 3 secondes au plus, sans action de personne : coups, points et totaux, calculés avec la même règle qu'en T1.
7. **Manche suivante et fin de partie**
   Étant donné une manche révélée, quand le créateur clique sur « Manche suivante », alors la manche suivante s'ouvre chez tous. Après la manche 10, tous voient le même classement final.
8. **Rejoindre une partie déjà lancée**
   Étant donné une partie en cours, quand quelqu'un essaie de rejoindre avec le code, alors il voit « Partie déjà commencée » et n'entre pas.

## Expérience (UX/UI)
Nouvelle direction (demande PM du 27/11) : inspiration du site maemi-studio.fr, à la place de l'inspiration Apple de T1. L'écran de T1 sera restylé dans cette tranche pour garder un seul style.

Ce qui a été relevé sur le site (observé dans le navigateur) :
- Titres dans une police d'affichage épaisse et arrondie (Dela Gothic One), texte courant en DM Sans.
- Texte bleu marine très foncé (#042332) plutôt que noir.
- Fond blanc cassé chaud, grandes formes douces jaune pâle en arrière-plan.
- Grandes cartes colorées pastel à coins très arrondis : jaune pâle (#EBEC7A), bleu pâle (#E0E9FD), rose (#EFBEE0).
- Bouton principal bleu vif (#336BF1), texte blanc, coins arrondis (16 px) ; liens secondaires soulignés avec une flèche « → ».
- Ambiance : moderne, chaleureuse, un peu ludique, aérée.

Traduction proposée pour RPS Arena (à valider avec la maquette) :
- Les trois coups ont chacun leur couleur pastel : Pierre jaune, Feuille bleu, Ciseaux rose. On les retrouve dans les boutons, le tableau et le décompte.
- Titres en police d'affichage épaisse, chiffres (points, timer, code de salle) dans la même police pour qu'ils ressortent.
- Bouton d'action unique en bleu vif ; vert et rouge gardés pour les modificateurs + et -.
- Inspiration, pas copie : aucun logo, texte ou illustration du studio.

Règles d'affichage :
- Sur un MacBook Pro 14 pouces (fenêtre d'environ 1512 × 860), les boutons d'action (Créer, Rejoindre, Lancer, Valider, Manche suivante) sont visibles sans défiler, même à 10 joueurs.
- Le code de salle est grand et facile à dicter (4 lettres, sans lettres ambiguës comme O et I).
- Chaque joueur voit qui a joué et qui est attendu.

## Hors scope
Timer de manche et joueur absent (T2b), reconnexion après une coupure (T2b), agents IA (T3), comptes utilisateurs, salle conservée après la partie, version mobile soignée.

## Prérequis côté PM
Une base de données Redis (Upstash, via la Marketplace Vercel) devra être reliée au projet Vercel. C'est une action sur ton compte : je te donnerai les étapes au moment du plan.

## Décisions du PM (27/11)
1. Mise à jour automatique (3 s au plus), révélation automatique quand tous les joueurs ont validé, agents IA compris à partir de T3.
2. Prénom en double refusé.
3. Écran cible : MacBook Pro 14 pouces.
4. Maquette avant le code (étape Maquette de la méthode).
5. Style inspiré de maemi-studio.fr, à la place de l'inspiration Apple.
6. Le créateur de la salle fait passer à la manche suivante (option a).
