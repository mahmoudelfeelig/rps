// src/components/minigames/DodgeNDash.jsx

import React, { useRef, useEffect, useState } from "react";
import { useAuth }   from "../../../context/AuthContext";
import { API_BASE }  from "../../../api";
import axios         from "axios";
import { toast }     from "react-toastify";

function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx*dx + dy*dy <= r*r;
}

export default function DodgeNDash({ critter, onExit }) {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const { token }    = useAuth();

  const runningRef   = useRef(false);
  const quitOnce     = useRef(false);
  const scoreRef     = useRef(0);
  const startedRef   = useRef(false);
  const expertRef    = useRef(false);
  const countdownRef = useRef(null);
  const scaleRef     = useRef(1);

  const [score,     setScore]     = useState(0);
  const [started,   setStarted]   = useState(false);
  const [expert,    setExpert]    = useState(false);
  const [countdown, setCountdown] = useState(null);

  // mirror state to refs
  useEffect(() => { startedRef.current   = started;   }, [started]);
  useEffect(() => { expertRef.current    = expert;    }, [expert]);
  useEffect(() => { countdownRef.current = countdown; }, [countdown]);

  // space to start
  useEffect(() => {
    const onStart = e => {
      if (!startedRef.current && e.key === " ") {
        setStarted(true);
        setCountdown(3);
        runningRef.current = true;
      }
    };
    window.addEventListener("keydown", onStart);
    return () => window.removeEventListener("keydown", onStart);
  }, []);

  // countdown
  useEffect(() => {
    if (countdown > 0) {
      const id = setTimeout(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
      return () => clearTimeout(id);
    }
  }, [countdown]);

  // quit & post score
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
      )
      .catch(err => {
        const msg = err.response?.data?.message || "Server error saving score.";
        toast.error(msg);
      });
    }
    onExit?.();
  }

  useEffect(() => {
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");

    // resize canvas to 80% of viewport container
    function resize() {
      const rect = containerRef.current.getBoundingClientRect();
      cvs.width  = rect.width;
      cvs.height = rect.height;
      scaleRef.current = Math.min(cvs.width/320, cvs.height/480);
    }
    resize();
    window.addEventListener("resize", resize);

    const DRAW_R    = 7;
    const baseSpawn = 12;

    let playerX    = (cvs.width - 40)/2;
    let bombs      = [];
    let tick       = 0;
    let frameCount = 0;
    const keys     = {};

    const down = e => (keys[e.key.toLowerCase()] = true);
    const up   = e => (keys[e.key.toLowerCase()] = false);
    const esc  = e => { if (e.key === "Escape") { runningRef.current = false; quit(); } };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    window.addEventListener("keydown", esc);

    function spawnBomb() {
      const scale  = scaleRef.current;
      const factor = expertRef.current ? 2 : 1;
      const w      = cvs.width;
      const R      = DRAW_R * scale;
      const x      = Math.random()*(w - 2*R) + R;
      const v      = (6 + Math.random()*3)*scale*factor;
      bombs.push({ x, y: -R, v });
    }

    function loop() {
      const w     = cvs.width;
      const h     = cvs.height;
      const scale = scaleRef.current;

      // 1) not started
      if (!startedRef.current) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0,0,w,h);
        ctx.fillStyle = "#fff";
        ctx.font      = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Press Space to Start", w/2, h/2);
        requestAnimationFrame(loop);
        return;
      }

      // 2) countdown
      if (countdownRef.current > 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0,0,w,h);
        ctx.fillStyle = "#fff";
        ctx.font      = "bold 72px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(countdownRef.current, w/2, h/2+24);
        requestAnimationFrame(loop);
        return;
      }

      // 3) running
      if (!runningRef.current) {
        if (frameCount > 60) quit();
        return;
      }
      frameCount++;

      const factor = expertRef.current ? 2 : 1;
      const basePS = 8 * scale;

      // move
      if (keys["arrowleft"]||keys["a"]) playerX -= basePS*factor;
      if (keys["arrowright"]||keys["d"])playerX += basePS*factor;
      playerX = Math.max(0, Math.min(w-40*scale, playerX));

      // spawn
      const interval = Math.max(1, Math.floor(baseSpawn/factor));
      if (tick%interval===0) spawnBomb();
      tick++;

      // clear
      ctx.fillStyle = "#000";
      ctx.fillRect(0,0,w,h);

      // draw bombs
      const DRAW = DRAW_R*scale;
      const COLL = (DRAW_R-1)*scale;
      ctx.fillStyle = "#ef4444";
      bombs.forEach(b=> {
        b.y += b.v;
        ctx.beginPath();
        ctx.arc(b.x,b.y,DRAW,0,Math.PI*2);
        ctx.fill();
      });

      // draw player
      ctx.fillStyle = "#38bdf8";
      const playerY = h - 40*scale;
      ctx.fillRect(playerX, playerY, 40*scale, 22*scale);

      // collisions
      bombs = bombs.filter(b=>{
        const hit = circleRectCollision(
          b.x,b.y,COLL,
          playerX,playerY,40*scale,22*scale
        );
        if (hit) runningRef.current = false;
        return !hit && b.y - DRAW < h;
      });

      // score
      const secs     = frameCount/60;
      const newScore = Math.floor(secs*2);
      if (newScore!==scoreRef.current) {
        scoreRef.current = newScore;
        setScore(newScore);
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
      window.removeEventListener("keydown", esc);
    };
  }, [token, critter?._id, onExit]);

  const toggleExpert = () => {
    const next = !expert;
    expertRef.current = next;
    setExpert(next);
  };

  return (
    // outer overlay quits on backdrop click
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
      onClick={() => { runningRef.current = false; quit(); }}
    >
      {/* inner container stops propagation */}
      <div
        ref={containerRef}
        className="relative bg-black bg-opacity-75 p-4 rounded"
        style={{ width:"80vw",height:"80vh" }}
        onClick={e => e.stopPropagation()}
      >
        <h5 className="font-semibold text-white">💥 Dodge n Dash – {score}</h5>
        <label className="flex items-center space-x-2 text-white mb-2">
          <input
            type="checkbox"
            checked={expert}
            onChange={toggleExpert}
            className="form-checkbox"
          />
          <span>Expert Mode (2×)</span>
        </label>

        {/* canvas also stops propagation */}
        <canvas
          ref={canvasRef}
          className="border border-white/50"
          style={{width:"100%",height:"calc(100% - 3rem)",display:"block"}}
          onClick={e => e.stopPropagation()}
        />

        <button
          className="btn-red absolute top-2 right-2"
          onClick={() => { runningRef.current = false; quit(); }}
        >
          Exit ✖
        </button>
      </div>
    </div>
  );
}
