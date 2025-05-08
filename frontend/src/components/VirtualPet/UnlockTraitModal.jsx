import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { TRAIT_INFO } from './TraitDisplay';

const rarityColors = {
  common:   "text-gray-300",
  uncommon: "text-green-300",
  rare:     "text-blue-400",
  epic:     "text-purple-400"
};

const rarityCosts = {
  common:   30,
  uncommon: 50,
  rare:     75,
  epic:     100
};

export default function UnlockTraitModal({
  critter,
  shards,
  isOpen,
  onClose,
  onUnlock
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // because critter.traits is an object map now:
  const ownedTraits = critter.traits && typeof critter.traits === 'object'
    ? Object.keys(critter.traits)
    : [];
  const allTraits = Object.keys(TRAIT_INFO);
  const available = allTraits.filter(t => !ownedTraits.includes(t));

  const handleUnlock = async (trait) => {
    const rarity = TRAIT_INFO[trait]?.rarity || "common";
    const cost   = rarityCosts[rarity];
    if (shards < cost) {
      toast.error(`Not enough shards! (${cost} required)`);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/traits/unlock`,
        { critterId: critter._id, trait },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Unlocked ${trait}!`);
      onUnlock(trait, res.data.newShards);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unlock failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-[80vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Unlock Trait</h3>
        {available.length === 0 ? (
          <p className="text-sm">All traits unlocked!</p>
        ) : (
          <ul className="space-y-2">
            {available.map(trait => {
              const info   = TRAIT_INFO[trait];
              const rarity = info?.rarity || "common";
              const cost   = rarityCosts[rarity];
              return (
                <li key={trait} className="flex justify-between items-start">
                  <div className="pr-4">
                    <div className={`capitalize font-medium ${rarityColors[rarity]}`}>
                      {trait} ({rarity}, {cost}🔮)
                    </div>
                    <p className="text-xs text-gray-400">{info?.desc}</p>
                  </div>
                  <button
                    disabled={loading || shards < cost}
                    onClick={() => handleUnlock(trait)}
                    className="btn-primary btn-sm"
                  >
                    Unlock
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="text-sm text-gray-300 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
