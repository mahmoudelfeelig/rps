import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'
import { Button } from '../components/ui/button'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'puzzleRushSolved'

export default function PuzzleRush() {
  const { token } = useAuth()
  const [puzzles, setPuzzles] = useState([])
  const [wins, setWins]       = useState(0)
  const [solvedIds, setSolvedIds] = useState(new Set())

  // load puzzles, wins, and solved-today set
  useEffect(() => {
    // fetch puzzles + stats
    fetch(`${API_BASE}/api/games/puzzle-rush`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setPuzzles(data.puzzles)
        setWins(data.wins)
      })
      .catch(console.error)

    // init localStorage solved tracking
    const today = new Date().toISOString().slice(0,10)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const { date, ids } = JSON.parse(raw)
        if (date === today) {
          setSolvedIds(new Set(ids))
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [] }))
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [] }))
    }
  }, [token])

  // call when a puzzle is solved
  const handleSolve = useCallback(async (id, answer) => {
    try {
      const res = await fetch(`${API_BASE}/api/games/puzzle-rush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ puzzleId: id, answer })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Wrong, try again')
        return
      }
      // success
      setWins(data.wins)
      toast.success(`Correct! +${data.reward} coins`)
      // mark solved
      setSolvedIds(prev => {
        const next = new Set(prev).add(id)
        const today = new Date().toISOString().slice(0,10)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, ids: [...next] }))
        return next
      })
    } catch (err) {
      console.error(err)
      toast.error('Server error')
    }
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-center">🧩 Daily Puzzle Rush</h1>
        <p className="text-center text-indigo-300 mb-12">
          Solved today: <span className="font-semibold">{wins}</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {puzzles.map(p => {
            if (solvedIds.has(p.id)) {
              return (
                <div key={p.id} className="relative p-8 bg-gray-800/40 backdrop-blur-xl rounded-3xl text-center opacity-60">
                  <h2 className="text-2xl font-bold mb-4 capitalize">{p.type.replace('-', ' ')}</h2>
                  <p className="text-lg">You’ve already solved this puzzle today.</p>
                </div>
              )
            }
            switch (p.type) {
              case 'match-3':
                return <Match3 key={p.id} puzzle={p} onSolve={handleSolve} />
              case 'sliding':
                return <Sliding key={p.id} puzzle={p} onSolve={handleSolve} />
              case 'memory':
                return <Memory key={p.id} puzzle={p} onSolve={handleSolve} />
              case 'logic-grid':
                return <LogicGrid key={p.id} puzzle={p} onSolve={handleSolve} />
              case 'n-queens':
                return <NQueens key={p.id} puzzle={p} onSolve={handleSolve} />
              default:
                return null
            }
          })}
        </div>
      </div>
    </div>
  )
}

// ====== individual puzzle components =====
// each takes more screen-space (p-8), shows a submit overlay when ready

function Match3({ puzzle, onSolve }) {
  const { grid: initialGrid } = puzzle.question
  const { swap }              = puzzle.solution
  const [grid, setGrid]       = useState(initialGrid)
  const [first, setFirst]     = useState(null)
  const [ready, setReady]     = useState(false)

  const clickCell = (r, c) => {
    if (ready) return
    if (!first) {
      setFirst([r, c])
    } else {
      const [r1, c1] = first
      if (Math.abs(r - r1) + Math.abs(c - c1) === 1) {
        const g2 = grid.map(row => row.slice())
        ;[g2[r1][c1], g2[r][c]] = [g2[r][c], g2[r1][c1]]
        setGrid(g2)
        setFirst(null)
        if (
          (swap.from[0] === r1 && swap.from[1] === c1 &&
           swap.to[0]   === r && swap.to[1]   === c) ||
          (swap.from[0] === r && swap.from[1] === c &&
           swap.to[0]   === r1 && swap.to[1]   === c1)
        ) {
          setReady(true)
        }
      } else {
        setFirst([r, c])
      }
    }
  }

  const submit = () => onSolve(puzzle.id, { swap })

  return (
    <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-4">Match-3</h2>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {grid.map((row, r) =>
          row.map((col, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => clickCell(r,c)}
              className={`w-12 h-12 rounded-lg cursor-pointer transition ${
                col==='red'   ? 'bg-red-500'   :
                col==='green' ? 'bg-green-500' :
                col==='blue'  ? 'bg-blue-500'  :
                'bg-gray-400'
              } ${first && first[0]===r && first[1]===c ? 'ring-4 ring-yellow-300' : ''}`}
            />
          ))
        )}
      </div>

      {ready && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl">
          <Button onClick={submit} size="lg">Submit Answer</Button>
        </div>
      )}
    </div>
  )
}

function Sliding({ puzzle, onSolve }) {
  const { board: initial } = puzzle.question
  const { solution }      = puzzle.solution
  const [board, setBoard]  = useState(initial)
  const [ready, setReady]  = useState(false)

  const clickTile = (r,c) => {
    if (ready) return
    let br, bc
    board.forEach((row, i) =>
      row.forEach((v,j)=>{ if(v===0){ br=i; bc=j } })
    )
    if (Math.abs(br-r)+Math.abs(bc-c)===1) {
      const b2 = board.map(row=>row.slice())
      ;[b2[br][bc], b2[r][c]] = [b2[r][c], b2[br][bc]]
      setBoard(b2)
      // check if inverted moves applied
      const flat = b2.flat().map((v,i)=>i===8?0:i+1)
      if (flat.every((v,i)=>v===initial.flat()[i])) {
        setReady(true)
      }
    }
  }

  const submit = () => onSolve(puzzle.id, solution)

  return (
    <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-4">Sliding Tile</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.flat().map((v,i)=>(
          <div
            key={i}
            onClick={()=>clickTile(Math.floor(i/3), i%3)}
            className={`w-16 h-16 flex items-center justify-center rounded-lg text-xl font-bold cursor-pointer ${
              v===0?'bg-gray-700':'bg-indigo-600'
            }`}
          >
            {v!==0 && v}
          </div>
        ))}
      </div>

      {ready && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl">
          <Button onClick={submit} size="lg">Submit Answer</Button>
        </div>
      )}
    </div>
  )
}

function Memory({ puzzle, onSolve }) {
  const { board: solutionBoard } = puzzle.solution
  const size = solutionBoard.length
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [ready, setReady]     = useState(false)

  const clickCard = i => {
    if (ready || flipped.includes(i) || matched.includes(i)) return
    const f2 = [...flipped, i]
    setFlipped(f2)
    if (f2.length===2) {
      const [i1,i2] = f2
      if (solutionBoard.flat()[i1] === solutionBoard.flat()[i2]) {
        setMatched(m=>[...m,i1,i2])
        if (matched.length+2 === size*size) {
          setReady(true)
        }
      }
      setTimeout(()=>setFlipped([]), 800)
    }
  }

  const submit = () => onSolve(puzzle.id, { board: solutionBoard })

  return (
    <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-4">Memory Flip</h2>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {solutionBoard.flat().map((v,i)=>(
          <div
            key={i}
            onClick={()=>clickCard(i)}
            className={`w-16 h-16 flex items-center justify-center rounded-lg text-xl font-bold cursor-pointer transition ${
              matched.includes(i) || flipped.includes(i)
                ? 'bg-yellow-400'
                : 'bg-gray-700'
            }`}
          >
            {(matched.includes(i) || flipped.includes(i)) && v}
          </div>
        ))}
      </div>

      {ready && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl">
          <Button onClick={submit} size="lg">Submit Answer</Button>
        </div>
      )}
    </div>
  )
}

function LogicGrid({ puzzle, onSolve }) {
  const { categories, clues } = puzzle.question
  const solution = puzzle.solution
  const persons = categories.persons
  const pets    = categories.pets
  const [choices, setChoices] = useState({})
  const [ready, setReady]     = useState(false)

  const selectPet = (person, pet) => {
    if (ready) return
    const c2 = { ...choices, [person]: pet }
    setChoices(c2)
    if (persons.every(p => c2[p] === solution[p])) {
      setReady(true)
    }
  }

  const submit = () => onSolve(puzzle.id, solution)

  return (
    <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-4">Logic Grid</h2>
      <ul className="list-disc list-inside mb-4">
        {clues.map((cl,i)=> <li key={i} className="text-sm">{cl}</li>)}
      </ul>
      {persons.map(p=>(
        <div key={p} className="mb-2">
          <span className="mr-3 font-medium">{p}:</span>
          {pets.map(pt=>(
            <button
              key={pt}
              onClick={()=>selectPet(p,pt)}
              className={`px-3 py-1 mr-2 rounded-lg ${
                choices[p]===pt ? 'bg-green-500' : 'bg-gray-600 hover:bg-green-400'
              }`}
            >
              {pt}
            </button>
          ))}
        </div>
      ))}

      {ready && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl">
          <Button onClick={submit} size="lg">Submit Answer</Button>
        </div>
      )}
    </div>
  )
}

function NQueens({ puzzle, onSolve }) {
  const { positions: solution } = puzzle.solution
  const size = solution.length
  const [queens, setQueens] = useState(Array(size).fill(null))
  const [ready, setReady]   = useState(false)

  const placeQueen = (row, col) => {
    if (ready) return
    const q2 = [...queens]
    q2[row] = q2[row] === col ? null : col
    setQueens(q2)
    if (q2.every((c,i) => c === solution[i])) {
      setReady(true)
    }
  }

  const submit = () => onSolve(puzzle.id, { positions: solution })

  return (
    <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl overflow-auto">
      <h2 className="text-2xl font-bold mb-4">8-Queens</h2>
      <div className="inline-block border-2 border-gray-600">
        {Array(size).fill(0).map((_,r)=>(
          <div key={r} className="flex">
            {Array(size).fill(0).map((_,c)=>(
              <div
                key={c}
                onClick={()=>placeQueen(r,c)}
                className={`w-12 h-12 flex items-center justify-center border border-gray-600 cursor-pointer ${
                  (r+c)%2===0 ? 'bg-gray-700' : 'bg-gray-800'
                }`}
              >
                {queens[r]===c && '♕'}
              </div>
            ))}
          </div>
        ))}
      </div>

      {ready && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-3xl">
          <Button onClick={submit} size="lg">Submit Answer</Button>
        </div>
      )}
    </div>
  )
}
