import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'
import { Button } from '../components/ui/button'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const spinnerConfigsBase = [
  {
    id: 'spinner',
    label: '⏱️ Hourly Spinner',
    endpoint: '/api/games/spinner',
    cooldownKey: 'spinner',
    intervalDesc: 'every hour',
  },
  {
    id: 'spinner12',
    label: '⏳ 12-Hour Spinner',
    endpoint: '/api/games/spinner12',
    cooldownKey: 'spinner12',
    intervalDesc: 'every 12 hours',
  },
  {
    id: 'spinnerDaily',
    label: '☀️ Daily Spinner',
    endpoint: '/api/games/spinnerDaily',
    cooldownKey: 'spinnerDaily',
    intervalDesc: 'once a day',
  },
  {
    id: 'spinnerWeekly',
    label: '🚀 Weekly Spinner',
    endpoint: '/api/games/spinnerWeekly',
    cooldownKey: 'spinnerWeekly',
    intervalDesc: 'once a week',
  },
]

export default function Spinner() {
  const { token, refreshUser } = useAuth()
  const [configs, setConfigs] = useState(null)

  // On mount, fetch progress + spinner configs
  useEffect(() => {
    if (!token) return
    (async () => {
      const res  = await fetch(`${API_BASE}/api/games/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('Failed to load spinner configs', data)
        return
      }
      // merge base + backend rewardOptions/weights
      const merged = spinnerConfigsBase.map(base => ({
        ...base,
        rewardOptions: data.spinners[base.id].rewardOptions,
        weights:       data.spinners[base.id].weights,
        cooldown:      data.cooldowns[base.id],
      }))
      setConfigs(merged)
    })()
  }, [token])

  if (!configs) {
    return <div className="text-center text-gray-400">Loading spinners…</div>
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-black to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-purple-400 text-center">
        🎰 Tiered Spinners
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {configs.map(cfg => (
          <SpinnerWheel
            key={cfg.id}
            cfg={cfg}
            token={token}
            refreshUser={refreshUser}
          />
        ))}
      </div>
    </div>
  )
}

function SpinnerWheel({ cfg, token, refreshUser }) {
  const {
    id, label, endpoint, cooldownKey,
    intervalDesc, rewardOptions, weights, cooldown: initialCd
  } = cfg

  const wheelRef = useRef(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation,   setRotation]   = useState(0)
  const [result,     setResult]     = useState(null)
  const [cooldown,   setCooldown]   = useState(initialCd)
  const [timeLeft,   setTimeLeft]   = useState('')
  const [hovered,    setHovered]    = useState(null)

  // build slices
  const totalWeight = weights.reduce((a,b)=>a+b,0)
  const angles      = weights.map(w=>(w/totalWeight)*360)
  const colors      = [
    '#22d3ee','#38bdf8','#818cf8','#a78bfa',
    '#f472b6','#fb923c','#fbbf24','#4ade80','#34d399'
  ].slice(0, rewardOptions.length)

  const slices = []
  let cum = 0
  rewardOptions.forEach((r,i) => {
    const start = cum, end = cum+angles[i]
    slices.push({
      reward: r,
      probability: weights[i]/totalWeight,
      color: colors[i],
      startAngle: start,
      endAngle: end,
      midAngle: (start+end)/2,
    })
    cum += angles[i]
  })

  // countdown
  useEffect(()=>{
    if (!cooldown) return setTimeLeft('')
    const target = new Date(cooldown)
    const iv = setInterval(()=>{
      const diff = target - new Date()
      if (diff<=0) {
        setTimeLeft('00:00:00')
        clearInterval(iv)
      } else {
        const hrs  = String(Math.floor(diff/3600000)).padStart(2,'0')
        const mins = String(Math.floor((diff%3600000)/60000)).padStart(2,'0')
        const secs = String(Math.floor((diff%60000)/1000)).padStart(2,'0')
        setTimeLeft(`${hrs}:${mins}:${secs}`)
      }
    },1000)
    return ()=>clearInterval(iv)
  },[cooldown])

  const canSpin = !cooldown || new Date(cooldown) < new Date()

  // arc path helper
  const makeArcPath = (s,e) => {
    const R=128, rad=d=>(d-90)*Math.PI/180
    const x1=128+R*Math.cos(rad(s)), y1=128+R*Math.sin(rad(s))
    const x2=128+R*Math.cos(rad(e)), y2=128+R*Math.sin(rad(e))
    const large = e-s>180?1:0
    return `M128,128 L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`
  }

  // spin handler
  const handleSpin = async () => {
    setIsSpinning(true)
    setResult(null)
    try {
      const res  = await fetch(`${API_BASE}${endpoint}`, {
        method:'POST', headers:{ Authorization:`Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      const idx    = rewardOptions.indexOf(data.reward)
      const before = angles.slice(0,idx).reduce((a,b)=>a+b,0)
      const offset = 360 - (before + angles[idx]/2)
      setRotation(360*5 + offset)

      setTimeout(()=>{
        setResult(data.reward)
        let next = data.nextSpin
        if (data.serverTime) {
          const drift = Date.now()-Date.parse(data.serverTime)
          next = new Date(Date.parse(next)+drift).toISOString()
        }
        setCooldown(next)
        toast.success(`You won ${data.reward} coins!`)
        const rare = slices.filter(s=>s.probability<=0.2)
                          .map(s=>s.reward).sort((a,b)=>a-b)[0]
        if (data.reward>=rare) confetti({ particleCount:180, spread:100, origin:{y:0.6} })
        refreshUser().catch(()=>{})
        setIsSpinning(false)
      },4500)
    } catch(err){
      toast.error(err.message||'Error spinning')
      setIsSpinning(false)
    }
  }

  // table sort
  const [sortField, setSortField] = useState('reward')
  const [sortDir,   setSortDir]   = useState('asc')
  const rows = [...slices].sort((a,b)=>{
    const v = sortField==='reward'
      ? a.reward-b.reward
      : a.probability-b.probability
    return sortDir==='asc'?v:-v
  })
  const toggleSort = f => {
    if (sortField===f) setSortDir(d=>d==='asc'?'desc':'asc')
    else { setSortField(f); setSortDir('asc') }
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-indigo-300 mb-2">{label}</h2>
      <p className="text-gray-400 mb-4">You can spin {intervalDesc}.</p>

      <div className="relative mx-auto mb-6" style={{width:256,height:256}} ref={wheelRef}>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px]
                          border-l-transparent border-r-transparent border-t-red-500" />
        </div>
        <svg viewBox="0 0 256 256"
             className="rounded-full transition-transform duration-[4s] ease-out"
             style={{transform:`rotate(${rotation}deg)`}}>
          {slices.map((s,i)=>(
            <path key={i}
                  d={makeArcPath(s.startAngle,s.endAngle)}
                  fill={s.color} stroke="#000" strokeWidth="0.5"
                  onMouseEnter={e=>{
                    const rect = wheelRef.current.getBoundingClientRect()
                    const mrad = (s.midAngle-90)*Math.PI/180
                    const px   = rect.left+rect.width/2+Math.cos(mrad)*(rect.width/2)*0.6
                    const py   = rect.top +rect.height/2+Math.sin(mrad)*(rect.height/2)*0.6
                    setHovered({idx:i,x:px,y:py})
                  }}
                  onMouseLeave={()=>setHovered(null)}
            />
          ))}
        </svg>
        {hovered && (
          <div className="absolute z-30 px-2 py-1 bg-gray-900 text-white text-xs rounded"
               style={{
                 left: hovered.x - wheelRef.current.getBoundingClientRect().left,
                 top:  hovered.y - wheelRef.current.getBoundingClientRect().top,
                 transform:'translate(-50%,-120%)',pointerEvents:'none'
               }}>
            🪙 {slices[hovered.idx].reward} ({(slices[hovered.idx].probability*100).toFixed(1)}%)
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <Button
          onClick={handleSpin}
          disabled={isSpinning||!canSpin}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-lg rounded-full"
        >
          {isSpinning ? 'Spinning…' : 'Spin Now'}
        </Button>
        {cooldown && (
          <p className="mt-2 text-sm text-blue-300">
            Next spin in: <span className="font-mono">{timeLeft}</span>
          </p>
        )}
        {result!=null && (
          <p className="mt-4 text-green-400 font-semibold animate-pulse">
            You won: 🪙 {result}
          </p>
        )}
      </div>

      <div className="overflow-auto">
        <table className="w-full text-left text-sm table-auto">
          <thead>
            <tr>
              <th className="px-2 py-1 cursor-pointer" onClick={()=>toggleSort('reward')}>
                Reward {sortField==='reward'?(sortDir==='asc'?'🔼':'🔽'):''}
              </th>
              <th className="px-2 py-1 cursor-pointer" onClick={()=>toggleSort('probability')}>
                Probability {sortField==='probability'?(sortDir==='asc'?'🔼':'🔽'):''}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s,i)=>(
              <tr key={i} className="odd:bg-gray-700">
                <td className="px-2 py-1">🪙 {s.reward}</td>
                <td className="px-2 py-1">{(s.probability*100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}