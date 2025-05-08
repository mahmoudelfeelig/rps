import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE }    from '../../api';
import { useAuth }     from '../../context/AuthContext';
import { toast }       from 'react-toastify';
import classNames      from 'classnames';
import { Link }        from 'react-router-dom';
import { ArrowLeft }   from 'lucide-react';

const TABS = ['pets','foods','toys','cosmetics','shards'];

export default function ShopPage() {
  const { token } = useAuth();
  const [tab,    setTab]     = useState('pets');
  const [items,  setItems]   = useState({});
  const [balance,setBalance]= useState(0);
  const [petCoins,setPet]    = useState(0);
  const [loading,setLoad]    = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, uRes] = await Promise.all([
          axios.get(`${API_BASE}/api/shop/items`, { headers:{ Authorization:`Bearer ${token}` }}),
          axios.get(`${API_BASE}/api/user/me`,    { headers:{ Authorization:`Bearer ${token}` }})
        ]);
        setItems(sRes.data);
        setBalance(uRes.data.balance);
        setPet(uRes.data.resources.coins);
      } catch {
        toast.error('Failed to load shop');
      } finally {
        setLoad(false);
      }
    })();
  }, [token]);

  const buy = async (item) => {
    try {
      let url, body;
      if (item.type==='cosmetic') {
        url = '/api/shop/buy-cosmetic';
        body = { itemId:item._id };
      } else if (item.type==='pet') {
        url = '/api/shop/buy-pet';
        body = { species:item.name };
      } else {
        url = '/api/shop/buy';
        body = { itemId:item._id, quantity:item.quantity||1 };
      }
      await axios.post(`${API_BASE}${url}`, body, { headers:{ Authorization:`Bearer ${token}` }});
      toast.success(`Purchased ${item.name}!`);
      if (item.coinType==='user') setBalance(b=>b - item.price);
      else                      setPet(p=>p - item.price);

      // remove from UI
      setItems(prev => ({
        ...prev,
        [tab]: prev[tab].filter(i=>i._id!==item._id)
      }));
    } catch (e) {
      toast.error(e.response?.data?.error||'Purchase failed');
    }
  };

  if (loading) {
    return <div className="pt-24 text-center text-white">Loading shop…</div>;
  }

  return (
    <div className="pt-24 px-6 pb-10 min-h-screen bg-black text-white space-y-6">

      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/games/virtual-pet"
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition"
          title="Back to Sanctuary"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="flex-1 text-3xl font-bold text-center">🛍️ Pet Shop</h1>
      </div>

      <div className="flex gap-6 justify-center text-sm">
        <div>🪙 Coins: <span className="text-yellow-300">{balance}</span></div>
        <div>🦴 Pet Coins: <span className="text-green-300">{petCoins}</span></div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={classNames(
              "px-4 py-2 rounded text-sm transition",
              { 'bg-purple-700 text-white': tab===t },
              { 'bg-gray-700 text-gray-300': tab!==t }
            )}
          >
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {items[tab]?.map(item => (
          <div
            key={item._id}
            className="bg-gray-800 rounded-lg p-4 shadow flex flex-col justify-between"
          >
            <div>
              <h4 className="text-lg font-semibold mb-1">{item.name}</h4>
              {item.rarity && <div className="text-sm text-purple-300 mb-1">Rarity: {item.rarity}</div>}
              <p className="text-sm text-gray-400">
                {item.effect?.affectionBonus ? `+${item.effect.affectionBonus} ❤️ ` : ''}
                {item.effect?.expBonus       ? `+${item.effect.expBonus} XP`      : ''}
                {item.quantity              ? ` x${item.quantity}`              : ''}
              </p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-sm">
                💰 {item.price} {item.coinType==='user'? '🪙':'🦴'}
              </span>
              <button onClick={()=>buy(item)} className="btn-primary btn-sm">
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
