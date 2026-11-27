# Plan T2a - Salle partagée

Statut : brouillon, en attente de validation PM.

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
4. **Identité du joueur par jeton.** En rejoignant, chaque joueur reçoit un jeton secret gardé dans son navigateur. Toute action exige ce jeton : personne ne peut jouer à la place d'un autre, et le serveur ne montre à chacun que ce qu'il a le droit de voir. Pas de compte utilisateur.
5. **Code de salle** : 4 lettres sans O, I, L ni U (ambiguës à l'oral ou à l'écrit), réservé de façon atomique (pas deux salles avec le même code).
6. **Salles éphémères** : supprimées automatiquement après 24 h dans Redis.
7. **Rechargement de page** : le jeton étant gardé dans le navigateur, recharger la page de la salle ramène le joueur dans sa partie (effet de bord utile, pas un critère).

## Prérequis côté PM (compte Vercel)
Dans le projet Vercel `rps-arena-2` : onglet Storage, ajouter une base Upstash Redis (offre gratuite), la relier au projet pour Production et Preview, puis redéployer. Je donnerai les étapes détaillées au moment de l'implémentation.

## Besoins de testabilité
- La logique de salle se teste sans Redis ni réseau (fonctions pures).
- Les routes se testent avec un faux stockage en mémoire.
- Vérification de bout en bout : deux navigateurs automatiques jouent une partie sur un serveur local branché sur une vraie base Redis de test, si une base est disponible ; sinon, par le PM sur la preview.

## Risques
1. **Onzième joueur au même instant que le dixième** (probabilité très faible, impact faible) : deux arrivées simultanées pourraient porter la salle à 11. Accepté pour le POC.
2. **Quotas gratuits** (probabilité faible, impact moyen) : estimation (inférence) d'environ 3 000 requêtes et 8 000 commandes Redis par partie de 10 joueurs. Offre gratuite Upstash : 500 000 commandes par mois, soit environ 60 parties de 10. Vercel Hobby : 1 million d'invocations par mois selon la doc (100 000 selon la page tarifs, chiffres contradictoires). Suffisant pour le POC, à surveiller avant une démo à plusieurs.
3. **Usage commercial** (à trancher par le PM, hors technique) : la page tarifs Vercel réserve l'offre Hobby à un usage personnel non commercial. À clarifier avec Aziz avant d'utiliser le dispositif pour des prospects.
4. **Créateur qui quitte la partie** (probabilité moyenne, impact moyen) : personne ne peut plus passer à la manche suivante. Accepté en T2a (pas de reconnexion), à traiter en T2b.
5. **Vérification automatique limitée** : la preview Vercel n'est pas joignable depuis mon environnement (piège T1). Le test de bout en bout à deux navigateurs dépend d'une base Redis accessible en local.

## Hors plan
Timer et joueur absent, reconnexion, agents IA.
