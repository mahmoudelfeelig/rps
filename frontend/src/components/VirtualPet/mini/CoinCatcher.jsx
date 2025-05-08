import React, { useRef, useEffect, useState } from "react";
import { useAuth }  from "../../../context/AuthContext";
import { API_BASE } from "../../../api";
import axios        from "axios";
import { toast }    from "react-toastify";

// circle-vs-rect hit test (use whatever r you pass in)
function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

export default function CoinCatcher({ critter, onExit }) {
  const canvasRef = useRef(null);
  const { token } = useAuth();

  // refs for the game loop
  const runningRef = useRef(true);
  const quitOnce   = useRef(false);
  const scoreRef   = useRef(0);
  const expertRef  = useRef(false);

  const [score,  setScore]  = useState(0);
  const [expert, setExpert] = useState(false);

  // mirror expert mode into a ref so the loop sees updates without restarting
  useEffect(() => {
    expertRef.current = expert;
  }, [expert]);

  useEffect(() => {
    runningRef.current = true;
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    cvs.width  = 320;
    cvs.height = 480;

    // constants
    const DRAW_R = 7;              // actual draw radius
    const COLLIDE_R = DRAW_R - 1;  // slightly smaller effective radius

    // safe trait lookup
    const traits   = Array.isArray(critter?.traits) ? critter.traits : [];
    const hasTrait = t => traits.includes(t);

    let playerX    = 140;
    let coins      = [{ x: 160, y: 0, v: 6 + Math.random() * 3 }];
    let bombs      = [];
    let tick       = 0;
    let frameCount = 0;
    const keys     = {};

    // base drop interval (frames)
    const baseInterval = hasTrait("forager") ? 10 : 15;

    function drop() {
      const factor = expertRef.current ? 2 : 1;
      const x = Math.random() * (cvs.width - 2 * DRAW_R) + DRAW_R;
      coins.push({
        x,
        y: -DRAW_R,
        v: (6 + Math.random() * 3) * factor
      });
      if (Math.random() < 0.4) {
        bombs.push({
          x,
          y: -DRAW_R,
          v: (6 + Math.random() * 3) * factor
        });
      }
    }

    // input handlers
    const down = e => (keys[e.key.toLowerCase()] = true);
    const up   = e => (keys[e.key.toLowerCase()] = false);
    const esc  = e => { if (e.key === "Escape") runningRef.current = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    window.addEventListener("keydown", esc);

    // main loop
    const loop = () => {
      if (!runningRef.current) {
        if (frameCount > 60) quit();
        return;
      }
      frameCount++;

      const factor = expertRef.current ? 2 : 1;

      // PLAYER MOVE
      const basePS = 8;
      if (keys["arrowleft"] || keys["a"])  playerX -= basePS * factor;
      if (keys["arrowright"]|| keys["d"])  playerX += basePS * factor;
      playerX = Math.max(0, Math.min(cvs.width - 40, playerX));

      // SPAWN
      const interval = Math.max(1, Math.floor(baseInterval / factor));
      if (tick % interval === 0) drop();
      tick++;

      // CLEAR
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      // DRAW
      // coins
      ctx.fillStyle = "#ffd95c";
      coins.forEach(c => {
        c.y += c.v;
        ctx.beginPath();
        ctx.arc(c.x, c.y, DRAW_R, 0, Math.PI * 2);
        ctx.fill();
      });
      // bombs
      ctx.fillStyle = "#ff6161";
      bombs.forEach(b => {
        b.y += b.v;
        ctx.beginPath();
        ctx.arc(b.x, b.y, DRAW_R, 0, Math.PI * 2);
        ctx.fill();
      });

      // player
      ctx.fillStyle = "#9b5de5";
      const playerY = 440, playerW = 40, playerH = 22;
      ctx.fillRect(playerX, playerY, playerW, playerH);

      // COIN COLLISIONS
      coins = coins.filter(c => {
        const hit = circleRectCollision(
          c.x, c.y, COLLIDE_R,
          playerX, playerY, playerW, playerH
        );
        if (hit) {
          let gain = hasTrait("cheerful") ? 2 : 1;
          if (hasTrait("splashy") && Math.random() < 0.1) gain *= 2;
          scoreRef.current += gain;
          setScore(scoreRef.current);
        }
        return !hit && c.y - DRAW_R < cvs.height;
      });

      // BOMB COLLISIONS
      bombs = bombs.filter(b => {
        const hit = circleRectCollision(
          b.x, b.y, COLLIDE_R,
          playerX, playerY, playerW, playerH
        );
        if (hit) runningRef.current = false;
        return !hit && b.y - DRAW_R < cvs.height;
      });

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
      window.removeEventListener("keydown", esc);
    };
  }, [token, critter?._id, onExit]);

  function quit(post = true) {
    if (quitOnce.current) return;
    quitOnce.current = true;
    const final = scoreRef.current;
    toast.info(`Game ended – score ${final}`);
    if (post && final > 0 && critter?._id) {
      axios.post(
        `${API_BASE}/api/sanctuary/minigame/complete`,
        { critterId: critter._id, game: "coin-catcher", actualScore: final },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => toast.error("Server error saving score."));
    }
    onExit?.();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h5 className="font-semibold">🪙 Coin Catcher – {score}</h5>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={expert}
          onChange={() => setExpert(e => !e)}
          className="form-checkbox"
        />
        <span>Expert Mode (2× speed)</span>
      </label>
      <canvas ref={canvasRef} className="border border-white/20" />
      <button
        className="btn-red"
        onClick={() => {
          runningRef.current = false;
          setTimeout(() => quit(), 0);
        }}
      >
        Leave Game ✖
      </button>
    </div>
  );
}
