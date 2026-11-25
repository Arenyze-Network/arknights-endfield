const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { EndfieldClient, ArenyzeApiError, ArenyzeWebhookSignatureError, verifyWebhookSignature } = require('../src');

/**
 * A fetch stand-in that records every call and answers from `reply`.
 * @param {(url: string, init: any) => { status?: number, body?: any, headers?: Record<string, string> }} [reply]
 */
function mockFetch(reply = () => ({ body: { ok: true } })) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const r = reply(url, init);
    return new Response(r.body === undefined ? null : JSON.stringify(r.body), {
      status: r.status ?? 200,
      headers: { 'content-type': 'application/json', ...(r.headers || {}) },
    });
  };
  fn.calls = calls;
  return fn;
}

const BASE = 'https://public-api.arenyze.com/endfield/api';

test('requires an apiKey and a valid locale', () => {
  assert.throws(() => new EndfieldClient({}), /apiKey/);
  assert.throws(() => new EndfieldClient({ apiKey: 'k', locale: 'fr' }), /locale/);
});

test('sends the api-key header', async () => {
  const fetch = mockFetch(() => ({ body: { account: { uid: '4243406084' } } }));
  const data = await new EndfieldClient({ apiKey: 'test-key', fetch }).players.getProfile(4243406084);
  assert.equal(data.account.uid, '4243406084');
  assert.equal(fetch.calls[0].url, `${BASE}/players/4243406084`);
  assert.equal(fetch.calls[0].init.headers['api-key'], 'test-key');
  assert.match(fetch.calls[0].init.headers['User-Agent'], /^arenyze-arknights-endfield\//);
});

test('every documented endpoint maps to the right path', async () => {
  const fetch = mockFetch();
  const e = new EndfieldClient({ apiKey: 'k', fetch });
  const cases = [
    [() => e.players.getOperatorBuild('4243406084', 'endministrator-endmin'), '/players/4243406084/operators/endministrator-endmin'],
    [() => e.players.searchPlayers('end', { limit: 3 }), '/players/search?q=end&limit=3'],
    [() => e.game.getOverview(), '/overview'],
    [() => e.game.getOperators({ rarity: 6, element: 'Heat', profession: 'CASTER', weapon: 'Wand' }), '/operators?element=Heat&profession=CASTER&weapon=Wand&rarity=6'],
    [() => e.game.getOperator('arcane'), '/operators/arcane'],
    [() => e.game.getWeapons({ type: 'Sword' }), '/weapons?type=Sword'],
    [() => e.game.getWeapon('amaranthine-tassel'), '/weapons/amaranthine-tassel'],
    [() => e.game.getGear({ rarity: 5 }), '/gear?rarity=5'],
    [() => e.game.getGearSet('aburrey-s-legacy'), '/gear/sets/aburrey-s-legacy'],
    [() => e.game.getItems({ category: 'consumable', page: 2 }), '/items?category=consumable&page=2'],
    [() => e.game.getItem('oroberyl'), '/items/oroberyl'],
    [() => e.game.getFactory(), '/factory'],
    [() => e.game.getFacility('gearing-unit'), '/factory/gearing-unit'],
    [() => e.game.search({ q: 'end', type: 'operator', limit: 3 }), '/search?q=end&type=operator&limit=3'],
  ];
  for (const [call, path] of cases) {
    await call();
    assert.equal(fetch.calls.at(-1).url, BASE + path);
  }
});

test('the client locale is the default, a per-call locale wins', async () => {
  const fetch = mockFetch();
  const e = new EndfieldClient({ apiKey: 'k', fetch, locale: 'ja' });
  await e.game.getOperator('arcane');
  assert.equal(fetch.calls.at(-1).url, `${BASE}/operators/arcane?locale=ja`);
  await e.game.getOperator('arcane', { locale: 'ko' });
  assert.equal(fetch.calls.at(-1).url, `${BASE}/operators/arcane?locale=ko`);
  await e.game.search({ q: 'x' });
  assert.equal(fetch.calls.at(-1).url, `${BASE}/search?locale=ja&q=x`);
});

test('validates parameters before calling the API (as rejected promises)', async () => {
  const fetch = mockFetch();
  const e = new EndfieldClient({ apiKey: 'k', fetch });
  await assert.rejects(e.players.getProfile('Endministrator'), /uid/);
  await assert.rejects(e.players.getProfile(''), /uid/);
  await assert.rejects(e.game.getOperator(''), /slug/);
  await assert.rejects(e.game.getOverview({ locale: 'fr' }), /locale/);
  await assert.rejects(e.game.search({ q: 'x', type: 'npc' }), /type/);
  await assert.rejects(e.game.search(), /q/);
  assert.equal(fetch.calls.length, 0);
});

test('API errors become ArenyzeApiError and rate-limit headers are kept', async () => {
  const fetch = mockFetch(() => ({
    status: 404,
    body: { error: 'PLAYER_NOT_FOUND', message: 'No player with that UID.' },
    headers: { 'x-ratelimit-limit': '120', 'x-ratelimit-remaining': '119', 'x-quota-limit': '50000', 'x-quota-used': '42' },
  }));
  const e = new EndfieldClient({ apiKey: 'k', fetch });
  await assert.rejects(e.players.getProfile('1'), (err) => {
    assert.ok(err instanceof ArenyzeApiError);
    assert.equal(err.status, 404);
    assert.equal(err.code, 'PLAYER_NOT_FOUND');
    assert.equal(err.retryAfter, null);
    return true;
  });
  assert.deepEqual(e.rateLimit, { limit: 120, remaining: 119, quotaLimit: 50000, quotaUsed: 42 });
});

test('webhook signatures are verified as documented', () => {
  const secret = 'whsec_test';
  const body = JSON.stringify({ id: 'evt_2', type: 'endfield.level_changed', data: { from: 52, to: 53 } });
  const t = Math.floor(Date.now() / 1000);
  const v1 = crypto.createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  const header = `t=${t},v1=${v1}`;

  const e = new EndfieldClient({ apiKey: 'k', fetch: mockFetch() });
  assert.equal(verifyWebhookSignature(body, header, secret), true);
  assert.equal(e.webhooks.verifySignature(new TextEncoder().encode(body), header, secret), true);
  assert.equal(e.webhooks.verifySignature(body, header, 'whsec_other'), false);
  assert.equal(e.webhooks.verifySignature(body, header, secret, { now: t - 400 }), false);
  assert.equal(e.webhooks.constructEvent(body, header, secret).data.to, 53);
  assert.throws(() => e.webhooks.constructEvent(body, '', secret), ArenyzeWebhookSignatureError);
});

test('Discord player card goes to Discord without the API key', async () => {
  const fetch = mockFetch(() => ({ status: 204 }));
  const url = 'https://discord.com/api/webhooks/123/abc';
  const res = await new EndfieldClient({ apiKey: 'k', fetch }).webhooks.createDiscordPlayerWebhook(url, {
    account: { uid: '4243406084', nickname: 'Endministrator', region: 'ASIA', level: 53, worldLevel: 6, stats: { charNum: 22, weaponNum: 34 } },
    operators: [{ name: 'Endministrator', level: 80, potential: 1, inShowcase: true }],
  });
  assert.equal(res.success, true);
  const call = fetch.calls[0];
  assert.equal(call.init.headers['api-key'], undefined);
  const embed = JSON.parse(call.init.body).embeds[0];
  assert.equal(embed.url, 'https://arknightsendfield.arenyze.com/player/4243406084');
  assert.match(embed.fields[0].value, /World level:\*\* 6/);
  assert.match(embed.fields[2].value, /Endministrator/);
});
