import React, { useState } from "react";
import CritterProfile from "./CritterProfile";
import { ChevronDownIcon } from "lucide-react";

export default function CritterCard({ critter }) {
  const [open, setOpen] = useState(false);
  const displayName = critter.variant || critter.species;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-800/40 via-gray-800/20 to-gray-800/10
                    hover:ring-2 hover:ring-purple-600/50 transition shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <img
          src={`/assets/critters/${critter.species.toLowerCase()}.png`}
          alt={displayName}
          className="w-16 h-16 shrink-0"
        />
        <div className="flex-1">
          {/* Show the unique variant name (or species if no variant) */}
          <h3 className="font-bold text-purple-400">{displayName}</h3>
          {/* Show the actual species, level, and affection */}
          <p className="text-xs text-white/60">
            <span className="italic">{critter.species}</span> • Lvl {critter.level} • ❤️ {critter.affection}
          </p>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* keep mounted; just toggle visibility */}
      <div className={`${open ? "block" : "hidden"}`}>
        <CritterProfile critter={critter} />
      </div>
    </div>
  );
}
