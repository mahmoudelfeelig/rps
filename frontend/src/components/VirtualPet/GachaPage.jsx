import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import { toast } from 'react-toastify';
import GachaRevealModal from './GachaRevealModal';

const RARITY_EMOJI = {
  Mythical: '🌟',
  Legendary: '🔮',
  Rare: '💎',
  Uncommon: '✨',
  Common: '🔹'
};
const RARITY_COLOR = {
  Mythical: 'text-pink-400',
  Legendary: 'text-purple-400',
  Rare: 'text-blue-400',
  Uncommon: 'text-green-300',
  Common: 'text-gray-300'
};

export default function GachaPage() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [pools, setPools] = useState({});
  const [spinning, setSpinning] = useState(false);
  const [revealData, setReveal] = useState(null);
  const [pityMap, setPityMap] = useState({});

  // Load gacha pool configs and balance
  useEffect(() => {
    axios.get(`${API_BASE}/api/gacha/pools`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const raw = res.data;
        setPools(raw);
        setPityMap(Object.fromEntries(
          Object.entries(raw).map(([k, v]) => [k, v.pityCount || 0])
        ));
      })
      .catch(() => toast.error('Failed to load gacha pools'));

    axios.get(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBalance(res.data.balance))
      .catch(console.error);
  }, [token]);

  const doSpin = async (key, count) => {
    if (spinning) return;
    setSpinning(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/gacha/spin`,
        { pool: key, count },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(data.newBalance);
      setReveal({
        pool: key,
        items: data.results.map(r => ({
          species: r.species,
          rarity: inferRarity(r.species, pools[key].odds)
        })),
        pityCount: data.pityCount
      });
      setPityMap(prev => ({ ...prev, [key]: data.pityCount }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Spin failed');
    } finally {
      setSpinning(false);
    }
  };

  const inferRarity = (species, odds) => {
    // Since rarity isn't sent in results, we guess it from pool odds mapping
    const rarityKeys = Object.keys(odds);
    return rarityKeys.length === 1 ? rarityKeys[0] : 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">🎟️ Gacha</h2>
      <div className="text-white mb-4">🪙 Balance: {balance}</div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(pools).map(([key, cfg]) => (
          <div
            key={key}
            className="bg-gray-800 p-6 rounded-xl shadow-lg text-white flex flex-col"
          >
            <h3 className="text-xl font-semibold mb-2 capitalize">{key} Banner</h3>
            <p className="text-gray-400 mb-4">Cost: {cfg.cost} 🪙</p>

            <div className="flex gap-2 mb-4">
              <button
                disabled={spinning || balance < cfg.cost}
                onClick={() => doSpin(key, 1)}
                className="flex-1 btn-primary py-2"
              >
                {spinning ? 'Spinning…' : 'Spin ×1'}
              </button>
              <button
                disabled={spinning || balance < cfg.cost * 10}
                onClick={() => doSpin(key, 10)}
                className="flex-1 btn-secondary py-2"
              >
                {spinning ? 'Spinning…' : 'Spin ×10'}
              </button>
            </div>

            <div className="text-sm text-gray-400 mb-2">
              Drop Rates:
              <ul className="ml-3 mt-1 space-y-1">
                {Object.entries(cfg.odds).sort((a, b) => b[1] - a[1]).map(([rarity, percent]) => (
                  <li key={rarity} className={`${RARITY_COLOR[rarity]}`}>
                    {RARITY_EMOJI[rarity]} {rarity}: {(percent * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Pity</span>
                <span>{pityMap[key] || 0}/100</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${((pityMap[key] || 0) / 100) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {revealData && (
        <GachaRevealModal
          items={revealData.items}
          onClose={() => setReveal(null)}
        />
      )}
    </div>
  );
}
