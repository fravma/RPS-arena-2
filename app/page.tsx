"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RULE } from "./ui";
import { saveToken } from "./session";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function go(url: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      saveToken(data.code, data.token);
      router.push(`/salle/${data.code}`);
    } catch (e) {
      setError((e as Error).message || "Erreur réseau, réessayez");
      setBusy(false);
    }
  }

  const cleanCode = code.trim().toUpperCase();

  return (
    <main>
      <header className="topbar">
        <span className="brand">RPS Arena</span>
        <a href="/solo">Jouer en solo contre des bots →</a>
      </header>

      <section className="hero">
        <h1>Pierre-Feuille-Ciseaux où la minorité gagne.</h1>
        <p className="rule">{RULE} De 2 à 10 joueurs.</p>
      </section>

      <section className="card">
        <label className="field" style={{ maxWidth: 360 }}>
          Votre prénom
          <input type="text" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>

        <div className="wrap">
          <div className="option">
            <h2>Créer une salle</h2>
            <p className="muted" style={{ margin: 0, flexGrow: 1 }}>Vous obtenez un code à partager, puis vous lancez la partie.</p>
            <button className="primary" disabled={busy || !name.trim()} onClick={() => go("/api/rooms")}>Créer une salle</button>
          </div>

          <div className="option paper">
            <h2>Rejoindre une salle</h2>
            <label className="field">
              Code de 4 lettres
              <input type="text" className="code-input" value={code} maxLength={4} onChange={(e) => setCode(e.target.value)} />
            </label>
            <button className="primary" disabled={busy || !name.trim() || cleanCode.length !== 4} onClick={() => go(`/api/rooms/${cleanCode}/join`)}>Rejoindre</button>
          </div>
        </div>

        {error && <p className="error" role="alert" style={{ margin: 0 }}>{error}</p>}
      </section>
    </main>
  );
}
