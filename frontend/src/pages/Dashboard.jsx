import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRightLeft, BadgeCheck, Activity, XCircle } from 'lucide-react';
import { API_BASE } from '../api';

export default function Dashboard() {
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [incomingTrades, setIncomingTrades] = useState([]);
  const [outgoingTrades, setOutgoingTrades] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [responseItems, setResponseItems] = useState({});
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [tradeRecipient, setTradeRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [error, setError] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);

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

  const formattedInventory = (userData?.inventory || []).map(entry => {
    const raw = entry.item || {};
    return {
      _id: raw._id || 'unknown',
      name: raw.name || 'Unknown Item',
      image: raw.image ? `/assets/rps/${raw.image}` : null,
      emoji: raw.emoji || '📦',
      price: raw.price || 0,
      quantity: entry.quantity ?? 1
    };
  });

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
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRespondToTrade = async (tradeId, action) => {
    try {
      const toItems = Object.entries(responseItems)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId: itemId, quantity: qty }));
    

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
      setIncomingTrades(prev => prev.map(t => t._id === tradeId ? data.trade : t));
      setResponseItems({});
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
    } catch (err) {
      setError(err.message);
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

  const allBadges = [
    { name: 'High Roller', description: 'Awarded for maintaining a high balance over time.' },
    { name: 'Newbie', description: 'Given to all new users. Welcome aboard!' },
    { name: 'Lucky Streak', description: 'You’ve won 5+ bets. Luck is real.' },
    { name: 'Shopaholic', description: 'Buy 3+ items from the store.' },
    { name: 'Overachiever', description: 'Complete 10+ tasks.' },
    { name: 'Veteran', description: 'Login 30+ times.' },
  ];

  const unlockedNames = userData?.badges?.map(b => b.name) || [];
  const lockedQuantities = {};
  [...incomingTrades, ...outgoingTrades].forEach(trade => {
    if (['pending', 'responded'].includes(trade.status)) {
      [...trade.fromItems, ...trade.toItems].forEach(({ item, quantity }) => {
        const itemId = item._id || item;
        if (!itemId) return;
        const idStr = itemId.toString();
        lockedQuantities[idStr] = (lockedQuantities[idStr] || 0) + quantity;
      });
    }
  });
  const getLocked = id => lockedQuantities[id] || 0;
  
  const isItemFullyLocked = (id, userQuantity) => {
    return (lockedQuantities[id] || 0) >= userQuantity;
  };

  const filteredIncoming = activeOnly
    ? incomingTrades.filter(t => ['pending', 'responded'].includes(t.status))
    : incomingTrades;

  const filteredOutgoing = activeOnly
    ? outgoingTrades.filter(t => ['pending', 'responded'].includes(t.status))
    : outgoingTrades;




    return (
      <div className="min-h-screen bg-black text-white pt-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
    
          {/* Error */}
          {error && <div className="bg-red-500/20 p-4 rounded-xl border border-red-500">{error}</div>}
    
          {/* Balance */}
          <section className="bg-gradient-to-r from-pink-500 to-purple-700 p-8 rounded-2xl shadow-lg">
            <h1 className="text-4xl font-extrabold text-white flex items-center gap-2">
              {userData?.username ? `hey ${userData.username}, ready to get rich?` : '💸💸💸'}
            </h1>
            <p className="text-lg mt-2">
              Balance: <span className="font-bold">${userData?.balance.toLocaleString()}</span>
            </p>
          </section>
    
          {/* Trade Initiation */}
          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                <ArrowRightLeft className="w-6 h-6" /> Trade Center
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
                    <div key={_id} className={`p-4 border rounded-lg relative ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
                      <div className="mb-2">
                        {image ? (
                          <img src={image} alt={name} className="w-12 h-12 object-contain mx-auto" />
                        ) : (
                          <div className="text-3xl text-center">{emoji}</div>
                        )}
                      </div>
                      <p className="text-center text-sm font-semibold">{name}</p>
                      <p className="text-center text-xs text-white/60">
                        Qty: {quantity}
                        {getLocked(_id) > 0 && (
                          <span className="ml-1 text-red-400">({getLocked(_id)} locked)</span>
                        )}
                      </p>                      <input
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
    
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white">
                Initiate Trade
              </button>
            </form>
          </section>
          {/* Incoming Trades */}
          <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-pink-400">Incoming Trades</h3>
        {filteredIncoming.length === 0 ? (
          <p className="text-white/50 text-sm">No incoming trades</p>
        ) : filteredIncoming.map(trade => (
          <div key={trade._id} className="bg-white/10 p-4 mb-4 rounded-lg border border-white/10 space-y-3">
            <div className="text-sm text-white/70">
              From:&nbsp;
              <strong>
                {trade.fromUser?.username ?? 'Unknown'}
              </strong>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {trade.fromItems.map(({ name, image, emoji, price, quantity }, idx) => (
              <div key={idx}
              className="bg-white/5 p-2 rounded-lg text-sm">
                {image
                  ? <img src={`/assets/rps/${image}`} className="w-8 h-8 mx-auto" />
                  : <div className="text-2xl text-center">{emoji}</div>
                }
                <p className="text-center">{name}</p>
                <p className="text-center text-xs text-white/60">x{quantity}</p>
                <p className="text-center text-xs text-white/40">${price}</p>
              </div>
            ))}
            </div>

            {trade.status === 'pending' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                {formattedInventory.map(({ _id, name, emoji, image, quantity }) => {
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
                            [_id]: Math.min(Math.max(0, +e.target.value), quantity)
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
                <span className="text-sm italic text-white/60">Status: {trade.status}</span>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Outgoing Trades */}
        <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Outgoing Trades</h3>
          {filteredOutgoing.length === 0 ? (
            <p className="text-white/50 text-sm">No outgoing trades</p>
          ) : filteredOutgoing.map(trade => (
            <div key={trade._id} className="bg-white/10 p-4 mb-4 rounded-lg border border-white/10 space-y-3">
          <div className="text-sm text-white/70">
            To:&nbsp;
            <strong>
              {trade.toUser?.username ?? 'Unknown'}
            </strong>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {trade.fromItems.map(({ name, image, emoji, price, quantity }, idx) => (
            <div key={idx} className="…">
              {image
            ? <img src={`/assets/rps/${image}`} className="w-8 h-8 mx-auto" />
            : <div className="text-2xl text-center">{emoji}</div>
              }
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
              {image
                ? <img src={`/assets/rps/${image}`} className="w-8 h-8 mx-auto mb-1" />
                : <div className="text-2xl text-center">{emoji}</div>
              }
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

          <div className="flex gap-2 mt-2">
            {['pending'].includes(trade.status) && (
              <button
            onClick={() => handleCancelTrade(trade._id)}
            className="bg-white/10 px-3 py-1 rounded text-sm text-red-300 flex items-center gap-1"
              >
            <XCircle size={14} /> Cancel
              </button>
            )}
            {['accepted', 'denied', 'canceled'].includes(trade.status) && (
              <span className="text-sm italic text-white/60">Status: {trade.status}</span>
            )}
          </div>
            </div>
          ))}
        </section>
        {/* Active Bets */}
      <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6" /> Active Bets
        </h2>
        {userData?.currentBets?.length > 0 ? (
          <div className="space-y-4">
            {userData.currentBets.map(bet => (
              <div
                key={bet._id}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div className="font-semibold text-white mb-1">{bet.title}</div>
                <div className="text-xs text-white/60">
                  Options: {bet.options.map(o => o.text).join(' | ')}
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

      {/* Badges */}
      <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h2 className="text-2xl font-bold text-pink-400 mb-4 flex items-center gap-2">
          <BadgeCheck className="w-6 h-6" /> Your Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allBadges.map(badge => {
            const unlocked = unlockedNames.includes(badge.name);
            return (
              <div
                key={badge.name}
                onClick={() => handleBadgeClick(badge)}
                className={`relative group bg-white/5 border border-white/10 
                  rounded-xl p-4 cursor-pointer transition-transform hover:scale-105 
                  ${unlocked ? 'text-white' : 'text-white/30'} 
                  ${selectedBadge?.name === badge.name ? 'ring-2 ring-pink-500' : ''}`}
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
          <div className="mt-6 bg-white/10 p-4 rounded-xl text-white border border-white/10">
            <h3 className="text-lg font-semibold mb-1">{selectedBadge.name}</h3>
            <p className="text-sm">{selectedBadge.description}</p>
          </div>
        )}
      </section>

    </div>
  </div>
);
}