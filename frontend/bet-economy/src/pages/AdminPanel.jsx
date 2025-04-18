import { useState } from 'react';
import { useAuth } from '../context/AuthContext';  // Import the custom hook
import AdminInput from '../components/AdminInput';
import axios from 'axios';

const AdminPanel = () => {
  const { token, user } = useAuth();

  const [targetToken, setTargetToken] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [oddsBetId, setOddsBetId] = useState('');
  const [oddsValue, setOddsValue] = useState('');
  const [logs, setLogs] = useState([]);

  console.log("Token being sent to the server:", token);
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

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
        headers: headers,
        body: JSON.stringify({ odds: Number(oddsValue) }),
      });
  
      const data = await res.json(); // parse the JSON response
  
      if (!res.ok) throw new Error(data.message || 'Error updating odds');
  
      alert(data.message || 'Odds updated');
    } catch (err) {
      console.error('Error setting odds:', err);
      alert(err.message || 'Error setting odds');
    }
  };
  

  const fetchLogs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/logs', {
        headers,
      });
      setLogs(res.data);  // Assuming response contains the logs data
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-pink-400 drop-shadow">
            Admin Panel
          </h1>
          <span className="px-4 py-1 bg-white/10 text-white text-sm rounded-full border border-white/10 backdrop-blur">
            🔒 Superuser: {user?.username || 'Unknown'}
          </span>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
            <h2 className="text-pink-300 text-xl font-semibold">💰 Update Balance</h2>
            <AdminInput
              label="User Token"
              value={targetToken}
              onChange={(e) => setTargetToken(e.target.value)}
              placeholder="Enter user's token"
            />
            <AdminInput
              label="Amount"
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Enter balance amount"
            />
            <button
              onClick={updateBalance}
              className="bg-pink-600 hover:bg-pink-700 text-white w-full py-2 rounded-md font-bold transition"
            >
              Update Balance
            </button>
          </div>

          <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
            <h2 className="text-pink-300 text-xl font-semibold">🎲 Set Odds</h2>
            <AdminInput
              label="Bet ID"
              value={oddsBetId}
              onChange={(e) => setOddsBetId(e.target.value)}
              placeholder="Enter Bet ID"
            />
            <AdminInput
              label="New Odds"
              type="number"
              value={oddsValue}
              onChange={(e) => setOddsValue(e.target.value)}
              placeholder="Enter odds (e.g. 2.5)"
            />
            <button
              onClick={setOdds}
              className="bg-pink-600 hover:bg-pink-700 text-white w-full py-2 rounded-md font-bold transition"
            >
              Set Odds
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm space-y-4">
          <h2 className="text-pink-300 text-xl font-semibold">📜 View Logs</h2>
          <button
            onClick={fetchLogs}
            className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md font-bold"
          >
            Load Logs
          </button>
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
