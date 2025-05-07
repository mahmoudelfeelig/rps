import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function CosmeticWardrobe({ critter, updateCritter }) {
  const [cosmetics, setCosmetics] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    axios.get(`${API_BASE}/api/cosmetics`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCosmetics(res.data));
  }, [token]);

  const handleEquip = (slot, itemId) => {
    if (critter.equippedCosmetics?.[slot] === itemId) {
      toast.info("Already equipped.");
      return;
    }
  
    axios.post(`${API_BASE}/api/critters/equip-cosmetic`, {
      critterId: critter._id,
      slot,
      itemId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      updateCritter(res.data);
      toast.success(`✨ Equipped ${res.data.equippedCosmetics[slot]}!`);
    }).catch(err => {
      const msg = err.response?.data?.error || 'Equip failed.';
      toast.error(`🚫 ${msg}`);
    });
  };
  

  const ownedCosmetics = cosmetics.filter(c =>
    (c.availableTo.includes(critter.species) || c.availableTo.includes('any')) &&
    critter.ownerInventory?.includes(c._id)
  );

  return (
    <div className="wardrobe mt-4">
  <h4 className="font-semibold mb-2">🧢 Cosmetics</h4>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {ownedCosmetics.map(c => {
      const isEquipped = critter.equippedCosmetics?.[c.slot] === c._id;
      return (
        <div key={c._id} className="text-center relative group">
          <img
            src={`/assets/cosmetics/${c._id}.png`}
            alt={c.name}
            className={`w-16 h-16 mx-auto mb-1 ${isEquipped ? 'ring-4 ring-purple-500 rounded-full' : ''}`}
          />
          <button
            onClick={() => handleEquip(c.slot, c._id)}
            className="text-sm text-purple-400 hover:underline"
          >
            {isEquipped ? 'Equipped' : `Equip ${c.name}`}
          </button>
        </div>
      );
    })}
    {ownedCosmetics.length === 0 && (
      <p className="text-sm text-white/40 col-span-full">No cosmetics owned for this species.</p>
    )}
  </div>
</div>
  );
}