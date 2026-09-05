import React, { useEffect, useState } from 'react';

export const BotanicalParallaxBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setMousePos({
          x: (e.clientX / window.innerWidth - 0.5) * 12,
          y: (e.clientY / window.innerHeight - 0.5) * 12,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none" aria-hidden="true">
      
      {/* LEFT SIDE PLANT / BUSH - FIXED DOCKED TO LEFT */}
      <div 
        className="absolute top-12 -left-14 sm:-left-8 w-60 sm:w-80 h-auto opacity-50 filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-transform duration-500 ease-out will-change-transform"
        style={{
          transform: `translateX(${mousePos.x * 0.2}px) translateY(${mousePos.y * 0.2}px)`
        }}
      >
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <defs>
            <linearGradient id="glassLeafGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="50%" stopColor="rgba(6, 95, 70, 0.25)" />
              <stop offset="100%" stopColor="rgba(167, 243, 208, 0.15)" />
            </linearGradient>
          </defs>

          {/* Bush Stems & Lush Leaves */}
          <path d="M10,400 Q40,250 80,120 Q120,40 180,10" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="3" />
          
          {/* Leaf 1 */}
          <path 
            d="M80,120 Q140,80 170,130 Q120,180 80,120 Z" 
            fill="url(#glassLeafGradLeft)" 
            stroke="rgba(16,185,129,0.45)" 
            strokeWidth="1.2" 
          />
          <path d="M80,120 Q125,130 170,130" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />

          {/* Leaf 2 */}
          <path 
            d="M50,220 Q120,170 150,230 Q90,270 50,220 Z" 
            fill="url(#glassLeafGradLeft)" 
            stroke="rgba(16,185,129,0.45)" 
            strokeWidth="1.2" 
          />
          <path d="M50,220 Q100,225 150,230" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />

          {/* Leaf 3 */}
          <path 
            d="M20,310 Q80,260 110,320 Q60,360 20,310 Z" 
            fill="url(#glassLeafGradLeft)" 
            stroke="rgba(16,185,129,0.45)" 
            strokeWidth="1.2" 
          />
        </svg>
      </div>

      {/* RIGHT SIDE PLANT / BUSH - FIXED DOCKED TO RIGHT */}
      <div 
        className="absolute top-20 -right-14 sm:-right-8 w-60 sm:w-80 h-auto opacity-50 filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-transform duration-500 ease-out will-change-transform"
        style={{
          transform: `translateX(${mousePos.x * -0.2}px) translateY(${mousePos.y * -0.2}px)`
        }}
      >
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <defs>
            <linearGradient id="glassLeafGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0.4)" />
              <stop offset="60%" stopColor="rgba(4, 120, 87, 0.25)" />
              <stop offset="100%" stopColor="rgba(240, 253, 244, 0.15)" />
            </linearGradient>
          </defs>

          {/* Bush Stems */}
          <path d="M190,400 Q160,240 120,110 Q80,30 20,10" fill="none" stroke="rgba(16,185,129,0.4)" strokeWidth="3" />

          {/* Right Leaf 1 */}
          <path 
            d="M120,110 Q60,70 30,120 Q80,170 120,110 Z" 
            fill="url(#glassLeafGradRight)" 
            stroke="rgba(16,185,129,0.45)" 
            strokeWidth="1.2" 
          />
          <path d="M120,110 Q75,120 30,120" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />

          {/* Right Leaf 2 */}
          <path 
            d="M150,210 Q80,160 50,220 Q110,260 150,210 Z" 
            fill="url(#glassLeafGradRight)" 
            stroke="rgba(16,185,129,0.45)" 
            strokeWidth="1.2" 
          />

          {/* Right Leaf 3 */}
          <path 
            d="M180,300 Q120,250 90,310 Q140,350 180,300 Z" 
            fill="url(#glassLeafGradRight)" 
            stroke="rgba(16,185,129,0.45)" 
            strokeWidth="1.2" 
          />
        </svg>
      </div>

      {/* PERIPHERAL FLOATING GLASS LEAF - TOP LEFT */}
      <div 
        className="absolute top-28 left-[3%] w-24 sm:w-36 h-auto opacity-55 filter drop-shadow-[0_12px_24px_rgba(16,185,129,0.25)] transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translateX(${mousePos.x * 0.25}px) translateY(${mousePos.y * 0.25}px) rotate(12deg)`
        }}
      >
        <svg viewBox="0 0 100 140" className="w-full h-full">
          <defs>
            <linearGradient id="bigGlassLeaf1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="30%" stopColor="rgba(16, 185, 129, 0.4)" />
              <stop offset="80%" stopColor="rgba(6, 95, 70, 0.3)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
            </linearGradient>
          </defs>
          <path 
            d="M50,5 C75,35 95,75 50,135 C5,75 25,35 50,5 Z" 
            fill="url(#bigGlassLeaf1)" 
            stroke="rgba(16, 185, 129, 0.5)" 
            strokeWidth="1.5" 
          />
          <path d="M50,5 Q50,70 50,135" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1" />
        </svg>
      </div>

      {/* PERIPHERAL FLOATING GLASS LEAF - TOP RIGHT */}
      <div 
        className="absolute top-48 right-[3%] w-28 sm:w-40 h-auto opacity-55 filter drop-shadow-[0_15px_30px_rgba(6,95,70,0.25)] transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translateX(${mousePos.x * -0.25}px) translateY(${mousePos.y * -0.25}px) rotate(-20deg)`
        }}
      >
        <svg viewBox="0 0 120 160" className="w-full h-full">
          <defs>
            <linearGradient id="bigGlassLeaf2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(240, 253, 244, 0.65)" />
              <stop offset="40%" stopColor="rgba(52, 211, 153, 0.45)" />
              <stop offset="90%" stopColor="rgba(4, 120, 87, 0.35)" />
            </linearGradient>
          </defs>
          <path 
            d="M60,5 C95,45 115,95 60,155 C5,95 25,45 60,5 Z" 
            fill="url(#bigGlassLeaf2)" 
            stroke="rgba(52, 211, 153, 0.55)" 
            strokeWidth="1.8" 
          />
          <path d="M60,5 Q60,80 60,155" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1.2" />
        </svg>
      </div>

    </div>
  );
};
