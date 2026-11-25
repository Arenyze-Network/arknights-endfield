// Result interfaces for @arenyze/arknights-endfield
// Shapes follow the live API (docs.arenyze.com/endfield). Large nested blocks
// are typed loosely so new fields never break your build.

import { ImageAsset } from './base-types';

type Loose = Record<string, unknown>;

// ── Players ──────────────────────────────────────────────────────────────

export interface PlayerAccount {
  uid: string;
  region: string;
  nickname: string;
  shortId: string;
  signature: string;
  /** Authority level. */
  level: number;
  worldLevel: number;
  avatarId: number;
  avatarFrameId: number;
  namecardId: number;
  mainMission: string;
  createdInGame: string;
  stats: { docNum?: number; charNum?: number; weaponNum?: number; [key: string]: unknown };
  regions: { id: string; level: number }[];
  achievements: { list: { level: number; plated: boolean; medalId: number }[]; display: { slot: number; medalId: number }[] };
  showcaseCount: number;
  visibility: string;
  firstSeenAt: string;
  lastFetchedAt: string;
  lastChangedAt: string;
  nextRefreshAt: string;
}

export interface PlayerOperator {
  id: string;
  slug: string;
  name: string;
  rarity: number;
  element: string;
  profession: string;
  weaponType: string;
  level: number;
  potential: number;
  breakNode: string;
  inShowcase: boolean;
  /** Weapon, gear and skills; present for showcased operators. */
  build: { gear?: Loose[]; skills?: Loose[]; weapon?: Loose; [key: string]: unknown } | null;
  buildSeenAt: string | null;
  firstDetectedAt: string;
  lastSeenAt: string;
}

export interface ProfileChange {
  at: string;
  subject: string;
  subjectId: string;
  field: string;
  old: unknown;
  new: unknown;
}

export interface PlayerProfile {
  account: PlayerAccount;
  operators: PlayerOperator[];
  history: ProfileChange[];
  /** Display names keyed by game id. */
  names: { operators: Record<string, string>; weapons: Record<string, string>; gear: Record<string, string> };
  refresh: { refreshed: boolean; refreshAvailableAt: string };
}

export interface OperatorBuild {
  [key: string]: unknown;
}

export interface PlayerSearchResult {
  players: { uid: string; nickname: string; level: number; worldLevel: number; region: string; avatar: string | null; url: string }[];
}

// ── Game data ────────────────────────────────────────────────────────────

export interface OperatorSummary {
  id: string;
  slug: string;
  url: string;
  name: string;
  rarity: number;
  element: string;
  profession: string;
  weaponType: string;
  mainAttr: string;
  subAttr: string;
  icon: ImageAsset | null;
  art: ImageAsset | null;
}

export interface Overview {
  counts: { operators: number; weapons: number; gear: number; sets: number; items: number; facilities: number; recipes: number; skills: number };
  players: number;
  elements: { element: string; count: number }[];
  rarities: { rarity: number; count: number }[];
  operators: OperatorSummary[];
  lastSync: string;
}

export interface OperatorList {
  total: number;
  items: OperatorSummary[];
  facets: { element: string[]; profession: string[]; weapon: string[]; rarity: number[] };
}

export interface OperatorDetail extends OperatorSummary {
  numId: number;
  canonicalUrl: string;
  engName: string | null;
  department: string | null;
  cv: Loose | null;
  battleTags: string[] | null;
  baseStats: { hp: number; atk: number; agi: number | null; int: number | null; str: number | null; will: number | null; level: number; stage: number | null }[];
  attributeNodes: Record<string, Loose>;
  potentials: { desc: string; name: string; level: number }[];
  profile: Loose | null;
  defaultWeapon: Loose | null;
  potentialItem: Loose | null;
  [key: string]: unknown;
}

export interface WeaponSummary {
  id: string;
  slug: string;
  url: string;
  name: string;
  rarity: number;
  type: string;
  icon: ImageAsset | null;
  skills: string[];
}

export interface WeaponList {
  total: number;
  types: string[];
  items: WeaponSummary[];
}

export interface WeaponDetail extends WeaponSummary {
  [key: string]: unknown;
}

export interface GearSet {
  id: string;
  slug: string;
  url: string;
  name: string;
  effect: string;
  icon: ImageAsset | null;
  pieces: number;
}

export interface GearPiece {
  id: string;
  slug: string;
  url: string;
  name: string;
  rarity: number;
  slot: string;
  setId: string | null;
  minLevel: number;
  icon: ImageAsset | null;
}

export interface GearList {
  sets: GearSet[];
  total: number;
  items: GearPiece[];
}

export interface GearSetDetail extends GearSet {
  [key: string]: unknown;
}

export interface ItemSummary {
  id: string;
  slug: string;
  url: string;
  name: string;
  rarity: number;
  category: string;
  icon: ImageAsset | null;
}

export interface ItemList {
  total: number;
  page: number;
  pages: number;
  categories: { key: string; count: number }[];
  items: ItemSummary[];
}

export interface ItemDetail extends ItemSummary {
  [key: string]: unknown;
}

export interface FacilitySummary {
  id: string;
  slug: string;
  url: string;
  name: string;
  tier: number;
  power: number;
  footprint: Loose;
  ports: Loose;
  recipes: number;
  icon: ImageAsset | null;
}

export interface FacilityList {
  total: number;
  items: FacilitySummary[];
}

export interface FacilityDetail {
  [key: string]: unknown;
}

export interface SearchResult {
  q: string;
  results: { type: string; typeLabel: string; id: string; name: string; url: string; subtitle: string; icon: ImageAsset | null }[];
}

// ── Webhooks ─────────────────────────────────────────────────────────────

export type EndfieldEventType =
  | 'endfield.level_changed'
  | 'endfield.world_level_changed'
  | 'endfield.operators_changed'
  | 'arenyze.test';

/** A signed delivery from Arenyze webhooks (docs.arenyze.com/webhooks). */
export interface WebhookEvent<T = Loose> {
  id: string;
  type: EndfieldEventType | string;
  game: string;
  player: string | null;
  occurred_at: string;
  data: T;
  text: string;
}

export interface DiscordWebhookResult {
  success: true;
  messageId?: string;
  sentAt: string;
}

export interface RateLimitInfo {
  /** Requests allowed per minute on this game. */
  limit: number | null;
  /** Requests left in the current minute. */
  remaining: number | null;
  /** Monthly calls of the plan (all games). */
  quotaLimit: number | null;
  /** Calls used this month (all games). */
  quotaUsed: number | null;
}
