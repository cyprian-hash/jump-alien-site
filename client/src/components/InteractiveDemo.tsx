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

interface RocketPowerup {
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
  const [isPaused, setIsPaused] = useState(false);
  
  // States: "running" | "flying"
  const [gameStateMode, setGameStateMode] = useState<"running" | "flying">("running");
  const gameStateModeRef = useRef<"running" | "flying">("running");
  
  const [flyTimeRemaining, setFlyTimeRemaining] = useState(0);

  const isHoldingRef = useRef(false);
  const isThrustingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);

  const shipImageRef = useRef<HTMLImageElement | null>(null);
  const alienImageRef = useRef<HTMLImageElement | null>(null);

  // Component-level refs to share state between the canvas loop and react handlers
  const playerRef = useRef({
    x: 100,
    y: 0,
    vy: 0,
    width: 24,
    height: 36,
    canDoubleJump: true,
    angle: 0,
  });
  const groundYRef = useRef(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const shipImg = new Image();
    shipImg.src = "/assets/hero-spaceship.png";
    shipImg.onload = () => {
      shipImageRef.current = shipImg;
    };

    const alienImg = new Image();
    alienImg.src = "/assets/alien-walk.png";
    alienImg.onload = () => {
      alienImageRef.current = alienImg;
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

    // Ground metrics
    let groundY = height - 42;
    groundYRef.current = groundY;

    // Initialize player in ref
    playerRef.current = {
      x: 100,
      y: groundY - 36,
      vy: 0,
      width: 24,
      height: 36,
      canDoubleJump: true,
      angle: 0,
    };

    let gravity = 0.22;
    let scrollX = 0;

    // Game objects
    let stars: StarItem[] = [];
    let asteroids: AsteroidItem[] = [];
    let rockets: RocketPowerup[] = [];
    let backgroundStars: { x: number; y: number; size: number; speed: number }[] = [];
    let particles: Particle[] = [];
    let craters: { x: number; y: number; rx: number; ry: number }[] = [];
    let clouds: { x: number; y: number; width: number; height: number; speed: number }[] = [];

    // Flying timers
    let flightTimer = 0; // seconds

    const initBgStars = () => {
      backgroundStars = [];
      for (let i = 0; i < 35; i++) {
        backgroundStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.4 + 0.15,
        });
      }
    };

    const resetGame = () => {
      width = canvas.width;
      height = canvas.height;
      groundY = height - 42;
      groundYRef.current = groundY;

      playerRef.current = {
        x: 100,
        y: groundY - 36,
        vy: 0,
        width: 24,
        height: 36,
        canDoubleJump: true,
        angle: 0,
      };

      setScore(0);
      setGameOver(false);
      setIsPaused(false);
      setGameStateMode("running");
      gameStateModeRef.current = "running";
      flightTimer = 0;
      setFlyTimeRemaining(0);

      scrollX = 0;
      stars = [];
      asteroids = [];
      rockets = [];
      particles = [];
      craters = [];
      clouds = [];

      // Seed craters on light-grey moon ground
      for (let i = 0; i < 6; i++) {
        craters.push({
          x: i * 160 + Math.random() * 40,
          y: groundY + 12 + Math.random() * 6,
          rx: 10 + Math.random() * 8,
          ry: 3 + Math.random() * 2,
        });
      }

      // Seed scrolling clouds in the sky
      for (let i = 0; i < 4; i++) {
        clouds.push({
          x: i * 240 + Math.random() * 80,
          y: 30 + Math.random() * 40,
          width: 50 + Math.random() * 40,
          height: 4 + Math.random() * 3,
          speed: 0.15 + Math.random() * 0.15,
        });
      }

      // Seed starting landscape elements
      for (let i = 0; i < 4; i++) {
        const x = 320 + i * 280;
        stars.push({
          x: x,
          y: groundY - 60 - Math.random() * 80,
          collected: false,
          pulse: Math.random(),
        });
        
        if (i > 0) {
          asteroids.push({
            x: x + 100,
            y: groundY - 14,
            size: 13 + Math.random() * 6,
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.05,
          });
        }
      }

      // Add a rocket power-up early
      rockets.push({ x: 500, y: groundY - 70, pulse: 0 });
    };

    const resize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      width = canvas.width = rect?.width || 800;
      height = canvas.height = rect?.height || 450;
      initBgStars();
      resetGame();
    };

    // Physics Loop
    const update = () => {
      if (gameOver || isPausedRef.current || !isPlayingRef.current) return;

      const player = playerRef.current;
      const groundY = groundYRef.current;
      const activeMode = gameStateModeRef.current;
      const scrollSpeed = activeMode === "flying" ? 4.5 : 2.5;
      scrollX += scrollSpeed;

      // Update background stars
      backgroundStars.forEach((star) => {
        star.x -= star.speed * (scrollSpeed * 0.25);
        if (star.x < 0) star.x = width;
      });

      // Update clouds
      clouds.forEach((c) => {
        c.x -= c.speed * (scrollSpeed * 0.3);
        if (c.x < -c.width) {
          c.x = width + Math.random() * 50;
          c.y = 30 + Math.random() * 40;
        }
      });

      // Update craters
      craters.forEach((c) => {
        c.x -= scrollSpeed;
        if (c.x < -c.rx * 2) {
          c.x = width + c.rx * 2;
          c.y = groundY + 12 + Math.random() * 6;
        }
      });

      // Spawn new items ahead
      const lastStar = stars[stars.length - 1];
      if (!lastStar || lastStar.x < width + 150) {
        const spawnX = width + 250 + Math.random() * 100;
        
        // Spawn star
        stars.push({
          x: spawnX,
          y: groundY - 50 - Math.random() * 100,
          collected: false,
          pulse: Math.random(),
        });

        // Spawn asteroid
        if (Math.random() < 0.65) {
          const isSky = activeMode === "flying" && Math.random() < 0.5;
          asteroids.push({
            x: spawnX + 130,
            y: isSky ? groundY - 80 - Math.random() * 80 : groundY - 14,
            size: 12 + Math.random() * 8,
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.05,
          });
        }

        // Spawn rocket powerup (UFO) floating in air
        if (activeMode === "running" && Math.random() < 0.16 && rockets.length === 0) {
          rockets.push({
            x: spawnX + 80,
            y: groundY - 60 - Math.random() * 40,
            pulse: Math.random(),
          });
        }
      }

      // Player Physics
      if (activeMode === "running") {
        player.vy += gravity;
        player.y += player.vy;

        // Check if landing on top of asteroids (stands/rides them instead of crashing)
        let onRock = false;
        let rockY = groundY;

        asteroids.forEach((a) => {
          const px = player.x + player.width / 2;
          const ax = a.x;
          const horizontalOverlap = Math.abs(px - ax) < (a.size + player.width / 2 - 2);
          const rockTopY = a.y - a.size;
          
          if (horizontalOverlap) {
            if (player.y + player.height <= rockTopY + 8 && player.vy >= 0) {
              onRock = true;
              rockY = Math.min(rockY, rockTopY);
            }
          }
        });

        const effectiveGroundY = onRock ? rockY : groundY;
        const playerFootY = player.y + player.height;

        // Ground constraint
        if (playerFootY >= effectiveGroundY) {
          player.y = effectiveGroundY - player.height;
          player.vy = 0;
          player.canDoubleJump = true;
        }

        player.angle = 0;
      } else {
        // Flying Mode (Jetpack spaceship style)
        if (isThrustingRef.current) {
          player.vy -= 0.38; // thrust upward
          
          // Emit rocket fire particles from back
          if (Math.random() < 0.75) {
            particles.push({
              x: player.x - 18,
              y: player.y + 18,
              vx: -scrollSpeed * 0.3 - (1.5 + Math.random() * 1.5),
              vy: (Math.random() - 0.5) * 1.5,
              size: Math.random() * 5 + 2,
              color: "rgba(255, 110, 0, 0.85)", // flame orange
              alpha: 1.0,
              life: 25,
            });
          }
        } else {
          player.vy += 0.18; // gravity falling
        }

        player.vy = Math.max(-4.5, Math.min(4.5, player.vy));
        player.y += player.vy;

        // Space bounds constraints
        if (player.y < 15) {
          player.y = 15;
          player.vy = 0;
        }
        if (player.y + 25 > groundY) {
          player.y = groundY - 25;
          player.vy = 0;
        }

        // Tilt ship slightly based on vertical velocity
        player.angle = player.vy * 0.06;

        // Countdown flight timer
        flightTimer -= 1 / 60;
        setFlyTimeRemaining(Math.max(0, flightTimer));
        
        if (flightTimer <= 0) {
          // Flight mode ended - return to running
          setGameStateMode("running");
          gameStateModeRef.current = "running";
          player.height = 36; // reset to alien proportions
          player.width = 24;
          player.vy = -1.5; // slight pop out
          
          // Smoke puff effect
          for (let i = 0; i < 12; i++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 6 + 3,
              color: "rgba(255, 255, 255, 0.4)",
              alpha: 0.8,
              life: 30,
            });
          }
        }
      }

      // Shift existing elements to simulate scroll
      stars.forEach((s) => (s.x -= scrollSpeed));
      asteroids.forEach((a) => {
        a.x -= scrollSpeed;
        a.angle += a.rotSpeed; // rotate asteroids
      });
      rockets.forEach((r) => (r.x -= scrollSpeed));
      particles.forEach((p) => (p.x -= scrollSpeed));

      // Update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 1 / p.life;
      });
      particles = particles.filter((p) => p.alpha > 0);

      // Collisions: Stars
      stars.forEach((s) => {
        if (!s.collected) {
          const dx = s.x - (player.x + player.width / 2);
          const dy = s.y - (player.y + player.height / 2);
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 22) {
            s.collected = true;
            setScore((prev) => prev + 15);

            // Collect sparkles
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: s.x,
                y: s.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 2.5 + 1.2,
                color: "#ffc107",
                alpha: 1.0,
                life: 18,
              });
            }
          }
        }
      });

      // Collisions: Rocket Power-up
      rockets.forEach((r) => {
        const dx = r.x - (player.x + player.width / 2);
        const dy = r.y - (player.y + player.height / 2);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 24) {
          // Trigger Flying/Rocket Jetpack Mode!
          setGameStateMode("flying");
          gameStateModeRef.current = "flying";
          flightTimer = 7.5; // 7.5 seconds of jetpack flight
          setFlyTimeRemaining(7.5);
          
          player.width = 46; // UFO dimensions
          player.height = 35;
          player.y = r.y; // transition smoothly
          
          // Clear rockets
          rockets = [];

          // Thruster visual explosion
          for (let i = 0; i < 15; i++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 4 - 2,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 4 + 2,
              color: "#4caf50",
              alpha: 1.0,
              life: 25,
            });
          }
        }
      });

      // Collisions: Asteroids
      asteroids.forEach((a) => {
        // Check if standing/landing on top of this asteroid
        const px = player.x + player.width / 2;
        const ax = a.x;
        const horizontalOverlap = Math.abs(px - ax) < (a.size + player.width / 2 - 2);
        const rockTopY = a.y - a.size;
        const isStandingOnTop = horizontalOverlap && (player.y + player.height <= rockTopY + 8);

        if (isStandingOnTop && activeMode === "running") {
          return;
        }

        const dx = a.x - (player.x + player.width / 2);
        const dy = a.y - (player.y + player.height / 2);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < a.size + 10) {
          if (activeMode === "flying") {
            // In spaceship rocket mode, we are shielded and smash through asteroids!
            a.x = -100; // remove it
            setScore((prev) => prev + 25); // bonus points for smashing
            
            // Rock explosion sparks
            for (let i = 0; i < 15; i++) {
              particles.push({
                x: a.x + scrollSpeed,
                y: a.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 3.5 + 1.5,
                color: "#8b7e74",
                alpha: 1.0,
                life: 30,
              });
            }
          } else {
            // Running on foot: crash and die!
            triggerCrash();
          }
        }
      });

      // Cleanup offscreen items
      stars = stars.filter((s) => s.x > -100 && !s.collected);
      asteroids = asteroids.filter((a) => a.x > -100);
      rockets = rockets.filter((r) => r.x > -100);
    };

    const triggerCrash = () => {
      setGameOver(true);
      isHoldingRef.current = false;
      isThrustingRef.current = false;

      const player = playerRef.current;

      // Particle explosion
      for (let i = 0; i < 22; i++) {
        particles.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          vx: (Math.random() - 0.5) * 5 - 1.5,
          vy: (Math.random() - 0.5) * 5 - 1.5,
          size: Math.random() * 5 + 2.5,
          color: i % 2 === 0 ? "#f44336" : "#ffc107",
          alpha: 1.0,
          life: 35,
        });
      }

      // Auto-restart
      setTimeout(() => {
        resetGame();
      }, 1500);
    };

    // Draw Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const player = playerRef.current;
      const groundY = groundYRef.current;

      // Space background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#05101a");
      grad.addColorStop(0.5, "#092238");
      grad.addColorStop(1, "#103656");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Background stars
      ctx.fillStyle = "#ffffff";
      backgroundStars.forEach((star, idx) => {
        const flicker = Math.sin(Date.now() * 0.003 + idx) * 0.4 + 0.6;
        ctx.globalAlpha = flicker;
        
        if (idx % 4 === 0) {
          // Draw a beautiful 4-pointed diamond sparkle
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - star.size * 2.5);
          ctx.quadraticCurveTo(star.x, star.y, star.x + star.size * 2.5, star.y);
          ctx.quadraticCurveTo(star.x, star.y, star.x, star.y + star.size * 2.5);
          ctx.quadraticCurveTo(star.x, star.y, star.x - star.size * 2.5, star.y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(star.x, star.y, star.size, star.size);
        }
      });
      ctx.globalAlpha = 1.0;

      // Background clouds
      ctx.fillStyle = "rgba(25, 75, 115, 0.25)";
      clouds.forEach((c) => {
        ctx.beginPath();
        ctx.roundRect(c.x, c.y, c.width, c.height, c.height / 2);
        ctx.fill();
      });

      // Draw bumpy lunar surface ground
      ctx.fillStyle = "#c2c7ce"; // light-grey moon ground
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, groundY);
      for (let x = 0; x <= width; x += 15) {
        const y = groundY - 5 * Math.sin(x * 0.015 - scrollX * 0.012);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height - 20); // flat bottom line
      ctx.lineTo(0, height - 20);
      ctx.closePath();
      ctx.fill();

      // Draw craters on the ground
      ctx.fillStyle = "#a9afb6"; // darker grey craters
      craters.forEach((c) => {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw bottom space band (below flat ground line)
      ctx.fillStyle = "#050b14";
      ctx.fillRect(0, height - 20, width, 20);

      // Twinkling stars in the bottom space band
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 8; i++) {
        const starX = (i * 110 - scrollX * 0.3) % (width + 40);
        const starY = height - 12 + 4 * Math.sin(i * 1.5);
        const flicker = Math.sin(Date.now() * 0.004 + i) * 0.4 + 0.6;
        ctx.globalAlpha = flicker;
        ctx.fillRect(starX, starY, 1.2, 1.2);
      }
      ctx.globalAlpha = 1.0;

      // Draw Beacons/Stars
      stars.forEach((s) => {
        s.pulse += 0.06;
        const scale = 1.0 + 0.12 * Math.sin(s.pulse);
        
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = "#ffc107";
        ctx.strokeStyle = "#1a1202";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * 8.0, -Math.sin(((18 + i * 72) * Math.PI) / 180) * 8.0);
          ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * 3.8, -Math.sin(((54 + i * 72) * Math.PI) / 180) * 3.8);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
      });

      // Draw Rocket Powerup items (Spaceship floating in air)
      rockets.forEach((r) => {
        r.pulse += 0.06;
        const yOffset = 3 * Math.sin(r.pulse);
        ctx.save();
        ctx.translate(r.x, r.y + yOffset);
        
        // Draw spaceship image
        const img = shipImageRef.current;
        if (img) {
          ctx.drawImage(img, -18, -14, 36, 28);
        } else {
          ctx.fillStyle = "#f44336";
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw protective circular forcefield shield overlay
        const pulseGlow = 23 + 2 * Math.sin(Date.now() * 0.008);
        const shieldGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, pulseGlow);
        shieldGrad.addColorStop(0, "rgba(0, 188, 212, 0.25)");
        shieldGrad.addColorStop(1, "rgba(0, 188, 212, 0)");
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(0, 0, pulseGlow, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(0, 188, 212, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, pulseGlow - 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // Draw Asteroids
      asteroids.forEach((a) => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        
        ctx.fillStyle = "#8b7e74";
        ctx.strokeStyle = "#1a130e";
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const r = a.size + (Math.sin(angle * 3 + a.size) * 2.2);
          ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw internal craters for the asteroid
        ctx.fillStyle = "#5c524b";
        ctx.beginPath();
        ctx.arc(-a.size / 3, -a.size / 4, a.size / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.size / 3, a.size / 3, a.size / 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      // Draw Particles
      particles.forEach((p) => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Player
      if (!gameOver) {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.rotate(player.angle);

        const activeMode = gameStateModeRef.current;
        if (activeMode === "running") {
          // On Foot mode: Draw running alien
          const img = alienImageRef.current;
          if (img) {
            const bob = Math.sin(Date.now() * 0.018) * 1.5;
            ctx.drawImage(img, -player.width / 2, -player.height / 2 + bob, player.width, player.height);
          } else {
            ctx.fillStyle = "#7ed321";
            ctx.beginPath();
            ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Flying mode: Draw UFO spaceship
          const img = shipImageRef.current;
          if (img) {
            ctx.drawImage(img, -player.width / 2, -player.height / 2, player.width, player.height);
            
            // Draw protective circular forcefield shield overlay! (matches input_file_3.png)
            const pulseGlow = 26 + 2 * Math.sin(Date.now() * 0.008);
            const shieldGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, pulseGlow);
            shieldGrad.addColorStop(0, "rgba(0, 188, 212, 0.2)");
            shieldGrad.addColorStop(1, "rgba(0, 188, 212, 0)");
            ctx.fillStyle = shieldGrad;
            ctx.beginPath();
            ctx.arc(0, 0, pulseGlow, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = "rgba(0, 188, 212, 0.55)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, pulseGlow - 2, 0, Math.PI * 2);
            ctx.stroke();
          }
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
    if (isPausedRef.current) return;
    setIsPlaying(true);
    isHoldingRef.current = true;

    const player = playerRef.current;
    const groundY = groundYRef.current;
    const activeMode = gameStateModeRef.current;
    
    if (activeMode === "running" && !gameOver) {
      // Jump trigger
      if (player.y + player.height >= groundY - 1) {
        player.vy = -5.0; // main jump
        player.canDoubleJump = true;
      } else if (player.canDoubleJump) {
        player.vy = -4.5; // double jump
        player.canDoubleJump = false;
      }
    } else if (activeMode === "flying") {
      isThrustingRef.current = true;
    }
  };

  const handleEnd = () => {
    isHoldingRef.current = false;
    isThrustingRef.current = false;
  };

  const handlePauseToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying || gameOver) return;
    setIsPaused((prev) => !prev);
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

      {/* Live HUD Overlay */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center pointer-events-none z-10 text-white select-none">
        <div className="flex gap-3">
          {/* Score Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-full border border-white/10 backdrop-blur-sm shadow-md font-bold text-xs sm:text-sm">
            <span className="text-yellow-400 text-sm sm:text-base">★</span>
            <span className="font-mono">{score}</span>
          </div>
          
          {gameStateMode === "flying" && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 rounded-full border border-cyan-400/40 backdrop-blur-sm text-cyan-400 font-bold text-xs sm:text-sm animate-pulse shadow-md">
              <span>⚡</span>
              <span className="font-mono">{flyTimeRemaining.toFixed(1)}s</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Live Preview Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-alien-green/15 rounded border border-alien-green/30 backdrop-blur-sm text-alien-green font-bold text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 bg-alien-green rounded-full animate-ping" />
            PLAYABLE PREVIEW
          </div>

          {/* Pause Button */}
          {isPlaying && !gameOver && (
            <button
              onClick={handlePauseToggle}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-black/60 rounded-full border border-white/20 hover:border-white/40 active:scale-90 transition-all pointer-events-auto shadow-md text-xs sm:text-sm"
              aria-label={isPaused ? "Resume game" : "Pause game"}
            >
              {isPaused ? "▶" : "⏸"}
            </button>
          )}
        </div>
      </div>

      {/* Tutorial prompt */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center pointer-events-none z-10 text-center px-4 animate-fade-in">
          <div className="font-game text-alien-green glow-green text-lg sm:text-2xl md:text-3xl mb-2">
            TAP TO JUMP
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 max-w-xs leading-relaxed uppercase tracking-wider font-mono">
            Double tap to double jump. Grab floating UFOs to launch into flying mode!
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center z-10 text-center px-4 animate-fade-in pointer-events-none">
          <div className="font-game text-yellow-400 glow-yellow text-lg sm:text-2xl md:text-3xl mb-2">
            GAME PAUSED
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 max-w-xs leading-relaxed uppercase tracking-wider font-mono">
            Click the play button to resume the lunar run!
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
