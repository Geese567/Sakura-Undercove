import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ALL, GameDef, Prog, Sfx, Shell, ShareBtn, shuffle } from "./ui";
import { DILEMMES } from "./data";
import { Character } from "../types";

interface P { def: GameDef; onBack: () => void; sfx: Sfx }
const pickN = (n: number) => shuffle(ALL).slice(0, n);

/* Blind ranking */
export function Blind({ def, onBack, sfx }: P) {
  const N = 10; const [deck, setDeck] = useState(() => pickN(N)); const [slots, setSlots] = useState<(Character | null)[]>(Array(N).fill(null)); const [i, setI] = useState(0);
  const place = (k: number) => { if (slots[k] || i >= N) return; sfx("click"); const s = [...slots]; s[k] = deck[i]; setSlots(s); setI(i + 1); };
  const reset = () => { setDeck(pickN(N)); setSlots(Array(N).fill(null)); setI(0); };
  const end = i >= N;
  return (
    <Shell def={def} onBack={onBack} foot={<Prog i={i} n={N} />}>
      {!end ? <>
        <div className="gm-sub">Place-le sans savoir qui arrive après</div>
        <div className="gm-card gm-pop" key={i} style={{ textAlign: "center", borderColor: deck[i].style }}>
          <div className="dg" style={{ fontSize: "1.8rem" }}>{deck[i].name}</div><div style={{ fontWeight: 700, opacity: .6 }}>{deck[i].anime}</div></div></>
        : <>
          <div className="gm-stamp dg gm-pop">TON TOP 10</div>
          <ShareBtn text={"Mon Blind Ranking :\n" + slots.map((c, k) => `${k + 1}. ${c!.name}`).join("\n")} />
          <button className="gm-btn ink" onClick={reset}><RotateCcw size={18} /> REJOUER</button></>}
      {slots.map((c, k) => <button key={k} onClick={() => place(k)} className={`gm-row gm-slot ${c ? "" : "empty"}`} style={{ textAlign: "left", color: "var(--ink)" }}>
        <b>{k + 1}</b><span className={c ? "dg" : ""} style={{ fontSize: c ? ".85rem" : ".75rem" }}>{c ? c.name : end ? "" : "Libre"}</span></button>)}
    </Shell>
  );
}

/* Tournoi à élimination */
export function Tournoi({ def, onBack, sfx }: P) {
  const [cur, setCur] = useState(() => pickN(8)); const [nxt, setNxt] = useState<Character[]>([]); const [i, setI] = useState(0);
  const champ = cur.length === 1 ? cur[0] : null;
  const win = (c: Character) => { sfx("vote"); const n = [...nxt, c];
    if ((i + 1) * 2 >= cur.length) { setCur(n); setNxt([]); setI(0); if (n.length === 1) sfx("win"); } else { setNxt(n); setI(i + 1); } };
  const reset = () => { setCur(pickN(8)); setNxt([]); setI(0); };
  if (champ) return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">Le grand vainqueur</div>
      <div className="gm-stamp dg gm-pop" style={{ fontSize: "1.8rem", textAlign: "center" }}>👑 {champ.name}</div>
      <div className="gm-big" style={{ fontWeight: 700 }}>{champ.anime}</div>
      <ShareBtn text={`Mon champion du tournoi otaku : ${champ.name} (${champ.anime}) !`} />
      <button className="gm-btn ink" onClick={reset}><RotateCcw size={18} /> NOUVEAU TOURNOI</button>
    </Shell>
  );
  const a = cur[i * 2], b = cur[i * 2 + 1]; const round = cur.length === 8 ? "Quarts de finale" : cur.length === 4 ? "Demi-finales" : "FINALE";
  const side = (c: Character) => <button key={c.name} className="gm-card gm-pop" onClick={() => win(c)} style={{ flex: 1, background: c.style, textAlign: "center", display: "grid", placeItems: "center", color: "var(--ink)" }}>
    <div><div className="dg" style={{ fontSize: "1.6rem" }}>{c.name}</div><div style={{ fontWeight: 700, opacity: .7 }}>{c.anime}</div></div></button>;
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">{round} · duel {i + 1}/{cur.length / 2}</div>
      <div key={`${cur.length}-${i}`} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 340 }}>
        {side(a)}<div className="dg" style={{ textAlign: "center", fontSize: "1.4rem" }}>VS</div>{side(b)}</div>
    </Shell>
  );
}

/* Tu préfères */
export function Preferes({ def, onBack, sfx }: P) {
  const [qs, setQs] = useState(() => shuffle(DILEMMES).slice(0, 8)); const [i, setI] = useState(0); const [pk, setPk] = useState<number | null>(null);
  const choose = (k: number) => { if (pk !== null) return; sfx("vote"); setPk(k); setTimeout(() => { setI((x) => x + 1); setPk(null); }, 650); };
  if (i >= qs.length) return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-stamp dg gm-pop">TERMINÉ !</div>
      <div className="gm-big">Compare tes choix avec tes amis.</div>
      <button className="gm-btn ink" onClick={() => { setQs(shuffle(DILEMMES).slice(0, 8)); setI(0); }}><RotateCcw size={18} /> REJOUER</button>
    </Shell>
  );
  const [x, y] = qs[i];
  const opt = (t: string, k: number, bg: string) => <button key={k + t} onClick={() => choose(k)} className="gm-card gm-pop dg"
    style={{ flex: 1, background: pk === k ? "var(--c)" : bg, fontSize: "1.1rem", lineHeight: 1.25, display: "grid", placeItems: "center", textAlign: "center", color: "var(--ink)", opacity: pk !== null && pk !== k ? .35 : 1, transition: "all .2s" }}>{t}</button>;
  return (
    <Shell def={def} onBack={onBack} foot={<Prog i={i} n={qs.length} />}>
      <div className="gm-sub">Tu préfères...</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 360 }} key={i}>
        {opt(x, 0, "var(--paper)")}<div className="dg" style={{ textAlign: "center" }}>OU</div>{opt(y, 1, "#fff")}</div>
    </Shell>
  );
}

/* Sauve, Recrute, Élimine */
const STEPS = ["SAUVE", "RECRUTE", "ÉLIMINE"];
export function Sauve({ def, onBack, sfx }: P) {
  const [trio, setTrio] = useState(() => pickN(3)); const [res, setRes] = useState<Character[]>([]);
  const left = trio.filter((c) => !res.includes(c)); const done = res.length >= 2;
  const choose = (c: Character) => { sfx("vote"); setRes([...res, c]); };
  const again = () => { setTrio(pickN(3)); setRes([]); };
  if (done) { const all = [...res, left[0]];
    return (
      <Shell def={def} onBack={onBack}>
        {all.map((c, k) => <div key={c.name} className="gm-card gm-pop" style={{ background: k === 2 ? "#ff8d8d" : k === 0 ? "#8fe3a1" : "var(--paper)" }}>
          <div className="gm-sub" style={{ textAlign: "left" }}>{STEPS[k]}</div><div className="dg" style={{ fontSize: "1.4rem" }}>{c.name}</div></div>)}
        <ShareBtn text={all.map((c, k) => `${STEPS[k]} : ${c.name}`).join(" | ")} />
        <button className="gm-btn ink" onClick={again}><RotateCcw size={18} /> AUTRE TRIO</button>
      </Shell>); }
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-stamp dg" key={res.length}>{STEPS[res.length]} ?</div>
      {left.map((c) => <button key={c.name} className="gm-card gm-pop" onClick={() => choose(c)} style={{ background: c.style, textAlign: "center", color: "var(--ink)", padding: 26 }}>
        <div className="dg" style={{ fontSize: "1.5rem" }}>{c.name}</div><div style={{ fontWeight: 700, opacity: .7 }}>{c.anime}</div></button>)}
    </Shell>
  );
}

/* Tier list */
const TIERS: [string, string][] = [["S", "#ff7f7f"], ["A", "#ffbf7f"], ["B", "#ffdf7f"], ["C", "#bfff7f"], ["D", "#7fbfff"]];
export function Tier({ def, onBack, sfx }: P) {
  const [pool, setPool] = useState(() => pickN(8)); const [placed, setPlaced] = useState<Record<string, string[]>>({}); const [sel, setSel] = useState<Character | null>(null);
  const put = (t: string) => { if (!sel) return; sfx("click"); setPlaced({ ...placed, [t]: [...(placed[t] || []), sel.name] }); setPool(pool.filter((c) => c !== sel)); setSel(null); };
  const back = (t: string, n: string) => { const c = ALL.find((x) => x.name === n)!; setPlaced({ ...placed, [t]: placed[t].filter((x) => x !== n) }); setPool([...pool, c]); };
  const reset = () => { setPool(pickN(8)); setPlaced({}); setSel(null); };
  const text = "Ma tier list otaku :\n" + TIERS.map(([t]) => `${t} : ${(placed[t] || []).join(", ") || "-"}`).join("\n");
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">{sel ? `Touche un rang pour placer ${sel.name}` : pool.length ? "Touche un perso, puis son rang" : "Ta tier list est prête"}</div>
      {TIERS.map(([t, col]) => <div key={t} className="gm-tier"><b style={{ background: col }} onClick={() => put(t)}>{t}</b>
        <div onClick={() => put(t)}>{(placed[t] || []).map((n) => <button key={n} className="gm-chp" onClick={(e) => { e.stopPropagation(); back(t, n); }}>{n}</button>)}</div></div>)}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{pool.map((c) => <button key={c.name} className={`gm-chp ${sel === c ? "sel" : ""}`} onClick={() => setSel(sel === c ? null : c)}>{c.name}</button>)}</div>
      {!pool.length && <ShareBtn text={text} />}
      <button className="gm-btn ink" onClick={reset}><RotateCcw size={18} /> NOUVELLE LISTE</button>
    </Shell>
  );
}
