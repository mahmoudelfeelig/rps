import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import TraitDisplay from "./TraitDisplay";
import CosmeticWardrobe from "./CosmeticWardrobe";
import MiniGameHub from "./mini/MiniGameHub";
import UnlockTraitModal from "./UnlockTraitModal";
import { API_BASE } from "../../api";
import { toast } from "react-toastify";
import ExpBar from "./ExpBar";

export default function CritterProfile({ critter }) {
  const [data, setData] = useState(critter);
  const [shards, setShards] = useState(0);
  const [modalOpen, setModal] = useState(false);
  const [inventory, setInventory] = useState({ food: {}, toys: {} });
  const [selectedFood, setSelectedFood] = useState("");
  const [selectedToy, setSelectedToy] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    setData(prev => prev._id !== critter._id ? critter : prev);
  }, [critter]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setShards(res.data.resources.shards);
      setInventory({
        food: res.data.resources.food || {},
        toys: res.data.resources.toys || {}
      });
    })
    .catch(console.error);
  }, [token, critter._id]);

  const handleFeed = () => {
    if (!selectedFood) {
      toast.error("Select a food item first.");
      return;
    }

    axios.post(`${API_BASE}/api/critters/feed/${data._id}`, {
      foodItem: selectedFood
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setData(res.data);
      toast.success("🍖 Fed successfully!");
    })
    .catch(err => {
      toast.error(`🚫 ${err.response?.data?.error || "Feeding failed."}`);
    });
  };

  const handlePlay = () => {
    if (!selectedToy) {
      toast.error("Select a toy first.");
      return;
    }

    axios.post(`${API_BASE}/api/critters/play/${data._id}`, {
      toyItem: selectedToy
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setData(res.data);
      toast.success("🎾 Play successful!");
    })
    .catch(err => {
      toast.error(`🚫 ${err.response?.data?.error || "Play failed."}`);
    });
  };

  const handleEvolve = () => {
    axios.post(`${API_BASE}/api/critters/evolve`, {
      critterId: data._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setData(res.data.critter);
      toast.success(`✨ ${res.data.critter.species} evolved!`);
    })
    .catch(err => {
      toast.error(`🚫 ${err.response?.data?.error || "Evolve failed."}`);
    });
  };

  const handleTraitUnlock = (trait, newShards) => {
    setData(d => ({
      ...d,
      // merge into the existing object‐map
      traits: {
        ...(d.traits || {}),
        [trait]: true
      }
    }));    setShards(newShards);
    setModal(false);
  };

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 mb-4 border border-white/10">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-purple-300 flex items-center gap-2">
          {data.species}
          <span className="text-xs text-white/60">Lvl {data.level}</span>
        </h4>
        <div className="flex items-center gap-2">
          <span>🔮 {shards}</span>
          <button
            disabled={shards < 50}
            onClick={() => setModal(true)}
            className="btn-secondary btn-sm"
          >
            Purchase Traits
          </button>
        </div>
      </div>

      <ExpBar experience={data.experience} level={data.level} />

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <img
          src={`/assets/critters/${data.species.toLowerCase()}.png`}
          alt={data.species}
          className="w-24 h-24 mx-auto sm:mx-0"
        />

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <select
                value={selectedFood}
                onChange={e => setSelectedFood(e.target.value)}
                className="w-full px-2 py-1 rounded bg-gray-700 text-white text-sm"
              >
                <option value="">🍖 Select Food</option>
                {Object.entries(inventory.food).map(([k, v]) => (
                  <option key={k} value={k}>{k} ({v})</option>
                ))}
              </select>
              <button onClick={handleFeed} className="btn-primary w-full mt-1">Feed</button>
            </div>
            <div>
              <select
                value={selectedToy}
                onChange={e => setSelectedToy(e.target.value)}
                className="w-full px-2 py-1 rounded bg-gray-700 text-white text-sm"
              >
                <option value="">🎾 Select Toy</option>
                {Object.entries(inventory.toys).map(([k, v]) => (
                  <option key={k} value={k}>{k} ({v})</option>
                ))}
              </select>
              <button onClick={handlePlay} className="btn-primary w-full mt-1">Play</button>
            </div>
          </div>

          {data.level >= 7 && !data.evolvedTo && (
            <button onClick={handleEvolve} className="btn-primary w-full">✨ Evolve</button>
          )}

          <TraitDisplay traits={data.traits} />
          <CosmeticWardrobe critter={data} updateCritter={setData} />

          <div className="mt-4">
            <MiniGameHub critter={data} />
          </div>
        </div>
      </div>

      <UnlockTraitModal
        critter={data}
        shards={shards}
        isOpen={modalOpen}
        onClose={() => setModal(false)}
        onUnlock={handleTraitUnlock}
      />
    </div>
  );
}
