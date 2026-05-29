import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { APP_STORE_URL } from "@/lib/site";

/**
 * Jump Alien Home Page
 * Design: deep-space dark canvas, electric green + hot red accents,
 * parallax star particles, kinetic but restrained motion.
 *
 * Content rule: every claim on this page must match the actual shipped app
 * and the App Store Connect listing. No invented stats, no features we
 * haven't built.
 */

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        const flicker = Math.sin(Date.now() * 0.001 * star.speed + star.x) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * flicker})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}

function AppStoreBadge() {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <svg
        viewBox="0 0 120 40"
        className="h-12 md:h-14"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="120" height="40" rx="5" fill="#000" />
        <rect x="0.5" y="0.5" width="119" height="39" rx="4.5" stroke="#a6a6a6" fill="none" />
        <text x="42" y="13" fill="#fff" fontSize="5" fontFamily="'Space Grotesk', sans-serif">
          Download on the
        </text>
        <text x="42" y="27" fill="#fff" fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight="600">
          App Store
        </text>
        <g transform="translate(10, 6) scale(0.55)">
          <path
            d="M24.769 20.3a5.9 5.9 0 0 1 2.81-4.95 6.04 6.04 0 0 0-4.76-2.57c-2-.21-3.97 1.2-5 1.2-1.04 0-2.6-1.18-4.3-1.15a6.33 6.33 0 0 0-5.33 3.25c-2.3 3.98-.59 9.85 1.62 13.08 1.1 1.58 2.4 3.35 4.1 3.29 1.66-.07 2.28-1.06 4.28-1.06 1.99 0 2.56 1.06 4.3 1.02 1.78-.03 2.9-1.59 3.96-3.18a13.2 13.2 0 0 0 1.8-3.68 5.7 5.7 0 0 1-3.47-5.25z"
            fill="#fff"
          />
          <path
            d="M22.037 10.67a5.8 5.8 0 0 0 1.33-4.17 5.9 5.9 0 0 0-3.83 1.98 5.52 5.52 0 0 0-1.36 4 4.88 4.88 0 0 0 3.86-1.81z"
            fill="#fff"
          />
        </g>
      </svg>
    </a>
  );
}

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: "🪐",
    title: "One-Tap Controls",
    description:
      "Tap to jump. Tap again mid-air for a double-jump. Hold the screen during rocket mode to thrust. That's the whole input layer.",
  },
  {
    icon: "🚀",
    title: "Rocket Jetpack Mode",
    description:
      "Grab a flying rocket pickup to launch into 7.5 seconds of jetpack flight. Smash through asteroids instead of dodging them.",
  },
  {
    icon: "⭐️",
    title: "Endless Lunar Run",
    description:
      "An endless side-scroller across the moon. Difficulty ramps as you survive — the longer you run, the faster the world flies past.",
  },
  {
    icon: "👽",
    title: "Unlockable Skins",
    description:
      "Collect glowing stars to unlock four alien color variants: Classic, Astro, Cyber, and Nebula.",
  },
  {
    icon: "📳",
    title: "Tactile Haptics",
    description:
      "Subtle haptic feedback on every jump, every star, every crash. Built for the iPhone in your pocket today.",
  },
  {
    icon: "🛡️",
    title: "No Ads. No Tracking.",
    description:
      "Zero advertising, zero analytics, zero data collection. Your high score lives on your device alone.",
  },
];

const STATS = [
  { value: "1-Tap", label: "Controls" },
  { value: "60", label: "FPS" },
  { value: "Offline", label: "First" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <StarField />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="/assets/alien.png"
              alt="Jump Alien character"
              className="w-10 h-10 object-contain"
            />
            <span className="font-game text-xl text-alien-green hidden sm:inline">
              Jump Alien
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#gameplay"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Gameplay
            </a>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/support"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-alien-green/10 border border-alien-green/30 text-alien-green text-sm font-medium hover:bg-alien-green/20 transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background z-[1]" />

        <div className="container relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="animate-slide-up">
              <img
                src="/assets/logo.png"
                alt="Jump Alien"
                className="w-64 md:w-80 mx-auto lg:mx-0 mb-8 drop-shadow-[0_0_30px_rgba(126,211,33,0.3)]"
              />
              <p className="text-lg md:text-xl text-foreground/80 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Tap to jump. Grab rockets to fly. Outrun the lunar wilderness as
                long as you can — in the classic alien runner, rebuilt for
                modern iOS.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <AppStoreBadge />
                <span className="text-sm text-muted-foreground">
                  Free on iPhone and iPad
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="animate-float">
              <img
                src="/assets/alien-rocket.png"
                alt="Jump Alien character flying with a jetpack"
                className="w-48 md:w-64 lg:w-80 drop-shadow-[0_0_40px_rgba(126,211,33,0.4)]"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-[1]" />

        <div className="container relative z-10">
          <ScrollReveal>
            <h2 className="font-game text-3xl md:text-5xl text-center mb-4">
              <span className="text-rocket-red glow-red">Built</span>{" "}
              <span className="text-alien-green glow-green">Simple.</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
              One tap, infinite arcade fun. The classic mechanic that made the
              original a fan favorite — modernized, no fluff.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 80}>
                <div className="glass-card rounded-xl p-6 h-full hover:border-alien-green/30 transition-all duration-300 group hover:-translate-y-1">
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gameplay */}
      <section id="gameplay" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background z-[1]" />

        <div className="container relative z-10">
          <ScrollReveal>
            <h2 className="font-game text-3xl md:text-5xl text-center mb-4">
              <span className="text-alien-green glow-green">Gameplay</span>
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-16">
              A side-scrolling endless runner across the lunar surface. Jump
              the asteroids. Snatch the stars. Catch a rocket and launch.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl overflow-hidden border border-border/30">
                <img
                  src="/assets/gameplay.png"
                  alt="Jump Alien gameplay screenshot"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-game text-4xl md:text-5xl text-alien-green glow-green mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-[1]" />

        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <div className="animate-float inline-block mb-8">
              <img
                src="/assets/alien-rocket.png"
                alt="Jump Alien"
                className="w-24 md:w-32 drop-shadow-[0_0_30px_rgba(126,211,33,0.4)]"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="font-game text-3xl md:text-5xl mb-4">
              <span className="text-rocket-red glow-red">Ready</span>{" "}
              <span className="text-foreground">to</span>{" "}
              <span className="text-alien-green glow-green">Run?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Download Jump Alien and begin your cosmic run. Free on iPhone and
              iPad.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="flex flex-col items-center gap-4">
              <AppStoreBadge />
              <p className="text-xs text-muted-foreground">
                Requires iOS 17 or later. Universal on iPhone and iPad.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/assets/alien.png"
                alt="Jump Alien"
                className="w-8 h-8 object-contain"
              />
              <span className="font-game text-lg text-alien-green">
                Jump Alien
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                App Store
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Jump Alien. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
