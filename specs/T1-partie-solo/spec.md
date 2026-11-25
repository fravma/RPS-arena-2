# Spec T1 - Partie solo contre des bots

Statut : brouillon, en attente de validation PM.

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
4. **Timer expiré** *(à arbitrer)*
   Étant donné une manche ouverte avec un timer de 20 s, quand le timer arrive à 0 sans que j'aie validé, alors la manche se révèle, j'apparais « pas joué » avec 0 point.
5. **Fin de partie**
   Étant donné la manche 10 révélée, quand je passe à la suite, alors je vois le classement final. En cas d'égalité en tête, tous les ex aequo sont affichés gagnants.
6. **Rejouer**
   Étant donné le classement final, quand je clique sur « Rejouer », alors une nouvelle partie démarre à la manche 1 avec de nouveaux modificateurs et des totaux à 0.

## Hors scope
Réglage du nombre de bots ou du timer, bots « intelligents », sauvegarde de la partie (un rechargement de page la perd), soin visuel au-delà du lisible, version mobile soignée.

## Questions ouvertes
1. **Critère 4 (timer) : garder ou couper ?** Pour : le cas « joueur absent » du brief est visible dès T1. Contre : le vrai timer, côté serveur, arrive en T2b, celui de T1 sera remplacé (inférence).
2. **Explication de la règle à l'écran** : une phrase sous le titre (« points = joueurs battus ÷ joueurs ayant fait le même coup + modificateur ») ? Utile pour une démo, mais c'est du contenu en plus.
