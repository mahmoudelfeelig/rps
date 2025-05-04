import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, BadgeCheck, ArrowRightLeft, Package } from 'lucide-react';
import { API_BASE } from '../api';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [sendAmount, setSendAmount] = useState('');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [tradeRecipient, setTradeRecipient] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [outgoingTrades, setOutgoingTrades] = useState([]);
  const [incomingTrades, setIncomingTrades] = useState([]);
  const [error, setError] = useState('');
  const [pendingTrades, setPendingTrades] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
      setError('Error fetching user data. Please try again later.');
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trades`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setOutgoingTrades(data.outgoing);
      setIncomingTrades(data.incoming);
    } catch (err) {
      console.error('Failed to fetch trades', err);
      setError('Failed to load trades. Please try again later.');
    }
  };

  const handleSendMoney = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/user/send-money`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientUsername, amount: sendAmount }),
      });

      if (!res.ok) {
        throw new Error('Transfer failed');
      }

      const response = await res.json();
      setSendAmount('');
      setRecipientUsername('');
      fetchUserData(); // Refresh data after transaction
    } catch (err) {
      setError(err.message);
      console.error('Transfer error:', err);
    }
  };

  const handleCreateTrade = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/trades/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toUsername: tradeRecipient,
          fromItems: selectedItems,
        }),
      });

      if (!res.ok) {
        throw new Error('Trade request failed');
      }

      const data = await res.json();
      setTradeRecipient('');
      setSelectedItems([]);
      setOutgoingTrades([...outgoingTrades, data.trade]);
    } catch (err) {
      setError(err.message);
      console.error('Trade request failed', err);
    }
  };

  const handleRespondToTrade = async (tradeId, toItems, action) => {
    try {
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toItems, action }),
      });

      if (!res.ok) {
        throw new Error('Trade response failed');
      }

      const data = await res.json();
      setOutgoingTrades(outgoingTrades.map((trade) => 
        trade._id === tradeId ? { ...trade, status: action } : trade
      ));
    } catch (err) {
      setError(err.message);
      console.error('Trade response failed', err);
    }
  };

  const handleBadgeClick = (badge) => {
    setSelectedBadge((prev) => (prev?.name === badge.name ? null : badge));
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
    { name: 'Veteran', description: 'Login 30+ times.' },
  ];

  const unlockedNames = userData?.badges?.map((badge) => badge.name) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 p-4 rounded-xl border border-red-500">
            Error: {error}
          </div>
        )}
  
        {/* Welcome & Balance */}
        <section className="bg-gradient-to-r from-pink-500 to-purple-700 p-8 rounded-2xl shadow-lg border border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-1 tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Welcome Back{userData?.username ? `, ${userData.username}!` : '...'}
              </h1>
              <p className="text-sm text-white/70">Ready to roll the dice?</p>
            </div>
            <span className="px-4 py-1 text-sm bg-white/10 text-white rounded-full border border-white/10 backdrop-blur">
              💎 VIP Member
            </span>
          </div>
  
          <div className="text-5xl font-extrabold text-white mt-6 tracking-tight">
            ${userData?.balance?.toLocaleString() || '0.00'}
          </div>
        </section>
  
        {/* Send Money Section */}
        <section className="bg-white/5 p-6 sm:p-8 rounded-2xl shadow-md border border-white/10 backdrop-blur">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Send Money</h2>
          <form onSubmit={handleSendMoney} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Recipient username"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              className="bg-white/10 rounded-lg p-2 text-white placeholder-white/50"
            />
            <input
              type="number"
              placeholder="Amount"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="bg-white/10 rounded-lg p-2 text-white placeholder-white/50"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Send
            </button>
          </form>
        </section>
  
        {/* Trading Section */}
        <section className="bg-white/5 p-6 sm:p-8 rounded-2xl shadow-md border border-white/10 backdrop-blur">
          <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6" /> Trading
          </h2>
          
          {/* Create Trade Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Create New Trade</h3>
            <form onSubmit={handleCreateTrade} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Recipient username"
                value={tradeRecipient}
                onChange={(e) => setTradeRecipient(e.target.value)}
                className="bg-white/10 rounded-lg p-2 text-white placeholder-white/50"
              />
  
              {/* INVENTORY CHECK - */}
              {userData?.inventory?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userData.inventory.map((item, index) => (
                    <div
                      key={`${item._id}-${index}`}                      
                      onClick={() => setSelectedItems(prev => 
                          prev.includes(item._id) 
                            ? prev.filter(id => id !== item._id) 
                            : [...prev, item._id]
                        )}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedItems.includes(item._id)
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-2xl mb-2">{item.emoji || '📦'}</div>
                      <div className="text-sm font-medium truncate">{item.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-400">
                  Your inventory is empty
                </div>
              )}
              
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                disabled={!tradeRecipient || selectedItems.length === 0}
              >
                Initiate Trade
              </button>
            </form>
          </div>
  
          {/* Incoming Trades */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Incoming Trades</h3>
            {incomingTrades.length === 0 ? (
              <p className="text-sm text-gray-400">No incoming trades</p>
            ) : (
              <div className="space-y-4">
                {incomingTrades.map(trade => (
                  <div key={trade._id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">
                        From: {trade.fromUser.username}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespondToTrade(trade._id)}
                          className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-purple-400">Offering:</span>
                      <div className="flex gap-2">
                        {trade.fromItems.map(item => (
                          <span key={item._id} className="flex items-center gap-1">
                            {item.emoji} {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
  
          {/* Outgoing Trades */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Outgoing Trades</h3>
            {outgoingTrades.length === 0 ? (
              <p className="text-sm text-gray-400">No outgoing trades</p>
            ) : (
              <div className="space-y-4">
                {outgoingTrades.map(trade => (
                  <div key={trade._id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-sm text-gray-400 mb-2">
                      Status: <span className="capitalize">{trade.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-purple-400">Your Items:</span>
                      <div className="flex gap-2">
                        {trade.fromItems.map(item => (
                          <span key={item._id} className="flex items-center gap-1">
                            {item.emoji} {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
  
        {/* Active Bets */}
        <section className="bg-white/5 p-6 sm:p-8 rounded-2xl shadow-md border border-white/10 backdrop-blur">
          <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6" /> Active Bets
          </h2>
          {userData?.currentBets?.length > 0 ? (
            <div className="space-y-4">
              {userData.currentBets.map((bet) => (
                <div
                  key={bet._id}
                  className="bg-white/5 p-4 rounded-xl border border-white/10"
                >
                  <div className="font-semibold text-white mb-1">{bet.title}</div>
                  <div className="text-xs text-white/60">
                    Options: {bet.options.map((o) => o.text).join(' | ')}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {bet.result ? `Final Result: ${bet.result}` : `Pending...`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">You have no active bets.</p>
          )}
        </section>
  
        {/* Badges */}
        <section className="bg-white/5 p-6 sm:p-8 rounded-2xl shadow-md border border-white/10 backdrop-blur">
          <h2 className="text-2xl font-bold text-pink-400 mb-6 flex items-center gap-2">
            <BadgeCheck className="w-6 h-6" /> Your Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBadges.map((badge) => {
              const isUnlocked = unlockedNames.includes(badge.name);
              return (
                <div
                  key={badge.name}
                  onClick={() => handleBadgeClick(badge)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleBadgeClick(badge)}
                  className={`relative group bg-white/5 border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm ${
                    selectedBadge?.name === badge.name ? 'ring-2 ring-pink-500' : ''
                  } ${isUnlocked ? 'text-white' : 'text-white/30'}`}
                >
                  <div className="text-3xl mb-2">🏅</div>
                  <div className="font-medium">{badge.name}</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/80 bg-black/70 px-2 py-1 rounded-lg z-10 pointer-events-none">
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
  
          {selectedBadge && (
            <div className="mt-6 bg-white/10 p-4 rounded-xl text-white border border-white/10 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-1">{selectedBadge.name}</h3>
              <p className="text-sm text-white/80">{selectedBadge.description}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
  }
  export default Dashboard;
  