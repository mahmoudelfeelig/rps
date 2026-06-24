import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';

const modes = [
  { id: 'crash', name: 'Crash', desc: 'Pick a cashout multiplier before the line breaks.', endpoint: 'crash' },
  { id: 'higher-lower', name: 'Higher / Lower', desc: 'Call the next card direction.', endpoint: 'higher-lower' },
  { id: 'dice-duel', name: 'Dice Duel', desc: 'Hit an exact two-dice total for sharper odds.', endpoint: 'dice-duel' },
  { id: 'bot-race', name: 'Bot Race', desc: 'Back a bot racer and watch the field settle.', endpoint: 'bot-race' }
];

const racers = ['ByteJackal', 'TurboCrane', 'GlassRook', 'EchoLynx', 'VantaDice', 'NeonLatch'];

export default function AdvancedArcade() {
  const { token } = useAuth();
  const [bet, setBet] = useState('250');
  const [cashout, setCashout] = useState('2');
  const [guess, setGuess] = useState('higher');
  const [target, setTarget] = useState('7');
  const [racer, setRacer] = useState(racers[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState('');

  const play = async mode => {
    setLoading(mode.id);
    try {
      const body = {
        betAmount: Number(bet),
        cashoutMultiplier: Number(cashout),
        guess,
        target: Number(target),
        racer
      };
      const res = await fetch(`${API_BASE}/api/games/${mode.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Play failed');
      setResult(data);
      toast[data.won ? 'success' : 'error'](data.won ? `Won ${data.payout} coins` : 'Round lost');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen px-4 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/50">Arcade desk</p>
          <h1 className="mt-3 text-4xl font-black sm:text-6xl">New risk games</h1>
          <p className="mt-4 max-w-2xl text-white/65">
            Fast, server-settled games with different payout curves and a small coin sink on wins.
          </p>
        </div>

        <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:grid-cols-4">
          <label className="text-sm text-white/70">
            Bet
            <input value={bet} onChange={e => setBet(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
          </label>
          <label className="text-sm text-white/70">
            Crash cashout
            <input value={cashout} onChange={e => setCashout(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
          </label>
          <label className="text-sm text-white/70">
            Higher / Lower
            <select value={guess} onChange={e => setGuess(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
              <option value="higher">Higher</option>
              <option value="lower">Lower</option>
            </select>
          </label>
          <label className="text-sm text-white/70">
            Dice target
            <input value={target} onChange={e => setTarget(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
          </label>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-black/20 p-4">
          <label className="text-sm text-white/70">
            Race pick
            <select value={racer} onChange={e => setRacer(e.target.value)} className="ml-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-white">
              {racers.map(name => <option key={name}>{name}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {modes.map((mode, index) => (
            <motion.button
              key={mode.id}
              type="button"
              onClick={() => play(mode)}
              disabled={loading === mode.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(14,165,233,.16),rgba(15,23,42,.88)),radial-gradient(circle_at_top,rgba(255,255,255,.18),transparent_45%)] p-5 text-left shadow-2xl transition hover:-translate-y-1 hover:border-cyan-200/40 disabled:opacity-50"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/50">Play</div>
              <h2 className="mt-4 text-2xl font-bold">{mode.name}</h2>
              <p className="mt-3 min-h-12 text-sm text-white/65">{mode.desc}</p>
              <div className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold">
                {loading === mode.id ? 'Settling...' : 'Start round'}
              </div>
            </motion.button>
          ))}
        </div>

        {result && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">Last result</div>
            <pre className="mt-3 overflow-auto text-sm text-white/80">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
