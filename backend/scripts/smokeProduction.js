const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

dotenv.config({ path: process.env.SMOKE_ENV_FILE || path.join(__dirname, '../../deploy/.env') });
dotenv.config({
  path: path.join(__dirname, '../.env'),
  override: process.env.SMOKE_ENV_FILE ? false : process.env.API_BASE_URL?.includes('localhost')
});

const User = require('../models/User');
const UserInventory = require('../models/UserInventory');
const CritterSpecies = require('../models/CritterSpecies');
const PetItem = require('../models/PetItem');
const Loan = require('../models/Loan');
const InsurancePolicy = require('../models/InsurancePolicy');
const Stake = require('../models/Stake');
const Guild = require('../models/Guild');
const Auction = require('../models/Auction');
const UserCard = require('../models/UserCard');

const API_BASE = (process.env.API_BASE_URL || process.env.SMOKE_API_BASE_URL || 'https://rps.elfeel.me').replace(/\/$/, '');
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const runId = `smoke_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

const state = {
  userId: null,
  createdSpecies: [],
  createdPetItems: [],
  marketSymbol: null
};

function requireEnv(name, value) {
  if (!value) throw new Error(`Missing ${name}`);
}

async function request(method, route, token, body, expected = [200]) {
  const res = await fetch(`${API_BASE}${route}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!expected.includes(res.status)) {
    throw new Error(`${method} ${route} expected ${expected.join('/')} got ${res.status}: ${text.slice(0, 250)}`);
  }
  return { status: res.status, json };
}

async function step(name, fn) {
  const started = Date.now();
  try {
    const result = await fn();
    console.log(`PASS ${name} ${Date.now() - started}ms`);
    return result;
  } catch (err) {
    console.error(`FAIL ${name}: ${err.message}`);
    throw err;
  }
}

async function ensureFixtures() {
  const species = await CritterSpecies.create({
    species: runId,
    description: 'Smoke test species',
    baseRarity: 'Common',
    foodPreferences: [],
    playPreferences: [],
    cosmeticsAvailable: []
  });
  state.createdSpecies.push(species._id);

  const petItem = await PetItem.create({
    _id: `${runId}_food`,
    name: 'Smoke Treat',
    type: 'food',
    price: 5,
    currency: 'petCoins',
    effect: { affectionBonus: 1, expBonus: 1 }
  });
  state.createdPetItems.push(petItem._id);

}

async function createSmokeUser() {
  const password = crypto.randomBytes(12).toString('hex');
  const user = await User.create({
    username: runId,
    email: `${runId}@example.invalid`,
    password: await bcrypt.hash(password, 10),
    emailVerified: true,
    status: 'active',
    balance: 1000000,
    publicProfileCreated: true
  });
  state.userId = user._id;

  await UserInventory.create({
    userId: user._id,
    resources: {
      coins: 10000,
      food: {},
      toys: {}
    },
    shards: 0
  });

  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30m' });
}

async function cleanup() {
  await Promise.allSettled([
    state.userId ? User.deleteOne({ _id: state.userId }) : null,
    state.userId ? UserInventory.deleteOne({ userId: state.userId }) : null,
    state.userId ? Loan.deleteMany({ user: state.userId }) : null,
    state.userId ? InsurancePolicy.deleteMany({ user: state.userId }) : null,
    state.userId ? Stake.deleteMany({ user: state.userId }) : null,
    state.userId ? UserCard.deleteMany({ user: state.userId }) : null,
    Guild.deleteMany({ name: runId }),
    Auction.deleteMany({ title: runId }),
    CritterSpecies.deleteMany({ _id: { $in: state.createdSpecies } }),
    PetItem.deleteMany({ _id: { $in: state.createdPetItems } })
  ]);
}

async function main() {
  requireEnv('MONGO_URI', MONGO_URI);
  requireEnv('JWT_SECRET', JWT_SECRET);

  await mongoose.connect(MONGO_URI);
  await ensureFixtures();
  const token = await createSmokeUser();

  try {
    await step('health', () => request('GET', '/api/health', null, null));
    await step('user stats', () => request('GET', '/api/user/stats', token, null));
    await step('game progress', () => request('GET', '/api/games/progress', token, null));

    await step('casino', () => request('POST', '/api/games/casino', token, { betAmount: 10 }));
    await step('roulette', () => request('POST', '/api/games/roulette', token, { betAmount: 10, color: 'red' }));
    await step('coin flip', () => request('POST', '/api/games/coin-flip', token, { betAmount: 10, guess: 'heads' }));
    await step('slots', () => request('POST', '/api/games/slots', token, { betAmount: 10 }));
    await step('crash', () => request('POST', '/api/games/crash', token, { betAmount: 10, cashoutMultiplier: 1.1 }));
    await step('higher/lower', () => request('POST', '/api/games/higher-lower', token, { betAmount: 10, guess: 'higher' }));
    await step('dice duel', () => request('POST', '/api/games/dice-duel', token, { betAmount: 10, target: 7 }));
    await step('bot race', () => request('POST', '/api/games/bot-race', token, { betAmount: 10, racer: 'ByteJackal' }));
    await step('blackjack start', () => request('POST', '/api/games/blackjack/start', token, { betAmount: 10 }, [200, 400]));
    await step('blackjack stand', () => request('POST', '/api/games/blackjack/stand', token, {}, [200, 400]));

    await step('rps bots', () => request('GET', '/api/games/rps/bots', token, null));
    await step('rps bot match', () => request('POST', '/api/games/rps', token, {
      opponentUsername: 'ByteJackal',
      buyIn: 10,
      userChoice: 'rock'
    }));

    await step('click frenzy', () => request('POST', '/api/games/click-frenzy', token, { clicks: 1, emoji: '🐭' }));
    const puzzles = await step('puzzle rush public payload', () => request('GET', '/api/games/puzzle-rush', token, null));
    if (JSON.stringify(puzzles.json).includes('solution')) throw new Error('Puzzle Rush response leaked solution data');
    const memory = puzzles.json?.puzzles?.find(puzzle => puzzle.type === 'memory');
    if (memory) {
      await step('puzzle rush memory submit', () => request('POST', '/api/games/puzzle-rush', token, {
        puzzleId: memory.id,
        answer: { completed: true }
      }));
    }

    const mine = await step('minefield start', () => request('POST', '/api/games/minefield/start', token, {
      betAmount: 10,
      rows: 3,
      cols: 3,
      mines: 2
    }));
    await step('minefield rejects invalid cell', () => request('POST', '/api/games/minefield/reveal', token, {
      sessionId: mine.json.sessionId,
      cellIndex: 999
    }, [400]));

    const market = await step('market overview', () => request('GET', '/api/markets', token, null));
    const marketSymbol = market.json?.assets?.[0]?.symbol;
    if (!marketSymbol) throw new Error('No active market assets returned');
    state.marketSymbol = marketSymbol;
    await step('market buy', () => request('POST', '/api/markets/buy', token, { symbol: marketSymbol, quantity: 1 }));
    await step('market sell', () => request('POST', '/api/markets/sell', token, { symbol: marketSymbol, quantity: 1 }));

    await step('economy overview', () => request('GET', '/api/economy', token, null));
    await step('card pack', () => request('POST', '/api/economy/cards/open-pack', token, { pack: 'standard' }));
    const loan = await step('loan borrow', () => request('POST', '/api/economy/loans', token, { amount: 100 }, [200, 201]));
    await step('loan repay', () => request('POST', `/api/economy/loans/${loan.json.loan._id}/repay`, token, {}));
    await step('insurance buy', () => request('POST', '/api/economy/insurance', token, { type: 'casino' }, [200, 201]));
    await step('stake create', () => request('POST', '/api/economy/staking', token, { amount: 100, days: 1 }, [200, 201]));
    await step('guild create', () => request('POST', '/api/economy/guilds', token, { name: runId, tag: runId.slice(-5).toUpperCase() }, [200, 201]));
    await step('guild contribute', () => request('POST', '/api/economy/guilds/contribute', token, { amount: 100 }));
    await step('raid attack', () => request('POST', '/api/economy/raid/attack', token, { amount: 100 }));
    await step('auction create', () => request('POST', '/api/economy/auctions', token, {
      title: runId,
      kind: 'boost',
      startingBid: 100,
      durationHours: 1
    }, [200, 201]));

    await step('gacha rejects negative count', () => request('POST', '/api/gacha/spin', token, {
      pool: 'basic',
      count: -5
    }, [400]));
    await step('pet shop rejects negative qty', () => request('POST', '/api/shop/buy', token, {
      itemId: `${runId}_food`,
      qty: -5
    }, [400]));
    await step('pet shop buy', () => request('POST', '/api/shop/buy', token, {
      itemId: `${runId}_food`,
      qty: 1
    }));

    console.log('Smoke test completed successfully.');
  } finally {
    await cleanup();
    await mongoose.disconnect();
  }
}

main().catch(async err => {
  console.error(err.stack || err.message);
  await cleanup().catch(() => {});
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
