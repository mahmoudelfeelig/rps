import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../api';
import { EmptyState, PageFrame, PageHero, StatCard } from '../../components/ui/page';

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

function AchievementIcon({ icon, title }) {
  if (!icon) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/55">
        <Trophy className="h-5 w-5" />
      </div>
    );
  }

  if (icon.startsWith('/') || icon.startsWith('http')) {
    const src = icon.startsWith('http') ? icon : `${API_BASE}${icon}`;
    return (
      <img
        src={src}
        alt={`${title} icon`}
        className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-black uppercase text-white/70">
      {icon.slice(0, 2)}
    </div>
  );
}

export default function Achievements() {
  const { user, token, refreshUser } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [filterKey,    setFilterKey]    = useState('all');
  const audio = new Audio('/assets/sounds/success.mp3');

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

  const filtered = achievements.filter(a => {
    if (filterKey === 'all') return true;
    const opt = filterOptions.find(o => o.key === filterKey);
    return opt?.criteria?.includes(a.criteria);
  });

  const unclaimed = filtered.filter(a => !a.claimed);
  const claimed   = filtered.filter(a => a.claimed);

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_18%_5%,rgba(245,158,11,0.13),transparent_32%),radial-gradient(circle_at_88%_2%,rgba(34,211,238,0.1),transparent_32%),linear-gradient(180deg,#04070f_0%,#09090b_55%,#020202_100%)]">
      <div className="mx-auto max-w-6xl">
      <PageHero
        title="Achievements"
        description="Long-term goals, claimable rewards, and profile markers."
        actions={(
          <>
            <StatCard label="Player" value={user?.username || 'Player'} tone="text-cyan-100" />
            <StatCard label="Balance" value={`${Number(user?.balance || 0).toLocaleString()} coins`} tone="text-amber-100" />
          </>
        )}
      />
      <div className="mb-6 flex flex-wrap gap-2 rounded-[28px] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl">
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilterKey(opt.key)}
            className={`px-3 py-1 rounded-full border transition ${
              filterKey === opt.key
                ? 'border-white/20 bg-white/15 text-white'
                : 'border-white/10 bg-black/20 text-white/55 hover:bg-white/10 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
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
                    <div className="flex items-center space-x-3">
                      <AchievementIcon icon={ach.icon} title={ach.title} />
                      <h3 className="text-lg font-semibold">{ach.title}</h3>
                    </div>

                    <p className="text-sm mt-1 text-gray-300">{ach.description}</p>
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                      <span>Goal: {ach.threshold}</span>
                      <span>Reward: {ach.reward}</span>
                    </div>
                    <div className="mt-2 bg-gray-700 rounded h-2 overflow-hidden">
                      <div
                        className="h-2 bg-green-400"
                        style={{ width: `${ach.progress}%` }}
                      />
                    </div>
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
          : <EmptyState title="No unclaimed achievements" description="Completed claimable achievements will appear here." />
        }
      </section>
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

                    <div className="flex items-center space-x-3">
                      <AchievementIcon icon={ach.icon} title={ach.title} />
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
          : <EmptyState title="No claimed achievements" description="Claim an achievement to build your profile history." />
        }
      </section>
      </div>
    </PageFrame>
  );
}
