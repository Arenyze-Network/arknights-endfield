// Parameter interfaces for @arenyze/arknights-endfield

import { Element, Locale, Profession, Rarity, SearchType, WeaponType } from './base-types';

export interface LocaleParams {
  /** Overrides the client's default `locale` for this call. */
  locale?: Locale;
}

export interface PlayerSearchParams {
  /** Max results (default 10). */
  limit?: number;
}

export interface OperatorsParams extends LocaleParams {
  element?: Element;
  profession?: Profession;
  /** Weapon type, e.g. `Sword`. */
  weapon?: WeaponType;
  rarity?: Rarity;
}

export interface WeaponsParams extends LocaleParams {
  type?: WeaponType;
  rarity?: Rarity;
}

export interface GearParams extends LocaleParams {
  slot?: string;
  rarity?: Rarity;
}

export interface ItemsParams extends LocaleParams {
  /** Category key from the response, e.g. `material`, `consumable`. */
  category?: string;
  rarity?: Rarity;
  /** Text. */
  q?: string;
  /** Page (60 items per page). */
  page?: number;
}

export interface SearchParams extends LocaleParams {
  q: string;
  type?: SearchType;
  /** Max results. */
  limit?: number;
}

export interface DiscordWebhookOptions {
  /** Embed title (default: the nickname). */
  title?: string;
  /** Embed description. */
  description?: string;
  /** Plain message sent above the embed. */
  message?: string;
  /** Embed colour as a number, e.g. `0xf5c400`. */
  color?: number;
  /** Thumbnail image URL. */
  avatarUrl?: string;
}
