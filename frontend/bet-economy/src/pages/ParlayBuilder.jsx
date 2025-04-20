import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ParlayBuilder = () => {
  const [bets, setBets] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [parlayOdds, setParlayOdds] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const response = await axios.get('/api/bets/active');
        setBets(response.data);
      } catch (error) {
        console.error('Error fetching bets:', error);
      }
    };
    fetchBets();
  }, []);

  const handleOptionSelect = (betId, option) => {
    setSelectedOptions((prev) => {
      const newSelections = { ...prev, [betId]: option };
      calculateParlayOdds(newSelections);
      return newSelections;
    });
  };

  const calculateParlayOdds = (selections) => {
    let odds = 1;
    Object.values(selections).forEach((opt) => {
      odds *= opt.odds;
    });
    setParlayOdds(odds.toFixed(2));
  };

  const handleSubmitParlay = async () => {
    const parlayBets = Object.entries(selectedOptions).map(([betId, option]) => ({
      betId,
      choice: option.text,
    }));

    try {
      const res = await axios.post('/api/bets/parlay', { bets: parlayBets });
      alert(`Parlay submitted! Total odds: ${res.data.odds}x`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting parlay:', error);
      alert('Failed to submit parlay.');
    }
  };

  const isBetExpired = (endTime) => new Date(endTime) < new Date();

  return (
    <motion.section
      className="p-6 pt-28 bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-4xl font-bold text-pink-400 mb-2">🎯 Parlay Builder</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Combine multiple bets into a single parlay for higher rewards. Choose wisely!
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bets.map((bet, index) => (
          <motion.div
            key={bet._id}
            className={`p-5 border rounded-xl backdrop-blur-md shadow-lg ${
              isBetExpired(bet.endTime)
                ? 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-50'
                : 'bg-white/5 border-white/10 hover:scale-[1.015] transition duration-300'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-pink-300">{bet.title}</h3>
              <p className="text-sm text-gray-400 mt-1">
                ⏳ Ends: {new Date(bet.endTime).toLocaleString()}
              </p>
            </div>
            <div className="space-y-3 mt-4">
              {bet.options.map((opt) => (
                <button
                  key={opt.text}
                  onClick={() => !isBetExpired(bet.endTime) && handleOptionSelect(bet._id, opt)}
                  className={`w-full flex justify-between items-center px-4 py-2 rounded-md transition ${
                    selectedOptions[bet._id]?.text === opt.text
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-500/10 text-pink-300 border border-pink-500/30 hover:bg-pink-500/20'
                  } ${isBetExpired(bet.endTime) ? 'cursor-not-allowed' : ''}`}
                  disabled={isBetExpired(bet.endTime)}
                >
                  <span>{opt.text}</span>
                  <span className="font-bold">{opt.odds}x</span>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xl text-pink-400 mb-4">
          Total Parlay Odds: <span className="font-bold">{parlayOdds}x</span>
        </p>
        <button
          onClick={handleSubmitParlay}
          className="px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
          disabled={Object.keys(selectedOptions).length < 2}
        >
          Submit Parlay
        </button>
        {Object.keys(selectedOptions).length < 2 && (
          <p className="text-sm text-gray-500 mt-2">Select at least two bets to create a parlay.</p>
        )}
      </motion.div>
    </motion.section>
  );
};

export default ParlayBuilder;
