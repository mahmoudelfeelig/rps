import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../api'
import { Button } from '../components/ui/button'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const Spinner = () => {
  const { token, refreshUser } = useAuth()

  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const [highlightIdx, setHighlightIdx] = useState(null)

  // ISO timestamp for next spin (adjusted to client clock)
  const [cooldown, setCooldown] = useState(null)
  // HH:MM:SS display
  const [timeLeft, setTimeLeft] = useState('')

  const rewards = [0, 50, 100, 150, 200, 300, 500, 750, 1000]
  const segmentDeg = 360 / rewards.length

  // 1) On mount, fetch both nextSpin and serverTime
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/games/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(JSON.stringify(data))

        // Extract
        let next = data.cooldowns?.spinner
        const srvTime = data.serverTime
        // fallback to stored
        if (!next) {
          next = localStorage.getItem('spinnerCooldown')
        }
        if (next) {
          // adjust for timezone / clock drift
          if (srvTime) {
            const serverMs = Date.parse(srvTime)
            const clientMs = Date.now()
            const drift   = clientMs - serverMs
            next = new Date(Date.parse(next) + drift).toISOString()
          }
          setCooldown(next)
        }
      } catch (err) {
        console.error('Failed to load spinner cooldown', err)
      }
    }
    if (token) loadProgress()
  }, [token])

  // 2) Countdown timer
  useEffect(() => {
    if (!cooldown) {
      setTimeLeft('')
      return
    }
    const target = new Date(cooldown)
    const iv = setInterval(() => {
      const diff = target - new Date()
      if (diff <= 0) {
        setTimeLeft('00:00:00')
        clearInterval(iv)
      } else {
        const hrs  = String(Math.floor(diff/3600000)).padStart(2,'0')
        const mins = String(Math.floor((diff%3600000)/60000)).padStart(2,'0')
        const secs = String(Math.floor((diff%60000)/1000)).padStart(2,'0')
        setTimeLeft(`${hrs}:${mins}:${secs}`)
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [cooldown])

  const canSpin = !cooldown || new Date(cooldown) < new Date()

  // label positions
  const wheelRef = useRef(null)
  const [labelPos, setLabelPos] = useState([])
  useEffect(() => {
    if (!wheelRef.current) return
    const { width } = wheelRef.current.getBoundingClientRect()
    const R = width/2, center = R, r = R*0.6
    const pos = rewards.map((_,i) => {
      const mid = i*segmentDeg + segmentDeg/2 - 90
      const rad = (mid*Math.PI)/180
      return { x: center + r*Math.cos(rad), y: center + r*Math.sin(rad) }
    })
    setLabelPos(pos)
  }, [])

  const handleSpin = async () => {
    setIsSpinning(true)
    setResult(null)
    setHighlightIdx(null)
    try {
      const res = await fetch(`${API_BASE}/api/games/spinner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Spin failed')

      // animate wheel
      const idx = rewards.indexOf(data.reward)
      const baseSpins = 360 * 5
      const offset = 360 - (idx*segmentDeg + segmentDeg/2)
      setRotation(baseSpins + offset)

      setTimeout(() => {
        setResult(data.reward)
        setHighlightIdx(idx)

        // server-sent nextSpin + serverTime
        let next = data.nextSpin
        const srvTime = data.serverTime
        // adjust for drift
        if (next && srvTime) {
          const drift = Date.now() - Date.parse(srvTime)
          next = new Date(Date.parse(next) + drift).toISOString()
        }
        setCooldown(next)
        localStorage.setItem('spinnerCooldown', next)

        toast.success(`You won ${data.reward} coins!`)
        if (data.reward >= 500) {
          confetti({ particleCount:180, spread:100, origin:{y:0.6} })
        }
        refreshUser().catch(()=>{})
        setIsSpinning(false)
      }, 4500)
    } catch (err) {
      toast.error(err.message || 'Error spinning')
      setIsSpinning(false)
    }
  }

  const palette = ['#7C3AED','#EC4899','#22D3EE']
  const gradient = rewards.map((_,i)=>{
    const c = palette[i%palette.length]
    return `${c} ${i*segmentDeg}deg ${(i+1)*segmentDeg}deg`
  }).join(', ')

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-black to-gray-900 text-white text-center">
      <h1 className="text-4xl font-bold mb-6 text-purple-400">🎰 Lucky Spinner</h1>
      <p className="text-lg mb-4">Spin once a day to earn coins!</p>

      <div className="relative w-80 h-80 mx-auto mb-4">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px]
                          border-l-transparent border-r-transparent border-t-red-500" />
        </div>
        <div
          ref={wheelRef}
          className="relative w-full h-full rounded-full overflow-hidden
                     transition-transform duration-[4s] ease-out"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${rotation}deg)`
          }}
        >
          {rewards.map((reward,i)=>(
            <div key={i}
                 className="absolute"
                 style={{
                   left: `${labelPos[i]?.x}px`,
                   top : `${labelPos[i]?.y}px`,
                   transform: 'translate(-50%,-50%)'
                 }}>
              <div className={`flex flex-col items-center justify-center
                               bg-black bg-opacity-60 rounded-full p-1
                               ${i===highlightIdx?'ring-2 ring-yellow-300 scale-105':''}`}
                   style={{width:48,height:48}}>
                <span className="text-lg leading-none">🪙</span>
                <span className="text-xs font-semibold text-yellow-300">
                  {reward}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSpin}
        disabled={isSpinning||!canSpin}
        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-xl rounded-full mb-2"
      >
        {isSpinning?'Spinning…':'Spin Now'}
      </Button>

      {cooldown && (
        <p className="text-sm text-blue-300">
          Next spin in: <span className="font-mono">{timeLeft}</span>
        </p>
      )}

      {result!=null && (
        <p className="mt-4 text-xl text-green-400 font-semibold animate-pulse">
          You won: 🪙 {result}
        </p>
      )}
    </div>
  )
}

export default Spinner
