import React, { useState, useRef, useEffect } from 'react'
import { useAuth }    from '../context/AuthContext'
import { API_BASE }   from '../api'
import { Button }     from '../components/ui/button'
import toast          from 'react-hot-toast'
import confetti       from 'canvas-confetti'

const Spinner = () => {
  const { token } = useAuth()
  const [isSpinning,   setIsSpinning]   = useState(false)
  const [rotation,     setRotation]     = useState(0)
  const [result,       setResult]       = useState(null)
  const [highlightIdx, setHighlightIdx] = useState(null)
  const [cooldown,     setCooldown]     = useState(null)

  const wheelRef = useRef(null)
  const [labelPos, setLabelPos] = useState([]) // array of { x, y } for each slice

  const rewards     = [0,50,100,150,200,300,500,750,1000]
  const segmentDeg  = 360 / rewards.length

  // once we know the wheel's size, compute one (x,y) per slice:
  useEffect(() => {
    if (!wheelRef.current) return
    const { width } = wheelRef.current.getBoundingClientRect()
    const R          = width / 2
    const center     = R
    const r          = R * 0.60               // 60% out from center
    const bubbleR    = 24                      // half your 48px bubble
    const positions  = rewards.map((_, i) => {
      // shift start so 0° is pointing straight up
      const midAngle  = i * segmentDeg + segmentDeg / 2 - 90
      const rad       = (midAngle * Math.PI) / 180
      // compute x/y on the circle
      const x = center + r * Math.cos(rad)
      const y = center + r * Math.sin(rad)
      return { x, y }
    })
    setLabelPos(positions)
  }, [segmentDeg])

  const canSpin = !cooldown || new Date(cooldown) < new Date()

  const handleSpin = async () => {
    setIsSpinning(true)
    setResult(null)
    setHighlightIdx(null)

    try {
      const res  = await fetch(`${API_BASE}/api/games/spinner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Spin failed')

      const idx       = rewards.indexOf(data.reward)
      const baseSpins = 360 * 5
      const offset    = 360 - (idx * segmentDeg + segmentDeg/2)
      setRotation(baseSpins + offset)

      setTimeout(() => {
        setResult(data.reward)
        setHighlightIdx(idx)
        setCooldown(data.nextSpin)
        toast.success(`You won ${data.reward} coins!`)
        if (data.reward >= 500) {
          confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 } })
        }
        setIsSpinning(false)
      }, 4500)

    } catch (err) {
      toast.error(err.message || 'Error spinning')
      setIsSpinning(false)
    }
  }

  // build the 3-color conic-gradient
  const palette = ['#7C3AED','#EC4899','#22D3EE']
  const gradient = rewards
    .map((_,i) => {
      const c    = palette[i % palette.length]
      const start= i   * segmentDeg
      const end  = (i+1)* segmentDeg
      return `${c} ${start}deg ${end}deg`
    })
    .join(', ')

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-black to-gray-900 text-white text-center">
      <h1 className="text-4xl font-bold mb-6 text-purple-400">🎰 Lucky Spinner</h1>
      <p className="text-lg mb-10">Spin once a day to earn coins!</p>

      <div className="relative w-80 h-80 mx-auto mb-6">
        {/* pointer */}
        <div className="absolute top-0 left-1/2 z-20 transform -translate-x-1/2 -translate-y-3">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px]
                          border-l-transparent border-r-transparent border-b-red-500" />
        </div>

        {/* wheel + labels */}
        <div
          ref={wheelRef}
          className="relative w-full h-full rounded-full overflow-hidden
                     transition-transform duration-[4s] ease-out"
          style={{
            background: `conic-gradient(${gradient})`,
            transform:  `rotate(${rotation}deg)`,
          }}
        >
          {rewards.map((reward,i) => {
            const pos    = labelPos[i] || { x: 0, y: 0 }
            const active = i === highlightIdx

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left:      `${pos.x}px`,
                  top:       `${pos.y}px`,
                  transform: 'translate(-50%,-50%)',
                }}
              >
                <div
                  className={`flex flex-col items-center justify-center
                              bg-black bg-opacity-60 rounded-full p-1
                              ${active ? 'ring-2 ring-yellow-300 scale-105' : ''}`}
                  style={{ width: 48, height: 48 }}
                >
                  <span className="text-lg leading-none">🪙</span>
                  <span className="text-xs font-semibold text-yellow-300">
                    {reward}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Button
        onClick={handleSpin}
        disabled={isSpinning || !canSpin}
        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-xl rounded-full"
      >
        {isSpinning ? 'Spinning…' : 'Spin Now'}
      </Button>

      {result != null && (
        <p className="mt-4 text-xl text-green-400 font-semibold animate-pulse">
          You won: 🪙 {result}
        </p>
      )}
      {!canSpin && (
        <p className="mt-2 text-sm text-red-400">
          Next spin: {new Date(cooldown).toLocaleString()}
        </p>
      )}
    </div>
  )
}

export default Spinner
