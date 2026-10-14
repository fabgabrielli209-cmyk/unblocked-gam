import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';

export type LocalGameId = 'snake' | 'breakout' | 'space' | '2048' | 'flappy' | 'dino' | 'pong';

interface LocalArcadeGamesProps {
  gameId: LocalGameId;
  onExit?: () => void;
  scanlinesEnabled?: boolean;
}

export const LOCAL_GAMES_METADATA: Record<LocalGameId, { name: string; desc: string; category: string; instructions: string }> = {
  'snake': { name: 'Cyber Snake', desc: 'Classic neon arcade snake with glowing food particles and high score tracking.', category: 'Arcade', instructions: 'Arrow Keys or WASD to change direction' },
  'breakout': { name: 'Neon Breakout', desc: 'Bounce the ball to smash colorful glowing neon bricks.', category: 'Action', instructions: 'Mouse or A/D / Arrows to move paddle' },
  'space': { name: 'Space Defender 1984', desc: 'Retro vector space shooter against invading alien fleets.', category: 'Shooter', instructions: 'Arrows / A/D to steer, Spacebar to fire lasers' },
  '2048': { name: '2048 Arcade', desc: 'Join the numbers and get to the 2048 tile in a sleek neon theme.', category: 'Puzzle', instructions: 'Arrow Keys or WASD to slide tiles' },
  'flappy': { name: 'Flappy Wings', desc: 'Tap space or click to flap through neon pipes and beat your high score.', category: 'Platformer', instructions: 'Spacebar or Click / Tap to flap' },
  'dino': { name: 'Neon T-Rex Runner', desc: 'Classic endless dinosaur runner dodging cacti and pterodactyls.', category: 'Running', instructions: 'Spacebar or Up Arrow to jump, Down to duck' },
  'pong': { name: 'Retro Pong AI', desc: 'Classic paddle duel against a responsive computer opponent.', category: 'Sports', instructions: 'Mouse or Up/Down / W/S to move paddle' },
};

export const LocalArcadeGames: React.FC<LocalArcadeGamesProps> = ({
  gameId,
  onExit,
  scanlinesEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Load high score for the game
  useEffect(() => {
    const saved = localStorage.getItem(`gam3_local_high_${gameId}`);
    setHighScore(saved ? parseInt(saved, 10) : 0);
  }, [gameId]);

  const updateHighScore = (val: number) => {
    setHighScore(prev => {
      if (val > prev) {
        localStorage.setItem(`gam3_local_high_${gameId}`, val.toString());
        return val;
      }
      return prev;
    });
  };

  // --- 2048 GAME ENGINE ---
  useEffect(() => {
    if (gameId !== '2048') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let board: number[][] = Array(4).fill(0).map(() => Array(4).fill(0));
    let curScore = 0;
    setScore(0);
    setGameOver(false);

    const spawnTile = () => {
      const empty: [number, number][] = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === 0) empty.push([r, c]);
        }
      }
      if (empty.length > 0) {
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
      }
    };

    spawnTile();
    spawnTile();

    const slideRow = (row: number[]) => {
      const filtered = row.filter(v => v !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          curScore += filtered[i];
          filtered[i + 1] = 0;
        }
      }
      const merged = filtered.filter(v => v !== 0);
      while (merged.length < 4) merged.push(0);
      return merged;
    };

    const move = (dir: 'left' | 'right' | 'up' | 'down') => {
      let moved = false;
      const oldBoard = JSON.stringify(board);

      if (dir === 'left') {
        board = board.map(r => slideRow(r));
      } else if (dir === 'right') {
        board = board.map(r => slideRow([...r].reverse()).reverse());
      } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
          const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
          const sl = slideRow(col);
          for (let r = 0; r < 4; r++) board[r][c] = sl[r];
        }
      } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
          const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
          const sl = slideRow(col);
          for (let r = 0; r < 4; r++) board[3 - r][c] = sl[r];
        }
      }

      if (JSON.stringify(board) !== oldBoard) {
        moved = true;
        spawnTile();
        setScore(curScore);
        updateHighScore(curScore);
        render();
      }
    };

    const render = () => {
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const size = 95;
      const gap = 14;
      const startX = (canvas.width - (size * 4 + gap * 3)) / 2;
      const startY = (canvas.height - (size * 4 + gap * 3)) / 2;

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = board[r][c];
          const x = startX + c * (size + gap);
          const y = startY + r * (size + gap);

          ctx.fillStyle = val === 0 ? '#162032' : getColorFor2048(val);
          ctx.beginPath();
          ctx.roundRect(x, y, size, size, 12);
          ctx.fill();

          if (val > 0) {
            ctx.fillStyle = val <= 4 ? '#f8fafc' : '#ffffff';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(val.toString(), x + size / 2, y + size / 2);
          }
        }
      }
    };

    const getColorFor2048 = (val: number): string => {
      const colors: Record<number, string> = {
        2: '#38bdf8',
        4: '#0284c7',
        8: '#f97316',
        16: '#ea580c',
        32: '#f43f5e',
        64: '#e11d48',
        128: '#eab308',
        256: '#ca8a04',
        512: '#10b981',
        1024: '#8b5cf6',
        2048: '#ec4899',
      };
      return colors[val] || '#6366f1';
    };

    const onKey = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) { e.preventDefault(); move('left'); }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) { e.preventDefault(); move('right'); }
      if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); move('up'); }
      if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); move('down'); }
    };

    window.addEventListener('keydown', onKey);
    render();

    return () => window.removeEventListener('keydown', onKey);
  }, [gameId]);

  // --- FLAPPY BIRD ENGINE ---
  useEffect(() => {
    if (gameId !== 'flappy') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let birdY = canvas.height / 2;
    let birdV = 0;
    const gravity = 0.45;
    const jump = -8.5;
    let pipes: { x: number; top: number; bottom: number }[] = [];
    let curScore = 0;
    let isDead = false;

    setScore(0);
    setGameOver(false);

    const onAction = () => {
      if (isDead) {
        birdY = canvas.height / 2;
        birdV = 0;
        pipes = [];
        curScore = 0;
        isDead = false;
        setGameOver(false);
        setScore(0);
      } else {
        birdV = jump;
      }
    };

    const keyListener = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        onAction();
      }
    };
    canvas.addEventListener('mousedown', onAction);
    window.addEventListener('keydown', keyListener);

    let frame = 0;
    const loop = () => {
      frame++;
      if (!isDead) {
        birdV += gravity;
        birdY += birdV;

        if (birdY > canvas.height - 20 || birdY < 10) {
          isDead = true;
          setGameOver(true);
        }

        if (frame % 90 === 0) {
          const gap = 140;
          const top = 50 + Math.random() * (canvas.height - gap - 100);
          pipes.push({ x: canvas.width, top, bottom: top + gap });
        }

        pipes = pipes.filter(p => {
          p.x -= 3.2;

          // Bird collision
          const birdX = 90;
          if (birdX + 12 > p.x && birdX - 12 < p.x + 50) {
            if (birdY - 12 < p.top || birdY + 12 > p.bottom) {
              isDead = true;
              setGameOver(true);
            }
          }

          // Score point
          if (p.x + 3.2 >= birdX && p.x < birdX) {
            curScore += 1;
            setScore(curScore);
            updateHighScore(curScore);
          }

          return p.x > -60;
        });
      }

      // Draw
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw pipes
      ctx.fillStyle = '#10b981';
      pipes.forEach(p => {
        // Top pipe
        ctx.fillRect(p.x, 0, 50, p.top);
        // Bottom pipe
        ctx.fillRect(p.x, p.bottom, 50, canvas.height - p.bottom);
      });

      // Draw Bird
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#eab308';
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(90, birdY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(84, birdY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000';
      ctx.fillRect(96, birdY - 4, 3, 3);
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onAction);
      window.removeEventListener('keydown', keyListener);
    };
  }, [gameId]);

  // --- DINO RUNNER ENGINE ---
  useEffect(() => {
    if (gameId !== 'dino') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dinoY = canvas.height - 60;
    let dinoV = 0;
    const gravity = 0.6;
    let obstacles: { x: number; w: number; h: number }[] = [];
    let curScore = 0;
    let isDead = false;

    setScore(0);
    setGameOver(false);

    const jump = () => {
      if (isDead) {
        dinoY = canvas.height - 60;
        dinoV = 0;
        obstacles = [];
        curScore = 0;
        isDead = false;
        setGameOver(false);
        setScore(0);
      } else if (dinoY >= canvas.height - 61) {
        dinoV = -13;
      }
    };

    const keyListener = (e: KeyboardEvent) => {
      if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) {
        e.preventDefault();
        jump();
      }
    };
    canvas.addEventListener('mousedown', jump);
    window.addEventListener('keydown', keyListener);

    let frame = 0;
    const loop = () => {
      frame++;
      if (!isDead) {
        dinoV += gravity;
        dinoY += dinoV;
        if (dinoY > canvas.height - 60) {
          dinoY = canvas.height - 60;
          dinoV = 0;
        }

        if (frame % 70 === 0 && Math.random() < 0.75) {
          obstacles.push({
            x: canvas.width,
            w: 16 + Math.random() * 16,
            h: 30 + Math.random() * 25,
          });
        }

        obstacles = obstacles.filter(obs => {
          obs.x -= 6.5;

          // Hitbox
          const dinoX = 70;
          if (dinoX + 24 > obs.x && dinoX < obs.x + obs.w) {
            if (dinoY + 36 > canvas.height - obs.h - 20) {
              isDead = true;
              setGameOver(true);
            }
          }
          return obs.x > -40;
        });

        curScore += 1;
        setScore(Math.floor(curScore / 4));
        updateHighScore(Math.floor(curScore / 4));
      }

      // Draw
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground Line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 20);
      ctx.lineTo(canvas.width, canvas.height - 20);
      ctx.stroke();

      // Draw Dino
      ctx.fillStyle = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.fillRect(70, dinoY, 26, 36);
      ctx.fillRect(80, dinoY - 10, 16, 12); // head
      ctx.shadowBlur = 0;

      // Draw Obstacles (Cacti)
      ctx.fillStyle = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f43f5e';
      obstacles.forEach(obs => {
        ctx.fillRect(obs.x, canvas.height - 20 - obs.h, obs.w, obs.h);
      });
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', jump);
      window.removeEventListener('keydown', keyListener);
    };
  }, [gameId]);

  // --- RETRO PONG ENGINE ---
  useEffect(() => {
    if (gameId !== 'pong') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let p1Y = canvas.height / 2 - 40;
    let p2Y = canvas.height / 2 - 40;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballVX = 5;
    let ballVY = 3;
    let curScore = 0;
    let isDead = false;

    setScore(0);
    setGameOver(false);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      p1Y = e.clientY - rect.top - 40;
    };
    canvas.addEventListener('mousemove', onMove);

    const loop = () => {
      if (!isDead) {
        ballX += ballVX;
        ballY += ballVY;

        // Bounce top/bottom
        if (ballY < 8 || ballY > canvas.height - 8) ballVY = -ballVY;

        // AI opponent tracking
        if (ballX > canvas.width / 2) {
          const center = p2Y + 40;
          if (center < ballY - 12) p2Y += 4.2;
          else if (center > ballY + 12) p2Y -= 4.2;
        }

        // P1 Paddle Collision
        if (ballX <= 35 && ballX >= 20 && ballY >= p1Y && ballY <= p1Y + 80) {
          ballVX = Math.abs(ballVX) * 1.05;
          ballVY = (ballY - (p1Y + 40)) * 0.15;
          curScore += 10;
          setScore(curScore);
          updateHighScore(curScore);
        }

        // P2 Paddle Collision
        if (ballX >= canvas.width - 35 && ballX <= canvas.width - 20 && ballY >= p2Y && ballY <= p2Y + 80) {
          ballVX = -Math.abs(ballVX);
        }

        // Missed by P1
        if (ballX < 0) {
          isDead = true;
          setGameOver(true);
        }

        // Missed by AI
        if (ballX > canvas.width) {
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          ballVX = -5;
          curScore += 50;
          setScore(curScore);
          updateHighScore(curScore);
        }
      }

      // Draw
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Line
      ctx.strokeStyle = '#1e293b';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // P1 Paddle (Blue)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(20, p1Y, 12, 80);

      // P2 Paddle (Red)
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(canvas.width - 32, p2Y, 12, 80);

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, [gameId]);

  const meta = LOCAL_GAMES_METADATA[gameId] || LOCAL_GAMES_METADATA.snake;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto my-2">
      {/* Arcade Frame */}
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#1f293d] via-[#111827] to-[#090d16] p-4 sm:p-6 shadow-2xl border-4 border-[#334155]/80 arcade-bezel-shadow">
        
        {/* Header Marquee */}
        <div className="flex items-center justify-between pb-3 border-b border-[#334155]/60 mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-emerald-400 text-xs sm:text-sm animate-pulse tracking-widest">
              LOCAL UNBLOCKED ARCADE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-cyber bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              100% Connect Guaranteed
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 transition"
              >
                <ArrowLeft size={13} /> Exit
              </button>
            )}
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between px-4 py-2 mb-3 bg-[#080d18] rounded-xl border border-[#1e293b] font-arcade text-xs">
          <div className="flex items-center gap-2 text-sky-400">
            <span>{meta.name}</span>
            <span className="text-white tracking-widest ml-2">SCORE: {score}</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy size={14} />
            <span className="hidden sm:inline">HIGH</span>
            <span className="text-white tracking-widest">{highScore}</span>
          </div>
        </div>

        {/* Canvas Screen */}
        <div className="relative w-full aspect-[4/3] max-h-[500px] rounded-xl overflow-hidden bg-black border-2 border-[#334155] shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain block bg-[#060a12]"
          />

          {scanlinesEnabled && (
            <div className="absolute inset-0 pointer-events-none crt-scanlines crt-flicker" />
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 z-30">
              <span className="font-arcade text-red-500 text-xl sm:text-2xl animate-bounce">
                GAME OVER
              </span>
              <p className="text-gray-300 text-sm font-cyber">FINAL SCORE: {score}</p>
              <button
                onClick={() => setGameOver(false)}
                className="flex items-center gap-2 px-5 py-2.5 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-cyber text-sm tracking-wider shadow-lg transition"
              >
                <RefreshCw size={15} /> Play Again
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="flex items-center justify-between mt-3 px-2 text-[11px] text-gray-400 font-cyber">
          <span>🎮 Controls: {meta.instructions}</span>
          <span className="text-emerald-400">⚡ Runs 100% locally on device</span>
        </div>
      </div>
    </div>
  );
};
