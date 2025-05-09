import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE } from '../api';

export default function Casino() {
  const [game, setGame] = useState('roulette');

  return (
    <div className="min-h-screen text-white main-content">
      <h1 className="text-5xl font-extrabold text-center mb-8">🃏 Casino</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-10 tabs">
        {['roulette','coin-flip','slots'].map(g => (
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

      {/* Card Wrapper */}
      <div className="card">
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

  const slotsLuckBuff = (user.activeEffects || [])
  .find(b => b.effectType === 'slots-luck');
  const luckValue = slotsLuckBuff?.effectValue || 0;

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
