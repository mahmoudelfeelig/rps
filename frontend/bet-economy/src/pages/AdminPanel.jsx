import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminInput from '../components/AdminInput';
import axios from 'axios';

const AdminPanel = () => {
  const { token, user } = useAuth();

  const [targetToken, setTargetToken] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [oddsBetId, setOddsBetId] = useState('');
  const [oddsValue, setOddsValue] = useState('');
  const [logs, setLogs] = useState([]);
  const [banReason, setBanReason] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementCriteria, setAchievementCriteria] = useState('');
  const [achievementThreshold, setAchievementThreshold] = useState('');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemEffect, setItemEffect] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemStock, setItemStock] = useState('');


  const updateBalance = async () => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/admin/balance/${targetToken}`,
        { amount: Number(balanceAmount) },
        { headers }
      );
      alert(res.data.message || 'Balance updated');
    } catch (err) {
      console.error('Error updating balance:', err);
      alert('Error updating balance');
    }
  };

  const setOdds = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/odds/${oddsBetId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ odds: Number(oddsValue) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error updating odds');
      alert(data.message || 'Odds updated');
    } catch (err) {
      console.error('Error setting odds:', err);
      alert(err.message || 'Error setting odds');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/logs', { headers });
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const banUser = async () => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/admin/status/user/${targetToken}`,
        { status: 'banned', reason: banReason },
        { headers }
      );
      alert(res.data.message || 'User status updated');
    } catch (err) {
      console.error('Error banning user:', err);
      alert('Error banning user');
    }
  };

  const createTask = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/tasks/create',
        {
          title: taskTitle,
          description: taskDesc,
          reward: Number(taskReward),
        },
        { headers }
      );
      alert(res.data.message || 'Task created');
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Error creating task');
    }
  };

  const createAchievement = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/achievements/create',
        {
          title: achievementTitle,
          criteria: achievementCriteria,
          threshold: Number(achievementThreshold),
        },
        { headers }
      );
      alert(res.data.message || 'Achievement created');
    } catch (err) {
      console.error('Error creating achievement:', err);
      alert('Error creating achievement');
    }
  };
  
  const createItem = async () => {
    const payload = {
      name: itemName,
      type: itemType,
      effect: itemEffect,
      price: Number(itemPrice),
      stock: Number(itemStock),
    };
  
    console.log("Creating store item with:", payload);
  
    if (!itemName || !itemType || !itemEffect || !itemPrice || !itemStock) {
      return alert('Please fill out all item fields!');
    }
  
    try {
      const res = await axios.post(
        'http://localhost:5000/api/store/create',
        payload,
        { headers }
      );
      alert(res.data.message || 'Item created');
    } catch (err) {
      console.error('Error creating item:', err.response?.data || err.message);
      alert('Error creating item');
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

        {/* Balance + Odds */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
            <h2 className="text-pink-300 text-xl font-semibold">💰 Update Balance</h2>
            <AdminInput label="User ID" value={targetToken} onChange={(e) => setTargetToken(e.target.value)} placeholder="User Mongo ID" />
            <AdminInput label="Amount" type="number" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} placeholder="Amount to add" />
            <button onClick={updateBalance} className="bg-pink-600 hover:bg-pink-700 w-full py-2 rounded-md font-bold">Update</button>
          </div>

          <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
            <h2 className="text-pink-300 text-xl font-semibold">🎲 Set Odds</h2>
            <AdminInput label="Bet ID" value={oddsBetId} onChange={(e) => setOddsBetId(e.target.value)} placeholder="Bet ID" />
            <AdminInput label="Odds" type="number" value={oddsValue} onChange={(e) => setOddsValue(e.target.value)} placeholder="e.g. 2.5" />
            <button onClick={setOdds} className="bg-pink-600 hover:bg-pink-700 w-full py-2 rounded-md font-bold">Set Odds</button>
          </div>
        </div>

        {/* Ban user */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-red-400 text-xl font-semibold">🚫 Ban User</h2>
          <AdminInput label="User ID" value={targetToken} onChange={(e) => setTargetToken(e.target.value)} />
          <AdminInput label="Reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
          <button onClick={banUser} className="bg-red-600 hover:bg-red-700 w-full py-2 rounded-md font-bold">Ban User</button>
        </div>

        {/* Create Task */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-blue-400 text-xl font-semibold">🧩 Create Task</h2>
          <AdminInput label="Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          <AdminInput label="Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
          <AdminInput label="Reward" type="number" value={taskReward} onChange={(e) => setTaskReward(e.target.value)} />
          <button onClick={createTask} className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-md font-bold">Create Task</button>
        </div>

        {/* Create Achievement */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-green-400 text-xl font-semibold">🏆 Create Achievement</h2>
          <AdminInput label="Title" value={achievementTitle} onChange={(e) => setAchievementTitle(e.target.value)} />
          <AdminInput label="Criteria" value={achievementCriteria} onChange={(e) => setAchievementCriteria(e.target.value)} placeholder="e.g. tasks_completed" />
          <AdminInput label="Threshold" type="number" value={achievementThreshold} onChange={(e) => setAchievementThreshold(e.target.value)} placeholder="e.g. 5" />
          <button onClick={createAchievement} className="bg-green-600 hover:bg-green-700 w-full py-2 rounded-md font-bold">Create Achievement</button>
        </div>

        {/* Create Store Item */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-yellow-300 text-xl font-semibold">🛒 Create Store Item</h2>
          <AdminInput label="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          <AdminInput label="Type" value={itemType} onChange={(e) => setItemType(e.target.value)} placeholder="'badge' / 'power-up' / 'cosmetic'" />
          <AdminInput label="Effect" value={itemEffect} onChange={(e) => setItemEffect(e.target.value)} />
          <AdminInput label="Price" type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
          <AdminInput label="Stock" type="number" value={itemStock} onChange={(e) => setItemStock(e.target.value)} />
          <button onClick={createItem} className="bg-yellow-500 hover:bg-yellow-600 w-full py-2 rounded-md font-bold">Create Item</button>
        </div>

        {/* Logs */}
        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-pink-300 text-xl font-semibold">📜 View Logs</h2>
          <button onClick={fetchLogs} className="bg-pink-600 hover:bg-pink-700 py-2 px-4 rounded-md font-bold">Load Logs</button>
          <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
            {logs.map((log, idx) => (
              <li key={idx} className="bg-white/10 p-2 rounded-md">
                <strong>{log.action}</strong> — {log.details || 'No details'} (
                {new Date(log.timestamp).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
