import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminInput from '../../components/AdminInput';
import { Button } from '../../components/ui/button';
import { RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../../api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { token, user } = useAuth();
  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  const [users, setUsers] = useState([]);
  const [bets, setBets] = useState([]);
  const [logs, setLogs] = useState([]);

  const [requests, setRequests] = useState([]);
  const [editReq, setEditReq] = useState(null);

  const [selUser, setSelUser] = useState(null);
  const [addFunds, setAddFunds] = useState('');
  const [selBet, setSelBet] = useState(null);

  const [optionOdds, setOptionOdds] = useState({});

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
  const [itemEffectType, setItemEffectType] = useState('');
  const [itemEffectValue, setItemEffectValue] = useState('');

  const [betTitle, setBetTitle] = useState('');
  const [betDescription, setBetDescription] = useState('');
  const [betEndTime, setBetEndTime] = useState('');
  const [betOptions, setBetOptions] = useState([{ text: '', odds: '' }]);

  const [showLogs, setShowLogs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (itemType === 'cosmetic') {
      setItemEffectType('cosmetic');
      setItemEffectValue('1');
    }
  }, [itemType]);
  useEffect(() => {
    if (itemEffectType === 'cosmetic') {
      setItemType('cosmetic');
      setItemEffectValue('1');
    }
  }, [itemEffectType]);

  const fetchUsers = useCallback(async () => {
    const res = await axios.get(`${API_BASE}/api/admin/users`, { headers });
    const fresh = res.data;
    setUsers(fresh);
    setSelUser(prev => (
      prev && !fresh.some(u => u.username === prev.username) ? null : prev
    ));
  }, [headers]);

  const fetchBets = useCallback(async () => {
    const res = await axios.get(`${API_BASE}/api/admin/bets`, { headers });
    const fresh = res.data;
    setBets(fresh);
    setSelBet(prev => (
      prev && !fresh.some(b => b.title === prev.title) ? null : prev
    ));
  }, [headers]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/logs`, { headers });
      setLogs(res.data);
    } finally {
      setLoadingLogs(false);
    }
  }, [headers]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/requests/all`, { headers });
      setRequests(res.data);
    } catch {
      toast.error('Failed to load requests');
    }
  }, [headers]);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    fetchBets();
    fetchLogs();
    fetchRequests();
  }, [token, fetchUsers, fetchBets, fetchLogs, fetchRequests]);
  const updateRequest = async () => {
    if (!editReq) return;
    await axios.put(`${API_BASE}/api/requests/${editReq._id}`, editReq, { headers });
    toast.success('Updated');
    setEditReq(null);
    fetchRequests();
  };
  const actRequest = async (id, verb, adminNotes = '') => {
    await axios.post(`${API_BASE}/api/requests/${id}/${verb}`, { adminNotes }, { headers });
    toast.success(verb === 'accept' ? 'Accepted' : 'Rejected');
    fetchRequests();
  };

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

  const handleItemImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/api/store/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setItemImage(data.url);
    } catch (err) {
      toast.error(err.message);
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.14),_transparent_30%),linear-gradient(180deg,#04070f_0%,#09090b_50%,#020202_100%)] pt-24 px-4 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Admin</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Control center</h1>
              <p className="mt-2 max-w-2xl text-white/65">
                Manage bets, requests, logs, users, and content from one place.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/80">
              {user?.username}
            </span>
          </div>
        </header>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-purple-300">Bet requests</h2>
            <button onClick={fetchRequests} className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>User</th><th>Title</th><th>Market</th><th>Odds</th><th>Stake</th><th>Status</th><th>Admin notes</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan="8" className="text-center text-white/60 py-4">No requests.</td></tr>}
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.userId?.username || '-'}</td>
                    <td>{r.title}</td>
                    <td>{r.market}</td>
                    <td>{r.desiredOdds}</td>
                    <td>{r.stake}</td>
                    <td className="capitalize">{r.status}</td>
                    <td>{r.adminNotes || '-'}</td>
                    <td className="space-x-2">
                      <button className="btn-secondary px-2 py-1" onClick={() => setEditReq(r)}>Modify</button>
                      <button className="btn-primary px-2 py-1" onClick={() => actRequest(r._id, 'accept')}>Accept</button>
                      <button className="btn-outline px-2 py-1" onClick={() => actRequest(r._id, 'reject')}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editReq && (
            <div className="mt-4 bg-white/5 p-4 rounded-xl space-y-2">
              <h3 className="font-semibold">Modify request</h3>
              {['title','market','desiredOdds','stake','adminNotes'].map((k) => (
                <div key={k}>
                  <label className="block text-sm mb-1 capitalize">{k}</label>
                  <input className="w-full px-3 py-2 rounded bg-white/10 text-white"
                    value={editReq[k] || ''} onChange={(e) => setEditReq({ ...editReq, [k]: e.target.value })} />
                </div>
              ))}
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => setEditReq(null)}>Cancel</button>
                <button className="btn-primary" onClick={updateRequest}>Save</button>
              </div>
            </div>
          )}
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <h2 className="mb-2 text-xl font-semibold">User management</h2>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto mb-4">
            {users.map(u => (
              <div
                key={u.username}
                onClick={() => { setSelUser(u); setAddFunds(''); }}
                className={`p-2 rounded cursor-pointer ${selUser?.username === u.username ? 'bg-purple-600' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="font-medium">{u.username}</div>
                <div className="text-sm text-gray-300">${u.balance.toLocaleString()}</div>
                {u.status === 'banned' && (<div className="text-xs text-red-400">BANNED</div>)}
              </div>
            ))}
          </div>
          {selUser && (
            <div className="bg-white/5 p-4 rounded-xl space-y-4">
              <div className="font-semibold">Selected: {selUser.username}</div>
              <div className="flex gap-2 items-center">
                <AdminInput label="Add Funds" type="number" value={addFunds} onChange={e => setAddFunds(e.target.value)} />
                <button onClick={handleAddFunds} className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded">+${addFunds || '0'}</button>
              </div>
              <button onClick={handleBan} className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded">🚫 Ban User</button>
            </div>
          )}
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <h2 className="mb-2 text-xl font-semibold">Bet management</h2>
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
                            onChange={e => setOptionOdds(prev => ({ ...prev, [opt._id]: e.target.value }))}
                            className="w-20"
                          />
                          <button
                            onClick={() => updateOdds(bet.title, opt._id, optionOdds[opt._id] ?? opt.odds)}
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
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-xl font-semibold text-sky-300">Create task</h2>
          <AdminInput label="Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
          <AdminInput label="Description" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
          <AdminInput label="Reward" type="number" value={taskReward} onChange={e => setTaskReward(e.target.value)} />
          <AdminInput label="Category" value={taskCategory} onChange={e => setTaskCategory(e.target.value)} placeholder="daily / weekly / bonus" />
          <AdminInput label="Goal Type" value={taskGoalType} onChange={e => setTaskGoalType(e.target.value)} placeholder="betsPlaced / betsWon / storePurchases / logins" />
          <AdminInput label="Goal Amount" type="number" value={taskGoalAmount} onChange={e => setTaskGoalAmount(e.target.value)} placeholder="e.g. 5" />
          <button onClick={createTask} className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-md font-bold">Create Task</button>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-xl font-semibold text-emerald-300">Create achievement</h2>
          <AdminInput label="Title" value={achievementTitle} onChange={e => setAchievementTitle(e.target.value)} />
          <AdminInput label="Description" value={achievementDescription} onChange={e => setAchievementDescription(e.target.value)} />
          <AdminInput label="Criteria" value={achievementCriteria} onChange={e => setAchievementCriteria(e.target.value)} placeholder="betsPlaced, betsWon, storePurchases, logins, tasksCompleted" />
          <AdminInput label="Threshold" type="number" value={achievementThreshold} onChange={e => setAchievementThreshold(e.target.value)} />
          <AdminInput label="Reward Value" value={achievementRewardValue} onChange={e => setAchievementRewardValue(e.target.value)} />
          <AdminInput label="Icon" value={achievementIcon} onChange={e => setAchievementIcon(e.target.value)} placeholder="e.g. trophy.png" />
          <button onClick={createAchievement} className="bg-green-600 hover:bg-green-700 w-full py-2 rounded-md font-bold">Create Achievement</button>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-xl font-semibold text-amber-300">Create store item</h2>
          <AdminInput label="Name" value={itemName} onChange={e => setItemName(e.target.value)} />
          <label className="text-sm font-medium text-white/80">Item Type</label>
          <select
            value={itemType}
            onChange={e => setItemType(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 appearance-none [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="" disabled>-- select item type --</option>
            <option value="badge">Badge</option>
            <option value="power-up">Power-up</option>
            <option value="cosmetic">Cosmetic</option>
          </select>
          <AdminInput label="Effect" value={itemEffect} onChange={e => setItemEffect(e.target.value)} />
          <AdminInput label="Price" type="number" value={itemPrice} onChange={e => setItemPrice(e.target.value)} />
          <AdminInput label="Stock" type="number" value={itemStock} onChange={e => setItemStock(e.target.value)} />
          <div>
            <label className="block text-sm text-white/70 mb-1">Image</label>
            <input type="file" accept="image/*" onChange={handleItemImageChange} />
          </div>
          <button onClick={createItem} className="bg-yellow-600 hover:bg-yellow-700 w-full py-2 rounded-md font-bold">Create Store Item</button>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-xl font-semibold text-violet-300">Create bet</h2>
          <AdminInput label="Title" value={betTitle} onChange={e => setBetTitle(e.target.value)} />
          <AdminInput label="Description" value={betDescription} onChange={e => setBetDescription(e.target.value)} />
          <AdminInput label="End Time" type="datetime-local" value={betEndTime} onChange={e => setBetEndTime(e.target.value)} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Options</label>
            {betOptions.map((o, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <input className="px-3 py-2 rounded bg-white/10 text-white" placeholder="Text" value={o.text}
                  onChange={e => { const a = [...betOptions]; a[i].text = e.target.value; setBetOptions(a); }} />
                <input className="px-3 py-2 rounded bg-white/10 text-white" placeholder="Odds" type="number" value={o.odds}
                  onChange={e => { const a = [...betOptions]; a[i].odds = e.target.value; setBetOptions(a); }} />
              </div>
            ))}
            <button onClick={() => setBetOptions([...betOptions, { text: '', odds: '' }])} className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold">
              + Add Option
            </button>
          </div>
          <button onClick={createBet} className="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-md font-bold mt-4">Create Bet</button>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-pink-300">Admin logs</h2>
            <div className="flex gap-2">
              {showLogs && (
                <Button variant="outline" onClick={fetchLogs} disabled={loadingLogs} className="flex items-center gap-2">
                  <RefreshCcw className={loadingLogs ? "animate-spin" : ""} /> Refresh
                </Button>
              )}
              <button onClick={() => setShowLogs(!showLogs)} className="bg-pink-600 hover:bg-pink-700 py-2 px-4 rounded-md font-bold text-sm">
                {showLogs ? 'Hide Logs' : 'Show Logs'}
              </button>
            </div>
          </div>

          {showLogs && (
            <div className="h-96 overflow-y-auto space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 mt-4">
              {logs.length === 0 && (<div className="text-center text-gray-400">No logs yet.</div>)}
              {logs.map((log, i) => (
                <div key={i} className="grid grid-cols-12 items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="col-span-2"><span className="text-xs font-mono text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                  <div className="col-span-10 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.action.includes('Update') ? 'bg-green-500' : log.action.includes('Create') ? 'bg-blue-500' : 'bg-pink-500'}`} />
                    <div>
                      <span className="font-semibold text-pink-300">{log.action}</span>
                      <p className="text-gray-300 text-sm mt-1">{log.details}</p>
                      <span className="block text-xs text-gray-400 mt-1">Admin: {log.admin} • Target: {log.target}</span>
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
