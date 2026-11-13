import React, { ReactNode, useEffect, useState } from "react";
import { ArrowLeft, HelpCircle, Check, Share2 } from "lucide-react";
import { CATEGORIES } from "../constants";
import { Character } from "../types";
import "./games.css";

export type Sfx = (t: "click" | "reveal" | "vote" | "win" | "lose") => void;
export interface GameDef {
  id: string; cat: string; title: string; tag: string; emoji: string; kanji: string; c: string; bg: string;
  meta: string[]; help: string; media?: string;
}

export const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export const ALL: Character[] = (() => {
  const seen = new Set<string>(); const out: Character[] = [];
  Object.values(CATEGORIES).forEach((c) => c.chars.forEach((ch) => { if (!seen.has(ch.name)) { seen.add(ch.name); out.push(ch); } }));
  return out;
})();
export const ANIMES = Array.from(new Set(ALL.map((c) => c.anime)));
export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const getNum = (k: string) => { try { return parseInt(localStorage.getItem(k) || "0", 10) || 0; } catch { return 0; } };
export const setNum = (k: string, v: number) => { try { localStorage.setItem(k, String(v)); } catch { /* ignore */ } };

export function ShareBtn({ text }: { text: string }) {
  const [s, setS] = useState("");
  const go = async () => {
    try { if ((navigator as any).share) { await (navigator as any).share({ text }); setS("Partagé !"); }
      else { await navigator.clipboard.writeText(text); setS("Copié !"); } } catch { setS("Impossible"); }
    setTimeout(() => setS(""), 1800);
  };
  return <button className="gm-btn mid" onClick={go}><Share2 size={18} /> {s || "PARTAGER MON RÉSULTAT"}</button>;
}

export function Prog({ i, n }: { i: number; n: number }) {
  return <div className="gm-prog">{Array.from({ length: n }).map((_, k) => <i key={k} className={k < i ? "f" : ""} />)}</div>;
}

/* Coque commune : titre, retour, aide. L'aide s'ouvre seule la 1ere fois. */
export function Shell({ def, onBack, children, foot }: { def: GameDef; onBack: () => void; children: ReactNode; foot?: ReactNode }) {
  const key = `mg_seen_${def.id}`;
  const [how, setHow] = useState(() => { try { return !localStorage.getItem(key); } catch { return false; } });
  const close = () => { try { localStorage.setItem(key, "1"); } catch { /* ignore */ } setHow(false); };
  return (
    <div className="gm" style={{ ["--c" as any]: def.c, ["--bg" as any]: def.bg }}>
      <div className="mg-speed" />
      <div className="gm-h">
        <button className="gm-sq" onClick={onBack} aria-label="Retour"><ArrowLeft size={22} /></button>
        <div className="gm-t dg">{def.title}</div>
        <button className="gm-sq" onClick={() => setHow(true)} aria-label="Aide"><HelpCircle size={22} /></button>
      </div>
      {foot}
      <div className="gm-body">{children}</div>
      {how && (
        <div className="gm-how" onClick={close}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="e">{def.emoji}</div>
            <div className="dg" style={{ fontSize: "1.4rem" }}>{def.title}</div>
            <p style={{ fontWeight: 600, lineHeight: 1.45 }}>{def.help}</p>
            <button className="gm-btn ink" onClick={close}><Check size={18} /> COMPRIS !</button>
          </div>
        </div>
      )}
    </div>
  );
}
