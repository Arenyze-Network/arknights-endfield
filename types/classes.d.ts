import {
  LocaleParams,
  PlayerSearchParams,
  OperatorsParams,
  WeaponsParams,
  GearParams,
  ItemsParams,
  SearchParams,
  DiscordWebhookOptions,
} from './params-interfaces';

import { Locale } from './base-types';

import {
  PlayerProfile,
  OperatorBuild,
  PlayerSearchResult,
  Overview,
  OperatorList,
  OperatorDetail,
  WeaponList,
  WeaponDetail,
  GearList,
  GearSetDetail,
  ItemList,
  ItemDetail,
  FacilityList,
  FacilityDetail,
  SearchResult,
  WebhookEvent,
  DiscordWebhookResult,
  RateLimitInfo,
} from './result-interfaces';

export interface VerifyOptions {
  /** Reject deliveries older (or newer) than this many seconds (default 300, 0 = off). */
  toleranceSeconds?: number;
  /** Current time in seconds, for tests. */
  now?: number;
}

export type RawBody = string | Uint8Array;

export class Players {
  getProfile(uid: string | number): Promise<PlayerProfile>;
  getOperatorBuild(uid: string | number, slug: string): Promise<OperatorBuild>;
  searchPlayers(query: string, params?: PlayerSearchParams): Promise<PlayerSearchResult>;
}

export class Game {
  getOverview(params?: LocaleParams): Promise<Overview>;
  getOperators(params?: OperatorsParams): Promise<OperatorList>;
  getOperator(slug: string, params?: LocaleParams): Promise<OperatorDetail>;
  getWeapons(params?: WeaponsParams): Promise<WeaponList>;
  getWeapon(slug: string, params?: LocaleParams): Promise<WeaponDetail>;
  getGear(params?: GearParams): Promise<GearList>;
  getGearSet(slug: string, params?: LocaleParams): Promise<GearSetDetail>;
  getItems(params?: ItemsParams): Promise<ItemList>;
  getItem(slug: string, params?: LocaleParams): Promise<ItemDetail>;
  getFactory(params?: LocaleParams): Promise<FacilityList>;
  getFacility(slug: string, params?: LocaleParams): Promise<FacilityDetail>;
  search(params: SearchParams): Promise<SearchResult>;
}

export class Webhooks {
  verifySignature(rawBody: RawBody, signatureHeader: string | null | undefined, secret: string, options?: VerifyOptions): boolean;
  constructEvent<T = Record<string, unknown>>(rawBody: RawBody, signatureHeader: string | null | undefined, secret: string, options?: VerifyOptions): WebhookEvent<T>;
  createDiscordPlayerWebhook(webhookUrl: string, profile: PlayerProfile, options?: DiscordWebhookOptions): Promise<DiscordWebhookResult>;
}

export interface EndfieldClientConfig {
  /** Your Arenyze API key (Workbench → API keys). */
  apiKey: string;
  /** Default language of game data (API default `en`). */
  locale?: Locale;
  /** Override the API host (default `https://public-api.arenyze.com/endfield/api`). */
  baseUrl?: string;
  /** Milliseconds before a request is aborted (default 15000, 0 = never). */
  timeout?: number;
  /** Custom fetch implementation (defaults to the global one, Node.js 18+). */
  fetch?: typeof fetch;
}

export class EndfieldClient {
  constructor(config: EndfieldClientConfig);
  static readonly DEFAULT_BASE_URL: string;
  readonly apiKey: string;
  readonly baseUrl: string;
  locale: Locale | undefined;
  /** Rate-limit and quota headers of the last API answer, or `null` before the first call. */
  rateLimit: RateLimitInfo | null;
  players: Players;
  game: Game;
  webhooks: Webhooks;
}

export class ArenyzeApiError extends Error {
  /** HTTP status, or 0 when no answer arrived (timeout, network). */
  status: number;
  /** API error code (`PLAYER_NOT_FOUND`, `RATE_LIMITED`, …) or `TIMEOUT` / `NETWORK_ERROR`. */
  code: string;
  /** Parsed response body. */
  body: any;
  url?: string;
  /** Seconds to wait, sent with `429` answers. */
  retryAfter: number | null;
  response: { status: number; data: any; headers: Record<string, string> };
}

export class ArenyzeWebhookSignatureError extends Error {}

export function verifyWebhookSignature(rawBody: RawBody, signatureHeader: string | null | undefined, secret: string, options?: VerifyOptions): boolean;
