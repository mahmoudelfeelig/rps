import React, { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeDollarSign,
  RefreshCcw,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { EmptyState, PageFrame, PageHero, RiskBadge, StatCard } from '../../components/ui/page';

const CATEGORY_TONE = {
  stock: 'from-sky-500/20 to-cyan-500/10',
  crypto: 'from-violet-500/20 to-fuchsia-500/10',
  option: 'from-amber-500/20 to-orange-500/10',
  'rps-member': 'from-emerald-500/20 to-lime-500/10'
};

const ART_PALETTE = {
  stock: ['#0ea5e9', '#67e8f9', '#0f172a'],
  crypto: ['#8b5cf6', '#f0abfc', '#111827'],
  option: ['#f59e0b', '#fde68a', '#1f1300'],
  'rps-member': ['#10b981', '#bef264', '#052e1a']
};

const formatPercent = (value) => `${((Number(value) || 0) * 100).toFixed(1)}%`;
const formatMultiplier = (value) => `${Number(value || 1).toFixed(1)}x`;

function assetArtworkSrc(asset) {
  if (asset.logoUrl || asset.image) return asset.logoUrl || asset.image;
  const [a, b, c] = ART_PALETTE[asset.category] || ART_PALETTE.stock;
  const symbol = String(asset.symbol || '?').slice(0, 9);
  const category = String(asset.category || 'asset').replace('-', ' ').toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${a}"/>
          <stop offset="58%" stop-color="${b}"/>
          <stop offset="100%" stop-color="${c}"/>
        </linearGradient>
        <radialGradient id="r" cx="68%" cy="20%" r="65%">
          <stop offset="0%" stop-color="white" stop-opacity=".65"/>
          <stop offset="100%" stop-color="white" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="320" height="220" rx="34" fill="url(#g)"/>
      <circle cx="255" cy="38" r="110" fill="url(#r)"/>
      <path d="M0 166 C58 126 92 196 151 154 C205 116 238 126 320 78 L320 220 L0 220Z" fill="rgba(2,6,23,.38)"/>
      <path d="M42 142 L90 102 L129 126 L177 76 L228 96 L279 44" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="279" cy="44" r="11" fill="white" fill-opacity=".9"/>
      <text x="28" y="67" fill="white" font-family="Inter,Arial,sans-serif" font-size="19" font-weight="800" letter-spacing="4">${category}</text>
      <text x="28" y="118" fill="white" font-family="Inter,Arial,sans-serif" font-size="44" font-weight="900" letter-spacing="1">${symbol}</text>
      <text x="28" y="187" fill="rgba(255,255,255,.74)" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="700">RPS MARKET CARD</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function Sparkline({ history = [], currentPrice }) {
  const points = (Array.isArray(history) ? history : [])
    .map(point => Number(point.price))
    .filter(value => Number.isFinite(value) && value > 0);
  const values = points.length >= 2 ? points : [Number(currentPrice) || 0, Number(currentPrice) || 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(1, max - min);
  const path = values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
    const y = 42 - ((value - min) / spread) * 34;
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
  const trend = values[values.length - 1] - values[0];

  return (
    <div className="rounded-[22px] border border-white/10 bg-black/18 p-3">
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/42">
        <span>{points.length >= 2 ? `${points.length} ticks` : 'Awaiting ticks'}</span>
        <span className={trend >= 0 ? 'text-emerald-200' : 'text-rose-200'}>
          {trend >= 0 ? '+' : ''}{Math.round(trend)}
        </span>
      </div>
      <svg viewBox="0 0 100 48" className="h-20 w-full overflow-visible">
        <path d="M 0 45 L 100 45" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d={path} fill="none" stroke={trend >= 0 ? '#6ee7b7' : '#fb7185'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function AssetArt({ asset }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-[26px] border border-white/10 bg-black/20 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:h-40 lg:w-52">
      <img
        src={assetArtworkSrc(asset)}
        alt={`${asset.name} market card`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/5" />
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/60">{asset.category?.replace('-', ' ')}</div>
          <div className="text-xl font-black text-white drop-shadow">{asset.symbol}</div>
        </div>
        <div className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
          {Number(asset.currentPrice || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function Market() {
  const { token, refreshUser, user } = useAuth();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const loadMarket = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/markets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load market');
      setMarket(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  const portfolio = market?.portfolio || [];
  const assets = market?.assets || [];
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    const haystack = `${asset.symbol} ${asset.name} ${asset.description} ${asset.category}`.toLowerCase();
    return matchesCategory && haystack.includes(deferredQuery.trim().toLowerCase());
  });
  const marketCategories = ['all', ...Array.from(new Set(assets.map(asset => asset.category).filter(Boolean)))];
  const totalGainLoss = portfolio.reduce((sum, position) => sum + Number(position.gainLoss || 0), 0);

  const submitTrade = async (symbol, side) => {
    const quantity = Math.max(1, Number(amounts[symbol]) || 1);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/markets/${side}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol, quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Trade failed');
      setMarket(prev => ({
        ...prev,
        balance: data.balance,
        portfolio: data.portfolio,
        portfolioValue: data.portfolioValue
      }));
      await refreshUser();
      toast.success(side === 'buy' ? 'Position added.' : 'Position sold.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const claimDividends = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/markets/dividends`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to claim dividends');
      setMarket(prev => ({
        ...prev,
        balance: data.balance,
        portfolio: data.portfolio,
        portfolioValue: data.portfolioValue
      }));
      await refreshUser();
      toast.success(data.dividendTotal ? `Collected ${data.dividendTotal} in dividends.` : 'No dividends available yet.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const prestige = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/markets/prestige`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Prestige failed');
      setMarket(prev => ({
        ...prev,
        balance: data.balance,
        prestigeLevel: data.prestigeLevel,
        prestigeMultiplier: data.prestigeMultiplier,
        nextThreshold: data.nextThreshold,
        nextMultiplier: data.nextMultiplier,
        threshold: data.nextThreshold,
        canPrestige: false,
        portfolio: [],
        portfolioValue: 0
      }));
      await refreshUser();
      toast.success('Prestige complete.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <PageFrame>
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">Loading market…</div>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_18%_4%,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_92%_2%,rgba(16,185,129,0.11),transparent_30%),linear-gradient(180deg,#04070f_0%,#09090b_55%,#020202_100%)]">
      <div className="space-y-6">
        <PageHero
          title="Market floor"
          description="Stocks, crypto, options, and RPS member assets move with game performance. Use filters to find the right risk profile before you trade."
          actions={
            <>
              <StatCard label="Balance" value={(market?.balance ?? user?.balance ?? 0).toLocaleString()} tone="text-cyan-100" />
              <StatCard label="Portfolio" value={(market?.portfolioValue ?? 0).toLocaleString()} tone="text-emerald-100" />
              <StatCard label="P/L" value={`${totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}`} tone={totalGainLoss >= 0 ? 'text-emerald-100' : 'text-rose-100'} />
              <StatCard label="Prestige" value={`Lv ${market?.prestigeLevel ?? 0} · ${formatMultiplier(market?.prestigeMultiplier)}`} tone="text-amber-100" />
            </>
          }
        />

        <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadMarket}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/85 transition hover:bg-white/14"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={claimDividends}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-400/15 disabled:opacity-50"
            >
              <BadgeDollarSign size={16} />
              Claim dividends
            </button>
            <button
              type="button"
              onClick={prestige}
              disabled={busy || !market?.canPrestige}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-400/15 disabled:opacity-40"
            >
              <ShieldAlert size={16} />
              Prestige reset
            </button>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/55">
              Next prestige {Number(market?.nextThreshold ?? market?.threshold ?? 500000).toLocaleString()} · {formatMultiplier(market?.nextMultiplier)}
            </span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets, symbols, or descriptions"
              className="input px-4 py-3 outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {marketCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                    categoryFilter === category
                      ? 'border-cyan-200/35 bg-cyan-300/14 text-cyan-50'
                      : 'border-white/10 bg-black/20 text-white/62 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {category.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-4">
            {filteredAssets.map((asset, index) => (
              <motion.article
                key={asset.symbol}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group rounded-[28px] border border-white/10 bg-gradient-to-br ${CATEGORY_TONE[asset.category] || 'from-white/10 to-white/5'} p-5 shadow-xl backdrop-blur`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <AssetArt asset={asset} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        {asset.symbol}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/65">
                        {asset.category}
                      </span>
                      <RiskBadge value={asset.risk} />
                      {asset.linkedTo && (
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/65">
                          linked to {asset.linkedTo}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold">{asset.name}</h2>
                    <p className="max-w-2xl text-sm text-white/70">{asset.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-white/75">
                      <span className="inline-flex items-center gap-2">
                        <TrendingUp size={16} /> {asset.currentPrice} coins
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <ArrowUpRight size={16} /> risk {formatPercent(asset.risk)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <ArrowDownLeft size={16} /> dividend {formatPercent(asset.dividendYield)}
                      </span>
                      {asset.externalUpdatedAt && (
                        <span className="inline-flex items-center gap-2 text-white/55">
                          External {asset.externalPrice ? Number(asset.externalPrice).toLocaleString() : 'n/a'} · {new Date(asset.externalUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid w-full gap-4 lg:w-[460px] lg:grid-cols-[1fr_240px]">
                  <Sparkline history={asset.priceHistory} currentPrice={asset.currentPrice} />
                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/45">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={amounts[asset.symbol] || 1}
                      onChange={(e) => setAmounts(prev => ({ ...prev, [asset.symbol]: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none focus:border-white/20"
                    />
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => submitTrade(asset.symbol, 'buy')}
                        className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => submitTrade(asset.symbol, 'sell')}
                        className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:opacity-50"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Holdings</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-white/45">{portfolio.length} positions</span>
              </div>
              <div className="mt-4 space-y-3">
                {portfolio.length ? portfolio.map(position => (
                  <div key={position.symbol} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{position.name}</div>
                        <div className="text-xs uppercase tracking-[0.25em] text-white/45">{position.symbol}</div>
                      </div>
                      <div className={`text-sm font-semibold ${position.gainLoss >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {position.gainLoss >= 0 ? '+' : ''}{position.gainLoss}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-white/70">
                      <div>Qty {position.quantity}</div>
                      <div>Avg {Math.round(position.avgPrice).toLocaleString()}</div>
                      <div>Now {Number(position.currentPrice || 0).toLocaleString()}</div>
                      <div>Value {Number(position.currentValue || 0).toLocaleString()}</div>
                    </div>
                  </div>
                )) : <EmptyState title="No positions yet" description="Buy a stock, crypto asset, option, or member asset to start building exposure." />}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold">How it moves</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>RPS member assets react to match outcomes.</li>
                <li>Higher-risk assets swing harder but can pay off faster.</li>
                <li>Dividends can be claimed once per day.</li>
                <li>Prestige resets cash and holdings, then raises future rewards.</li>
              </ul>
            </div>
          </aside>
        </div>
        {!filteredAssets.length && (
          <EmptyState title="No assets match" description="Clear the search or switch categories." />
        )}
      </div>
    </PageFrame>
  );
}
