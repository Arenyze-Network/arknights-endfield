const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString, optionalOneOf } = require('../utils/validate');

/** @typedef {import('../../types/base-types').Locale} Locale */
/** @typedef {import('../../types/base-types').SearchType} SearchType */
/** @typedef {import('../../types/params-interfaces').LocaleParams} LocaleParams */
/** @typedef {import('../../types/params-interfaces').OperatorsParams} OperatorsParams */
/** @typedef {import('../../types/params-interfaces').WeaponsParams} WeaponsParams */
/** @typedef {import('../../types/params-interfaces').GearParams} GearParams */
/** @typedef {import('../../types/params-interfaces').ItemsParams} ItemsParams */
/** @typedef {import('../../types/params-interfaces').SearchParams} SearchParams */
/** @typedef {import('../../types/result-interfaces').Overview} Overview */
/** @typedef {import('../../types/result-interfaces').OperatorList} OperatorList */
/** @typedef {import('../../types/result-interfaces').OperatorDetail} OperatorDetail */
/** @typedef {import('../../types/result-interfaces').WeaponList} WeaponList */
/** @typedef {import('../../types/result-interfaces').WeaponDetail} WeaponDetail */
/** @typedef {import('../../types/result-interfaces').GearList} GearList */
/** @typedef {import('../../types/result-interfaces').GearSetDetail} GearSetDetail */
/** @typedef {import('../../types/result-interfaces').ItemList} ItemList */
/** @typedef {import('../../types/result-interfaces').ItemDetail} ItemDetail */
/** @typedef {import('../../types/result-interfaces').FacilityList} FacilityList */
/** @typedef {import('../../types/result-interfaces').FacilityDetail} FacilityDetail */
/** @typedef {import('../../types/result-interfaces').SearchResult} SearchResult */

const { LOCALES } = require('../utils/locales');

/** @type {readonly SearchType[]} */
const SEARCH_TYPES = ['operator', 'weapon', 'gear', 'item', 'facility'];

/**
 * The game database: operators, weapons, gear sets, items and AIC factory
 * facilities. Every method takes an optional `locale`; when it is left out
 * the client's default `locale` is used.
 */
class Game {
  /**
   * @param {import('./Resource').ClientLike & { locale?: Locale }} client - The main client instance
   */
  constructor(client) {
    this.client = client;
    this._r = new Resource(client);
  }

  /**
   * @param {Locale | undefined} locale
   * @returns {Locale | undefined}
   */
  _locale(locale) {
    return optionalOneOf(locale ?? this.client.locale, 'locale', LOCALES);
  }

  /**
   * How many operators, weapons, gear pieces, items, facilities and recipes
   * the database holds, with the split by element and class.
   * @param {LocaleParams} [params]
   * @returns {Promise<Overview>}
   */
  async getOverview(params = {}) {
    return this._r._get('/overview', { locale: this._locale(params.locale) });
  }

  /**
   * Every operator with rarity, element, class, weapon type and attributes.
   * @param {OperatorsParams} [params]
   * @returns {Promise<OperatorList>}
   */
  async getOperators(params = {}) {
    return this._r._get('/operators', {
      locale: this._locale(params.locale),
      element: params.element,
      profession: params.profession,
      weapon: params.weapon,
      rarity: params.rarity,
    });
  }

  /**
   * Full operator page: stats by level, skills, talents, potentials, materials.
   * @param {string} slug Operator slug, e.g. `arcane`.
   * @param {LocaleParams} [params]
   * @returns {Promise<OperatorDetail>}
   */
  async getOperator(slug, params = {}) {
    return this._r._get(`/operators/${segment(requireString(slug, 'slug'))}`, { locale: this._locale(params.locale) });
  }

  /**
   * Every weapon with type, rarity and base stats.
   * @param {WeaponsParams} [params]
   * @returns {Promise<WeaponList>}
   */
  async getWeapons(params = {}) {
    return this._r._get('/weapons', {
      locale: this._locale(params.locale),
      type: params.type,
      rarity: params.rarity,
    });
  }

  /**
   * One weapon: stats by level, passive, upgrade materials.
   * @param {string} slug Weapon slug, e.g. `amaranthine-tassel`.
   * @param {LocaleParams} [params]
   * @returns {Promise<WeaponDetail>}
   */
  async getWeapon(slug, params = {}) {
    return this._r._get(`/weapons/${segment(requireString(slug, 'slug'))}`, { locale: this._locale(params.locale) });
  }

  /**
   * Gear sets with their effects and every gear piece.
   * @param {GearParams} [params]
   * @returns {Promise<GearList>}
   */
  async getGear(params = {}) {
    return this._r._get('/gear', {
      locale: this._locale(params.locale),
      slot: params.slot,
      rarity: params.rarity,
    });
  }

  /**
   * One gear set: 3-piece effect and pieces.
   * @param {string} slug Set slug, e.g. `aburrey-s-legacy`.
   * @param {LocaleParams} [params]
   * @returns {Promise<GearSetDetail>}
   */
  async getGearSet(slug, params = {}) {
    return this._r._get(`/gear/sets/${segment(requireString(slug, 'slug'))}`, { locale: this._locale(params.locale) });
  }

  /**
   * All items with categories and rarity, 60 per page.
   * @param {ItemsParams} [params]
   * @returns {Promise<ItemList>}
   */
  async getItems(params = {}) {
    return this._r._get('/items', {
      locale: this._locale(params.locale),
      category: params.category,
      rarity: params.rarity,
      q: params.q,
      page: params.page,
    });
  }

  /**
   * One item: description, sources, recipes that use it.
   * @param {string} slug Item slug, e.g. `oroberyl`.
   * @param {LocaleParams} [params]
   * @returns {Promise<ItemDetail>}
   */
  async getItem(slug, params = {}) {
    return this._r._get(`/items/${segment(requireString(slug, 'slug'))}`, { locale: this._locale(params.locale) });
  }

  /**
   * AIC factory facilities with tier, power, footprint and ports.
   * @param {LocaleParams} [params]
   * @returns {Promise<FacilityList>}
   */
  async getFactory(params = {}) {
    return this._r._get('/factory', { locale: this._locale(params.locale) });
  }

  /**
   * One facility and its recipes.
   * @param {string} slug Facility slug, e.g. `gearing-unit`.
   * @param {LocaleParams} [params]
   * @returns {Promise<FacilityDetail>}
   */
  async getFacility(slug, params = {}) {
    return this._r._get(`/factory/${segment(requireString(slug, 'slug'))}`, { locale: this._locale(params.locale) });
  }

  /**
   * Search across every kind of game data.
   * @param {SearchParams} params
   * @returns {Promise<SearchResult>}
   */
  async search(params) {
    return this._r._get('/search', {
      locale: this._locale(params?.locale),
      q: requireString(params?.q, 'q'),
      type: optionalOneOf(params.type, 'type', SEARCH_TYPES),
      limit: params.limit,
    });
  }
}

module.exports = Game;
