# Intention - RPS Arena (fiche de cadrage)

Validée par le PM le 23/11/2026. Méthode : « Méthode POC express » (projet Claude).

- **Commanditaire :** Aziz (exercice préparatoire à des POC prospects de 1 à 3 jours)
- **Problème :** faire s'affronter humains et agents IA dans un jeu où la meilleure stratégie dépend de ce que jouent les autres.
- **Utilisateur principal :** un joueur qui veut tester sa stratégie IA (skill.md) contre d'autres joueurs.
- **Critères de succès de la démo :**
  - a) Une partie de 10 manches en ligne avec au moins 2 humains et 1 agent IA connecté via MCP.
  - b) Deux skill.md différents s'affrontent, et on montre lequel gagne le plus sur N parties.
- **Règle métier centrale :** points = b / n + modificateur du coup joué. Un joueur sans coup marque 0 et ne compte ni dans b ni dans n.
- **Exemples du brief (futurs tests) :**
  - 1 Pierre contre 4 Ciseaux : la Pierre marque 4.
  - 4 Ciseaux contre 1 Feuille : chaque Ciseaux marque 0,25.
  - 10 joueurs, Feuille +0,5 : 5 Pierre, 3 Ciseaux, 2 Feuille donnent 0,60 / 0,67 / 3,00.
- **Contraintes :** 100 % Vercel (choix PM), 1 à 3 jours, pas de données réelles.
- **Hors scope :** Elo, comptes utilisateurs, historique entre parties.
- **Risques techniques :**
  - WebSocket coupée à la durée max de la fonction, 5 min par défaut (source : doc Vercel).
  - Pas d'état partagé entre instances, donc état de la salle dans Redis (inférence).
  - Pas d'alarme native pour le timer de manche (inférence).
  - `wait_for_next_round` (MCP) bloquant pourrait buter sur la durée max des fonctions (inférence).
  - Critère b : jouer N parties entre agents coûte du temps et des appels LLM (inférence).
- **Questions ouvertes à Aziz :**
  - Durée du timer par manche ?
  - Valeurs possibles des modificateurs (le brief ne donne que ±0,5) ?
