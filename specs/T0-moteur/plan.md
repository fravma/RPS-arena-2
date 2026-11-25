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

### 1. Arrondis des nombres à virgule (probabilité forte, impact moyen)
L'ordinateur ne stocke pas 2/3 exactement. Constaté en exécutant le calcul :
- 2/3 + 0,5 donne 1,1666666666666665 (et non ...67).
- Deux joueurs qui marquent les mêmes points dans un ordre différent (0,67 / 0,67 / 0,67 / 0,5 contre 0,5 / 0,67 / 0,67 / 0,67) obtiennent 2,5 et 2,4999999999999996.

Conséquence sans parade : `winners` désignerait un seul gagnant au lieu d'une égalité, contrairement au critère 7.
Parade : deux totaux dont l'écart est inférieur à 0,000000001 sont considérés comme égaux. Un test reproduit exactement l'exemple ci-dessus.

### 2. Cas limites non couverts par le brief (probabilité moyenne, impact faible)
Cas repérés, avec le comportement que le plan en déduit (inférence, à valider) :
- **Un seul joueur a joué, les autres sont absents** : un seul coup présent, donc personne ne marque (règle « tout le monde pareil »).
- **Modificateur sur un coup que personne n'a joué** : aucun effet.
- **Nombre de joueurs hors de 2 à 10** : le moteur ne contrôle pas. Le contrôle se fera à l'entrée dans la salle (T2).

Tout autre cas découvert en codant est remonté au PM, pas tranché par l'agent.

### 3. Tirage des modificateurs peu varié (probabilité faible, impact faible)
Le tirage étant libre, une partie peut avoir 10 fois le même modificateur, ou un coup jamais visé. C'est conforme au brief (« tirés au hasard ») mais moins intéressant à jouer. Accepté pour T0, à revoir si une partie de test le montre.

## Hors plan
Interface, persistance, bots (T1).
