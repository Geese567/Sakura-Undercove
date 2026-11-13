/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, ErrorInfo, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Shield, Search, Info, ArrowLeft, Plus, Minus, Play, 
  Settings, Volume2, VolumeX, Moon, Sun, Scroll, Bolt, 
  Eye, CheckCircle, CircleHelp, UserRoundSearch, Bird,
  Forward, RotateCcw, Home, X, Lock, Wand2, LogIn, LogOut, Trash2, Calendar
} from "lucide-react";
import { CATEGORIES, TRANSLATIONS } from "./constants";
import Shell from "./components/Shell";
import { GameState, Player, Role, Theme, Character } from "./types";
import { auth, db } from "./firebase";
import { 
  signOut
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocFromServer,
  doc
} from "firebase/firestore";

// Error handling for Firestore
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper for shuffling
const shuffle = <T,>(a: T[]): T[] => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const Petals = ({ theme, crazyMode }: { theme: Theme, crazyMode?: boolean }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const petals = useMemo(() => Array.from({ length: crazyMode ? 60 : (isDesktop ? 40 : 20) }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: crazyMode ? 3 + Math.random() * 5 : 15 + Math.random() * 25,
    size: crazyMode ? 20 + Math.random() * 30 : 10 + Math.random() * 20,
    rotate: Math.random() * 360
  })), [crazyMode, isDesktop]);

  const getGradient = () => {
    if (crazyMode) {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      const c1 = colors[Math.floor(Math.random() * colors.length)];
      const c2 = colors[Math.floor(Math.random() * colors.length)];
      return `radial-gradient(circle, ${c1} 0%, ${c2} 100%)`;
    }
    if (theme === 'shonen') return 'radial-gradient(circle, #ffdfc4 0%, #ffb380 100%)';
    return 'radial-gradient(circle, #ffe2e2 0%, #ffb3b3 100%)';
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -50, x: `${p.left}vw`, rotate: p.rotate, opacity: 0 }}
          animate={{ 
            y: '110vh', 
            x: [`${p.left}vw`, `${p.left + 10}vw`, `${p.left - 5}vw`],
            rotate: p.rotate + 720,
            opacity: [0, 0.6, 0.6, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "linear"
          }}
          style={{ 
            width: p.size, 
            height: p.size, 
            background: getGradient(),
            borderRadius: '100% 0% 100% 0%',
            boxShadow: '0 0 5px rgba(255, 223, 219, 0.5)'
          }}
        />
      ))}
    </div>
  );
};

const getRoles = (n: number) => {
  let u = 1, m = 0;
  if (n >= 6) m = 1;
  if (n >= 9) u = 2;
  if (n >= 11) m = 2;
  return { civils: n - u - m, undercovers: u, mrwhites: m };
};

const getInitials = (name: string) => (name?.trim().slice(0, 2).toUpperCase() || '??');

export default function App() {
  // Game State
  const [curScreen, setCurScreen] = useState<GameState>('home');
  const [setupStep, setSetupStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(''));
  const [currentCategory, setCurrentCategory] = useState('shonen');
  const [players, setPlayers] = useState<Player[]>([]);
  const [civilChar, setCivilChar] = useState<Character | null>(null);
  const [underChar, setUnderChar] = useState<Character | null>(null);
  const [civilPhoto, setCivilPhoto] = useState<string | undefined>(undefined);
  const [underPhoto, setUnderPhoto] = useState<string | undefined>(undefined);
  const [revIdx, setRevIdx] = useState(0);
  const [revOpen, setRevOpen] = useState(false);
  const [round, setRound] = useState(1);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [firstPlayer, setFirstPlayer] = useState<Player | null>(null);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const [winner, setWinner] = useState<Role | null>(null);
  const [mwGuessCorrect, setMwGuessCorrect] = useState<boolean | null>(null);
  const [mwGuessInput, setMwGuessInput] = useState('');
  const [showPeek, setShowPeek] = useState(false);
  const [peekPlayer, setPeekPlayer] = useState<Player | null>(null);

  // Easter Egg States
  const [logoClicks, setLogoClicks] = useState(0);
  const [showSecretMenu, setShowSecretMenu] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState<string | null>(null);
  const [crazyMode, setCrazyMode] = useState(false);

  // Settings State
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [appTheme, setAppTheme] = useState<Theme>('sakura');
  const [musicActive, setMusicActive] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [sfxVolume, setSfxVolume] = useState(0.4);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [displayMode, setDisplayMode] = useState<'name' | 'photo'>(() => {
    return (localStorage.getItem('undercover_displayMode') as 'name' | 'photo') || 'name';
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    localStorage.setItem('undercover_displayMode', displayMode);
  }, [displayMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (showRules) setShowRules(false);
        else if (showUnlockModal) setShowUnlockModal(false);
        else if (revOpen) setRevOpen(false);
        else if (showPeek) setShowPeek(false);
      }
      
      if (e.key === 'Enter') {
        // Auto-confirm logic based on screen
        if (curScreen === 'home') {
          // Accueil = hub de jeux : pas de raccourci Entrée
        } else if (curScreen === 'setup') {
          if (setupStep === 1) setSetupStep(displayMode === 'name' ? 2 : 3);
          else if (setupStep === 2) {
            setPlayerNames(Array(playerCount).fill(''));
            setSetupStep(3);
          }
          else if (setupStep === 3) handleStartGame();
        } else if (curScreen === 'dist') {
          if (!revOpen) setRevOpen(true);
          else {
            setRevOpen(false);
            if (revIdx < players.length - 1) setRevIdx(revIdx + 1);
            else setCurScreen('game');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [curScreen, setupStep, showSettings, showRules, showUnlockModal, revOpen, showPeek, revIdx, players.length, displayMode, playerCount]);

  // Audio Refs
  const homeMusicRef = useRef<HTMLAudioElement>(null);
  const gameMusicRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);

  const t = TRANSLATIONS[lang];

  // Initialize Audio
  useEffect(() => {
    document.title = "Sakura Undercover - Jeu de Rôle";
    const savedPremium = localStorage.getItem('sakura_premium') === 'true';
    setIsPremium(savedPremium);
    
    const savedLang = localStorage.getItem('sakuraLang');
    if (savedLang === 'fr' || savedLang === 'en') setLang(savedLang);

    const savedVol = localStorage.getItem('sakuraMusicVolume');
    if (savedVol) setMusicVolume(parseFloat(savedVol));

    const savedSfx = localStorage.getItem('sakuraSfxVolume');
    if (savedSfx) setSfxVolume(parseFloat(savedSfx));

    setTimeout(() => setShowSplash(false), 2500);
  }, []);

  useEffect(() => {
    if (homeMusicRef.current) homeMusicRef.current.volume = musicVolume;
    if (gameMusicRef.current) gameMusicRef.current.volume = musicVolume;
  }, [musicVolume]);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    sfxGainRef.current = audioCtxRef.current.createGain();
    sfxGainRef.current.gain.value = sfxVolume;
    sfxGainRef.current.connect(audioCtxRef.current.destination);
  };

  const playEffect = (type: 'click' | 'reveal' | 'vote' | 'win' | 'lose') => {
    if (!audioCtxRef.current || !sfxGainRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.connect(gain);
    gain.connect(sfxGainRef.current);

    switch(type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'reveal':
        osc.type = 'triangle';
        osc.frequency.value = 523.25;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      case 'vote':
        osc.type = 'sawtooth';
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'win':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.5); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      case 'lose':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.5); // A2
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
    }
  };

  // Music Control
  useEffect(() => {
    if (!musicActive || showPeek) {
      homeMusicRef.current?.pause();
      gameMusicRef.current?.pause();
      return;
    }

    if (curScreen === 'home') {
      gameMusicRef.current?.pause();
      homeMusicRef.current?.play().catch(() => {});
    } else {
      homeMusicRef.current?.pause();
      gameMusicRef.current?.play().catch(() => {});
    }
  }, [curScreen, musicActive, appTheme, showPeek]);

  // Game Logic
  const handleStartGame = async () => {
    initAudio();
    
    let cPhoto: string | undefined = undefined;
    let uPhoto: string | undefined = undefined;

    if (displayMode === 'photo') {
      try {
        const res = await fetch('assets/characters/characters.json');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        const availablePhotos = data.characters || [];
        
        if (availablePhotos.length < 2) {
          alert("Aucune image trouvée ou pas assez d'images. Veuillez ajouter des images dans assets/characters/ et mettre à jour characters.json. Retour au Mode Nom.");
          setDisplayMode('name');
        } else {
          const shuffledPhotos = shuffle([...availablePhotos]);
          cPhoto = `assets/characters/${shuffledPhotos[0]}`;
          uPhoto = `assets/characters/${shuffledPhotos[1]}`;
        }
      } catch (err) {
        console.error("Erreur lors du chargement des photos:", err);
        alert("Erreur lors du chargement des photos. Retour au Mode Nom.");
        setDisplayMode('name');
      }
    }

    const cat = CATEGORIES[currentCategory];
    const pool = shuffle([...cat.chars]);
    const cChar = pool[0];
    const uChar = pool[1];
    
    setCivilChar(cChar);
    setUnderChar(uChar);
    setCivilPhoto(cPhoto);
    setUnderPhoto(uPhoto);

    const { civils, undercovers, mrwhites } = getRoles(playerCount);
    const roles = shuffle([
      ...Array(civils).fill('civil'),
      ...Array(undercovers).fill('undercover'),
      ...Array(mrwhites).fill('mrwhite')
    ]);

    const newPlayers: Player[] = roles.map((role, idx) => ({
      id: idx + 1,
      name: playerNames[idx] || `Joueur ${idx + 1}`,
      role: role as Role,
      char: role === 'civil' ? cChar : role === 'undercover' ? uChar : null,
      photoUrl: role === 'civil' ? cPhoto : role === 'undercover' ? uPhoto : undefined,
      alive: true
    }));

    setPlayers(newPlayers);
    setFirstPlayer(newPlayers[Math.floor(Math.random() * newPlayers.length)]);
    setRevIdx(0);
    setRound(1);
    setSpeaking(null);
    setCurScreen('dist');
  };

  const handleEliminate = (pid: number) => {
    playEffect('vote');
    const updatedPlayers = players.map(p => p.id === pid ? { ...p, alive: false } : p);
    setPlayers(updatedPlayers);
    const p = players.find(x => x.id === pid)!;
    setEliminatedPlayer(p);

    if (p.role === 'mrwhite') {
      setMwGuessInput('');
    }
  };

  const checkWin = (currentPlayers: Player[]) => {
    const alive = currentPlayers.filter(p => p.alive);
    const c = alive.filter(p => p.role === 'civil').length;
    const u = alive.filter(p => p.role === 'undercover').length;
    const m = alive.filter(p => p.role === 'mrwhite').length;

    if (u === 0 && m === 0) return 'civil';
    if (u >= c) return 'undercover';
    return null;
  };

  const handleContinue = () => {
    if (mwGuessCorrect) {
      setWinner('mrwhite');
      return;
    }

    const win = checkWin(players);
    if (win) {
      setWinner(win);
    } else {
      setEliminatedPlayer(null);
      setMwGuessCorrect(null);
      setRound(r => r + 1);
      setCurScreen('game');
    }
  };

  const handleUnlock = () => {
    if (unlockCode === 'SAKURA2025') {
      setIsPremium(true);
      localStorage.setItem('sakura_premium', 'true');
      setShowUnlockModal(false);
    } else {
      alert('Code invalide');
    }
  };

  useEffect(() => {
    if (winner) {
      if (winner === 'civil') playEffect('win');
      else playEffect('lose');
    }
  }, [winner]);

  const resetGame = () => {
    setWinner(null);
    setEliminatedPlayer(null);
    setPlayers([]);
    setRound(1);
    setSpeaking(null);
    setFirstPlayer(null);
    setVotedFor(null);
    setMwGuessCorrect(null);
    setRevIdx(0);
    setRevOpen(false);
    setCivilChar(null);
    setUnderChar(null);
    setCurScreen('home');
    setSetupStep(1);
  };

  // Render Helpers
  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks === 5) {
      setEasterEggMessage("Tu as trouvé le menu secret !");
      setTimeout(() => setEasterEggMessage(null), 3000);
      setShowSecretMenu(true);
      setLogoClicks(0);
    }
  };

  const renderHome = () => (
    <div className="wrap">
      <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <div className="logo-eye">アンダーカバー</div>
        <div className="logo-main tracking-tighter">SAKURA</div>
        <div className="logo-sub">UNDERCOVER</div>
      </div>
      
      <div className="home-strip">
        {shuffle(CATEGORIES[currentCategory].chars).slice(0, 3).map((c) => (
          <motion.div 
            key={c.id} 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 0.3 }}
            className="hs-card"
          >
            <div className="font-bold text-[0.8rem]">{c.name}</div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={() => { initAudio(); setCurScreen('setup'); setSetupStep(1); }} 
        className="btn btn-p flex items-center justify-center gap-2"
        title="Commencer une nouvelle partie (Entrée)"
      >
        <Bolt className="w-5 h-5" /> {t.newGame}
      </button>
      <button 
        onClick={() => setShowRules(true)} 
        className="btn btn-s flex items-center justify-center gap-2"
        title="Voir les règles du jeu (Echap pour fermer)"
      >
        <Scroll className="w-5 h-5" /> {t.rules}
      </button>
    </div>
  );

  const renderSetup = () => (
    <div className="wrap relative">
      <button onClick={() => setCurScreen('home')} className="back-btn">
        <ArrowLeft className="w-6 h-6" />
      </button>

      {setupStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full space-y-6">
          <div className="text-center">
            <div className="logo-eye uppercase tracking-widest mb-2">{t.players}</div>
            <div className="logo-main text-5xl italic">{t.howMany}</div>
          </div>
          <div className="big-n">{playerCount}</div>
          <div className="cnt-row">
            <button onClick={() => setPlayerCount(Math.max(3, playerCount - 1))} className="cnt-b">−</button>
            <div className="font-bold text-sm tracking-widest">{t.players}</div>
            <button onClick={() => setPlayerCount(Math.min(12, playerCount + 1))} className="cnt-b">+</button>
          </div>
          <div className="role-box">
            {Object.entries(getRoles(playerCount)).map(([role, count]) => (
              <div key={role} className="rr">
                <div className="rlbl capitalize">
                  <div className={`rdot ${role === 'civils' ? 'bg-[var(--civ)]' : role === 'undercovers' ? 'bg-[var(--und)]' : 'bg-[var(--mrw)]'}`} />
                  {role === 'civils' ? t.civilPlural : role === 'undercovers' ? t.undercoverRole : t.mrwhiteRole}
                </div>
                <div className="rcnt">{count}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setSetupStep(displayMode === 'name' ? 2 : 3)} className="btn btn-p">{t.confirm}</button>
        </motion.div>
      )}

      {setupStep === 2 && displayMode === 'name' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full space-y-6">
          <div className="text-center mb-4">
            <div className="logo-eye uppercase tracking-widest mb-2">{t.category}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(CATEGORIES).map(([id, cat]) => (
              <button 
                key={id}
                onClick={() => setCurrentCategory(id)}
                className={`p-4 rounded-2xl border-2 transition-all ${currentCategory === id ? 'border-[var(--accent-pink)] bg-[var(--card-bg)]' : 'border-transparent bg-white/50'}`}
              >
                <div className="font-bold text-sm">{cat.name}</div>
                <div className="text-[0.6rem] opacity-50">{cat.chars.length} personnages</div>
              </button>
            ))}
          </div>
          <button onClick={() => {
            setPlayerNames(Array(playerCount).fill(''));
            setSetupStep(3);
          }} className="btn btn-p">{t.confirm}</button>
        </motion.div>
      )}

      {setupStep === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full space-y-4">
          <div className="text-center mb-4">
            <div className="logo-eye uppercase tracking-widest mb-2">{t.pseudos}</div>
          </div>
          <div className="name-list max-h-[40vh] overflow-y-auto pr-2">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} className="name-row">
                <div className="nr-n">{i + 1}</div>
                <div className="av">{getInitials(playerNames[i])}</div>
                <input 
                  className="inp"
                  placeholder={`Joueur ${i + 1}`}
                  value={playerNames[i]}
                  onChange={(e) => {
                    const next = [...playerNames];
                    next[i] = e.target.value;
                    setPlayerNames(next);
                  }}
                />
              </div>
            ))}
          </div>
          <button onClick={handleStartGame} className="btn btn-p">{t.start}</button>
        </motion.div>
      )}
    </div>
  );

  const renderDist = () => {
    const p = players[revIdx];
    return (
      <div className="wrap relative">
        <button onClick={() => setCurScreen('setup')} className="back-btn">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="sec-t flex items-center gap-2"><Shield className="w-5 h-5" /> {t.distribution}</div>
        <div className="sec-s text-center">{t.passPhone.replace('{name}', p.name)}</div>
        
        <div className="dist-q w-full space-y-2">
          {players.map((player, i) => (
            <div key={player.id} className={`dqi ${i === revIdx ? 'cur' : i < revIdx ? 'done' : ''}`}>
              <div className="dqi-n">#{player.id}</div>
              <div className="av w-8 h-8 text-xs">{getInitials(player.name)}</div>
              <div className="dqi-nm flex-1">{player.name}</div>
              <div className="dqi-st">{i < revIdx ? '✓' : i === revIdx ? '◉' : '○'}</div>
            </div>
          ))}
        </div>

        <button onClick={() => setRevOpen(true)} className="btn btn-p flex items-center justify-center gap-2">
          <Eye className="w-5 h-5" /> {p.name} — {t.seeRole}
        </button>
        <div className="hint">{t.tapToReveal}</div>

        <AnimatePresence>
          {revOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="ov show"
            >
              <div className="rev-card">
                <div className="p-6 text-center border-b border-black/5">
                  <div className="text-xs font-bold opacity-30 uppercase tracking-widest mb-1">JOUEUR {p.id}</div>
                  <div className="text-2xl font-serif italic font-bold">{p.name}</div>
                </div>
                
                <div className="sq relative min-h-[350px] flex flex-col items-center justify-center p-8">
                  <div className="sq-lock flex flex-col items-center gap-4 cursor-pointer z-10" onClick={(e) => {
                    playEffect('reveal');
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement).style.opacity = '1';
                  }}>
                    <Lock className="w-12 h-12 opacity-20" />
                    <div className="text-xs font-bold opacity-30 uppercase tracking-widest">Appuyez pour voir</div>
                  </div>
                  
                  <div className="absolute inset-0 bg-[var(--card-bg)] backdrop-blur-md flex flex-col items-center justify-center p-8 text-center opacity-0 transition-opacity duration-300">
                    <div className="sq-badge mb-6">
                      {p.role === 'civil' ? <><Bird className="w-4 h-4 inline mr-1" /> {t.civilRole}</> : 
                       p.role === 'undercover' ? <><UserRoundSearch className="w-4 h-4 inline mr-1" /> {t.undercoverRole}</> : 
                       <><CircleHelp className="w-4 h-4 inline mr-1" /> {t.mrwhiteRole}</>}
                    </div>
                    
                    {p.role === 'mrwhite' ? (
                      <div className="space-y-4">
                        <CircleHelp className="w-20 h-20 mx-auto opacity-10" />
                        <div className="text-xs font-mono opacity-40 uppercase tracking-[0.3em]">{t.noWord}</div>
                      </div>
                    ) : (
                      displayMode === 'photo' ? (
                        <div className="space-y-4">
                          <img src={p.photoUrl} alt="Personnage" className="w-48 h-48 object-cover rounded-xl shadow-lg border-2 border-[var(--card-border)]" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-4xl font-serif italic font-bold text-[var(--accent-dark)]">{p.char?.name}</div>
                          <div className="text-sm opacity-50">{p.char?.anime}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <button onClick={() => {
                    setRevOpen(false);
                    if (revIdx < players.length - 1) setRevIdx(revIdx + 1);
                    else setCurScreen('game');
                  }} className="btn btn-p w-full flex items-center justify-center gap-2">
                    {t.next} <Forward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderGame = () => (
    <div className="wrap relative">
      <button onClick={resetGame} className="back-btn">
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="flex justify-between items-center w-full mb-4">
        <div className="rnd-pill">
          <span className="opacity-50 text-[0.6rem] uppercase font-bold mr-2">{t.round}</span>
          <span className="font-serif italic font-bold">{round}</span>
        </div>
        <div className="chips">
          <div className="chip"><Bird className="w-3 h-3" /> {players.filter(p => p.alive && p.role === 'civil').length}</div>
          <div className="chip"><UserRoundSearch className="w-3 h-3" /> {players.filter(p => p.alive && p.role === 'undercover').length}</div>
          <div className="chip"><CircleHelp className="w-3 h-3" /> {players.filter(p => p.alive && p.role === 'mrwhite').length}</div>
        </div>
      </div>

      <div className="sec-s text-center mb-6">{t.discuss}</div>
      {firstPlayer && round === 1 && (
        <div className="text-center mb-4 text-sm font-bold text-[var(--accent-dark)] bg-[var(--card-bg)] p-2 rounded-xl border border-black/5">
          <span className="uppercase">{firstPlayer.name}</span> {t.playerStarts}
        </div>
      )}

      <div className="game-grid mb-8">
        {players.map((p, i) => (
          <motion.div 
            key={p.id}
            initial={false}
            animate={
              !p.alive 
                ? { 
                    scale: 0.85, 
                    opacity: 0.3, 
                    filter: 'grayscale(100%)', 
                    x: [0, -8, 8, -8, 8, 0],
                    rotate: [0, -3, 3, -3, 3, 0],
                  }
                : { scale: 1, opacity: 1, filter: 'grayscale(0%)', x: 0, rotate: 0 }
            }
            transition={{ duration: 0.5 }}
            whileHover={p.alive ? { scale: 1.05, translateY: -5, backgroundColor: 'rgba(255, 255, 255, 0.9)' } : undefined}
            whileTap={p.alive ? { scale: 0.95 } : undefined}
            onClick={() => p.alive && setSpeaking(speaking === i ? null : i)}
            className={`gp ${speaking === i ? 'speak' : ''} ${!p.alive ? 'eliminated' : ''}`}
            title={p.alive ? `Cliquez pour indiquer que ${p.name} parle` : `${p.name} est éliminé(e)`}
          >
            <div className="gp-av mx-auto flex items-center justify-center rounded-full mb-2">
              {getInitials(p.name)}
            </div>
            <div className="gp-name truncate">{p.name}</div>
            <div className="text-[0.6rem] opacity-30 font-bold">J{p.id}</div>
            {!p.alive && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="elim-x"
              >
                💀
              </motion.div>
            )}
            {p.alive && speaking === i && (
              <motion.div 
                layoutId="speaking-indicator"
                className="absolute -top-2 -right-2 bg-[var(--accent-pink)] text-white p-1 rounded-full shadow-lg"
              >
                <Volume2 className="w-3 h-3" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button onClick={() => setShowPeek(true)} className="btn btn-s flex items-center justify-center gap-2">
          <Eye className="w-5 h-5" /> {t.seeRole}
        </button>
        <button onClick={() => setCurScreen('vote')} className="btn btn-p flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" /> {t.vote}
        </button>
      </div>
      
      <div className="hint mt-4">{t.tapToSpeak}</div>

      <AnimatePresence>
        {showPeek && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="ov show"
          >
            <div className="rev-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif italic font-bold text-xl">{t.seeRole}</h3>
                <button onClick={() => { setShowPeek(false); setPeekPlayer(null); }}><X className="w-6 h-6" /></button>
              </div>
              
              {!peekPlayer ? (
                <div className="grid grid-cols-2 gap-3">
                  {players.filter(p => p.alive).map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setPeekPlayer(p)}
                      className="p-3 rounded-xl border border-black/5 bg-white/50 text-sm font-bold hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="text-xs font-bold opacity-30 uppercase tracking-widest">{peekPlayer.name}</div>
                  
                  <div className="sq relative min-h-[200px] flex flex-col items-center justify-center p-8 rounded-2xl border border-black/5 bg-white/50 overflow-hidden">
                    <div className="sq-lock flex flex-col items-center gap-4 cursor-pointer z-10" onClick={(e) => {
                      playEffect('reveal');
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement).style.opacity = '1';
                    }}>
                      <Lock className="w-12 h-12 opacity-20" />
                      <div className="text-xs font-bold opacity-30 uppercase tracking-widest">Appuyez pour voir</div>
                    </div>
                    
                    <div className="absolute inset-0 bg-[var(--card-bg)] backdrop-blur-md flex flex-col items-center justify-center p-8 text-center opacity-0 transition-opacity duration-300">
                      {peekPlayer.role === 'mrwhite' ? (
                        <div className="text-2xl font-serif italic font-bold text-[var(--mrw)]">{t.mrwhiteRole}</div>
                      ) : (
                        displayMode === 'photo' ? (
                          <div className="space-y-4">
                            <img src={peekPlayer.photoUrl} alt="Personnage" className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-[var(--card-border)]" />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-3xl font-serif italic font-bold text-[var(--accent-dark)]">{peekPlayer.char?.name}</div>
                            <div className="text-sm opacity-50">{peekPlayer.char?.anime}</div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => { setShowPeek(false); setPeekPlayer(null); }}
                    className="btn btn-p mt-4"
                  >
                    {t.confirm}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderVote = () => (
    <div className="wrap relative">
      <button onClick={() => setCurScreen('game')} className="back-btn">
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="sec-t flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5" /> {t.vote}</div>
      <div className="sec-s text-center mb-6">{t.whoEliminate}</div>

      <div className="vote-list w-full max-h-[50vh] overflow-y-auto pr-2">
        {players.filter(p => p.alive).map(p => (
          <div 
            key={p.id} 
            onClick={() => setVotedFor(p.id)}
            className={`vi ${votedFor === p.id ? 'sel' : ''}`}
          >
            <div className="vi-av flex items-center justify-center rounded-full">{getInitials(p.name)}</div>
            <div className="v-info">
              <div className="text-[0.6rem] font-bold opacity-30 uppercase">JOUEUR {p.id}</div>
              <div className="font-bold">{p.name}</div>
            </div>
            <div className="v-chk">
              {votedFor === p.id && <CheckCircle className="w-4 h-4" />}
            </div>
          </div>
        ))}
      </div>

      <button 
        disabled={!votedFor}
        onClick={() => handleEliminate(votedFor!)} 
        className="btn btn-p mt-8 disabled:opacity-30"
      >
        {t.confirm}
      </button>
    </div>
  );

  return (
    <div id="app" className={`theme-${appTheme}`}>
        <Petals theme={appTheme} crazyMode={crazyMode} />
        
        <AnimatePresence>
          {showSplash && (
            <motion.div 
              className="splash-screen"
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="splash-title">SAKURA<br/>UNDERCOVER</div>
              <div className="splash-author">BY SENKU6C</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div 
            key={curScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="screen active"
          >
            {curScreen === 'home' && (
              <Shell
                sfx={playEffect}
                onUndercover={() => { initAudio(); setCurScreen('setup'); setSetupStep(1); }}
                onRules={() => setShowRules(true)}
                onSettings={() => setShowSettings(true)}
              />
            )}
            {curScreen === 'setup' && renderSetup()}
            {curScreen === 'dist' && renderDist()}
            {curScreen === 'game' && renderGame()}
            {curScreen === 'vote' && renderVote()}
          </motion.div>
        </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {eliminatedPlayer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="elim-ov show">
            <div className="elim-sq flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">💀</div>
                <div className="text-[0.6rem] font-bold opacity-30 uppercase">{t.roleRevealed}</div>
              </div>
            </div>
            
            <div className="elim-t text-center italic font-serif text-4xl mb-2">
              {eliminatedPlayer.role === 'civil' ? t.innocent : eliminatedPlayer.role === 'undercover' ? t.undercoverRole : t.mrwhiteRole}
            </div>
            
            <div className="elim-s text-center opacity-70 mb-8">
              {eliminatedPlayer.name} {t.innocentEliminated}
            </div>

            {eliminatedPlayer.role !== 'mrwhite' && (
              <div className="text-center mb-8">
                <div className="text-xs font-bold opacity-30 uppercase tracking-widest mb-1">{t.word}</div>
                {displayMode === 'photo' ? (
                  <img src={eliminatedPlayer.photoUrl} alt="Personnage" className="w-32 h-32 object-cover rounded-xl shadow-lg border-2 border-[var(--card-border)] mx-auto" />
                ) : (
                  <div className="text-2xl font-serif italic text-[var(--accent-dark)]">{eliminatedPlayer.char?.name}</div>
                )}
              </div>
            )}

            {eliminatedPlayer.role === 'mrwhite' && mwGuessCorrect === null && (
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <div className="text-center font-bold text-sm uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                  <Wand2 className="w-4 h-4" /> {t.mrWhiteGuessTitle}
                </div>
                <div className="space-y-4">
                  <input 
                    type="text"
                    className="inp w-full text-center"
                    placeholder={lang === 'fr' ? "Nom du personnage..." : "Character name..."}
                    value={mwGuessInput}
                    onChange={(e) => setMwGuessInput(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      const guess = mwGuessInput.trim().toLowerCase();
                      let isCorrect = false;

                      if (displayMode === 'photo' && civilPhoto) {
                        // Guess must match the filename without extension
                        const fileName = civilPhoto.split('/').pop()?.split('.')[0]?.toLowerCase() || '';
                        isCorrect = (guess === fileName);
                      } else if (civilChar) {
                        // Guess must match any part of the name (first or last)
                        const fullName = civilChar.name.toLowerCase();
                        const nameParts = fullName.split(/\s+/);
                        isCorrect = (guess === fullName || nameParts.includes(guess));
                      }

                      setMwGuessCorrect(isCorrect);
                    }}
                    className="btn btn-p w-full"
                  >
                    {t.confirm}
                  </button>
                </div>
              </div>
            )}
            {eliminatedPlayer.role === 'mrwhite' && mwGuessCorrect !== null && (
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8">
                <div className={`text-center font-bold ${mwGuessCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {mwGuessCorrect ? t.guessCorrect : t.guessWrong}
                </div>
                {!mwGuessCorrect && (
                  <div className="text-center mt-2 text-sm opacity-60">
                    {lang === 'fr' ? "La réponse était : " : "The answer was: "} 
                    {displayMode === 'photo' && civilPhoto 
                      ? civilPhoto.split('/').pop()?.split('.')[0] 
                      : civilChar?.name}
                  </div>
                )}
              </div>
            )}

            {(eliminatedPlayer.role !== 'mrwhite' || mwGuessCorrect !== null) && (
              <button onClick={handleContinue} className="btn btn-p max-w-xs flex items-center justify-center gap-2">
                <Forward className="w-5 h-5" /> {t.confirm}
              </button>
            )}
          </motion.div>
        )}

        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="win-ov show">
            <div className="win-emo text-8xl mb-4">
              {winner === 'civil' ? '🕊️' : winner === 'undercover' ? '🕵️' : '🃏'}
            </div>
            <div className="win-t text-5xl font-serif italic font-bold mb-2">
              {winner === 'civil' ? t.winCivilTitle : winner === 'undercover' ? t.winUndercoverTitle : t.winMrwhiteTitle}
            </div>
            <div className="win-s opacity-70 mb-8 text-center px-8">
              {winner === 'civil' ? t.winCivilDesc : winner === 'undercover' ? t.winUndercoverDesc : t.winMrwhiteDesc}
            </div>

            {/* Reveal Words */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-xs font-bold opacity-50 uppercase mb-1">{t.civilRole}</div>
                {displayMode === 'photo' ? (
                  <img src={civilPhoto} alt="Civil" className="w-16 h-16 object-cover rounded-lg mx-auto" />
                ) : (
                  <div className="text-xl font-serif italic text-[var(--civ)]">{civilChar?.name}</div>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs font-bold opacity-50 uppercase mb-1">{t.undercoverRole}</div>
                {displayMode === 'photo' ? (
                  <img src={underPhoto} alt="Undercover" className="w-16 h-16 object-cover rounded-lg mx-auto" />
                ) : (
                  <div className="text-xl font-serif italic text-[var(--und)]">{underChar?.name}</div>
                )}
              </div>
            </div>

            <div className="summary-table w-full max-w-sm mb-8 overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <table className="w-full text-left">
                <thead className="bg-black/10">
                  <tr className="text-[0.6rem] opacity-50 uppercase font-bold tracking-widest">
                    <th className="p-3">Joueur</th>
                    <th className="p-3">Rôle</th>
                    <th className="p-3">{displayMode === 'photo' ? 'Photo' : t.word}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {players.map(p => (
                    <tr key={p.id} className="transition-colors hover:bg-white/5">
                      <td className="p-3 font-bold text-sm">{p.name}</td>
                      <td className="p-3 text-xs opacity-70 capitalize">
                        {p.role === 'civil' ? t.civilRole : p.role === 'undercover' ? t.undercoverRole : t.mrwhiteRole}
                      </td>
                      <td className="p-3 text-xs font-serif italic opacity-90">
                        {displayMode === 'photo' && p.role !== 'mrwhite' ? (
                          <img src={p.photoUrl} alt="Personnage" className="w-8 h-8 object-cover rounded-md" />
                        ) : (
                          p.char?.name || t.noWord
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 w-full max-w-xs">
              <button onClick={() => { setWinner(null); setCurScreen('setup'); setSetupStep(1); }} className="btn btn-p flex-1 flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" /> {t.replay}
              </button>
              <button onClick={resetGame} className="btn btn-s flex-1 flex items-center justify-center gap-2">
                <Home className="w-5 h-5" /> {t.home}
              </button>
            </div>
          </motion.div>
        )}

        {showRules && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rules-overlay show">
            <div className="rules-container relative">
              <button onClick={() => setShowRules(false)} className="close-rules"><X className="w-6 h-6" /></button>
              <h2 className="font-serif italic font-bold text-3xl mb-6 flex items-center gap-3">
                <Scroll className="w-8 h-8 text-[var(--accent-pink)]" /> {t.rulesTitle}
              </h2>
              
              <div className="space-y-6">
                <section>
                  <h3 className="font-bold uppercase text-sm tracking-widest mb-2 text-[var(--accent-dark)]">{t.principle}</h3>
                  <p className="text-sm opacity-70 leading-relaxed">{t.principleText}</p>
                </section>
                <section className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-white/50 rounded-2xl border border-black/5">
                    <h4 className="font-bold text-xs uppercase mb-1 flex items-center gap-2"><Bird className="w-3 h-3" /> {t.civilRole}</h4>
                    <p className="text-[0.7rem] opacity-60">{t.civilRuleText}</p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-2xl border border-black/5">
                    <h4 className="font-bold text-xs uppercase mb-1 flex items-center gap-2 text-[var(--und)]"><UserRoundSearch className="w-3 h-3" /> {t.undercoverRole}</h4>
                    <p className="text-[0.7rem] opacity-60">{t.undercoverRuleText}</p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-2xl border border-black/5">
                    <h4 className="font-bold text-xs uppercase mb-1 flex items-center gap-2 text-[var(--mrw)]"><CircleHelp className="w-3 h-3" /> {t.mrwhiteRole}</h4>
                    <p className="text-[0.7rem] opacity-60">{t.mrwhiteRuleText}</p>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="settings-overlay show">
            <div className="settings-container relative">
              <button onClick={() => setShowSettings(false)} className="close-settings"><X className="w-6 h-6" /></button>
              <h2 className="font-serif italic font-bold text-3xl mb-6 flex items-center gap-3">
                <Settings className="w-8 h-8 text-[var(--accent-pink)]" /> {t.settings}
              </h2>

              <div className="space-y-8">
                <section>
                  <h3 className="font-bold uppercase text-[0.6rem] tracking-[0.3em] mb-4 opacity-30">{t.language}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setLang('fr')} className={`btn-sm flex-1 ${lang === 'fr' ? 'bg-[var(--text-dark)] text-[var(--bg-primary)]' : 'bg-white/50'}`}>FRANÇAIS</button>
                    <button onClick={() => setLang('en')} className={`btn-sm flex-1 ${lang === 'en' ? 'bg-[var(--text-dark)] text-[var(--bg-primary)]' : 'bg-white/50'}`}>ENGLISH</button>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold uppercase text-[0.6rem] tracking-[0.3em] mb-4 opacity-30">{t.theme}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setAppTheme('sakura')} className={`btn-sm flex-1 ${appTheme === 'sakura' ? 'bg-[var(--text-dark)] text-[var(--bg-primary)]' : 'bg-white/50'}`}>SAKURA</button>
                    <button onClick={() => setAppTheme('shonen')} className={`btn-sm flex-1 ${appTheme === 'shonen' ? 'bg-[var(--text-dark)] text-[var(--bg-primary)]' : 'bg-white/50'}`}>SHONEN</button>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold uppercase text-[0.6rem] tracking-[0.3em] mb-4 opacity-30">AUDIO</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Volume2 className="w-4 h-4 opacity-30" />
                      <input 
                        type="range" min="0" max="1" step="0.1" 
                        value={musicVolume} 
                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                        className="flex-1 accent-[var(--accent-pink)]"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold uppercase text-[0.6rem] tracking-[0.3em] mb-4 opacity-30">MODE D'AFFICHAGE</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setDisplayMode('name')} className={`btn-sm flex-1 ${displayMode === 'name' ? 'bg-[var(--text-dark)] text-[var(--bg-primary)]' : 'bg-white/50'}`}>NOMS</button>
                    <button onClick={() => setDisplayMode('photo')} className={`btn-sm flex-1 ${displayMode === 'photo' ? 'bg-[var(--text-dark)] text-[var(--bg-primary)]' : 'bg-white/50'}`}>PHOTOS</button>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold uppercase text-[0.6rem] tracking-[0.3em] mb-4 opacity-30">PREMIUM</h3>
                  <div className="text-xs opacity-50 text-center">
                    {isPremium ? "Premium activé" : "Débloquez plus de fonctionnalités"}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {showUnlockModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="unlock-modal show">
            <div className="unlock-container">
              <h3 className="font-serif italic font-bold text-2xl mb-2">Premium</h3>
              <p className="text-sm opacity-60 mb-6 px-4">Soutenez le développement et débloquez les futures fonctionnalités.</p>
              <input 
                className="unlock-code-input mb-4"
                placeholder="Code d'activation"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={handleUnlock} className="btn btn-p flex-1">Activer</button>
                <button onClick={() => setShowUnlockModal(false)} className="btn btn-s flex-1">Fermer</button>
              </div>
              <div className="mt-4 text-[0.6rem] opacity-30">Astuce: SAKURA2025</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Easter Egg Message */}
      <AnimatePresence>
        {easterEggMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-black/80 text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-white/20 backdrop-blur-md"
          >
            {easterEggMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Menu Modal */}
      <AnimatePresence>
        {showSecretMenu && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="ov show z-[60]"
          >
            <div className="rev-card p-6 border-2 border-[var(--accent-pink)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif italic font-bold text-xl text-[var(--accent-pink)]">Menu Secret</h3>
                <button onClick={() => setShowSecretMenu(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setCrazyMode(!crazyMode);
                    setEasterEggMessage(crazyMode ? "Mode normal activé" : "Mode CRAZY activé !");
                    setTimeout(() => setEasterEggMessage(null), 3000);
                  }} 
                  className={`btn w-full ${crazyMode ? 'btn-p' : 'btn-s'}`}
                >
                  {crazyMode ? "Désactiver Mode Crazy" : "Activer Mode Crazy"}
                </button>
                <div className="text-xs opacity-50 mt-4">
                  <strong>Easter Eggs :</strong><br/>
                  1. Cliquez 5 fois sur le logo pour ce menu.<br/>
                  2. Tapez 'SAKURA2025' pour débloquer le premium.<br/>
                  3. Le mode Crazy accélère les pétales et change les couleurs !
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => setShowSettings(true)} 
          className="settings-btn shadow-xl"
          title="Paramètres (Echap pour fermer)"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={() => setMusicActive(!musicActive)} 
          className="external-sound-btn shadow-xl"
          title={musicActive ? "Couper la musique" : "Activer la musique"}
        >
          {musicActive ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Audio Elements */}
      <audio ref={homeMusicRef} src={
        appTheme === 'shonen' ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" :
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
      } loop />
      <audio ref={gameMusicRef} src={
        appTheme === 'shonen' ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" :
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
      } loop />
    </div>
  );
}
