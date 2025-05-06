import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [sortBy, setSortBy] = useState('balance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/leaderboard/users?sort=${sortBy}`);
        setPlayers(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl animate-pulse">
        Loading leaderboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-400 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 text-white">
      <h1 className="text-4xl font-extrabold text-center mb-10">🏆 Global Leaderboard</h1>

      <div className="flex justify-end mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-black border border-pink-500 text-white px-3 py-1 rounded"
        >
          <option value="balance">Sort by Balance</option>
          <option value="wins">Sort by Wins</option>
          <option value="achievements">Sort by Achievements</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white/5 rounded-lg shadow border border-white/10">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-pink-500/20 text-pink-200 text-xs uppercase tracking-wide">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4 text-right">Wins</th>
              <th className="py-3 px-4 text-right">Achievements</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={player._id}
                className="border-t border-white/10 hover:bg-white/10 transition"
              >
                <td className="py-3 px-4 font-semibold">{index + 1}</td>
                <td className="py-3 px-4 flex items-center gap-3">
                  <img
                    src={
                      player.profileImage?.startsWith('/uploads')
                        ? `${API_BASE}${player.profileImage}`
                        : player.profileImage || '/default-avatar.png'
                    }
                    alt={player.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <Link to={`/profile/${player.username}`} className="hover:underline">
                    {player.username}
                  </Link>
                </td>
                <td className="py-3 px-4 text-right">${player.balance.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">{player.betsWon || 0}</td>
                <td className="py-3 px-4 text-right">{player.achievements?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
