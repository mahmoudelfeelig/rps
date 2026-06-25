import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { ActionButton, EmptyState, PageFrame, PageHero, SectionHeader, StatCard } from '../../components/ui/page';
import GachaRevealModal from './GachaRevealModal';

const RARITY_TONE = {
  Mythical: 'text-rose-200 bg-rose-400/10 border-rose-200/20',
  Legendary: 'text-amber-100 bg-amber-400/10 border-amber-200/20',
  Rare: 'text-cyan-100 bg-cyan-400/10 border-cyan-200/20',
  Uncommon: 'text-emerald-100 bg-emerald-400/10 border-emerald-200/20',
  Common: 'text-slate-200 bg-slate-400/10 border-slate-200/15'
};

const PACK_GRADIENTS = {
  starter: ['#94a3b8', '#22c55e', '#020617'],
  budget: ['#60a5fa', '#c084fc', '#0f172a'],
  common: ['#38bdf8', '#a7f3d0', '#082f49'],
  daily: ['#fbbf24', '#fb7185', '#1e1b4b'],
  standard: ['#f472b6', '#8b5cf6', '#111827'],
  elemental: ['#22d3ee', '#f97316', '#0f172a'],
  rare: ['#60a5fa', '#2563eb', '#020617'],
  epic: ['#e879f9', '#7c3aed', '#111827'],
  legendary: ['#facc15', '#f97316', '#120a02'],
  mythic: ['#fb7185', '#e0f2fe', '#1e1b4b'],
  premium: ['#f8fafc', '#f59e0b', '#020617']
};

function packArtSrc(key) {
  const [a, b, c] = PACK_GRADIENTS[key] || PACK_GRADIENTS.standard;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 420">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="0.52" stop-color="${b}"/>
          <stop offset="1" stop-color="${c}"/>
        </linearGradient>
        <radialGradient id="shine" cx=".35" cy=".2" r=".8">
          <stop offset="0" stop-color="#fff" stop-opacity=".85"/>
          <stop offset=".28" stop-color="#fff" stop-opacity=".16"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="520" height="420" rx="42" fill="#020617"/>
      <path d="M95 68h330l42 72-38 216H91L53 140z" fill="url(#g)" opacity=".92"/>
      <path d="M95 68h330l42 72H53z" fill="#fff" opacity=".18"/>
      <path d="M120 154h280l-23 160H143z" fill="#020617" opacity=".42"/>
      <circle cx="260" cy="230" r="74" fill="url(#shine)"/>
      <path d="M260 116l29 75 79 6-61 50 19 77-66-42-66 42 19-77-61-50 79-6z" fill="#fff" opacity=".88"/>
      <path d="M80 352c82 28 277 29 360 0" fill="none" stroke="#fff" stroke-opacity=".26" stroke-width="12" stroke-linecap="round"/>
      <circle cx="112" cy="112" r="8" fill="#fff" opacity=".55"/>
      <circle cx="423" cy="118" r="6" fill="#fff" opacity=".4"/>
      <circle cx="404" cy="292" r="10" fill="#fff" opacity=".3"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function formatOdds(odds) {
  return `${(Number(odds || 0) * 100).toFixed(1)}%`;
}

export default function GachaPage() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [pools, setPools] = useState({});
  const [pity, setPity] = useState({});
  const [spinning, setSpinning] = useState('');
  const [reveal, setReveal] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [pRes, uRes] = await Promise.all([
          axios.get(`${API_BASE}/api/gacha/pools`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setPools(pRes.data);
        setBalance(uRes.data.balance || 0);
        setPity(Object.fromEntries(
          Object.entries(pRes.data).map(([key, value]) => [key, value.pityCount || 0])
        ));
      } catch {
        toast.error('Failed to load packs', { position: 'bottom-right' });
      }
    })();
  }, [token]);

  const poolEntries = useMemo(() => Object.entries(pools), [pools]);
  const cheapestPack = poolEntries.reduce((min, [, cfg]) => Math.min(min, cfg.cost || Infinity), Infinity);

  const doSpin = async (key, qty) => {
    if (spinning) return;
    setSpinning(`${key}-${qty}`);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/gacha/spin`,
        { pool: key, count: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(data.newBalance);
      setPity(prev => ({ ...prev, [key]: data.pityCount }));
      setReveal({
        pack: pools[key]?.title || key,
        items: data.results.map(result => ({
          species: result.species,
          variant: result.variant,
          rarity: result.rarity,
          traits: result.traits || {},
          type: result.type,
          shards: result.shards
        }))
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not open pack', { position: 'bottom-right' });
    } finally {
      setSpinning('');
    }
  };

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_15%_0%,rgba(244,114,182,0.16),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#030712_0%,#09090b_55%,#020202_100%)]">
      <PageHero
        meta="Critter packs"
        title="Gacha vault"
        description="Open themed packs, build your sanctuary roster, and use pity progress to chase higher-rarity critters."
        actions={(
          <>
            <StatCard label="Balance" value={`${Number(balance).toLocaleString()} coins`} tone="text-amber-100" />
            <StatCard label="Packs" value={poolEntries.length} tone="text-cyan-100" />
            <StatCard label="Starting at" value={`${Number.isFinite(cheapestPack) ? cheapestPack.toLocaleString() : 0}`} tone="text-emerald-100" />
          </>
        )}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/games/virtual-pet" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
          Sanctuary
        </Link>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/55">
          Pity guarantees the highest rarity available in that pack at 100 opens.
        </div>
      </div>

      <SectionHeader
        title="Available packs"
        description="Each pack uses server-side odds. Higher-priced packs reduce filler pulls and push harder toward rare traits."
      />

      {poolEntries.length === 0 ? (
        <EmptyState title="No packs available" description="Gacha packs could not be loaded from the server." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {poolEntries.map(([key, cfg], index) => {
            const pityCount = pity[key] || 0;
            const singleDisabled = Boolean(spinning) || balance < cfg.cost;
            const multiDisabled = Boolean(spinning) || balance < cfg.cost * 10;
            return (
              <motion.article
                key={key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035 }}
                className="interactive-lift overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.055] shadow-2xl backdrop-blur-xl"
              >
                <div className="relative h-44 overflow-hidden bg-black/30">
                  <img src={packArtSrc(key)} alt={`${cfg.title || key} artwork`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/55 backdrop-blur">
                        <Ticket className="h-3.5 w-3.5" />
                        {key}
                      </div>
                      <h3 className="text-2xl font-black">{cfg.title || `${key} Banner`}</h3>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-right backdrop-blur">
                      <div className="text-xs uppercase tracking-[0.18em] text-white/40">Cost</div>
                      <div className="font-black text-amber-100">{Number(cfg.cost).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid grid-cols-2 gap-2">
                    <ActionButton disabled={singleDisabled} onClick={() => doSpin(key, 1)} variant="rose">
                      {spinning === `${key}-1` ? 'Opening' : 'Open 1'}
                    </ActionButton>
                    <ActionButton disabled={multiDisabled} onClick={() => doSpin(key, 10)} variant="cyan">
                      {spinning === `${key}-10` ? 'Opening' : 'Open 10'}
                    </ActionButton>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(cfg.odds)
                      .sort((a, b) => b[1] - a[1])
                      .map(([rarity, odds]) => (
                        <div key={rarity} className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${RARITY_TONE[rarity] || RARITY_TONE.Common}`}>
                          <span className="font-semibold">{rarity}</span>
                          <span>{formatOdds(odds)}</span>
                        </div>
                      ))}
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.2em] text-white/40">
                      <span>Pity</span>
                      <span>{pityCount}/100</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-white to-rose-200"
                        initial={false}
                        animate={{ width: `${Math.min(100, pityCount)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {reveal && (
        <GachaRevealModal
          pack={reveal.pack}
          items={reveal.items}
          onClose={() => setReveal(null)}
        />
      )}
    </PageFrame>
  );
}
