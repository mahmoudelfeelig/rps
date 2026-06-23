import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { API_BASE } from '../../api'
import toast from 'react-hot-toast'
import { Sparkles, Save, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'


const LS_LAST = 'minefield.last'
const LS_PRESETS = 'minefield.presets'
const readPresets = () => {
  try { return JSON.parse(localStorage.getItem(LS_PRESETS) || '[]') } catch { return [] }
}
const writePresets = (arr) => {
  try { localStorage.setItem(LS_PRESETS, JSON.stringify(arr)) } catch {}
}
const readLast = () => {
  try { return JSON.parse(localStorage.getItem(LS_LAST) || 'null') } catch { return null }
}
const writeLast = (p) => {
  try { localStorage.setItem(LS_LAST, JSON.stringify(p)) } catch {}
}

export default function Minefield() {
  const { token, refreshUser, user } = useAuth()

  const [rows, setRows] = useState(8)
  const [cols, setCols] = useState(8)
  const [mines, setMines] = useState(10)
  const totalCells = rows * cols

  const [presets, setPresets] = useState(readPresets())
  const [presetName, setPresetName] = useState('')
  const [activePreset, setActivePreset] = useState(null)

  const [sessionId, setSessionId] = useState(null)
  const [revealedCells, setRevealedCells] = useState([])
  const [mineCells, setMineCells] = useState([])
  const [safeCount, setSafeCount] = useState(0)
  const [extraSafeClicks, setExtraSafeClicks] = useState(0)
  const [mineReduction, setMineReduction] = useState(0)
  const [sessionMinesCount, setSessionMinesCount] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [explodedCell, setExplodedCell] = useState(null)

  const [nextRaw, setNextRaw] = useState(0)
  const [lastCashReward, setLastCashReward] = useState(0)

  const [draftBet, setDraftBet] = useState(100)

  const slidersDisabled = !!sessionId && !gameOver && !cashedOut
  const gridDisabled    = !!sessionId && (gameOver || cashedOut)

  useEffect(() => {
    const last = readLast()
    if (last?.rows && last?.cols) {
      setRows(last.rows); setCols(last.cols)
      if (last.mines) setMines(Math.min(last.mines, last.rows * last.cols - 1))
      if (last.name) setActivePreset(last.name)
    }
  }, [])

  const buffMultiplier = (user?.inventory || [])
    .filter(e => e.item?.effectType === 'reward-multiplier')
    .map(e => Number(e.item.effectValue) || 1)
    .reduce((a, b) => a * b, 1)

  const startGame = useCallback(async (betOverride) => {
    const bet = typeof betOverride === 'number' ? betOverride : draftBet
    if (bet <= 0) return toast.error('Bet must be ≥ 1')

    try {
      const res  = await fetch(`${API_BASE}/api/games/minefield/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betAmount: bet, rows, cols, mines }),
      })
      const json = await res.json()
      if (!res.ok) return toast.error(json.message)

      setExtraSafeClicks(json.extraSafeClicks || 0)
      setMineReduction(json.mineReduction || 0)
      setSessionMinesCount(json.minesCount)
      setSessionId(json.sessionId)
      setRevealedCells([])
      setMineCells([])
      setSafeCount(0)
      setNextRaw(0)
      setLastCashReward(0)
      setGameOver(false)
      setCashedOut(false)
      setExplodedCell(null)

      await refreshUser()
    } catch {
      toast.error('Network error starting game')
    }
  }, [cols, draftBet, mines, refreshUser, rows, token])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'r') {
        if (!sessionId) return
        startGame(draftBet)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sessionId, draftBet, startGame])

  const handleClick = async (id) => {
    if (!sessionId || gameOver || cashedOut) return
    try {
      const res  = await fetch(`${API_BASE}/api/games/minefield/reveal`, {
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
        setExplodedCell(id)
        setMineCells(json.mines)
        setGameOver(true)
        await refreshUser()
      } else {
        setSafeCount(json.safeCount)
        if (json.extraSafeClicks != null) setExtraSafeClicks(json.extraSafeClicks)
        setNextRaw(json.potentialReward)
        if (sessionMinesCount != null && json.safeCount >= totalCells - sessionMinesCount) {
          await handleCashOut(true)
          toast.success(`🎉 Solved it! You earned ${lastCashReward || json.potentialReward} coins.`)
        } else {
          setRevealedCells(rc => [...rc, id])
        }
      }
    } catch {
      toast.error('Network error revealing cell')
    }
  }

  const handleCashOut = async (silent = false) => {
    if (!sessionId || gameOver || cashedOut) return
    try {
      const res  = await fetch(`${API_BASE}/api/games/minefield/cashout`, {
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
      setLastCashReward(json.reward)
      if (!silent) toast.success(`✅ You cashed out ${json.reward} coins!`)
      await refreshUser()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const clampMines = (r, c) => {
    const max = r * c - 1
    setMines(m => Math.max(2, Math.min(m, max)))
  }

  const applyPreset = useCallback((p) => {
    setRows(p.rows); setCols(p.cols)
    setMines(Math.min(p.mines, p.rows * p.cols - 1))
    setActivePreset(p.name || `${p.rows}×${p.cols}-${p.mines}`)
    writeLast(p)
    toast.success(`Preset "${p.name}" applied`)
  }, [])

  const savePreset = () => {
    const name = presetName.trim()
    if (!name) return toast.error('Name your preset')
    const p = { name, rows, cols, mines }
    const arr = readPresets().filter(x => x.name !== name)
    arr.push(p)
    writePresets(arr)
    setPresets(arr)
    setActivePreset(name)
    writeLast(p)
    setPresetName('')
    toast.success('Preset saved')
  }

  const deletePreset = (name) => {
    const arr = readPresets().filter(x => x.name !== name)
    writePresets(arr)
    setPresets(arr)
    if (activePreset === name) setActivePreset(null)
    toast.success('Preset deleted')
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-gradient-to-br from-slate-900 to-black text-white">
      <h1 className="text-5xl font-extrabold mb-2 flex items-center gap-2">💣 Minefield</h1>
      <div className="mb-2 text-sm text-white/70">
        Need ideas? Check <Link to="/bets" className="text-pink-400 underline">active bets</Link>.
      </div>
      <div className="mb-6 text-lg">
        Balance: <span className="font-semibold">{user?.balance ?? 0}</span> coins
      </div>
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm">
          <Sparkles size={16} className="text-yellow-300" />
          Active preset:&nbsp;
          <strong className="text-yellow-300">{activePreset || '-'}</strong>
        </span>
      </div>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Rows: {rows}</label>
          <input
            type="range" min={3} max={12} value={rows} disabled={slidersDisabled}
            onChange={e => { const v = +e.target.value; setRows(v); clampMines(v, cols) }}
            className="accent-purple-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Cols: {cols}</label>
          <input
            type="range" min={3} max={12} value={cols} disabled={slidersDisabled}
            onChange={e => { const v = +e.target.value; setCols(v); clampMines(rows, v) }}
            className="accent-purple-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Mines: {mines}</label>
          <input
            type="range" min={2} max={totalCells - 1} value={mines} disabled={slidersDisabled}
            onChange={e => setMines(+e.target.value)}
            className="accent-rose-500"
          />
        </div>
      </div>
      <div className="w-full max-w-xl bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none"
              placeholder="Save current as preset (name)…"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <button
              className="px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
              onClick={savePreset}
              title="Save preset"
            >
              <Save size={16} /> Save
            </button>
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-white/70">Your presets</span>
            <span className="text-xs text-white/40">{presets.length} total</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {presets.length === 0 && (
              <span className="text-sm text-white/50">No presets yet.</span>
            )}
            {presets.map((p) => {
              const isActive = activePreset === p.name
              return (
                <div
                  key={p.name}
                  className={`flex items-center gap-1 pl-2 pr-1 py-1 rounded-xl border text-sm
                    ${isActive ? 'bg-yellow-500/20 border-yellow-400/40' : 'bg-white/5 border-white/10'}
                  `}
                >
                  <button
                    className="px-1.5 py-0.5 rounded hover:bg-white/10"
                    onClick={() => applyPreset(p)}
                    title={`${p.rows}×${p.cols}, ${p.mines} mines`}
                  >
                    {p.name} <span className="text-white/50">({p.rows}×{p.cols}, {p.mines})</span>
                  </button>
                  <button
                    className="ml-1 p-1 rounded hover:bg-white/10 text-white/70"
                    onClick={() => deletePreset(p.name)}
                    aria-label={`Delete ${p.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-600/30">Reward ×{buffMultiplier.toFixed(2)}</span>
        <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full border border-green-600/30">Safe Clicks: {extraSafeClicks}</span>
        {mineReduction > 0 && (
          <span className="bg-rose-600/20 text-rose-300 px-3 py-1 rounded-full border border-rose-600/30">–{mineReduction} Mines</span>
        )}
      </div>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="betInput" className="text-lg">Stake:</label>
        <input
          id="betInput" type="number" min="1" value={draftBet}
          onChange={e => setDraftBet(+e.target.value)}
          className="w-28 px-3 py-2 bg-gray-900/70 border border-white/10 rounded-lg text-white"
        />
        <button onClick={() => setDraftBet(user?.balance ?? 0)} className="px-3 py-2 text-sm bg-white/10 border border-white/10 rounded-lg">Max</button>
        <button
          onClick={() => startGame(draftBet)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          title="Start / Restart (R)"
        >
          Enter
        </button>
      </div>
      <div className="mb-4 text-lg">
        {!sessionId
          ? 'Set stake & Enter to start'
          : gameOver
            ? '💥 Boom—lost it all!'
            : cashedOut
              ? `✅ You cashed out ${lastCashReward} coins!`
              : `Safe: ${safeCount} | Next: ${nextRaw}`
        }
      </div>
      <div
        className={`grid gap-2 mb-6 w-full max-w-xl transition-opacity ${gridDisabled ? 'pointer-events-none opacity-60' : ''}`}
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
                relative aspect-square rounded-xl border-2 flex items-center justify-center transition
                ${
                  !revealed
                    ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                    : isMine
                      ? 'bg-rose-500 border-rose-700'
                      : 'bg-emerald-500 border-emerald-700'
                }
              `}
            >
              {revealed && (isMine ? '💥' : '✔️')}
              {explodedCell === id && <span className="absolute text-2xl">💣</span>}
            </button>
          )
        })}
      </div>
      <div className="flex gap-3 mb-10">
        {sessionId && !gameOver && !cashedOut && (
          <button onClick={() => handleCashOut()} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">
            Cash Out
          </button>
        )}
        {sessionId && (
          <button onClick={() => startGame(draftBet)} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium" title="Play Again (R)">
            {gameOver || cashedOut ? 'Play Again' : 'Restart'}
          </button>
        )}
      </div>
    </div>
  )
}
