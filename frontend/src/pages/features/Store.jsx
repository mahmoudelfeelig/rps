import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import { ActionButton, EmptyState, PageFrame, PageHero, StatCard } from '../../components/ui/page';
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

const resolveImage = (src) => {
  if (!src) return null;
  return src.startsWith('http') ? src : `${API_BASE}${src}`;
};

const Store = () => {
  const { token, refreshUser } = useAuth();

  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [balance, setBalance] = useState(0);

  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/store`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load items');
    }
  }, []);

  const fetchUserData = useCallback(async () => {
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
              image: resolveImage(img),
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
      toast.error(err.message || 'Failed to load user data');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchItems();
    fetchUserData();
  }, [token, fetchItems, fetchUserData]);

  const purchaseItem = async (itemId) => {
  if (isPurchasing) return;
  setIsPurchasing(true);
  try {
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

    toast.success(`${product.name} purchased`, { position: "bottom-right" });
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
    <PageFrame className="bg-[radial-gradient(circle_at_20%_8%,rgba(236,72,153,0.14),transparent_30%),radial-gradient(circle_at_82%_2%,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,#04070f_0%,#09090b_55%,#020202_100%)]">
      <div className="space-y-8">
        <PageHero
          title="Store"
          description="Buy badges, cosmetics, and power-ups. The shop is built around quick decisions, clear prices, and inventory you can actually scan."
          actions={<StatCard label="Balance" value={`${balance.toLocaleString()} coins`} tone="text-cyan-100" />}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-xl backdrop-blur-xl">
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
                          className="flex items-center rounded-2xl border border-white/10 bg-white/[0.055] p-3"
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

          <Card className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-xl backdrop-blur-xl">
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
                          className="group flex items-center rounded-2xl border border-white/10 bg-pink-300/8 p-3"
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
      <div className="mb-10 flex flex-col justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl sm:flex-row sm:items-center">
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
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                typeFilter === value
                  ? 'border-cyan-200/35 bg-cyan-300/14 text-cyan-50 shadow-[0_12px_40px_rgba(34,211,238,0.14)]'
                  : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="rounded-full border border-white/10 bg-black/20 p-3 transition hover:bg-white/10"
            aria-label="Toggle sort direction"
          >
            {sortAsc ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
          </button>
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            className="select px-4 py-3 text-sm outline-none"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </div>
      <motion.div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        layout
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.3, delay: index * 0.02 }}
              viewport={{ once: true }}
            >
              <Card className="group h-full overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.055] p-5 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.075]">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-white/10 bg-black/24 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                    {item.type}
                  </span>
                  <span className="text-sm font-semibold text-cyan-100">{item.stock} left</span>
                </div>
                <div className="my-6 flex justify-center">
                  {resolveImage(item.image) ? (
                    <img
                      src={resolveImage(item.image)}
                      alt={item.name}
                      className="h-24 w-24 rounded-[28px] object-cover shadow-[0_20px_60px_rgba(0,0,0,0.24)]"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-white/12 to-white/[0.03]">
                      <span className="text-4xl">{item.emoji || '◆'}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-black text-white">{item.name}</h3>
                <p className="mt-2 min-h-10 text-sm leading-5 text-white/62">
                  {item.effect || item.description || 'A store item for your account.'}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-white/38">Price</div>
                    <div className="font-semibold text-white">{Number(item.price || 0).toLocaleString()} coins</div>
                  </div>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <ActionButton
                      onClick={() => purchaseItem(item._id)}
                      disabled={item.stock <= 0 || isPurchasing}
                      variant="cyan"
                      className="px-5"
                    >
                      {item.stock > 0
                        ? isPurchasing ? 'Processing...' : 'Buy'
                        : 'Sold out'}
                    </ActionButton>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!filteredItems.length && (
        <EmptyState
          title="No items available"
          description="Try another filter or wait for the shop to refresh."
        />
      )}
      </div>
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
    </PageFrame>
  );
};

export default Store;
