"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MOVES, countMoves, type Move } from "@/lib/engine";
import { formatModifier, formatPoints } from "@/lib/format";
import type { PlayerView } from "@/lib/room";
import { LABEL, MoveIcon } from "../../ui";
import { clearToken, readToken, saveToken } from "../../session";

const POLL_MS = 2000;
const AVATAR = ["rock-bg", "paper-bg", "scissors-bg"];

export default function Salle() {
  const { code: rawCode } = useParams<{ code: string }>();
  const code = rawCode.toUpperCase();
  const router = useRouter();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [view, setView] = useState<PlayerView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Move | null>(null);
  const [busy, setBusy] = useState(false);
  /** Décalage entre l'horloge du serveur et celle du navigateur (ms). */
  const [offset, setOffset] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => setToken(readToken(code)), [code]);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/rooms/${code}`, { headers: { "x-player-token": token }, cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setView(data.view);
        setOffset(data.view.serverNow - Date.now());
        setError(null);
      } else setError(data.error);
    } catch {
      setError("Connexion perdue, nouvel essai dans 2 secondes");
    }
  }, [code, token]);

  // Mise à jour automatique toutes les 2 s (décision produit T2a).
  useEffect(() => {
    if (!token) return;
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [token, refresh]);

  // Compte à rebours : rafraîchi 4 fois par seconde d'après l'heure du serveur ; à 0, on relit l'état aussitôt.
  const deadline = view?.phase === "choose" ? view.deadline : null;
  const secondsLeft = deadline ? Math.max(0, Math.ceil((deadline - (Date.now() + offset)) / 1000)) : null;
  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [deadline]);
  useEffect(() => {
    if (secondsLeft === 0) refresh();
  }, [secondsLeft, refresh]);

  // Nouvelle manche : on efface le coup sélectionné.
  const round = view?.round;
  useEffect(() => setPicked(null), [round]);

  async function act(action: string, body: object = {}) {
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/rooms/${code}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-player-token": token },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.ok) setError(data.error);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    await act("leave");
    clearToken(code);
    router.push("/");
  }

  if (token === undefined) return null;
  if (!token) return <JoinFromLink code={code} onJoined={(t) => { saveToken(code, t); setToken(t); }} />;

  return (
    <main>
      <header className="topbar">
        <div className="chips">
          <a className="brand" href="/">RPS Arena</a>
          <span className="muted">Salle {code}</span>
        </div>
        {view && view.phase !== "lobby" && view.modifier && (
          <div className="chips">
            <span className="chip">{view.phase === "over" ? "Partie terminée" : `Manche ${view.round + 1} / 10`}</span>
            {secondsLeft !== null && (
              <span className={`timer ${secondsLeft <= 5 ? "low" : ""}`} aria-label="Temps restant">{secondsLeft}</span>
            )}
            {view.phase !== "over" && (
              <span className={`chip ${view.modifier.move}-bg`} style={{ borderColor: "transparent" }}>
                {LABEL[view.modifier.move]} <span className={view.modifier.value > 0 ? "plus" : "minus"}>{formatModifier(view.modifier.value)}</span>
              </span>
            )}
          </div>
        )}
        <button type="button" onClick={leave} style={{ background: "none", border: 0, font: "inherit", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "inherit", textDecoration: "underline" }}>
          Quitter la salle
        </button>
      </header>

      {error && <p className="error" role="alert" style={{ margin: 0 }}>{error}</p>}
      {!view && !error && <p className="muted">Chargement de la salle...</p>}

      {view?.phase === "lobby" && <Lobby view={view} busy={busy} onStart={() => act("start")} />}
      {view && (view.phase === "choose" || view.phase === "reveal") && (
        <Round view={view} busy={busy || secondsLeft === 0} picked={picked} setPicked={setPicked} onPlay={() => picked && act("move", { move: picked })} onNext={() => act("next")} />
      )}
      {view?.phase === "over" && <Final view={view} />}
    </main>
  );
}

function JoinFromLink({ code, onJoined }: { code: string; onJoined: (token: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function join() {
    const res = await fetch(`/api/rooms/${code}/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (data.ok) onJoined(data.token); else setError(data.error);
  }
  return (
    <main>
      <header className="topbar"><a className="brand" href="/">RPS Arena</a></header>
      <section className="card">
        <h1>Rejoindre la salle {code}</h1>
        <label className="field" style={{ maxWidth: 360 }}>
          Votre prénom
          <input type="text" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <div className="actions">
          {error ? <span className="error">{error}</span> : <span />}
          <button className="primary" disabled={!name.trim()} onClick={join}>Rejoindre</button>
        </div>
      </section>
    </main>
  );
}

function Lobby({ view, busy, onStart }: { view: PlayerView; busy: boolean; onStart: () => void }) {
  const present = view.players.filter((p) => p.present);
  const [copy, setCopy] = useState<"idle" | "done" | "failed">("idle");
  const link = typeof window !== "undefined" ? `${location.origin}/salle/${view.code}` : "";
  return (
    <>
      <div className="wrap" style={{ alignItems: "stretch" }}>
        <section className="option rock-bg" style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div className="eyebrow">Code de la salle</div>
          <div className="room-code">{view.code}</div>
          <p style={{ margin: 0, fontSize: 14 }}>À dicter ou à partager : les joueurs le saisissent sur l&apos;accueil.</p>
          <button type="button" onClick={async () => setCopy((await copyText(link)) ? "done" : "failed")}
            style={{ background: "none", border: 0, padding: 0, font: "inherit", fontWeight: 600, fontSize: 14, textAlign: "left", cursor: "pointer", color: "inherit", textDecoration: "underline", marginTop: "auto" }}>
            {copy === "done" ? "Lien copié ✓" : "Copier le lien d'invitation →"}
          </button>
          {copy === "failed" && (
            <label className="field" style={{ fontSize: 13 }}>
              Copie impossible ici : sélectionnez le lien
              <input type="text" readOnly value={link} onFocus={(e) => e.currentTarget.select()} style={{ fontSize: 13 }} />
            </label>
          )}
        </section>

        <section className="card grow">
          <div className="row">
            <h1>Salle d&apos;attente</h1>
            <span className="muted"><strong style={{ color: "var(--text)" }}>{present.length}</strong> / 10 joueurs</span>
          </div>
          <ul className="players">
            {present.map((p, i) => (
              <li key={p.id}>
                <span className={`avatar ${AVATAR[i % 3]}`} aria-hidden="true">{p.name[0]?.toUpperCase()}</span>
                {p.name}{p.id === view.meId ? " (vous)" : ""}{p.isAdmin ? " · admin" : ""}
              </li>
            ))}
          </ul>
          <div className="actions" style={{ borderTop: "1px solid var(--line)", paddingTop: 16, marginTop: "auto" }}>
            {view.isAdmin ? (
              <>
                <span className="muted">{present.length < 2 ? "2 joueurs minimum pour lancer." : "Vous êtes l'administrateur : vous lancez la partie."}</span>
                <button className="primary" disabled={busy || !view.canStart} onClick={onStart}>{present.length < 2 ? "2 joueurs minimum" : "Lancer la partie"}</button>
              </>
            ) : (
              <span className="muted">En attente du lancement par l&apos;administrateur.</span>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function Round(props: { view: PlayerView; busy: boolean; picked: Move | null; setPicked: (m: Move) => void; onPlay: () => void; onNext: () => void }) {
  const { view, busy, picked, setPicked, onPlay, onNext } = props;
  const played = Boolean(view.myMove);
  const highlighted = view.result ? view.result.moves[view.meId] : view.myMove ?? picked;
  const active = view.players.filter((p) => p.present || p.hasPlayed);
  const name = (id: string) => view.players.find((p) => p.id === id)?.name ?? "?";

  if (view.phase === "reveal" && view.result) {
    const result = view.result;
    const counts = countMoves(result.moves);
    const order = [...view.players].sort((a, b) => view.totals[b.id] - view.totals[a.id]);
    return (
      <>
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }} className="reveal">
          <div className="row">
            <h1>Révélation</h1>
            {view.isAdmin ? (
              <button className="primary" disabled={busy} onClick={onNext}>{view.round + 1 >= 10 ? "Voir le classement" : "Manche suivante →"}</button>
            ) : (
              <span className="muted">En attente de l&apos;administrateur pour la suite.</span>
            )}
          </div>
          <div className="tiles">
            {MOVES.filter((m) => counts[m] > 0).map((m) => {
              const anyone = Object.keys(result.moves).find((id) => result.moves[id] === m)!;
              return (
                <div key={m} className={`tile ${m}-bg`}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{LABEL[m]} · {counts[m]} joueur{counts[m] > 1 ? "s" : ""}</div>
                  </div>
                  <div>
                    <div className="pts">{formatPoints(result.points[anyone])}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, textAlign: "right" }}>pts chacun</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="card table-box" style={{ padding: "14px 20px" }}>
          <table>
            <thead><tr><th>#</th><th>Joueur</th><th>Coup</th><th className="num">Manche</th><th className="num">Total</th></tr></thead>
            <tbody>
              {order.map((p, i) => {
                const m = result.moves[p.id];
                return (
                  <tr key={p.id} className={p.id === view.meId ? "me" : ""}>
                    <td>{i + 1}</td>
                    <td>{p.name}{p.id === view.meId ? " (vous)" : ""}{!p.present ? " · parti" : ""}</td>
                    <td>{m ? <span className={`pill ${m}-bg`}>{LABEL[m]}</span> : <span className="muted">pas joué</span>}</td>
                    <td className="num">{formatPoints(result.points[p.id])}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{formatPoints(view.totals[p.id])}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </>
    );
  }

  return (
    <div className="wrap">
      <section className="card grow">
        <h1>Votre coup</h1>
        <div className="moves">
          {MOVES.map((m) => (
            <button key={m} className={`move ${m} ${highlighted === m ? "picked" : ""}`} disabled={played || busy} onClick={() => setPicked(m)}>
              <MoveIcon move={m} />
              {LABEL[m]}
            </button>
          ))}
        </div>
        <div className="actions">
          <span className="muted">
            {played ? `${LABEL[view.myMove!]} validé. En attente des autres joueurs.` : picked ? `${LABEL[picked]}, modifiable jusqu'à la validation.` : "Choisissez un coup."}
          </span>
          {!played && <button className="primary" disabled={!picked || busy} onClick={onPlay}>Valider</button>}
        </div>
      </section>

      <aside className="card side" style={{ gap: 10, padding: "18px 20px" }}>
        <div className="row">
          <h2>Joueurs</h2>
          <span className="muted"><strong style={{ color: "var(--text)" }}>{active.filter((p) => p.hasPlayed).length}</strong> / {active.length} ont joué</span>
        </div>
        <ul className="status-list">
          {active.map((p) => (
            <li key={p.id}>
              <span>{name(p.id)}{p.id === view.meId ? " (vous)" : ""}</span>
              <span className={p.hasPlayed ? "played" : "waiting"}>{p.hasPlayed ? "a joué" : p.present ? "en attente" : "parti"}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Final({ view }: { view: PlayerView }) {
  const order = [...view.players].sort((a, b) => view.totals[b.id] - view.totals[a.id]);
  const meWins = view.winners.includes(view.meId);
  const title = meWins ? (view.winners.length > 1 ? "Victoire partagée" : "Victoire") : view.winners.length > 1 ? "Égalité en tête" : `${order[0]?.name} gagne`;
  return (
    <section className="card reveal">
      <div className="row">
        <div>
          <div className="eyebrow">Classement final</div>
          <h1>{title}</h1>
        </div>
        <a href="/">Nouvelle partie →</a>
      </div>
      <div className="table-box">
        <table>
          <thead><tr><th>#</th><th>Joueur</th><th className="num">Total</th></tr></thead>
          <tbody>
            {order.map((p, i) => (
              <tr key={p.id} className={p.id === view.meId ? "me" : ""}>
                <td>{i + 1}</td>
                <td>{p.name}{p.id === view.meId ? " (vous)" : ""}{view.winners.includes(p.id) && <span className="badge">Gagnant</span>}</td>
                <td className="num">{formatPoints(view.totals[p.id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Copie un texte : API presse-papiers, puis ancienne méthode ; renvoie false si les deux échouent. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}
