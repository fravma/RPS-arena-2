# Spec T3 - Agents IA via MCP

Statut : brouillon, en attente de validation PM.

## Pourquoi
C'est le cœur du brief : un joueur envoie sa propre IA dans la partie, pilotée par un fichier skill.md qui contient sa stratégie. Une meilleure stratégie doit gagner plus souvent. T3 rend cela possible ; T4 comparera des stratégies sur de nombreuses parties.

## Décisions de cadrage (PM, 28/11)
- L'agent tourne chez le joueur, dans sa propre conversation Claude (Claude Desktop), branchée au jeu par un connecteur personnalisé. Le jeu ne paie aucun token. (Option a.)
- Le jeu qui fait tourner lui-même des agents (option b, avec une clé API) est reporté à T4.
- Test prévu par le PM : deux conversations Claude, chacune avec son propre skill.md, dans la même salle.

## Quoi
- Le jeu expose un serveur MCP avec 4 actions : rejoindre une salle, lire l'état de la partie, jouer un coup, attendre la manche suivante.
- Une page du jeu explique pas à pas comment brancher Claude et lancer un agent, avec un exemple de skill.md.
- Un agent joue avec exactement les mêmes règles que les humains : même timer, mêmes informations, coups cachés jusqu'à la révélation.

## Critères d'acceptation (vérifiés par le PM avec Claude Desktop et un onglet du jeu)

1. **Brancher Claude au jeu**
   Étant donné la page « Agents IA » du jeu, quand je suis ses étapes dans Claude Desktop, alors le connecteur RPS Arena apparaît dans Claude et propose les 4 actions du jeu.
2. **Un agent rejoint une salle**
   Étant donné une salle créée dans un onglet, quand j'écris dans une conversation Claude « Rejoins la salle KQZT sous le nom Agent Prudent », alors « Agent Prudent » apparaît dans la salle d'attente avec une mention « IA ».
3. **Un agent joue une partie complète**
   Étant donné une partie lancée avec au moins un agent, alors l'agent joue chaque manche sans intervention de ma part ; les humains voient « a joué » pour lui ; la révélation attend aussi son coup (ou la fin du timer).
4. **Mêmes règles que les humains**
   Étant donné une manche ouverte, alors l'agent ne voit pas les coups des autres avant la révélation, son coup est refusé après la fin du timer, et il ne peut jouer qu'une fois par manche.
5. **Un agent n'est jamais administrateur**
   Étant donné le créateur humain qui quitte la salle, alors l'administration passe au joueur humain suivant, jamais à un agent.
6. **Deux agents dans la même salle**
   Étant donné deux conversations Claude avec deux skill.md différents, quand elles rejoignent la même salle, alors les deux agents jouent la partie jusqu'au classement final.

## Expérience (UX/UI)
- Mention « IA » à côté du nom d'un agent, partout où les joueurs sont listés (salle d'attente, joueurs de la manche, révélation, classement).
- Nouvelle page « Agents IA », accessible depuis l'accueil : l'adresse du connecteur à copier, les étapes de branchement dans Claude Desktop, un message de départ à coller dans la conversation, un exemple de skill.md (celui du brief, traduit).
- Pas de maquette : une page de texte et une mention sur des écrans existants.

## Consommation de tokens (à mesurer)
L'agent consomme la limite d'utilisation Claude du joueur à chaque action. Ordre de grandeur et conseils pour réduire la consommation : mesurés sur la première partie de test et ajoutés à la page « Agents IA ».

## Hors scope
Agents lancés par le jeu (T4), comparaison automatique de stratégies (T4), classement Elo, compte ou mot de passe pour utiliser le connecteur (toute personne ayant l'adresse peut faire jouer un agent).

## Questions ouvertes
1. **Timer de 10 s et agents.** Un agent doit lire l'état, raisonner puis jouer : plusieurs allers-retours qui peuvent dépasser 10 s (inférence, non mesuré). Proposition : mesurer dès la première tâche avec un vrai agent ; si 10 s est trop court, tu choisiras entre allonger le timer pour tous ou garder 10 s.
2. **Bots simples dans les salles** (au hasard, gratuits) : non retenus pour T3 puisque tu testes avec deux agents. À rouvrir si besoin d'adversaires sans effort.
