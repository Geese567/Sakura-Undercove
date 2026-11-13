export type Role = 'civil' | 'undercover' | 'mrwhite';
export type GameState = 'home' | 'setup' | 'dist' | 'game' | 'vote';
export type Theme = 'sakura' | 'shonen';

export interface Character {
  id?: string;
  name: string;
  anime: string;
  style: string;
}

export interface Category {
  name: string;
  color: string;
  chars: Character[];
}

export interface Player {
  id: number;
  name: string;
  role: Role;
  char: Character | null;
  photoUrl?: string;
  alive: boolean;
}

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}
