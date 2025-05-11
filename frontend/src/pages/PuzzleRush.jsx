import React, { useEffect, useState, useCallback } from 'react'
import { useAuth }           from '../context/AuthContext'
import { API_BASE }          from '../api'
import { Button }            from '../components/ui/button'
import { Card }              from '../components/ui/card'
import toast                 from 'react-hot-toast'

/* ------------------------------------------------------------------ */
/*  constants                                                         */
/* ------------------------------------------------------------------ */
const STORAGE_KEY   = 'puzzleRushSolvedToday'
const TILE_ICONS    = ['🍒', '🍋', '🍉', '🔷', '💎', '🌟', '🥝']
const TILE_CLASSES  = [
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-slate-400 to-slate-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-amber-400 to-amber-600',
  'bg-gradient-to-br from-lime-400 to-lime-600'
]
const REGION_COLORS = [
  '#ec4899', '#3b82f6', '#22c55e', '#eab308',
  '#a855f7', '#10b981', '#f59e0b', '#f97316'
]

const SLIDING_SOLUTION = [
  [1,2,3],
  [4,5,6],
  [7,8,0]
]

/* ------------------------------------------------------------------ */
/*  generic helpers                                                   */
/* ------------------------------------------------------------------ */
const hasMatch = g => {
  const H = g.length, W = g[0].length
  for (let r = 0; r < H; r++)
    for (let c = 0; c + 2 < W; c++)
      if (g[r][c] === g[r][c+1] && g[r][c] === g[r][c+2])
        return true
  for (let c = 0; c < W; c++)
    for (let r = 0; r + 2 < H; r++)
      if (g[r][c] === g[r+1][c] && g[r][c] === g[r+2][c])
        return true
  return false
}

const boardEqual = (a, b) =>
  a.flat().every((v, i) => v === b.flat()[i])

/* ------------------------------------------------------------------ */
/*  top-level component                                               */
/* ------------------------------------------------------------------ */
export default function PuzzleRush() {
  const { token } = useAuth()
  const [puzzles, setPuzzles] = useState([])
  const [wins,     setWins]   = useState(0)
  const [solved,   setSolved] = useState(new Set())

  /* load puzzles & init solved-today */
  useEffect(() => {
    fetch(`${API_BASE}/api/games/puzzle-rush`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setPuzzles(data.puzzles || [])
        setWins(data.wins       || 0)
        setSolved(new Set(data.solved || []))
      })
      .catch(console.error)

    const today = new Date().toISOString().slice(0,10)
    const raw   = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const { date, ids } = JSON.parse(raw)
      if (date === today) setSolved(new Set(ids))
      else localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [] }))
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [] }))
    }
  }, [token])

  /* markSolved with guard + optimistic update + revert on fail */
  const markSolved = useCallback(async (id, answer) => {
    if (solved.has(id)) return

    // optimistic
    setSolved(prev => {
      const next = new Set(prev)
      next.add(id)
      const today = new Date().toISOString().slice(0,10)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [...next] }))
      return next
    })

    try {
      const res = await fetch(`${API_BASE}/api/games/puzzle-rush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`
        },
        body: JSON.stringify({ puzzleId: id, answer })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Incorrect')

      toast.success(`Correct! +${data.reward} coins`)
      setWins(data.wins)

    } catch (err) {
      // revert
      setSolved(prev => {
        const next = new Set(prev)
        next.delete(id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          date: new Date().toISOString().slice(0,10),
          ids: [...next]
        }))
        return next
      })
      toast.error(err.message)
    }
  }, [token, solved])

  /* render */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-6">🧩 Daily Puzzle Rush</h1>
        <p className="text-center text-indigo-300 mb-10">
          Solved today: <span className="font-semibold">{wins}</span>
        </p>

        {/* first row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {['sliding','memory','match-3'].map(type => {
            const p = puzzles.find(p => p.type === type)
            return p && !solved.has(p.id)
              ? <Puzzle key={type} puzzle={p} onSolve={markSolved}/>
              : <SolvedCard key={type} type={type}/>
          })}
        </div>

        {/* logic */}
        <div className="mb-10">
          {(() => {
            const p = puzzles.find(p => p.type === 'logic-grid')
            return p && !solved.has(p.id)
              ? <Puzzle puzzle={p} onSolve={markSolved}/>
              : <SolvedCard type="logic-grid"/>
          })()}
        </div>

        {/* n-queens */}
        <div>
          {(() => {
            const p = puzzles.find(p => p.type === 'n-queens')
            return p && !solved.has(p.id)
              ? <Puzzle puzzle={p} onSolve={markSolved}/>
              : <SolvedCard type="n-queens"/>
          })()}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Solved placeholder                                                */
/* ------------------------------------------------------------------ */
const SolvedCard = ({ type }) => (
  <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl min-h-[22rem]
                  flex flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-bold capitalize">{type.replace('-',' ')}</h2>
    <p className="mt-3 text-sm opacity-70">Solved already ✔</p>
  </div>
)

/* ------------------------------------------------------------------ */
/*  dispatcher                                                        */
/* ------------------------------------------------------------------ */
const Puzzle = ({ puzzle, onSolve }) => {
  switch (puzzle.type) {
    case 'match-3':    return <Match3   puzzle={puzzle} onSolve={onSolve}/>
    case 'sliding':    return <Sliding  puzzle={puzzle} onSolve={onSolve}/>
    case 'memory':     return <Memory   puzzle={puzzle} onSolve={onSolve}/>
    case 'logic-grid': return <Logic    puzzle={puzzle} onSolve={onSolve}/>
    case 'n-queens':   return <NQueens  puzzle={puzzle} onSolve={onSolve}/>
    default:           return null
  }
}

function getLocalKey(id) {
  return `match3_progress_${id}`
}

/* ------------------------------------------------------------------ */
/*  MATCH-3                                                           */
/* ------------------------------------------------------------------ */
function Match3({ puzzle, onSolve }) {
  const { grid: initialGrid } = puzzle.question
  const target = puzzle.solution?.count ?? 20
  const localKey = getLocalKey(puzzle.id)
  const size = 5

  const stored = localStorage.getItem(localKey)
  const saved  = stored ? JSON.parse(stored) : null

  const [grid, setGrid]         = useState([])
  const [count, setCount]       = useState(0)
  const [sel, setSel]           = useState(null)
  const [ready, setReady]       = useState(false)
  const [animMap, setAnimMap]   = useState({})
  const [invalidSwap, setInvalidSwap] = useState(null)
  const [reshuffling, setReshuffling] = useState(false)

  const randomTile = () => Math.floor(Math.random() * TILE_ICONS.length)

  const swap = (a, b, g) => {
    const newG = g.map(r => r.slice())
    const [r1, c1] = a, [r2, c2] = b
    ;[newG[r1][c1], newG[r2][c2]] = [newG[r2][c2], newG[r1][c1]]
    return newG
  }

  const resolveMatches = g => {
    const matched = Array.from({ length: size }, () => Array(size).fill(false))
    let found = 0

    // horizontal
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - 3; c++) {
        const v = g[r][c]
        if (v != null && v === g[r][c+1] && v === g[r][c+2]) {
          matched[r][c] = matched[r][c+1] = matched[r][c+2] = true
        }
      }
    }
    // vertical
    for (let c = 0; c < size; c++) {
      for (let r = 0; r <= size - 3; r++) {
        const v = g[r][c]
        if (v != null && v === g[r+1][c] && v === g[r+2][c]) {
          matched[r][c] = matched[r+1][c] = matched[r+2][c] = true
        }
      }
    }

    const newG = g.map((row, r) =>
      row.map((cell, c) => matched[r][c] ? null : cell)
    )
    matched.flat().forEach(m => m && found++)
    return { newG, found }
  }

  const applyGravity = g => {
    const newG = Array.from({ length: size }, () => Array(size).fill(null))
    const anims = {}
    for (let c = 0; c < size; c++) {
      let col = []
      for (let r = 0; r < size; r++) {
        if (g[r][c] != null) col.push(g[r][c])
      }
      while (col.length < size) col.unshift(randomTile())
      for (let r = 0; r < size; r++) {
        newG[r][c] = col[r]
        if (g[r][c] == null) anims[`${r}-${c}`] = 'fall-down'
      }
    }
    setAnimMap(anims)
    return newG
  }

  const hasAnyValidMoves = g => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (c+1 < size && resolveMatches(swap([r,c],[r,c+1],g)).found>0) return true
        if (r+1 < size && resolveMatches(swap([r,c],[r+1,c],g)).found>0) return true
      }
    }
    return false
  }

  const generateValidGrid = () => {
    let g, attempts = 0
    do {
      g = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => randomTile())
      )
      attempts++
    } while (!hasAnyValidMoves(g) && attempts < 50)
    return g
  }

  const autoClearLoop = (grid, startCount) => {
    let g = grid, cnt = startCount
    while (true) {
      const { newG, found } = resolveMatches(g)
      if (found === 0) break
      cnt += Math.floor(found/3)
      g = applyGravity(newG)
    }
    return { clearedGrid: g, updatedCount: cnt }
  }

  useEffect(() => {
    const base       = saved?.grid  || generateValidGrid()
    const startCount = saved?.count || 0
    const { clearedGrid, updatedCount } = autoClearLoop(base, startCount)
    setGrid(clearedGrid)
    setCount(updatedCount)
    setReady(updatedCount >= target)
  }, [])

  useEffect(() => {
    localStorage.setItem(localKey, JSON.stringify({ grid, count }))
  }, [grid, count])

  const handleClick = (r, c) => {
    if (ready || reshuffling) return
    if (!sel) return setSel([r,c])

    const [r1,c1] = sel
    if (Math.abs(r-r1)+Math.abs(c-c1) !== 1) return setSel([r,c])

    const g2 = swap([r,c],[r1,c1],grid)
    const { newG, found } = resolveMatches(g2)

    if (found === 0) {
      const dx = `${(c-c1)*16}px`, dy = `${(r-r1)*16}px`
      const key = `${r}-${c}`
      setInvalidSwap({ key, dx, dy })
      setTimeout(()=>setInvalidSwap(null),400)
      setSel(null)
      return
    }

    let gained = Math.floor(found/3)
    let newCount = count + gained
    let g3 = applyGravity(newG)
    const { clearedGrid, updatedCount } = autoClearLoop(g3, newCount)
    g3 = clearedGrid
    newCount = updatedCount

    if (!hasAnyValidMoves(g3)) {
      setReshuffling(true)
      setTimeout(()=>{
        const regen = generateValidGrid()
        const auto = autoClearLoop(regen, newCount)
        setGrid(auto.clearedGrid)
        setCount(auto.updatedCount)
        setReshuffling(false)
      },400)
    } else {
      setGrid(g3)
      setCount(newCount)
    }

    setSel(null)
    setReady(newCount >= target)
  }

  return (
    <Card title="Match-3 (Get 20 Matches)" ready={ready} onSubmit={()=>onSolve(puzzle.id,{count})}>
      {reshuffling && (
        <div className="text-center text-indigo-400 text-sm font-medium mb-2 animate-pulse">
          ♻️ No valid moves — reshuffling...
        </div>
      )}
      <div className="grid grid-cols-5 gap-1 mx-auto mb-2">
        {grid.map((row,r)=>
          row.map((tileId,c)=>{
            const id    = `${r}-${c}`
            const isSel = sel && sel[0]===r && sel[1]===c
            const icon  = TILE_ICONS[tileId]
            const cls   = TILE_CLASSES[tileId]
            const style = invalidSwap?.key===id
              ? { '--dx': invalidSwap.dx, '--dy': invalidSwap.dy }
              : {}

            return (
              <div
                key={id}
                onClick={()=>handleClick(r,c)}
                className={`
                  w-12 h-12 md:w-14 md:h-14 flex items-center justify-center
                  rounded-xl shadow-md font-bold text-xl cursor-pointer
                  transition-all duration-200 ease-out
                  ${cls || 'bg-gray-800'}
                  ${isSel ? 'ring-4 ring-yellow-300' : ''}
                  ${animMap[id] || ''}
                  ${invalidSwap?.key===id ? 'invalid-swap' : ''}
                `}
                style={style}
              >{icon}</div>
            )
          })
        )}
      </div>
      <p className="text-sm text-center text-indigo-300 font-medium">
        Matches: <span className="text-white font-bold">{count}</span> / {target}
      </p>
      {ready && (
        <div className="mt-4 text-green-400 text-center font-semibold text-lg">
          🎉 Success! You reached {target} matches.
        </div>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  SLIDING TILE (3×3)                                                */
/* ------------------------------------------------------------------ */
function Sliding({ puzzle, onSolve }) {
  const { board:init } = puzzle.question
  const moves          = puzzle.solution
  const [board, setBoard] = useState(init)
  const [ready, setReady] = useState(false)

  const click=(r,c)=>{
    if(ready) return
    let br,bc
    board.forEach((row,i)=>row.forEach((v,j)=>{ if(v===0){ br=i; bc=j }}))
    if(Math.abs(br-r)+Math.abs(bc-c)===1){
      const b2 = board.map(rw=>rw.slice())
      ;[b2[br][bc],b2[r][c]] = [b2[r][c],b2[br][bc]]
      setBoard(b2)
      if(boardEqual(b2,SLIDING_SOLUTION)) setReady(true)
    }
  }

  return (
    <Card title="Sliding Tile" ready={ready} onSubmit={()=>onSolve(puzzle.id,moves)}>
      <div className="grid grid-cols-3 gap-1 mx-auto">
        {board.flat().map((v,i)=>(
          <div
            key={i}
            onClick={()=>click(Math.floor(i/3),i%3)}
            className={`
              w-16 h-16 flex items-center justify-center rounded-md font-bold
              ${v===0?'bg-gray-700':'bg-indigo-600'}
            `}
          >{v||''}</div>
        ))}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  MEMORY                                                            */
/* ------------------------------------------------------------------ */
function Memory({ puzzle, onSolve }) {
  const { board: sol } = puzzle.solution
  const size = sol.length
  const [flip,  setFlip]  = useState([])
  const [match, setMatch] = useState([])
  const [ready, setReady] = useState(false)

  const click = i => {
    if (ready || flip.includes(i) || match.includes(i)) return
    const f2 = [...flip, i]
    setFlip(f2)
    if (f2.length === 2) {
      const [a,b] = f2
      if (sol.flat()[a] === sol.flat()[b]) {
        setMatch(m=>[...m,a,b])
        if (match.length + 2 === size*size) setReady(true)
      }
      setTimeout(()=>setFlip([]),700)
    }
  }

  return (
    <Card title="Memory Flip" ready={ready} onSubmit={()=>onSolve(puzzle.id,{board:sol})}>
      <div className="grid grid-cols-4 gap-1 mx-auto">
        {sol.flat().map((v,i)=>(
          <div
            key={i}
            onClick={()=>click(i)}
            className={`
              w-14 h-14 flex items-center justify-center rounded-md text-lg font-bold
              ${(match.includes(i)||flip.includes(i))?'bg-yellow-400':'bg-gray-700'}
            `}
          >{(match.includes(i)||flip.includes(i)) && v}</div>
        ))}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  LOGIC GRID                                                        */
/* ------------------------------------------------------------------ */
export function Logic({ puzzle, onSolve }) {
  const { categories, clues } = puzzle.question
  const [A,B,C] = Object.values(categories)
  const solution = puzzle.solution
  const [choice, setChoice] = useState({ AB: {}, AC: {} })

  const ready =
    Object.keys(choice.AB).length === A.length &&
    Object.keys(choice.AC).length === A.length &&
    A.every(a=> choice.AB[a]===solution.AB[a] && choice.AC[a]===solution.AC[a])

  const select = (type, a, val) => {
    setChoice(prev=>({
      ...prev,
      [type]: { ...prev[type], [a]: val }
    }))
  }

  return (
    <Card
      title="Logic Grid"
      ready={ready}
      onSubmit={()=>onSolve(puzzle.id, solution)}
      className="w-full max-w-[1600px] min-w-[900px]"
    >
      {/* clues */}
      <div className="max-h-[18rem] overflow-y-auto mb-4 px-1">
        <ul className="list-disc list-inside text-sm space-y-1">
          {clues.map((c,i)=><li key={i}>{c}</li>)}
        </ul>
      </div>

      <div className="space-y-8 overflow-x-auto">
        <LogicTable
          title={`${Object.keys(categories)[0]} ⇄ ${Object.keys(categories)[1]}`}
          rowLabels={A}
          colLabels={B}
          selected={choice.AB}
          onSelect={(a,b)=>select('AB',a,b)}
        />
        <LogicTable
          title={`${Object.keys(categories)[0]} ⇄ ${Object.keys(categories)[2]}`}
          rowLabels={A}
          colLabels={C}
          selected={choice.AC}
          onSelect={(a,c)=>select('AC',a,c)}
        />
      </div>
    </Card>
  )
}

function LogicTable({ title, rowLabels, colLabels, selected, onSelect }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1 text-indigo-300">{title}</h3>
      <div className="overflow-x-auto">
        <table className="table-fixed border-collapse w-full min-w-[600px] text-sm">
          <thead>
            <tr>
              <th className="w-24 text-left p-1"></th>
              {colLabels.map(col=>
                <th key={col} className="text-center p-1 whitespace-nowrap">{col}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map(row=>
              <tr key={row}>
                <td className="font-medium p-1 whitespace-nowrap">{row}</td>
                {colLabels.map(col=>
                  <td key={col} className="p-1 text-center">
                    <button
                      onClick={()=>onSelect(row,col)}
                      className={`w-8 h-8 rounded-full transition ${
                        selected[row]===col
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 hover:bg-green-400'
                      }`}
                    >
                      {selected[row]===col?'✓':''}
                    </button>
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  N-QUEENS                                                          */
/* ------------------------------------------------------------------ */
export function NQueens({ puzzle, onSolve }) {
  const { initial = [], regions = [] } = puzzle.question
  const N       = 8
  const { token } = useAuth()

  const getPhase = (r,c, q,m) => {
    const key = `${r},${c}`
    if (initial[r] === c) return 'given'
    if (q.some(([qr,qc])=>qr===r&&qc===c)) return 'queen'
    if (m[key]) return 'mark'
    return 'empty'
  }

  const [queens, setQueens] = useState(() => {
    const q = []
    for (let r=0; r<N; r++){
      if (initial[r] >= 0) q.push([r, initial[r]])
    }
    return q
  })
  const [marks, setMarks]     = useState({})
  const [cooldown, setCooldown] = useState(false)

  const isGiven = (r,c) => initial[r] === c

  const handleClick = (r,c) => {
    if (cooldown) return
    const key   = `${r},${c}`
    const phase = getPhase(r,c,queens,marks)
    if (phase === 'empty') {
      setMarks(m=>({ ...m, [key]: true }))
    } else if (phase === 'mark') {
      setMarks(m=>{
        const n = { ...m}
        delete n[key]
        return n
      })
      setQueens(q=>[...q,[r,c]])
    } else if (phase === 'queen') {
      if (!isGiven(r,c)) {
        setQueens(q=>q.filter(([qr,qc])=>!(qr===r&&qc===c)))
      }
    } else if (phase === 'given') {
      setMarks(m=>{
        const n = { ...m }
        if (n[key]) delete n[key]
        else n[key] = true
        return n
      })
    }
  }

  const checkAnswer = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/games/puzzle-rush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          puzzleId: puzzle.id,
          answer:  { positions: queens }
        })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || '❌ Not valid.')
        setCooldown(true)
        setTimeout(()=>setCooldown(false),2000)
        return
      }
      toast.success(`✅ Correct! +${data.reward} coins`)
      onSolve(puzzle.id, { positions: queens })
    } catch {
      toast.error('❌ Server error')
    }
  }

  return (
    <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 shadow-xl mb-12
                    flex flex-col items-start w-full max-w-3xl">
      <h2 className="text-3xl font-bold mb-6 text-indigo-200">8-Queens</h2>
      <div className="grid grid-cols-8 grid-rows-8 gap-[2px] border-4 border-black
                      w-full max-w-[500px] aspect-square mb-6">
        {regions.flatMap((row,r)=>
          row.map((reg,c)=>{
            const key   = `${r},${c}`
            const phase = getPhase(r,c,queens,marks)
            const bg    = REGION_COLORS[reg % REGION_COLORS.length]
            return (
              <div
                key={key}
                onClick={()=>handleClick(r,c)}
                className={`
                  relative flex items-center justify-center cursor-pointer select-none
                  transition duration-150 ease-in-out
                  ${phase==='queen'||phase==='given'?'ring-2 ring-yellow-400':''}
                  hover:ring-2 hover:ring-indigo-500
                `}
                style={{ backgroundColor: bg }}
              >
                {(phase==='queen'||phase==='given') && (
                  <span className={`
                    text-3xl font-black
                    ${phase==='given'?'text-purple-400':'text-yellow-300'}
                  `}>♛</span>
                )}
                {phase==='mark' && (
                  <span className="text-3xl font-extrabold text-white drop-shadow-sm">
                    <span className="text-red-600">✕</span>
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
      <Button
        onClick={checkAnswer}
        disabled={cooldown}
        size="lg"
        className="bg-pink-600 hover:bg-pink-700 transition-all"
      >
        {cooldown ? 'Please wait…' : 'Submit'}
      </Button>
    </div>
  )
}
