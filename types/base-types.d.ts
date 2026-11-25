// Base types for @arenyze/arknights-endfield

/** Language of names and descriptions in game data (`en` by default). */
export type Locale = 'en' | 'zh-Hans' | 'zh-Hant' | 'ja' | 'ko';

export type Element = 'Physical' | 'Heat' | 'Cryst' | 'Electric' | 'Natural';

/** Operator class, e.g. `GUARD`, `CASTER`, `DEFENDER`. */
export type Profession = 'GUARD' | 'CASTER' | 'DEFENDER' | 'VANGUARD' | 'STRIKER' | 'SUPPORTER' | (string & {});

export type WeaponType = 'Sword' | 'Claymores' | 'Lance' | 'Pistol' | 'Wand' | (string & {});

/** Rarity from 1 to 6. */
export type Rarity = 1 | 2 | 3 | 4 | 5 | 6;

export type SearchType = 'operator' | 'weapon' | 'gear' | 'item' | 'facility';

export interface ImageAsset {
  url: string;
  width?: number;
  height?: number;
}
