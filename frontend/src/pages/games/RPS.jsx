import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';
import { EmptyState, PageFrame, PageHero, StatCard } from '../../components/ui/page';

const CHOICES = [
  { key: 'rock', label: 'Rock', mark: 'R' },
  { key: 'paper', label: 'Paper', mark: 'P' },
  { key: 'scissors', label: 'Scissors', mark: 'S' }
];

export default function RPS() {
  const { token, user } = useAuth();
  const [opponentName, setOpponentName] = useState('');
  const [buyIn, setBuyIn] = useState(10);
  const [choice, setChoice] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ wins: 0, games: 0 });
  const [invites, setInvites] = useState([]);
  const [history, setHistory] = useState([]);
  const [bots, setBots] = useState([]);
  const [loadingBots, setLoadingBots] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/games/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setStats(data.rpsStats || { wins: 0, games: 0 }))
      .catch(() => {});

    fetch(`${API_BASE}/api/games/rps/invites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setInvites(data || []))
      .catch(() => {});

    fetch(`${API_BASE}/api/games/rps/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {});

    fetch(`${API_BASE}/api/games/rps/bots`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setBots(data || []))
      .catch(() => {})
      .finally(() => setLoadingBots(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const poll = setInterval(() => {
      fetch(`${API_BASE}/api/games/rps/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(setHistory)
        .catch(() => {});
    }, 4000);
    return () => clearInterval(poll);
  }, [token]);

  const playAgainst = async (opponent) => {
    const res = await fetch(`${API_BASE}/api/games/rps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        opponentUsername: opponent,
        buyIn: Number(buyIn),
        userChoice: choice
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Match failed');
    }

    return data;
  };

  const handlePlay = async () => {
    if (!opponentName || !choice) {
      setStatusMessage('Pick an opponent and a move.');
      return;
    }

    setStatusMessage('');
    setResult(null);

    try {
      const data = await playAgainst(opponentName);
      setResult(data);
      setStats(prev => ({
        wins: data.winner === user.id ? prev.wins + 1 : prev.wins,
        games: prev.games + 1
      }));
      if (data.opponentType === 'bot' && data.quip) {
        setStatusMessage(data.quip);
      }
      toast.success(data.winner === user.id ? 'You won the round.' : 'Match resolved.');
    } catch (err) {
      setStatusMessage(err.message);
      toast.error(err.message);
    }
  };

  const handleAccept = (invite) => {
    setOpponentName(invite.fromUsername);
    setBuyIn(invite.buyIn);
    setInvites(current => current.filter(i => i._id !== invite._id));
    setStatusMessage(`Challenge accepted from ${invite.fromUsername}.`);
  };

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_18%_5%,rgba(236,72,153,0.14),transparent_32%),radial-gradient(circle_at_88%_2%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(180deg,#08111f_0%,#09090b_55%,#020202_100%)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHero
          title="Rock Paper Scissors"
          description="Challenge real players or bots. Pick a move, set the buy-in, and resolve a fast wager."
          actions={(
            <>
              <StatCard label="Wins" value={stats.wins} tone="text-emerald-100" />
              <StatCard label="Games" value={stats.games} tone="text-cyan-100" />
            </>
          )}
        />

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl"
          >
            {invites.length > 0 && (
              <div className="mb-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                <h2 className="mb-3 text-lg font-semibold text-pink-200">Incoming challenges</h2>
                <div className="space-y-2">
                  {invites.map(inv => (
                    <div key={inv._id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                      <div>
                        <span className="font-semibold">{inv.fromUsername}</span> wants {inv.buyIn} coins.
                      </div>
                      <Button size="sm" onClick={() => handleAccept(inv)}>Accept</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-white/75">Opponent</label>
                <Input
                  placeholder="Type a username or select a bot"
                  value={opponentName}
                  onChange={e => setOpponentName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Buy-in</label>
                <Input
                  type="number"
                  min="1"
                  value={buyIn}
                  onChange={e => setBuyIn(+e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handlePlay}
                  disabled={!opponentName || !choice}
                  className="w-full"
                >
                  Challenge
                </Button>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 text-sm font-medium text-white/75">Your move</div>
              <div className="grid grid-cols-3 gap-3">
                {CHOICES.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setChoice(item.key)}
                    className={`rounded-2xl border px-3 py-4 text-center transition ${
                      choice === item.key
                        ? 'border-pink-400 bg-pink-500/25 shadow-lg shadow-pink-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-2xl font-black">{item.mark}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/70">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {statusMessage && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-amber-200">
                {statusMessage}
              </div>
            )}

            {result?.userPick && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-3xl border border-white/10 bg-black/35 p-5"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <ResultLine label="You chose" value={result.userPick} />
                  <ResultLine label={result.opponent || result.opponentType || 'Opponent'} value={result.oppPick} />
                </div>
                <div className="mt-4 text-xl font-bold">
                  {result.winner
                    ? result.winner === user.id
                      ? 'You won.'
                      : 'You lost.'
                    : 'It was a draw.'}
                </div>
                <div className="mt-2 text-sm text-white/70">
                  Balance: <span className="font-semibold text-white">{result.balance?.you ?? user.balance}</span>
                  {typeof result.payout === 'number' && result.payout > 0 ? ` · payout ${result.payout}` : ''}
                </div>
                {result.quip && (
                  <div className="mt-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-pink-100">
                    {result.quip}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Bot roster</h2>
                <span className="text-xs uppercase tracking-[0.25em] text-white/45">
                  {loadingBots ? 'Loading' : `${bots.length} ready`}
                </span>
              </div>
              <div className="space-y-3">
                {!loadingBots && bots.length === 0 && (
                  <EmptyState title="No bots available" description="Bot players will appear here when the roster endpoint responds." />
                )}
                {bots.map(bot => (
                  <button
                    key={bot.name}
                    type="button"
                    onClick={() => {
                      setOpponentName(bot.name);
                      setStatusMessage(`${bot.name} · ${bot.quip}`);
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      opponentName === bot.name
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{bot.name}</div>
                        <div className="text-xs uppercase tracking-[0.25em] text-white/45">{bot.title}</div>
                      </div>
                      <div className="text-xs text-white/55">{bot.mood}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <h2 className="mb-4 text-lg font-semibold">Recent matches</h2>
              {history.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {history.map((match, index) => (
                    <div key={`${match.playedAt || index}-${index}`} className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2">
                      <div>
                        <span className="font-semibold">{match.opponent}</span>
                        <span className="ml-2 text-white/50">
                          {match.yourPick} vs {match.theirPick}
                        </span>
                      </div>
                      <span
                        className={`text-xs uppercase tracking-[0.25em] ${
                          match.outcome === 'win'
                            ? 'text-emerald-300'
                            : match.outcome === 'lose'
                              ? 'text-rose-300'
                              : 'text-white/50'
                        }`}
                      >
                        {match.outcome}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/55">No matches yet.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function ResultLine({ label, value }) {
  const mark = value === 'rock' ? 'R' : value === 'paper' ? 'P' : value === 'scissors' ? 'S' : '-';
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-sm font-black">{mark}</span>
        <span className="capitalize">{value}</span>
      </div>
    </div>
  );
}
