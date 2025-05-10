import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminInput from '../components/AdminInput';
import { Button } from '../components/ui/button';
import { RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../api';

export default function AdminPanel() {
  const { token, user } = useAuth();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // — Data
  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [logs, setLogs] = useState([]);

  // — Selections
  const [selUser, setSelUser] = useState(null);
  const [addFunds, setAddFunds] = useState('');
  const [selBet, setSelBet] = useState(null);

  // — For per-option odds edits
  const [optionOdds, setOptionOdds] = useState({});

  // — Creation form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [taskCategory, setTaskCategory] = useState('daily');
  const [taskGoalType, setTaskGoalType] = useState('');
  const [taskGoalAmount, setTaskGoalAmount] = useState('');

  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementCriteria, setAchievementCriteria] = useState('');
  const [achievementThreshold, setAchievementThreshold] = useState('');
  const [achievementDescription, setAchievementDescription] = useState('');
  const [achievementRewardValue, setAchievementRewardValue] = useState('');
  const [achievementIcon, setAchievementIcon] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemEffect, setItemEffect] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemStock, setItemStock] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemEffectType,   setItemEffectType]   = useState('');      // e.g. 'slots-luck'
  const [itemEffectValue,  setItemEffectValue]  = useState('');
  const [itemDescription,  setItemDescription]  = useState('');
  const [itemEmoji,        setItemEmoji]        = useState('');
  const [itemConsumable,   setItemConsumable]   = useState(true);
  const [itemStackable,    setItemStackable]    = useState(false);
  const [itemDuration,     setItemDuration]     = useState(0);

  const [betTitle, setBetTitle] = useState('');
  const [betDescription, setBetDescription] = useState('');
  const [betEndTime, setBetEndTime] = useState('');
  const [betOptions, setBetOptions] = useState([{ text: '', odds: '' }]);

  // — UI State
  const [showLogs, setShowLogs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // — Fetch lists & logs
  useEffect(() => {
    fetchUsers();
    fetchBets();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get(`${API_BASE}/api/admin/users`, { headers });
       const fresh = res.data;
       setUsers(fresh);
       if (selUser && !fresh.some(u => u.username === selUser.username)) {
         setSelUser(null);
       }  
  };

  const fetchBets = async () => {
    const res = await axios.get(`${API_BASE}/api/admin/bets`, { headers });
       const fresh = res.data;
       setBets(fresh);
       if (selBet && !fresh.some(b => b.title === selBet.title)) {
         setSelBet(null);
       }
    };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/logs`, { headers });
      setLogs(res.data);
    } finally {
      setLoadingLogs(false);
    }
  };

  // — User actions
  const handleAddFunds = async () => {
    if (!selUser || !addFunds) return;
    await axios.patch(
      `${API_BASE}/api/admin/balance/${selUser.username}`,
      { amount: Number(addFunds) },
      { headers }
    );
    setAddFunds('');
    fetchUsers();
    fetchLogs();
  };

  const handleBan = async () => {
    if (!selUser) return;
    if (!window.confirm(`Ban ${selUser.username}?`)) return;
    await axios.patch(
      `${API_BASE}/api/admin/status/user/${selUser.username}`,
      { status: 'banned' },
      { headers }
    );
    fetchUsers();
    fetchLogs();
  };

  // — Bet actions
  const updateOdds = async (betTitle, optionId, newOdds) => {
    await axios.patch(
      `${API_BASE}/api/admin/odds/${encodeURIComponent(betTitle)}/${optionId}`,
      { odds: Number(newOdds) },
      { headers }
    );
    fetchBets();
    fetchLogs();
  };

  const finalizeOption = async (betId, optionId) => {
    await axios.post(
      `${API_BASE}/api/bets/finalize`,
      { betId, optionId },
      { headers }
    );
    fetchBets();
    fetchLogs();
  };

  const createTask = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/tasks/create`,
        {
          title: taskTitle,
          description: taskDesc,
          reward: Number(taskReward),
          type: taskCategory,
          goalType: taskGoalType,
          goalAmount: Number(taskGoalAmount),
        },
        { headers }
      );
      alert('Task created');
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const createAchievement = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/achievements/create`,
        {
          title: achievementTitle,
          description: achievementDescription,
          criteria: achievementCriteria,
          threshold: Number(achievementThreshold),
          reward: Number(achievementRewardValue),
          icon: achievementIcon,
        },
        { headers }
      );
      alert('Achievement created');
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const createItem = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/store/create`,
        {
          name: itemName,
          type: itemType,
          effect: itemEffect,
          effectType: itemEffectType,
          effectValue: Number(itemEffectValue),
          price: Number(itemPrice),
          stock: Number(itemStock),
          image: itemImage,
        },
        { headers }
      );
      alert('Item created');
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const createBet = async () => {
    if (!betTitle || !betEndTime || !betOptions[0].text || !betOptions[0].odds) {
      return alert('Fill in all required bet fields');
    }
    try {
      await axios.post(
        `${API_BASE}/api/bets/create`,
        {
          title: betTitle,
          description: betDescription,
          endTime: new Date(betEndTime),
          options: betOptions.map(o => ({ text: o.text, odds: Number(o.odds) })),
        },
        { headers }
      );
      alert('Bet created');
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // — Render
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-pink-400 drop-shadow">Admin Panel</h1>
          <span className="px-4 py-1 bg-white/10 text-white text-sm rounded-full border border-white/10 backdrop-blur">
            🔒 Superuser: {user?.username}
          </span>
        </header>

        {/* User Management */}
        <section>
          <h2 className="text-xl font-semibold mb-2">👥 User Management</h2>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto mb-4">
            {users.map(u => (
              <div
                key={u.username}
                onClick={() => { setSelUser(u); setAddFunds(''); }}
                className={`p-2 rounded cursor-pointer ${
                  selUser?.username === u.username
                    ? 'bg-purple-600'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="font-medium">{u.username}</div>
                <div className="text-sm text-gray-300">${u.balance.toLocaleString()}</div>
                {u.status === 'banned' && (
                  <div className="text-xs text-red-400">BANNED</div>
                )}
              </div>
            ))}
          </div>
          {selUser && (
            <div className="bg-white/5 p-4 rounded-xl space-y-4">
              <div className="font-semibold">Selected: {selUser.username}</div>
              <div className="flex gap-2 items-center">
                <AdminInput
                  label="Add Funds"
                  type="number"
                  value={addFunds}
                  onChange={e => setAddFunds(e.target.value)}
                />
                <button
                  onClick={handleAddFunds}
                  className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded"
                >
                  +${addFunds || '0'}
                </button>
              </div>
              <button
                onClick={handleBan}
                className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded"
              >
                🚫 Ban User
              </button>
            </div>
          )}
        </section>

        {/* 🎲 Bet Management */}
        <section>
          <h2 className="text-xl font-semibold mb-2">🎲 Bet Management</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {bets.map(bet => (
              <div key={bet.title}>
                <button
                  onClick={() => setSelBet(selBet?.title === bet.title ? null : bet)}
                  className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded flex justify-between items-center"
                >
                  <span>{bet.title}</span>
                  {selBet?.title === bet.title ? <ChevronUp /> : <ChevronDown />}
                </button>

                {selBet?.title === bet.title && (
                  <div className="pl-4 mt-2 space-y-2">
                    {bet.options.map(opt => (
                      <div key={opt._id} className="flex justify-between items-center gap-4">
                        <div>
                          <span className="font-medium">{opt.text}</span>
                          <span className="ml-2 text-gray-300">({opt.odds})</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <AdminInput
                            label="Odds"
                            type="number"
                            value={optionOdds[opt._id] ?? opt.odds}
                            onChange={e =>
                              setOptionOdds(prev => ({
                                ...prev,
                                [opt._id]: e.target.value
                              }))
                            }
                            className="w-20"
                          />
                          <button
                            onClick={() =>
                              updateOdds(
                                bet.title,
                                opt._id,
                                optionOdds[opt._id] ?? opt.odds
                              )
                            }
                            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => finalizeOption(bet._id, opt._id)}
                            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded"
                          >
                            Finalize
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Create Task */}
        <section className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-blue-400 text-xl font-semibold">🧩 Create Task</h2>
          <AdminInput label="Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
          <AdminInput label="Description" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
          <AdminInput
            label="Reward"
            type="number"
            value={taskReward}
            onChange={e => setTaskReward(e.target.value)}
          />
          <AdminInput
            label="Category"
            value={taskCategory}
            onChange={e => setTaskCategory(e.target.value)}
            placeholder="daily / weekly / bonus"
          />
          <AdminInput
            label="Goal Type"
            value={taskGoalType}
            onChange={e => setTaskGoalType(e.target.value)}
            placeholder="betsPlaced / betsWon / storePurchases / logins"
          />
          <AdminInput
            label="Goal Amount"
            type="number"
            value={taskGoalAmount}
            onChange={e => setTaskGoalAmount(e.target.value)}
            placeholder="e.g. 5"
          />
          <button
            onClick={createTask}
            className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-md font-bold"
          >
            Create Task
          </button>
        </section>

        {/* Create Achievement */}
        <section className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-green-400 text-xl font-semibold">🏆 Create Achievement</h2>
          <AdminInput
            label="Title"
            value={achievementTitle}
            onChange={e => setAchievementTitle(e.target.value)}
          />
          <AdminInput
            label="Description"
            value={achievementDescription}
            onChange={e => setAchievementDescription(e.target.value)}
          />
          <AdminInput
            label="Criteria"
            value={achievementCriteria}
            onChange={e => setAchievementCriteria(e.target.value)}
            placeholder="betsPlaced, betsWon, storePurchases, logins, tasksCompleted"
          />
          <AdminInput
            label="Threshold"
            type="number"
            value={achievementThreshold}
            onChange={e => setAchievementThreshold(e.target.value)}
          />
          <AdminInput
            label="Reward Value"
            value={achievementRewardValue}
            onChange={e => setAchievementRewardValue(e.target.value)}
          />
          <AdminInput
            label="Icon"
            value={achievementIcon}
            onChange={e => setAchievementIcon(e.target.value)}
            placeholder="e.g. trophy.png"
          />
          <button
            onClick={createAchievement}
            className="bg-green-600 hover:bg-green-700 w-full py-2 rounded-md font-bold"
          >
            Create Achievement
          </button>
        </section>

        {/* Create Store Item */}
        <section className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-yellow-300 text-xl font-semibold">🛒 Create Store Item</h2>
          <AdminInput label="Name" value={itemName} onChange={e => setItemName(e.target.value)} />
          <AdminInput
            label="Type"
            value={itemType}
            onChange={e => setItemType(e.target.value)}
            placeholder="badge / power-up / cosmetic"
          />

          <AdminInput label="Effect" value={itemEffect} onChange={e => setItemEffect(e.target.value)} />
          <AdminInput
            label="Price"
            type="number"
            value={itemPrice}
            onChange={e => setItemPrice(e.target.value)}
          />
          <AdminInput
            label="Stock"
            type="number"
            value={itemStock}
            onChange={e => setItemStock(e.target.value)}
          />
          <AdminInput
            label="Image"
            value={itemImage}
            onChange={e => setItemImage(e.target.value)}
            placeholder="e.g. sword.png"
          />
            <label className="text-sm font-medium text-white/80">Effect Type</label>
              <select
                value={itemEffectType}
                onChange={e => setItemEffectType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="" disabled>-- select effect type --</option>
                <option value="extra-safe-click">🎯 Extra Safe Click</option>
                <option value="mine-reduction">🧨 Mine Reduction</option>
                <option value="slots-luck">🎰 Slots Luck</option>
                <option value="reward-multiplier">💰 Reward Multiplier</option>
                <option value="cosmetic">🎨 Cosmetic</option>
              </select>

          <AdminInput
            label="Effect Value"
            type="number"
            placeholder="effectValue"
            value={itemEffectValue}
            onChange={e => setItemEffectValue(e.target.value)}
          />
          <button
            onClick={createItem}
            className="bg-yellow-500 hover:bg-yellow-600 w-full py-2 rounded-md font-bold"
          >
            Create Item
          </button>
        </section>

        {/* Create Bet */}
        <section className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-purple-300 text-xl font-semibold">🎯 Create Bet</h2>
          <AdminInput label="Title" value={betTitle} onChange={e => setBetTitle(e.target.value)} />
          <AdminInput
            label="Description"
            value={betDescription}
            onChange={e => setBetDescription(e.target.value)}
          />
          <AdminInput
            label="End Time"
            type="datetime-local"
            value={betEndTime}
            onChange={e => setBetEndTime(e.target.value)}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Options</label>
            {betOptions.map((o, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <input
                  className="px-3 py-2 rounded bg-white/10 text-white"
                  placeholder="Text"
                  value={o.text}
                  onChange={e => {
                    const a = [...betOptions];
                    a[i].text = e.target.value;
                    setBetOptions(a);
                  }}
                />
                <input
                  className="px-3 py-2 rounded bg-white/10 text-white"
                  placeholder="Odds"
                  type="number"
                  value={o.odds}
                  onChange={e => {
                    const a = [...betOptions];
                    a[i].odds = e.target.value;
                    setBetOptions(a);
                  }}
                />
              </div>
            ))}
            <button
              onClick={() => setBetOptions([...betOptions, { text: '', odds: '' }])}
              className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold"
            >
              + Add Option
            </button>
          </div>
          <button
            onClick={createBet}
            className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-md font-bold mt-4"
          >
            Create Bet
          </button>
        </section>

        {/* Admin Logs */}
        <section className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-pink-300 text-xl font-semibold">📜 Admin Logs</h2>
            <div className="flex gap-2">
              {showLogs && (
                <Button
                  variant="outline"
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className={loadingLogs ? "animate-spin" : ""} />
                  Refresh
                </Button>
              )}
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="bg-pink-600 hover:bg-pink-700 py-2 px-4 rounded-md font-bold text-sm"
              >
                {showLogs ? 'Hide Logs' : 'Show Logs'}
              </button>
            </div>
          </div>

          {showLogs && (
            <div className="h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 mt-4">
              {logs.length === 0 && (
                <div className="text-center text-gray-400">No logs yet.</div>
              )}
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="col-span-2">
                    <span className="text-xs font-mono text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="col-span-10 flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.action.includes('Update') ? 'bg-green-500' :
                        log.action.includes('Create') ? 'bg-blue-500' :
                        'bg-pink-500'
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-pink-300">{log.action}</span>
                      <p className="text-gray-300 text-sm mt-1">{log.details}</p>
                      <span className="block text-xs text-gray-400 mt-1">
                        Admin: {log.admin} • Target: {log.target}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
