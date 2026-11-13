import React, { useEffect, useRef, useState } from "react";
import { Check, X, RotateCcw, Play as PlayIcon, Eye } from "lucide-react";
import { ALL, ANIMES, GameDef, Prog, Sfx, Shell, ShareBtn, getNum, norm, setNum, shuffle } from "./ui";
import { MediaItem, loadManifest } from "./media";

interface P { def: GameDef; onBack: () => void; sfx: Sfx }
type Style = "blindtest" | "voice" | "silhouette" | "panel";
const CFG: Record<Style, { folder: string; kind: "audio" | "image"; pool: "anime" | "perso"; snippet: number; chrono: number; sub: string; ex: string; key: string }> = {
  blindtest: { folder: "blindtest", kind: "audio", pool: "anime", snippet: 5, chrono: 15, sub: "Quel animé ?", ex: "death-note.mp3", key: "tracks" },
  voice: { folder: "voices", kind: "audio", pool: "perso", snippet: 0, chrono: 20, sub: "Quel personnage ?", ex: "tanjiro.mp3", key: "voices" },
  silhouette: { folder: "characters", kind: "image", pool: "perso", snippet: 0, chrono: 0, sub: "Qui est-ce ?", ex: "naruto.jpg", key: "characters" },
  panel: { folder: "manga", kind: "image", pool: "anime", snippet: 0, chrono: 0, sub: "Quel manga ?", ex: "one-piece.jpg", key: "panels" },
};

function Empty({ def, onBack, style }: P & { style: Style }) {
  const c = CFG[style];
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-stamp dg">BIENTÔT</div>
      <div className="gm-card" style={{ fontWeight: 600, lineHeight: 1.5, fontSize: ".85rem" }}>
        Aucun fichier trouvé.<br />1. Mets tes fichiers dans <b>public/assets/{c.folder}/</b><br />
        2. Liste-les dans <b>public/assets/{c.folder}/{c.folder}.json</b> :
        <pre style={{ background: "var(--ink)", color: "var(--paper)", padding: 10, margin: "8px 0", overflowX: "auto", fontSize: ".72rem", borderRadius: 4 }}>{`{ "${c.key}": ["${c.ex}"] }`}</pre>
        Le nom du fichier devient la réponse ({c.ex} donne « {c.ex.replace(/\.[^.]+$/, "").replace(/-/g, " ").replace(/(^|\s)\S/g, (m) => m.toUpperCase())} »).
      </div>
    </Shell>
  );
}

function Run({ def, onBack, sfx, style, items }: P & { style: Style; items: MediaItem[] }) {
  const cfg = CFG[style]; const sil = style === "silhouette"; const N = Math.min(10, items.length);
  const build = () => shuffle(items).slice(0, N).map((it) => {
    const na = norm(it.answer); const seen = new Set([na]); const wrong: string[] = [];
    const pool = cfg.pool === "anime" ? ANIMES : ALL.map((c) => c.name);
    for (const o of [...shuffle(items.filter((x) => x !== it).map((x) => x.answer)), ...shuffle(pool)]) {
      const k = norm(o); if (seen.has(k) || k.includes(na) || na.includes(k)) continue; seen.add(k); wrong.push(o); if (wrong.length === 3) break;
    }
    return { it, options: it.options && it.options.length > 1 ? shuffle(it.options) : shuffle([it.answer, ...wrong]), ox: 25 + Math.random() * 50, oy: 25 + Math.random() * 50 };
  });
  const [qs, setQs] = useState(build); const [i, setI] = useState(0); const [pk, setPk] = useState<string | null>(null);
  const [score, setScore] = useState(0); const [step, setStep] = useState(0); const [started, setStarted] = useState(false);
  const [left, setLeft] = useState(cfg.chrono); const [err, setErr] = useState(false); const [rec, setRec] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null); const snip = useRef<number>();
  const stop = () => { clearTimeout(snip.current); audio.current?.pause(); audio.current = null; };
  useEffect(() => stop, []);
  const bestKey = `mg_best_${def.id}`; const max = N * (sil ? 3 : 1); const done = i >= N; const q = qs[i];

  useEffect(() => { if (!cfg.chrono || !started || pk !== null || done) return;
    if (left <= 0) { choose(""); return; } const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [started, left, pk]);

  const play = () => {
    stop(); const a = new Audio(q.it.url); audio.current = a; const st = q.it.start || 0;
    a.onerror = () => setErr(true); a.addEventListener("loadedmetadata", () => { if (st) a.currentTime = st; });
    a.play().then(() => { if (cfg.snippet) snip.current = window.setTimeout(() => a.pause(), cfg.snippet * 1000); }).catch(() => setErr(true));
    setStarted(true);
  };
  const choose = (o: string) => {
    if (pk !== null) return; stop(); const ok = o === q.it.answer; sfx(ok ? "win" : "lose"); setPk(o || "⏱");
    const s = ok ? score + (sil ? 3 - step : 1) : score; setScore(s);
    if (i + 1 >= N && s > getNum(bestKey)) { setNum(bestKey, s); setRec(true); }
  };
  const next = () => { stop(); setI(i + 1); setPk(null); setStep(0); setStarted(false); setLeft(cfg.chrono); setErr(false); };
  const again = () => { setQs(build()); setI(0); setPk(null); setScore(0); setStep(0); setStarted(false); setLeft(cfg.chrono); setErr(false); setRec(false); };

  if (done) return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-stamp dg gm-pop">{score}/{max}</div>
      <div className="gm-big">{score / max >= 0.8 ? "Oreille et œil de maître !" : score / max >= 0.4 ? "Pas mal du tout." : "Il faut s'entraîner !"}</div>
      {rec && <div className="gm-sub" style={{ opacity: 1 }}>🏆 Nouveau record !</div>}
      <ShareBtn text={`J'ai fait ${score}/${max} à « ${def.title} » sur Sakura Undercover !`} />
      <button className="gm-btn ink" onClick={again}><RotateCcw size={18} /> REJOUER</button>
    </Shell>
  );

  const revealed = pk !== null || (sil && step >= 2);
  const imgStyle: React.CSSProperties = !sil ? { objectFit: "contain" } : {
    objectFit: "cover", transformOrigin: `${q.ox}% ${q.oy}%`, transition: "all .5s",
    transform: revealed ? "scale(1)" : step === 0 ? "scale(4)" : "scale(1)",
    filter: revealed ? "none" : step === 0 ? "none" : "brightness(.1) contrast(1.3)" };
  return (
    <Shell def={def} onBack={onBack} foot={<Prog i={i} n={N} />}>
      <div className="gm-sub">{cfg.sub} {cfg.chrono && started && pk === null ? `· ${left}s` : ""}</div>
      {cfg.kind === "image" ? (
        <div className="gm-card gm-pop" key={i} style={{ padding: 0, overflow: "hidden", aspectRatio: "1", background: "var(--ink)", display: "grid", placeItems: "center" }}>
          {err ? <div style={{ color: "var(--paper)", padding: 16, textAlign: "center", fontWeight: 700 }}>Fichier introuvable :<br />{q.it.file}</div>
            : <img src={q.it.url} alt="" draggable={false} onError={() => setErr(true)} style={{ width: "100%", height: "100%", ...imgStyle }} />}
        </div>
      ) : (
        <div className="gm-card gm-pop" key={i} style={{ display: "grid", placeItems: "center", minHeight: 170, gap: 8 }}>
          {err ? <div style={{ textAlign: "center", fontWeight: 700 }}>Fichier introuvable :<br />{q.it.file}</div>
            : <button className="gm-btn ink mid" style={{ width: "auto", padding: "14px 28px" }} onClick={play} disabled={pk !== null}><PlayIcon size={22} /> {started ? "RÉÉCOUTER" : "ÉCOUTER"}</button>}
          {cfg.snippet > 0 && <div className="gm-sub">Extrait de {cfg.snippet} secondes</div>}
        </div>
      )}
      {err && pk === null && <button className="gm-btn mid" onClick={next}>PASSER</button>}
      {sil && pk === null && step < 2 && <button className="gm-btn mid" onClick={() => setStep(step + 1)}><Eye size={18} /> INDICE ({3 - step - 1} pt max)</button>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {q.options.map((o) => {
          const cls = pk !== null ? (o === q.it.answer ? "ok" : o === pk ? "ko" : "") : "";
          return <button key={o} disabled={pk !== null} className={`gm-btn ${cls}`} onClick={() => choose(o)}><span>{o}</span>
            {pk !== null && o === q.it.answer && <Check size={20} />}{pk === o && o !== q.it.answer && <X size={20} />}</button>;
        })}
      </div>
      {pk !== null && <button className="gm-btn ink" onClick={next}>SUIVANT</button>}
    </Shell>
  );
}

function Media({ def, onBack, sfx, style }: P & { style: Style }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  useEffect(() => { loadManifest(CFG[style].folder).then(setItems); }, []);
  if (!items) return <Shell def={def} onBack={onBack}><div className="gm-sub">Chargement...</div></Shell>;
  if (!items.length) return <Empty def={def} onBack={onBack} sfx={sfx} style={style} />;
  return <Run def={def} onBack={onBack} sfx={sfx} style={style} items={items} />;
}
export const BlindTest = (p: P) => <Media {...p} style="blindtest" />;
export const Voix = (p: P) => <Media {...p} style="voice" />;
export const Silhouette = (p: P) => <Media {...p} style="silhouette" />;
export const Case = (p: P) => <Media {...p} style="panel" />;

/* Chante la suite : la musique se coupe, tu continues, puis on écoute la vraie suite.
   Dans le manifeste, "start" = début de l'extrait, "cut" = seconde où la musique s'arrête. */
export function Karaoke({ def, onBack, sfx }: P) {
  const [items, setItems] = useState<MediaItem[] | null>(null); const [deck, setDeck] = useState<MediaItem[]>([]); const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"ready" | "listen" | "sing" | "reveal">("ready"); const [left, setLeft] = useState(10); const [ok, setOk] = useState(0); const [n, setN] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null); const tm = useRef<number>();
  const stop = () => { clearTimeout(tm.current); audio.current?.pause(); audio.current = null; };
  useEffect(() => { loadManifest("karaoke").then((l) => { setItems(l); setDeck(shuffle(l)); }); return stop; }, []);
  useEffect(() => { if (phase !== "sing") return; if (left <= 0) { setPhase("reveal"); sfx("reveal"); return; } const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [phase, left]);
  if (!items) return <Shell def={def} onBack={onBack}><div className="gm-sub">Chargement...</div></Shell>;
  if (!items.length) return (
    <Shell def={def} onBack={onBack}><div className="gm-stamp dg">BIENTÔT</div>
      <div className="gm-card" style={{ fontWeight: 600, lineHeight: 1.5, fontSize: ".85rem" }}>Aucun fichier trouvé.<br />1. Mets tes musiques dans <b>public/assets/karaoke/</b><br />
        2. Liste-les dans <b>public/assets/karaoke/karaoke.json</b> :
        <pre style={{ background: "var(--ink)", color: "var(--paper)", padding: 10, margin: "8px 0", overflowX: "auto", fontSize: ".72rem", borderRadius: 4 }}>{`{ "songs": [{ "file": "opening-naruto.mp3", "start": 0, "cut": 20 }] }`}</pre>
        « cut » est la seconde où la musique s'arrête.</div></Shell>);
  const s = deck[i % deck.length]; const st = s.start || 0; const cut = s.cut || st + 15;
  const playFrom = (from: number, secs: number, then?: () => void) => { stop(); const a = new Audio(s.url); audio.current = a; a.addEventListener("loadedmetadata", () => { a.currentTime = from; });
    a.play().then(() => { tm.current = window.setTimeout(() => { a.pause(); then?.(); }, secs * 1000); }).catch(() => setPhase("reveal")); };
  const listen = () => { setPhase("listen"); playFrom(st, Math.max(3, cut - st), () => { setLeft(10); setPhase("sing"); sfx("click"); }); };
  const verdict = (y: boolean) => { stop(); sfx(y ? "win" : "lose"); if (y) setOk(ok + 1); setN(n + 1); setI(i + 1); setPhase("ready"); };
  return (
    <Shell def={def} onBack={onBack}>
      <div className="gm-sub">{ok} réussis sur {n}</div>
      <div className="gm-card gm-big dg" style={{ minHeight: 150, display: "grid", placeItems: "center" }} key={i + phase}>
        {phase === "ready" && "Prêt à chanter ?"}{phase === "listen" && "Écoute bien... 🎧"}{phase === "sing" && <span>À TOI !<br /><span style={{ fontSize: "2.6rem" }}>{left}</span></span>}
        {phase === "reveal" && <span>{s.answer}</span>}
      </div>
      {phase === "ready" && <button className="gm-btn ink" onClick={listen}><PlayIcon size={20} /> LANCER LA MUSIQUE</button>}
      {phase === "sing" && <button className="gm-btn mid" onClick={() => setPhase("reveal")}>J'AI FINI</button>}
      {phase === "reveal" && <>
        <button className="gm-btn mid" onClick={() => playFrom(cut, 12)}><PlayIcon size={18} /> ÉCOUTER LA VRAIE SUITE</button>
        <div className="gm-grid2"><button className="gm-btn mid ko" onClick={() => verdict(false)}><X size={18} /> RATÉ</button><button className="gm-btn mid ok" onClick={() => verdict(true)}><Check size={18} /> RÉUSSI</button></div></>}
      {n > 0 && phase === "ready" && <ShareBtn text={`Chante la suite : ${ok}/${n} réussis sur Sakura Undercover !`} />}
    </Shell>
  );
}
