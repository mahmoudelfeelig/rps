import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';

const rarityTone = {
  common: 'from-slate-500 via-slate-300 to-slate-700',
  uncommon: 'from-emerald-500 via-lime-200 to-emerald-900',
  rare: 'from-sky-500 via-cyan-200 to-blue-900',
  epic: 'from-fuchsia-500 via-violet-200 to-indigo-950',
  legendary: 'from-amber-400 via-orange-200 to-yellow-900',
  mythic: 'from-rose-500 via-white to-cyan-400',
  anomaly: 'from-black via-red-400 to-white'
};

function CardFoil({ card }) {
  const tone = rarityTone[card.rarity] || rarityTone.common;
  return (
    <div className={`relative overflow-hidden rounded-[1.7rem] border border-white/20 bg-gradient-to-br ${tone} p-[1px] shadow-2xl`}>
      <div className="relative min-h-56 rounded-[1.65rem] bg-slate-950/88 p-4">
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_20%_10%,white,transparent_20%),linear-gradient(115deg,transparent_20%,rgba(255,255,255,.28),transparent_45%)]" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">{card.rarity}</div>
              <h3 className="mt-2 text-2xl font-black capitalize">{card.name}</h3>
            </div>
            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-bold">{card.tier}</div>
          </div>
          <div className="my-6 grid place-items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border border-white/25 bg-white/10 text-4xl font-black uppercase shadow-[0_0_45px_rgba(255,255,255,.22)]">
              {card.name?.slice(0, 2)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-black/35 p-2"><div className="text-white/45">LVL</div><b>{card.level}</b></div>
            <div className="rounded-2xl bg-black/35 p-2"><div className="text-white/45">PWR</div><b>{card.power}</b></div>
            <div className="rounded-2xl bg-black/35 p-2"><div className="text-white/45">COPY</div><b>{card.quantity}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EconomyHub() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState('');
  const [amount, setAmount] = useState('2500');
  const [guildName, setGuildName] = useState('');
  const [guildTag, setGuildTag] = useState('');

  const cards = useMemo(() => data?.cards || [], [data]);

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/economy`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load economy');
    setData(json);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    load().catch(err => toast.error(err.message));
  }, [load, token]);

  const post = async (path, body = {}) => {
    setBusy(path);
    try {
      const res = await fetch(`${API_BASE}/api/economy${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Action failed');
      toast.success(json.message || 'Updated');
      await load();
      return json;
    } catch (err) {
      toast.error(err.message);
      return null;
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="min-h-screen px-4 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200/50">Economy</p>
            <h1 className="mt-3 text-4xl font-black sm:text-6xl">Economy command room</h1>
            <p className="mt-4 max-w-2xl text-white/65">
              Cards, auctions, crafting, staking, loans, insurance, guilds, raids, and market events.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-5 py-4 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">League</div>
            <div className="text-3xl font-black">{data?.league || 'Bronze'}</div>
            <div className="text-sm text-white/55">{data?.balance ?? 0} coins</div>
          </div>
        </div>

        <div className="mb-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-4">
          <button disabled={busy} onClick={() => post('/cards/open-pack', { pack: 'standard' })} className="rounded-2xl bg-white/10 px-4 py-3 font-semibold hover:bg-white/15">Open Standard Pack</button>
          <button disabled={busy} onClick={() => post('/cards/open-pack', { pack: 'elite' })} className="rounded-2xl bg-cyan-400/15 px-4 py-3 font-semibold hover:bg-cyan-400/25">Open Elite Pack</button>
          <button disabled={busy} onClick={() => post('/craft')} className="rounded-2xl bg-fuchsia-400/15 px-4 py-3 font-semibold hover:bg-fuchsia-400/25">Craft Duplicates</button>
          <button disabled={busy} onClick={() => post('/events')} className="rounded-2xl bg-amber-400/15 px-4 py-3 font-semibold hover:bg-amber-400/25">Start Market Event</button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_.9fr]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">Trading cards</h2>
              <span className="text-sm text-white/50">{cards.length} owned</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.slice(0, 9).map((card, index) => (
                <motion.button
                  key={card._id}
                  type="button"
                  onClick={() => post('/cards/upgrade', { cardKey: card.cardKey })}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="text-left"
                >
                  <CardFoil card={card} />
                </motion.button>
              ))}
              {!cards.length && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white/60">
                  Open a pack to start collecting member cards.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Money systems</h2>
              <input value={amount} onChange={e => setAmount(e.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => post('/loans', { amount: Number(amount) })} className="rounded-2xl bg-white/10 px-3 py-2">Borrow</button>
                <button onClick={() => post('/insurance', { type: 'casino' })} className="rounded-2xl bg-white/10 px-3 py-2">Insure</button>
                <button onClick={() => post('/staking', { amount: Number(amount), days: 7 })} className="rounded-2xl bg-white/10 px-3 py-2">Stake</button>
                <button onClick={() => post('/raid/attack', { amount: Number(amount) })} className="rounded-2xl bg-white/10 px-3 py-2">Raid</button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Guild</h2>
              {data?.guild ? (
                <div className="mt-3 text-white/70">
                  <div className="text-2xl font-black">{data.guild.name}</div>
                  <div>{data.guild.tag} | Level {data.guild.level} | Treasury {data.guild.treasury}</div>
                  <button onClick={() => post('/guilds/contribute', { amount: Number(amount) })} className="mt-4 rounded-2xl bg-white/10 px-4 py-2">Contribute</button>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <input value={guildName} onChange={e => setGuildName(e.target.value)} placeholder="Guild name" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
                  <input value={guildTag} onChange={e => setGuildTag(e.target.value)} placeholder="TAG" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
                  <button onClick={() => post('/guilds', { name: guildName, tag: guildTag })} className="rounded-2xl bg-white/10 px-4 py-2">Create guild</button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold">Active board</h2>
              <div className="mt-3 space-y-2 text-sm text-white/65">
                {(data?.events || []).map(event => <div key={event._id}>{event.name} ends {new Date(event.endsAt).toLocaleTimeString()}</div>)}
                {data?.raid && (
                  <div className="rounded-2xl bg-black/20 p-3">
                    <div>Raid: {data.raid.name} | HP {data.raid.hp}/{data.raid.maxHp}</div>
                    {!data.raid.active && (
                      <button onClick={() => post(`/raid/${data.raid._id}/claim`)} className="mt-2 rounded-xl bg-emerald-400/15 px-3 py-1 text-white">Claim reward</button>
                    )}
                  </div>
                )}
                {(data?.loans || []).map(loan => (
                  <div key={loan._id} className="flex items-center justify-between gap-2 rounded-2xl bg-black/20 p-3">
                    <span>Loan due: {loan.outstanding}</span>
                    <button onClick={() => post(`/loans/${loan._id}/repay`)} className="rounded-xl bg-white/10 px-3 py-1 text-white">Repay</button>
                  </div>
                ))}
                {(data?.stakes || []).map(stake => (
                  <div key={stake._id} className="flex items-center justify-between gap-2 rounded-2xl bg-black/20 p-3">
                    <span>Stake: {stake.amount}</span>
                    <button onClick={() => post(`/staking/${stake._id}/claim`)} className="rounded-xl bg-white/10 px-3 py-1 text-white">Claim</button>
                  </div>
                ))}
                {(data?.auctions || []).slice(0, 3).map(auction => (
                  <div key={auction._id} className="rounded-2xl bg-black/20 p-3">
                    <div>{auction.title}: {auction.currentBid}</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => post(`/auctions/${auction._id}/bid`, { amount: Number(amount) })} className="rounded-xl bg-white/10 px-3 py-1 text-white">Bid</button>
                      <button onClick={() => post(`/auctions/${auction._id}/settle`)} className="rounded-xl bg-white/10 px-3 py-1 text-white">Settle</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
