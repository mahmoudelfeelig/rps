import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../api';
import { toast } from 'react-toastify';
import CritterCard from './CritterCard';

export default function SanctuaryView() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [critters, setCritters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState({ coins: 0, food: {}, toys: {} });
  const [nextClaim, setNextClaim] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [starters, setStarters] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [crittersRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/api/critters/mine`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCritters(crittersRes.data);
        const r = userRes.data.resources;
        if (r) {
          setResources(r);
          if (r.nextClaim) {
            const now = Date.now();
            setNextClaim(now + r.nextClaim);
            setTimeLeft(r.nextClaim);
          }
        }

        if (crittersRes.data.length === 0) {
          const starterRes = await axios.get(`${API_BASE}/api/critters/starters`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStarters(starterRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  useEffect(() => {
    if (!nextClaim) return;
    const iv = setInterval(() => {
      const diff = nextClaim - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(iv);
      } else {
        setTimeLeft(diff);
      }
    }, 500);
    return () => clearInterval(iv);
  }, [nextClaim]);

  const formatTime = ms => {
    const m = Math.floor(ms / 60000);
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${m}:${s}`;
  };

  const sum = obj => Object.values(obj || {}).reduce((a, b) => a + b, 0);

  const claimResources = () => {
    axios.get(`${API_BASE}/api/sanctuary/resources`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const { newInventory, coinsAdded, foodAdded, toysAdded, nextClaim } = res.data;
      setResources(newInventory);
      setNextClaim(nextClaim);
      setTimeLeft(nextClaim - Date.now());
      toast.success(`+${coinsAdded} 🪙  +${sum(foodAdded)} 🍎  +${sum(toysAdded)} 🧸`);
    }).catch(err => {
      if (err.response?.status === 400 && err.response.data.nextClaim) {
        const n = err.response.data.nextClaim;
        setNextClaim(n);
        setTimeLeft(n - Date.now());
        toast.info('Too soon — try again later');
      } else {
        toast.error('🚫 Resource claim failed.');
      }
    });
  };

  const adoptStarter = (species) => {
    axios.post(`${API_BASE}/api/critters/adopt`, { species }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Welcome your new critter! 🐾");
      window.location.reload(); // Refresh sanctuary
    }).catch(() => toast.error("Adoption failed."));
  };

  if (loading) {
    return (
      <div className="pt-24 text-white min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-xl text-purple-300">Loading your sanctuary...</div>
      </div>
    );
  }

  if (critters.length === 0) {
    return (
      <div className="text-white min-h-screen p-12 pt-24 bg-black">
        <h1 className="text-3xl font-bold mb-6">🐣 Choose Your Starter Critter</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {starters.map(s => (
            <div key={s.species} className="bg-gray-800 p-4 rounded-lg text-center shadow-md">
              <img src={s.image} alt={s.species} className="w-24 h-24 mx-auto mb-2" />
              <h2 className="text-lg font-semibold">{s.species}</h2>
              <p className="text-sm text-purple-400">{s.rarity}</p>
              <button
                onClick={() => adoptStarter(s.species)}
                className="btn-primary mt-3"
              >
                Adopt
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24 text-white min-h-screen bg-black">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">🐾 Your Critters</h1>
        <div className="flex gap-2">
          <button
            onClick={claimResources}
            disabled={timeLeft > 0}
            className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {timeLeft > 0 ? `Next claim in ${formatTime(timeLeft)}` : 'Claim Resources'}
          </button>
          <button
            onClick={() => navigate(`/games/virtual-pet/gacha`)}
            className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded text-sm"
          >
            🎰 Gacha
          </button>
          <button
            onClick={() => navigate(`/games/virtual-pet/shop`)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm"
          >
            🛍️ Shop
          </button>
          <button
            onClick={() => navigate(`/games/virtual-pet/breeding`)}
            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-sm"
          >
            🧬 Breeding
          </button>
        </div>
      </div>

      <div className="bg-gray-800/40 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center text-sm shadow-inner">
        <div>🪙 Coins: <span className="text-yellow-300">{resources.coins}</span></div>
        {Object.entries(resources.food).map(([k, v]) => (
          <div key={k}>🍎 {k}: <span className="text-green-300">{v}</span></div>
        ))}
        {Object.entries(resources.toys).map(([k, v]) => (
          <div key={k}>🧸 {k}: <span className="text-blue-300">{v}</span></div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {critters.map(c => <CritterCard key={c._id} critter={c} />)}
      </div>
    </div>
  );
}
