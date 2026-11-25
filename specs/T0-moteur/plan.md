# Plan T0 - Moteur de score

Statut : brouillon, en attente de validation PM.

## Fichiers
- `lib/engine.ts` : types et fonctions pures. Aucune dépendance, aucun accès réseau ni stockage.
- `lib/engine.test.ts` : un test par critère d'acceptation, nommé comme le critère.

## Ce que le moteur expose
- Types : `Move` (pierre, feuille, ciseaux), `Modifier` (coup visé + valeur), `RoundMoves` (coup de chaque joueur, ou absent).
- `scoreRound(coups, modificateur)` : points de chaque joueur pour une manche.
- `totals(manches)` et `winners(totaux)` : totaux de la partie, gagnant(s) avec égalité partagée.
- `drawModifiers(10, hasard)` : les 10 modificateurs d'une partie.

## Choix techniques
1. **Fonctions pures.** Mêmes entrées = même sortie. C'est ce qui permet de tester sans serveur, et de réutiliser le moteur tel quel côté client (T1) et côté serveur (T2, T3).
2. **Hasard injectable.** `drawModifiers` reçoit la source de hasard en paramètre. En test, on lui passe une source fixe pour obtenir un résultat prévisible.
3. **Cas « tout le monde pareil » traité en premier.** Si un seul coup différent a été joué, tout le monde marque 0 et le modificateur est ignoré (décision PM). Sinon, on applique b / n + modificateur.
4. **Pas d'arrondi dans le moteur.** 2/3 reste 0,666... L'arrondi à l'affichage relève de l'interface (T1). Les tests comparent avec une tolérance.
5. **Joueur absent** représenté par une valeur vide : il reçoit 0 et n'entre dans aucun comptage.

## Risques
- **Arrondis des nombres à virgule** : 2/3 + 0,5 peut donner 1,1666...7. Traité par la tolérance dans les tests et dans `winners` (deux totaux quasi égaux = égalité).
- **Interprétation de la règle** : le plan suit le brief et les 2 décisions PM. Tout autre cas limite découvert en codant sera remonté, pas tranché par l'agent.

## Hors plan
Interface, persistance, bots (T1).
