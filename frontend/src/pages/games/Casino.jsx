import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE } from '../../api';

export default function Casino() {
  const [game, setGame] = useState('blackjack');

  return (
    <div className="min-h-screen text-white main-content">
      <h1 className="text-5xl font-extrabold text-center mb-8">🃏 Casino</h1>
      <div className="flex justify-center space-x-4 mb-10 tabs">
        {['blackjack','roulette','coin-flip','slots'].map(g => (
          <button
            key={g}
            onClick={() => setGame(g)}
            className={game === g ? 'active' : 'inactive'}
          >
            {g.split('-')
              .map(w => w[0].toUpperCase() + w.slice(1))
              .join(' ')}
          </button>
        ))}
      </div>
      <div className="card">
        {game === 'blackjack' && <Blackjack />}
        {game === 'roulette'  && <Roulette />}
        {game === 'coin-flip' && <CoinFlip />}
        {game === 'slots'     && <Slots />}
      </div>
    </div>
  );
}

function Roulette() {
  const { token, refreshUser, user } = useAuth();
  const [bet, setBet] = useState('');
  const [choice, setChoice] = useState('red');
  const [spinning, setSpinning] = useState(false);
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [repeatLimit, setRepeatLimit] = useState(1);
  const [repeatCount, setRepeatCount] = useState(0);
  const wheelRef = useRef();
  const autoRepeatRef = useRef(autoRepeat);

  useEffect(() => {
    autoRepeatRef.current = autoRepeat;
  }, [autoRepeat]);

  const spinOnce = async () => {
    const amt = parseFloat(bet);
    if (!(amt > 0)) {
      toast.error('Enter a valid bet');
      return false;
    }

    setSpinning(true);

    try {
      const res = await fetch(`${API_BASE}/api/games/roulette`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betAmount: amt, color: choice }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      const midAngles = {
        green: 9.7297 / 2,
        red: 9.7297 + 174.3243 / 2,
        black: 9.7297 + 174.3243 + 174.3243 / 2,
      };

      const wheel = wheelRef.current;
      wheel.style.transition = 'none';
      wheel.style.transform = 'rotate(0deg)';
      wheel.getBoundingClientRect();

      const targetDeg = 1080 + (360 - midAngles[json.result]);
      wheel.style.transition = 'transform 2s ease-out';
      wheel.style.transform = `rotate(${targetDeg}deg)`;

      await new Promise((r) => setTimeout(r, 2000));

      if (json.win) {
        toast.success(`You hit ${json.result}! Won ${json.payout} coins!`);
      } else {
        toast.error(`Result was ${json.result}. You lost.`);
      }

      await refreshUser();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setSpinning(false);
    }
  };

  const handleSpin = async (e) => {
    if (e) e.preventDefault();
    setRepeatCount(1);
    await spinOnce();

    for (let i = 1; i < repeatLimit; i++) {
      if (!autoRepeatRef.current) break;
      const success = await spinOnce();
      if (!success || user.balance < parseFloat(bet)) break;
      setRepeatCount(i + 1);
    }

    setAutoRepeat(false);
  };

  return (
    <form onSubmit={handleSpin} className="space-y-6 text-center">
      <p className="text-lg">Balance: <strong>{user.balance}</strong></p>

      <div className="wheel-container mb-6">
        <div className="pointer" />
        <div ref={wheelRef} className="wheel" />
      </div>

      <div className="flex justify-center space-x-2 mb-2">
        <select
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="px-4 py-2 bg-gray-700 rounded"
          disabled={spinning}
        >
          <option value="red">Red (2×)</option>
          <option value="black">Black (2×)</option>
          <option value="green">Green (14×)</option>
        </select>
        <input
          type="number"
          min="1"
          placeholder="Bet"
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          className="w-24 px-3 py-2 bg-gray-700 rounded text-center"
          disabled={spinning}
        />
        <button
          type="button"
          onClick={() => setBet(user.balance)}
          disabled={spinning}
          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-bold shadow-sm transition"
        >
          Max
        </button>
      </div>

      <div className="flex justify-center space-x-4 items-center text-sm">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRepeat}
            onChange={() => {
              setAutoRepeat(!autoRepeat);
              setRepeatCount(0);
            }}
            disabled={spinning}
          />
          <span>Auto-repeat</span>
        </label>
        {autoRepeat && (
          <>
            <input
              type="number"
              min="1"
              max="100"
              value={repeatLimit}
              onChange={(e) => setRepeatLimit(Number(e.target.value))}
              className="w-12 text-center px-1 py-0.5 bg-gray-700 rounded"
              disabled={spinning}
            />
            <span className="text-green-400 font-semibold">
              ({repeatCount} / {repeatLimit})
            </span>
            <button
              type="button"
              onClick={() => setAutoRepeat(false)}
              className="ml-2 text-red-400 hover:text-red-500 text-xs font-medium underline"
            >
              Stop
            </button>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={spinning}
        className={`w-full py-3 rounded font-semibold ${
          spinning ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'
        } transition`}
      >
        {spinning ? 'Spinning…' : 'Spin Roulette'}
      </button>
    </form>
  );
}

function CoinFlip() {
  const { token, refreshUser, user } = useAuth();
  const [bet, setBet] = useState('');
  const [guess, setGuess] = useState('heads');
  const [flipping, setFlipping] = useState(false);
  const [side, setSide] = useState('H');
  const coinRef = useRef(null);

  const [autoRepeat, setAutoRepeat] = useState(false);
  const autoRepeatRef = useRef(autoRepeat);
  const [repeatLimit, setRepeatLimit] = useState(1);
  const [repeatCount, setRepeatCount] = useState(0);

  useEffect(() => {
    autoRepeatRef.current = autoRepeat;
  }, [autoRepeat]);

  const flipOnce = async () => {
    const amt = parseFloat(bet);
    if (!(amt > 0)) {
      toast.error('Enter a valid bet');
      return false;
    }

    setFlipping(true);
    coinRef.current?.classList.add('animate-flipY');

    try {
      const res = await fetch(`${API_BASE}/api/games/coin-flip`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betAmount: amt, guess }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setSide(json.result === 'heads' ? 'H' : 'T');
      await new Promise((r) => setTimeout(r, 1000));

      if (json.win) {
        toast.success(`Correct! You won ${json.payout} coins!`);
      } else {
        toast.error(`It was ${json.result}. Better luck next time.`);
      }

      await refreshUser();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      coinRef.current?.classList.remove('animate-flipY');
      setFlipping(false);
    }
  };

  const handleFlip = async (e) => {
    if (e) e.preventDefault();
    setRepeatCount(1);
    await flipOnce();

    for (let i = 1; i < repeatLimit; i++) {
      if (!autoRepeatRef.current) break;
      const success = await flipOnce();
      if (!success || user.balance < parseFloat(bet)) break;
      setRepeatCount(i + 1);
    }

    setAutoRepeat(false);
  };

  return (
    <form onSubmit={handleFlip} className="space-y-6 text-center">
      <p className="text-lg">Balance: <strong>{user.balance}</strong></p>
      <div ref={coinRef} className="coin mb-6">
        <span className="face-letter">{side}</span>
      </div>

      <div className="flex justify-center space-x-2 mb-2">
        <select
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="px-4 py-2 bg-gray-700 rounded"
          disabled={flipping}
        >
          <option value="heads">Heads (2×)</option>
          <option value="tails">Tails (2×)</option>
        </select>
        <input
          type="number"
          min="1"
          placeholder="Bet"
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          className="w-24 px-3 py-2 bg-gray-700 rounded text-center"
          disabled={flipping}
        />
        <button
          type="button"
          onClick={() => setBet(user.balance)}
          disabled={flipping}
          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-bold shadow-sm transition"
        >
          Max
        </button>
      </div>

      <div className="flex justify-center space-x-4 items-center text-sm">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRepeat}
            onChange={() => {
              setAutoRepeat(!autoRepeat);
              setRepeatCount(0);
            }}
            disabled={flipping}
          />
          <span>Auto-repeat</span>
        </label>
        {autoRepeat && (
          <>
            <input
              type="number"
              min="1"
              max="100"
              value={repeatLimit}
              onChange={(e) => setRepeatLimit(Number(e.target.value))}
              className="w-12 text-center px-1 py-0.5 bg-gray-700 rounded"
              disabled={flipping}
            />
            <span className="text-green-400 font-semibold">
              ({repeatCount} / {repeatLimit})
            </span>
            <button
              type="button"
              onClick={() => setAutoRepeat(false)}
              className="ml-2 text-red-400 hover:text-red-500 text-xs font-medium underline"
            >
              Stop
            </button>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={flipping}
        className={`w-full py-3 rounded font-semibold ${
          flipping ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
        } transition`}
      >
        {flipping ? 'Flipping…' : 'Flip Coin'}
      </button>
    </form>
  );
}

function Slots() {
  const { token, refreshUser, user } = useAuth();
  const [bet, setBet] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState(['❔', '❔', '❔']);
  const [comboName, setComboName] = useState(null);

  const [autoRepeat, setAutoRepeat] = useState(false);
  const autoRepeatRef = useRef(autoRepeat);
  const [maxRepeats, setMaxRepeats] = useState(1);
  const [currentRepeat, setCurrentRepeat] = useState(0);

  const slotsLuckEntry = user.inventory?.find(
    e => e.quantity > 0 && e.item.effectType === 'slots-luck'
  );
  const luckValue = slotsLuckEntry?.item.effectValue || 0;

  const cycleRefs = useRef([null, null, null]);
  const SYMBOLS = ['🍒','🍋','🍉','⭐','7️⃣','💎','🔔','🍇','🥝','🎰','💰','🍓','🍊','👑','🃏','🍀','🪙','🛎️','🌈','🔥','💣'];
  const MIN_SPIN_TIME = 2000;

  useEffect(() => {
    autoRepeatRef.current = autoRepeat;
  }, [autoRepeat]);

  const spinReel = (index) => {
    cycleRefs.current[index] = setInterval(() => {
      setReel((prev) => {
        const updated = [...prev];
        updated[index] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        return updated;
      });
    }, 80 + index * 40);
  };

  const stopReel = (index) => {
    clearInterval(cycleRefs.current[index]);
  };

  const performSpin = async () => {
    const amt = parseFloat(bet);
    if (!(amt > 0)) {
      toast.error('Enter a valid bet');
      return false;
    }

    setSpinning(true);
    setComboName(null);
    const startTime = Date.now();

    for (let i = 0; i < 3; i++) spinReel(i);

    try {
      const res = await fetch(`${API_BASE}/api/games/slots`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ betAmount: amt })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SPIN_TIME) {
        await new Promise((r) => setTimeout(r, MIN_SPIN_TIME - elapsed));
      }

      for (let i = 0; i < 3; i++) {
        stopReel(i);
        await new Promise((r) => setTimeout(r, 300));
        setReel((prev) => {
          const updated = [...prev];
          updated[i] = json.reel[i];
          return updated;
        });
      }

      document.querySelectorAll('.slot-symbol').forEach((el) =>
        el.classList.add('animate-slideIn')
      );
      await new Promise((r) => setTimeout(r, 500));

      if (json.win) {
        setComboName(json.combo || null);
        toast.success(json.combo
          ? `🎉 ${json.combo}! You won ${json.payout} coins!`
          : `You got ${json.reel.join(' ')} — won ${json.payout} coins!`);
      } else {
        toast.error(`You got ${json.reel.join(' ')}. Try again!`);
      }

      await refreshUser();
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setSpinning(false);
      document.querySelectorAll('.slot-symbol').forEach((el) =>
        el.classList.remove('animate-slideIn')
      );
    }
  };

  const handleSpin = async (e) => {
    if (e) e.preventDefault();
    setCurrentRepeat(1);
    const success = await performSpin();

    if (!success) {
      setAutoRepeat(false);
      return;
    }

    for (let i = 1; i < maxRepeats; i++) {
      if (!autoRepeatRef.current || user.balance < parseFloat(bet)) break;
      setCurrentRepeat(i + 1);
      const ok = await performSpin();
      if (!ok) break;
    }

    setAutoRepeat(false);
  };

  return (
    <form onSubmit={handleSpin} className="space-y-6 text-center">
      <p className="text-lg">Balance: <strong>{user.balance}</strong></p>
        
      {luckValue > 0 && (
      <div className="mb-2 text-yellow-400 font-medium">
        🔮 +{luckValue}% slot luck active
      </div>
      )}

      <div className="flex justify-center space-x-4 mb-4">
        {reel.map((sym, i) => (
          <div
            key={i}
            className="slot-symbol text-6xl w-20 h-20 flex items-center justify-center rounded-lg bg-gray-800 border-4 border-gray-700 shadow-inner"
          >
            {sym}
          </div>
        ))}
      </div>

      {comboName && (
        <div className="text-yellow-400 font-bold text-lg mb-2 animate-pulse">
          🎉 Combo: {comboName}!
        </div>
      )}

      <div className="flex justify-center space-x-2 items-center mb-2">
        <input
          type="number"
          min="1"
          placeholder="Bet"
          value={bet}
          onChange={(e) => setBet(e.target.value)}
          className="w-24 px-3 py-2 bg-gray-700 rounded text-center"
          disabled={spinning}
        />
        <button
          type="button"
          onClick={() => setBet(user.balance)}
          disabled={spinning}
          className="px-3 py-2 rounded text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg transition"
        >
          Max
        </button>
      </div>

      <div className="flex justify-center items-center space-x-2 mb-2">
        <label className="text-sm">Auto-Repeat</label>
        <input
          type="checkbox"
          checked={autoRepeat}
          onChange={() => {
            const next = !autoRepeat;
            setAutoRepeat(next);
            setCurrentRepeat(0);
          }}
          disabled={spinning}
        />
        <input
          type="number"
          min="1"
          value={maxRepeats}
          onChange={(e) => setMaxRepeats(Number(e.target.value))}
          disabled={spinning || !autoRepeat}
          className="w-16 px-2 py-1 bg-gray-700 rounded text-center text-sm"
        />
        {autoRepeat && (
          <>
            <span className="text-sm">({currentRepeat}/{maxRepeats})</span>
            <button
              type="button"
              onClick={() => {
                setAutoRepeat(false);
              }}
              className="ml-2 text-red-400 hover:text-red-500 text-xs font-medium underline"
            >
              Stop
            </button>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={spinning}
        className={`w-full py-3 rounded font-semibold ${
          spinning ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
        } transition`}
      >
        {spinning ? 'Rolling…' : 'Spin Slots'}
      </button>
    </form>
  );
}

function Blackjack() {
  const { token, refreshUser, user } = useAuth();
  const [bet, setBet] = useState('');
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadState = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/games/blackjack`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setState(json.blackjack);
    } catch (err) {
      toast.error(err.message);
    }
  }, [token]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const submit = async (endpoint) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/games/blackjack/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(endpoint === 'start' ? { betAmount: Number(bet) } : {})
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setState(json.blackjack);
      await refreshUser();
      if (json.blackjack.finished) {
        const resultText = json.blackjack.result === 'player'
          ? 'You beat the dealer.'
          : json.blackjack.result === 'push'
            ? 'Push. Bet returned.'
            : 'Dealer wins.';
        if (json.blackjack.result === 'player') {
          toast.success(resultText, { icon: '🎉' });
        } else if (json.blackjack.result === 'push') {
          toast(resultText, { icon: '↔️' });
        } else {
          toast.error(resultText, { icon: '🫥' });
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playerCards = state?.playerHand || [];
  const dealerCards = state?.dealerHand || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/45">Blackjack</p>
          <h2 className="text-3xl font-bold">Beat the dealer</h2>
          <p className="mt-2 text-white/65">
            Natural blackjack pays more. Hit, stand, or start a new hand after each round.
          </p>
        </div>
        <p className="text-lg">Balance: <strong>{user.balance}</strong></p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HandPanel
          title="Dealer"
          cards={dealerCards}
          total={state?.active && !state?.finished ? state?.dealerTotal : state?.dealerTotal}
          hidden={!!state?.active && !state?.finished && (state?.dealerHand?.length || 0) > 0}
          placeholderText="Dealer hole card hidden"
        />
        <HandPanel
          title="You"
          cards={playerCards}
          total={state?.playerTotal}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">Bet</div>
          <input
            type="number"
            min="1"
            value={bet}
            onChange={(e) => setBet(e.target.value)}
            disabled={loading || (state?.active && !state?.finished)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            placeholder="Enter bet"
          />
        </div>
        <button
          type="button"
          disabled={loading || (state?.active && !state?.finished) || !(Number(bet) > 0)}
          onClick={() => submit('start')}
          className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-40"
        >
          Deal
        </button>
        <button
          type="button"
          disabled={loading || !state?.canHit}
          onClick={() => submit('hit')}
          className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-semibold text-white transition hover:bg-white/12 disabled:opacity-40"
        >
          Hit
        </button>
        <button
          type="button"
          disabled={loading || !state?.canStand}
          onClick={() => submit('stand')}
          className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-semibold text-white transition hover:bg-white/12 disabled:opacity-40"
        >
          Stand
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {state?.finished ? (
          <span>
            Round complete. Result: <strong className="text-white">{state.result}</strong>
          </span>
        ) : state?.active ? (
          <span>Round live. Hit until you want to stand, or bust.</span>
        ) : (
          <span>Place a bet to start a round.</span>
        )}
      </div>
    </div>
  );
}

function HandPanel({ title, cards, total, hidden = false, placeholderText = 'Hole card hidden' }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-white/60">Total: {total ?? 0}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {cards.length ? cards.map((card, index) => (
          <div
            key={`${card}-${index}`}
            className="flex h-20 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-2xl font-semibold"
          >
            {card}
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm text-white/50">
            Waiting for cards
          </div>
        )}
        {hidden && (
          <div className="flex h-20 w-16 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 text-xs text-white/40">
            {placeholderText}
          </div>
        )}
      </div>
    </div>
  );
}
