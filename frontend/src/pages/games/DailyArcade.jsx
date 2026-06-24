import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Binary, CalendarCheck, CircleDot, LineChart, LockKeyhole, Route, Waves } from 'lucide-react';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ActionButton, EmptyState, LoadingState, PageFrame, PageHero, StatCard } from '../../components/ui/page';

const icons = {
  'sum-lock': LockKeyhole,
  'product-lock': CircleDot,
  'prime-gate': Binary,
  'pattern-scan': Route,
  'difference-scan': Route,
  'parity-lock': Binary,
  'market-read': LineChart,
  'volatility-call': Waves
};

function DailyGameCard({ game, onSolved }) {
  const { token } = useAuth();
  const [selected, setSelected] = useState([]);
  const [answer, setAnswer] = useState('');
  const [choice, setChoice] = useState('');
  const [loading, setLoading] = useState(false);
  const Icon = icons[game.id] || CalendarCheck;

  const submit = async () => {
    setLoading(true);
    try {
      const payload = game.inputType === 'multi-index'
        ? selected
        : game.inputType === 'choice'
          ? choice
          : answer;
      const res = await fetch(`${API_BASE}/api/games/daily-arcade/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ gameId: game.id, answer: payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Daily challenge failed');
      toast.success(`+${data.reward} coins`);
      onSolved(game.id, data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleIndex = index => {
    setSelected(current => {
      if (current.includes(index)) return current.filter(value => value !== index);
      if (current.length >= 2) return [current[1], index];
      return [...current, index];
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[2rem] border p-5 shadow-2xl backdrop-blur-xl ${game.solved ? 'border-emerald-300/25 bg-emerald-300/10' : 'border-white/10 bg-white/[0.055]'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-cyan-100">
            <Icon size={22} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{game.title}</h2>
            <p className="text-sm text-white/60">{game.description}</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/65">
          {game.solved ? 'Solved' : `${game.reward} coins`}
        </span>
      </div>

      {game.inputType === 'multi-index' && (
        <div className="mt-5">
          <div className="mb-3 text-sm text-white/70">
            {game.prompt.operation === 'product' ? 'Target product' : game.prompt.operation === 'parity' ? 'Target parity' : 'Target'}:
            <span className="ml-2 font-semibold capitalize text-cyan-100">{game.prompt.target}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {game.prompt.numbers.map((number, index) => (
              <button
                key={`${number}-${index}`}
                type="button"
                disabled={game.solved}
                onClick={() => toggleIndex(index)}
                className={`rounded-2xl border px-3 py-4 text-lg font-bold transition ${selected.includes(index) ? 'border-cyan-200/60 bg-cyan-300/20 text-cyan-50' : 'border-white/10 bg-black/25 text-white/75 hover:border-white/25'}`}
              >
                {number}
              </button>
            ))}
          </div>
        </div>
      )}

      {game.inputType === 'number' && (
        <div className="mt-5">
          {game.prompt.question && <p className="mb-3 text-sm text-white/60">{game.prompt.question}</p>}
          <div className="mb-3 flex flex-wrap gap-2">
            {(game.prompt.sequence || game.prompt.numbers || []).map((number, index) => (
              <span key={index} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-lg font-semibold text-white/80">
                {number ?? '?'}
              </span>
            ))}
          </div>
          <input
            value={answer}
            disabled={game.solved}
            onChange={event => setAnswer(event.target.value)}
            inputMode="numeric"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-200/60"
            placeholder="Missing number"
          />
        </div>
      )}

      {game.inputType === 'choice' && (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {game.prompt.prices.map((price, index) => (
              <span key={index} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white/80">
                {price}
              </span>
            ))}
          </div>
          <p className="mb-3 text-sm text-white/60">Signal: {game.prompt.signal}</p>
          <div className="grid grid-cols-2 gap-3">
            {game.options.map(option => (
              <button
                key={option}
                type="button"
                disabled={game.solved}
                onClick={() => setChoice(option)}
                className={`rounded-2xl border px-4 py-3 font-semibold capitalize transition ${choice === option ? 'border-cyan-200/60 bg-cyan-300/20 text-cyan-50' : 'border-white/10 bg-black/25 text-white/75 hover:border-white/25'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <ActionButton
        onClick={submit}
        disabled={game.solved || loading}
        className="mt-5 w-full justify-center"
      >
        {game.solved ? 'Claimed today' : loading ? 'Checking...' : 'Submit answer'}
      </ActionButton>
    </motion.article>
  );
}

export default function DailyArcade() {
  const { token } = useAuth();
  const [state, setState] = useState({ loading: true, dateKey: '', games: [] });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/games/daily-arcade`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setState({ loading: false, dateKey: data.dateKey, games: data.games || [] }))
      .catch(() => setState({ loading: false, dateKey: '', games: [] }));
  }, [token]);

  const markSolved = gameId => {
    setState(current => ({
      ...current,
      games: current.games.map(game => game.id === gameId ? { ...game, solved: true } : game)
    }));
  };

  const solvedCount = state.games.filter(game => game.solved).length;

  if (state.loading) return <LoadingState label="Loading daily arcade" />;

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_12%_4%,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(245,158,11,0.14),transparent_32%),linear-gradient(180deg,#030712_0%,#0b1020_58%,#020617_100%)]">
      <div className="mx-auto max-w-6xl">
        <PageHero
          meta="Daily games"
          title="Daily Arcade"
          description="Eight short skill checks refresh every day. They use server-side answers, one claim per challenge, and clean coin rewards."
          actions={(
            <>
              <StatCard label="Date" value={state.dateKey || 'Today'} tone="text-cyan-100" />
              <StatCard label="Solved" value={`${solvedCount}/${state.games.length}`} tone="text-emerald-100" />
            </>
          )}
        />

        {state.games.length === 0 ? (
          <EmptyState title="No daily games loaded" description="Try refreshing or check the games API health from the admin panel." />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {state.games.map(game => (
              <DailyGameCard key={game.id} game={game} onSolved={markSolved} />
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
