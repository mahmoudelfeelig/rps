import React, { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  BadgeCheck,
  Activity,
  XCircle,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { token, refreshUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [incomingTrades, setIncomingTrades] = useState([]);
  const [outgoingTrades, setOutgoingTrades] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [responseItems, setResponseItems] = useState({});
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [tradeRecipient, setTradeRecipient] = useState('');
  const [error, setError] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [sendUsername, setSendUsername] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const formattedInventory = (userData?.inventory || []).map(entry => {
    const raw = entry.item || {};
    return {
      _id: raw._id || 'unknown',
      name: raw.name || 'Unknown Item',
      image: raw.image
        ? raw.image.startsWith('http')
          ? raw.image
          : `${API_BASE}${raw.image}`
        : null,
      emoji: raw.emoji || '📦',
      price: raw.price || 0,
      quantity: entry.quantity ?? 1,
      effect: raw.effect || 'No effect',
    };
  });

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load user stats');
      setUserData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load trades');
      setIncomingTrades(data.incoming || []);
      setOutgoingTrades(data.outgoing || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTrade = async e => {
    e.preventDefault();
    try {
      const fromItems = Object.entries(selectedItems)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, quantity]) => ({ itemId, quantity }));
      const res = await fetch(`${API_BASE}/api/trades/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toUsername: tradeRecipient, fromItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Trade request failed');
      setOutgoingTrades(prev => [...prev, data.trade]);
      setSelectedItems({});
      setTradeRecipient('');
      await refreshUser();
      await fetchUserData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRespondToTrade = async (tradeId, action) => {
    try {
      const toItems = Object.entries(responseItems)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, qty]) => ({ itemId, quantity: qty }));
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toItems, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Response failed');
      setIncomingTrades(prev =>
        prev.map(t => (t._id === tradeId ? data.trade : t))
      );
      setResponseItems({});
      await refreshUser();
      await fetchUserData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFinalizeTrade = async tradeId => {
    try {
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}/finalize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Finalize failed');
      setOutgoingTrades(prev =>
        prev.map(t =>
          t._id === tradeId ? { ...t, status: 'accepted', toItems: data.trade.toItems } : t
        )
      );
      await refreshUser();
      await fetchUserData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelTrade = async tradeId => {
    try {
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancel failed');
      fetchTrades();
      await refreshUser();
      await fetchUserData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendMoney = async e => {
    e.preventDefault();
    if (!sendUsername || !sendAmount) {
      return toast.error('Enter recipient and amount');
    }
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/send-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientUsername: sendUsername,
          amount: sendAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Transfer failed');
      toast.success(`Sent ${sendAmount} coins to ${sendUsername}`);
      setSendUsername('');
      setSendAmount('');
      await refreshUser();
      await fetchUserData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleBadgeClick = badge => {
    setSelectedBadge(prev => (prev?.name === badge.name ? null : badge));
  };

  useEffect(() => {
    fetchUserData();
    fetchTrades();
  }, [token]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading your dashboard…
      </div>
    );
  }

  const lockedQuantities = {};
  [...incomingTrades, ...outgoingTrades].forEach(trade => {
    if (['pending', 'responded'].includes(trade.status)) {
      [...trade.fromItems, ...trade.toItems].forEach(({ item, quantity }) => {
        const id = item._id || item;
        if (!id) return;
        lockedQuantities[id] = (lockedQuantities[id] || 0) + quantity;
      });
    }
  });
  const getLocked = id => lockedQuantities[id] || 0;
  const isItemFullyLocked = (id, qty) => (lockedQuantities[id] || 0) >= qty;

  const activeBuffs = (userData.inventory || [])
    .filter(({ quantity, item }) =>
      quantity > 0 &&
      ['reward-multiplier','extra-safe-click','mine-reduction','slots-luck'].includes(item.effectType)
    )
    .map(({ item }) => ({
      effectType: item.effectType,
      effectValue: item.effectValue,
      expiresAt: null
    }));
  const buffLabel = b => {
    switch (b.effectType) {
      case 'reward-multiplier': return `Reward ×${b.effectValue}`;
      case 'extra-safe-click':   return `${b.effectValue} extra safe click`;
      case 'mine-reduction':     return `–${b.effectValue} mines`;
      case 'slots-luck':         return `+${b.effectValue}% slot luck`;
      default: return b.effectType;
    }
  };
  const formatRemaining = expiresAt => {
    if (!expiresAt) return '';
    const ms = new Date(expiresAt) - Date.now();
    if (ms <= 0) return '';
    const m = Math.floor(ms/60000), s = Math.floor((ms%60000)/1000);
    return ` (${m}m${s}s)`;
  };

  const filteredIncoming = activeOnly
    ? incomingTrades.filter(t => ['pending','responded'].includes(t.status))
    : incomingTrades;
  const filteredOutgoing = activeOnly
    ? outgoingTrades.filter(t => ['pending','responded'].includes(t.status))
    : outgoingTrades;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.14),_transparent_32%),linear-gradient(180deg,#04070f_0%,#09090b_50%,#020202_100%)] text-white pt-24 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {error && <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-100">{error}</div>}
        <section className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Dashboard</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {userData.username ? `Welcome back, ${userData.username}` : 'Your account hub'}
              </h1>
              <p className="mt-2 max-w-2xl text-white/65">
                Track trades, balances, inventory, and admin-linked activity from one place.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Balance</div>
              <div className="mt-1 text-2xl font-semibold">${userData.balance.toLocaleString()}</div>
            </div>
          </div>
        </section>
        {activeBuffs.length > 0 && (
          <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
            <h2 className="mb-2 text-lg font-semibold text-yellow-300">Active buffs</h2>
            <div className="flex flex-wrap gap-2">
              {activeBuffs.map(b => (
                <span
                  key={b.effectType}
                  className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-200"
                >
                  {buffLabel(b)}{formatRemaining(b.expiresAt)}
                </span>
              ))}
            </div>
          </section>
        )}
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-indigo-300">
            <PackageCheck className="w-6 h-6" /> Inventory
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {formattedInventory.map(item => (
              <div
                key={item._id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-indigo-400/30"
              >
                <div className="flex justify-center mb-2">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-3xl">{item.emoji}</span>
                  )}
                </div>
                <h3 className="text-center text-lg font-semibold">{item.name}</h3>
                <p className="text-center text-sm text-white/70">x{item.quantity}</p>
                {item.effect && (
                  <p className="text-center text-xs text-white/50 mt-1">
                    {item.effect}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-emerald-300">
            <BadgeCheck className="w-6 h-6" /> Send coins
          </h2>
          <form onSubmit={handleSendMoney} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-white/70 mb-1">Recipient</label>
              <input
                type="text"
                value={sendUsername}
                onChange={e => setSendUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-2 bg-white/10 text-white rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Amount</label>
              <input
                type="number"
                min="1"
                value={sendAmount}
                onChange={e => setSendAmount(e.target.value)}
                placeholder="0"
                className="w-24 p-2 bg-white/10 text-white rounded"
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              {isSending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-violet-300">
              <ArrowRightLeft className="w-6 h-6" /> Trade center
            </h2>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={() => setActiveOnly(!activeOnly)}
              />
              Show only active trades
            </label>
          </div>

          <form onSubmit={handleCreateTrade} className="space-y-4">
            <input
              value={tradeRecipient}
              onChange={e => setTradeRecipient(e.target.value)}
              placeholder="Recipient username"
              className="w-full p-2 bg-white/10 text-white rounded"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formattedInventory.map(({ _id, name, image, emoji, quantity }) => {
                const disabled = isItemFullyLocked(_id, quantity);
                return (
                  <div
                    key={_id}
                    className={`p-4 border rounded-lg relative ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <div className="mb-2">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="w-12 h-12 object-contain mx-auto"
                        />
                      ) : (
                        <div className="text-3xl text-center">{emoji}</div>
                      )}
                    </div>
                    <p className="text-center text-sm font-semibold">{name}</p>
                    <p className="text-center text-xs text-white/60">
                      Qty: {quantity}
                      {getLocked(_id) > 0 && (
                        <span className="ml-1 text-red-400">
                          ({getLocked(_id)} locked)
                        </span>
                      )}
                    </p>
                    <input
                      type="number"
                      min="0"
                      max={quantity}
                      disabled={disabled}
                      className="mt-2 w-full p-1 rounded bg-white/10 text-white text-sm"
                      value={selectedItems[_id] || 0}
                      onChange={e =>
                        setSelectedItems(prev => ({
                          ...prev,
                          [_id]: Math.min(Math.max(0, +e.target.value), quantity),
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
            >
              Initiate Trade
            </button>
          </form>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-xl font-semibold text-pink-300">
            Incoming trades
          </h3>
          {filteredIncoming.length === 0 ? (
            <p className="text-white/50 text-sm">No incoming trades</p>
          ) : (
            filteredIncoming.map(trade => (
              <div
                key={trade._id}
                className="bg-white/10 p-4 mb-4 rounded-lg border border-white/10 space-y-3"
              >
                <div className="text-sm text-white/70">
                  From:&nbsp;<strong>{trade.fromUser?.username || 'Unknown'}</strong>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {trade.fromItems.map(({ name, image, emoji, price, quantity }, idx) => (
                    <div key={idx} className="bg-white/5 p-2 rounded-lg text-sm">
                      {image ? (
                        <img
                          src={image.startsWith('http') ? image : `${API_BASE}${image}`}
                          alt={name}
                          className="w-8 h-8 mx-auto"
                        />
                      ) : (
                        <div className="text-2xl text-center">{emoji}</div>
                      )}
                      <p className="text-center">{name}</p>
                      <p className="text-center text-xs text-white/60">x{quantity}</p>
                      <p className="text-center text-xs text-white/40">${price}</p>
                    </div>
                  ))}
                </div>

                {trade.status === 'pending' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {formattedInventory.map(({ _id, name, image, emoji, quantity }) => {
                      const disabled = isItemFullyLocked(_id, quantity);
                      return (
                        <div key={_id} className={`border rounded-lg p-2 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
                          {image ? (
                            <img src={image} alt={name} className="w-10 h-10 mx-auto mb-1" />
                          ) : (
                            <div className="text-2xl text-center">{emoji}</div>
                          )}
                          <p className="text-center text-sm">{name}</p>
                          <input
                            type="number"
                            min="0"
                            max={quantity}
                            className="w-full mt-1 p-1 bg-white/10 text-white text-xs rounded"
                            value={responseItems[_id] || 0}
                            onChange={e =>
                              setResponseItems(prev => ({
                                ...prev,
                                [_id]: Math.min(Math.max(0, +e.target.value), quantity),
                              }))
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {trade.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleRespondToTrade(trade._id, 'accept')}
                        className="bg-green-600 px-3 py-1 rounded text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondToTrade(trade._id, 'deny')}
                        className="bg-red-600 px-3 py-1 rounded text-sm"
                      >
                        Deny
                      </button>
                    </>
                  )}
                  {['pending', 'responded'].includes(trade.status) && (
                    <button
                      onClick={() => handleCancelTrade(trade._id)}
                      className="bg-white/10 px-3 py-1 rounded text-sm text-red-300 flex items-center gap-1"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                  {['accepted', 'denied', 'canceled'].includes(trade.status) && (
                    <span className="italic text-white/60">Status: {trade.status}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-xl font-semibold text-sky-300">
            Outgoing trades
          </h3>
          {filteredOutgoing.length === 0 ? (
            <p className="text-white/50 text-sm">No outgoing trades</p>
          ) : (
            filteredOutgoing.map(trade => (
              <div
                key={trade._id}
                className="bg-white/10 p-4 mb-4 rounded-lg border border-white/10 space-y-3"
              >
                <div className="text-sm text-white/70">
                  To:&nbsp;<strong>{trade.toUser?.username || 'Unknown'}</strong>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {trade.fromItems.map(({ name, image, emoji, price, quantity }, idx) => (
                    <div key={idx} className="bg-white/5 p-2 rounded-lg text-sm">
                      {image ? (
                        <img
                          src={image.startsWith('http') ? image : `${API_BASE}${image}`}
                          alt={name}
                          className="w-8 h-8 mx-auto"
                        />
                      ) : (
                        <div className="text-2xl text-center">{emoji}</div>
                      )}
                      <p className="text-center">{name}</p>
                      <p className="text-center text-xs text-white/60">x{quantity}</p>
                      <p className="text-center text-xs text-white/40">${price}</p>
                    </div>
                  ))}
                </div>

                {['responded','accepted','denied','canceled'].includes(trade.status) && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-white/80">Their Response:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {trade.toItems.map(({ name, image, emoji, price, quantity }, idx) => (
                        <div key={idx} className="bg-white/5 p-2 rounded-lg text-sm">
                          {image ? (
                            <img
                              src={image.startsWith('http') ? image : `${API_BASE}${image}`}
                              alt={name}
                              className="w-8 h-8 mx-auto mb-1"
                            />
                          ) : (
                            <div className="text-2xl text-center">{emoji}</div>
                          )}
                          <p className="text-center">{name}</p>
                          <p className="text-center text-xs text-white/60">x{quantity}</p>
                          <p className="text-center text-xs text-white/40">${price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {trade.status === 'responded' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleFinalizeTrade(trade._id)}
                      className="bg-green-600 px-4 py-1 rounded text-sm"
                    >
                      Finalize
                    </button>
                    <button
                      onClick={() => handleCancelTrade(trade._id)}
                      className="bg-white/10 px-3 py-1 rounded text-sm text-red-300 flex items-center gap-1"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                )}

                {trade.status === 'pending' && (
                  <button
                    onClick={() => handleCancelTrade(trade._id)}
                    className="bg-white/10 px-3 py-1 rounded text-sm text-red-300 flex items-center gap-1"
                  >
                    <XCircle size={14} /> Cancel
                  </button>
                )}
                {['accepted','denied','canceled'].includes(trade.status) && (
                  <span className="italic text-white/60">Status: {trade.status}</span>
                )}
              </div>
            ))
          )}
        </section>
        <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6" /> Active Bets
          </h2>
          {userData.currentBets?.length > 0 ? (
            <div className="space-y-4">
              {userData.currentBets.map(bet => (
                <div key={bet._id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="font-semibold mb-1 text-white">{bet.title}</div>
                  <div className="space-y-1 text-sm text-white/80">
                    {bet.options.map(option => {
                      const yourPrediction = bet.predictions.find(
                        p => p.user === userData.userId && p.choice === option.text
                      );
                      return (
                        <div
                          key={option._id}
                          className={`flex items-center justify-between px-2 py-1 rounded ${yourPrediction ? 'bg-green-700/40' : 'bg-white/5'}`}
                        >
                          <span>{option.text}</span>
                          {yourPrediction && (
                            <span className="text-xs text-green-400">
                              You bet: ${yourPrediction.amount} ✔
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {bet.result ? `Final Result: ${bet.result}` : 'Pending...'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">You have no active bets.</p>
          )}
        </section>
        <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-pink-400 mb-4 flex items-center gap-2">
            <BadgeCheck className="w-6 h-6" /> Your Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {userData.badges.map(badge => {
              const unlocked = userData.badges.map(b => b.name).includes(badge.name);
              const isSelected = selectedBadge?.name === badge.name;
              return (
                <div
                  key={badge.name}
                  onClick={() => handleBadgeClick(badge)}
                  className={`
                    relative group bg-white/5 border border-white/10
                    rounded-xl p-4 cursor-pointer transition-transform hover:scale-105
                    ${unlocked ? 'text-white' : 'text-white/30'}
                    ${isSelected ? 'ring-2 ring-pink-500' : ''}
                  `}
                >
                  <div className="text-3xl mb-2">🏅</div>
                  <div className="font-medium">{badge.name}</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2
                    opacity-0 group-hover:opacity-100 text-xs text-white/80 bg-black/70
                    px-2 py-1 rounded-lg pointer-events-none">
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedBadge && (
            <div className="mt-6 bg-white/10 p-4 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold mb-1">{selectedBadge.name}</h3>
              <p className="text-sm">{selectedBadge.description}</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
