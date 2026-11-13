export type Tier = "free" | "rare" | "legendary";
export interface ThemeDef { id: string; name: string; family: "classic" | "waifu" | "homme"; tier: Tier; price: number; level: number; kanji: string; mood: string; bg: string; bg2: string; a: string; b: string; v: string; fx: "petals" | "snow" | "sparks" | "none" }
const T = (id: string, name: string, family: ThemeDef["family"], tier: Tier, price: number, level: number, kanji: string, mood: string, bg: string, bg2: string, a: string, b: string, v: string, fx: ThemeDef["fx"]): ThemeDef => ({ id, name, family, tier, price, level, kanji, mood, bg, bg2, a, b, v, fx });
export const THEMES: ThemeDef[] = [
  T("classic", "Classique", "classic", "free", 0, 1, "道", "Dojo nocturne", "#111018", "#1C1926", "#FF719A", "#E83E89", "#A78BFA", "none"),
  T("sakura", "Sakura", "waifu", "free", 0, 1, "櫻", "Cerisiers, lune rose, temple", "#111018", "#1C1926", "#FF719A", "#E83E89", "#A78BFA", "petals"),
  T("akari", "Akari", "waifu", "rare", 300, 2, "紅", "Temple, flammes, lanternes", "#140808", "#231010", "#FF3B3B", "#B3122B", "#FF9F43", "sparks"),
  T("yuki", "Yuki", "waifu", "rare", 300, 2, "雪", "Neige, montagne, glace", "#0B1620", "#12263A", "#7DD3FC", "#38BDF8", "#E0F2FE", "snow"),
  T("hikari", "Hikari", "waifu", "rare", 400, 3, "光", "Soleil couchant, lumière dorée", "#17110A", "#2A1D0E", "#FBBF24", "#F97316", "#FDE68A", "sparks"),
  T("kurohana", "Kurohana", "waifu", "legendary", 800, 5, "黒", "Nuit, fleurs sombres, néons", "#0C0814", "#170F26", "#E879F9", "#7C3AED", "#F0ABFC", "none"),
  T("shadow", "Shadow", "homme", "rare", 300, 2, "影", "Ninja, lune rouge", "#0E0E10", "#1A1A1F", "#EF4444", "#9CA3AF", "#6B7280", "none"),
  T("ryu", "Ryu", "homme", "rare", 400, 3, "龍", "Flammes et dragon", "#140B07", "#25140C", "#F97316", "#DC2626", "#FB923C", "sparks"),
  T("akuma", "Akuma", "homme", "legendary", 800, 5, "魔", "Univers sombre et pourpre", "#0D0712", "#1A0F26", "#A855F7", "#7E22CE", "#C084FC", "none"),
  T("renji", "Renji", "homme", "rare", 400, 3, "雷", "Éclairs, ville japonaise", "#070D17", "#0F1B30", "#3B82F6", "#22D3EE", "#93C5FD", "sparks"),
  T("zen", "Zen", "homme", "legendary", 1000, 6, "禅", "Temple, lune, montagnes", "#0A0F1E", "#131B33", "#CBD5E1", "#818CF8", "#E2E8F0", "snow"),
];
export const getTheme = (id: string) => THEMES.find((t) => t.id === id) || THEMES[1];
