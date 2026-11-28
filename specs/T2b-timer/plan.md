# Plan T2b - Timer de manche et reconnexion

Statut : décisions produit validées par le PM le 28/11/2026.

## Décisions produit (validées)

| Décision | Ce que ça change pour l'utilisateur | Coût | Difficile à défaire ? |
|---|---|---|---|
| Le timer est tenu par le serveur : une heure limite est enregistrée à l'ouverture de chaque manche, chaque onglet affiche le temps restant d'après l'heure du serveur | Le même compte à rebours chez tous, même si l'horloge d'un ordinateur est fausse | Aucun | Non |
| Le timer démarre quand la manche s'ouvre (lancement de la partie ou clic sur « Manche suivante ») | La lecture de la révélation n'est pas chronométrée : l'admin décide quand repartir | Aucun | Non |
| À 0, la révélation apparaît dans les 2 s qui suivent (prochaine interrogation) | Jusqu'à 2 s d'écart entre « 0 » à l'écran et la révélation | Aucun | Non |
| Un joueur qui revient après la révélation ne peut plus jouer cette manche | Il rejoue à la manche suivante, sans perdre son total | Aucun | Non |
| Reconnexion par prénom (décision spec) | Un tiers connaissant le code et le prénom d'un joueur parti peut prendre sa place | Aucun | Non |
| Vérification PM allégée (voir Vérification) | Moins de contrôle humain sur cette tranche | Risque d'un défaut visible seulement en démo | Non |

## Fichiers
- `lib/room.ts` (+ tests) : heure limite par manche, révélation si le temps est écoulé, refus « Temps écoulé », reprise de place par prénom.
- `lib/server.ts` (+ tests) : enregistre l'heure limite au lancement et à chaque manche suivante, gère la reprise de place, renvoie l'heure du serveur avec chaque vue.
- `app/salle/[code]/page.tsx` : affichage du compte à rebours dans la barre du haut.

## Choix techniques (informatifs)
1. Heure limite stockée par manche dans la salle Redis (un champ par manche), écrite une seule fois.
2. Chaque réponse du serveur contient son heure ; le navigateur calcule le décalage avec sa propre horloge et affiche le temps restant en conséquence.
3. Reprise de place : un nouveau jeton est attribué au joueur existant, l'ancien n'est plus utilisé ; son indicateur « parti » est levé.

## Vérification
Décision PM : vérification allégée.
1. **Tests automatiques** : chaque critère a son test, avec une horloge simulée (le temps écoulé se teste sans attendre).
2. **Partie automatique à 3 navigateurs en local** : un joueur ne joue pas, la manche se révèle à 0 ; un joueur ferme son onglet puis revient.
3. **Sur la preview, dans le navigateur intégré** : une manche où personne ne joue (révélation à 10 s), une reconnexion par prénom.
4. **Côté PM (proposé, 2 minutes, facultatif)** : un seul onglet suffit pour voir le timer et la révélation à 0 ; la reconnexion se voit en fermant un onglet.

## Risques
1. **Horloges des serveurs Vercel légèrement différentes** (probabilité faible, impact faible) : l'heure limite et l'heure de référence viennent de serveurs qui peuvent différer de quelques millisecondes (inférence). Accepté.
2. **Révélation qui « saute »** (probabilité faible, impact faible) : un joueur qui valide dans la toute dernière seconde peut voir son coup refusé si sa requête arrive après 0. Accepté, c'est la règle du timer.
3. **Usurpation d'un joueur parti** : accepté (décision spec).
4. **Vérification allégée** : accepté par le PM ; compensé par les tests automatiques et le test sur la preview par l'agent.

## Hors plan
Passage automatique à la manche suivante, réglage de la durée, agents IA.
