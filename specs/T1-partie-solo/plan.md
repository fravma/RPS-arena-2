# Plan T1 - Partie solo contre des bots

Statut : validé par le PM le 25/11/2026.

## Fichiers
- `lib/solo.ts` : la logique d'une partie solo, en fonctions pures (démarrer, choisir, valider, timer expiré, manche suivante). S'appuie sur le moteur T0, sans le modifier.
- `lib/solo.test.ts` : tests de cette logique.
- `lib/format.ts` (+ test) : affichage des points avec 2 décimales au plus (0,6 / 0,67 / 3).
- `app/page.tsx` : l'écran. Il affiche l'état de la partie et transmet les clics, sans calcul lui-même.
- `app/globals.css` : mise en forme minimale et lisible.

## Choix techniques
1. **Logique séparée de l'écran.** Toute la partie (qui a joué quoi, quelle manche, quels totaux) est gérée par `lib/solo.ts`. L'écran ne fait qu'afficher. Avantage : les critères 1 à 6 sont testables automatiquement, et cette logique pourra servir de base côté serveur en T2 (inférence).
2. **Tout dans le navigateur.** Aucun serveur, aucune base : la partie vit dans la page. Conforme au hors scope (rechargement = partie perdue).
3. **Bots au hasard, hasard injectable.** Comme en T0 : en test, on fixe le hasard pour connaître d'avance les coups des bots.
4. **Timer de 20 s dans le navigateur.** Il décompte chaque seconde ; à 0, la manche se révèle avec « pas joué » pour moi.
5. **Arrondi à l'affichage seulement.** Le moteur garde les valeurs exactes (décision T0).

## Besoins de testabilité
- Hasard fixable pour les bots et les modificateurs.
- La logique de partie se teste sans écran ; l'écran se vérifie sur la preview (par toi, et par un passage automatique de ma part avant la PR).

## Risques
1. **Validation et fin du timer au même instant** (probabilité faible, impact moyen) : la manche pourrait se révéler deux fois et compter deux fois les points. Parade : une manche déjà révélée ignore toute nouvelle révélation, avec un test dédié.
2. **Timer peu fiable si l'onglet passe en arrière-plan** (probabilité moyenne, impact faible) : les navigateurs ralentissent les minuteries des onglets inactifs, la manche peut durer plus de 20 s (inférence, non vérifié). Accepté : le timer de référence sera côté serveur en T2b.
3. **Bots au hasard peu représentatifs** (probabilité forte, impact faible) : 4 bots aléatoires répartissent leurs coups à peu près également, la tension « minorité contre foule » sera moins visible qu'avec de vrais joueurs (inférence). Accepté pour T1, la vraie tension arrive avec T2 et T4.
4. **Partie perdue au rechargement** : accepté (hors scope de la spec).

## Hors plan
Serveur, salle partagée, réglages (T2 et suivantes).
