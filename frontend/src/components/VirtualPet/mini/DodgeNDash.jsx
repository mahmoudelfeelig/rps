import React, { useRef, useEffect, useState } from "react";
import { useAuth }  from "../../../context/AuthContext";
import { API_BASE } from "../../../api";
import axios        from "axios";
import { toast }    from "react-toastify";

export default function DodgeNDash({ critter, onExit }) {
  const canvasRef = useRef(null);
  const { token } = useAuth();

  const runningRef = useRef(true);
  const quitOnce   = useRef(false);
  const scoreRef   = useRef(0);

  const [score, setScore] = useState(0);

  useEffect(() => {
    runningRef.current = true;

    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    cvs.width  = 320;
    cvs.height = 480;

    let playerX    = 140;
    let bombs      = [];
    let tick       = 0;
    let frameCount = 0;
    const keys     = {};

    const trait = t => critter?.traits?.includes(t);
    const spawn = () => {
      const x = Math.random() * 300;
      bombs.push({ x, y: -18, v: 4 + Math.random() * 2 });
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

      // player
      if (keys["arrowleft"] || keys["a"]) playerX -= 4;
      if (keys["arrowright"]|| keys["d"]) playerX += 4;
      playerX = Math.max(0, Math.min(280, playerX));

      // spawn bombs faster
      if (tick % 20 === 0) spawn();
      tick++;

      // clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 320, 480);

      // draw bombs
      ctx.fillStyle = "#ef4444";
      bombs.forEach(b => {
        b.y += b.v;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      // draw player
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(playerX, 440, 40, 22);

      // collisions
      bombs = bombs.filter(b => {
        const hit = b.y > 430 && Math.abs(b.x - (playerX + 20)) < 28;
        if (hit) runningRef.current = false;
        return !hit && b.y < 500;
      });

      // update score = 2 * seconds survived
      const seconds = frameCount / 60;
      const val     = Math.floor(seconds * 2);
      if (val !== scoreRef.current) {
        scoreRef.current = val;
        setScore(val);
      }

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
            game:        "dodge-n-dash",
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
      <h5 className="font-semibold">💥 Dodge n Dash – {score}</h5>
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
