import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import TraitDisplay     from "./TraitDisplay";
import CosmeticWardrobe from "./CosmeticWardrobe";
import MiniGameHub      from "./mini/MiniGameHub";
import { API_BASE }     from "../../api";
import { toast }        from "react-toastify";

export default function CritterProfile({ critter }) {
  const [data, setData] = useState(critter);
  useEffect(() => {
    setData(prev => prev._id !== critter._id ? critter : prev);
  }, [critter]);

  const { token } = useAuth();

  const handleFeed = () => {
    axios.post(`${API_BASE}/api/critters/feed/${data._id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setData(res.data);
      toast.success("🍖 Fed successfully!");
    }).catch(err => {
      toast.error(`🚫 ${err.response?.data?.error || "Feeding failed."}`);
    });
  };

  const handlePlay = () => {
    axios.post(`${API_BASE}/api/critters/play/${data._id}`, { toy: "ball" }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setData(res.data);
      toast.success("🎾 Play successful!");
    }).catch(err => {
      toast.error(`🚫 ${err.response?.data?.error || "Play failed."}`);
    });
  };

  const handleEvolve = () => {
    axios.post(`${API_BASE}/api/critters/evolve`, {
      critterId: data._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setData(res.data.critter);
      toast.success(`✨ ${res.data.critter.species} evolved!`);
    }).catch(err => {
      toast.error(`🚫 ${err.response?.data?.error || "Evolve failed."}`);
    });
  };

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 mb-4 border border-white/10">
      <h4 className="font-semibold text-purple-300 flex items-center gap-2">
        {data.species} <span className="text-xs text-white/60">Lvl {data.level}</span>
      </h4>

      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <img
          src={`/assets/critters/${data.species.toLowerCase()}.png`}
          alt={data.species}
          className="w-24 h-24 mx-auto sm:mx-0"
        />

        <div className="flex-1 space-y-3">
          <div className="flex gap-2 justify-center sm:justify-start">
            <button onClick={handleFeed} className="btn-primary">🍖 Feed</button>
            <button onClick={handlePlay} className="btn-primary">🎾 Play</button>
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
    </div>
  );
}
