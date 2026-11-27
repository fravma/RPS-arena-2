# Plan T2a - Salle partagée

Statut : décisions produit validées par le PM le 27/11/2026.

## Décisions produit (validées)

| Décision | Ce que ça change pour l'utilisateur | Coût | Difficile à défaire ? |
|---|---|---|---|
| Mise à jour toutes les 2 s, pas en temps réel | Jusqu'à 2 ou 3 s de décalage entre joueurs | Aucun | Non |
| Un onglet = un joueur | Recharger garde la partie ; fermer l'onglet fait perdre sa place | Aucun | Non |
| Départ détecté après 10 s d'absence | Un onglet longtemps en arrière-plan peut être compté parti | Aucun | Non (seuil réglable) |
| Salles supprimées après 24 h | Une partie ne se retrouve pas le lendemain | Aucun | Non |
| Offre gratuite Upstash et Vercel | Environ 60 parties de 10 joueurs par mois (estimation) | 0 € | Non |
| 11e joueur possible en cas d'arrivées simultanées | Très rare | Aucun | Non |

## Architecture en une phrase
Le navigateur de chaque joueur interroge le serveur toutes les 2 secondes ; le serveur (fonctions Vercel) lit et écrit l'état de la salle dans Redis (Upstash) et calcule ce que chaque joueur a le droit de voir.

## Fichiers
- `lib/room.ts` (+ tests) : la logique d'une salle en fonctions pures. Créer, rejoindre (salle pleine, prénom pris, partie commencée), lancer (2 joueurs minimum, créateur seul), jouer, manche suivante (créateur seul), et surtout **la vue d'un joueur** : ce qu'il voit, coups des autres cachés tant que la manche n'est pas révélée. Réutilise le moteur T0 sans le modifier.
- `lib/store.ts` : lecture et écriture dans Redis. Seul fichier qui parle à Redis.
- `app/api/rooms/...` : 5 routes (créer, rejoindre, lancer, jouer, manche suivante) + 1 route de lecture de l'état.
- `app/page.tsx` : accueil (maquette écran 1). Le mode solo de T1 passe sur `app/solo/page.tsx`.
- `app/salle/[code]/page.tsx` : salle d'attente, manche, révélation, classement (maquette écrans 2 à 4).
- `app/globals.css` : nouveau style (maquette), appliqué aussi au mode solo.

## Choix techniques
1. **Interrogation toutes les 2 s plutôt que WebSocket.** Respecte le critère « 3 s au plus » sans dépendre des WebSockets Vercel, coupés à la durée maximale d'une fonction (risque noté au cadrage). Plus simple à écrire et à tester.
2. **Redis via la Marketplace Vercel (Upstash).** Le client `@upstash/redis` lit tout seul les variables d'environnement injectées par l'intégration (sourcé : doc du client et de la Marketplace).
3. **Chaque écriture touche une seule petite donnée** : un champ par joueur, un champ par coup. Deux joueurs qui valident au même instant n'écrasent pas le travail de l'autre. La révélation n'est pas « écrite » : elle est **déduite** à la lecture (tous les joueurs ont un coup pour la manche en cours). Aucune course possible sur la révélation (inférence).
4. **Identité du joueur par jeton.** En rejoignant, chaque joueur reçoit un jeton secret gardé dans l'onglet de son navigateur (un onglet = un joueur, ce qui permet aussi de tester à plusieurs dans un seul navigateur). Toute action exige ce jeton : personne ne peut jouer à la place d'un autre, et le serveur ne montre à chacun que ce qu'il a le droit de voir. Pas de compte utilisateur.
5. **Code de salle** : 4 lettres sans O, I, L ni U (ambiguës à l'oral ou à l'écrit), réservé de façon atomique (pas deux salles avec le même code).
6. **Salles éphémères** : supprimées automatiquement après 24 h dans Redis.
7. **Rechargement de page** : le jeton étant gardé dans l'onglet, recharger la page de la salle ramène le joueur dans sa partie (effet de bord utile, pas un critère).
8. **Présence et administrateur (critère 9).** Chaque interrogation toutes les 2 s note l'heure de passage du joueur. Un joueur absent depuis plus de 10 s, ou qui a cliqué sur « Quitter », est considéré comme parti. L'administrateur est, à chaque lecture, le premier joueur présent dans l'ordre d'arrivée : rien à écrire, donc pas de conflit (inférence).

## Prérequis côté PM (compte Vercel)
Dans le projet Vercel `rps-arena-2` : onglet Storage, ajouter une base Upstash Redis (offre gratuite), la relier au projet pour Production et Preview, puis redéployer. Je donnerai les étapes détaillées au moment de l'implémentation.

## Vérification
1. **Tests automatiques** de la logique de salle (sans Redis).
2. **Partie automatique à plusieurs, en local** : un serveur local avec un faux stockage en mémoire à la place de Redis, et 3 navigateurs automatiques qui jouent une partie complète. Vérifie tout sauf le branchement à Redis.
3. **Sur la preview, dans le navigateur intégré du PM** (avec son accord) : 2 ou 3 onglets = 2 ou 3 joueurs, une partie complète. Vérifie le branchement à Redis.
4. **Vérification finale par le PM** sur la preview, critères de la PR cochés un par un.

## Risques
1. **Onzième joueur au même instant que le dixième** (probabilité très faible, impact faible) : deux arrivées simultanées pourraient porter la salle à 11. Accepté pour le POC.
2. **Quotas gratuits** (probabilité faible, impact moyen) : estimation (inférence) d'environ 3 000 requêtes et 8 000 commandes Redis par partie de 10 joueurs. Offre gratuite Upstash : 500 000 commandes par mois, soit environ 60 parties de 10. Vercel Hobby : 1 million d'invocations par mois selon la doc (100 000 selon la page tarifs, chiffres contradictoires). Suffisant pour le POC, à surveiller avant une démo à plusieurs.
3. **Usage commercial** : sans objet, projet pédagogique (décision PM du 27/11).
4. **Faux départ** (probabilité faible, impact faible) : un joueur dont l'onglet passe en arrière-plan peut interroger moins souvent (les navigateurs ralentissent les onglets inactifs, inférence) et être compté parti à tort. Parade : seuil de 10 s, soit 5 interrogations manquées.
5. **Branchement Redis vérifié tard** : il ne peut être testé que sur la preview (étape 3 de la vérification). Parade : déployer tôt une première version et tester le branchement dès la première tâche réseau.

## Hors plan
Timer et joueur absent, reconnexion, agents IA.
