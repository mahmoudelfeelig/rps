import React, { useRef, useEffect, useState } from "react";
import { useAuth }  from "../../../context/AuthContext";
import { API_BASE } from "../../../api";
import axios        from "axios";
import { toast }    from "react-toastify";

// proper circle-vs-rect hit test
function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

export default function DodgeNDash({ critter, onExit }) {
  const canvasRef = useRef(null);
  const { token } = useAuth();

  const runningRef = useRef(true);
  const quitOnce   = useRef(false);
  const scoreRef   = useRef(0);
  const expertRef  = useRef(false);

  const [score,  setScore]  = useState(0);
  const [expert, setExpert] = useState(false);

  // keep expert flag in a ref so the loop sees updates without restarting
  useEffect(() => {
    expertRef.current = expert;
  }, [expert]);

  useEffect(() => {
    runningRef.current = true;
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    cvs.width  = 320;
    cvs.height = 480;

    // drawing vs collision radius
    const DRAW_R    = 7;
    const COLLIDE_R = DRAW_R - 1;

    let playerX    = 140;
    let bombs      = [];
    let tick       = 0;
    let frameCount = 0;
    const keys     = {};

    const down = e => (keys[e.key.toLowerCase()] = true);
    const up   = e => (keys[e.key.toLowerCase()] = false);
    const esc  = e => { if (e.key === "Escape") runningRef.current = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    window.addEventListener("keydown", esc);

    const baseSpawn = 12;

    function spawnBomb() {
      const factor = expertRef.current ? 2 : 1;
      const x = Math.random() * (cvs.width - 2 * DRAW_R) + DRAW_R;
      bombs.push({
        x,
        y: -DRAW_R,
        v: (6 + Math.random() * 3) * factor
      });
    }

    const loop = () => {
      if (!runningRef.current) {
        if (frameCount > 60) quit();
        return;
      }
      frameCount++;

      const factor = expertRef.current ? 2 : 1;

      // — PLAYER MOVEMENT —
      const basePS = 8;
      if (keys["arrowleft"] || keys["a"])  playerX -= basePS * factor;
      if (keys["arrowright"]|| keys["d"])  playerX += basePS * factor;
      playerX = Math.max(0, Math.min(cvs.width - 40, playerX));

      // — SPAWN BOMBS —
      const interval = Math.max(1, Math.floor(baseSpawn / factor));
      if (tick % interval === 0) spawnBomb();
      tick++;

      // — CLEAR SCREEN —
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      // — DRAW BOMBS —
      ctx.fillStyle = "#ef4444";
      bombs.forEach(b => {
        b.y += b.v;
        ctx.beginPath();
        ctx.arc(b.x, b.y, DRAW_R, 0, Math.PI * 2);
        ctx.fill();
      });

      // — DRAW PLAYER —
      ctx.fillStyle = "#38bdf8";
      const playerY = 440, playerW = 40, playerH = 22;
      ctx.fillRect(playerX, playerY, playerW, playerH);

      // — BOMB COLLISIONS —
      bombs = bombs.filter(b => {
        const hit = circleRectCollision(
          b.x, b.y, COLLIDE_R,
          playerX, playerY, playerW, playerH
        );
        if (hit) runningRef.current = false;
        return !hit && b.y - DRAW_R < cvs.height;
      });

      // — SCORE (2 × seconds survived) —
      const secs = frameCount / 60;
      const newScore = Math.floor(secs * 2);
      if (newScore !== scoreRef.current) {
        scoreRef.current = newScore;
        setScore(newScore);
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
  }, [token, critter?._id, onExit]);

  function quit(post = true) {
    if (quitOnce.current) return;
    quitOnce.current = true;
    const final = scoreRef.current;
    toast.info(`Game ended – score ${final}`);
    if (post && final > 0 && critter?._id) {
      axios.post(
        `${API_BASE}/api/sanctuary/minigame/complete`,
        { critterId: critter._id, game: "dodge-n-dash", actualScore: final },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => toast.error("Server error saving score."));
    }
    onExit?.();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h5 className="font-semibold">💥 Dodge n Dash – {score}</h5>
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
