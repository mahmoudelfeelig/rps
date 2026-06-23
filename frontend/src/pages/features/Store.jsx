import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
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
import { API_BASE } from '../../api';

const Store = () => {
  const { user, token, refreshUser } = useAuth();

  const [items, setItems] = useState([]);
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

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/store`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load items');
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/store/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch store data');
      const data = await res.json();

      const inv = Array.isArray(data.inventory) ? data.inventory : [];
      const formatted = inv
        .map(entry => {
          if (entry.item && entry.item._id) {
            const img = entry.item.image
            return {
              _id:      entry.item._id,
              name:     entry.item.name,
              type:     entry.item.type,
              emoji:    entry.item.emoji,
              description: entry.item.description,
              effect:   entry.item.effect,
              image: img
                ? (img.startsWith('http')
                  ? img
                  : `${API_BASE}${img}`)
                 : null,
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

    setItems(prev =>
      prev.map(i => (i._id === itemId ? { ...i, stock: i.stock - 1 } : i))
    );

    toast.success(`${product.name} purchased!`, { position: "bottom-right" });
    await refreshUser();
  } catch (err) {
    toast.error(err.message, { position: "bottom-right" });
  } finally {
    await fetchUserData();
    setIsPurchasing(false);
  }
};

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(180deg,#04070f_0%,#09090b_50%,#020202_100%)] px-4 pb-16 pt-24 text-white sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.section
          className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Store</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Rapid Profit Store</h1>
              <p className="mt-2 max-w-2xl text-white/65">
                Buy consumables, cosmetics, and power-ups from a cleaner storefront with less noise.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">Balance</div>
              <div className="mt-1 text-2xl font-semibold">{balance} Coins</div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedSection(expandedSection === 'inventory' ? null : 'inventory')
            }
          >
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <PackageCheck size={20} className="text-indigo-300" />
              Inventory
              <span className="ml-2 text-sm text-indigo-300">
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
                    <p className="py-4 text-center text-sm text-white/60">
                      Your inventory is empty
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {groupedInventory.map(item => (
                        <div
                          key={item.uniqueKey}
                          className="flex items-center rounded-lg bg-white/5 p-2"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="mr-2 h-8 w-8 object-contain"
                            />
                          ) : (
                            <div className="mr-2 flex h-8 w-8 items-center justify-center">
                              <span className="text-2xl">{item.emoji}</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-indigo-300">
                                {item.effect}
                              </p>
                              <p className="text-xs text-indigo-300">
                                x{item.count}
                              </p>
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

          <Card className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() =>
              setExpandedSection(expandedSection === 'history' ? null : 'history')
            }
          >
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <Clock size={20} className="text-pink-300" />
              Recent purchases
              <span className="ml-2 text-sm text-pink-300">
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
                    <p className="py-4 text-center text-sm text-white/60">
                      No purchases yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {purchaseHistory.map(entry => (
                        <div
                          key={entry._id || entry.purchasedAt}
                          className="group flex items-center rounded-lg bg-pink-900/10 p-3"
                        >
                          <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-900/20">
                            <Clock size={14} className="text-pink-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{entry.item?.name || 'Unknown Item'}</p>
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
      <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: 'All',       value: 'all',      icon: <Filter size={14}/> },
            { label: 'Badges',    value: 'badge',    icon: <BadgeCheck size={14}/> },
            { label: 'Power-Ups', value: 'power-up', icon: <Sparkles  size={14}/> },
            { label: 'Cosmetics', value: 'cosmetic', icon: <Sparkles  size={14}/> },
          ].map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`flex items-center gap-1 rounded-full border px-4 py-1 text-sm transition ${
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
            className="rounded-full border border-white/10 p-2 transition hover:bg-white/10"
          >
            {sortAsc ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
          </button>
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            className="rounded border border-white/10 bg-black/40 px-3 py-1 text-sm text-white"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </div>
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
              <Card className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl shadow-xl hover:scale-[1.02] transition-all">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 mx-auto mb-4"
                  />
                ) : (
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 mx-auto">
                    <span className="text-4xl">{item.emoji}</span>
                  </div>
                )}
                <h3 className="text-center text-lg font-bold text-white">
                  {item.name}
                </h3>
                <p className="text-sm text-center text-white/65 mt-1 mb-3">
                  {item.effect}
                </p>
                <p className="text-center text-sm text-white/55 mt-1 mb-3">
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
                        ? isPurchasing ? 'Processing...' : 'Buy'
                        : 'Sold Out'}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
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
