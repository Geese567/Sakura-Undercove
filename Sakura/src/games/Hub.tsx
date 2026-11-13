import React, { useEffect, useRef, useState } from "react";
import { Dices, BookOpen } from "lucide-react";
import { GameDef, Sfx } from "./ui";
import { QuizAnime, QuizPerso, QuizEmoji, QuizVF, Memory } from "./Quizzes";
import { Destin, Gacha, Prime, Survie } from "./Luck";
import { Blind, Tournoi, Preferes, Sauve, Tier } from "./Rank";
import { PetitBac, HeadsUp, Bingo } from "./Party";
import { BlindTest, Voix, Silhouette, Case, Karaoke } from "./MediaGames";
import { loadManifest } from "./media";

const G = (id: string, cat: string, title: string, tag: string, emoji: string, kanji: string, c: string, bg: string, meta: string[], help: string, media?: string): GameDef =>
  ({ id, cat, title, tag, emoji, kanji, c, bg, meta, help, media });

export const GAMES: GameDef[] = [
  G("undercover", "soiree", "Undercover", "Démasque l'imposteur", "🕵️", "潜", "#ff8fa3", "#ffe1e6", ["3 à 12 joueurs", "10 min"], ""),
  G("headsup", "soiree", "Qui suis-je ?", "Téléphone sur le front, devinez !", "🤳", "誰", "#ffd23f", "#fff4c4", ["2+ joueurs", "60 s"], "Pose le téléphone sur ton front. Tes amis te font deviner le personnage sans dire son nom. Un ami touche TROUVÉ ou PASSER."),
  G("petitbac", "soiree", "Petit Bac Manga", "Une lettre, quatre mots", "✍️", "字", "#7be0c3", "#d8f7ee", ["1+ joueur", "90 s"], "Une lettre est tirée. Écris vite un animé, un personnage, une attaque et un objet qui commencent par elle."),
  G("bingo", "soiree", "Bingo Otaku", "Coche tes expériences de fan", "🎯", "賓", "#ff9f68", "#ffe5d3", ["Solo ou amis", "5 min"], "Touche les cases qui te correspondent. Fais une ligne pour crier BINGO, puis compare avec tes amis."),
  G("karaoke", "soiree", "Chante la suite", "La musique s'arrête, tu continues", "🎤", "歌", "#ff6f91", "#ffdbe3", ["1+ joueur", "5 min"], "Un générique démarre puis s'arrête d'un coup. Chante la suite en rythme, puis écoute la vraie et juge-toi : RÉUSSI ou RATÉ.", "karaoke"),
  G("blindtest", "quiz", "Blind Test", "Openings, endings, OST", "🎧", "音", "#3ddc97", "#d4f7e8", ["Solo ou amis", "15 s par extrait"], "Écoute un extrait de 5 secondes et retrouve l'animé avant la fin du chrono.", "blindtest"),
  G("silhouette", "quiz", "Zoom et ombre", "Devine le héros ou le méchant", "👤", "影", "#6c757d", "#e3e6e9", ["Solo", "10 questions"], "Une image zoomée s'affiche. Chaque indice la montre davantage : plus tu devines tôt, plus tu gagnes de points.", "characters"),
  G("voice", "quiz", "Reconnais la voix", "Réplique culte ou cri de combat", "🎙️", "声", "#f77f00", "#ffe3c4", ["Solo ou amis", "20 s par extrait"], "Écoute une réplique ou un cri et retrouve le personnage.", "voices"),
  G("panel", "quiz", "Une seule case", "Retrouve le manga", "🖼️", "頁", "#a0c4ff", "#e1ecff", ["Solo", "10 questions"], "Une case ou un décor de manga s'affiche. Retrouve l'œuvre.", "manga"),
  G("emoji", "quiz", "Animé en émojis", "3 ou 4 émojis, un animé", "📓", "絵", "#b69bff", "#e9e0ff", ["Solo", "10 questions"], "Une suite d'émojis résume un animé. Choisis le bon titre parmi 4 propositions."),
  G("vf", "quiz", "Vrai ou Faux", "Anecdotes de l'univers anime", "⚡", "真", "#59c3ff", "#d6efff", ["Solo", "10 questions"], "Une affirmation s'affiche. Réponds VRAI ou FAUX, puis lis la précision."),
  G("qanime", "quiz", "Quel anime ?", "Du personnage à l'œuvre", "🎌", "作", "#ff7f7f", "#ffdcdc", ["Solo", "10 questions"], "Un personnage s'affiche. Trouve de quel anime il vient."),
  G("qperso", "quiz", "Quel personnage ?", "De l'œuvre au personnage", "🧑‍🎤", "人", "#8fe3a1", "#dcf8e2", ["Solo", "10 questions"], "Un anime s'affiche. Trouve quel personnage en fait partie."),
  G("memory", "quiz", "Memory Otaku", "Associe perso et anime", "🃏", "憶", "#ffb4e1", "#ffe3f4", ["Solo", "2 min"], "Retourne deux cartes. Associe chaque personnage à son anime avec le moins de coups possible."),
  G("destin", "hasard", "Roulette de destin", "Construis ton héros", "🎰", "運", "#ff9ec7", "#ffe0ee", ["Solo", "30 s"], "Choisis un univers. La roulette te donne ton clan, ton pouvoir, ton mentor, ton rival et ton niveau."),
  G("gacha", "hasard", "Qui est ton... ?", "Ton ami, ton ennemi, ton âme sœur", "💘", "縁", "#ff6f91", "#ffd9e2", ["Solo", "1 min"], "Tire au sort ton meilleur ami, ton ennemi juré, ton âme sœur, ton sauveur et ton mentor parmi les personnages."),
  G("prime", "hasard", "Prime et rang", "Ta prime de pirate, ton rang", "💰", "賞", "#f9c74f", "#fff1c9", ["Solo", "1 min"], "Réponds à 5 petites questions. Un peu de chance s'ajoute, et tu reçois ton rang de chasseur et ta prime en Berrys."),
  G("survie", "hasard", "Roue de survie", "Un seul survivant", "☠️", "生", "#adb5bd", "#e4e7ea", ["Solo ou amis", "2 min"], "8 personnages, un événement aléatoire à chaque tour. Touche TOUR SUIVANT jusqu'au dernier survivant."),
  G("blind", "classement", "Blind Ranking", "Classe sans savoir la suite", "🔢", "順", "#4cc9f0", "#d3f1fb", ["Solo ou amis", "3 min"], "Les personnages arrivent un par un. Place chacun dans ton top 10 sans pouvoir changer d'avis."),
  G("tournoi", "classement", "Tournoi", "Duels jusqu'au champion", "🏆", "闘", "#ff7b54", "#ffe0d6", ["Solo ou amis", "3 min"], "8 personnages, des duels. Touche celui que tu préfères jusqu'au grand vainqueur."),
  G("preferes", "classement", "Tu préfères ?", "Dilemmes d'otaku", "⚖️", "選", "#90e0ef", "#e0f7fb", ["Amis", "3 min"], "Deux choix impossibles. Touche celui que tu prends, puis compare avec tes amis."),
  G("sauve", "classement", "Sauve, Recrute, Élimine", "Trois persos, trois sorts", "🗡️", "断", "#e76f51", "#fbd9d0", ["Solo ou amis", "2 min"], "Trois personnages. Choisis qui tu sauves, qui tu recrutes, et le dernier est éliminé."),
  G("tier", "classement", "Tier List", "De S à D", "📊", "級", "#c77dff", "#ecd9ff", ["Solo ou amis", "3 min"], "Touche un personnage, puis touche le rang où le placer. Retouche un personnage placé pour le déplacer."),
];

const CATS: [string, string][] = [["all", "TOUS"], ["soiree", "SOIRÉE"], ["quiz", "QUIZ"], ["hasard", "HASARD"], ["classement", "DUEL"]];
const CATNAME: Record<string, string> = { soiree: "Soirée", quiz: "Quiz", hasard: "Hasard", classement: "Duel" };
export const COMP: Record<string, React.ComponentType<any>> = { headsup: HeadsUp, petitbac: PetitBac, bingo: Bingo, emoji: QuizEmoji, vf: QuizVF, qanime: QuizAnime, qperso: QuizPerso, memory: Memory,
  destin: Destin, gacha: Gacha, prime: Prime, survie: Survie, blind: Blind, tournoi: Tournoi, preferes: Preferes, sauve: Sauve, tier: Tier, blindtest: BlindTest, voice: Voix, silhouette: Silhouette, panel: Case, karaoke: Karaoke };

interface Props { sfx: Sfx; onUndercover: () => void; onRules: () => void; onLogo: () => void }

export default function Hub({ sfx, onUndercover, onRules, onLogo }: Props) {
  const rail = useRef<HTMLDivElement>(null); const [idx, setIdx] = useState(0); const [open, setOpen] = useState<string | null>(null);
  const [coach, setCoach] = useState(() => { try { return !localStorage.getItem("mg_coach"); } catch { return false; } });
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const g = GAMES[idx];
  const dismissCoach = () => { if (coach) { setCoach(false); try { localStorage.setItem("mg_coach", "1"); } catch { /* ignore */ } } };
  const onScroll = () => {
    const r = rail.current; if (!r) return; const mid = r.scrollLeft + r.clientWidth / 2; let best = 0, bd = 1e9;
    Array.from(r.children).forEach((el: any, k) => { const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = k; } });
    if (best !== idx) { setIdx(best); dismissCoach(); }
  };
  const goTo = (k: number) => { const r = rail.current; const el = r?.children[k] as HTMLElement; if (r && el) r.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - r.clientWidth / 2, behavior: "smooth" }); };
  const play = (k: number) => { sfx("click"); dismissCoach(); const id = GAMES[k].id; if (id === "undercover") onUndercover(); else setOpen(id); };
  const surprise = () => { const k = 1 + Math.floor(Math.random() * (GAMES.length - 1)); goTo(k); setTimeout(() => play(k), 450); };
  useEffect(() => { goTo(0); }, []);
  useEffect(() => { Promise.all(GAMES.filter((x) => x.media).map((x) => loadManifest(x.media!).then((l) => [x.id, l.length] as const))).then((a) => setCounts(Object.fromEntries(a))); }, []);

  const Cmp = open ? COMP[open] : null; const def = GAMES.find((x) => x.id === open);
  return (
    <div className="mg-root" style={{ ["--c" as any]: g.c, ["--bg" as any]: g.bg }}>
      <div className="mg-speed" />
      <div className="mg-top">
        <button className="mg-logo dg" onClick={onLogo}>SAKURA<br />UNDERCOVER<small>LE DOJO DES JEUX OTAKU</small></button>
        <div style={{ display: "flex", gap: 8 }}>
          {g.id === "undercover" && <button className="mg-chip" onClick={onRules}><BookOpen size={15} /> RÈGLES</button>}
          <button className="mg-chip" onClick={surprise}><Dices size={15} /> SURPRISE</button>
        </div>
      </div>
      <div className="mg-tabs">
        {CATS.map(([k, l]) => <button key={k} className={`mg-tab dg ${(k === "all" ? false : g.cat === k) ? "on" : ""}`}
          onClick={() => goTo(k === "all" ? 0 : GAMES.findIndex((x) => x.cat === k))}>{l}</button>)}
      </div>
      {coach && <div className="mg-coach"><div>👉 Glisse pour choisir, touche pour jouer</div></div>}
      <div className="mg-rail" ref={rail} onScroll={onScroll}>
        {GAMES.map((x, k) => (
          <button key={x.id} className={`mg-card ${k === idx ? "on" : ""}`} style={{ ["--c" as any]: x.c, background: x.c }} onClick={() => (k === idx ? play(k) : goTo(k))}>
            {x.media && counts && !counts[x.id] && <span className="mg-soon dg">BIENTÔT</span>}<span className="mg-kanji">{x.kanji}</span><span className="mg-cat">{CATNAME[x.cat]}</span><span className="mg-emoji">{x.emoji}</span>
            <span className="mg-title dg">{x.title}</span><span className="mg-tag">{x.tag}</span>
            <span className="mg-meta">{x.meta.map((m) => <span key={m}>{m}</span>)}</span>
          </button>))}
      </div>
      <div className="mg-count dg">{String(idx + 1).padStart(2, "0")} / {GAMES.length}</div>
      <div className="mg-bottom"><button className="mg-play dg" onClick={() => play(idx)}>JOUER</button></div>
      {Cmp && def && <Cmp def={def} sfx={sfx} onBack={() => setOpen(null)} />}
    </div>
  );
}
