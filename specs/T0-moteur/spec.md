# Spec T0 - Moteur de score

Statut : validée par le PM le 25/11/2026.

## Pourquoi
La règle de score est le cœur du jeu : elle crée la tension « la minorité gagne ». Elle doit être juste et prouvée par les exemples du brief avant toute interface, car toutes les tranches suivantes s'appuient dessus.

## Quoi
Le moteur sait, sans interface ni réseau :
- calculer les points de chaque joueur pour une manche, à partir des coups joués et du modificateur de la manche ;
- calculer les totaux et le ou les gagnants d'une partie ;
- tirer les 10 modificateurs d'une partie.

Règle : points = b / n + modificateur
- b = nombre de joueurs dont le coup est battu par le mien (Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre)
- n = nombre de joueurs ayant joué le même coup que moi, moi compris
- modificateur = ajouté à chaque joueur ayant joué le coup concerné, gagnant ou perdant

## Critères d'acceptation

1. **Exemple brief 1**
   Étant donné 1 Pierre et 4 Ciseaux, sans modificateur, quand la manche est scorée, alors la Pierre marque 4 et chaque Ciseaux 0.
2. **Exemple brief 2**
   Étant donné 4 Ciseaux et 1 Feuille, sans modificateur, quand la manche est scorée, alors chaque Ciseaux marque 0,25 et la Feuille 0.
3. **Exemple brief à 10 joueurs**
   Étant donné 5 Pierre, 3 Ciseaux, 2 Feuille et le modificateur Feuille +0,5, quand la manche est scorée, alors Pierre marque 0,60, Ciseaux 2/3 (affiché 0,67), Feuille 3,00.
4. **Tout le monde joue pareil**
   Étant donné que tous les joueurs ayant joué ont fait le même coup, quand la manche est scorée, alors personne ne marque, même si le modificateur de la manche vise ce coup.
5. **Modificateur en défaite**
   Étant donné le modificateur Pierre -0,5, quand un joueur perd avec Pierre, alors il marque -0,5, et son total peut devenir négatif.
6. **Joueur absent**
   Étant donné un joueur qui n'a pas joué avant la fin du timer, quand la manche est scorée, alors il marque 0 et ne compte ni dans le b ni dans le n des autres.
7. **Fin de partie**
   Étant donné les points des 10 manches, quand la partie se termine, alors le total de chaque joueur est la somme de ses points, et une égalité en tête donne une victoire partagée.
8. **Tirage des modificateurs**
   Étant donné une nouvelle partie, quand elle démarre, alors 10 modificateurs sont tirés au hasard, un par manche, chacun visant un coup avec la valeur +0,5 ou -0,5.

## Vérification
T0 n'a pas d'interface : on ne peut pas le vérifier sur la preview. Chaque critère devient un test automatique nommé comme lui, et la CI doit être verte sur la PR. Le PM relit la liste des tests.

## Hors scope
Interface, arrondi à l'affichage, bots, réseau, persistance.

## Décisions du PM (25/11)
1. Tout le monde joue le même coup : personne ne marque, modificateur compris. Le brief était ambigu sur ce cas.
2. Valeurs des modificateurs : +0,5 et -0,5 uniquement, par simplicité.
