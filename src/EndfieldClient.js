const pkg = require('../package.json');
const createHttpClient = require('./utils/httpClient');
const { optionalOneOf } = require('./utils/validate');
const Players = require('./resources/Players');
const Game = require('./resources/Game');
const { LOCALES } = require('./utils/locales');
const Webhooks = require('./resources/Webhooks');

const DEFAULT_BASE_URL = 'https://public-api.arenyze.com/endfield/api';

/** @typedef {import('./utils/httpClient').RateLimitInfo} RateLimitInfo */
/** @typedef {import('../types/base-types').Locale} Locale */

/**
 * @typedef {Object} EndfieldClientConfig
 * @property {string} apiKey Your Arenyze API key (Workbench → API keys).
 * @property {Locale} [locale] Default language of game data: `en` (API default), `zh-Hans`, `zh-Hant`, `ja`, `ko`.
 * @property {string} [baseUrl] Override the API host, e.g. for a staging deployment.
 * @property {number} [timeout=15000] Milliseconds before a request is aborted (0 = never).
 * @property {typeof fetch} [fetch] Custom fetch implementation (defaults to the global one).
 */

class EndfieldClient {
  /**
   * @param {EndfieldClientConfig} config - Configuration options
   */
  constructor(config) {
    if (!config || !config.apiKey) {
      throw new Error('Missing required config parameter: apiKey');
    }

    /** @type {string} */
    this.apiKey = config.apiKey;

    /** @type {string} */
    this.baseUrl = String(config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');

    /** @type {Locale | undefined} */
    this.locale = optionalOneOf(config.locale, 'locale', LOCALES);

    /**
     * Rate-limit and quota headers of the last API answer, or `null` before the first call.
     * @type {RateLimitInfo | null}
     */
    this.rateLimit = null;

    this.httpClient = createHttpClient({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      defaultBaseUrl: DEFAULT_BASE_URL,
      userAgent: `arenyze-arknights-endfield/${pkg.version}`,
      timeout: config.timeout,
      fetch: config.fetch,
      onRateLimit: (info) => {
        this.rateLimit = info;
      },
    });

    this.players = new Players(this);
    this.game = new Game(this);
    this.webhooks = new Webhooks(this);
  }
}

EndfieldClient.DEFAULT_BASE_URL = DEFAULT_BASE_URL;

module.exports = EndfieldClient;
