import React, { useState, useRef } from 'react';
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

/* ── ROULETTE ────────────────────────────────────────── */
function Roulette() {
  const { token, refreshUser, user } = useAuth();
  const [bet, setBet] = useState('');
  const [choice, setChoice] = useState('red');
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef();

  const handleSpin = async e => {
    e.preventDefault();
    const amt = parseFloat(bet);
    if (!(amt > 0)) return toast.error('Enter a valid bet');
    setSpinning(true);

    try {
      // 1) Fetch the result from backend
      const res = await fetch(`${API_BASE}/api/games/roulette`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ betAmount: amt, color: choice })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      // 2) Determine the midpoint angle for each color on a 37-slot wheel
      const midAngles = {
        green: 9.7297 / 2,                             // ≈ 4.86485°
        red:   9.7297 + (174.3243 / 2),                // ≈ 96.89185°
        black: 9.7297 + 174.3243 + (174.3243 / 2)      // ≈ 272.02735°
      };

      // 3) Reset wheel to 0° instantly
      const wheel = wheelRef.current;
      wheel.style.transition = 'none';
      wheel.style.transform  = 'rotate(0deg)';
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      wheel.getBoundingClientRect();

      // 4) Spin: 3 full turns + offset so chosen segment lands under pointer (0°)
      const rounds    = 3;
      const targetDeg = 360 * rounds + (360 - midAngles[json.result]);
      wheel.style.transition = 'transform 2s ease-out';
      wheel.style.transform  = `rotate(${targetDeg}deg)`;

      // 5) Wait for spin animation to complete
      await new Promise(r => setTimeout(r, 2000));

      // 6) Show outcome
      if (json.win) {
        toast.success(`You hit ${json.result}! Won ${json.payout} coins!`);
      } else {
        toast.error(`Result was ${json.result}. You lost.`);
      }
      await refreshUser();

    } catch (err) {
      toast.error(err.message);
    } finally {
      setSpinning(false);
      setBet('');
    }
  };

  return (
    <form onSubmit={handleSpin} className="space-y-6 text-center">
      <p className="text-lg">Balance: <strong>{user.balance}</strong></p>

      <div className="wheel-container mb-6">
        <div className="pointer" />
        <div ref={wheelRef} className="wheel" />
      </div>

      <div className="flex justify-center space-x-4">
        <select
          value={choice}
          onChange={e => setChoice(e.target.value)}
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
          onChange={e => setBet(e.target.value)}
          className="w-28 px-3 py-2 bg-gray-700 rounded text-center"
          disabled={spinning}
          required
        />
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

/* ── COIN FLIP ──────────────────────────────────────── */
function CoinFlip() {
    const { token, refreshUser, user } = useAuth();
    const [bet, setBet]       = useState('');
    const [guess, setGuess]   = useState('heads');
    const [flipping, setFlipping] = useState(false);
    const [side, setSide]     = useState('H');
    const coinRef = useRef(null);
  
    const handleFlip = async e => {
      e.preventDefault();
      const amt = parseFloat(bet);
      if (!(amt > 0)) return toast.error('Enter a valid bet');
  
      setFlipping(true);
      coinRef.current?.classList.add('animate-flipY');
  
      try {
        const res = await fetch(`${API_BASE}/api/games/coin-flip`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ betAmount: amt, guess })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
  
        setSide(json.result === 'heads' ? 'H' : 'T');
        await new Promise(r => setTimeout(r, 1000));
  
        if (json.win) {
          toast.success(`Correct! You won ${json.payout} coins!`);
        } else {
          toast.error(`It was ${json.result}. Better luck next time.`);
        }
        await refreshUser();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setFlipping(false);
        setBet('');
        coinRef.current?.classList.remove('animate-flipY');
      }
    };
  
    return (
      <form onSubmit={handleFlip} className="space-y-6 text-center">
        <p className="text-lg">Balance: <strong>{user.balance}</strong></p>
        <div ref={coinRef} className="coin mb-6">
          <span className="face-letter">{side}</span>
        </div>
  
        <div className="flex justify-center space-x-4">
          <select
            value={guess}
            onChange={e => setGuess(e.target.value)}
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
            onChange={e => setBet(e.target.value)}
            className="w-28 px-3 py-2 bg-gray-700 rounded text-center"
            disabled={flipping}
            required
          />
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
    const [reel, setReel] = useState(['?', '?', '?']);
    const cycleRef = useRef(null);
    const symbols = ['🍒','🍋','🍉','⭐','7️⃣'];
    const MIN_SPIN_TIME = 2000; // ensure at least 2s of cycling
  
    const handleSpin = async e => {
      e.preventDefault();
      const amt = parseFloat(bet);
      if (!(amt > 0)) return toast.error('Enter a valid bet');
  
      setSpinning(true);
      const startTime = Date.now();
  
      // 1) start fast cycling of emojis
      cycleRef.current = setInterval(() => {
        setReel([
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ]);
      }, 100);
  
      try {
        // 2) call backend
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
  
        // 3) ensure minimum time of cycling for thrill
        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_SPIN_TIME) {
          await new Promise(r => setTimeout(r, MIN_SPIN_TIME - elapsed));
        }
  
        // 4) stop cycling & show actual result
        clearInterval(cycleRef.current);
        setReel(json.reel);
  
        // 5) slide-in animation
        document.querySelectorAll('.slot-symbol').forEach(el =>
          el.classList.add('animate-slideIn')
        );
        await new Promise(r => setTimeout(r, 500));
  
        // 6) toast outcome
        if (json.win) {
          toast.success(`You got ${json.reel.join(' ')} — won ${json.payout} coins!`);
        } else {
          toast.error(`You got ${json.reel.join(' ')}. Try again!`);
        }
        await refreshUser();
      } catch (err) {
        toast.error(err.message);
      } finally {
        clearInterval(cycleRef.current);
        setSpinning(false);
        setBet('');
        document.querySelectorAll('.slot-symbol').forEach(el =>
          el.classList.remove('animate-slideIn')
        );
      }
    };
  
    return (
      <form onSubmit={handleSpin} className="space-y-6 text-center">
        <p className="text-lg">
          Balance: <strong>{user.balance}</strong>
        </p>
        <div className="flex justify-center space-x-8 text-6xl mb-6">
          {reel.map((sym, i) => (
            <div key={i} className="slot-symbol">{sym}</div>
          ))}
        </div>
  
        <input
          type="number"
          min="1"
          placeholder="Bet"
          value={bet}
          onChange={e => setBet(e.target.value)}
          className="w-28 px-3 py-2 bg-gray-700 rounded text-center block mx-auto"
          disabled={spinning}
          required
        />
  
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
  