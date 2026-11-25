# Tâches T0 - Moteur de score

Statut : brouillon, en attente de validation PM.

Chaque tâche se termine par des tests verts. Les numéros entre crochets renvoient aux critères d'acceptation de la spec.

1. **Score d'une manche, cas standard** [1, 2, 3, 6]
   Types de base et `scoreRound` : b / n + modificateur, joueur absent à 0.
   Fait quand : les 3 exemples du brief et le cas « joueur absent » passent.

2. **Cas limites du score** [4, 5]
   Tout le monde pareil (personne ne marque, modificateur compris), modificateur en défaite et total négatif, un seul joueur a joué, modificateur sur un coup non joué.
   Fait quand : les 4 cas passent, sans casser la tâche 1.

3. **Fin de partie** [7]
   `totals` et `winners`, avec la parade sur les arrondis.
   Fait quand : égalité partagée, et le cas 2,5 contre 2,4999999999999996 donne bien une égalité.

4. **Tirage des modificateurs** [8]
   `drawModifiers` avec hasard injectable.
   Fait quand : 10 modificateurs valides (coup + valeur ±0,5), et résultat identique avec une même source de hasard fixe.

5. **PR prête pour la vérification**
   PR `t0-moteur` vers `main`, CI verte, liste des tests (noms = critères) affichée dans la PR pour relecture PM.
