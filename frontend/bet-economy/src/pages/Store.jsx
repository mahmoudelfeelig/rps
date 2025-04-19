import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import {
  BadgeCheck,
  Sparkles,
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
  Clock,
  PackageCheck,
} from 'lucide-react';

import avatar from '../assets/avatar.svg';
import coin from '../assets/coin.svg';
import giftBox from '../assets/gift_box.svg';
import goldMedal from '../assets/gold_medal.svg';
import silverMedal from '../assets/silver_medal.svg';
import heart from '../assets/heart.svg';
import lightningImage from '../assets/lightning.svg';
import star from '../assets/star.svg';

const allImages = [avatar, coin, giftBox, goldMedal, silverMedal, heart, lightningImage, star];

const Store = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  useEffect(() => {
    if (token) {
      fetchItems();
      fetchUserData();
    }
  }, [token]);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/store');
      const data = await res.json();
      // Random image assignment
      const randomized = data.map(item => ({
        ...item,
        image: allImages[Math.floor(Math.random() * allImages.length)],
      }));
      setItems(randomized);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Failed to load items');
    }
  };

const fetchUserData = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/store/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch user store data");
    const data = await res.json();
    setBalance(data.balance);
    setInventory(data.inventory);
    setPurchaseHistory(data.purchaseHistory);
  } catch (err) {
    console.error("Failed to load user data:", err);
  }
};

  const purchaseItem = async (itemId) => {
    try {
      const res = await fetch('http://localhost:5000/api/store/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      alert('Purchase successful!');
      fetchItems();
      fetchUserData();
    } catch (err) {
      alert(err.message || 'Purchase failed');
    }
  };

  const safeSort = (a, b) => {
    if (sortField === 'title') {
      const titleA = a.name?.toLowerCase() || '';
      const titleB = b.name?.toLowerCase() || '';
      return sortAsc ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
    }

    if (sortField === 'price') return sortAsc ? a.price - b.price : b.price - a.price;
    if (sortField === 'stock') return sortAsc ? a.stock - b.stock : b.stock - a.stock;
    return 0;
  };

  const filteredItems = items
    .filter(item => typeFilter === 'all' || item.type === typeFilter)
    .sort(safeSort);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-white">
      <motion.h1
        className="text-4xl font-bold mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛍️ Rapid Profit Store
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-4 bg-gradient-to-r from-purple-800/40 to-pink-800/20 border border-pink-400/40">
          <h3 className="text-xl font-semibold mb-2">💰 Balance</h3>
          <p className="text-2xl">{userBalance} Coins</p>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-blue-800/40 to-indigo-800/20 border border-blue-400/40">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <PackageCheck size={18} /> Inventory
          </h3>
          {inventory.length === 0 ? (
            <p className="text-sm text-white/70">No items owned yet.</p>
          ) : (
            <ul className="text-sm list-disc ml-4">
              {inventory.map((item, i) => (
                <li key={i}>{item.name}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4 bg-gradient-to-r from-gray-800/40 to-zinc-700/20 border border-gray-400/40">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Clock size={18} /> Purchase History
          </h3>
          {history.length === 0 ? (
            <p className="text-sm text-white/70">No past purchases.</p>
          ) : (
            <ul className="text-sm list-disc ml-4">
              {history.map((entry, i) => (
                <li key={i}>
                  {entry.name} - {new Date(entry.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: 'All', value: 'all', icon: <Filter size={14} /> },
            { label: 'Badges', value: 'badge', icon: <BadgeCheck size={14} /> },
            { label: 'Power-Ups', value: 'power-up', icon: <Sparkles size={14} /> },
            { label: 'Cosmetics', value: 'cosmetic', icon: <Sparkles size={14} /> },
          ].map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-4 py-1 rounded-full border text-sm flex items-center gap-1 transition ${
                typeFilter === value
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-black'
                  : 'border-gray-600'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2 border border-gray-600 rounded-full hover:bg-gray-800 transition"
          >
            {sortAsc ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
          </button>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-black border border-pink-500 text-sm text-white rounded px-3 py-1"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="stock">Rarity</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center mb-4">{error}</div>
      )}

      <motion.div
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-tr from-pink-400/10 to-purple-400/10 border border-pink-400/20 p-6 rounded-2xl backdrop-blur-md shadow-xl hover:scale-[1.02] transition-all">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-center text-pink-300">
                {item.name}
              </h3>
              <p className="text-center text-sm text-white/60 mt-1 mb-3">
                ${item.price} • Stock: {item.stock}
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => purchaseItem(item._id)}
                  className="px-4 py-1 text-sm"
                >
                  Purchase
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Store;
