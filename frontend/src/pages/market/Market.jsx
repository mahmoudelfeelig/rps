import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeDollarSign,
  Banknote,
  CandlestickChart,
  Crown,
  RefreshCcw,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';

const CATEGORY_TONE = {
  stock: 'from-sky-500/20 to-cyan-500/10',
  crypto: 'from-violet-500/20 to-fuchsia-500/10',
  option: 'from-amber-500/20 to-orange-500/10',
  'rps-member': 'from-emerald-500/20 to-lime-500/10'
};

export default function Market() {
  const { token, refreshUser, user } = useAuth();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [amounts, setAmounts] = useState({});

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
      <div className="min-h-screen pt-28 px-4 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">Loading market…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 px-4 sm:px-6 lg:px-8 text-white bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),linear-gradient(180deg,#04070f_0%,#09090b_55%,#020202_100%)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Economy</p>
              <h1 className="mt-2 text-4xl sm:text-5xl font-black">Market floor</h1>
              <p className="mt-3 max-w-3xl text-white/65">
                Stocks, crypto, and options move with game performance. RPS members become tradable assets, so wins and losses actually push the numbers around.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <StatPill icon={Banknote} label="Balance" value={market?.balance ?? user?.balance ?? 0} />
              <StatPill icon={CandlestickChart} label="Portfolio" value={market?.portfolioValue ?? 0} />
              <StatPill icon={Crown} label="Prestige" value={`Lv ${market?.prestigeLevel ?? 0}`} />
            </div>
          </div>
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
              Threshold {market?.threshold?.toLocaleString?.() ?? '250,000'}
            </span>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <motion.article
                key={asset.symbol}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${CATEGORY_TONE[asset.category] || 'from-white/10 to-white/5'} p-5 shadow-xl backdrop-blur`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                        {asset.symbol}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/65">
                        {asset.category}
                      </span>
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
                        <ArrowUpRight size={16} /> risk {Math.round((asset.risk || 0) * 100)}%
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <ArrowDownLeft size={16} /> dividend {(asset.dividendYield || 0) * 100}%
                      </span>
                    </div>
                  </div>

                  <div className="min-w-[240px] rounded-[24px] border border-white/10 bg-black/20 p-4">
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
                      <div>Avg {Math.round(position.avgPrice)}</div>
                      <div>Now {position.currentPrice}</div>
                      <div>Value {position.currentValue}</div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/50">
                    No positions yet. Buy a stock, crypto asset, or option to start building exposure.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold">How it moves</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>• RPS member assets react to match outcomes.</li>
                <li>• Higher-risk assets swing harder but can pay off faster.</li>
                <li>• Dividends can be claimed once per day.</li>
                <li>• Prestige resets cash and holdings, then raises future rewards.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
