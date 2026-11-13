import React, { useEffect, useRef, useState } from "react";
import { Check, X, RotateCcw, Sparkles } from "lucide-react";
import { ALL, ANIMES, GameDef, Prog, Sfx, Shell, ShareBtn, getNum, setNum, shuffle } from "./ui";
import { EMOJI_PUZZLES, VF } from "./data";

interface Q { prompt: string; sub?: string; options: string[]; answer: string; note?: string; big?: boolean }
interface P { def: GameDef; onBack: () => void; sfx: Sfx }

const qAnime = (): Q[] => shuffle(ALL).slice(0, 10).map((c) => ({ prompt: c.name, sub: "De quel anime vient-il ?", answer: c.anime,
  options: shuffle([c.anime, ...shuffle(ANIMES.filter((a) => a !== c.anime)).slice(0, 3)]) }));
const qPerso = (): Q[] => shuffle(ALL).slice(0, 10).map((c) => ({ prompt: c.anime, sub: "Lequel de ces persos en vient ?", answer: c.name,
  options: shuffle([c.name, ...shuffle(ALL.filter((x) => x.anime !== c.anime)).slice(0, 3).map((x) => x.name)]) }));
const qEmoji = (): Q[] => { const all = EMOJI_PUZZLES.map((p) => p.a);
  return shuffle(EMOJI_PUZZLES).slice(0, 10).map((p) => ({ prompt: p.e, big: true, sub: "Quel animé se cache ici ?", answer: p.a,
    options: shuffle([p.a, ...shuffle(all.filter((a) => a !== p.a)).slice(0, 3)]) })); };
const qVF = (): Q[] => shuffle(VF).slice(0, 10).map((x) => ({ prompt: x.q, sub: "Vrai ou faux ?", answer: x.v ? "VRAI" : "FAUX", options: ["VRAI", "FAUX"], note: x.n }));

function Engine({ def, onBack, sfx, make }: P & { make: () => Q[] }) {
  const bestKey = `mg_best_${def.id}`;
  const [qs, setQs] = useState(make);
  const [i, setI] = useState(0); const [pk, setPk] = useState<string | null>(null);
  const [score, setScore] = useState(0); const [rec, setRec] = useState(false);
  const t = useRef<number>();
  useEffect(() => () => clearTimeout(t.current), []);
  const q = qs[i]; const done = i >= qs.length;
  const next = (s: number) => { if (i + 1 >= qs.length) { if (s > getNum(bestKey)) { setNum(bestKey, s); setRec(true); } } setI(i + 1); setPk(null); };
  const choose = (o: string) => {
    if (pk) return; setPk(o); const ok = o === q.answer; sfx(ok ? "win" : "lose");
    const s = ok ? score + 1 : score; if (ok) setScore(s);
    if (!q.note) t.current = window.setTimeout(() => next(s), 950);
  };
  const again = () => { setQs(make()); setI(0); setPk(null); setScore(0); setRec(false); };
  const best = getNum(bestKey);
  if (done) {
    const r = score / qs.length;
    const verdict = r >= 0.9 ? "Légendaire. Hokage de la culture anime." : r >= 0.7 ? "Excellent, vrai otaku." : r >= 0.4 ? "Pas mal, tu as de la culture." : "Novice. Il faut regarder plus d'animés !";
    return (
      <Shell def={def} onBack={onBack}>
        <div className="gm-stamp dg gm-pop">{score}/{qs.length}</div>
        <div className="gm-big">{verdict}</div>
        {rec && <div className="gm-sub" style={{ opacity: 1 }}>🏆 Nouveau record !</div>}
        <ShareBtn text={`J'ai fait ${score}/${qs.length} à « ${def.title} » sur Sakura Undercover ! Ose me battre.`} />
        <button className="gm-btn ink" onClick={again}><RotateCcw size={18} /> REJOUER</button>
      </Shell>
    );
  }
  const two = q.options.length === 2;
  return (
    <Shell def={def} onBack={onBack} foot={<Prog i={i} n={qs.length} />}>
      <div className="gm-sub">{q.sub} {best ? `· Record ${best}` : ""}</div>
      <div className={`gm-card gm-pop ${pk && pk !== q.answer ? "gm-shake" : ""}`} key={i} style={{ minHeight: 150, display: "grid", placeItems: "center" }}>
        <div className={q.big ? "" : "dg gm-big"} style={q.big ? { fontSize: "3.2rem", letterSpacing: ".1em" } : undefined}>{q.prompt}</div>
      </div>
      <div className={two ? "gm-grid2" : ""} style={two ? undefined : { display: "flex", flexDirection: "column", gap: 12 }}>
        {q.options.map((o) => {
          const cls = pk ? (o === q.answer ? "ok" : o === pk ? "ko" : "") : "";
          return <button key={o} disabled={!!pk} className={`gm-btn ${cls} ${two ? "mid dg" : ""}`} onClick={() => choose(o)}>
            <span>{o}</span>{pk && o === q.answer && <Check size={20} />}{pk === o && o !== q.answer && <X size={20} />}</button>;
        })}
      </div>
      {pk && q.note && <>
        <div className="gm-card gm-pop" style={{ fontWeight: 600 }}>{q.note}</div>
        <button className="gm-btn ink" onClick={() => next(score)}>SUIVANT</button></>}
    </Shell>
  );
}

export const QuizAnime = (p: P) => <Engine {...p} make={qAnime} />;
export const QuizPerso = (p: P) => <Engine {...p} make={qPerso} />;
export const QuizEmoji = (p: P) => <Engine {...p} make={qEmoji} />;
export const QuizVF = (p: P) => <Engine {...p} make={qVF} />;

/* Memory */
const mkCards = () => {
  const used = new Set<string>(); const ch: typeof ALL = [];
  for (const c of shuffle(ALL)) { if (used.has(c.anime)) continue; used.add(c.anime); ch.push(c); if (ch.length === 6) break; }
  return shuffle(ch.flatMap((c) => [{ u: c.name + "n", p: c.name, l: c.name, n: true }, { u: c.name + "a", p: c.name, l: c.anime, n: false }]));
};
export function Memory({ def, onBack, sfx }: P) {
  const [cards, setCards] = useState(mkCards); const [open, setOpen] = useState<string[]>([]);
  const [ok, setOk] = useState<string[]>([]); const [moves, setMoves] = useState(0); const [lock, setLock] = useState(false); const [rec, setRec] = useState(false);
  const t = useRef<number>(); useEffect(() => () => clearTimeout(t.current), []);
  const key = "mg_best_memory"; const won = ok.length === 6;
  const flip = (c: any) => {
    if (lock || open.includes(c.u) || ok.includes(c.p)) return; sfx("click");
    const nx = [...open, c.u]; setOpen(nx); if (nx.length < 2) return; setMoves((m) => m + 1);
    const [a, b] = nx.map((u) => cards.find((x) => x.u === u)!);
    if (a.p === b.p) { const m = [...ok, a.p]; setOk(m); setOpen([]); sfx("reveal");
      if (m.length === 6) { sfx("win"); const b0 = getNum(key); if (!b0 || moves + 1 < b0) { setNum(key, moves + 1); setRec(true); } } }
    else { setLock(true); t.current = window.setTimeout(() => { setOpen([]); setLock(false); }, 900); }
  };
  const again = () => { setCards(mkCards()); setOpen([]); setOk([]); setMoves(0); setRec(false); };
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">Coups : {moves} · Paires {ok.length}/6 {getNum(key) ? `· Record ${getNum(key)}` : ""}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {cards.map((c) => { const up = open.includes(c.u) || ok.includes(c.p);
          return <button key={c.u} onClick={() => flip(c)} className={`gm-mem ${up ? "up" : ""} ${ok.includes(c.p) ? "done" : ""}`}>
            {up ? <span className={c.n ? "dg" : ""} style={{ fontSize: c.n ? ".78rem" : ".68rem" }}>{c.l}</span> : <Sparkles size={26} />}</button>; })}
      </div>
      {won && <>
        <div className="gm-stamp dg gm-pop">BRAVO !</div>
        {rec && <div className="gm-sub" style={{ opacity: 1 }}>🏆 Nouveau record : {moves} coups</div>}
        <ShareBtn text={`J'ai terminé le Memory Otaku en ${moves} coups sur Sakura Undercover !`} />
        <button className="gm-btn ink" onClick={again}><RotateCcw size={18} /> REJOUER</button></>}
    </Shell>
  );
}
