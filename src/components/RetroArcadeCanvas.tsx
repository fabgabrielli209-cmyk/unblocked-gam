import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw, Trophy, Gamepad2, ArrowLeft } from 'lucide-react';

interface RetroArcadeCanvasProps {
  gameMode?: 'snake' | 'breakout' | 'space';
  onExit?: () => void;
  scanlinesEnabled?: boolean;
}

// Simple Web Audio 8-bit sound synthesizer
class SoundSynth {
  ctx: AudioContext | null = null;
  enabled = true;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  beep(freq: number, type: OscillatorType = 'square', duration = 0.08, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy
    }
  }

  eat() {
    this.beep(520, 'square', 0.05, 0.12);
    setTimeout(() => this.beep(840, 'square', 0.08, 0.15), 50);
  }

  die() {
    this.beep(150, 'sawtooth', 0.3, 0.2);
  }

  hit() {
    this.beep(330, 'square', 0.04, 0.08);
  }

  powerup() {
    this.beep(440, 'triangle', 0.06);
    setTimeout(() => this.beep(660, 'triangle', 0.06), 60);
    setTimeout(() => this.beep(880, 'triangle', 0.1), 120);
  }
}

const synth = new SoundSynth();

export const RetroArcadeCanvas: React.FC<RetroArcadeCanvasProps> = ({
  gameMode = 'snake',
  onExit,
  scanlinesEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeGame, setActiveGame] = useState<'snake' | 'breakout' | 'space'>(gameMode);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [credits, setCredits] = useState(99);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem(`retro_high_${activeGame}`);
    if (saved) setHighScore(parseInt(saved, 10));
    else setHighScore(0);
  }, [activeGame]);

  const updateHighScore = useCallback((newScore: number) => {
    setHighScore(prev => {
      if (newScore > prev) {
        localStorage.setItem(`retro_high_${activeGame}`, newScore.toString());
        return newScore;
      }
      return prev;
    });
  }, [activeGame]);

  // Sound toggle
  const toggleSound = () => {
    setSoundOn(prev => {
      synth.enabled = !prev;
      return !prev;
    });
  };

  // --- SNAKE GAME ENGINE ---
  useEffect(() => {
    if (activeGame !== 'snake') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const gridSize = 20;
    const tileCountX = Math.floor(canvas.width / gridSize);
    const tileCountY = Math.floor(canvas.height / gridSize);

    let snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    let food = { x: 18, y: 10 };
    let dx = 1;
    let dy = 0;
    let currentScore = 0;
    let isDead = false;
    let lastTime = 0;
    const stepSpeed = 100; // ms per frame

    setScore(0);
    setGameOver(false);

    const spawnFood = () => {
      food = {
        x: Math.floor(Math.random() * tileCountX),
        y: Math.floor(Math.random() * tileCountY),
      };
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (dy !== 1) { dx = 0; dy = -1; }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (dy !== -1) { dx = 0; dy = 1; }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (dx !== 1) { dx = -1; dy = 0; }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (dx !== -1) { dx = 1; dy = 0; }
      }
    };
    window.addEventListener('keydown', handleKey);

    const loop = (timestamp: number) => {
      if (timestamp - lastTime > stepSpeed && !isDead) {
        lastTime = timestamp;

        // Move head
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wall collisions (teleport or die)
        if (head.x < 0) head.x = tileCountX - 1;
        if (head.x >= tileCountX) head.x = 0;
        if (head.y < 0) head.y = tileCountY - 1;
        if (head.y >= tileCountY) head.y = 0;

        // Self collision
        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === head.x && snake[i].y === head.y) {
            isDead = true;
            setGameOver(true);
            synth.die();
            break;
          }
        }

        if (!isDead) {
          snake.unshift(head);
          // Check food
          if (head.x === food.x && head.y === food.y) {
            currentScore += 10;
            setScore(currentScore);
            updateHighScore(currentScore);
            synth.eat();
            spawnFood();
          } else {
            snake.pop();
          }
        }
      }

      // Render
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid dots
      ctx.fillStyle = 'rgba(76, 108, 145, 0.15)';
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.fillRect(x + gridSize / 2 - 1, y + gridSize / 2 - 1, 2, 2);
        }
      }

      // Draw food (pulsing glowing neon orb)
      const pulse = 2 + Math.sin(timestamp * 0.01) * 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2 + pulse * 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw snake
      snake.forEach((part, i) => {
        ctx.shadowBlur = i === 0 ? 12 : 5;
        ctx.shadowColor = i === 0 ? '#38bdf8' : '#0284c7';
        ctx.fillStyle = i === 0 ? '#38bdf8' : '#0ea5e9';
        ctx.fillRect(
          part.x * gridSize + 1,
          part.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2
        );
      });

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKey);
    };
  }, [activeGame, updateHighScore]);

  // --- BREAKOUT GAME ENGINE ---
  useEffect(() => {
    if (activeGame !== 'breakout') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let paddleWidth = 100;
    const paddleHeight = 14;
    let paddleX = (canvas.width - paddleWidth) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 50;
    let dx = 4;
    let dy = -4;
    const ballRadius = 7;
    let currentScore = 0;
    let isDead = false;

    setScore(0);
    setGameOver(false);

    // Brick grid
    const rowCount = 5;
    const colCount = 8;
    const brickWidth = (canvas.width - 60) / colCount;
    const brickHeight = 22;
    const brickOffsetTop = 50;
    const brickOffsetLeft = 30;

    const bricks: { x: number; y: number; status: number; color: string }[][] = [];
    const colors = ['#f43f5e', '#fb923c', '#eab308', '#22c55e', '#38bdf8'];

    for (let c = 0; c < colCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < rowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r] };
      }
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };
    canvas.addEventListener('mousemove', mouseMoveHandler);

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        paddleX = Math.max(0, paddleX - 35);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        paddleX = Math.min(canvas.width - paddleWidth, paddleX + 35);
      }
    };
    window.addEventListener('keydown', keyHandler);

    const loop = () => {
      if (!isDead) {
        // Move ball
        ballX += dx;
        ballY += dy;

        // Bounce left/right
        if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
          dx = -dx;
          synth.hit();
        }
        // Bounce top
        if (ballY + dy < ballRadius) {
          dy = -dy;
          synth.hit();
        } else if (ballY + dy > canvas.height - ballRadius - paddleHeight - 20) {
          // Check paddle collision
          if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            dy = -Math.abs(dy);
            // Angle adjustment based on where it hit paddle
            const hitOffset = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            dx = hitOffset * 6;
            synth.hit();
          } else if (ballY + dy > canvas.height - ballRadius) {
            isDead = true;
            setGameOver(true);
            synth.die();
          }
        }

        // Brick collision
        for (let c = 0; c < colCount; c++) {
          for (let r = 0; r < rowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
              if (
                ballX > b.x &&
                ballX < b.x + brickWidth &&
                ballY > b.y &&
                ballY < b.y + brickHeight
              ) {
                dy = -dy;
                b.status = 0;
                currentScore += 20;
                setScore(currentScore);
                updateHighScore(currentScore);
                synth.eat();
              }
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bricks
      for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < rowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * brickWidth + brickOffsetLeft;
            const brickY = r * (brickHeight + 6) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.shadowBlur = 8;
            ctx.shadowColor = bricks[c][r].color;
            ctx.fillStyle = bricks[c][r].color;
            ctx.fillRect(brickX + 2, brickY + 2, brickWidth - 4, brickHeight - 2);
          }
        }
      }

      // Draw paddle
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(paddleX, canvas.height - 35, paddleWidth, paddleHeight);

      // Draw ball
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('keydown', keyHandler);
    };
  }, [activeGame, updateHighScore]);

  // --- SPACE DEFENDER GAME ENGINE ---
  useEffect(() => {
    if (activeGame !== 'space') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let shipX = canvas.width / 2;
    const shipY = canvas.height - 50;
    let bullets: { x: number; y: number }[] = [];
    let enemies: { x: number; y: number; hp: number; color: string }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];
    let stars: { x: number; y: number; speed: number }[] = [];
    let currentScore = 0;
    let isDead = false;
    let lastShoot = 0;

    setScore(0);
    setGameOver(false);

    // Init background starfield
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 2,
      });
    }

    // Spawn initial enemy wave
    const spawnEnemy = () => {
      enemies.push({
        x: 40 + Math.random() * (canvas.width - 80),
        y: -20,
        hp: 1,
        color: ['#ec4899', '#a855f7', '#06b6d4', '#eab308'][Math.floor(Math.random() * 4)],
      });
    };

    const keyState: Record<string, boolean> = {};
    const keyDownHandler = (e: KeyboardEvent) => { keyState[e.key] = true; };
    const keyUpHandler = (e: KeyboardEvent) => { keyState[e.key] = false; };
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    let frameCount = 0;

    const loop = () => {
      frameCount++;
      if (frameCount % 45 === 0) spawnEnemy();

      // Controls
      if (keyState['ArrowLeft'] || keyState['a'] || keyState['A']) {
        shipX = Math.max(30, shipX - 6);
      }
      if (keyState['ArrowRight'] || keyState['d'] || keyState['D']) {
        shipX = Math.min(canvas.width - 30, shipX + 6);
      }
      if ((keyState[' '] || keyState['ArrowUp'] || keyState['w']) && Date.now() - lastShoot > 180 && !isDead) {
        lastShoot = Date.now();
        bullets.push({ x: shipX - 8, y: shipY - 10 });
        bullets.push({ x: shipX + 8, y: shipY - 10 });
        synth.hit();
      }

      // Update stars
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
      });

      // Update bullets
      bullets = bullets.filter(b => {
        b.y -= 9;
        return b.y > -10;
      });

      // Update enemies
      enemies = enemies.filter(enemy => {
        enemy.y += 2.2;

        // Collision with ship
        const dist = Math.hypot(enemy.x - shipX, enemy.y - shipY);
        if (dist < 28) {
          isDead = true;
          setGameOver(true);
          synth.die();
        }

        // Collision with bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          if (Math.hypot(enemy.x - b.x, enemy.y - b.y) < 22) {
            bullets.splice(i, 1);
            currentScore += 50;
            setScore(currentScore);
            updateHighScore(currentScore);
            synth.powerup();

            // Spawn explosion particles
            for (let p = 0; p < 12; p++) {
              particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color: enemy.color,
              });
            }
            return false;
          }
        }

        return enemy.y < canvas.height + 30;
      });

      // Update particles
      particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        return p.life > 0;
      });

      // Render
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      stars.forEach(s => {
        ctx.fillRect(s.x, s.y, 1.5, 1.5);
      });

      // Draw bullets
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y, 4, 12);
      });

      // Draw enemies (Retro space invader UFOs)
      enemies.forEach(e => {
        ctx.shadowBlur = 12;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x - 6, e.y - 3, 12, 6);
      });

      // Draw particles
      particles.forEach(p => {
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
      });

      // Draw ship (Retro triangular spaceship)
      if (!isDead) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#22d3ee';
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.moveTo(shipX, shipY - 18);
        ctx.lineTo(shipX - 16, shipY + 14);
        ctx.lineTo(shipX + 16, shipY + 14);
        ctx.closePath();
        ctx.fill();

        // Ship cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(shipX - 2, shipY - 6, 4, 10);
      }

      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, [activeGame, updateHighScore]);

  const restartCurrentGame = () => {
    setActiveGame(g => g);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto my-4">
      {/* Retro Arcade Bezel Frame */}
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#1f293d] via-[#111827] to-[#090d16] p-4 sm:p-6 shadow-2xl border-4 border-[#334155]/80 arcade-bezel-shadow">
        
        {/* Arcade Header Marquee */}
        <div className="flex items-center justify-between pb-4 border-b border-[#334155]/60 mb-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-sky-400 text-xs sm:text-sm animate-pulse tracking-widest">
              GAM-3 ARCADE
            </span>
            <span className="text-gray-400 font-mono text-[11px] hidden sm:inline">
              [CREDITS {credits}]
            </span>
          </div>

          {/* Game Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-[#0b101b] p-1 rounded-lg border border-[#334155]/50">
            <button
              onClick={() => setActiveGame('snake')}
              className={`px-3 py-1 rounded text-xs font-cyber transition-all ${
                activeGame === 'snake'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cyber Snake
            </button>
            <button
              onClick={() => setActiveGame('breakout')}
              className={`px-3 py-1 rounded text-xs font-cyber transition-all ${
                activeGame === 'breakout'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Neon Breakout
            </button>
            <button
              onClick={() => setActiveGame('space')}
              className={`px-3 py-1 rounded text-xs font-cyber transition-all ${
                activeGame === 'space'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Space 1984
            </button>
          </div>

          {/* Sound & Exit */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              title={soundOn ? 'Mute 8-bit sound' : 'Unmute sound'}
              className="p-1.5 rounded-lg bg-[#1e293b]/60 hover:bg-[#1e293b] text-gray-300 hover:text-white transition"
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
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

        {/* Arcade Scoreboard Display */}
        <div className="flex items-center justify-between px-4 py-2 mb-3 bg-[#080d18] rounded-xl border border-[#1e293b] font-arcade text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 text-sky-400">
            <span>1UP</span>
            <span className="text-white tracking-widest">{score.toString().padStart(5, '0')}</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy size={14} className="text-amber-400" />
            <span className="hidden sm:inline">HIGH</span>
            <span className="text-white tracking-widest">{highScore.toString().padStart(5, '0')}</span>
          </div>
        </div>

        {/* Centered Canvas Game Screen with CRT Bezel */}
        <div className="relative w-full aspect-[4/3] max-h-[500px] rounded-xl overflow-hidden bg-black border-2 border-[#334155] shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain block bg-[#060a12]"
          />

          {/* CRT Scanline Overlay */}
          {scanlinesEnabled && (
            <div className="absolute inset-0 pointer-events-none crt-scanlines crt-flicker" />
          )}

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 z-30">
              <span className="font-arcade text-red-500 text-xl sm:text-2xl animate-bounce">
                GAME OVER
              </span>
              <p className="text-gray-300 text-sm font-cyber">FINAL SCORE: {score}</p>
              <button
                onClick={restartCurrentGame}
                className="flex items-center gap-2 px-5 py-2.5 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-cyber text-sm tracking-wider shadow-lg hover:shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
              >
                <RefreshCw size={15} /> PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* Arcade Control Bar Helper */}
        <div className="flex flex-wrap items-center justify-between mt-3 px-2 text-[11px] text-gray-400 font-cyber">
          <div className="flex items-center gap-3">
            <span>🎮 Controls: Arrows / WASD</span>
            <span className="hidden sm:inline">• Space to Shoot</span>
          </div>
          <div className="flex items-center gap-3">
            <span>CRT Display: {scanlinesEnabled ? 'ACTIVE' : 'OFF'}</span>
            <button
              onClick={() => setCredits(c => c + 1)}
              className="text-amber-400/90 hover:text-amber-300 transition"
            >
              + Insert Coin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
