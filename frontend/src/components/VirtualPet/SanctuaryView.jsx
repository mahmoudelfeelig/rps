import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import CritterCard from './CritterCard';
import { toast } from 'react-toastify';

export default function SanctuaryView() {
  const { token } = useAuth();
  const [critters, setCritters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState({ coins: 0, food: {} });

  useEffect(() => {
    axios.get(`${API_BASE}/api/critters/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setCritters(res.data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch critters:", err);
      setLoading(false);
    });

    // Fetch initial resources
    axios.get(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.resources) setResources(res.data.resources);
    });
  }, [token]);

  const adoptStarter = (species, variant) => {
    axios.post(`${API_BASE}/api/critters/adopt`, {
      species,
      variant
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => window.location.reload());
  };

  const claimResources = () => {
    axios.get(`${API_BASE}/api/sanctuary/resources`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setResources(res.data.newInventory);
      toast.success(`+${res.data.coinsAdded} 🪙 +${Object.values(res.data.foodAdded).reduce((a,b)=>a+b,0)} 🍎`);
    }).catch(err => {
      toast.error("🚫 Resource claim failed.");
    });
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
        <h1 className="text-3xl font-bold mb-4 animate-fadeIn">🐣 Start Your Sanctuary</h1>
        <p className="mb-6 text-lg text-white/80">Choose a starter critter to adopt:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-fadeIn">
          <StarterCard name="Fluffaroo" variant="Golden" icon="☁️" onAdopt={adoptStarter} />
          <StarterCard name="Foxdini" variant="Shadow" icon="🦊" onAdopt={adoptStarter} />
          <StarterCard name="Meowmaid" variant="Pearl" icon="🐱‍🏖" onAdopt={adoptStarter} />
          <StarterCard name="Chonkabear" variant="Sleepy" icon="🐻" onAdopt={adoptStarter} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24 text-white min-h-screen bg-black">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold animate-fadeIn">🐾 Your Critters</h1>
        <button onClick={claimResources} className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm">
          Claim Resources
        </button>
      </div>

      <div className="bg-gray-800/40 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center justify-between text-sm shadow-inner">
        <div>🪙 Coins: <span className="text-yellow-300 font-semibold">{resources.coins}</span></div>
        {resources.food && Object.entries(resources.food).map(([key, val]) => (
          <div key={key}>
            🍎 {key}: <span className="text-green-300 font-semibold">{val}</span>
          </div>
        ))}
      </div>

        <div className="grid gap-6 animate-fadeIn grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {critters.map(c => <CritterCard key={c._id} critter={c} />)}
        </div>
    </div>
  );
}

function StarterCard({ name, variant, icon, onAdopt }) {
  return (
    <div
      className="border border-white/20 bg-white/5 p-4 rounded-xl text-center hover:scale-105 transition cursor-pointer"
      onClick={() => onAdopt(name, variant)}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-xs text-white/60">Variant: {variant}</p>
      <p className="mt-2 text-sm text-purple-300 font-medium">Adopt</p>
    </div>
  );
}
