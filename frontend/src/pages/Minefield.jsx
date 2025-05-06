import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api';
import toast from 'react-hot-toast';

// Board dimensions & mine count
const ROWS  = 6;
const COLS  = 6;
const TOTAL = ROWS * COLS;

export default function Minefield() {
  const { token, refreshUser, user } = useAuth();

  // session & game state
  const [sessionId,     setSessionId]     = useState(null);
  const [revealedCells, setRevealedCells] = useState([]);
  const [mineCells,     setMineCells]     = useState([]);
  const [safeCount,     setSafeCount]     = useState(0);
  const [gameOver,      setGameOver]      = useState(false);
  const [cashedOut,     setCashedOut]     = useState(false);
  const [explodedCell,  setExplodedCell]  = useState(null);

  // betting state
  const [draftBet, setDraftBet] = useState(100);
  const [baseBet,  setBaseBet]  = useState(100);

  // payout math
  const multiplier      = Number((1 + safeCount * 0.2).toFixed(2));
  const potentialReward = Math.floor(baseBet * multiplier);

  // start a round: debit stake, refund old, get sessionId
  const startGame = async (betOverride) => {
    const bet = typeof betOverride === 'number' ? betOverride : baseBet;
    if (bet <= 0) {
      toast.error('Bet must be at least 1');
      return;
    }
    try {
      const res  = await fetch(`${API_BASE}/api/games/minefield/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betAmount: bet }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || 'Could not start');
        return;
      }

      // commit UI state
      setBaseBet(bet);
      setSessionId(json.sessionId);
      setRevealedCells([]);
      setMineCells([]);
      setSafeCount(0);
      setGameOver(false);
      setCashedOut(false);
      setExplodedCell(null);

      // update balance
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error('Network error starting game');
    }
  };

  // on mount, start with default bet
  useEffect(() => {
    if (token) startGame(baseBet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // reveal one cell
  const handleClick = async (cellId) => {
    if (!sessionId || gameOver || cashedOut) return;
    try {
      const res  = await fetch(
        `${API_BASE}/api/games/minefield/reveal`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, cellIndex: cellId }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || 'Reveal failed');
        return;
      }

      if (json.exploded) {
        // round ends
        setExplodedCell(cellId);
        setMineCells(json.mines);
        setGameOver(true);
        await refreshUser(); // reflect lost stake
      } else {
        // safe
        setSafeCount(json.safeCount);
        setRevealedCells(rc => [...rc, cellId]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error revealing cell');
    }
  };

  // cash out
  const handleCashOut = async () => {
    if (!sessionId || gameOver || cashedOut) return;
    try {
      const res  = await fetch(
        `${API_BASE}/api/games/minefield/cashout`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Cash out failed');

      setCashedOut(true);
      toast.success(`Cashed out ${json.reward} coins!`);
      await refreshUser(); // reflect reward
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Cash out failed');
    }
  };

  // disable grid until Enter clicked, or after end
  const gridDisabled = !sessionId || gameOver || cashedOut;

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 bg-gradient-to-br from-gray-900 to-black text-white">

      <h1 className="text-5xl font-extrabold mb-2">💣 Minefield</h1>

      {/* balance */}
      <div className="mb-6 text-lg">
        Balance: <span className="font-semibold">{user?.balance ?? 0}</span> coins
      </div>

      {/* bet input + Enter */}
      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="betInput" className="text-lg">Stake:</label>
        <input
          id="betInput"
          type="number"
          min="1"
          value={draftBet}
          onChange={e => setDraftBet(Number(e.target.value))}
          className="w-24 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none"
        />
        <button
          onClick={() => startGame(draftBet)}
          className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
        >
          Enter
        </button>
      </div>

      {/* status */}
      <div className="mb-4 text-lg">
        {gameOver
          ? '💥 You hit a mine—lost your stake.'
          : cashedOut
            ? `✅ Cashed out ${potentialReward} coins!`
            : sessionId
              ? `Safe: ${safeCount}  |  Next reward: ${potentialReward}`
              : 'Set your stake and click Enter to begin'
        }
      </div>

      {/* grid */}
      <div
        className={`grid gap-2 mb-6 w-full max-w-md transition-opacity
          ${gridDisabled ? 'pointer-events-none opacity-60' : ''}`}
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
      >
        {Array.from({ length: TOTAL }, (_, id) => id).map(id => {
          const revealed = revealedCells.includes(id) || mineCells.includes(id);
          const isMine   = mineCells.includes(id);
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              disabled={gridDisabled || revealed}
              className={`
                relative aspect-square rounded-lg border-2 flex items-center justify-center transition
                ${!revealed
                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                  : isMine
                    ? 'bg-red-600 border-red-800'
                    : 'bg-green-600 border-green-800'}
                disabled:cursor-not-allowed
              `}
            >
              {revealed && (isMine ? '💥' : '✔️')}
              {explodedCell === id && <span className="absolute text-2xl">💣</span>}
            </button>
          );
        })}
      </div>

      {/* actions */}
      <div className="flex space-x-4 mb-6">
        {!gameOver && !cashedOut && sessionId && (
          <button
            onClick={handleCashOut}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
          >
            Cash Out
          </button>
        )}
        {sessionId && (
          <button
            onClick={() => startGame(baseBet)}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition"
          >
            {gameOver || cashedOut ? 'Play Again' : 'Restart'}
          </button>
        )}
      </div>
    </div>
  );
}