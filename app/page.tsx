"use client";

import { useEffect, useState } from "react";
import { MOVES, ROUNDS, countMoves, type Move } from "@/lib/engine";
import { formatModifier, formatPoints } from "@/lib/format";
import {
  ME,
  ROUND_SECONDS,
  chooseMove,
  gameTotals,
  gameWinners,
  nextRound,
  ranking,
  startGame,
  timeUp,
  validate,
  type SoloGame,
} from "@/lib/solo";

const LABEL: Record<Move, string> = { rock: "Pierre", paper: "Feuille", scissors: "Ciseaux" };
const ICON: Record<Move, string> = { rock: "✊", paper: "✋", scissors: "✌️" };

export default function Home() {
  const [game, setGame] = useState<SoloGame | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);

  // Timer de manche : repart à 20 s à chaque nouvelle manche, révèle à 0.
  const round = game?.round;
  const phase = game?.phase;
  useEffect(() => {
    if (phase !== "choose") return;
    setSecondsLeft(ROUND_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setGame((g) => (g ? timeUp(g) : g));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [round, phase]);

  return (
    <main>
      <h1>RPS Arena</h1>
      <p className="rule">
        Pierre-Feuille-Ciseaux où la minorité gagne. Points = joueurs battus ÷ joueurs ayant fait le même coup,
        plus le modificateur de la manche.
      </p>

      {!game && (
        <div className="card">
          <h2>Partie solo</h2>
          <p className="muted">10 manches contre 4 bots qui jouent au hasard. {ROUND_SECONDS} secondes par manche.</p>
          <div className="actions">
            <span />
            <button className="primary" onClick={() => setGame(startGame())}>Lancer une partie</button>
          </div>
        </div>
      )}

      {game && game.phase !== "over" && <RoundView game={game} secondsLeft={secondsLeft} setGame={setGame} />}

      {game && game.phase === "over" && <FinalView game={game} onReplay={() => setGame(startGame())} />}
    </main>
  );
}

function RoundView({
  game,
  secondsLeft,
  setGame,
}: {
  game: SoloGame;
  secondsLeft: number;
  setGame: (g: SoloGame) => void;
}) {
  const mod = game.modifiers[game.round];
  const result = game.phase === "reveal" ? game.history[game.history.length - 1] : null;
  const t = gameTotals(game);
  // Après la révélation, on met en évidence le coup réellement compté (aucun si « pas joué »).
  const highlighted = result ? result.moves[ME] : game.myMove;

  return (
    <>
      <div className="card row">
        <div>
          <div className="eyebrow">Manche {game.round + 1} sur {ROUNDS}</div>
          <div className="modifier">
            {ICON[mod.move]} {LABEL[mod.move]}{" "}
            <span className={mod.value > 0 ? "plus" : "minus"}>{formatModifier(mod.value)}</span>
          </div>
        </div>
        {game.phase === "choose" && (
          <div className={`timer ${secondsLeft <= 5 ? "low" : ""}`} aria-label="Temps restant">
            {secondsLeft}
          </div>
        )}
      </div>

      <div className="card">
        <div className="moves">
          {MOVES.map((m) => (
            <button
              key={m}
              className={`move ${highlighted === m ? "picked" : ""}`}
              disabled={game.phase !== "choose"}
              onClick={() => setGame(chooseMove(game, m))}
            >
              <span className="icon">{ICON[m]}</span>
              {LABEL[m]}
            </button>
          ))}
        </div>
        {game.phase === "choose" && (
          <div className="actions">
            <span className="muted">
              {game.myMove ? `${LABEL[game.myMove]}, modifiable jusqu'à la validation` : "Choisissez un coup"}
            </span>
            <button className="primary" disabled={!game.myMove} onClick={() => setGame(validate(game))}>
              Valider
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="card reveal">
          <div className="row" style={{ marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>Révélation</h2>
            <div className="counts">
              {MOVES.map((m) => (
                <span key={m}>{ICON[m]} {countMoves(result.moves)[m]}</span>
              ))}
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Joueur</th><th>Coup</th><th className="num">Manche</th><th className="num">Total</th></tr>
            </thead>
            <tbody>
              {ranking(game).map((p) => {
                const m = result.moves[p];
                return (
                  <tr key={p} className={p === ME ? "me" : ""}>
                    <td>{p}</td>
                    <td>{m ? `${ICON[m]} ${LABEL[m]}` : <span className="muted">pas joué</span>}</td>
                    <td className="num">{formatPoints(result.points[p])}</td>
                    <td className="num">{formatPoints(t[p])}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="actions">
            <span />
            <button className="primary" onClick={() => setGame(nextRound(game))}>
              {game.round + 1 >= ROUNDS ? "Voir le classement" : "Manche suivante"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FinalView({ game, onReplay }: { game: SoloGame; onReplay: () => void }) {
  const t = gameTotals(game);
  const w = gameWinners(game);
  const title = w.includes(ME) ? (w.length > 1 ? "Victoire partagée" : "Victoire") : w.length > 1 ? "Égalité en tête" : `${w[0]} gagne`;

  return (
    <div className="card reveal">
      <div className="eyebrow">Classement final</div>
      <h2 style={{ marginTop: 6 }}>{title}</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Joueur</th><th className="num">Total</th></tr>
        </thead>
        <tbody>
          {ranking(game).map((p, i) => (
            <tr key={p} className={p === ME ? "me" : ""}>
              <td>{i + 1}</td>
              <td>
                {p}
                {w.includes(p) && <span className="badge">Gagnant</span>}
              </td>
              <td className="num">{formatPoints(t[p])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="actions">
        <span />
        <button className="primary" onClick={onReplay}>Rejouer</button>
      </div>
    </div>
  );
}
