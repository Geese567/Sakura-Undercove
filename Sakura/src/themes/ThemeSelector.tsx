import React, { useState } from "react"; import { Lock, Check, Eye } from "lucide-react";
import { THEMES, ThemeDef } from "./themeConfig"; import { useTheme } from "./ThemeProvider";
export function Art({ t, big }: { t: ThemeDef; big?: boolean }) {
  // Remplace l'illustration : dépose public/assets/characters-ui/<id>.webp (personnage) et backgrounds-ui/<id>.webp (décor)
  return <div className={`art ${big ? "big" : ""}`} style={{ ["--a" as any]: t.a, ["--b" as any]: t.b, ["--v" as any]: t.v, ["--bg0" as any]: t.bg, ["--bg1" as any]: t.bg2 }}>
    <span className="moon" /><span className="kj">{t.kanji}</span>
    <img src={`assets/characters-ui/${t.id}.webp`} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /></div>;
}
export default function ThemeSelector() {
  const { theme, preview, apply, unlocked, unlock, points, level } = useTheme(); const [sel, setSel] = useState<ThemeDef | null>(null);
  const ok = (t: ThemeDef) => t.tier === "free" || unlocked.includes(t.id);
  const grp = (title: string, fam: ThemeDef["family"][]) => <><h3 className="sub">{title}</h3><div className="gal">{THEMES.filter((t) => fam.includes(t.family)).map((t) => (
    <button key={t.id} className={`tc ${sel?.id === t.id ? "on" : ""}`} onClick={() => { setSel(t); preview(t.id); }}>
      <Art t={t} /><b>{t.name}</b><small>{t.tier === "free" ? "Gratuit" : t.tier === "rare" ? "Rare" : "Légendaire"}</small>
      <span className="sw"><i style={{ background: t.a }} /><i style={{ background: t.b }} /><i style={{ background: t.v }} /></span>
      {!ok(t) && <Lock size={16} className="lk" />}{theme.id === t.id && !sel && <em className="bd">ACTIF</em>}</button>))}</div></>;
  return <div>
    <p className="mut">Tes points : <b>{points}</b> · Niveau {level}</p>
    {grp("Thème par défaut", ["classic"])}{grp("Waifu", ["waifu"])}{grp("Personnages masculins", ["homme"])}
    {sel && <div className="dock"><div><b>{sel.name}</b> · {sel.mood}<br /><small>{ok(sel) ? "Débloqué" : `${sel.price} points · niveau ${sel.level} requis`}</small></div>
      <button className="btn2" onClick={() => { preview(null); setSel(null); }}><Eye size={16} /> ANNULER L'APERÇU</button>
      {ok(sel) ? <button className="btn1" onClick={() => { apply(sel.id); setSel(null); }}><Check size={16} /> APPLIQUER CE THÈME</button>
        : <button className="btn1" disabled={sel.price > points || level < sel.level} onClick={() => unlock(sel.id)}>DÉBLOQUER ({sel.price})</button>}</div>}
  </div>;
}
