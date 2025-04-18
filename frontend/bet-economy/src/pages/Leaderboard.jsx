import { useEffect, useState } from 'react'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { ArrowDown, ArrowUp } from 'lucide-react'

const generateMockPlayers = () => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Isla', 'Jack', 'Karen', 'Leo', 'Mia', 'Nate', 'Olivia', 'Pete', 'Quinn', 'Rose', 'Sam', 'Tina', 'Uma', 'Vince', 'Wendy', 'Xander', 'Yara', 'Zane']
  return Array.from({ length: 30 }, (_, i) => ({
    name: names[i % names.length],
    group: `Group ${String.fromCharCode(65 + (i % 5))}`,
    score: Math.floor(Math.random() * 20000) + 5000,
  }))
}

const generateMockGroups = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    name: `Group ${String.fromCharCode(65 + i)}`,
    total: Math.floor(Math.random() * 100000) + 10000,
    members: Math.floor(Math.random() * 50) + 5,
  }))
}

const sortData = (arr, key, asc) =>
  [...arr].sort((a, b) => {
    if (typeof a[key] === 'string') {
      return asc ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key])
    }
    return asc ? a[key] - b[key] : b[key] - a[key]
  })

const getMedal = (index) => {
  const medals = ['🥇', '🥈', '🥉']
  return medals[index] || ''
}

const Leaderboard = () => {
  const [playerSearch, setPlayerSearch] = useState('')
  const [groupSearch, setGroupSearch] = useState('')

  const [players, setPlayers] = useState([])
  const [groups, setGroups] = useState([])

  const [playerSort, setPlayerSort] = useState({ key: 'score', asc: false })
  const [groupSort, setGroupSort] = useState({ key: 'total', asc: false })

  const [playerPage, setPlayerPage] = useState(1)
  const [groupPage, setGroupPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    setPlayers(generateMockPlayers())
    setGroups(generateMockGroups())
  }, [])

  const filteredPlayers = players
    .filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
  const sortedPlayers = sortData(filteredPlayers, playerSort.key, playerSort.asc)
  const topPlayerWealthSorted = [...filteredPlayers].sort((a, b) => b.score - a.score)
  const displayedPlayers = sortedPlayers.slice((playerPage - 1) * perPage, playerPage * perPage)

  const filteredGroups = groups
    .filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
  const sortedGroups = sortData(filteredGroups, groupSort.key, groupSort.asc)
  const topGroupWealthSorted = [...filteredGroups].sort((a, b) => b.total - a.total)
  const displayedGroups = sortedGroups.slice((groupPage - 1) * perPage, groupPage * perPage)

  const renderPagination = (total, currentPage, setPage) => {
    const pageCount = Math.ceil(total / perPage)
    return (
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-pink-400 text-black' : 'bg-white/10 text-white'} hover:bg-pink-500 hover:text-black transition`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 pt-28 animate-fadeIn text-white">
      <h1 className="text-4xl font-bold mb-10 text-center">🌍 Global Leaderboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* GROUPS */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">🏆 Top Groups</h2>
              <Input placeholder="Search groups..." value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-pink-300">
                  {['name', 'total', 'members'].map((key) => (
                    <th
                      key={key}
                      className={`cursor-pointer py-2 ${key !== 'name' ? 'text-right' : ''}`}
                      onClick={() =>
                        setGroupSort(prev => ({
                          key,
                          asc: prev.key === key ? !prev.asc : true,
                        }))
                      }
                    >
                      {key === 'name' ? 'Name' : key === 'total' ? 'Wealth' : 'Members'}
                      {groupSort.key === key && (
                        groupSort.asc ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedGroups.map((group, index) => {
                  const absoluteIndex = (groupPage - 1) * perPage + index
                  const medal = getMedal(topGroupWealthSorted.findIndex(g => g.name === group.name))
                  return (
                    <tr key={group.name} className="border-t border-white/10 hover:bg-white/5 transition">
                      <td className="py-2">
                        {medal && <span className="mr-2">{medal}</span>}
                        {group.name}
                      </td>
                      <td className="text-right">${group.total.toLocaleString()}</td>
                      <td className="text-right">{group.members}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {renderPagination(filteredGroups.length, groupPage, setGroupPage)}
          </div>
        </Card>

        {/* PLAYERS */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">👤 Top Players</h2>
              <Input placeholder="Search players..." value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-pink-300">
                  {['name', 'group', 'score'].map((key) => (
                    <th
                      key={key}
                      className={`cursor-pointer py-2 ${key === 'score' ? 'text-right' : ''}`}
                      onClick={() =>
                        key !== 'group' &&
                        setPlayerSort(prev => ({
                          key,
                          asc: prev.key === key ? !prev.asc : true,
                        }))
                      }
                    >
                      {key === 'name' ? 'Name' : key === 'group' ? 'Group' : 'Wealth'}
                      {playerSort.key === key && key !== 'group' && (
                        playerSort.asc ? <ArrowUp className="inline h-4 w-4 ml-1" /> : <ArrowDown className="inline h-4 w-4 ml-1" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedPlayers.map((player, index) => {
                  const absoluteIndex = (playerPage - 1) * perPage + index
                  const medal = getMedal(topPlayerWealthSorted.findIndex(p => p.name === player.name))
                  return (
                    <tr key={`${player.name}-${index}`} className="border-t border-white/10 hover:bg-white/5 transition">
                      <td className="py-2">
                        {medal && <span className="mr-2">{medal}</span>}
                        {player.name}
                      </td>
                      <td>{player.group}</td>
                      <td className="text-right">${player.score.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {renderPagination(filteredPlayers.length, playerPage, setPlayerPage)}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Leaderboard
