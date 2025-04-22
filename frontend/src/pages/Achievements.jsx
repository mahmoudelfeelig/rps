import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import successSfx from '../assets/success.mp3';

const typeStyles = {
  logins: 'text-blue-400 border-blue-400/30 bg-blue-500/10',
  betsPlaced: 'text-green-400 border-green-400/30 bg-green-500/10',
  betsWon: 'text-green-400 border-green-400/30 bg-green-500/10',
  storePurchases: 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10',
  tasksCompleted: 'text-purple-400 border-purple-400/30 bg-purple-500/10',
  other: 'text-gray-400 border-gray-400/30 bg-gray-500/10',
};

const Achievements = () => {
  const { token } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [expanded, setExpanded] = useState({ claimed: true, unclaimed: true });
  const [filterType, setFilterType] = useState('all');
  const audio = new Audio(successSfx);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/achievements', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/user/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const achData = await achRes.json();
        const statsData = await statsRes.json();

        const claimedAchievementIds = statsData.claimedAchievements.map(a => String(a._id));




        const enriched = achData.map((ach) => {
          const statValue = statsData[ach.criteria] || 0;
          const progress = Math.min((statValue / ach.threshold) * 100, 100);
          const achId = String(ach._id);
          const isClaimed = claimedAchievementIds.includes(achId);

          console.log("Ach ID:", achId);
          console.log("Claimed IDs:", claimedAchievementIds);
          console.log("Claimed?", claimedAchievementIds.includes(achId));

          return {
            ...ach,
            progress,
            complete: progress >= 100,
            claimed: isClaimed
          };
        });


        

        setAchievements(enriched);
        setUserStats(statsData);
      } catch (err) {
        console.error('Error loading achievements:', err);
      }
    };

    fetchData();
  }, [token]);

  const handleClaim = async (id) => {
    try {
      const res = await fetch('http://localhost:5000/api/achievements/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ achievementId: id })
      });

      if (res.ok) {
        try {
          await audio.play();
        } catch (err) {
          console.warn('Audio play failed:', err);
        }

        setAchievements(prev =>
          prev.map(ach =>
            ach._id === id ? { ...ach, claimed: true } : ach
          )
        );
      } else {
        const err = await res.text();
        console.error('Claim failed:', err);
      }
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  const filteredAchievements = achievements.filter((ach) => {
    if (filterType === 'all') return true;

    const typeMap = {
      bet: ['betsPlaced', 'betsWon'],
      store: ['storePurchases'],
      login: ['logins'],
      task: ['tasksCompleted'],
    };

    return typeMap[filterType]?.includes(ach.criteria);
  });

  const unclaimed = achievements.filter(a => !a.claimed && a.complete);
  const claimed = achievements.filter(a => a.claimed);
  

  const renderAchievements = (list, isClaimedSection = false) =>
    list.map((ach) => {
      const style = typeStyles[ach.criteria] || typeStyles.other;
      const showClaim = ach.complete && !ach.claimed;

      return (
        <motion.div
          key={ach._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-xl border shadow-md relative transition-all hover:scale-[1.01] cursor-pointer ${style}`}
          onClick={() => showClaim && handleClaim(ach._id)}
        >
          {ach.claimed && (
            <motion.div
              className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 backdrop-blur-sm text-green-300 font-semibold rounded-xl pointer-events-none"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                Claimed!
              </motion.div>
            </motion.div>
          )}
          <h2 className="text-lg font-bold">{ach.title}</h2>
          <p className="text-sm mt-1 text-gray-300">{ach.description}</p>
          <div className="text-xs mt-3 flex justify-between">
            <div className="text-white/60">{ach.criteria.toUpperCase()} • Goal: {ach.threshold}</div>
            <div className="font-semibold text-green-300">{ach.reward}</div>
          </div>
          {!isClaimedSection && (
            <div className="w-full bg-gray-700/40 h-2 rounded-full mt-3">
              <motion.div
                className="h-2 rounded-full bg-green-400"
                initial={{ width: 0 }}
                animate={{ width: `${ach.progress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          )}
        </motion.div>
      );
    });

  return (
    <div className="pt-24 px-6 pb-10 max-w-5xl mx-auto min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Trophy className="w-7 h-7" /> Achievements</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="text-sm text-gray-400">Filter by Type:</label>
        {['all', 'bet', 'store', 'task', 'login'].map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-full border text-sm transition-all ${
              filterType === type
                ? 'bg-white text-black font-semibold'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            onClick={() => setFilterType(type)}
          >
            {type === 'bet'
              ? 'Bets'
              : type === 'store'
              ? 'Store'
              : type === 'login'
              ? 'Login'
              : type === 'task'
              ? 'Tasks'
              : 'All'}
          </button>
        ))}
      </div>

      {/* Unclaimed Section */}
      <div className="mb-8">
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => setExpanded((prev) => ({ ...prev, unclaimed: !prev.unclaimed }))}
        >
          <h2 className="text-xl font-semibold">Unclaimed</h2>
          {expanded.unclaimed ? <ChevronUp /> : <ChevronDown />}
        </div>
        <AnimatePresence>
          {expanded.unclaimed && (
            <motion.div
              className="grid md:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {unclaimed.length > 0
                ? renderAchievements(unclaimed)
                : <p className="text-sm text-gray-500">No unclaimed achievements.</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Claimed Section */}
      <div>
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => setExpanded((prev) => ({ ...prev, claimed: !prev.claimed }))}
        >
          <h2 className="text-xl font-semibold">Claimed</h2>
          {expanded.claimed ? <ChevronUp /> : <ChevronDown />}
        </div>
        <AnimatePresence>
          {expanded.claimed && (
            <motion.div
              className="grid md:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {claimed.length > 0
                ? renderAchievements(claimed, true)
                : <p className="text-sm text-gray-500">No claimed achievements yet.</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Achievements;
