import React, { useState, useCallback } from "react";
import { motion } from 'framer-motion';
import CoinCatcher  from "./CoinCatcher";
import CritterMatch from "./CritterMatch";
import DodgeNDash   from "./DodgeNDash";


export default function MiniGameHub({ critter }) {
  const [game, setGame] = useState(null);
  const handleExit     = useCallback(() => setGame(null), []);

  if (game === "coin")   return <CoinCatcher  critter={critter} onExit={handleExit} />;
  if (game === "match")  return <CritterMatch critter={critter} onExit={handleExit} />;
  if (game === "dodge")  return <DodgeNDash   critter={critter} onExit={handleExit} />;

  return (
    <div>
      <div className="mb-3">
        <h4 className="font-semibold text-purple-300">Mini-games</h4>
        <p className="text-xs text-white/55">Short runs that feed the sanctuary loop.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Tile icon="🪙" label="Coin Catch" onClick={() => setGame("coin")} />
        <Tile icon="🂠" label="Critter Match" onClick={() => setGame("match")} />
        <Tile icon="💥" label="Dash Run" onClick={() => setGame("dodge")} />
      </div>
    </div>
  );
}

function Tile({ icon, label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/10 hover:bg-white/20 p-4 rounded-xl flex flex-col items-center gap-1 transition"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </motion.button>
  );
}
