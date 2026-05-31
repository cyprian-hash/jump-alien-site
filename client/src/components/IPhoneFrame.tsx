/**
 * Pure-CSS iPhone device mockup. No external library, no image of a phone —
 * just nested rounded containers + gradients + a Dynamic Island pill +
 * side button bumps. Looks like an iPhone, scales to any size, theme-agnostic.
 *
 * Two orientations: "portrait" (default) and "landscape". Defaults to landscape
 * because Jump Alien is a landscape-only game and the gameplay screenshots
 * we wrap with it are landscape-aspect.
 *
 * Usage:
 *   <IPhoneFrame orientation="landscape" className="w-full max-w-4xl">
 *     <img src="..." className="w-full h-full object-cover" />
 *   </IPhoneFrame>
 */

import { ReactNode } from "react";

interface IPhoneFrameProps {
  children: ReactNode;
  orientation?: "portrait" | "landscape";
  className?: string;
  showGlow?: boolean;
}

export function IPhoneFrame({
  children,
  orientation = "landscape",
  className = "",
  showGlow = true,
}: IPhoneFrameProps) {
  const isLandscape = orientation === "landscape";

  return (
    <div className={`relative ${className}`}>
      {/* Cyan-green glow underneath — matches the alien-green theme */}
      {showGlow && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-[2.5rem] bg-alien-green/25 blur-3xl scale-110"
        />
      )}

      {/* Outer bezel: dark titanium-like gradient with subtle inner highlight */}
      <div
        className="
          relative
          rounded-[2.2rem]
          p-[10px]
          bg-gradient-to-br from-[#1a1a22] via-[#0b0b10] to-[#1a1a22]
          shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]
          ring-1 ring-white/8
        "
      >
        {/* Side hardware buttons — purely cosmetic gradient bumps */}
        {isLandscape ? (
          <>
            {/* Top edge: volume up + down (left side of phone in landscape) */}
            <div className="absolute -top-[3px] left-16 w-12 h-[3px] bg-gradient-to-t from-[#0b0b10] to-[#2a2a32] rounded-t" />
            <div className="absolute -top-[3px] left-32 w-16 h-[3px] bg-gradient-to-t from-[#0b0b10] to-[#2a2a32] rounded-t" />
            {/* Bottom edge: power button (right side of phone in landscape) */}
            <div className="absolute -bottom-[3px] right-20 w-20 h-[3px] bg-gradient-to-b from-[#0b0b10] to-[#2a2a32] rounded-b" />
          </>
        ) : (
          <>
            {/* Left edge: volume buttons */}
            <div className="absolute -left-[3px] top-20 w-[3px] h-12 bg-gradient-to-l from-[#0b0b10] to-[#2a2a32] rounded-l" />
            <div className="absolute -left-[3px] top-36 w-[3px] h-16 bg-gradient-to-l from-[#0b0b10] to-[#2a2a32] rounded-l" />
            {/* Right edge: power button */}
            <div className="absolute -right-[3px] top-28 w-[3px] h-20 bg-gradient-to-r from-[#0b0b10] to-[#2a2a32] rounded-r" />
          </>
        )}

        {/* Inner screen container */}
        <div className="relative rounded-[1.65rem] overflow-hidden bg-black aspect-auto">
          {/* Dynamic Island pill */}
          {isLandscape ? (
            // Landscape: pill is on the left side, vertical
            <div
              aria-hidden="true"
              className="
                absolute left-2 top-1/2 -translate-y-1/2 z-20
                h-[35%] w-[14px]
                bg-black rounded-full
                shadow-[0_0_0_1.5px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.04)]
              "
            />
          ) : (
            // Portrait: pill at top center, horizontal
            <div
              aria-hidden="true"
              className="
                absolute top-2 left-1/2 -translate-x-1/2 z-20
                w-[35%] h-[14px]
                bg-black rounded-full
                shadow-[0_0_0_1.5px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.04)]
              "
            />
          )}

          {/* Subtle screen reflection sheen */}
          <div
            aria-hidden="true"
            className="
              absolute inset-0 z-10 pointer-events-none
              bg-gradient-to-br from-white/8 via-transparent to-transparent
              mix-blend-overlay
            "
          />

          {children}
        </div>
      </div>
    </div>
  );
}
