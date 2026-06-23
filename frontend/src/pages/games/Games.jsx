import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';

const games = [
  {
    slug: 'spinner',
    name: 'Spinner',
    title: 'Timed reward bursts',
    icon: '🎰',
    tone: 'from-cyan-500/20 to-blue-500/10'
  },
  {
    slug: 'minefield',
    name: 'Minefield',
    title: 'Risk, reveal, cash out',
    icon: '💣',
    tone: 'from-orange-500/20 to-red-500/10'
  },
  {
    slug: 'casino',
    name: 'Casino',
    title: 'Fast luck hits',
    icon: '🃏',
    tone: 'from-emerald-500/20 to-teal-500/10'
  },
  {
    slug: 'market',
    name: 'Market',
    title: 'Stocks, crypto, options, and prestige',
    icon: '📈',
    tone: 'from-sky-500/20 to-indigo-500/10',
    to: '/market'
  },
  {
    slug: 'click-frenzy',
    name: 'Click Frenzy',
    title: 'Fast hands, short windows',
    icon: '⚡',
    tone: 'from-fuchsia-500/20 to-pink-500/10'
  },
  {
    slug: 'rps',
    name: 'RPS Arena',
    title: 'Challenge players or bots',
    icon: '✊',
    tone: 'from-violet-500/20 to-indigo-500/10'
  },
  {
    slug: 'puzzle-rush',
    name: 'Puzzle Rush',
    title: 'Daily brain runs',
    icon: '🧩',
    tone: 'from-sky-500/20 to-cyan-500/10'
  },
  {
    slug: 'virtual-pet',
    name: 'Pet Sanctuary',
    title: 'Critters, gacha, breeding, and mini-games',
    icon: '🐾',
    tone: 'from-lime-500/20 to-emerald-500/10'
  }
];

export default function Games() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(new Set());

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/games/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setUnlocked(new Set(data.unlockedGames || [])))
      .catch(() => setUnlocked(new Set()));
  }, [token]);

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 text-white bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_35%),linear-gradient(180deg,#050816_0%,#09090b_55%,#020202_100%)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Arcade</p>
            <h1 className="text-4xl font-black text-white sm:text-5xl">Arcade library</h1>
            <p className="mt-3 max-w-2xl text-white/70">
              Each mode has a different rhythm, payoff curve, and risk profile.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">Available</div>
            <div className="text-2xl font-semibold">{unlocked.size || games.length}</div>
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((game, index) => {
            const isUnlocked = unlocked.size === 0 ? true : unlocked.has(game.slug) || game.slug === 'market';

            return (
              <motion.button
                key={game.slug}
                type="button"
                onClick={() => isUnlocked && navigate(game.to || `/games/${game.slug}`)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -6, rotate: -0.3 }}
                className={`group text-left rounded-3xl border p-5 transition shadow-xl ${
                  isUnlocked
                    ? `border-white/10 bg-gradient-to-br ${game.tone} hover:border-white/20`
                    : 'pointer-events-none border-white/5 bg-white/5 opacity-45'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-4xl mb-4">{game.icon}</div>
                    <h2 className="text-2xl font-semibold">{game.name}</h2>
                    <p className="mt-2 text-sm text-white/70">{game.title}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
                    {isUnlocked ? 'Open' : 'Locked'}
                  </span>
                </div>
                <div className="mt-6 h-px w-full bg-white/10" />
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/45">
                  <span>Play now</span>
                  <span className="group-hover:text-white transition">→</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
