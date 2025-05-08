import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import TraitDisplay    from "./TraitDisplay";
import CosmeticWardrobe from "./CosmeticWardrobe";
import MiniGameHub      from "./mini/MiniGameHub";
import UnlockTraitModal from "./UnlockTraitModal";
import { API_BASE }     from "../../api";
import { toast }        from "react-toastify";
import ExpBar from './ExpBar';

export default function CritterProfile({ critter }) {
  const [data, setData]       = useState(critter);
  const [shards, setShards]   = useState(0);
  const [modalOpen, setModal] = useState(false);
  const { token } = useAuth();

  // Sync local state when parent critter changes
  useEffect(() => {
    setData(prev => prev._id !== critter._id ? critter : prev);
  }, [critter]);

  // Fetch shard balance on mount and when critter changes
  useEffect(() => {
    axios.get(`${API_BASE}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setShards(res.data.resources.shards))
    .catch(console.error);
  }, [token, critter._id]);

  const handleFeed = () => {
    axios.post(`${API_BASE}/api/critters/feed/${data._id}`, {}, {
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
    axios.post(`${API_BASE}/api/critters/play/${data._id}`, { toy: "ball" }, {
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

  // Called after a successful trait unlock
  const handleTraitUnlock = (trait, newShards) => {
    setData(d => ({ ...d, traits: [...d.traits, trait] }));
    setShards(newShards);
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
            Unlock Trait (50)
          </button>
        </div>
      </div>

       {/* EXP bar */}
      <ExpBar experience={data.experience} level={data.level} />

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <img
          src={`/assets/critters/${data.species.toLowerCase()}.png`}
          alt={data.species}
          className="w-24 h-24 mx-auto sm:mx-0"
        />

        <div className="flex-1 space-y-3">
          <div className="flex gap-2 justify-center sm:justify-start">
            <button onClick={handleFeed}  className="btn-primary">🍖 Feed</button>
            <button onClick={handlePlay}  className="btn-primary">🎾 Play</button>
            {data.level >= 7 && !data.evolvedTo && (
              <button onClick={handleEvolve} className="btn-primary">✨ Evolve</button>
            )}
          </div>

          <TraitDisplay    traits={data.traits} />
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
