/* Meme logique que characters.json : public/assets/<dossier>/<dossier>.json liste les noms de fichiers.
   Chaque entree est soit un nom de fichier ("death-note.mp3"), soit un objet
   { "file": "...", "answer": "...", "start": 12, "cut": 30, "options": ["...", "..."] }.
   Sans "answer", la reponse est deduite du nom du fichier : death-note.mp3 => "Death Note"
   ("death-note__op1.mp3" => "Death Note" aussi, tout ce qui suit "__" est ignore). */
export interface MediaItem { file: string; url: string; answer: string; start?: number; cut?: number; options?: string[] }

export const titleFromFile = (f: string) =>
  f.replace(/^.*\//, "").replace(/\.[^.]+$/, "").split("__")[0].replace(/[-_]+/g, " ").trim().replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase());

export async function loadManifest(folder: string): Promise<MediaItem[]> {
  try {
    const res = await fetch(`assets/${folder}/${folder}.json`);
    if (!res.ok) return [];
    const j = await res.json();
    const arr: any[] = Array.isArray(j) ? j : ((Object.values(j).find(Array.isArray) as any[]) || []);
    return arr
      .map((e) => (typeof e === "string"
        ? { file: e, url: `assets/${folder}/${e}`, answer: titleFromFile(e) }
        : { file: e.file, url: `assets/${folder}/${e.file}`, answer: e.answer || titleFromFile(e.file || ""), start: e.start, cut: e.cut, options: e.options }))
      .filter((x) => x.file);
  } catch { return []; }
}
