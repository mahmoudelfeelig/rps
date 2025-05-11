import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import successSfx from '../assets/success.mp3';
import { API_BASE } from '../api';

const filterOptions = [
  { key: 'all',       label: 'All',          criteria: null },
  { key: 'bet',       label: 'Bets',         criteria: ['betsPlaced','betsWon'] },
  { key: 'store',     label: 'Store',        criteria: ['storePurchases'] },
  { key: 'login',     label: 'Login',        criteria: ['logins'] },
  { key: 'task',      label: 'Tasks',        criteria: ['tasksCompleted'] },
  { key: 'minefield', label: 'Minefield',    criteria: ['minefieldWins'] },
  { key: 'puzzle',    label: 'Puzzle',       criteria: ['puzzleWins'] },
  { key: 'rps',       label: 'RPS',          criteria: ['rpsWins'] },
  { key: 'frenzy',    label: 'Click Frenzy', criteria: ['frenzyClicks'] },
  { key: 'casino',    label: 'Casino',       criteria: ['casinoWins'] },
  { key: 'items',     label: 'Items',        criteria: ['itemsOwned'] },
];

const typeStyles = {
  betsPlaced:     'border-green-400/30 bg-green-500/10',
  betsWon:        'border-green-500/30 bg-green-600/10',
  storePurchases: 'border-yellow-400/30 bg-yellow-500/10',
  logins:         'border-blue-400/30 bg-blue-500/10',
  tasksCompleted: 'border-purple-400/30 bg-purple-500/10',
  minefieldWins:  'border-rose-400/30 bg-rose-500/10',
  puzzleWins:     'border-indigo-400/30 bg-indigo-500/10',
  rpsWins:        'border-orange-400/30 bg-orange-500/10',
  frenzyClicks:   'border-pink-400/30 bg-pink-500/10',
  casinoWins:     'border-teal-400/30 bg-teal-500/10',
  itemsOwned:     'border-gray-400/30 bg-gray-500/10',
  other:          'border-gray-400/30 bg-gray-500/10',
};

export default function Achievements() {
  const { user, token, refreshUser } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [filterKey,    setFilterKey]    = useState('all');
  const audio = new Audio(successSfx);

  useEffect(() => {
    async function load() {
      const [achRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/achievements`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/user/stats`,    { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const achData   = await achRes.json();
      const statsData = await statsRes.json();

      const claimedSet = new Set(
        statsData.claimedAchievements.map(a => String(a._id))
      );

      const enriched = achData.map(ach => {
        const value    = statsData[ach.criteria] || 0;
        const progress = Math.min(100, (value / ach.threshold) * 100);
        const claimed  = claimedSet.has(String(ach._id));
        return {
          ...ach,
          progress,
          complete: progress >= 100,
          claimed
        };
      });

      setAchievements(enriched);
    }

    load().catch(console.error);
  }, [token, refreshUser]);

  const handleClaim = async (id, reward, title) => {
    const res = await fetch(`${API_BASE}/api/achievements/complete`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${token}`
      },
      body: JSON.stringify({ achievementId: id })
    });
    if (res.ok) {
      try { await audio.play(); } catch {}
      toast.success(`Claimed "${title}"! +${reward} coins`);
      setAchievements(prev =>
        prev.map(a => a._id === id ? { ...a, claimed: true } : a)
      );
      await refreshUser();
    }
  };

  // 1) Filter by tab
  const filtered = achievements.filter(a => {
    if (filterKey === 'all') return true;
    const opt = filterOptions.find(o => o.key === filterKey);
    return opt?.criteria?.includes(a.criteria);
  });

  // 2) Split unclaimed vs claimed
  const unclaimed = filtered.filter(a => !a.claimed);
  const claimed   = filtered.filter(a => a.claimed);

  return (
    <div className="pt-24 px-6 pb-10 max-w-5xl mx-auto min-h-screen text-white">
      {/* --- user header --- */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg">👤 {user?.username}</div>
        <div className="text-lg">💰 {user?.balance ?? 0} coins</div>
      </div>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="w-7 h-7" /> Achievements
      </h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilterKey(opt.key)}
            className={`px-3 py-1 rounded-full border transition ${
              filterKey === opt.key
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Unclaimed Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Unclaimed</h2>
        {unclaimed.length
          ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {unclaimed.map(ach => {
                const style = typeStyles[ach.criteria] || typeStyles.other;
                return (
                  <motion.div
                    key={ach._id}
                    layout
                    initial={{ opacity:0, y:10 }}
                    animate={{ opacity:1, y:0 }}
                    className={`relative p-5 border rounded-lg ${style}`}
                  >
                    {/* Title & Icon */}
                    <div className="flex items-center space-x-2">
                      {ach.icon && <span className="text-2xl">{ach.icon}</span>}
                      <h3 className="text-lg font-semibold">{ach.title}</h3>
                    </div>

                    <p className="text-sm mt-1 text-gray-300">{ach.description}</p>

                    {/* Meta */}
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                      <span>Goal: {ach.threshold}</span>
                      <span>Reward: {ach.reward}</span>
                    </div>

                    {/* Progress */}
                    <div className="mt-2 bg-gray-700 rounded h-2 overflow-hidden">
                      <div
                        className="h-2 bg-green-400"
                        style={{ width: `${ach.progress}%` }}
                      />
                    </div>

                    {/* Claim button */}
                    {ach.complete && !ach.claimed && (
                      <button
                        onClick={() => handleClaim(ach._id, ach.reward, ach.title)}
                        className="mt-4 w-full py-1 text-sm font-medium bg-green-500 rounded hover:bg-green-600"
                      >
                        Claim
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          : <p className="text-gray-500">No unclaimed achievements.</p>
        }
      </section>

      {/* Claimed Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Claimed</h2>
        {claimed.length
          ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimed.map(ach => {
                const style = typeStyles[ach.criteria] || typeStyles.other;
                return (
                  <motion.div
                    key={ach._id}
                    layout
                    initial={{ opacity:0, y:10 }}
                    animate={{ opacity:1, y:0 }}
                    className={`relative p-5 border rounded-lg ${style} opacity-80`}
                  >
                    <CheckCircle className="absolute top-3 right-3 text-green-300" />

                    <div className="flex items-center space-x-2">
                      {ach.icon && <span className="text-2xl">{ach.icon}</span>}
                      <h3 className="text-lg font-semibold line-through">{ach.title}</h3>
                    </div>

                    <p className="text-sm mt-1 text-gray-400 italic">{ach.description}</p>

                    <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                      <span>Goal: {ach.threshold}</span>
                      <span>Reward: {ach.reward}</span>
                    </div>

                    <div className="mt-2 bg-gray-700 rounded h-2 overflow-hidden">
                      <div className="h-2 bg-gray-500" style={{ width: '100%' }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          : <p className="text-gray-500">No claimed achievements yet.</p>
        }
      </section>
    </div>
  );
}
