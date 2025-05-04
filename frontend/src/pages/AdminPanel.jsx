import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminInput from '../components/AdminInput';
import { Button } from "../components/ui/button";
import { RefreshCcw } from "lucide-react";
import { cn } from "../lib/utils";
import axios from 'axios';
import API_BASE from '../api';

const AdminPanel = () => {
  const { token, user } = useAuth();

  const [targetUsername, setTargetUsername] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [oddsBetTitle, setOddsBetTitle] = useState('');
  const [oddsValue, setOddsValue] = useState('');
  const [logs, setLogs] = useState([]);
  const [banReason, setBanReason] = useState('');

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

  const [betTitle, setBetTitle] = useState('');
  const [betDescription, setBetDescription] = useState('');
  const [betEndTime, setBetEndTime] = useState('');
  const [betOptions, setBetOptions] = useState([{ text: '', odds: '' }]);

  const [finalizeBetTitle, setFinalizeBetTitle] = useState('');
  const [winningOptionIndex, setWinningOptionIndex] = useState('');

  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const updateBalance = async () => {
    try {
      const res = await axios.patch(
        `${API_BASE}/api/admin/balance/${targetUsername}`,
        { amount: Number(balanceAmount) },
        { headers }
      );
      alert(res.data.message || 'Balance updated');
      await fetchLogs();
    } catch (err) {
      console.error('Error updating balance:', err);
      alert(err.response?.data?.message || 'Error updating balance');
    }
  };

  const setOdds = async () => {
    try {
      const res = await axios.patch(
        `API_BASE/api/admin/odds/${encodeURIComponent(oddsBetTitle)}`,
        { odds: Number(oddsValue) },
        { headers }
      );
      alert(res.data.message || 'Odds updated');
      await fetchLogs();
    } catch (err) {
      console.error('Error setting odds:', err);
      alert(err.response?.data?.message || 'Error setting odds');
    }
  };

  const createBet = async () => {
    if (!betTitle || !betEndTime || betOptions.length === 0 || !betOptions[0].text || !betOptions[0].odds) {
      return alert('Please fill out all required fields for the bet.');
    }
  
    const payload = {
      title: betTitle,
      description: betDescription,
      endTime: new Date(betEndTime),
      options: betOptions.map(opt => ({ text: opt.text, odds: Number(opt.odds) })),
    };
  
    try {
      const res = await axios.post(`${API_BASE}/api/bets/create`, payload, { headers });
      alert(res.data.message || 'Bet created');
      await fetchLogs();
    } catch (err) {
      console.error('Error creating bet:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error creating bet');
    }
  };

  const finalizeBet = async () => {
    if (!finalizeBetTitle || winningOptionIndex === '') {
      return alert('Please provide a Bet Title and a winning option index.');
    }
  
    try {
      const betRes = await axios.get(
        `${API_BASE}/api/bets/title/${encodeURIComponent(finalizeBetTitle)}`
      );
      const options = betRes.data.options;
      
      if (winningOptionIndex < 0 || winningOptionIndex >= options.length) {
        return alert('Invalid option index');
      }

      const resultOption = options[winningOptionIndex].text;
      
      const res = await axios.post(
        `${API_BASE}/api/bets/finalize`,
        { betTitle: finalizeBetTitle, result: resultOption },
        { headers }
      );
      
      alert(res.data.message || 'Bet finalized successfully.');
      await fetchLogs();
      
      setFinalizeBetTitle('');
      setWinningOptionIndex('');
    } catch (err) {
      console.error('Error finalizing bet:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error finalizing bet');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/logs`, { headers });
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const banUser = async () => {
    try {
      const res = await axios.patch(
        `${API_BASE}/api/admin/status/user/${targetUsername}`,
        { status: 'banned', reason: banReason },
        { headers }
      );
      alert(res.data.message || 'User status updated');
      await fetchLogs();
    } catch (err) {
      console.error('Error banning user:', err);
      alert(err.response?.data?.message || 'Error banning user');
    }
  };

  const createTask = async () => {
    try {
      const res = await axios.post(
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
      alert(res.data.message || 'Task created');
      await fetchLogs();
    } catch (err) {
      console.error('Error creating task:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const createAchievement = async () => {
    try {
      const res = await axios.post(
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
      alert(res.data.message || 'Achievement created');
      await fetchLogs();
    } catch (err) {
      console.error('Error creating achievement:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error creating achievement');
    }
  };

  const createItem = async () => {
    const payload = {
      name: itemName,
      type: itemType,
      effect: itemEffect,
      price: Number(itemPrice),
      stock: Number(itemStock),
      image: itemImage,
    };

    if (!itemName || !itemType || !itemEffect || !itemPrice || !itemStock || !itemImage) {
      return alert('Please fill out all item fields!');
    }

    try {
      const res = await axios.post(`${API_BASE}/api/store/create`, payload, { headers });
      alert(res.data.message || 'Item created');
      await fetchLogs();
    } catch (err) {
      console.error('Error creating item:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error creating item');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-pink-400 drop-shadow">Admin Panel</h1>
          <span className="px-4 py-1 bg-white/10 text-white text-sm rounded-full border border-white/10 backdrop-blur">
            🔒 Superuser: {user?.username || 'Unknown'}
          </span>
        </header>

        {/* Balance and Odds */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
            <h2 className="text-pink-300 text-xl font-semibold">💰 Update Balance</h2>
            <AdminInput 
              label="Username" 
              value={targetUsername} 
              onChange={(e) => setTargetUsername(e.target.value)} 
              placeholder="Enter username"
            />
            <AdminInput 
              label="Amount" 
              type="number" 
              value={balanceAmount} 
              onChange={(e) => setBalanceAmount(e.target.value)} 
              placeholder="Amount to add" 
            />
            <button 
              onClick={updateBalance} 
              className="bg-pink-600 hover:bg-pink-700 w-full py-2 rounded-md font-bold"
            >
              Update Balance
            </button>
          </div>

          <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
            <h2 className="text-pink-300 text-xl font-semibold">🎲 Set Odds</h2>
            <AdminInput 
              label="Bet Title" 
              value={oddsBetTitle} 
              onChange={(e) => setOddsBetTitle(e.target.value)} 
              placeholder="Enter bet title" 
            />
            <AdminInput 
              label="Odds" 
              type="number" 
              value={oddsValue} 
              onChange={(e) => setOddsValue(e.target.value)} 
              placeholder="e.g. 2.5" 
            />
            <button 
              onClick={setOdds} 
              className="bg-pink-600 hover:bg-pink-700 w-full py-2 rounded-md font-bold"
            >
              Set Odds
            </button>
          </div>
        </div>

        {/* Ban user */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-red-400 text-xl font-semibold">🚫 Ban User</h2>
          <AdminInput 
            label="Username" 
            value={targetUsername} 
            onChange={(e) => setTargetUsername(e.target.value)} 
            placeholder="Enter username"
          />
          <AdminInput 
            label="Reason" 
            value={banReason} 
            onChange={(e) => setBanReason(e.target.value)} 
            placeholder="Ban reason"
          />
          <button 
            onClick={banUser} 
            className="bg-red-600 hover:bg-red-700 w-full py-2 rounded-md font-bold"
          >
            Ban User
          </button>
        </div>

        {/* Create Task */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-blue-400 text-xl font-semibold">🧩 Create Task</h2>
          <AdminInput label="Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          <AdminInput label="Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
          <AdminInput 
            label="Reward" 
            type="number" 
            value={taskReward} 
            onChange={(e) => setTaskReward(e.target.value)} 
          />
          <AdminInput 
            label="Category" 
            value={taskCategory} 
            onChange={(e) => setTaskCategory(e.target.value)} 
            placeholder="daily / weekly / bonus" 
          />
          <AdminInput 
            label="Goal Type" 
            value={taskGoalType} 
            onChange={(e) => setTaskGoalType(e.target.value)} 
            placeholder="betsPlaced / betsWon / storePurchases / logins" 
          />
          <AdminInput 
            label="Goal Amount" 
            type="number" 
            value={taskGoalAmount} 
            onChange={(e) => setTaskGoalAmount(e.target.value)} 
            placeholder="e.g. 5" 
          />
          <button 
            onClick={createTask} 
            className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-md font-bold"
          >
            Create Task
          </button>
        </div>

        {/* Create Achievement */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-green-400 text-xl font-semibold">🏆 Create Achievement</h2>
          <AdminInput label="Title" value={achievementTitle} onChange={(e) => setAchievementTitle(e.target.value)} />
          <AdminInput 
            label="Description" 
            value={achievementDescription} 
            onChange={(e) => setAchievementDescription(e.target.value)} 
          />
          <AdminInput 
            label="Criteria" 
            value={achievementCriteria} 
            onChange={(e) => setAchievementCriteria(e.target.value)} 
            placeholder="betsPlaced, betsWon, storePurchases, logins, tasksCompleted" 
          />
          <AdminInput 
            label="Threshold" 
            type="number" 
            value={achievementThreshold} 
            onChange={(e) => setAchievementThreshold(e.target.value)} 
            placeholder="e.g. 5" 
          />
          <AdminInput 
            label="Reward Value" 
            value={achievementRewardValue} 
            onChange={(e) => setAchievementRewardValue(e.target.value)} 
            placeholder="e.g. 100" 
          />
          <AdminInput 
            label="Icon Filename" 
            value={achievementIcon} 
            onChange={(e) => setAchievementIcon(e.target.value)} 
            placeholder="e.g. trophy.png" 
          />
          <button 
            onClick={createAchievement} 
            className="bg-green-600 hover:bg-green-700 w-full py-2 rounded-md font-bold"
          >
            Create Achievement
          </button>
        </div>

        {/* Create Store Item */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-yellow-300 text-xl font-semibold">🛒 Create Store Item</h2>
          <AdminInput label="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          <AdminInput 
            label="Type" 
            value={itemType} 
            onChange={(e) => setItemType(e.target.value)} 
            placeholder="badge / power-up / cosmetic" 
          />
          <AdminInput label="Effect" value={itemEffect} onChange={(e) => setItemEffect(e.target.value)} />
          <AdminInput 
            label="Price" 
            type="number" 
            value={itemPrice} 
            onChange={(e) => setItemPrice(e.target.value)} 
          />
          <AdminInput 
            label="Stock" 
            type="number" 
            value={itemStock} 
            onChange={(e) => setItemStock(e.target.value)} 
          />
          <AdminInput 
            label="Image Filename" 
            value={itemImage} 
            onChange={(e) => setItemImage(e.target.value)} 
            placeholder="e.g. sword.png" 
          />
          <button 
            onClick={createItem} 
            className="bg-yellow-500 hover:bg-yellow-600 w-full py-2 rounded-md font-bold"
          >
            Create Item
          </button>
        </div>

        {/* Create Bet */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-purple-300 text-xl font-semibold">🎯 Create Bet</h2>
          <AdminInput label="Title" value={betTitle} onChange={(e) => setBetTitle(e.target.value)} />
          <AdminInput 
            label="Description" 
            value={betDescription} 
            onChange={(e) => setBetDescription(e.target.value)} 
          />
          <AdminInput 
            label="End Time" 
            type="datetime-local" 
            value={betEndTime} 
            onChange={(e) => setBetEndTime(e.target.value)} 
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Options</label>
            {betOptions.map((opt, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  className="px-3 py-2 rounded bg-white/10 text-white"
                  placeholder="Option Text"
                  value={opt.text}
                  onChange={(e) => {
                    const newOptions = [...betOptions];
                    newOptions[idx].text = e.target.value;
                    setBetOptions(newOptions);
                  }}
                />
                <input
                  type="number"
                  className="px-3 py-2 rounded bg-white/10 text-white"
                  placeholder="Odds"
                  value={opt.odds}
                  onChange={(e) => {
                    const newOptions = [...betOptions];
                    newOptions[idx].odds = e.target.value;
                    setBetOptions(newOptions);
                  }}
                />
              </div>
            ))}
            <button
              onClick={() => setBetOptions([...betOptions, { text: '', odds: '' }])}
              className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold"
            >
              ➕ Add Option
            </button>
          </div>
          <button 
            onClick={createBet} 
            className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-md font-bold mt-4"
          >
            Create Bet
          </button>
        </div>

        {/* Finalize Bet */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-purple-400 text-xl font-semibold">✅ Finalize Bet</h2>
          <AdminInput
            label="Bet Title"
            value={finalizeBetTitle}
            onChange={(e) => setFinalizeBetTitle(e.target.value)}
            placeholder="Enter bet title"
          />
          <AdminInput
            label="Winning Option Index"
            type="number"
            value={winningOptionIndex}
            onChange={(e) => setWinningOptionIndex(e.target.value)}
            placeholder="e.g. 0 or 1"
          />
          <button
            onClick={finalizeBet}
            className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-md font-bold"
          >
            Finalize Bet
          </button>
        </div>

        {/* Logs */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-pink-300 text-xl font-semibold">📜 Admin Logs</h2>
            <div className="flex gap-2">
              {showLogs && (
                <Button
                  variant="outline"
                  onClick={fetchLogs}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
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
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className="grid grid-cols-12 items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <div className="col-span-2">
                    <span className="text-xs font-mono text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="col-span-10 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.action.includes('Updated') ? 'bg-green-500' : 
                      log.action.includes('Created') ? 'bg-blue-500' :
                      log.action.includes('Set') ? 'bg-purple-500' : 'bg-pink-500'
                    }`} />
                    <div>
                      <span className="font-semibold text-pink-300">{log.action}</span>
                      <p className="text-gray-300 text-sm mt-1">
                        {log.details || 'No additional details'}
                        <span className="block text-xs text-gray-400 mt-1">
                          Admin: {log.admin} • Target: {log.target}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center p-4 text-gray-400">
                  No logs available. Perform an action to see logs.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;