import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

const Bets = () => {
  const [bets, setBets] = useState([]);
  const [amount, setAmount] = useState({});
  const { token, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/bets/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBets(response.data);
      } catch (err) {
        console.error("Error fetching active bets:", err);
      }
    };
    fetchBets();
  }, []);

  const handlePlaceBet = async (betId, optionText) => {
    const wager = amount[betId] || 0;
    await refreshUser()

    if (wager <= 0) return alert("Please enter a valid amount.");
    if (wager > user.balance) return alert("Insufficient balance.");

    try {
      await axios.post(
        `${API_BASE}/api/bets/predict`,
        { betId, choice: optionText, amount: wager },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Bet placed!");
      setAmount(prev => ({ ...prev, [betId]: "" }));
      
      await refreshUser()
    } catch (err) {
      console.error("Error placing bet:", err);
      alert(err.response?.data?.message || "Bet placement failed.");
    }
  };

  return (
    <motion.section className="p-6 pt-28 bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] min-h-screen text-white"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* Header with navigation button */}
      <motion.div className="flex justify-between items-center mb-12"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}>
        <div className="text-left">
          <h2 className="text-4xl font-bold text-pink-400 mb-2">📈 Active Bets</h2>
          <p className="text-gray-400 max-w-xl">
            Risk Paper Scammers™ is NOT responsible for any emotional damage.
            Bet at your own risk. Or don’t. I'm not your daddy or am I🤔?
          </p>
        </div>
        <motion.div className="text-center mt-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <button
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white font-bold"
            onClick={() => navigate('/bets/parlay')}
          >
            Build a Parlay 🔧
          </button>
        </motion.div>

      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bets.map((bet, index) => (
          <motion.div
            key={bet._id}
            className="p-5 bg-white/5 border border-white/10 rounded-xl hover:scale-[1.015] transition duration-300 backdrop-blur-md shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-pink-300">{bet.title}</h3>
              <p className="text-sm text-gray-400 mt-1">⏳ Ends: {new Date(bet.endTime).toLocaleString('en-GB')}</p>
            </div>

            <div className="mb-2">
              <input
                type="number"
                min="1"
                className="w-full px-3 py-1 rounded-md bg-black/30 border border-pink-500/30 text-white mb-3 focus:outline-none"
                placeholder="Wager amount"
                value={amount[bet._id] || ""}
                onChange={(e) => setAmount(prev => ({ ...prev, [bet._id]: e.target.value }))}
              />
            </div>

            <div className="space-y-3 mt-2">
              {bet.options.map((opt) => (
                <button
                  key={opt.text}
                  className="w-full flex justify-between items-center px-4 py-2 bg-pink-500/10 text-pink-300 border border-pink-500/30 rounded-md hover:bg-pink-500/20 transition"
                  onClick={() => handlePlaceBet(bet._id, opt.text)}
                  disabled={new Date() > new Date(bet.endTime)}
                >
                  <span>{opt.text}</span>
                  <span className="font-bold">{opt.odds}x</span>
                  <span className="text-sm text-gray-400 ml-2">({opt.votes?.length || 0} bets)</span>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="text-center mt-16 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}>
        <p>Feeling lucky? No refunds. No regrets. 😎</p>
      </motion.div>
    </motion.section>
  );
};

export default Bets;
