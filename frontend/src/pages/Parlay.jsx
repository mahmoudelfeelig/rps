import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { calculateParlayOdds } from '../utils/parlayUtils';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { API_BASE } from '../api';

const Draggable = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: 50,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
};

const Droppable = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-6 min-h-[250px] bg-white/5 backdrop-blur border border-white/10 rounded-2xl transition duration-300 ${
        isOver ? 'ring-2 ring-pink-400/50' : 'ring-1 ring-white/5'
      }`}
    >
      {children}
    </div>
  );
};

const Parlay = () => {
  const [bets, setBets] = useState([]);
  const [selections, setSelections] = useState({});
  const [amount, setAmount] = useState('');
  const { token } = useAuth();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBets = async () => {
      const res = await axios.get(`${API_BASE}/api/bets/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBets(res.data);
    };
    fetchBets();
  }, []);

  const handleDragEnd = (event) => {
    const id = event.active.id;
    const [betId, choice] = id.split('|');
    const bet = bets.find((b) => b._id === betId);
    const option = bet?.options.find((o) => o.text === choice);

    if (bet && option) {
      setSelections((prev) => ({
        ...prev,
        [betId]: { betId, choice, odds: option.odds },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!amount || Object.keys(selections).length < 2) return alert("Select at least two bets and enter an amount");

    try {
      await axios.post(
        `${API_BASE}/api/bets/parlay`,
        {
          amount,
          bets: Object.values(selections),
          totalOdds: calculateParlayOdds(selections),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Parlay placed!");
      navigate("/bets");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'An unexpected error occurred.');
      setIsErrorModalOpen(true);
    }
  };

  return (
    <section className="p-6 pt-28 text-white min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f]">
      <h2 className="text-4xl font-bold text-pink-400 mb-8 text-center">🧙 Build Your Parlay</h2>

      
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Available Bets */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-pink-300">🎲 Drag Bets</h3>
            <div className="space-y-6">
              {bets.map((bet) => (
                <div
                  key={bet._id}
                  className="bg-gradient-to-br from-white/5 to-black/10 border border-white/10 p-4 rounded-xl shadow-md backdrop-blur"
                >
                  <h4 className="text-pink-300 font-bold text-lg">{bet.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">Ends: {new Date(bet.endTime).toLocaleString('en-GB')}</p>
                  <div className="space-y-2">
                    {bet.options.map((opt) => (
                      <Draggable key={`${bet._id}|${opt.text}`} id={`${bet._id}|${opt.text}`}>
                        <button className="block w-full px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border border-pink-400/20 rounded-md transition">
                          {opt.text} <span className="float-right font-bold">{opt.odds}x</span>
                        </button>
                      </Draggable>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-pink-300">📦 Your Parlay</h3>
            <Droppable id="drop-zone">
              {Object.values(selections).length === 0 ? (
                <p className="text-gray-400 text-center">Drag bets here to add to your parlay.</p>
              ) : (
                <ul className="space-y-3">
                  {Object.values(selections).map((sel) => (
                    <li
                      key={sel.betId}
                      className="p-3 bg-pink-500/10 border border-pink-400/20 rounded-md text-pink-200 flex justify-between"
                    >
                      <span>{sel.choice}</span>
                      <span className="font-semibold">{sel.odds}x</span>
                    </li>
                  ))}
                </ul>
              )}
            </Droppable>
          </div>
        </div>
      </DndContext>

      {/* Wager + Submit */}
      <div className="mt-10 max-w-md mx-auto text-center">
        {/* Live Payout Preview */}
{amount && calculateParlayOdds(selections) > 1 && (
  <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
    <p className="text-sm text-gray-300">💸 Potential Payout:</p>
    <p className="text-2xl font-bold text-pink-300">
      {isNaN(amount) ? 0 : (parseFloat(amount) * calculateParlayOdds(selections)).toFixed(2)} 💰
    </p>
    <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden mt-3">
      <div
        className="h-full bg-pink-500/60 transition-all"
        style={{
          width: `${Math.min(100, calculateParlayOdds(selections) * 10)}%`, // scale visually
        }}
      ></div>
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Odds: {calculateParlayOdds(selections)}x • Wager: {amount}
    </p>
  </div>
)}
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter wager amount"
          className="w-full px-4 py-2 bg-black/30 border border-pink-400 rounded-lg text-white placeholder-gray-400 mb-4 focus:outline-none"
        />
        <p className="text-pink-300 font-semibold mb-4">
          Total Odds: {calculateParlayOdds(selections)}x
        </p>
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 transition text-white font-bold shadow-md"
        >
          🧪 Place Parlay
        </button>
      </div>
    </section>
  );
};

export default Parlay;
