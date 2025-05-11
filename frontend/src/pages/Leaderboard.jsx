import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/getImageUrl';

export default function Leaderboard() {
  const { token } = useAuth();
  const [players, setPlayers] = useState([]);
  const [sortBy, setSortBy] = useState('balance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [gameBoards, setGameBoards] = useState({ rps: [], puzzleRush: [] });
  const [gamesLoading, setGamesLoading] = useState(true);

  // fetch global user leaderboard
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/leaderboard/users?sort=${sortBy}`
        );
        setPlayers(res.data);
        setError(null);
      } catch {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [sortBy]);

  // fetch RPS & PuzzleRush leaderboards
  useEffect(() => {
    const fetchGameBoards = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/games/leaderboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGameBoards(res.data);
      } catch {
        // silently ignore or set an error state if desired
      } finally {
        setGamesLoading(false);
      }
    };
    fetchGameBoards();
  }, [token]);

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
    <div className="max-w-6xl mx-auto px-6 pt-28 text-white space-y-16">
      <section>
        <h1 className="text-4xl font-extrabold text-center mb-10">🏆 Global Leaderboard</h1>

        <div className="flex justify-end mb-4">
          <select
            value={sortBy}
            onChange={(e) => {
              setLoading(true);
              setSortBy(e.target.value);
            }}
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
                      src={getImageUrl(player.profileImage)}
                      alt={player.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link to={`/profile/${player.username}`} className="hover:underline">
                      {player.username}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right">
                    ${player.balance.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">{player.betsWon || 0}</td>
                  <td className="py-3 px-4 text-right">
                    {player.achievements?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RPS Leaderboard */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-6">🤜🤛 RPS Leaderboard</h2>
        {gamesLoading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading RPS...</p>
        ) : (
          <div className="overflow-x-auto bg-white/5 rounded-lg shadow border border-white/10">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-indigo-500/30 text-indigo-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-right">Wins</th>
                  <th className="py-3 px-4 text-right">Games</th>
                </tr>
              </thead>
              <tbody>
                {gameBoards.rps.map((p, i) => (
                  <tr
                    key={p.username}
                    className="border-t border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="py-3 px-4 font-semibold">{i + 1}</td>
                    <td className="py-3 px-4">{p.username}</td>
                    <td className="py-3 px-4 text-right">{p.wins}</td>
                    <td className="py-3 px-4 text-right">{p.games}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Puzzle Rush Leaderboard */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-6">🧩 Puzzle Rush Leaderboard</h2>
        {gamesLoading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading Puzzle Rush...</p>
        ) : (
          <div className="overflow-x-auto bg-white/5 rounded-lg shadow border border-white/10">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-green-500/30 text-green-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-right">Solves</th>
                </tr>
              </thead>
              <tbody>
                {gameBoards.puzzleRush.map((p, i) => (
                  <tr
                    key={p.username}
                    className="border-t border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="py-3 px-4 font-semibold">{i + 1}</td>
                    <td className="py-3 px-4">{p.username}</td>
                    <td className="py-3 px-4 text-right">{p.wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}