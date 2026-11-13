import React, { useEffect, useRef, useState } from "react";
import { RotateCcw, Dices } from "lucide-react";
import { ALL, GameDef, Prog, Sfx, Shell, ShareBtn, pick, shuffle } from "./ui";
import { DESTIN, PRIME_Q, ROLES, SURVIE } from "./data";

interface P { def: GameDef; onBack: () => void; sfx: Sfx }

/* Roulette de destin */
export function Destin({ def, onBack, sfx }: P) {
  const [uni, setUni] = useState<string | null>(null); const [round, setRound] = useState(0);
  const [fin, setFin] = useState<Record<string, string>>({}); const [stopped, setStopped] = useState(0); const [, setTick] = useState(0);
  useEffect(() => {
    if (!uni) return; const d = DESTIN[uni]; const f: Record<string, string> = {}; d.rows.forEach((r) => (f[r.k] = pick(r.v)));
    setFin(f); setStopped(0); const iv = setInterval(() => setTick((x) => x + 1), 80);
    const ts = d.rows.map((_, i) => setTimeout(() => { setStopped(i + 1); sfx("click"); }, 700 + i * 650));
    return () => { clearInterval(iv); ts.forEach(clearTimeout); };
  }, [uni, round]);
  if (!uni) return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-big dg">Choisis ton univers</div>
      {Object.entries(DESTIN).map(([k, d]) => <button key={k} className="gm-btn" onClick={() => setUni(k)}>
        <span className="dg" style={{ fontSize: "1.1rem" }}>{d.label}</span><span style={{ fontFamily: "'Noto Serif JP'", fontSize: "2rem" }}>{d.kanji}</span></button>)}
    </Shell>
  );
  const d = DESTIN[uni]; const end = stopped >= d.rows.length;
  const text = `Mon destin dans ${d.label} : ` + d.rows.map((r) => `${r.k} ${fin[r.k]}`).join(", ") + ". Et toi ?";
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">{d.label} · ton destin</div>
      {d.rows.map((r, i) => <div key={r.k} className="gm-card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span className="gm-sub" style={{ textAlign: "left" }}>{r.k}</span>
        <span className={`dg ${i < stopped ? "gm-pop" : ""}`} key={i < stopped ? "s" : "r"} style={{ fontSize: "1.05rem", textAlign: "right", opacity: i < stopped ? 1 : .45 }}>
          {i < stopped ? fin[r.k] : pick(r.v)}</span></div>)}
      {end && <><ShareBtn text={text} />
        <button className="gm-btn ink" onClick={() => setRound((x) => x + 1)}><RotateCcw size={18} /> RELANCER</button>
        <button className="gm-btn mid" onClick={() => setUni(null)}>CHANGER D'UNIVERS</button></>}
    </Shell>
  );
}

/* Qui est ton... (gacha) */
export function Gacha({ def, onBack, sfx }: P) {
  const [name, setName] = useState(""); const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState(() => shuffle(ALL)); const [got, setGot] = useState<string[]>([]);
  const [spin, setSpin] = useState(false); const [, setTick] = useState(0); const t = useRef<number>();
  useEffect(() => () => clearTimeout(t.current), []);
  const draw = () => {
    if (spin) return; setSpin(true); sfx("click"); const iv = setInterval(() => setTick((x) => x + 1), 70);
    t.current = window.setTimeout(() => { clearInterval(iv); setGot((g) => [...g, deck[g.length].name]); setSpin(false); sfx("reveal"); }, 1100);
  };
  const reset = () => { setDeck(shuffle(ALL)); setGot([]); };
  if (!started) return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-big dg">Comment tu t'appelles ?</div>
      <input className="gm-input" placeholder="Ton prénom (facultatif)" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="gm-btn ink" onClick={() => setStarted(true)}>C'EST PARTI</button>
    </Shell>
  );
  const i = got.length; const end = i >= ROLES.length;
  const text = `${name || "Mon"} gacha otaku : ` + ROLES.map((r, k) => `${r} = ${got[k]}`).join(" | ");
  return (
    <Shell def={def} onBack={onBack} foot={<Prog i={i} n={ROLES.length} />}>
      {!end && <>
        <div className="gm-sub">{name ? name + ", " : ""}qui est...</div>
        <div className="gm-card dg gm-big" style={{ minHeight: 120, display: "grid", placeItems: "center" }}>{ROLES[i]} ?</div>
        <div className="gm-card gm-big dg" style={{ minHeight: 110, display: "grid", placeItems: "center", opacity: spin ? .5 : 1 }}>{spin ? pick(ALL).name : "???"}</div>
        <button className="gm-btn ink" disabled={spin} onClick={draw}><Dices size={20} /> TIRER</button></>}
      {got.map((g, k) => <div key={k} className="gm-row gm-pop"><b>{k + 1}</b><span style={{ opacity: .6 }}>{ROLES[k]}</span><span className="dg" style={{ marginLeft: "auto" }}>{g}</span></div>)}
      {end && <><ShareBtn text={text} /><button className="gm-btn ink" onClick={reset}><RotateCcw size={18} /> RECOMMENCER</button></>}
    </Shell>
  );
}

/* Prime et rang */
const RANKS: [number, string, string][] = [[16, "S", "Menace mondiale"], [14, "A", "Légende vivante"], [12, "B", "Redoutable"], [10, "C", "Solide"], [8, "D", "Prometteur"], [0, "E", "Civil courageux"]];
export function Prime({ def, onBack, sfx }: P) {
  const [name, setName] = useState(""); const [i, setI] = useState(-1); const [pts, setPts] = useState(0);
  const [res, setRes] = useState<{ r: string; l: string; b: number } | null>(null);
  const answer = (p: number) => {
    sfx("click"); const s = pts + p;
    if (i + 1 >= PRIME_Q.length) { const total = s + Math.floor(Math.random() * 4); const [, r, l] = RANKS.find((x) => total >= x[0])!;
      setRes({ r, l, b: total * total * 1500000 + Math.floor(Math.random() * 900000) }); sfx("win"); } else { setPts(s); setI(i + 1); }
  };
  const again = () => { setRes(null); setI(-1); setPts(0); };
  if (res) {
    const b = res.b.toLocaleString("fr-FR");
    return (
      <Shell def={def} onBack={onBack}>
        <div className="gm-sub">{name || "Wanted"} · rang de chasseur</div>
        <div className="gm-stamp dg gm-pop" style={{ fontSize: "5rem", padding: "6px 34px" }}>{res.r}</div>
        <div className="gm-big dg">{res.l}</div>
        <div className="gm-card gm-big dg" style={{ fontSize: "1.5rem" }}>PRIME<br />{b} Berrys</div>
        <ShareBtn text={`${name || "Moi"} : rang ${res.r} (${res.l}), prime de ${b} Berrys ! Et toi ?`} />
        <button className="gm-btn ink" onClick={again}><RotateCcw size={18} /> REFAIRE LE TEST</button>
      </Shell>
    );
  }
  if (i < 0) return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-big dg">Quel est ton nom de pirate ?</div>
      <input className="gm-input" placeholder="Ton nom (facultatif)" value={name} onChange={(e) => setName(e.target.value)} />
      <button className="gm-btn ink" onClick={() => setI(0)}>COMMENCER</button>
    </Shell>
  );
  const q = PRIME_Q[i];
  return (
    <Shell def={def} onBack={onBack} foot={<Prog i={i} n={PRIME_Q.length} />}>
      <div className="gm-card gm-big dg gm-pop" key={i} style={{ minHeight: 130, display: "grid", placeItems: "center" }}>{q.q}</div>
      {q.o.map(([t, p]) => <button key={t} className="gm-btn" onClick={() => answer(p)}>{t}</button>)}
    </Shell>
  );
}

/* Roue de survie */
export function Survie({ def, onBack, sfx }: P) {
  const mk = () => shuffle(ALL).slice(0, 8).map((c) => c.name);
  const [alive, setAlive] = useState<string[]>(mk); const [log, setLog] = useState<string[]>([]);
  const step = () => {
    if (alive.length <= 1) return; sfx("vote");
    const [a, b] = shuffle<string>(alive); setAlive(alive.filter((x) => x !== a));
    setLog((l) => [pick(SURVIE).replace(/\{a\}/g, a).replace(/\{b\}/g, b), ...l]);
  };
  const reset = () => { setAlive(mk()); setLog([]); };
  const win = alive.length === 1 ? alive[0] : null;
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">{alive.length} en vie</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>{alive.map((n) => <span key={n} className="gm-pill">{n}</span>)}</div>
      {win ? <>
        <div className="gm-stamp dg gm-pop" style={{ fontSize: "1.6rem", textAlign: "center" }}>👑 {win}</div>
        <ShareBtn text={`Dans ma Roue de la survie, ${win} a survécu !`} />
        <button className="gm-btn ink" onClick={reset}><RotateCcw size={18} /> NOUVELLE PARTIE</button></>
        : <button className="gm-btn ink" onClick={step}>TOUR SUIVANT</button>}
      {log.map((l, k) => <div key={log.length - k} className="gm-row" style={{ opacity: k ? .55 : 1 }}>{l}</div>)}
    </Shell>
  );
}
