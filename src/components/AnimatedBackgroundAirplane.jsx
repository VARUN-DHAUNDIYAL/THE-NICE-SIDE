import React, { useEffect, useRef } from 'react';

export default function AnimatedBackgroundAirplane() {
  const airplaneRef = useRef(null);

  useEffect(() => {
    let frameId;
    let start = null;
    const duration = 18000; // ms for one full pass
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = ((timestamp - start) % duration) / duration;
      const x = -0.2 + 1.4 * progress; // from -20% to 120% of width
      const y = 0.18 + 0.08 * Math.sin(progress * 2 * Math.PI); // gentle up/down
      if (airplaneRef.current) {
        airplaneRef.current.style.left = `${x * 100}vw`;
        airplaneRef.current.style.top = `${y * 100}vh`;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      ref={airplaneRef}
      style={{
        position: 'fixed',
        width: 120,
        height: 60,
        zIndex: 1,
        pointerEvents: 'none',
        filter: 'blur(0.7px) drop-shadow(0 4px 16px rgba(31,38,135,0.10))',
        opacity: 0.7,
        transition: 'top 0.2s, left 0.2s',
      }}
    >
      {/* Modern, professional SVG airplane (white/silver, blue/gold accents, soft gradients) */}
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fuselageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
          <linearGradient id="wingGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0e7ef" />
            <stop offset="100%" stopColor="#b6c6e3" />
          </linearGradient>
          <radialGradient id="windowGradient" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#b6e0fe" />
            <stop offset="100%" stopColor="#2563eb" />
          </radialGradient>
          <linearGradient id="accentGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {/* Fuselage */}
        <rect x="48" y="18" width="24" height="24" rx="12" fill="url(#fuselageGradient)" stroke="#b0b0b0" strokeWidth="1.5" />
        <rect x="38" y="24" width="44" height="12" rx="6" fill="url(#fuselageGradient)" stroke="#b0b0b0" strokeWidth="1.5" />
        {/* Nose */}
        <ellipse cx="60" cy="18" rx="8" ry="7" fill="url(#fuselageGradient)" stroke="#b0b0b0" strokeWidth="1.2" />
        {/* Cockpit window */}
        <ellipse cx="60" cy="20" rx="4" ry="2.2" fill="url(#windowGradient)" />
        {/* Left wing */}
        <polygon points="60,30 18,44 28,52 60,36" fill="url(#wingGradient)" stroke="#b0b0b0" strokeWidth="1.5" />
        {/* Right wing */}
        <polygon points="60,30 102,44 92,52 60,36" fill="url(#wingGradient)" stroke="#b0b0b0" strokeWidth="1.5" />
        {/* Tail fin */}
        <polygon points="60,42 70,58 50,58" fill="url(#accentGold)" stroke="#b0b0b0" strokeWidth="1.2" />
        {/* Windows */}
        <ellipse cx="50" cy="30" rx="1.2" ry="2" fill="url(#windowGradient)" />
        <ellipse cx="55" cy="30" rx="1.2" ry="2" fill="url(#windowGradient)" />
        <ellipse cx="65" cy="30" rx="1.2" ry="2" fill="url(#windowGradient)" />
        <ellipse cx="70" cy="30" rx="1.2" ry="2" fill="url(#windowGradient)" />
        {/* Gold accent stripe */}
        <rect x="38" y="34" width="44" height="2.5" rx="1.2" fill="url(#accentGold)" />
      </svg>
    </div>
  );
} 