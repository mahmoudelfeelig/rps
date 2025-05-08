import React, { useEffect, useState } from "react";
import { useAuth }   from "../../../context/AuthContext";
import { API_BASE }  from "../../../api";
import axios         from "axios";
import { toast }     from "react-toastify";

const EMOJIS = ["🦊","🐱","🐻","🐸"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CritterMatch({ critter, onExit }) {
  const { token } = useAuth();
  const [cards,   setCards]   = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    const deck = shuffle([...EMOJIS, ...EMOJIS]).map((icon, idx) => ({
      id: idx,
      icon
    }));
    setCards(deck);
  }, []);

  const handleFlip = id => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setTimeout(() => {
        const [c1, c2] = next.map(i => cards.find(c => c.id === i));
        if (c1.icon === c2.icon) setMatched(m => [...m, ...next]);
        setFlipped([]);
      }, 700);
    }
  };

  useEffect(() => {
    if (cards.length && matched.length === cards.length) {
      toast.success("All matched! 🎉");
      postScore();
    }
  }, [matched, cards]);

  const postScore = () => {
    if (!critter?._id) return;
    axios
      .post(
        `${API_BASE}/api/sanctuary/minigame/complete`,
        {
          critterId:   critter._id,
          game:        "critter-match",
          actualScore: 100   // must match backend's `actualScore` field
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .catch(err => {
        // show the server's error message if it sent one
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Server error saving score.";
        toast.error(msg);
        console.error("CritterMatch error:", err);
      })
      .finally(() => onExit?.());
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h5 className="font-semibold">🂠 Critter Match</h5>

      <div className="grid grid-cols-4 gap-3">
        {cards.map(c => (
          <button
            key={c.id}
            onClick={() => handleFlip(c.id)}
            className="w-16 h-20 bg-white/10 rounded-lg flex items-center justify-center
                       text-2xl text-white hover:bg-white/20 transition"
          >
            {flipped.includes(c.id) || matched.includes(c.id)
              ? c.icon
              : "❔"}
          </button>
        ))}
      </div>

      <button
        className="btn-red"
        onClick={() => {
          // if they bail out early, still call onExit
          onExit?.();
        }}
      >
        Leave Game ✖
      </button>
    </div>
  );
}
