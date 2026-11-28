# Tâches T2b - Timer de manche et reconnexion

Statut : informatif (méthode V5).

1. **Logique du timer** [1, 2, 3, 4] : heure limite par manche, révélation à 0, refus « Temps écoulé ». Tests avec horloge simulée.
2. **Logique de reconnexion** [5, 6, 7] : reprise de place par prénom d'un joueur parti, refus si présent, nouveau venu refusé.
3. **Serveur** : heure limite enregistrée au lancement et à chaque manche suivante, reprise de place, heure du serveur dans chaque vue.
4. **Écran** : compte à rebours dans la barre du haut, rouge sous 5 s.
5. **Vérification et PR** : partie automatique à 3 navigateurs en local, test sur la preview dans le navigateur intégré, PR au gabarit F.
