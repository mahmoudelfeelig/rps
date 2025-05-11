import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'
import toast from 'react-hot-toast'

export default function Minefield() {
  const { token, refreshUser, user } = useAuth()

  const [rows, setRows] = useState(8)
  const [cols, setCols] = useState(8)
  const [mines, setMines] = useState(10)
  const totalCells = rows * cols

  const [sessionId, setSessionId] = useState(null)
  const [revealedCells, setRevealedCells] = useState([])
  const [mineCells, setMineCells] = useState([])
  const [safeCount, setSafeCount] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [explodedCell, setExplodedCell] = useState(null)

  const [draftBet, setDraftBet] = useState(100)
  const [baseBet, setBaseBet] = useState(null)
  const [extraSafeClicks, setExtraSafeClicks] = useState(0)
  const [mineReduction, setMineReduction] = useState(0)
  const [sessionMinesCount, setSessionMinesCount] = useState(null)

  const slidersDisabled = !!sessionId && !gameOver && !cashedOut
  const gridDisabled    = !!sessionId && (gameOver || cashedOut)

  // 1) odds‐multiplier
  function oddsMultiplier(safeCount, mines, total) {
    let mult = 1, rem = total, damp = 0.6
    for (let i = 0; i < safeCount; i++) {
      const safeCells = rem - mines
      if (safeCells <= 0) break
      const trueOdds = rem / safeCells
      mult *= 1 + damp * (trueOdds - 1)
      rem--
    }
    return mult
  }

  // 2) permanent buffs
  const buffMultiplier = (user?.inventory || [])
    .filter(e => e.item?.effectType === 'reward-multiplier')
    .map(e => Number(e.item.effectValue) || 1)
    .reduce((a,b) => a*b, 1)

  // 3) preview reward
  const baseReward = baseBet
    ? Math.floor(baseBet * oddsMultiplier(safeCount, mines, totalCells))
    : 0
  const potentialReward = Math.round(baseReward * buffMultiplier)

  // ─── start ──────────────────────────────────────────────────────────
  const startGame = async betOverride => {
    const bet = typeof betOverride === 'number' ? betOverride : draftBet
    if (bet <= 0) return toast.error('Bet must be ≥ 1')
    try {
      const res = await fetch(`${API_BASE}/api/games/minefield/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betAmount: bet, rows, cols, mines }),
      })
      const json = await res.json()
      if (!res.ok) return toast.error(json.message)
      setBaseBet(bet)
      setExtraSafeClicks(json.extraSafeClicks || 0)
      setMineReduction(json.mineReduction || 0)
      setSessionMinesCount(json.minesCount)
      setSessionId(json.sessionId)
      setRevealedCells([])
      setMineCells([])
      setSafeCount(0)
      setGameOver(false)
      setCashedOut(false)
      setExplodedCell(null)
      await refreshUser()
    } catch {
      toast.error('Network error starting game')
    }
  }

  // ─── click ──────────────────────────────────────────────────────────
  const handleClick = async id => {
    if (!sessionId || gameOver || cashedOut) return
    try {
      const res = await fetch(`${API_BASE}/api/games/minefield/reveal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, cellIndex: id }),
      })
      const json = await res.json()
      if (!res.ok) return toast.error(json.message)

      if (json.exploded) {
        // real mine
        setExplodedCell(id)
        setMineCells(json.mines)
        setGameOver(true)
        await refreshUser()
      } else {
        // safe click (normal or buffed)
        setSafeCount(json.safeCount)
        // **new**: update buff count
        if (json.extraSafeClicks != null) {
          setExtraSafeClicks(json.extraSafeClicks)
        }
        // solved board?
        if (
          sessionMinesCount != null &&
          json.safeCount >= totalCells - sessionMinesCount
        ) {
          await handleCashOut(true)
          toast.success(
            `🎉 Solved it! You earned ${potentialReward} coins.`
          )
          return
        }
        setRevealedCells(rc => [...rc, id])
      }
    } catch {
      toast.error('Network error revealing cell')
    }
  }

  // ─── cash out ────────────────────────────────────────────────────────
  const handleCashOut = async (silent = false) => {
    if (!sessionId || gameOver || cashedOut) return
    try {
      const res = await fetch(`${API_BASE}/api/games/minefield/cashout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setCashedOut(true)
      if (!silent) toast.success(`Cashed out ${json.reward} coins!`)
      await refreshUser()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ─── clamp mines ─────────────────────────────────────────────────────
  const clampMines = (r, c) => {
    const max = r * c - 1
    setMines(m => Math.max(2, Math.min(m, max)))
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-gradient-to-br from-slate-900 to-black text-white">
      <h1 className="text-5xl font-extrabold mb-2">💣 Minefield</h1>
      <div className="mb-6 text-lg">
        Balance: <span className="font-semibold">{user?.balance ?? 0}</span> coins
      </div>

      {/* sliders */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Rows: {rows}</label>
          <input
            type="range"
            min={3}
            max={12}
            value={rows}
            disabled={slidersDisabled}
            onChange={e => {
              const v = +e.target.value
              setRows(v)
              clampMines(v, cols)
            }}
            className="accent-purple-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Cols: {cols}</label>
          <input
            type="range"
            min={3}
            max={12}
            value={cols}
            disabled={slidersDisabled}
            onChange={e => {
              const v = +e.target.value
              setCols(v)
              clampMines(rows, v)
            }}
            className="accent-purple-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Mines: {mines}</label>
          <input
            type="range"
            min={2}
            max={totalCells - 1}
            value={mines}
            disabled={slidersDisabled}
            onChange={e => setMines(+e.target.value)}
            className="accent-rose-500"
          />
        </div>
      </div>

      {/* buffs */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded">
          Reward ×{buffMultiplier.toFixed(2)}
        </span>
        <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded">
          Safe Clicks: {extraSafeClicks}
        </span>
        {mineReduction > 0 && (
          <span className="bg-rose-600/20 text-rose-300 px-3 py-1 rounded">
            –{mineReduction} Mines
          </span>
        )}
      </div>

      {/* stake */}
      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="betInput" className="text-lg">Stake:</label>
        <input
          id="betInput"
          type="number"
          min="1"
          value={draftBet}
          onChange={e => setDraftBet(+e.target.value)}
          className="w-24 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
        />
        <button
          onClick={() => setDraftBet(user?.balance ?? 0)}
          className="px-3 py-1 text-sm bg-gray-700 rounded"
        >
          Max
        </button>
        <button
          onClick={() => startGame(draftBet)}
          className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded font-medium"
        >
          Enter
        </button>
      </div>

      {/* status */}
      <div className="mb-4 text-lg">
        {!sessionId
          ? 'Set stake & Enter to start'
          : gameOver
          ? '💥 Boom—lost it all!'
          : cashedOut
          ? `✅ You cashed out ${potentialReward} coins!`
          : `Safe: ${safeCount} | Next: ${potentialReward}`}
      </div>

      {/* grid */}
      <div
        className={`grid gap-2 mb-6 w-full max-w-lg transition-opacity ${
          gridDisabled ? 'pointer-events-none opacity-60' : ''
        }`}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: totalCells }, (_, id) => {
          const revealed = revealedCells.includes(id) || mineCells.includes(id)
          const isMine    = mineCells.includes(id)
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              disabled={gridDisabled || revealed}
              className={`
                relative aspect-square rounded-lg border-2 flex items-center justify-center
                ${!revealed
                  ? 'bg-neutral-800 border-neutral-600 hover:bg-neutral-700'
                  : isMine
                  ? 'bg-rose-500 border-rose-700'
                  : 'bg-emerald-500 border-emerald-700'}                
              `}
            >
              {revealed && (isMine ? '💥' : '✔️')}
              {explodedCell === id && <span className="absolute text-2xl">💣</span>}
            </button>
          )
        })}
      </div>

      {/* actions */}
      <div className="flex space-x-4 mb-6">
        {sessionId && !gameOver && !cashedOut && (
          <button
            onClick={() => handleCashOut()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            Cash Out
          </button>
        )}
        {sessionId && (
          <button
            onClick={() => startGame(draftBet)}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
          >
            {gameOver || cashedOut ? 'Play Again' : 'Restart'}
          </button>
        )}
      </div>
    </div>
  )
}
