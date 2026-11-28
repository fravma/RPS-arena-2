# Spec T2b - Timer de manche et reconnexion

Statut : brouillon, en attente de validation PM.

## Pourquoi
En T2a, une manche attend que tous les joueurs aient joué : un joueur distrait bloque tout le monde, et un joueur qui ferme son onglet perd sa place pour de bon. Le brief prévoit les deux cas : un timer par manche (le joueur qui n'a pas joué passe la manche avec 0 point) et la possibilité de revenir après une déconnexion en gardant son total. C'est aussi un prérequis pour les agents IA (T3), qui doivent jouer sous la même contrainte de temps que les humains.

## Quoi
- Chaque manche a un temps limité, le même pour tous, affiché à chaque joueur.
- À la fin du temps, la manche se révèle même si tout le monde n'a pas joué ; ceux qui n'ont pas joué marquent 0 et ne comptent pas dans le calcul des autres.
- Un joueur qui a fermé son onglet peut revenir dans la partie avec le code et son prénom, et retrouve son total.

## Critères d'acceptation (vérifiés sur la preview, avec 2 ou 3 onglets)

1. **Timer visible et commun**
   Étant donné une manche qui s'ouvre, alors chaque joueur voit le même compte à rebours (écart d'une seconde au plus entre onglets), qui passe en rouge sous 5 secondes.
2. **Révélation à la fin du temps**
   Étant donné une manche où un joueur n'a pas joué, quand le timer arrive à 0, alors la manche se révèle chez tous en 3 secondes au plus ; le joueur apparaît « pas joué » avec 0 point et n'est compté ni dans les joueurs battus ni dans ceux ayant fait le même coup.
3. **Révélation avant la fin si tout le monde a joué**
   Étant donné que tous les joueurs présents ont validé avant la fin du temps, alors la manche se révèle sans attendre le timer (comme en T2a).
4. **Trop tard**
   Étant donné un timer à 0, quand un joueur essaie de valider, alors son coup est refusé avec le message « Temps écoulé ».
5. **Revenir après une déconnexion**
   Étant donné une partie en cours et un joueur qui a fermé son onglet (compté parti), quand il rouvre l'accueil et saisit le code et le même prénom, alors il retrouve sa place dans la partie avec son total. S'il revient pendant une manche ouverte, il peut encore jouer.
6. **Pas d'usurpation d'un joueur présent**
   Étant donné un joueur encore présent, quand quelqu'un d'autre essaie de rejoindre avec son prénom, alors il voit « Prénom déjà pris dans cette salle ».
7. **Nouveau venu refusé**
   Étant donné une partie en cours, quand quelqu'un essaie de rejoindre avec un prénom qui n'est pas dans la partie, alors il voit « Partie déjà commencée » (inchangé).

## Expérience (UX/UI)
- Le timer apparaît dans la barre du haut, à côté de « Manche n / 10 » et du modificateur, dans la police d'affichage. Rouge sous 5 s.
- À la révélation, la mention « pas joué » est déjà prévue dans le tableau (T2a).
- Pas de nouvelle maquette : seul un élément s'ajoute à un écran existant.

## Hors scope
Passage automatique à la manche suivante, réglage de la durée par le créateur, pause, agents IA (T3).

## Questions ouvertes
1. **Durée d'une manche :** 20 s comme en T1 ? Une partie de 10 manches dure alors environ 4 à 5 minutes avec les révélations (inférence).
2. **Reconnexion par prénom :** n'importe qui connaissant le code et le prénom d'un joueur parti peut reprendre sa place. Acceptable pour un projet pédagogique ? L'alternative (un lien secret de reconnexion par joueur) est plus sûre mais demande au joueur de le garder.
