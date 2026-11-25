# Découpage - RPS Arena

Validé par le PM le 23/11/2026.

| Tranche | Valeur démontrée | Critère de démo servi |
|---|---|---|
| T0 | Moteur de score pur, testé avec les exemples du brief | Base des deux |
| T1 | Partie solo contre des bots aléatoires, jouable en ligne (version courte) | Règle visible en action |
| T2a | Salle partagée : code de salle, plusieurs humains, coups cachés, reveal (rafraîchissement manuel accepté) | a) |
| T2b | Timer de manche côté serveur + mise à jour en temps réel | a) |
| T3 | Serveur MCP (4 outils) : un agent IA rejoint une salle et joue | a) atteint |
| T4 | 2 ou 3 skill.md contrastés, N parties entre agents, comparaison | b) atteint |

Points ouverts :
- T1 : critère « timer expiré » à garder ou couper (arbitrage PM au moment de la spec T1).
- T4 : valeur de N et coût des parties entre agents LLM (à trancher dans la spec T4).
- T2a : critère à inclure dans la spec : « une 11e personne ne peut pas rejoindre la salle » et « une partie ne démarre pas avec moins de 2 joueurs » (décision T0, le moteur ne contrôle pas le nombre de joueurs).
