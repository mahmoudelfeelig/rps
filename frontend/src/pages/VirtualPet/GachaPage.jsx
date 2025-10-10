import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth }    from '../../context/AuthContext';
import { API_BASE }   from '../../api';
import { toast }      from 'react-toastify';
import { Link }       from 'react-router-dom';
import { ArrowLeft }  from 'lucide-react';
import GachaRevealModal from './GachaRevealModal';

const RARITY_EMOJI = { Mythical:'🌟', Legendary:'🔮', Rare:'💎', Uncommon:'✨', Common:'🔹' };
const RARITY_COLOR = {
  Mythical:'text-pink-400',
  Legendary:'text-purple-400',
  Rare:'text-blue-400',
  Uncommon:'text-green-300',
  Common:'text-gray-300'
};

export default function GachaPage() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [pools,   setPools]   = useState({});
  const [pity,    setPity]    = useState({});
  const [spinning,setSpinning]= useState(false);
  const [reveal,  setReveal]  = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, uRes] = await Promise.all([
          axios.get(`${API_BASE}/api/gacha/pools`, { headers:{ Authorization:`Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/user/me`,     { headers:{ Authorization:`Bearer ${token}` } })
        ]);
        setPools(pRes.data);
        setBalance(uRes.data.balance);
        setPity(Object.fromEntries(
          Object.entries(pRes.data).map(([k,v]) => [k, v.pityCount || 0])
        ));
      } catch {
        toast.error('Failed to load gacha info');
      }
    })();
  }, [token]);

  const doSpin = async (key, qty) => {
    if (spinning) return;
    setSpinning(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/gacha/spin`,
        { pool:key, count:qty },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      setBalance(data.newBalance);
      setPity(prev => ({ ...prev, [key]: data.pityCount }));
      setReveal({
        items: data.results.map(r => ({
          species: r.species,
          variant: r.variant,
          rarity:  r.rarity,
          traits:  r.traits
        }))
      });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Spin failed');
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="pt-24 px-6 pb-10 min-h-screen bg-black text-white space-y-6">

      {/* Header with Back on left */}
      <div className="flex items-center space-x-4">
        <Link
          to="/games/virtual-pet"
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition"
          title="Back to Sanctuary"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h2 className="flex-1 text-3xl font-bold text-center">🎟️ Gacha</h2>
      </div>

      <div className="text-center text-lg">🪙 Balance: {balance}</div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(pools).map(([key, cfg]) => (
          <div key={key} className="bg-gray-800 p-6 rounded-xl shadow flex flex-col">
            <h3 className="text-xl font-semibold mb-2 capitalize">{key} Banner</h3>
            <p className="text-gray-400 mb-4">Cost: {cfg.cost} 🪙</p>

            <div className="flex gap-2 mb-6">
              <button
                className="flex-1 btn-primary py-2"
                disabled={spinning || balance < cfg.cost}
                onClick={() => doSpin(key, 1)}
              >
                {spinning ? 'Spinning…' : 'Spin ×1'}
              </button>
              <button
                className="flex-1 btn-secondary py-2"
                disabled={spinning || balance < cfg.cost * 10}
                onClick={() => doSpin(key, 10)}
              >
                {spinning ? 'Spinning…' : 'Spin ×10'}
              </button>
            </div>

            <div className="text-sm space-y-1 mb-4">
              {Object.entries(cfg.odds)
                .sort((a,b) => b[1] - a[1])
                .map(([rarity, odds]) => (
                  <div key={rarity} className={`flex justify-between ${RARITY_COLOR[rarity]}`}>
                    <span>{RARITY_EMOJI[rarity]} {rarity}</span>
                    <span>{(odds*100).toFixed(1)}%</span>
                  </div>
                ))}
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Pity</span><span>{pity[key]||0}/100</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${((pity[key]||0)/100)*100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {reveal && (
        <GachaRevealModal items={reveal.items} onClose={() => setReveal(null)} />
      )}
    </div>
  );
}
