import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function RPS() {
  const { token, user } = useAuth()
  const [opponentName, setOpponentName] = useState('')
  const [buyIn, setBuyIn] = useState(10)
  const [choice, setChoice] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState({ wins: 0, games: 0 })
  const [invites, setInvites] = useState([])

  useEffect(() => {
    // load RPS stats
    fetch(`${API_BASE}/api/games/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setStats(data.rpsStats || { wins: 0, games: 0 }))
      .catch(console.error)

    // load pending invites
    fetch(`${API_BASE}/api/games/rps/invites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setInvites(data || []))
      .catch(console.error)
  }, [token])

  const handlePlay = async () => {
    if (!opponentName || !choice) {
      setStatusMessage('Enter opponent and pick rock/paper/scissors.')
      return
    }
    setStatusMessage('')
    setResult(null)

    const res = await fetch(`${API_BASE}/api/games/rps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        opponentUsername: opponentName,
        buyIn,
        userChoice: choice
      })
    })
    const data = await res.json()

    if (!res.ok) {
      setStatusMessage(data.message || 'Error!')
      return
    }

    // if only invite confirmation
    if (data.message && !data.balance) {
      setStatusMessage(data.message)
      return
    }

    // match result
    setResult(data)
    setStats(s => ({
      wins: data.winner === user.id ? s.wins + 1 : s.wins,
      games: s.games + 1
    }))
  }

  const handleAccept = invite => {
    setOpponentName(invite.fromUsername)
    setBuyIn(invite.buyIn)
    setInvites(inv => inv.filter(i => i._id !== invite._id))
    setStatusMessage(`Accepting ${invite.fromUsername}'s challenge of ${invite.buyIn}… now pick your move.`)
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-2">🎮 RPS Duel Arena</h1>
      <p className="text-gray-400 mb-6">
        Wins: <span className="font-semibold">{stats.wins}</span> /
        Games: <span className="font-semibold">{stats.games}</span>
      </p>

      {/* Incoming Invites */}
      {invites.length > 0 && (
        <div className="w-full max-w-md mb-6 bg-gray-800/60 p-4 rounded-lg space-y-2">
          <h2 className="text-xl font-medium text-indigo-300">Incoming Challenges</h2>
          {invites.map(inv => (
            <div key={inv._id} className="flex justify-between items-center">
              <div>
                <span className="font-semibold">{inv.fromUsername}</span>{' '}
                challenged you for <span className="font-semibold">{inv.buyIn}</span>
              </div>
              <Button size="sm" onClick={() => handleAccept(inv)}>
                Accept
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Challenge Form */}
      <div className="w-full max-w-md bg-gray-800/50 p-6 rounded-2xl shadow-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Opponent Username</label>
          <Input
            placeholder="e.g. player123"
            value={opponentName}
            onChange={e => setOpponentName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bet Amount</label>
          <Input
            type="number"
            min="1"
            value={buyIn}
            onChange={e => setBuyIn(+e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your Move</label>
          <div className="grid grid-cols-3 gap-4">
            {['rock', 'paper', 'scissors'].map(m => (
              <button
                key={m}
                onClick={() => setChoice(m)}
                className={`p-4 border rounded-lg text-3xl flex items-center justify-center transition ${
                  choice === m
                    ? 'border-pink-500 bg-pink-600'
                    : 'border-gray-600 hover:border-pink-400'
                }`}
              >
                {m === 'rock' ? '✊' : m === 'paper' ? '✋' : '✌️'}
              </button>
            ))}
          </div>
        </div>

        {statusMessage && (
          <p className="text-yellow-300 text-sm">{statusMessage}</p>
        )}

        <Button
          onClick={handlePlay}
          disabled={!opponentName || !choice}
          className="w-full mt-2"
        >
          Challenge
        </Button>
      </div>

      {/* Match Result */}
      {result?.balance && (
        <div className="mt-8 w-full max-w-md bg-black bg-opacity-60 p-6 rounded-2xl space-y-2">
          <p className="text-lg">
            You chose: <strong>{result.userPick}</strong>{' '}
            {result.userPick === 'rock' ? '✊' : result.userPick === 'paper' ? '✋' : '✌️'}
          </p>
          <p className="text-lg">
            {opponentName} chose: <strong>{result.oppPick}</strong>{' '}
            {result.oppPick === 'rock' ? '✊' : result.oppPick === 'paper' ? '✋' : '✌️'}
          </p>
          <p className="text-xl font-bold">
            {result.winner
              ? result.winner === user.id
                ? '🎉 You won!'
                : `😢 ${opponentName} won.`
              : "🔄 It's a draw."}
          </p>
          <p>Your balance: <strong>{result.balance.you}</strong></p>
        </div>
      )}
    </div>
  )
}