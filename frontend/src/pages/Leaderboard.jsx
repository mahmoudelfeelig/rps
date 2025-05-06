import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { API_BASE } from '../api';

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [sortBy, setSortBy] = useState('balance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/leaderboard/users?sort=${sortBy}`);
        setPlayers(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
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
    <div className="max-w-5xl mx-auto px-6 py-20 text-white">
      <h1 className="text-4xl font-bold mb-10 text-center text-pink-400">🌍 Top Players</h1>

      <div className="flex justify-end mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-black border border-pink-500 text-white px-3 py-1 rounded"
        >
          <option value="balance">By Balance</option>
          <option value="wins">By Wins</option>
          <option value="achievements">By Achievements</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-pink-300 text-sm uppercase border-b border-white/10">
            <tr>
              <th className="py-3 px-2">#</th>
              <th className="py-3 px-2">Player</th>
              <th className="py-3 px-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={player._id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="py-3 px-2 font-semibold text-lg">{index + 1}</td>
                <td className="py-3 px-2">
                  <Link
                    to={`/profile/${player.username}`}
                    className="flex items-center hover:text-pink-400 transition-colors"
                  >
                    <img
                      src={
                        player.profileImage
                          ? `${API_BASE}${player.profileImage}`
                          : '/default-avatar.png'
                      }
                      alt={player.username}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    {player.username}
                  </Link>
                </td>
                <td className="py-3 px-2 text-right">${player.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Leaderboard;
