import React, { useEffect, useRef, useState } from "react";
import { RotateCcw, Check, SkipForward } from "lucide-react";
import { ALL, ANIMES, GameDef, Sfx, Shell, ShareBtn, norm, pick, shuffle } from "./ui";
import { BINGO, LETTRES } from "./data";

interface P { def: GameDef; onBack: () => void; sfx: Sfx }

/* Petit Bac manga */
const FIELDS = ["Animé", "Personnage", "Attaque", "Objet"];
export function PetitBac({ def, onBack, sfx }: P) {
  const [letter, setLetter] = useState(() => pick(LETTRES)); const [phase, setPhase] = useState<"ready" | "play" | "end">("ready");
  const [vals, setVals] = useState(["", "", "", ""]); const [left, setLeft] = useState(90);
  useEffect(() => { if (phase !== "play") return; if (left <= 0) { setPhase("end"); sfx("lose"); return; }
    const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [phase, left]);
  const start = () => { setLetter(pick(LETTRES)); setVals(["", "", "", ""]); setLeft(90); setPhase("play"); sfx("click"); };
  const L = norm(letter);
  const ok = (v: string) => norm(v).replace(/^(le |la |les |l'|the )/, "").startsWith(L);
  const known = (v: string, k: number) => { const n = norm(v); if (n.length < 3) return false;
    const base = k === 0 ? ANIMES : k === 1 ? ALL.map((c) => c.name) : []; return base.some((x) => norm(x) === n || norm(x).includes(n)); };
  if (phase === "ready") return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">Prépare-toi</div>
      <div className="gm-stamp dg" style={{ fontSize: "4rem", padding: "4px 30px" }}>?</div>
      <div className="gm-big">Une lettre, 4 mots, 90 secondes.</div>
      <button className="gm-btn ink" onClick={start}>TIRER LA LETTRE</button>
    </Shell>
  );
  if (phase === "end") {
    const rows = vals.map((v, k) => ({ v, a: v.trim() && ok(v) ? 1 : 0, b: v.trim() && ok(v) && known(v, k) ? 1 : 0 }));
    const score = rows.reduce((s, r) => s + r.a + r.b, 0);
    return (
      <Shell def={def} onBack={onBack}>
        <div className="gm-stamp dg gm-pop">{score} pts</div>
        {rows.map((r, k) => <div key={k} className="gm-row"><b>{r.a ? "✓" : "✗"}</b><span style={{ opacity: .6 }}>{FIELDS[k]}</span>
          <span className="dg" style={{ marginLeft: "auto" }}>{r.v || "-"}{r.b ? " ★" : ""}</span></div>)}
        <div className="gm-sub">✓ commence par {letter} (+1) · ★ reconnu dans le jeu (+1)</div>
        <ShareBtn text={`Petit Bac Manga, lettre ${letter} : ${score} points !`} />
        <button className="gm-btn ink" onClick={start}><RotateCcw size={18} /> REJOUER</button>
      </Shell>
    );
  }
  return (
    <Shell def={def} onBack={onBack}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="gm-stamp dg" style={{ fontSize: "3rem", padding: "0 22px", transform: "rotate(-4deg)" }}>{letter}</div>
        <div className="dg" style={{ fontSize: "2.2rem", color: left <= 10 ? "#d62828" : "var(--ink)" }}>{left}s</div></div>
      {FIELDS.map((f, k) => <input key={f} className="gm-input" placeholder={`${f} en ${letter}...`} value={vals[k]} onChange={(e) => setVals(vals.map((x, j) => (j === k ? e.target.value : x)))} />)}
      <button className="gm-btn ink" onClick={() => { setPhase("end"); sfx("win"); }}><Check size={18} /> J'AI FINI</button>
    </Shell>
  );
}

/* Qui suis-je ? (Heads Up) */
export function HeadsUp({ def, onBack, sfx }: P) {
  const [phase, setPhase] = useState<"ready" | "count" | "play" | "end">("ready"); const [n, setN] = useState(3); const [left, setLeft] = useState(60);
  const [deck, setDeck] = useState(() => shuffle(ALL)); const [i, setI] = useState(0); const [found, setFound] = useState<string[]>([]);
  useEffect(() => { if (phase !== "count") return; if (n <= 0) { setPhase("play"); return; } const t = setTimeout(() => { setN(n - 1); sfx("click"); }, 800); return () => clearTimeout(t); }, [phase, n]);
  useEffect(() => { if (phase !== "play") return; if (left <= 0) { setPhase("end"); sfx("win"); return; } const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [phase, left]);
  const go = () => { setDeck(shuffle(ALL)); setI(0); setFound([]); setN(3); setLeft(60); setPhase("count"); };
  const hit = (yes: boolean) => { sfx(yes ? "reveal" : "click"); if (yes) setFound((f) => [...f, deck[i].name]); setI((x) => x + 1); };
  if (phase === "ready") return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-big dg">Pose le téléphone sur ton front</div>
      <div className="gm-big" style={{ fontSize: "1.1rem", fontWeight: 600 }}>Tes amis te font deviner le personnage, sans dire son nom. Un ami touche TROUVÉ ou PASSER.</div>
      <button className="gm-btn ink" onClick={go}>JE SUIS PRÊT</button>
    </Shell>
  );
  if (phase === "count") return <Shell def={def} onBack={onBack}><div className="gm-stamp dg" style={{ fontSize: "7rem", padding: "0 50px", marginTop: 40 }} key={n}>{n || "GO"}</div></Shell>;
  if (phase === "end") return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-stamp dg gm-pop">{found.length} trouvés</div>
      {found.map((f) => <div key={f} className="gm-row dg">{f}</div>)}
      <ShareBtn text={`Qui suis-je : ${found.length} personnages trouvés en 60 secondes !`} />
      <button className="gm-btn ink" onClick={go}><RotateCcw size={18} /> REJOUER</button>
    </Shell>
  );
  const c = deck[i % deck.length];
  return (
    <Shell def={def} onBack={onBack}>
      <div className="dg" style={{ textAlign: "center", fontSize: "1.6rem" }}>{left}s · {found.length} ✓</div>
      <div className="gm-card gm-pop" key={i} style={{ flex: 1, background: c.style, display: "grid", placeItems: "center", textAlign: "center", minHeight: 240 }}>
        <div><div className="dg" style={{ fontSize: "2.4rem", lineHeight: 1.1 }}>{c.name}</div><div style={{ fontWeight: 700, opacity: .7, marginTop: 8 }}>{c.anime}</div></div></div>
      <div className="gm-grid2"><button className="gm-btn mid" onClick={() => hit(false)}><SkipForward size={18} /> PASSER</button>
        <button className="gm-btn mid ok" onClick={() => hit(true)}><Check size={18} /> TROUVÉ</button></div>
    </Shell>
  );
}

/* Bingo otaku */
const LINES = (() => { const l: number[][] = []; for (let r = 0; r < 5; r++) { l.push([0, 1, 2, 3, 4].map((c) => r * 5 + c)); l.push([0, 1, 2, 3, 4].map((c) => c * 5 + r)); }
  l.push([0, 6, 12, 18, 24]); l.push([4, 8, 12, 16, 20]); return l; })();
export function Bingo({ def, onBack, sfx }: P) {
  const [items, setItems] = useState(() => shuffle(BINGO).slice(0, 25)); const [x, setX] = useState<number[]>([]);
  const lines = LINES.filter((l) => l.every((k) => x.includes(k))).length;
  const tog = (k: number) => { sfx("click"); setX(x.includes(k) ? x.filter((v) => v !== k) : [...x, k]); };
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">{x.length}/25 cochés · {lines} {lines > 1 ? "lignes" : "ligne"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
        {items.map((t, k) => <button key={t} className={`gm-cell ${x.includes(k) ? "x" : ""}`} onClick={() => tog(k)}>{t}</button>)}</div>
      {lines > 0 && <div className="gm-stamp dg gm-pop" style={{ fontSize: "1.6rem" }}>BINGO !</div>}
      <ShareBtn text={`Mon Bingo Otaku : ${x.length}/25 cases, ${lines} ligne(s) ! Fais le tien.`} />
      <button className="gm-btn ink" onClick={() => { setItems(shuffle(BINGO).slice(0, 25)); setX([]); }}><RotateCcw size={18} /> NOUVELLE GRILLE</button>
    </Shell>
  );
}
