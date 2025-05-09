import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api';
import toast from 'react-hot-toast';

export default function Minefield() {
  const { token, refreshUser, user } = useAuth();

  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [mines, setMines] = useState(10);
  const totalCells = rows * cols;

  const [sessionId, setSessionId] = useState(null);
  const [revealedCells, setRevealedCells] = useState([]);
  const [mineCells, setMineCells] = useState([]);
  const [safeCount, setSafeCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [explodedCell, setExplodedCell] = useState(null);

  const [draftBet, setDraftBet] = useState(100);
  const [baseBet, setBaseBet] = useState(null);
  const [extraSafeClicks, setExtraSafeClicks]   = useState(0);
  const [mineReduction, setMineReduction]       = useState(0);
  
  const slidersDisabled = !!sessionId && !gameOver && !cashedOut;
  const gridDisabled = !!sessionId && (gameOver || cashedOut);

  function rewardMultiplier(safeCount, mines, totalCells) {
    let mult = 1;
    let remainingCells = totalCells;
    const remainingMines = mines;
    const dampening = 0.6;

    for (let i = 0; i < safeCount; i++) {
      const safeCells = remainingCells - remainingMines;
      if (safeCells <= 0) break;
      const trueOdds = remainingCells / safeCells;
      const effOdds = 1 + dampening * (trueOdds - 1);
      mult *= effOdds;
      remainingCells -= 1;
    }

    return mult;
  }

  const potentialReward = baseBet
    ? Math.floor(baseBet * rewardMultiplier(safeCount, mines, totalCells))
    : 0;

  const startGame = async (betOverride) => {
    const bet = typeof betOverride === 'number' ? betOverride : draftBet;
    if (bet <= 0) return toast.error('Bet must be at least 1');

    try {
      const res = await fetch(`${API_BASE}/api/games/minefield/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betAmount: bet, rows, cols, mines }),
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.message || 'Could not start');

      setBaseBet(bet);
      setExtraSafeClicks(json.extraSafeClicks || 0);
      setMineReduction(json.mineReduction || 0);
      setSessionId(json.sessionId);
      setRevealedCells([]);
      setMineCells([]);
      setSafeCount(0);
      setGameOver(false);
      setCashedOut(false);
      setExplodedCell(null);
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error('Network error starting game');
    }
  };

  const handleClick = async (id) => {
    if (!sessionId || gameOver || cashedOut) return;
    try {
      const res = await fetch(`${API_BASE}/api/games/minefield/reveal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, cellIndex: id }),
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.message || 'Reveal failed');

      if (json.exploded) {
        setExplodedCell(id);
        setMineCells(json.mines);
        setGameOver(true);
        await refreshUser();
      } else {
        setSafeCount(json.safeCount);
        setRevealedCells((rc) => [...rc, id]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error revealing cell');
    }
  };

  const handleCashOut = async () => {
    if (!sessionId || gameOver || cashedOut) return;
    try {
      const res = await fetch(`${API_BASE}/api/games/minefield/cashout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Cash out failed');

      setCashedOut(true);
      toast.success(`Cashed out ${json.reward} coins!`);
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Cash out failed');
    }
  };

  const clampMines = (nextRows, nextCols) => {
    const max = nextRows * nextCols - 1;
    setMines((m) => Math.max(2, Math.min(m, max)));
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 bg-gradient-to-br from-slate-900 to-black text-white">
      <h1 className="text-5xl font-extrabold mb-2">💣 Minefield</h1>

      <div className="mb-6 text-lg">
        Balance: <span className="font-semibold">{user?.balance ?? 0}</span> coins
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Rows: {rows}</label>
          <input
            type="range"
            min={3}
            max={12}
            value={rows}
            disabled={slidersDisabled}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRows(val);
              clampMines(val, cols);
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
            onChange={(e) => {
              const val = Number(e.target.value);
              setCols(val);
              clampMines(rows, val);
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
            onChange={(e) => setMines(Number(e.target.value))}
            className="accent-rose-500"
          />
        </div>
      </div>

        {/* Buff info */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          {extraSafeClicks > 0 && (
            <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded">
              Extra Safe Clicks: {extraSafeClicks}
            </span>
          )}
          {mineReduction > 0 && (
            <span className="bg-rose-600/20 text-rose-300 px-3 py-1 rounded">
              Mines reduced by: {mineReduction}
            </span>
          )}
        </div>

      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="betInput" className="text-lg">Stake:</label>
        <input
          id="betInput"
          type="number"
          min="1"
          value={draftBet}
          onChange={(e) => setDraftBet(Number(e.target.value))}
          className="w-24 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none"
        />
        <button
          onClick={() => setDraftBet(user?.balance ?? 0)}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-800 rounded text-white"
        >
          Max
        </button>
        <button
          onClick={() => startGame(draftBet)}
          className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          Enter
        </button>
      </div>

      <div className="mb-4 text-lg">
        {!sessionId
          ? 'Set stake & click Enter to begin'
          : gameOver
          ? '💥 You hit a mine—lost your stake.'
          : cashedOut
          ? `✅ Cashed out ${potentialReward} coins!`
          : `Safe: ${safeCount} | Next reward: ${potentialReward}`}
      </div>

      <div
        className={`grid gap-2 mb-6 w-full max-w-lg transition-opacity ${
          gridDisabled ? 'pointer-events-none opacity-60' : ''
        }`}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: totalCells }, (_, id) => {
          const revealed = revealedCells.includes(id) || mineCells.includes(id);
          const isMine = mineCells.includes(id);
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              disabled={gridDisabled || revealed}
              className={`
                relative aspect-square rounded-lg border-2 flex items-center justify-center transition text-white
                ${
                  !revealed
                    ? 'bg-neutral-800 border-neutral-600 hover:bg-neutral-700'
                    : isMine
                    ? 'bg-rose-500 border-rose-700'
                    : 'bg-emerald-500 border-emerald-700'
                }
                disabled:cursor-not-allowed
              `}
            >
              {revealed && (isMine ? '💥' : '✔️')}
              {explodedCell === id && <span className="absolute text-2xl">💣</span>}
            </button>
          );
        })}
      </div>

      <div className="flex space-x-4 mb-6">
        {sessionId && !gameOver && !cashedOut && (
          <button
            onClick={handleCashOut}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
          >
            Cash Out
          </button>
        )}
        {sessionId && (
          <button
            onClick={() => startGame(draftBet)}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium"
          >
            {gameOver || cashedOut ? 'Play Again' : 'Restart'}
          </button>
        )}
      </div>
    </div>
  );
}
