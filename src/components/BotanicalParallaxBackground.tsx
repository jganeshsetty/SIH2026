import React, { useEffect, useState } from 'react';

export const BotanicalParallaxBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      
      {/* LEFT SIDE PLANT / BUSH PARALLAX */}
      <div 
        className="absolute top-10 -left-12 sm:-left-6 w-64 sm:w-96 h-auto opacity-80 filter drop-shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${scrollY * 0.12}px) translateX(${mousePos.x * 0.4}px) rotate(${Math.sin(scrollY * 0.002) * 4}deg)`
        }}
      >
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <defs>
            <linearGradient id="glassLeafGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.45)" />
              <stop offset="50%" stopColor="rgba(6, 95, 70, 0.35)" />
              <stop offset="100%" stopColor="rgba(167, 243, 208, 0.25)" />
            </linearGradient>
          </defs>

          {/* Bush Stems & Lush Leaves */}
          <path d="M10,400 Q40,250 80,120 Q120,40 180,10" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="4" />
          
          {/* Leaf 1 */}
          <path 
            d="M80,120 Q140,80 170,130 Q120,180 80,120 Z" 
            fill="url(#glassLeafGradLeft)" 
            stroke="rgba(16,185,129,0.6)" 
            strokeWidth="1.5" 
            style={{ backdropFilter: 'blur(8px)' }}
          />
          <path d="M80,120 Q125,130 170,130" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />

          {/* Leaf 2 */}
          <path 
            d="M50,220 Q120,170 150,230 Q90,270 50,220 Z" 
            fill="url(#glassLeafGradLeft)" 
            stroke="rgba(16,185,129,0.6)" 
            strokeWidth="1.5" 
          />
          <path d="M50,220 Q100,225 150,230" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />

          {/* Leaf 3 */}
          <path 
            d="M20,310 Q80,260 110,320 Q60,360 20,310 Z" 
            fill="url(#glassLeafGradLeft)" 
            stroke="rgba(16,185,129,0.6)" 
            strokeWidth="1.5" 
          />
        </svg>
      </div>

      {/* RIGHT SIDE PLANT / BUSH PARALLAX */}
      <div 
        className="absolute top-20 -right-12 sm:-right-6 w-64 sm:w-96 h-auto opacity-80 filter drop-shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${scrollY * 0.18}px) translateX(${mousePos.x * -0.4}px) rotate(${Math.cos(scrollY * 0.002) * -4}deg)`
        }}
      >
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <defs>
            <linearGradient id="glassLeafGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0.5)" />
              <stop offset="60%" stopColor="rgba(4, 120, 87, 0.35)" />
              <stop offset="100%" stopColor="rgba(240, 253, 244, 0.2)" />
            </linearGradient>
          </defs>

          {/* Bush Stems */}
          <path d="M190,400 Q160,240 120,110 Q80,30 20,10" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="4" />

          {/* Right Leaf 1 */}
          <path 
            d="M120,110 Q60,70 30,120 Q80,170 120,110 Z" 
            fill="url(#glassLeafGradRight)" 
            stroke="rgba(16,185,129,0.6)" 
            strokeWidth="1.5" 
          />
          <path d="M120,110 Q75,120 30,120" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />

          {/* Right Leaf 2 */}
          <path 
            d="M150,210 Q80,160 50,220 Q110,260 150,210 Z" 
            fill="url(#glassLeafGradRight)" 
            stroke="rgba(16,185,129,0.6)" 
            strokeWidth="1.5" 
          />

          {/* Right Leaf 3 */}
          <path 
            d="M180,300 Q120,250 90,310 Q140,350 180,300 Z" 
            fill="url(#glassLeafGradRight)" 
            stroke="rgba(16,185,129,0.6)" 
            strokeWidth="1.5" 
          />
        </svg>
      </div>

      {/* 3 TO 4 BIG GLASSY LEAVES FREELY FLOATING IN CENTER/AIR */}

      {/* BIG LEAF 1 - TOP CENTER-LEFT */}
      <div 
        className="absolute top-28 left-[18%] w-32 sm:w-48 h-auto filter drop-shadow-[0_15px_30px_rgba(16,185,129,0.35)] transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${-scrollY * 0.25 + Math.sin(Date.now() * 0.001) * 15}px) translateX(${mousePos.x * 0.6}px) rotate(${15 + scrollY * 0.03}deg)`
        }}
      >
        <svg viewBox="0 0 100 140" className="w-full h-full">
          <defs>
            <linearGradient id="bigGlassLeaf1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
              <stop offset="30%" stopColor="rgba(16, 185, 129, 0.55)" />
              <stop offset="80%" stopColor="rgba(6, 95, 70, 0.45)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
            </linearGradient>
          </defs>
          <path 
            d="M50,5 C75,35 95,75 50,135 C5,75 25,35 50,5 Z" 
            fill="url(#bigGlassLeaf1)" 
            stroke="rgba(16, 185, 129, 0.7)" 
            strokeWidth="2" 
          />
          <path d="M50,5 Q50,70 50,135" fill="none" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.5" strokeDasharray="100" />
          <path d="M50,45 Q70,35 80,30" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" />
          <path d="M50,65 Q30,55 20,50" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" />
          <path d="M50,85 Q70,75 82,70" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1" />
        </svg>
      </div>

      {/* BIG LEAF 2 - CENTER RIGHT */}
      <div 
        className="absolute top-72 right-[15%] w-36 sm:w-56 h-auto filter drop-shadow-[0_20px_35px_rgba(6,95,70,0.4)] transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${-scrollY * 0.35 + Math.cos(Date.now() * 0.0012) * 20}px) translateX(${mousePos.x * -0.5}px) rotate(${-25 - scrollY * 0.04}deg)`
        }}
      >
        <svg viewBox="0 0 120 160" className="w-full h-full">
          <defs>
            <linearGradient id="bigGlassLeaf2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(240, 253, 244, 0.8)" />
              <stop offset="40%" stopColor="rgba(52, 211, 153, 0.6)" />
              <stop offset="90%" stopColor="rgba(4, 120, 87, 0.5)" />
            </linearGradient>
          </defs>
          <path 
            d="M60,5 C95,45 115,95 60,155 C5,95 25,45 60,5 Z" 
            fill="url(#bigGlassLeaf2)" 
            stroke="rgba(52, 211, 153, 0.8)" 
            strokeWidth="2.5" 
          />
          <path d="M60,5 Q60,80 60,155" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="1.5" />
          <path d="M60,50 Q85,40 100,35" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1" />
          <path d="M60,80 Q35,70 20,65" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1" />
        </svg>
      </div>

      {/* BIG LEAF 3 - CENTER BOTTOM */}
      <div 
        className="absolute top-[580px] left-[45%] -translate-x-1/2 w-40 sm:w-64 h-auto filter drop-shadow-[0_25px_40px_rgba(16,185,129,0.3)] transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${-scrollY * 0.2 + Math.sin(Date.now() * 0.0008) * 18}px) translateX(${mousePos.x * 0.3}px) rotate(${scrollY * 0.02}deg)`
        }}
      >
        <svg viewBox="0 0 140 180" className="w-full h-full">
          <defs>
            <linearGradient id="bigGlassLeaf3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.5)" />
              <stop offset="100%" stopColor="rgba(2, 44, 34, 0.4)" />
            </linearGradient>
          </defs>
          <path 
            d="M70,10 C115,50 135,110 70,170 C5,110 25,50 70,10 Z" 
            fill="url(#bigGlassLeaf3)" 
            stroke="rgba(16, 185, 129, 0.75)" 
            strokeWidth="2.5" 
          />
          <path d="M70,10 Q70,90 70,170" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" />
        </svg>
      </div>

      {/* BIG LEAF 4 - TOP RIGHT DRIFTING */}
      <div 
        className="absolute top-12 right-[32%] w-28 sm:w-40 h-auto filter drop-shadow-[0_15px_25px_rgba(16,185,129,0.3)] transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${-scrollY * 0.28 + Math.cos(Date.now() * 0.0015) * 12}px) translateX(${mousePos.x * -0.4}px) rotate(${-35 + scrollY * 0.035}deg)`
        }}
      >
        <svg viewBox="0 0 90 120" className="w-full h-full">
          <path 
            d="M45,5 C70,30 85,65 45,115 C5,65 20,30 45,5 Z" 
            fill="rgba(167, 243, 208, 0.35)" 
            stroke="rgba(16, 185, 129, 0.65)" 
            strokeWidth="2" 
          />
          <path d="M45,5 Q45,60 45,115" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="1" />
        </svg>
      </div>

    </div>
  );
};
