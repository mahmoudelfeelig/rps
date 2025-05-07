import React, { useRef, useEffect, useState } from "react";
import { useAuth }  from "../../../context/AuthContext";
import { API_BASE } from "../../../api";
import axios        from "axios";
import { toast }    from "react-toastify";

export default function CoinCatcher({ critter, onExit }) {
  const canvasRef = useRef(null);
  const { token } = useAuth();

  const runningRef = useRef(true);
  const quitOnce   = useRef(false);
  const scoreRef   = useRef(0);

  const [score, setScore] = useState(0);

  useEffect(() => {
    // reset flag for React18 Strict-Mode
    runningRef.current = true;

    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    cvs.width  = 320;
    cvs.height = 480;

    let playerX    = 140;
    let coins      = [{ x: 160, y: 0, v: 4 + Math.random() * 2.5 }];  // first coin visible
    let bombs      = [];
    let tick       = 0;
    let frameCount = 0;
    const keys     = {};

    const hasTrait = tr => critter?.traits?.includes(tr);

    const drop = () => {
      const x = Math.random() * 300;
      coins.push({ x, y: -18, v: 4 + Math.random() * 2.5 });
      if (Math.random() < 0.25) {
        bombs.push({ x, y: -18, v: 4 + Math.random() * 2 });
      }
    };

    const down = e => (keys[e.key.toLowerCase()] = true);
    const up   = e => (keys[e.key.toLowerCase()] = false);
    const esc  = e => { if (e.key === "escape") runningRef.current = false; };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    window.addEventListener("keydown", esc);

    const loop = () => {
      if (!runningRef.current) {
        if (frameCount > 60) quit();
        return;
      }
      frameCount++;

      // player move
      if (keys["arrowleft"] || keys["a"]) playerX -= 4;
      if (keys["arrowright"]|| keys["d"]) playerX += 4;
      playerX = Math.max(0, Math.min(280, playerX));

      // spawn faster
      if (tick % (hasTrait("forager") ? 20 : 30) === 0) drop();
      tick++;

      // clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 320, 480);

      // draw coins
      ctx.fillStyle = "#ffd95c";
      coins.forEach(c => {
        c.y += c.v;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      // draw bombs
      ctx.fillStyle = "#ff6161";
      bombs.forEach(b => {
        b.y += b.v;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      // draw player
      ctx.fillStyle = "#9b5de5";
      ctx.fillRect(playerX, 440, 40, 22);

      // coin collisions
      coins = coins.filter(c => {
        const hit = c.y > 430 && Math.abs(c.x - (playerX + 20)) < 28;
        if (hit) {
          let gain = hasTrait("cheerful") ? 2 : 1;
          if (hasTrait("splashy") && Math.random() < 0.1) gain *= 2;
          scoreRef.current += gain;
          setScore(scoreRef.current);
        }
        return !hit && c.y < 500;
      });

      // bomb collisions
      bombs = bombs.filter(b => {
        const hit = b.y > 430 && Math.abs(b.x - (playerX + 20)) < 28;
        if (hit) runningRef.current = false;
        return !hit && b.y < 500;
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
  }, [token, critter, onExit]);

  function quit(post = true) {
    if (quitOnce.current) return;
    quitOnce.current = true;

    const final = scoreRef.current;
    toast.info(`Game ended – score ${final}`);

    if (
      post &&
      Number.isFinite(final) &&
      final > 0 &&
      critter?._id
    ) {
      axios
        .post(
          `${API_BASE}/api/sanctuary/minigame/complete`,
          {
            critterId:   critter._id,
            game:        "coin-catcher",
            actualScore: final,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(() => toast.error("Server error saving score."));
    }
    onExit?.();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h5 className="font-semibold">🪙 Coin Catcher – {score}</h5>
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
