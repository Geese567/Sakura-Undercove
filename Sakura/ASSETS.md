# Ajouter des fichiers aux jeux

Même logique que `characters.json` : un dossier dans `public/assets/`, un fichier `.json` du même nom qui liste les noms de fichiers.
Le nom du fichier devient la réponse : `death-note.mp3` donne « Death Note ». Pour plusieurs fichiers de la même réponse, ajoute `__` : `death-note__op1.mp3`, `death-note__ed2.mp3`.

| Jeu | Dossier | Fichier liste | Contenu |
|---|---|---|---|
| Zoom et ombre | `assets/characters/` | `characters.json` | les images de personnages déjà utilisées par Undercover (nom du fichier = nom du perso) |
| Blind Test | `assets/blindtest/` | `blindtest.json` (clé `tracks`) | extraits mp3 ou m4a, réponse = animé |
| Reconnais la voix | `assets/voices/` | `voices.json` (clé `voices`) | répliques ou cris mp3, réponse = personnage |
| Une seule case | `assets/manga/` | `manga.json` (clé `panels`) | images jpg, png ou webp, réponse = manga |
| Chante la suite | `assets/karaoke/` | `karaoke.json` (clé `songs`) | musiques mp3, réponse = titre |

## Forme simple
```json
{ "tracks": ["death-note.mp3", "bleach.mp3"] }
```

## Forme détaillée (facultative)
```json
{ "tracks": [
  { "file": "op1.mp3", "answer": "Attack on Titan", "start": 12, "options": ["Attack on Titan", "Vinland Saga", "Fire Force", "Claymore"] }
] }
```
- `answer` : la bonne réponse si le nom du fichier ne suffit pas.
- `start` : seconde de début de l'extrait (Blind Test, Voix) ou du début de la musique (Chante la suite).
- `cut` (Chante la suite uniquement) : seconde où la musique s'arrête.
- `options` : les 4 propositions exactes. Sans cela, les mauvaises réponses sont tirées des autres fichiers et de la liste des animés.

Tant qu'un dossier est vide, le jeu affiche BIENTÔT sur sa carte. Dès qu'un fichier est listé, le jeu est jouable.
