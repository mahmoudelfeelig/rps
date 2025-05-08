import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast }   from 'react-toastify';
import TRAIT_INFO  from './TraitDisplay'; // exports mapping trait→description

export default function UnlockTraitModal({
  critter,
  shards,
  isOpen,
  onClose,
  onUnlock
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // All possible traits
  const allTraits = Object.keys(TRAIT_INFO);
  // Filter out those critter already has
  const available = allTraits.filter(t => !critter.traits.includes(t));

  const handleUnlock = async (trait) => {
    if (shards < 50) {
      toast.error('Not enough shards!');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/traits/unlock`,
        { critterId: critter._id, trait },
        { headers: { Authorization: `Bearer ${token}` }}
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
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Unlock Trait (50 🔮)</h3>
        {available.length === 0 ? (
          <p className="text-sm">All traits unlocked!</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-auto">
            {available.map(trait => (
              <li key={trait} className="flex justify-between items-center">
                <div>
                  <strong className="capitalize">{trait}</strong>
                  <p className="text-xs text-gray-400">{TRAIT_INFO[trait]}</p>
                </div>
                <button
                  disabled={loading}
                  onClick={() => handleUnlock(trait)}
                  className="btn-primary btn-sm"
                >
                  Unlock
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-sm text-gray-300 hover:underline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
