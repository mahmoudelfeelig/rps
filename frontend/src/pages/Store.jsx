import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { API_BASE } from '../api';

const Store = () => {
  const { token } = useAuth();

  // store API list
  const [items, setItems] = useState([]);
  // user’s inventory reformatted
  const [inventory, setInventory] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [balance, setBalance] = useState(0);

  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [error, setError] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchItems();
    fetchUserData();
  }, [token]);

  // load public store
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/store`);
      const data = await res.json();
      setItems(data.map(i => ({
        ...i,
        image: `/assets/rps/${i.image}`
      })));
    } catch (err) {
      console.error(err);
      setError('Failed to load items');
    }
  };

  // load user’s inventory, balance & history
  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/store/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch store data');
      const data = await res.json();

      // reshape inventory entries into a flat array with real fields
      const inv = Array.isArray(data.inventory) ? data.inventory : [];
      const formatted = inv
        .map(entry => {
          // entry.item should be a populated StoreItem doc
          if (entry.item && entry.item._id) {
            return {
              _id:      entry.item._id,
              name:     entry.item.name,
              type:     entry.item.type,
              emoji:    entry.item.emoji,
              image:    entry.item.image ? `/assets/rps/${entry.item.image}` : null,
              price:    entry.item.price,
              quantity: entry.quantity || 1
            };
          }
          return null;
        })
        .filter(Boolean);

      setInventory(formatted);
      setPurchaseHistory(Array.isArray(data.purchaseHistory) ? data.purchaseHistory : []);
      setBalance(data.balance ?? 0);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load user data');
    }
  };

  // purchase handler
  const purchaseItem = async (itemId) => {
  if (isPurchasing) return;
  setIsPurchasing(true);
  try {
    setError("");
    const product = items.find(i => i._id === itemId);
    const res = await fetch(`${API_BASE}/api/store/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ itemId })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    // decrement stock locally
    setItems(prev =>
      prev.map(i => (i._id === itemId ? { ...i, stock: i.stock - 1 } : i))
    );

    toast.success(`${product.name} purchased!`, { position: "bottom-right" });

  } catch (err) {
    toast.error(err.message, { position: "bottom-right" });
  } finally {
    await fetchUserData();
    setIsPurchasing(false);
  }
};

  // group inventory by item._id
  const groupedInventory = Object.values(
    inventory.reduce((acc, item) => {
      const key = item._id;
      if (!acc[key]) {
        acc[key] = { ...item, count: 0, uniqueKey: key };
      }
      acc[key].count += item.quantity;
      return acc;
    }, {})
  );

  // sorting and filtering store items
  const safeSort = (a, b) => {
    if (sortField === 'title') {
      return sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortField === 'price') {
      return sortAsc ? a.price - b.price : b.price - a.price;
    }
    if (sortField === 'stock') {
      return sortAsc ? a.stock - b.stock : b.stock - a.stock;
    }
    return 0;
  };

  const filteredItems = items
    .filter(i => (typeFilter === 'all' || i.type === typeFilter) && i.stock > 0)
    .sort(safeSort);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-white">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />

      <motion.h1
        className="text-4xl font-bold mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >🛍️ Rapid Profit Store</motion.h1>

      {/* Balance / Inventory / History cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-4 bg-gradient-to-r from-purple-800/40 to-pink-800/20 border border-pink-400/40">
          <h3 className="text-xl font-semibold mb-2">💰 Balance</h3>
          <p className="text-2xl">{balance} Coins</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-indigo-400/30 rounded-xl backdrop-blur-lg">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedSection(expandedSection === 'inventory' ? null : 'inventory')
            }
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <PackageCheck size={20} className="text-indigo-400" />
              Inventory
              <span className="text-sm text-indigo-300 ml-2">
                ({groupedInventory.length})
              </span>
            </h3>
            <motion.div
              animate={{ rotate: expandedSection === 'inventory' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-indigo-400" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expandedSection === 'inventory' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="max-h-64 overflow-y-auto scrollable-pane pr-2">
                  {groupedInventory.length === 0 ? (
                    <p className="text-center text-sm text-white/60 py-4">
                      Your inventory is empty
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {groupedInventory.map(item => (
                        <div
                          key={item.uniqueKey}
                          className="flex items-center p-2 bg-indigo-900/20 rounded-lg"
                        >
                          <img
                            src={item.image || '/default-avatar.png'}
                            alt={item.name}
                            className="w-8 h-8 object-contain mr-2"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {item.name}
                            </p>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-indigo-300">
                                x{item.count}
                              </p>
                              <div className="text-xs text-indigo-400">
                                {item.type} • ${item.price}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-pink-400/30 rounded-xl backdrop-blur-lg">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedSection(expandedSection === 'history' ? null : 'history')
            }
          >
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock size={20} className="text-pink-400" />
              Purchase History
              <span className="text-sm text-pink-300 ml-2">
                ({purchaseHistory.length})
              </span>
            </h3>
            <motion.div
              animate={{ rotate: expandedSection === 'history' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-pink-400" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expandedSection === 'history' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="max-h-64 overflow-y-auto scrollable-pane pr-2">
                  {purchaseHistory.length === 0 ? (
                    <p className="text-center text-sm text-white/60 py-4">
                      No purchases yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {purchaseHistory.map(entry => (
                        <div
                          key={entry._id || entry.purchasedAt}
                          className="flex items-center p-3 bg-pink-900/10 rounded-lg group"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-pink-900/20 rounded-full flex items-center justify-center mr-3">
                            <Clock size={14} className="text-pink-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {entry.item?.name || 'Unknown Item'}
                              </p>
                              <span className="text-xs text-pink-300">
                                {new Date(entry.purchasedAt).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-pink-300">
                              {new Date(entry.purchasedAt).toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: 'All',       value: 'all',      icon: <Filter size={14}/> },
            { label: 'Badges',    value: 'badge',    icon: <BadgeCheck size={14}/> },
            { label: 'Power-Ups', value: 'power-up', icon: <Sparkles  size={14}/> },
            { label: 'Cosmetics', value: 'cosmetic', icon: <Sparkles  size={14}/> },
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
            {sortAsc ? <ArrowUpAZ size={16}/> : <ArrowDownAZ size={16}/>}
          </button>
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            className="bg-black border border-pink-500 text-sm text-white rounded px-3 py-1"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="stock">Rarity</option>
          </select>
        </div>
      </div>

      {/* Store Grid */}
      <motion.div
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        layout
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        <AnimatePresence>
          {filteredItems.map(item => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.3 }}
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
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => purchaseItem(item._id)}
                      className="px-4 py-1 text-sm"
                      disabled={item.stock <= 0 || isPurchasing}
                    >
                      {item.stock > 0
                        ? isPurchasing ? 'Processing...' : 'Purchase'
                        : 'Sold Out'}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* custom scrollbar */}
      <style>{`
        .scrollable-pane::-webkit-scrollbar { width: 6px; }
        .scrollable-pane::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1); border-radius: 3px;
        }
        .scrollable-pane::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3); border-radius: 3px;
        }
        .scrollable-pane::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
};

export default Store;
