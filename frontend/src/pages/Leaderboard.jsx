import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'

const Leaderboard = () => {
  const [players, setPlayers] = useState([])
  const [groups, setGroups] = useState([])
  const [sortBy, setSortBy] = useState('balance')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/leaderboard/users?sort=${sortBy}`),
          axios.get(`${API_BASE}/api/leaderboard/groups`)
        ]);
        
        setPlayers(usersRes.data);
        setGroups(groupsRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, [sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl animate-pulse">
        Loading leaderboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-400 text-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pt-28 animate-fadeIn text-white">
      <h1 className="text-4xl font-bold mb-10 text-center">🌍 Global Leaderboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Groups Leaderboard */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">🏆 Top Groups</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="text-pink-300">
                  <th className="py-2">Group</th>
                  <th className="py-2 text-right">Total Balance</th>
                  <th className="py-2 text-right">Members</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, index) => (
                  <tr key={group._id} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="py-2">
                      <span className="mr-2">{index + 1}.</span>
                      {group.name}
                    </td>
                    <td className="text-right">${group.totalBalance?.toLocaleString() || 0}</td>
                    <td className="text-right">{group.members?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Players Leaderboard */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">👤 Top Players</h2>
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
            
            <table className="w-full text-left">
              <thead>
                <tr className="text-pink-300">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Player</th>
                  <th className="py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr 
                    key={player._id} 
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="py-2">
                      <span className="text-lg">
                        {index + 1}.
                      </span>
                    </td>
                    <td className="py-2">
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
                    <td className="text-right">${player.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Leaderboard