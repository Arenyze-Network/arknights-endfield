const Resource = require('./Resource');
const { segment } = require('../utils/buildUrl');
const { requireString } = require('../utils/validate');

/** @typedef {import('../../types/params-interfaces').PlayerSearchParams} PlayerSearchParams */
/** @typedef {import('../../types/result-interfaces').PlayerProfile} PlayerProfile */
/** @typedef {import('../../types/result-interfaces').OperatorBuild} OperatorBuild */
/** @typedef {import('../../types/result-interfaces').PlayerSearchResult} PlayerSearchResult */

/**
 * @param {unknown} value
 * @returns {string}
 */
function requireUid(value) {
  const uid = requireString(value, 'uid');
  if (!/^\d+$/.test(uid)) {
    throw new TypeError('Invalid uid. The Endfield UID is made of digits only (in-game profile)');
  }
  return uid;
}

/**
 * Public player profiles, addressed by Endfield UID. A profile is refreshed
 * from the game when it is looked up (at most once a minute per UID).
 */
class Players {
  /**
   * @param {import('./Resource').ClientLike} client - The main client instance
   */
  constructor(client) {
    this._r = new Resource(client);
  }

  /**
   * Account (nickname, level, world level, region, achievements), the
   * showcased operators with level, potential, skills, weapon and gear, the
   * profile history and the next refresh time.
   * @param {string | number} uid Endfield UID, e.g. `4243406084`.
   * @returns {Promise<PlayerProfile>}
   */
  async getProfile(uid) {
    return this._r._get(`/players/${requireUid(uid)}`);
  }

  /**
   * One showcased operator of a player in full detail: stats, skills, weapon, gear set bonuses.
   * @param {string | number} uid
   * @param {string} slug Operator slug, e.g. `endministrator-endmin`.
   * @returns {Promise<OperatorBuild>}
   */
  async getOperatorBuild(uid, slug) {
    return this._r._get(`/players/${requireUid(uid)}/operators/${segment(requireString(slug, 'slug'))}`);
  }

  /**
   * Players already tracked whose nickname or UID matches.
   * @param {string} query Nickname or UID prefix.
   * @param {PlayerSearchParams} [params]
   * @returns {Promise<PlayerSearchResult>}
   */
  async searchPlayers(query, params = {}) {
    return this._r._get('/players/search', { q: requireString(query, 'query'), limit: params.limit });
  }
}

module.exports = Players;
