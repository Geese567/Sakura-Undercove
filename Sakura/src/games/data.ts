export const EMOJI_PUZZLES = [
  { e: "📓✍️🍎💀", a: "Death Note" }, { e: "🏴‍☠️👒🍖🌊", a: "One Piece" }, { e: "🍥🦊🍜🥷", a: "Naruto" },
  { e: "🐉🔮7️⃣⚡", a: "Dragon Ball" }, { e: "🧱👹⚔️🏙️", a: "L'Attaque des Titans" }, { e: "🗡️👹🌊🎍", a: "Demon Slayer" },
  { e: "⚗️🦾🔥🛡️", a: "Fullmetal Alchemist" }, { e: "🤞👹💜🔮", a: "Jujutsu Kaisen" }, { e: "🎭👁️☕🩸", a: "Tokyo Ghoul" },
  { e: "🚀🎷🐶🤠", a: "Cowboy Bebop" }, { e: "🤖🧒💜🌌", a: "Evangelion" }, { e: "🎣🃏⚡🌱", a: "Hunter x Hunter" },
  { e: "💀⚔️🍊👻", a: "Bleach" }, { e: "🌙👸🪄🐱", a: "Sailor Moon" }, { e: "👊🥚🦸😑", a: "One Punch Man" },
  { e: "🏐🧡🦉🔥", a: "Haikyu!!" },
];

export const VF = [
  { q: "Le Rasengan a été inventé par Kakashi.", v: false, n: "Il a été créé par Minato, le 4e Hokage." },
  { q: "L'anniversaire de Luffy est le 5 mai.", v: true, n: "Le 5 mai, jour des enfants au Japon." },
  { q: "Dragon Ball a été créé par Akira Toriyama.", v: true, n: "Le mangaka est décédé en 2024." },
  { q: "Zoro se bat avec trois sabres.", v: true, n: "Le style Santoryu." },
  { q: "Saitama est chauve à cause de son entraînement.", v: true, n: "100 pompes, 100 abdos, 100 squats et 10 km, tous les jours." },
  { q: "Eren Yeager est le héros de Fullmetal Alchemist.", v: false, n: "Eren est dans L'Attaque des Titans. Dans FMA ce sont les frères Elric." },
  { q: "Ryuk, le Shinigami de Death Note, adore les pommes.", v: true, n: "C'est son grand plaisir dans le monde humain." },
  { q: "Naruto est le fils de Kakashi.", v: false, n: "Ses parents sont Minato et Kushina." },
  { q: "Edward Elric cherche la pierre philosophale.", v: true, n: "Pour retrouver son corps et celui d'Alphonse." },
  { q: "Yuji Itadori avale un doigt de Sukuna.", v: true, n: "C'est ainsi que commence Jujutsu Kaisen." },
  { q: "Mikasa est la sœur biologique d'Eren.", v: false, n: "Elle a été recueillie par la famille d'Eren." },
  { q: "Vegeta est le prince des Saiyans.", v: true, n: "Son orgueil en découle." },
  { q: "Gon cherche son père Ging dans Hunter x Hunter.", v: true, n: "Ging est un Hunter célèbre." },
  { q: "Rimuru Tempest se réincarne en loup.", v: false, n: "Il se réincarne en slime." },
  { q: "Tanjiro Kamado porte une cicatrice sur le front.", v: true, n: "Elle apparaît dès le début de l'histoire." },
  { q: "One Piece est publié dans le Weekly Shonen Jump.", v: true, n: "Depuis 1997." },
];

export const DILEMMES: [string, string][] = [
  ["Manger autant que Luffy sans jamais grossir", "Avoir la force de Saitama mais t'ennuyer en permanence"],
  ["Un Fruit du Démon surpuissant, mais tu ne sais plus nager", "Aucun pouvoir, mais un équipage de rêve"],
  ["Être le meilleur ami du héros", "Être son rival"],
  ["Naître dans un clan légendaire mais maudit", "Naître orphelin avec un destin de héros"],
  ["Une épée légendaire qui parle sans arrêt", "Un familier mignon qui se bat à ta place"],
  ["10 ans dans la salle de l'esprit et du temps", "Un pouvoir ultime, mais 5 minutes par jour"],
  ["Un arc filler de 100 épisodes", "Attendre 2 ans la suite du manga"],
  ["Tout en VOSTFR pour toujours", "Tout en VF pour toujours"],
  ["Ton perso secondaire préféré meurt à l'épisode 3", "Il survit mais devient le méchant"],
  ["Ton opening préféré en boucle toute la journée", "Le silence, mais tu connais le twist de chaque animé"],
  ["Voyager dans l'univers de ton animé préféré, sans pouvoir rentrer", "Rester ici avec les pouvoirs de ton perso préféré, en secret"],
  ["Un cliffhanger à chaque épisode", "Une fin bouclée mais décevante"],
];

export const DESTIN: Record<string, { label: string; kanji: string; rows: { k: string; v: string[] }[] }> = {
  naruto: { label: "Naruto", kanji: "忍", rows: [
    { k: "Clan", v: ["Uchiwa", "Hyûga", "Uzumaki", "Nara", "Akimichi", "Aburame", "Inuzuka", "Yamanaka", "Senju"] },
    { k: "Pouvoir", v: ["Sharingan", "Byakugan", "Mode Sage", "Invocation de crapauds", "Techniques de foudre", "Manipulation des ombres", "Clonage des ombres"] },
    { k: "Mentor", v: ["Kakashi", "Jiraiya", "Tsunade", "Maito Gaï", "Iruka", "Orochimaru"] },
    { k: "Rival", v: ["Sasuke", "Neji", "Gaara", "Rock Lee", "Kiba"] },
    { k: "Niveau", v: ["Genin", "Chûnin", "Jônin", "Anbu", "Kage"] } ] },
  onepiece: { label: "One Piece", kanji: "海", rows: [
    { k: "Race", v: ["Humain", "Homme-poisson", "Géant", "Mink", "Nain Tontatta"] },
    { k: "Pouvoir", v: ["Fruit Paramecia", "Fruit Logia", "Fruit Zoan", "Haki des Rois", "Maître sabreur"] },
    { k: "Mentor", v: ["Silvers Rayleigh", "Shanks", "Garp", "Barbe Blanche"] },
    { k: "Rival", v: ["Trafalgar Law", "Eustass Kid", "Smoker", "Barbe Noire"] },
    { k: "Niveau", v: ["Novice des mers", "Supernova", "Capitaine de renom", "Commandant", "Empereur"] } ] },
  jjk: { label: "Jujutsu Kaisen", kanji: "呪", rows: [
    { k: "Clan", v: ["Zen'in", "Gojo", "Kamo", "Inumaki", "Sans clan"] },
    { k: "Technique", v: ["Les Six Yeux", "Les Dix Ombres", "Manipulation du sang", "Paroles maudites", "Poupée de paille"] },
    { k: "Mentor", v: ["Satoru Gojo", "Nanami", "Maître Yaga", "Maki Zen'in"] },
    { k: "Rival", v: ["Sukuna", "Geto", "Mahito", "Toji"] },
    { k: "Niveau", v: ["Grade 4", "Grade 3", "Grade 2", "Grade 1", "Grade spécial"] } ] },
};

export const ROLES = ["ton meilleur ami", "ton ennemi juré", "ton âme sœur", "celui qui te sauve la vie", "ton mentor"];

export const PRIME_Q: { q: string; o: [string, number][] }[] = [
  { q: "Un ennemi bien plus fort te bloque la route.", o: [["Tu le contournes en silence", 1], ["Tu élabores un plan", 2], ["Tu fonces, poings en avant", 3]] },
  { q: "Tu trouves un trésor.", o: [["Tu le caches", 1], ["Tu le partages", 2], ["Tu le mets au casino", 3]] },
  { q: "Ton équipage est en danger.", o: [["Tu évalues les risques", 1], ["Tu fais diversion", 2], ["Tu te sacrifies pour eux", 3]] },
  { q: "Ton rêve ?", o: [["Une vie tranquille", 1], ["Un nom connu partout", 2], ["Devenir une légende", 3]] },
  { q: "Ton repas avant le combat ?", o: [["Une salade", 1], ["Un bon ramen", 2], ["Un banquet entier", 3]] },
];

export const SURVIE = [
  "{a} se fait surprendre par {b} et tombe au combat.", "{a} glisse dans le vide pendant que {b} s'enfuit.",
  "{a} tente une technique interdite et s'effondre.", "{a} est trahi·e par {b}.",
  "{a} se dispute avec {b} pour la dernière part de ramen. {b} gagne.", "{a} tombe dans le piège de {b}.",
  "{a} perd son sang-froid face à {b}.", "{a} s'endort en plein combat. {b} en profite.",
];

export const BINGO = [
  "A pleuré devant un animé", "Connaît une choré d'opening", "A fini un animé en une nuit", "A un perso en fond d'écran",
  "A déjà crié « Kamehameha »", "A lu un manga de droite à gauche", "A skip un opening", "A un goodies chez lui",
  "A déjà fait un cosplay", "A abandonné un animé à cause d'un filler", "Sait compter jusqu'à 10 en japonais", "A spoilé un ami",
  "A une waifu ou un husbando", "A mangé des ramen après un épisode", "A rêvé d'avoir un pouvoir", "A regardé en VOSTFR",
  "A un perso préféré qui est mort", "Connaît 3 openings par cœur", "A acheté un manga en double", "A fait la queue pour un événement",
  "A déjà dit « Nani ? ! » au sérieux", "A relu un manga plus de 3 fois", "A des pétales de cerisier en fond d'écran", "A un ami qui ne comprend rien aux animés",
  "A défendu son animé en public", "A un top 10 de persos en tête", "A regardé un film d'animation au cinéma", "A tenté une technique de combat dans le salon",
  "A pleuré à la fin d'une série", "A un animé « coupable » préféré",
];

export const LETTRES = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");
