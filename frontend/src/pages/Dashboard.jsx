import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRightLeft, BadgeCheck, Activity } from 'lucide-react';
import { API_BASE } from '../api';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [tradeRecipient, setTradeRecipient] = useState('');
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);
  const [responseItemKeys, setResponseItemKeys] = useState([]);
  const [incomingTrades, setIncomingTrades] = useState([]);
  const [outgoingTrades, setOutgoingTrades] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [error, setError] = useState('');

  // Fetch user stats (including inventory)
  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch user data.');
      setUserData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch trades
  const fetchTrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load trades.');
      setIncomingTrades(data.incoming);
      setOutgoingTrades(data.outgoing);
    } catch (err) {
      setError(err.message);
    }
  };

  // Normalise inventory shape: support both old flat and new {item,quantity}
  const formattedInventory = (userData?.inventory || []).map(inv => {
    if (inv && inv.item) {
      return { item: inv.item, quantity: inv.quantity || 1 };
    }
    return { item: inv, quantity: 1 };
  });

  const handleSendMoney = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/user/send-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientUsername, amount: sendAmount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Transfer failed');
      setSendAmount('');
      setRecipientUsername('');
      fetchUserData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTrade = async (e) => {
    e.preventDefault();
    try {
      const fromItems = selectedItemKeys.map(key => key.split('-')[0]);
      const res = await fetch(`${API_BASE}/api/trades/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ toUsername: tradeRecipient, fromItems })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Trade request failed');
  
      setOutgoingTrades(prev => [...prev, data.trade]);
      setTradeRecipient('');
      setSelectedItemKeys([]);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleRespondToTrade = async (tradeId, action) => {
    try {
      const toItems = responseItemKeys.map(key => key.split('-')[0]);
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ toItems, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Trade response failed');
  
      setIncomingTrades(prev =>
        prev.map(t => t._id === tradeId ? data.trade : t)
      );
      setResponseItemKeys([]);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleFinalizeTrade = async (tradeId) => {
    try {
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}/finalize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Finalize trade failed');
  
      setOutgoingTrades(prev =>
        prev.map(t => t._id === tradeId ? { ...t, status: 'accepted', toItems: data.trade.toItems } : t)
      );
    } catch (err) {
      setError(err.message);
    }
  };
  

  const handleBadgeClick = (badge) => {
    setSelectedBadge(prev => (prev?.name === badge.name ? null : badge));
  };

  useEffect(() => {
    fetchUserData();
    fetchTrades();
  }, [token]);

  const allBadges = [
    { name: 'High Roller', description: 'Awarded for maintaining a high balance over time.' },
    { name: 'Newbie', description: 'Given to all new users. Welcome aboard!' },
    { name: 'Lucky Streak', description: 'You’ve won 5+ bets. Luck is real.' },
    { name: 'Shopaholic', description: 'Buy 3+ items from the store.' },
    { name: 'Overachiever', description: 'Complete 10+ tasks.' },
    { name: 'Veteran', description: 'Login 30+ times.' }
  ];
  const unlockedNames = userData?.badges?.map(b => b.name) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Error */}
        {error && (
          <div className="bg-red-500/20 p-4 rounded-xl border border-red-500">
            Error: {error}
          </div>
        )}

        {/* Welcome */}
        <section className="bg-gradient-to-r from-pink-500 to-purple-700 p-8 rounded-2xl shadow-lg border border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-1">
                Welcome Back{userData?.username ? `, ${userData.username}` : '...'}
              </h1>
              <p className="text-sm text-white/70">Ready to roll the dice?</p>
            </div>
            <span className="px-4 py-1 text-sm bg-white/10 rounded-full border border-white/10">
              💎 VIP Member
            </span>
          </div>
          <div className="text-5xl font-extrabold mt-6">
            ${userData?.balance?.toLocaleString() || '0.00'}
          </div>
        </section>

        {/* Send Money */}
        <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Send Money</h2>
          <form onSubmit={handleSendMoney} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Recipient username"
              value={recipientUsername}
              onChange={e => setRecipientUsername(e.target.value)}
              className="bg-white/10 rounded-lg p-2 text-white placeholder-white/50"
            />
            <input
              type="number"
              placeholder="Amount"
              value={sendAmount}
              onChange={e => setSendAmount(e.target.value)}
              className="bg-white/10 rounded-lg p-2 text-white placeholder-white/50"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              Send
            </button>
          </form>
        </section>

        {/* Trade Center */}
        <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6" /> Trade Center
          </h2>

          {/* Create Trade */}
          <form onSubmit={handleCreateTrade} className="space-y-4 mb-8">
            <input
              value={tradeRecipient}
              onChange={e => setTradeRecipient(e.target.value)}
              placeholder="Recipient username"
              className="bg-white/10 text-white px-4 py-2 rounded w-full"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formattedInventory.map(({ item, quantity }, idx) => {
                const key = `${item._id}-${idx}`;
                const isSelected = selectedItemKeys.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() =>
                      setSelectedItemKeys(prev =>
                        prev.includes(key)
                          ? prev.filter(k => k !== key)
                          : [...prev, key]
                      )
                    }
                    className={`relative p-4 rounded-lg border cursor-pointer transition-shadow hover:shadow-lg ${
                      isSelected
                        ? 'border-purple-500 bg-purple-600/10'
                        : 'border-gray-700'
                    }`}
                  >
                    {/* image or emoji */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover mb-2 rounded"
                      />
                    ) : (
                      <div className="text-3xl mb-2">{item.emoji}</div>
                    )}

                    {/* name */}
                    <div
                      className="text-sm font-semibold text-white truncate"
                      title={item.name}
                    >
                      {item.name}
                    </div>

                    {/* quantity badge */}
                    {quantity > 1 && (
                      <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        ×{quantity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white">
              Initiate Trade
            </button>
          </form>

          {/* Incoming Trades */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Incoming Trades</h3>
            {incomingTrades.length === 0 ? (
              <p className="text-sm text-gray-400">No incoming trades</p>
            ) : (
              incomingTrades.map(trade => (
                <div key={trade._id} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4">
                  <div className="mb-2 font-semibold">From: {trade.fromUser.username}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {trade.fromItems.map(item => (
                      <span key={item._id} className="bg-purple-600/20 px-2 py-1 rounded text-sm">
                        {item.emoji} {item.name}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formattedInventory.map(({ item, quantity }, idx) => {
                      const key = `${item._id}-${idx}`;
                      const isSelected = responseItemKeys.includes(key);
                      return (
                        <div
                          key={key}
                          onClick={() =>
                            setResponseItemKeys(prev =>
                              prev.includes(key)
                                ? prev.filter(k => k !== key)
                                : [...prev, key]
                            )
                          }
                          className={`relative p-3 rounded-lg border cursor-pointer transition-shadow hover:shadow-lg ${
                            isSelected
                              ? 'border-green-500 bg-green-600/10'
                              : 'border-gray-700'
                          }`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover mb-1 rounded"
                            />
                          ) : (
                            <div className="text-2xl">{item.emoji}</div>
                          )}

                          <div className="text-sm truncate" title={item.name}>
                            {item.name}
                          </div>

                          {quantity > 1 && (
                            <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                              ×{quantity}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {trade.status === 'pending' ? (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleRespondToTrade(trade._id, 'accept')}
                        className="bg-green-600 px-4 py-1 rounded text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondToTrade(trade._id, 'deny')}
                        className="bg-red-600 px-4 py-1 rounded text-sm"
                      >
                        Deny
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm italic capitalize mt-3">{trade.status}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Outgoing Trades */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Outgoing Trades</h3>
            {outgoingTrades.length === 0 ? (
              <p className="text-sm text-gray-400">No outgoing trades</p>
            ) : (
              outgoingTrades.map(trade => (
                <div key={trade._id} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-4">
                  <p className="text-sm text-gray-400 mb-2">
                    Status: <span className="capitalize">{trade.status}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {trade.fromItems.map(item => (
                      <span key={item._id} className="bg-purple-700/20 px-2 py-1 rounded text-sm">
                        {item.emoji} {item.name}
                      </span>
                    ))}
                  </div>

                  {trade.status === 'responded' ? (
                    <>
                      <p className="text-green-400 text-sm mb-1">They offered:</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {trade.toItems.map(item => (
                          <span key={item._id} className="bg-green-700/20 px-2 py-1 rounded text-sm">
                            {item.emoji} {item.name}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleFinalizeTrade(trade._id)}
                        className="bg-green-700 hover:bg-green-800 px-4 py-1 rounded text-sm text-white"
                      >
                        Finalize
                      </button>
                    </>
                  ) : (
                    <span className="text-sm italic capitalize">{trade.status}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Active Bets */}
        <section className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6" /> Active Bets
          </h2>
          {userData?.currentBets?.length > 0 ? (
            <div className="space-y-4">
              {userData.currentBets.map(bet => (
                <div key={bet._id} className="bg-white/5 p-4 rounded-xl border border-white/10">
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
              const isUnlocked = unlockedNames.includes(badge.name);
              return (
                <div
                  key={badge.name}
                  onClick={() => handleBadgeClick(badge)}
                  className={`relative group bg-white/5 border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform ${
                    selectedBadge?.name === badge.name ? 'ring-2 ring-pink-500' : ''
                  } ${isUnlocked ? 'text-white' : 'text-white/30'}`}
                >
                  <div className="text-3xl mb-2">🏅</div>
                  <div className="font-medium">{badge.name}</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/80 bg-black/70 px-2 py-1 rounded-lg pointer-events-none">
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedBadge && (
            <div className="mt-6 bg-white/10 p-4 rounded-xl text-white border border-white/10">
              <h3 className="text-lg font-semibold mb-1">{selectedBadge.name}</h3>
              <p className="text-sm text-white/80">{selectedBadge.description}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
