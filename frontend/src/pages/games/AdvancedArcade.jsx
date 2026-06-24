import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ActionButton, PageFrame, PageHero, StatCard } from '../../components/ui/page';

const modes = [
  { id: 'crash', name: 'Crash', desc: 'Pick a cashout multiplier before the line breaks.', endpoint: 'crash' },
  { id: 'higher-lower', name: 'Higher / Lower', desc: 'Call the next card direction.', endpoint: 'higher-lower' },
  { id: 'dice-duel', name: 'Dice Duel', desc: 'Hit an exact two-dice total for sharper odds.', endpoint: 'dice-duel' },
  { id: 'bot-race', name: 'Bot Race', desc: 'Back a bot racer and watch the field settle.', endpoint: 'bot-race' }
];

const racers = ['ByteJackal', 'TurboCrane', 'GlassRook', 'EchoLynx', 'VantaDice', 'NeonLatch'];

function ArcadeStage({ mode, result, selectedRacer }) {
  if (mode.id === 'crash') {
    const crash = result?.game === 'crash' ? Math.min(100, (result.crashPoint || 1) * 5) : 56;
    return (
      <div className="relative mt-5 h-32 overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
        <motion.div
          className="absolute bottom-4 left-4 h-2 rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(103,232,249,.55)]"
          initial={{ width: '12%' }}
          animate={{ width: `${crash}%` }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute bottom-7 h-9 w-9 rounded-full border border-cyan-100/40 bg-cyan-300/25"
          initial={{ left: '10%' }}
          animate={{ left: `${Math.max(10, crash - 4)}%` }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        />
      </div>
    );
  }
  if (mode.id === 'dice-duel') {
    const dice = result?.game === 'dice-duel' ? result.dice : ['?', '?'];
    return (
      <div className="mt-5 grid h-32 grid-cols-2 gap-3 rounded-[24px] border border-white/10 bg-black/30 p-4">
        {dice.map((value, index) => (
          <motion.div
            key={index}
            animate={{ rotate: result ? [0, 18, -12, 0] : 0, scale: result ? [1, 1.08, 1] : 1 }}
            className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-4xl font-black"
          >
            {value}
          </motion.div>
        ))}
      </div>
    );
  }
  if (mode.id === 'bot-race') {
    const raceResults = result?.game === 'bot-race' ? result.results : racers.map((name, index) => ({ name, score: 40 + index * 8 }));
    return (
      <div className="mt-5 space-y-2 rounded-[24px] border border-white/10 bg-black/30 p-4">
        {raceResults.slice(0, 4).map(entry => (
          <div key={entry.name}>
            <div className="mb-1 flex justify-between text-[11px] text-white/55">
              <span>{entry.name}{entry.name === selectedRacer ? ' · pick' : ''}</span>
              <span>{Math.round(entry.score)}</span>
            </div>
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-rose-300 to-cyan-200"
              initial={{ width: '8%' }}
              animate={{ width: `${Math.min(100, Math.max(8, entry.score))}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        ))}
      </div>
    );
  }
  const current = result?.game === 'higher-lower' ? result.current : '?';
  const next = result?.game === 'higher-lower' ? result.next : '?';
  return (
    <div className="mt-5 grid h-32 grid-cols-2 gap-3 rounded-[24px] border border-white/10 bg-black/30 p-4">
      {[current, next].map((card, index) => (
        <motion.div
          key={index}
          animate={{ y: result ? [12, 0] : 0, opacity: 1 }}
          className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-4xl font-black"
        >
          {card}
        </motion.div>
      ))}
    </div>
  );
}

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
    <PageFrame className="bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(251,113,133,0.13),transparent_32%),linear-gradient(180deg,#030712_0%,#09090b_55%,#020202_100%)]">
        <PageHero
          meta="Arcade desk"
          title="Risk lab"
          description="Fast, server-settled games with different payout curves and a small coin sink on wins."
          actions={(
            <>
              <StatCard label="Bet" value={bet} tone="text-cyan-100" />
              <StatCard label="Race pick" value={racer} tone="text-rose-100" />
            </>
          )}
        />

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
              <ArcadeStage mode={mode} result={result?.game === mode.id ? result : null} selectedRacer={racer} />
              <div className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold transition group-hover:bg-cyan-300/15">
                {loading === mode.id ? 'Settling...' : 'Start round'}
              </div>
            </motion.button>
          ))}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`mt-8 rounded-[32px] border p-6 shadow-2xl backdrop-blur-xl ${result.won ? 'border-emerald-300/20 bg-emerald-400/10' : 'border-rose-300/20 bg-rose-400/10'}`}
          >
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">Last result</div>
            <div className="mt-3 grid gap-4 sm:grid-cols-4">
              <StatCard label="Game" value={result.game || 'Round'} />
              <StatCard label="Outcome" value={result.won ? 'Win' : 'Loss'} tone={result.won ? 'text-emerald-100' : 'text-rose-100'} />
              <StatCard label="Payout" value={result.payout || 0} />
              <StatCard label="Balance" value={result.balance?.toLocaleString?.() || result.balance || '-'} />
            </div>
            {result.results && (
              <div className="mt-5 grid gap-2">
                {result.results.slice(0, 6).map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-2 text-sm">
                    <span>{index + 1}. {entry.name}</span>
                    <span className="text-white/50">{Math.round(entry.score)}</span>
                  </div>
                ))}
              </div>
            )}
            <ActionButton className="mt-5" onClick={() => setResult(null)}>Clear result</ActionButton>
          </motion.div>
        )}
    </PageFrame>
  );
}
