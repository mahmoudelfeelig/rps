import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { applyFallbackImage, cosmeticFallback } from '../../utils/assetFallbacks';

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
      toast.success(`Equipped ${res.data.equippedCosmetics[slot]}.`);
    }).catch(err => {
      const msg = err.response?.data?.error || 'Equip failed.';
      toast.error(msg);
    });
  };
  

  const ownedCosmetics = cosmetics.filter(c =>
    (c.availableTo.includes(critter.species) || c.availableTo.includes('any')) &&
    critter.ownerInventory?.includes(c._id)
  );

  return (
    <div className="mt-4 rounded-[28px] border border-white/10 bg-black/20 p-4">
  <div className="mb-3">
    <h4 className="font-semibold">Cosmetics</h4>
    <p className="text-xs text-white/45">Equip owned visual items for this critter.</p>
  </div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {ownedCosmetics.map(c => {
      const isEquipped = critter.equippedCosmetics?.[c.slot] === c._id;
      return (
        <div key={c._id} className="group relative rounded-3xl border border-white/10 bg-white/[0.045] p-3 text-center transition hover:bg-white/[0.08]">
          <img
            src={`/assets/cosmetics/${c._id}.png`}
            alt={c.name}
            className={`mx-auto mb-2 h-16 w-16 rounded-2xl object-contain ${isEquipped ? 'ring-2 ring-cyan-200/70' : ''}`}
            onError={(e) => applyFallbackImage(e, cosmeticFallback(c.slot))}
          />
          <button
            onClick={() => handleEquip(c.slot, c._id)}
            className="text-sm font-semibold text-cyan-100 hover:text-white"
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
