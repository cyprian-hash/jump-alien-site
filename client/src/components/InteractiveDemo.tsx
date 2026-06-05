import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

interface StarItem {
  x: number;
  y: number;
  collected: boolean;
  pulse: number;
}

interface AsteroidItem {
  x: number;
  y: number;
  size: number;
  angle: number;
  rotSpeed: number;
}

interface BeaconItem {
  x: number;
  y: number;
  pulse: number;
}

export function InteractiveDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const isHoldingRef = useRef(false);

  // Load image
  const shipImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/assets/hero-spaceship.png";
    img.onload = () => {
      shipImageRef.current = img;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Game variables
    let ship = {
      x: 100,
      y: 150,
      vx: 4,
      vy: 0,
      radius: 16,
      angle: 0,
    };

    let gravity = 0.18;
    let tetherLength = 0;
    let activeAnchor: BeaconItem | null = null;
    let tetherAngle = 0;
    let angularVelocity = 0;

    let scrollX = 0;
    let altitude = 0;

    // Arrays for game objects
    let stars: StarItem[] = [];
    let asteroids: AsteroidItem[] = [];
    let beacons: BeaconItem[] = [];
    let backgroundStars: { x: number; y: number; size: number; speed: number }[] = [];
    let particles: Particle[] = [];

    // Initialize background stars
    const initBgStars = () => {
      backgroundStars = [];
      for (let i = 0; i < 40; i++) {
        backgroundStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const resetGame = () => {
      ship = {
        x: 120,
        y: 180,
        vx: 4.5,
        vy: -2,
        radius: 16,
        angle: 0,
      };
      activeAnchor = null;
      setScore(0);
      setGameOver(false);
      scrollX = 0;
      altitude = 0;
      stars = [];
      asteroids = [];
      beacons = [];
      particles = [];
      
      // Seed initial objects
      for (let i = 0; i < 5; i++) {
        const x = 300 + i * 250;
        beacons.push({ x, y: 80 + Math.random() * 100, pulse: Math.random() });
        if (i > 0) {
          asteroids.push({
            x: x - 120,
            y: 150 + Math.random() * 120,
            size: 15 + Math.random() * 12,
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.04,
          });
          stars.push({
            x: x - 60,
            y: 100 + Math.random() * 140,
            collected: false,
            pulse: Math.random(),
          });
        }
      }
    };

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      width = canvas.width = rect?.width || 800;
      height = canvas.height = rect?.height || 450;
      initBgStars();
      resetGame();
    };

    // Physics Update
    const update = () => {
      if (gameOver) return;

      altitude += 0.2;

      // Update background stars
      backgroundStars.forEach((star) => {
        star.x -= star.speed;
        if (star.x < 0) star.x = width;
      });

      // Spawn new elements ahead
      const lastBeacon = beacons[beacons.length - 1];
      if (lastBeacon && lastBeacon.x < width + 300) {
        const x = lastBeacon.x + 240 + Math.random() * 80;
        const y = 80 + Math.random() * 90;
        beacons.push({ x, y, pulse: Math.random() });

        if (Math.random() < 0.6) {
          asteroids.push({
            x: x - 110,
            y: 80 + Math.random() * 180,
            size: 14 + Math.random() * 13,
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.05,
          });
        }

        if (Math.random() < 0.7) {
          stars.push({
            x: x - 50,
            y: 60 + Math.random() * 200,
            collected: false,
            pulse: Math.random(),
          });
        }
      }

      // Handle holding/swinging mechanics
      if (isHoldingRef.current) {
        if (!activeAnchor) {
          // Find nearest beacon ahead of ship
          let bestBeacon: BeaconItem | null = null;
          let bestDist = 280;

          for (const b of beacons) {
            const dx = b.x - ship.x;
            const dy = b.y - ship.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            // Anchor must be ahead/above and within tether range
            if (d < bestDist && b.x > ship.x - 20) {
              bestDist = d;
              bestBeacon = b;
            }
          }

          if (bestBeacon) {
            activeAnchor = bestBeacon;
            const dx = ship.x - bestBeacon.x;
            const dy = ship.y - bestBeacon.y;
            tetherLength = Math.sqrt(dx * dx + dy * dy);
            tetherAngle = Math.atan2(dy, dx);
            
            // Calculate initial angular velocity based on linear velocity
            // v = omega * r => omega = v / r
            const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
            const relativeAngle = Math.atan2(ship.vy, ship.vx);
            const angleDiff = relativeAngle - tetherAngle;
            angularVelocity = (speed * Math.sin(angleDiff)) / tetherLength;
          }
        }

        if (activeAnchor) {
          // Swing physics (gravity affects the angle of rotation)
          const gEffect = -0.003 * Math.cos(tetherAngle);
          angularVelocity += gEffect;
          angularVelocity *= 0.992; // subtle damping to feel tight
          tetherAngle += angularVelocity;

          // Constraints
          ship.x = activeAnchor.x + tetherLength * Math.cos(tetherAngle);
          ship.y = activeAnchor.y + tetherLength * Math.sin(tetherAngle);

          // Update velocities
          ship.vx = -tetherLength * angularVelocity * Math.sin(tetherAngle);
          ship.vy = tetherLength * angularVelocity * Math.cos(tetherAngle);
          ship.angle = tetherAngle + Math.PI / 2;
        } else {
          // Normal flight if no anchor found
          ship.vy += gravity;
          ship.y += ship.vy;
          ship.angle = Math.atan2(ship.vy, 5) + 0.1;
        }
      } else {
        // Release hook
        activeAnchor = null;
        ship.vy += gravity;
        ship.y += ship.vy;
        ship.angle = Math.atan2(ship.vy, 5) + 0.1;
      }

      // Boundaries & screen scrolling
      // We simulate horizontal scroll by shifting all objects left
      const speedOffset = activeAnchor ? ship.vx * 0.45 : ship.vx;
      const scrollSpeed = Math.max(1.5, speedOffset);

      // Shift objects
      beacons.forEach((b) => (b.x -= scrollSpeed));
      asteroids.forEach((a) => (a.x -= scrollSpeed));
      stars.forEach((s) => (s.x -= scrollSpeed));
      particles.forEach((p) => (p.x -= scrollSpeed));

      // Limit ship vertical boundaries
      if (ship.y < 20) {
        ship.y = 20;
        ship.vy = 0;
      }
      if (ship.y > height - 35) {
        triggerCrash();
      }

      // Add thruster trail particles
      if (Math.random() < 0.6) {
        const offsetDist = -18;
        const px = ship.x + offsetDist * Math.cos(ship.angle);
        const py = ship.y + offsetDist * Math.sin(ship.angle);
        particles.push({
          x: px,
          y: py,
          vx: -scrollSpeed * 0.2 - Math.cos(ship.angle) * 1,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 4 + 2,
          color: "rgba(126, 211, 33, 0.75)",
          alpha: 1.0,
          life: 30,
        });
      }

      // Update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 1 / p.life;
      });
      particles = particles.filter((p) => p.alpha > 0);

      // Collision checks: Stars
      stars.forEach((s) => {
        if (!s.collected) {
          const dx = s.x - ship.x;
          const dy = s.y - ship.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < ship.radius + 14) {
            s.collected = true;
            setScore((prev) => prev + 15);
            // Spawn splash particles
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: s.x,
                y: s.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 1.5,
                color: "rgba(255, 235, 59, 1.0)",
                alpha: 1.0,
                life: 20,
              });
            }
          }
        }
      });

      // Collision checks: Asteroids
      asteroids.forEach((a) => {
        const dx = a.x - ship.x;
        const dy = a.y - ship.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < ship.radius + a.size - 3) {
          triggerCrash();
        }
      });

      // Remove offscreen elements
      beacons = beacons.filter((b) => b.x > -100);
      asteroids = asteroids.filter((a) => a.x > -100);
      stars = stars.filter((s) => s.x > -100 && !s.collected);
    };

    const triggerCrash = () => {
      setGameOver(true);
      activeAnchor = null;
      isHoldingRef.current = false;
      setIsHolding(false);
      
      // Explosion particles
      for (let i = 0; i < 25; i++) {
        particles.push({
          x: ship.x,
          y: ship.y,
          vx: (Math.random() - 0.5) * 6 - 2,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 6 + 3,
          color: i % 2 === 0 ? "rgba(244, 67, 54, 0.9)" : "rgba(255, 152, 0, 0.9)",
          alpha: 1.0,
          life: 40,
        });
      }

      // Auto-restart after 1.5 seconds
      setTimeout(() => {
        resetGame();
      }, 1500);
    };

    // Draw Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Starry Space Background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#03030a");
      grad.addColorStop(1, "#0a0715");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw background stars
      ctx.fillStyle = "#ffffff";
      backgroundStars.forEach((star) => {
        ctx.globalAlpha = 0.3 + 0.7 * Math.sin(Date.now() * 0.003 + star.x);
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1.0;

      // Draw bumpy moon ground line at the bottom
      ctx.fillStyle = "#1e1e24";
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 30) {
        const y = height - 12 - 5 * Math.sin(x * 0.015 + scrollX * 0.01);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.fill();

      // 2. Draw Beacons/Anchors
      beacons.forEach((b) => {
        b.pulse += 0.05;
        const glowRadius = 16 + 3 * Math.sin(b.pulse);
        
        // Outer glow
        const radGrad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, glowRadius);
        radGrad.addColorStop(0, "rgba(0, 188, 212, 0.5)");
        radGrad.addColorStop(1, "rgba(0, 188, 212, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = "#00bcd4";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // 3. Draw Stars
      stars.forEach((s) => {
        s.pulse += 0.08;
        const scale = 1.0 + 0.15 * Math.sin(s.pulse);
        
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.scale(scale, scale);
        
        // Gold Star Path
        ctx.fillStyle = "#fec107";
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 8, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 8);
          ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 4, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 4);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      });

      // 4. Draw Asteroids
      asteroids.forEach((a) => {
        a.angle += a.rotSpeed;
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        
        ctx.fillStyle = "#484852";
        ctx.strokeStyle = "#383842";
        ctx.lineWidth = 2;
        
        // Draw bumpy rock circle
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const r = a.size + (Math.sin(angle * 3 + a.size) * 3);
          ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw crater detail
        ctx.fillStyle = "#303038";
        ctx.beginPath();
        ctx.arc(-a.size / 3, -a.size / 4, a.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      // 5. Draw Swing Rope/Tether
      if (activeAnchor) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(activeAnchor.x, activeAnchor.y);
        ctx.lineTo(ship.x, ship.y);
        ctx.stroke();
        
        ctx.shadowBlur = 0; // reset
      }

      // 6. Draw Trail Particles
      particles.forEach((p) => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 7. Draw Spaceship
      if (!gameOver) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        const img = shipImageRef.current;
        if (img) {
          // Space ship is horizontal 263x202, scale it down to appropriate size
          const w = 48;
          const h = 37;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        } else {
          // Fallback basic shape if image loading delayed
          ctx.fillStyle = "#7ed321";
          ctx.beginPath();
          ctx.arc(0, 0, ship.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    };

    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver]);

  // Hook touch controls
  const handleStart = () => {
    isHoldingRef.current = true;
    setIsHolding(true);
    setIsPlaying(true);
  };

  const handleEnd = () => {
    isHoldingRef.current = false;
    setIsHolding(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[19.5/9] overflow-hidden select-none cursor-pointer"
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        e.preventDefault();
        handleStart();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleEnd();
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Overlay details */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center pointer-events-none z-10 text-white font-mono text-[10px] sm:text-xs">
        <div className="px-2 py-1 bg-black/55 rounded border border-white/10 backdrop-blur-sm">
          SCORE: <span className="text-yellow-400 font-bold">{String(score).padStart(4, "0")}</span>
        </div>
        
        {/* Glowing live indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-alien-green/15 rounded border border-alien-green/30 backdrop-blur-sm text-alien-green font-bold">
          <span className="w-1.5 h-1.5 bg-alien-green rounded-full animate-ping" />
          PLAYABLE PREVIEW
        </div>
      </div>

      {/* Tutorial prompt */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center pointer-events-none z-10 text-center px-4 animate-fade-in">
          <div className="font-game text-alien-green glow-green text-lg sm:text-2xl md:text-3xl mb-2">
            TAP & HOLD TO SWING
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 max-w-xs leading-relaxed uppercase tracking-wider font-mono">
            Release to launch. Navigate the asteroids and collect stars.
          </div>
        </div>
      )}

      {/* Crash/Respawn Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-red-950/30 flex items-center justify-center pointer-events-none z-10 animate-fade-in">
          <div className="font-game text-rocket-red glow-red text-2xl sm:text-4xl">
            CRASH DETECTED
          </div>
        </div>
      )}
    </div>
  );
}
