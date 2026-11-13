import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth"; import { doc, getDoc, setDoc } from "firebase/firestore"; import { auth, db } from "../firebase";
import { THEMES, ThemeDef, getTheme } from "./themeConfig";
const rd = (k: string, d: string) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
const wr = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
export const earnedPoints = () => { let s = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith("mg_best_")) s += parseInt(localStorage.getItem(k) || "0", 10) || 0; } } catch { /* ignore */ } return s; };
interface Ctx { theme: ThemeDef; preview: (id: string | null) => void; apply: (id: string) => void; unlocked: string[]; unlock: (id: string) => boolean; points: number; level: number; xp: number; anim: boolean; setAnim: (b: boolean) => void; refresh: () => void }
const C = createContext<Ctx>(null as any); export const useTheme = () => useContext(C);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState(() => rd("sakura_theme", "sakura")); const [pv, setPv] = useState<string | null>(null);
  const [unlocked, setUnl] = useState<string[]>(() => JSON.parse(rd("sakura_unlocked", "[]"))); const [spent, setSpent] = useState(() => parseInt(rd("sakura_spent", "0"), 10) || 0);
  const [earned, setEarned] = useState(earnedPoints()); const [anim, setAnimS] = useState(rd("sakura_anim", "1") === "1");
  const refresh = () => setEarned(earnedPoints());
  const t = getTheme(pv || id); const points = Math.max(0, earned - spent); const lvlSrc = earned;
  useEffect(() => { const r = document.documentElement.style; r.setProperty("--bg0", t.bg); r.setProperty("--bg1", t.bg2); r.setProperty("--a", t.a); r.setProperty("--b", t.b); r.setProperty("--v", t.v); document.documentElement.dataset.fx = anim ? t.fx : "none"; document.documentElement.dataset.theme = t.id; }, [t, anim]);
  useEffect(() => { window.addEventListener("focus", refresh); return () => window.removeEventListener("focus", refresh); }, []);
  const push = (patch: object) => { const u = auth.currentUser; if (u) setDoc(doc(db, "users", u.uid), patch, { merge: true }).catch(() => {}); };
  useEffect(() => onAuthStateChanged(auth, async (u) => { if (!u) return; try { const s = await getDoc(doc(db, "users", u.uid)); const d: any = s.data(); if (d?.themeId) { setId(d.themeId); wr("sakura_theme", d.themeId); } if (d?.unlockedThemes) { setUnl(d.unlockedThemes); wr("sakura_unlocked", JSON.stringify(d.unlockedThemes)); } if (typeof d?.themePointsSpent === "number") { setSpent(d.themePointsSpent); wr("sakura_spent", String(d.themePointsSpent)); } } catch { /* hors ligne */ } }), []);
  const can = (th: ThemeDef) => th.tier === "free" || unlocked.includes(th.id);
  const apply = (x: string) => { const th = getTheme(x); if (!can(th)) return; setId(x); setPv(null); wr("sakura_theme", x); push({ themeId: x }); };
  const unlock = (x: string) => { const th = getTheme(x); if (can(th) || th.price > points || Math.floor(lvlSrc / 100) + 1 < th.level) return false;
    const u = [...unlocked, x], s = spent + th.price; setUnl(u); setSpent(s); wr("sakura_unlocked", JSON.stringify(u)); wr("sakura_spent", String(s)); push({ unlockedThemes: u, themePointsSpent: s }); return true; };
  const setAnim = (b: boolean) => { setAnimS(b); wr("sakura_anim", b ? "1" : "0"); };
  return <C.Provider value={{ theme: t, preview: setPv, apply, unlocked, unlock, points, level: Math.floor(lvlSrc / 100) + 1, xp: lvlSrc % 100, anim, setAnim, refresh }}>{children}</C.Provider>;
}
export { THEMES };
