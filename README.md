# @arenyze/arknights-endfield — Arknights: Endfield API Wrapper

**Arknights: Endfield API sdk** for Node.js — public player profiles by UID (account level, world level, showcased operators with their gear and weapons) and the complete game database: operators, weapons, gear sets, items and AIC factory facilities, in five languages. Full TypeScript support included.

<div align="center">
  <p>
    <a href="https://github.com/Arenyze-Network/arknights-endfield/releases/latest">
      <img src="https://img.shields.io/github/v/release/Arenyze-Network/arknights-endfield?style=for-the-badge" alt="GitHub release (latest SemVer)" />
    </a>
    <a href="https://www.npmjs.com/package/@arenyze/arknights-endfield">
      <img src="https://img.shields.io/npm/v/@arenyze/arknights-endfield.svg?logo=npm&style=for-the-badge" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/@arenyze/arknights-endfield">
      <img src="https://img.shields.io/npm/dt/@arenyze/arknights-endfield.svg?style=for-the-badge" alt="NPM downloads" />
    </a>
  </p>
</div>

## Installation

```sh
npm i @arenyze/arknights-endfield
```

Node.js 18 or newer (the package uses the built-in `fetch`). No runtime dependencies.

## Getting Started

> **You need an Arenyze API key.** Create it in [Workbench → API keys](https://workbench.arenyze.com/#/live/keys). One key works on Arknights: Endfield, THE FINALS and Rainbow Six Siege.

The same data powers **[arknightsendfield.arenyze.com](https://arknightsendfield.arenyze.com/)**. The full endpoint reference is on **[docs.arenyze.com/endfield](https://docs.arenyze.com/endfield)**.

### 1. Initialization

```javascript
const { EndfieldClient } = require('@arenyze/arknights-endfield');

const endfield = new EndfieldClient({
  apiKey: process.env.ARENYZE_API_KEY, // Required
  locale: 'en', // Optional default language: en, zh-Hans, zh-Hant, ja, ko
});

const { account, operators } = await endfield.players.getProfile('4243406084');
console.log(account.nickname, account.level, account.worldLevel, operators.length);
```

ES modules work too:

```javascript
import { EndfieldClient } from '@arenyze/arknights-endfield';
```

Keep the key on your server: anyone with it spends your quota. Don't ship it in a web page or a mobile app.

### 2. TypeScript

Every method and response is typed.

```typescript
import { EndfieldClient, PlayerProfile, OperatorList } from '@arenyze/arknights-endfield';

const endfield = new EndfieldClient({ apiKey: process.env.ARENYZE_API_KEY!, locale: 'ja' });

const profile: PlayerProfile = await endfield.players.getProfile('4243406084');
const sixStars: OperatorList = await endfield.game.getOperators({ rarity: 6 });
```

### 3. Options

| Option | Default | |
|---|---|---|
| `apiKey` | — | Required. |
| `locale` | API default (`en`) | Language of game data: `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`. Any call can override it. |
| `baseUrl` | `https://public-api.arenyze.com/endfield/api` | Point the client at another deployment. |
| `timeout` | `15000` | Milliseconds before a request is aborted. `0` = never. |
| `fetch` | global `fetch` | Your own fetch implementation (proxies, tests). |

## Players

A player is addressed by their **UID** (digits, shown in the in-game profile). A profile is refreshed from the game when it is looked up, at most once a minute per UID; `refresh.refreshAvailableAt` says when the next refresh is possible.

| Method | Endpoint | Returns |
|---|---|---|
| `players.getProfile(uid)` | `/players/{uid}` | Account (nickname, level, world level, region, achievements), showcased operators with level, potential, skills, weapon and gear, profile history. |
| `players.getOperatorBuild(uid, slug)` | `/players/{uid}/operators/{slug}` | One showcased operator in full: stats, skills, weapon, gear set bonuses. |
| `players.searchPlayers(query, { limit })` | `/players/search` | Tracked players whose nickname or UID matches. |

```javascript
const build = await endfield.players.getOperatorBuild('4243406084', 'endministrator-endmin');
const { players } = await endfield.players.searchPlayers('end', { limit: 5 });
```

## Game data

Every method takes an optional `locale`; without it the client's `locale` is used.

| Method | Endpoint | Returns |
|---|---|---|
| `game.getOverview({ locale })` | `/overview` | How many operators, weapons, gear pieces, items, facilities and recipes exist, split by element and rarity. |
| `game.getOperators({ element, profession, weapon, rarity, locale })` | `/operators` | Every operator with rarity, element, class, weapon type and attributes. |
| `game.getOperator(slug, { locale })` | `/operators/{slug}` | Stats by level, skills, talents, potentials, materials. |
| `game.getWeapons({ type, rarity, locale })` | `/weapons` | Every weapon with type, rarity and base stats. |
| `game.getWeapon(slug, { locale })` | `/weapons/{slug}` | Stats by level, passive, upgrade materials. |
| `game.getGear({ slot, rarity, locale })` | `/gear` | Gear sets with their effects and every gear piece. |
| `game.getGearSet(slug, { locale })` | `/gear/sets/{slug}` | One set: 3-piece effect and pieces. |
| `game.getItems({ category, rarity, q, page, locale })` | `/items` | All items with categories and rarity (60 per page). |
| `game.getItem(slug, { locale })` | `/items/{slug}` | Description, sources, recipes that use it. |
| `game.getFactory({ locale })` | `/factory` | AIC factory facilities with tier, power, footprint and ports. |
| `game.getFacility(slug, { locale })` | `/factory/{slug}` | One facility and its recipes. |
| `game.search({ q, type, limit, locale })` | `/search` | Search every kind of game data. `type`: `operator`, `weapon`, `gear`, `item`, `facility`. |

Filter values: `element` is `Physical`, `Heat`, `Cryst`, `Electric` or `Natural`; `profession` is the class (`GUARD`, `CASTER`, `DEFENDER`…); weapon types are `Sword`, `Claymores`, `Lance`, `Pistol`, `Wand`; `rarity` is 1–6.

```javascript
const casters = await endfield.game.getOperators({ profession: 'CASTER', element: 'Heat' });
const arcane = await endfield.game.getOperator('arcane', { locale: 'zh-Hans' });
const results = await endfield.game.search({ q: 'end', type: 'operator', limit: 3 });
```

## Errors

Every failed call rejects with an `ArenyzeApiError`. Invalid arguments (a non-numeric UID, an unknown locale) reject with a `TypeError` before any request is sent.

```javascript
const { ArenyzeApiError } = require('@arenyze/arknights-endfield');

try {
  await endfield.players.getProfile('1234');
} catch (err) {
  if (err instanceof ArenyzeApiError) {
    console.log(err.status, err.code, err.message);
    if (err.code === 'RATE_LIMITED') {
      await new Promise((r) => setTimeout(r, (err.retryAfter ?? 5) * 1000));
    }
  }
}
```

| Property | |
|---|---|
| `status` | HTTP status, or `0` when no answer arrived. |
| `code` | `MISSING_API_KEY`, `INVALID_API_KEY`, `API_KEY_EXPIRED`, `BAD_REQUEST`, `PLAYER_NOT_FOUND`, `NOT_FOUND`, `RATE_LIMITED`, `MONTHLY_QUOTA_EXCEEDED`, `FREE_GAME_QUOTA_EXCEEDED`, `UPSTREAM_UNAVAILABLE`… plus `TIMEOUT` and `NETWORK_ERROR`. |
| `retryAfter` | Seconds to wait, on a `429`. |
| `body` | The parsed error body (e.g. `plan`, `limit`, `used`, `reset_at` on quota errors). |

The full list is on [docs.arenyze.com/errors](https://docs.arenyze.com/errors).

## Rate limits

One monthly quota per key, shared by every Arenyze game, plus a per-minute limit on Endfield. After each call `endfield.rateLimit` holds the latest headers:

```javascript
await endfield.game.getOverview();
console.log(endfield.rateLimit);
// { limit: 120, remaining: 119, quotaLimit: 50000, quotaUsed: 1234 }
```

Plans and limits: [docs.arenyze.com/limits](https://docs.arenyze.com/limits). Game data only changes with game updates, so cache it.

## Webhooks

Instead of polling a profile, let Arenyze call you: add an endpoint in [Workbench → Webhooks](https://workbench.arenyze.com/#/live/webhooks), add the UIDs to watch and the events (`endfield.level_changed`, `endfield.world_level_changed`, `endfield.operators_changed`), and verify each delivery with your endpoint secret.

```javascript
const express = require('express');
const { EndfieldClient, ArenyzeWebhookSignatureError } = require('@arenyze/arknights-endfield');

const endfield = new EndfieldClient({ apiKey: process.env.ARENYZE_API_KEY });
const app = express();

// The body must stay raw: the signature covers the exact bytes.
app.post('/arenyze', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = endfield.webhooks.constructEvent(
      req.body,
      req.get('Arenyze-Signature'),
      process.env.ARENYZE_WEBHOOK_SECRET,
    );
    console.log(event.type, event.data); // e.g. endfield.level_changed { from: 52, to: 53 }
    res.sendStatus(204);
  } catch (err) {
    if (err instanceof ArenyzeWebhookSignatureError) return res.status(400).send('bad signature');
    throw err;
  }
});
```

Deliveries older than 5 minutes are rejected (`{ toleranceSeconds }` changes it). `verifyWebhookSignature(rawBody, header, secret)` is also exported on its own if you only receive webhooks.

### Discord player card

Post a player's card to a Discord channel webhook. The API key is never sent to Discord.

```javascript
const profile = await endfield.players.getProfile('4243406084');
await endfield.webhooks.createDiscordPlayerWebhook(process.env.DISCORD_WEBHOOK_URL, profile);
```

Options: `title`, `description`, `message`, `color`, `avatarUrl`.

## License

MIT
