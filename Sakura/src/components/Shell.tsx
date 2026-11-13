import React, { useEffect, useMemo, useState } from "react"; import { motion, AnimatePresence } from "motion/react";
import { Home, Gamepad2, Trophy, BarChart3, Settings, Info, Play, ChevronRight, PartyPopper, Brain, Dices, Swords, LogOut, Search, Star } from "lucide-react";
import { GAMES, COMP } from "../games/Hub"; import { Sfx, getNum } from "../games/ui"; import { useTheme } from "../themes/ThemeProvider";
import ThemeSelector, { Art } from "../themes/ThemeSelector"; import { auth } from "../firebase"; import { signOut } from "firebase/auth";
type Page = "home" | "games" | "rank" | "stats" | "settings" | "about";
const NAV: [Page, string, any][] = [["home", "Accueil", Home], ["games", "Mes Jeux", Gamepad2], ["rank", "Classement", Trophy], ["stats", "Statistiques", BarChart3], ["settings", "Paramètres", Settings], ["about", "À propos", Info]];
const CATS: [string, string, string, string, any][] = [["soiree", "Soirée", "Jeux fun et festifs", "c-rose", PartyPopper], ["quiz", "Quiz", "Testez vos connaissances", "c-bleu", Brain], ["hasard", "Hasard", "Laissez le hasard décider", "c-viol", Dices], ["classement", "Duel", "Affrontez vos amis", "c-oran", Swords]];
const who = () => auth.currentUser?.displayName || "Joueur";
export default function Shell({ sfx, onUndercover, onRules, onSettings }: { sfx: Sfx; onUndercover: () => void; onRules: () => void; onSettings: () => void }) {
  const [page, setPage] = useState<Page>("home"); const [open, setOpen] = useState<string | null>(null); const [cat, setCat] = useState("all"); const [q, setQ] = useState("");
  const { theme, points, level, xp, refresh } = useTheme(); useEffect(refresh, [open, page]);
  const play = (id: string) => { sfx("click"); if (id === "undercover") onUndercover(); else setOpen(id); };
  const popular = useMemo(() => ["undercover", "blindtest", "destin", "tournoi"].map((i) => GAMES.find((g) => g.id === i)!).filter(Boolean), []);
  const list = GAMES.filter((g) => (cat === "all" || g.cat === cat) && g.title.toLowerCase().includes(q.toLowerCase()));
  const Card = ({ g }: { g: (typeof GAMES)[0] }) => <motion.div whileHover={{ y: -4 }} className="gc" style={{ ["--gc" as any]: g.c }}><span className="gk">{g.kanji}</span><span className="ge">{g.emoji}</span><b>{g.title}</b><small>{g.tag}</small><button onClick={() => play(g.id)}>JOUER <Play size={12} fill="currentColor" /></button></motion.div>;
  const Prof = () => <aside className="pf"><h4><Trophy size={18} /> Votre profil</h4><span>Niveau {level}</span><div className="xp"><i style={{ width: `${xp}%` }} /></div><small>{xp} / 100 XP</small><p><Star size={16} fill="currentColor" /> {points} Points</p><em>Continuez à jouer pour devenir une légende !</em></aside>;
  const Cmp = open ? COMP[open] : null; const def = GAMES.find((g) => g.id === open);
  const best = GAMES.map((g) => ({ g, s: getNum(`mg_best_${g.id}`) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  return <div className="shell">
    <nav className="sb"><div className="lg"><span className="torii">⛩</span><b className="dg">SAKURA</b><i className="dg">UNDERCOVER</i></div>
      {NAV.map(([k, l, I]) => <button key={k} className={page === k ? "on" : ""} onClick={() => setPage(k)}><I size={20} /><span>{l}</span></button>)}<div className="wave" /></nav>
    <main className="mn"><AnimatePresence mode="wait"><motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
      {page === "home" && <>
        <section className="hero"><Art t={theme} big /><div className="ht"><h1 className="dg">Bienvenue dans le <em>Dojo</em> !</h1><p>Découvrez, jouez et relevez tous les défis de l'univers Otaku !</p><button className="cta" onClick={() => setPage("games")}><Play size={18} fill="currentColor" /> DÉCOUVRIR LES JEUX <ChevronRight size={18} /></button></div>
          <div className="me"><div className="av2">{who()[0]}</div><div><b>{who()}</b><small>Niv. {level}</small></div><button onClick={() => auth.currentUser && signOut(auth)} aria-label="Déconnexion"><LogOut size={18} /></button></div></section>
        <section className="cats">{CATS.map(([k, n, d, c, I]) => <button key={k} className={c} onClick={() => { setCat(k); setPage("games"); }}><I size={34} /><div><b>{n}</b><small>{d}</small></div><ChevronRight /></button>)}</section>
        <section className="pop"><div><div className="ph"><h2>Jeux populaires</h2><i /><button onClick={() => setPage("games")}>Voir tout →</button></div><div className="gr">{popular.map((g) => <Card key={g.id} g={g} />)}</div></div><Prof /></section></>}
      {page === "games" && <><h2 className="pt">Mes Jeux</h2><div className="bar"><label><Search size={16} /><input placeholder="Rechercher un jeu" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        {[["all", "Tous"], ...CATS.map((c) => [c[0], c[1]])].map(([k, l]) => <button key={k} className={cat === k ? "on" : ""} onClick={() => setCat(k)}>{l}</button>)}</div><div className="gr w">{list.map((g) => <Card key={g.id} g={g} />)}</div></>}
      {page === "rank" && <><h2 className="pt">Classement</h2><p className="mut">Aucune base de classement n'existe encore dans le code : seul ton score local est affiché. Branche une collection Firestore pour le classement mondial.</p><div className="row"><b>1</b><span>{who()}</span><span>Niv. {level}</span><b>{points + 0} pts</b></div></>}
      {page === "stats" && <><h2 className="pt">Statistiques</h2><p className="mut">Points cumulés : {best.reduce((a, b) => a + b.s, 0)} · Jeux avec un record : {best.length}</p>{best.length ? best.map(({ g, s }) => <div key={g.id} className="row"><span>{g.title}</span><div className="xp w1"><i style={{ width: `${Math.min(100, s * 10)}%` }} /></div><b>{s}</b></div>) : <p className="mut">Joue pour voir apparaître tes records.</p>}</>}
      {page === "settings" && <><h2 className="pt">Mon Univers</h2><ThemeSelector /><h3 className="sub">Préférences</h3><AnimToggle /><button className="btn2" onClick={onSettings}>Son, langue, mode d'affichage…</button><button className="btn2" onClick={onRules}>Règles d'Undercover</button></>}
      {page === "about" && <><h2 className="pt">À propos</h2><p>Sakura Undercover, le Dojo des jeux otaku : {GAMES.length} mini-jeux de soirée, quiz, hasard et duels, avec un univers personnalisable.</p></>}
    </motion.div></AnimatePresence></main>
    {Cmp && def && <Cmp def={def} sfx={sfx} onBack={() => setOpen(null)} />}
  </div>;
}
function AnimToggle() { const { anim, setAnim } = useTheme(); return <label className="tg"><input type="checkbox" checked={anim} onChange={(e) => setAnim(e.target.checked)} /> Animations et particules</label>; }
