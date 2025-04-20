import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, BadgeCheck } from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const fetchUserData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }
  
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const handleBadgeClick = (badge) => {
    setSelectedBadge((prev) => (prev?.name === badge.name ? null : badge));
  };

  const allBadges = [
    { name: 'High Roller', description: 'Awarded for maintaining a high balance over time.' },
    { name: 'Newbie', description: 'Given to all new users. Welcome aboard!' },
    { name: 'Lucky Streak', description: 'You’ve won 5+ bets. Luck is real.' },
    { name: 'Shopaholic', description: 'Buy 3+ items from the store.' },
    { name: 'Overachiever', description: 'Complete 10+ tasks.' },
    { name: 'Veteran', description: 'Login 30+ times.' },
  ];

  const unlockedNames = userData?.badges?.map((b) => b.name) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        
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
};

export default Dashboard;
