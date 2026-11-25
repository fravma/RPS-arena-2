# Tâches T1 - Partie solo contre des bots

Statut : brouillon, en attente de validation PM.

Chaque tâche se termine par des tests verts. Les numéros entre crochets renvoient aux critères de la spec, « R » aux risques du plan.

1. **Logique de partie** [1, 2, 3, 5, 6]
   Démarrer (4 bots, 10 modificateurs, manche 1), choisir et changer de coup, valider (les bots jouent, la manche est scorée), manche suivante, fin de partie et gagnants, rejouer.
   Fait quand : chaque étape est testée avec un hasard fixé.

2. **Timer expiré et double révélation** [4, R1]
   Révéler sans coup de ma part (« pas joué », 0 point) ; une manche déjà révélée ignore une nouvelle révélation.
   Fait quand : les deux cas sont testés, tests écrits avant le code.

3. **Affichage des points** [3]
   2 décimales au plus : 0,6 / 0,67 / 3 / -0,5.
   Fait quand : ces 4 cas sont testés.

4. **Écran** [1 à 7]
   Page d'accueil avec la règle expliquée, manche avec modificateur et timer de 20 s, révélation, classement, rejouer. Mise en forme minimale.
   Fait quand : build OK, et une partie complète jouée automatiquement en local sans erreur.

5. **PR prête pour ta vérification**
   Description au gabarit F (critères avec données concrètes, risques avec statut), lien de la preview, partie automatique rejouée sur la preview.
