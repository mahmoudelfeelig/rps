import React, { useState, useCallback } from "react";
import { motion } from 'framer-motion';
import { CircleDollarSign, Grid3X3, Zap } from 'lucide-react';
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
      <div className="grid gap-3 sm:grid-cols-3">
        <Tile icon={CircleDollarSign} label="Coin Catch" desc="Timing run" onClick={() => setGame("coin")} />
        <Tile icon={Grid3X3} label="Critter Match" desc="Memory board" onClick={() => setGame("match")} />
        <Tile icon={Zap} label="Dash Run" desc="Reaction lane" onClick={() => setGame("dodge")} />
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, desc, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 text-left transition hover:bg-white/[0.09]"
    >
      <Icon className="mb-3 h-5 w-5 text-cyan-100" />
      <span className="block text-sm font-black">{label}</span>
      <span className="mt-1 block text-xs text-white/45">{desc}</span>
    </motion.button>
  );
}
