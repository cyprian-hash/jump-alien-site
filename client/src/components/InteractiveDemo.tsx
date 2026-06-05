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
  vx: number;
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

    // Game variables - Vertical Climber style
    let ship = {
      x: width / 2,
      y: height - 120,
      vx: 0,
      vy: -3,
      radius: 15,
      angle: 0,
    };

    let gravity = 0.16;
    let tetherLength = 0;
    let activeAnchor: BeaconItem | null = null;
    let tetherAngle = 0;
    let angularVelocity = 0;

    let cameraY = 0; // Camera offset following the ship upward
    let scoreHeight = 0;

    // Arrays for game objects
    let stars: StarItem[] = [];
    let asteroids: AsteroidItem[] = [];
    let beacons: BeaconItem[] = [];
    let backgroundStars: { x: number; y: number; size: number; speed: number }[] = [];
    let particles: Particle[] = [];

    const initBgStars = () => {
      backgroundStars = [];
      for (let i = 0; i < 40; i++) {
        backgroundStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.3 + 0.1, // slow downward drift
        });
      }
    };

    const resetGame = () => {
      width = canvas.width;
      height = canvas.height;
      ship = {
        x: width / 2,
        y: height - 120,
        vx: 1.5,
        vy: -4,
        radius: 15,
        angle: 0,
      };
      activeAnchor = null;
      setScore(0);
      setGameOver(false);
      cameraY = 0;
      scoreHeight = 0;
      stars = [];
      asteroids = [];
      beacons = [];
      particles = [];
      
      // Spawn starting beacons (above the player)
      beacons.push({ x: width * 0.5, y: height - 260, pulse: Math.random() });
      beacons.push({ x: width * 0.3, y: height - 420, pulse: Math.random() });
      beacons.push({ x: width * 0.7, y: height - 580, pulse: Math.random() });
      beacons.push({ x: width * 0.4, y: height - 740, pulse: Math.random() });
    };

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      width = canvas.width = rect?.width || 280;
      height = canvas.height = rect?.height || 600;
      initBgStars();
      resetGame();
    };

    // Physics Update
    const update = () => {
      if (gameOver) return;

      // Update background stars
      backgroundStars.forEach((star) => {
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
      });

      // Camera follow logic: scroll view up if ship climbs past the center
      const targetScreenY = height * 0.45;
      if (ship.y < targetScreenY) {
        const diff = targetScreenY - ship.y;
        cameraY += diff;
        ship.y += diff; // keep ship in place relative to screen

        // Shift existing elements down
        beacons.forEach((b) => (b.y += diff));
        asteroids.forEach((a) => (a.y += diff));
        stars.forEach((s) => (s.y += diff));
        particles.forEach((p) => (p.y += diff));
      }

      // Keep tracking the height score
      const currentAltitude = Math.floor(cameraY / 10);
      if (currentAltitude > scoreHeight) {
        scoreHeight = currentAltitude;
        setScore(scoreHeight + Math.floor(scoreHeight / 10)); // altitude points
      }

      // Spawn new elements at the top of the viewport
      const highestBeacon = beacons.reduce((min, b) => (b.y < min ? b.y : min), height);
      if (highestBeacon > -250) {
        const spawnY = highestBeacon - (140 + Math.random() * 50);
        const spawnX = 40 + Math.random() * (width - 80);
        beacons.push({ x: spawnX, y: spawnY, pulse: Math.random() });

        // Spawn collectible star shards
        if (Math.random() < 0.65) {
          stars.push({
            x: 40 + Math.random() * (width - 80),
            y: spawnY + 60,
            collected: false,
            pulse: Math.random(),
          });
        }

        // Spawn drifting obstacles (asteroids)
        if (Math.random() < 0.5) {
          const size = 12 + Math.random() * 10;
          const leftSide = Math.random() < 0.5;
          asteroids.push({
            x: leftSide ? -30 : width + 30,
            y: spawnY - 40,
            size,
            vx: (0.6 + Math.random() * 0.8) * (leftSide ? 1 : -1),
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.04,
          });
        }
      }

      // Handle holding/swinging mechanics
      if (isHoldingRef.current) {
        if (!activeAnchor) {
          // Find nearest beacon ABOVE the ship
          let bestBeacon: BeaconItem | null = null;
          let bestDist = 240; // Max tether distance

          for (const b of beacons) {
            // Anchor must be above the ship
            if (b.y < ship.y) {
              const dx = b.x - ship.x;
              const dy = b.y - ship.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < bestDist) {
                bestDist = d;
                bestBeacon = b;
              }
            }
          }

          if (bestBeacon) {
            activeAnchor = bestBeacon;
            const dx = ship.x - bestBeacon.x;
            const dy = ship.y - bestBeacon.y;
            tetherLength = Math.sqrt(dx * dx + dy * dy);
            tetherAngle = Math.atan2(dy, dx);
            
            // v = omega * r => omega = (vx * sin - vy * cos) / r
            const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
            const relativeAngle = Math.atan2(ship.vy, ship.vx);
            const angleDiff = relativeAngle - tetherAngle;
            angularVelocity = (speed * Math.sin(angleDiff)) / tetherLength;
          }
        }

        if (activeAnchor) {
          // Swing physics (gravity pulls downwards)
          const gEffect = -0.003 * Math.cos(tetherAngle);
          angularVelocity += gEffect;
          angularVelocity *= 0.994; // tight orbit damping
          tetherAngle += angularVelocity;

          // Tether constraint position updates
          ship.x = activeAnchor.x + tetherLength * Math.cos(tetherAngle);
          ship.y = activeAnchor.y + tetherLength * Math.sin(tetherAngle);

          // Update velocities
          ship.vx = -tetherLength * angularVelocity * Math.sin(tetherAngle);
          ship.vy = tetherLength * angularVelocity * Math.cos(tetherAngle);
          
          // Rotate ship pointing tangentially in direction of motion
          ship.angle = tetherAngle + Math.PI / 2;
        } else {
          // Normal free fall with gravity
          ship.vy += gravity;
          ship.x += ship.vx;
          ship.y += ship.vy;
          ship.angle = ship.vx * 0.05; // tilt slightly based on horizontal speed
        }
      } else {
        // Free fall
        activeAnchor = null;
        ship.vy += gravity;
        ship.x += ship.vx;
        ship.y += ship.vy;
        ship.angle = ship.vx * 0.05;
      }

      // Horizontal wrapping (Pac-Man style wrapping matching the iOS app)
      const margin = 15;
      if (ship.x < -margin) {
        ship.x = width + margin;
      } else if (ship.x > width + margin) {
        ship.x = -margin;
      }

      // Update asteroid positions (drift horizontally)
      asteroids.forEach((a) => {
        a.x += a.vx;
        a.angle += a.rotSpeed;
      });

      // Update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 1 / p.life;
      });
      particles = particles.filter((p) => p.alpha > 0);

      // Add thruster trail particles
      if (Math.random() < 0.6) {
        // Emit particles from bottom of the ship
        const angleOffset = ship.angle + Math.PI / 2;
        const px = ship.x + 14 * Math.cos(angleOffset);
        const py = ship.y + 14 * Math.sin(angleOffset);
        particles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 0.6 + Math.cos(angleOffset) * 1.2,
          vy: Math.sin(angleOffset) * 1.5 + 0.5,
          size: Math.random() * 4.5 + 1.5,
          color: "rgba(126, 211, 33, 0.8)",
          alpha: 1.0,
          life: 25,
        });
      }

      // Collision checks: Stars
      stars.forEach((s) => {
        if (!s.collected) {
          const dx = s.x - ship.x;
          const dy = s.y - ship.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < ship.radius + 12) {
            s.collected = true;
            setScore((prev) => prev + 15);
            
            // Collect sparks
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: s.x,
                y: s.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 2.5 + 1.2,
                color: "#ffeb3b",
                alpha: 1.0,
                life: 18,
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
        if (d < ship.radius + a.size - 2) {
          triggerCrash();
        }
      });

      // Check for falling below screen boundary (camera view bottom)
      if (ship.y > height + 20) {
        triggerCrash();
      }

      // Cleanup offscreen items
      beacons = beacons.filter((b) => b.y < height + 100);
      asteroids = asteroids.filter((a) => a.y < height + 100 && a.x > -50 && a.x < width + 50);
      stars = stars.filter((s) => s.y < height + 100 && !s.collected);
    };

    const triggerCrash = () => {
      setGameOver(true);
      activeAnchor = null;
      isHoldingRef.current = false;
      setIsHolding(false);

      // Particle explosion
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: ship.x,
          y: ship.y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 1,
          size: Math.random() * 5.5 + 2,
          color: i % 2 === 0 ? "#f44336" : "#ff9800",
          alpha: 1.0,
          life: 35,
        });
      }

      // Restart
      setTimeout(() => {
        resetGame();
      }, 1500);
    };

    // Draw Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space space background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#03030b");
      grad.addColorStop(1, "#090614");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Background stars
      ctx.fillStyle = "#ffffff";
      backgroundStars.forEach((star) => {
        ctx.globalAlpha = 0.25 + 0.75 * Math.sin(Date.now() * 0.002 + star.y);
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1.0;

      // Draw initial ground if visible
      const groundY = height - 15 + cameraY;
      if (groundY < height + 100) {
        ctx.fillStyle = "#1d1d24";
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, groundY);
        for (let x = 0; x <= width; x += 20) {
          const y = groundY - 4 * Math.sin(x * 0.02);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.fill();
      }

      // Draw tethers
      if (activeAnchor) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1.8;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.moveTo(activeAnchor.x, activeAnchor.y);
        ctx.lineTo(ship.x, ship.y);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Beacons/Anchors
      beacons.forEach((b) => {
        b.pulse += 0.04;
        const outerRadius = 14 + 2.5 * Math.sin(b.pulse);
        
        const radGrad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, outerRadius);
        radGrad.addColorStop(0, "rgba(0, 188, 212, 0.4)");
        radGrad.addColorStop(1, "rgba(0, 188, 212, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#00bcd4";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Draw Stars
      stars.forEach((s) => {
        s.pulse += 0.06;
        const scale = 1.0 + 0.12 * Math.sin(s.pulse);
        
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = "#ffc107";
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 7.5, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 7.5);
          ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 3.5, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 3.5);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      });

      // Draw Asteroids
      asteroids.forEach((a) => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        
        ctx.fillStyle = "#4a4a54";
        ctx.strokeStyle = "#383840";
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const r = a.size + (Math.sin(angle * 3 + a.size) * 2);
          ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
      });

      // Draw Spaceship (pointing UP by default at angle = 0)
      if (!gameOver) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        const img = shipImageRef.current;
        if (img) {
          // Native sizes: height is slightly taller than width
          // Saucer is at the bottom, dome is at the top
          const w = 36;
          const h = 42;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        } else {
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
      className="relative w-full aspect-[9/19.5] overflow-hidden select-none cursor-pointer"
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

      {/* Live HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-10 text-white font-mono text-[9px] sm:text-[11px]">
        <div className="px-2 py-0.5 bg-black/60 rounded border border-white/10 backdrop-blur-sm">
          ALTITUDE: <span className="text-cyan-400 font-bold">{score}m</span>
        </div>
        
        <div className="flex items-center gap-1 px-2 py-0.5 bg-alien-green/15 rounded border border-alien-green/35 backdrop-blur-sm text-alien-green font-bold">
          <span className="w-1.5 h-1.5 bg-alien-green rounded-full animate-pulse" />
          PLAYABLE
        </div>
      </div>

      {/* Starting Tutorial Prompt */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center pointer-events-none z-10 text-center px-4 animate-fade-in">
          <div className="font-game text-alien-green glow-green text-lg sm:text-xl md:text-2xl mb-1.5">
            TAP & HOLD TO SWING
          </div>
          <div className="text-[9px] sm:text-[10px] text-white/85 max-w-[170px] leading-relaxed uppercase tracking-wider font-mono">
            Rope to beacons above. Release to launch upwards. Avoid asteroids!
          </div>
        </div>
      )}

      {/* Crash Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-red-950/20 flex items-center justify-center pointer-events-none z-10 animate-fade-in">
          <div className="font-game text-rocket-red glow-red text-xl sm:text-2xl">
            CRASH DETECTED
          </div>
        </div>
      )}
    </div>
  );
}
