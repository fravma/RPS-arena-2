"use client";

import { useEffect, useState } from "react";
import { MOVES, ROUNDS, countMoves } from "@/lib/engine";
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
import { LABEL, MoveIcon, RULE } from "../ui";

export default function Solo() {
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
      <header className="topbar">
        <a className="brand" href="/">RPS Arena</a>
        <span className="muted">Partie solo contre 4 bots</span>
      </header>

      {!game && (
        <>
          <section className="hero">
            <h1>Partie solo</h1>
            <p className="rule">{RULE} 10 manches contre 4 bots qui jouent au hasard, {ROUND_SECONDS} secondes par manche.</p>
          </section>
          <div className="actions">
            <a href="/">← Retour à l&apos;accueil</a>
            <button className="primary" onClick={() => setGame(startGame())}>Lancer une partie</button>
          </div>
        </>
      )}

      {game && game.phase !== "over" && <RoundView game={game} secondsLeft={secondsLeft} setGame={setGame} />}
      {game && game.phase === "over" && <FinalView game={game} onReplay={() => setGame(startGame())} />}
    </main>
  );
}

function RoundView({ game, secondsLeft, setGame }: { game: SoloGame; secondsLeft: number; setGame: (g: SoloGame) => void }) {
  const mod = game.modifiers[game.round];
  const result = game.phase === "reveal" ? game.history[game.history.length - 1] : null;
  const t = gameTotals(game);
  // Après la révélation, on met en évidence le coup réellement compté (aucun si « pas joué »).
  const highlighted = result ? result.moves[ME] : game.myMove;

  return (
    <>
      <div className="row">
        <div className="chips">
          <span className="chip">Manche {game.round + 1} / {ROUNDS}</span>
          <span className={`chip ${mod.move}-bg`} style={{ borderColor: "transparent" }}>
            Modificateur : {LABEL[mod.move]} <span className={mod.value > 0 ? "plus" : "minus"}>{formatModifier(mod.value)}</span>
          </span>
        </div>
        {game.phase === "choose" ? (
          <div className={`timer ${secondsLeft <= 5 ? "low" : ""}`} aria-label="Temps restant">{secondsLeft}</div>
        ) : (
          <button className="primary" onClick={() => setGame(nextRound(game))}>
            {game.round + 1 >= ROUNDS ? "Voir le classement" : "Manche suivante →"}
          </button>
        )}
      </div>

      <section className="card">
        <div className="moves">
          {MOVES.map((m) => (
            <button key={m} className={`move ${m} ${highlighted === m ? "picked" : ""}`} disabled={game.phase !== "choose"} onClick={() => setGame(chooseMove(game, m))}>
              <MoveIcon move={m} />
              {LABEL[m]}
            </button>
          ))}
        </div>
        {game.phase === "choose" && (
          <div className="actions">
            <span className="muted">{game.myMove ? `${LABEL[game.myMove]}, modifiable jusqu'à la validation` : "Choisissez un coup"}</span>
            <button className="primary" disabled={!game.myMove} onClick={() => setGame(validate(game))}>Valider</button>
          </div>
        )}
      </section>

      {result && (
        <section className="card reveal">
          <div className="row">
            <h1>Révélation</h1>
            <span className="muted">{MOVES.map((m) => `${LABEL[m]} ${countMoves(result.moves)[m]}`).join(" · ")}</span>
          </div>
          <div className="table-box">
            <table>
              <thead><tr><th>Joueur</th><th>Coup</th><th className="num">Manche</th><th className="num">Total</th></tr></thead>
              <tbody>
                {ranking(game).map((p) => {
                  const m = result.moves[p];
                  return (
                    <tr key={p} className={p === ME ? "me" : ""}>
                      <td>{p}</td>
                      <td>{m ? <span className={`pill ${m}-bg`}>{LABEL[m]}</span> : <span className="muted">pas joué</span>}</td>
                      <td className="num">{formatPoints(result.points[p])}</td>
                      <td className="num">{formatPoints(t[p])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function FinalView({ game, onReplay }: { game: SoloGame; onReplay: () => void }) {
  const t = gameTotals(game);
  const w = gameWinners(game);
  const title = w.includes(ME) ? (w.length > 1 ? "Victoire partagée" : "Victoire") : w.length > 1 ? "Égalité en tête" : `${w[0]} gagne`;
  return (
    <section className="card reveal">
      <div className="row">
        <div>
          <div className="eyebrow">Classement final</div>
          <h1>{title}</h1>
        </div>
        <button className="primary" onClick={onReplay}>Rejouer</button>
      </div>
      <div className="table-box">
        <table>
          <thead><tr><th>#</th><th>Joueur</th><th className="num">Total</th></tr></thead>
          <tbody>
            {ranking(game).map((p, i) => (
              <tr key={p} className={p === ME ? "me" : ""}>
                <td>{i + 1}</td>
                <td>{p}{w.includes(p) && <span className="badge">Gagnant</span>}</td>
                <td className="num">{formatPoints(t[p])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
