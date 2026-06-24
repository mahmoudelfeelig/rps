import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Bomb, Brain, CircleDollarSign, Crown, Gamepad2, Hand, Landmark, MousePointerClick, Package, PawPrint, ShieldQuestion, Sparkles, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { PageFrame, PageHero, StatCard } from '../../components/ui/page';

const games = [
  {
    slug: 'spinner',
    name: 'Spinner',
    title: 'Timed reward bursts',
    icon: CircleDollarSign,
    tone: 'from-cyan-500/20 to-blue-500/10'
  },
  {
    slug: 'minefield',
    name: 'Minefield',
    title: 'Risk, reveal, cash out',
    icon: Bomb,
    tone: 'from-orange-500/20 to-red-500/10'
  },
  {
    slug: 'casino',
    name: 'Casino',
    title: 'Blackjack, slots, roulette, coin flip, and quick casino bets',
    icon: Landmark,
    tone: 'from-emerald-500/20 to-teal-500/10'
  },
  {
    slug: 'advanced-arcade',
    name: 'Advanced Arcade',
    title: 'Crash, dice duel, higher/lower, and bot race',
    icon: Gamepad2,
    tone: 'from-amber-500/20 to-rose-500/10'
  },
  {
    slug: 'market',
    name: 'Market',
    title: 'Stocks, crypto, options, and prestige',
    icon: Crown,
    tone: 'from-sky-500/20 to-indigo-500/10',
    to: '/market'
  },
  {
    slug: 'economy',
    name: 'Economy Hub',
    title: 'Cards, auctions, crafting, guilds, raids, loans, and staking',
    icon: Landmark,
    tone: 'from-yellow-500/20 to-cyan-500/10',
    to: '/economy'
  },
  {
    slug: 'click-frenzy',
    name: 'Click Frenzy',
    title: 'Fast hands, short windows',
    icon: MousePointerClick,
    tone: 'from-fuchsia-500/20 to-pink-500/10'
  },
  {
    slug: 'rps',
    name: 'RPS Arena',
    title: 'Challenge players or bots',
    icon: Hand,
    tone: 'from-violet-500/20 to-indigo-500/10'
  },
  {
    slug: 'puzzle-rush',
    name: 'Puzzle Rush',
    title: 'Daily brain runs',
    icon: Brain,
    tone: 'from-sky-500/20 to-cyan-500/10'
  },
  {
    slug: 'virtual-pet',
    name: 'Pet Sanctuary',
    title: 'Care, feed, train, and play critter mini-games',
    icon: PawPrint,
    tone: 'from-lime-500/20 to-emerald-500/10'
  },
  {
    slug: 'virtual-pet-gacha',
    name: 'Critter Gacha',
    title: 'Open packs and collect rarer critters',
    icon: Sparkles,
    tone: 'from-purple-500/20 to-fuchsia-500/10',
    to: '/games/virtual-pet/gacha'
  },
  {
    slug: 'virtual-pet-shop',
    name: 'Pet Shop',
    title: 'Buy food, toys, shards, cosmetics, and pets',
    icon: Store,
    tone: 'from-rose-500/20 to-orange-500/10',
    to: '/games/virtual-pet/shop'
  },
  {
    slug: 'virtual-pet-breeding',
    name: 'Breeding Lab',
    title: 'Pair critters and hatch new generations',
    icon: ShieldQuestion,
    tone: 'from-teal-500/20 to-lime-500/10',
    to: '/games/virtual-pet/breeding'
  },
  {
    slug: 'store',
    name: 'Store',
    title: 'Power-ups, boosts, and cosmetics',
    icon: Package,
    tone: 'from-slate-400/20 to-blue-500/10',
    to: '/store'
  },
  {
    slug: 'services',
    name: 'Services',
    title: 'Player-created services and paid requests',
    icon: BadgeCheck,
    tone: 'from-indigo-500/20 to-violet-500/10',
    to: '/services'
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
    <PageFrame className="bg-[radial-gradient(circle_at_18%_6%,rgba(168,85,247,0.16),transparent_32%),radial-gradient(circle_at_86%_0%,rgba(20,184,166,0.12),transparent_32%),linear-gradient(180deg,#050816_0%,#09090b_55%,#020202_100%)]">
      <div className="mx-auto max-w-6xl">
        <PageHero
          title="Arcade library"
          description="Each mode has a different rhythm, payoff curve, and risk profile. Core games, economy systems, and pet systems stay visible from one place."
          actions={<StatCard label="Available" value={unlocked.size || games.length} tone="text-cyan-100" />}
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((game, index) => {
            const alwaysOpen = ['market', 'economy', 'advanced-arcade', 'store', 'services'].includes(game.slug) || game.slug.startsWith('virtual-pet');
            const isUnlocked = unlocked.size === 0 ? true : unlocked.has(game.slug) || alwaysOpen;
            const Icon = game.icon;

            return (
              <motion.button
                key={game.slug}
                type="button"
                onClick={() => isUnlocked && navigate(game.to || `/games/${game.slug}`)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -6, rotate: -0.3 }}
                className={`group rounded-3xl border p-5 text-left shadow-xl transition duration-300 ${
                  isUnlocked
                    ? `border-white/10 bg-gradient-to-br ${game.tone} hover:border-white/20`
                    : 'pointer-events-none border-white/5 bg-white/5 opacity-45'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/85">
                      <Icon size={24} />
                    </div>
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
    </PageFrame>
  );
}
