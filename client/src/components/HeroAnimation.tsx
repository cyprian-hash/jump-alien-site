import { motion } from "framer-motion";

export function HeroAnimation() {
  return (
    <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[420px] md:h-[420px] flex items-center justify-center select-none">
      {/* Background Cosmic Glow */}
      <div className="absolute inset-0 bg-radial from-alien-green/20 via-transparent to-transparent blur-3xl z-0 pointer-events-none" />

      {/* Layer 1: The Cratered Moon (Rotating background layer) */}
      <motion.div
        className="absolute w-[60%] h-[60%] z-10 bottom-[10%] left-[10%]"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 60,
          ease: "linear",
        }}
      >
        <img
          src="/assets/moon.png"
          alt="Cratered moon"
          className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]"
        />
      </motion.div>

      {/* Layer 2: The Flying Saucer Spaceship (Cruising overlay layer) */}
      <motion.div
        className="absolute w-[52%] h-[52%] z-30 top-[15%] right-[5%]"
        animate={{
          y: [0, -12, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
        }}
      >
        <img
          src="/assets/hero-spaceship.png"
          alt="Jump Alien spaceship"
          className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(126,211,33,0.45)]"
        />
      </motion.div>
    </div>
  );
}
