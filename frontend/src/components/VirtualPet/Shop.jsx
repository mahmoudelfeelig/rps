import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import classNames from 'classnames';

const TABS = ['pets', 'foods', 'toys', 'cosmetics', 'shards'];

export default function ShopPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState('pets');
  const [items, setItems] = useState({});
  const [balance, setBalance] = useState(0);
  const [petCoins, setPetCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopRes = await axios.get(`${API_BASE}/api/shop/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(shopRes.data);

        const userRes = await axios.get(`${API_BASE}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalance(userRes.data.balance);
        setPetCoins(userRes.data.resources?.coins || 0);
      } catch {
        toast.error('Failed to load shop items or balance.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const buyItem = async (item) => {
    try {
      if (item.type === 'cosmetic') {
        await axios.post(`${API_BASE}/api/shop/buy-cosmetic`, {
          itemId: item._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (item.type === 'pet') {
        await axios.post(`${API_BASE}/api/shop/buy-pet`, {
          species: item.name
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE}/api/shop/buy`, {
          itemId: item._id,
          quantity: item.quantity || 1
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
  
      toast.success(`Purchased ${item.name}!`);
  
      if (item.coinType === 'user') {
        setBalance(prev => prev - item.price);
      } else {
        setPetCoins(prev => prev - item.price);
      }
  
      // Remove item from UI immediately
      setItems(prev => {
        const updated = { ...prev };
        updated[tab] = updated[tab].filter(i => i._id !== item._id);
        return updated;
      });
  
    } catch (err) {
      toast.error(err.response?.data?.error || 'Purchase failed');
    }
  };
  
  

  const renderItem = (item) => (
    <div key={item._id} className="bg-gray-800 rounded-lg p-4 shadow-md text-white flex flex-col justify-between">
      <div>
        <h4 className="text-lg font-semibold mb-1">{item.name}</h4>
        {item.rarity && <div className="text-sm text-purple-300 mb-1">Rarity: {item.rarity}</div>}
        <p className="text-sm text-gray-400">
          {item.effect?.affectionBonus ? `+${item.effect.affectionBonus} ❤️ ` : ''}
          {item.effect?.expBonus ? `+${item.effect.expBonus} XP` : ''}
          {item.quantity ? `x${item.quantity}` : ''}
        </p>
      </div>
      <div className="mt-3 flex justify-between items-center">
      <span className="text-sm">
        💰 {item.price} {item.coinType === 'user' ? '🪙' : '🦴 Pet Coins'}
      </span>
        <button onClick={() => buyItem(item)} className="btn-primary btn-sm">
          Buy
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center text-white pt-24">Loading shop…</div>;
  }

  return (
    <div className="p-6 pt-24 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">🛍️ Pet Shop</h1>

      <div className="flex gap-4 mb-4 text-sm">
        <div>🪙 Coins: <span className="text-yellow-300">{balance}</span></div>
        <div>🦴 Pet Coins: <span className="text-green-300">{petCoins}</span></div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={classNames("px-4 py-2 rounded text-sm", {
              "bg-purple-700 text-white": tab === t,
              "bg-gray-700 text-gray-300": tab !== t
            })}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {items[tab]?.map(renderItem)}
      </div>
    </div>
  );
}
