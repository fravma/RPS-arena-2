# Spec T1 - Partie solo contre des bots

Statut : validée par le PM le 25/11/2026.

## Pourquoi
Rendre la règle de la minorité visible et jouable en ligne, sans serveur ni autre joueur. C'est la première version que l'on peut montrer, et l'interface servira de base aux parties multijoueur (T2).

## Quoi
Sur la page d'accueil, un joueur lance une partie de 10 manches contre 4 bots qui jouent au hasard. À chaque manche, il voit le modificateur, choisit son coup, puis découvre tous les coups et les points. À la fin, il voit le classement.

## Critères d'acceptation (vérifiés sur la preview Vercel)

1. **Lancer une partie**
   Étant donné la page d'accueil, quand je clique sur « Lancer une partie », alors la manche 1/10 s'affiche avec son modificateur (ex. « Feuille +0,5 »), et je joue contre 4 bots.
2. **Coup caché**
   Étant donné une manche ouverte, quand je choisis un coup, alors il est mis en évidence, je peux en changer tant que je n'ai pas validé, et aucun coup des bots n'est affiché.
3. **Révélation et points**
   Étant donné que j'ai validé mon coup, quand la manche se révèle, alors je vois pour chaque joueur son coup, ses points de la manche et son total, ainsi que le nombre de joueurs par coup. Les points sont affichés avec 2 décimales au plus.
4. **Timer expiré**
   Étant donné une manche ouverte avec un timer de 20 s, quand le timer arrive à 0 sans que j'aie validé, alors la manche se révèle, j'apparais « pas joué » avec 0 point.
5. **Fin de partie**
   Étant donné la manche 10 révélée, quand je passe à la suite, alors je vois le classement final. En cas d'égalité en tête, tous les ex aequo sont affichés gagnants.
6. **Rejouer**
   Étant donné le classement final, quand je clique sur « Rejouer », alors une nouvelle partie démarre à la manche 1 avec de nouveaux modificateurs et des totaux à 0.
7. **Règle expliquée**
   Étant donné la page d'accueil ou une partie en cours, quand je regarde sous le titre, alors une phrase explique la règle : points = joueurs battus ÷ joueurs ayant fait le même coup, plus le modificateur de la manche.

## Expérience (UX/UI)
Inspiration Apple (demande PM). Traduction proposée, à valider :
- Sobre : beaucoup d'espace, un seul élément important par zone, pas de décor superflu.
- Typographie système (celle de l'appareil), titres grands et fins, textes courts.
- Fond clair, cartes blanches à coins arrondis, ombres légères.
- Une seule couleur d'accent (bleu) pour l'action principale ; vert et rouge réservés aux modificateurs + et -.
- Les trois coups en gros boutons, faciles à toucher.
- Transitions discrètes (apparition douce de la révélation), jamais gênantes.
- Inspiration, pas imitation : aucun logo, nom ou élément de marque Apple.

## Hors scope
Réglage du nombre de bots ou du timer, bots « intelligents », sauvegarde de la partie (un rechargement de page la perd), animations élaborées, mode sombre, version mobile soignée.

## Décisions du PM (25/11)
1. Critère 4 (timer) gardé, même s'il sera remplacé par le timer serveur en T2b.
2. Règle expliquée à l'écran (critère 7).
3. Inspiration visuelle Apple (section Expérience).
