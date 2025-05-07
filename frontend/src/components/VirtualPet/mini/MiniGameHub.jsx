import React, { useState, useCallback } from "react";
import CoinCatcher  from "./CoinCatcher";
import CritterMatch from "./CritterMatch";
import DodgeNDash   from "./DodgeNDash";

/**
 * Always mounts exactly one mini-game, never remounting it mid-play.
 */
export default function MiniGameHub({ critter }) {
  const [game, setGame] = useState(null);
  const handleExit     = useCallback(() => setGame(null), []);

  if (game === "coin")   return <CoinCatcher  critter={critter} onExit={handleExit} />;
  if (game === "match")  return <CritterMatch critter={critter} onExit={handleExit} />;
  if (game === "dodge")  return <DodgeNDash   critter={critter} onExit={handleExit} />;

  return (
    <div>
      <h4 className="font-semibold text-purple-300 mb-2">🎮 Mini-Games</h4>
      <div className="grid grid-cols-3 gap-4">
        <Tile icon="🪙" label="Coin"  onClick={() => setGame("coin")}  />
        <Tile icon="🂠" label="Match" onClick={() => setGame("match")} />
        <Tile icon="💥" label="Dodge" onClick={() => setGame("dodge")} />
      </div>
    </div>
  );
}

function Tile({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/10 hover:bg-white/20 p-4 rounded-xl flex flex-col items-center gap-1 transition"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}
