import React, { useEffect, useRef, useState } from 'react';

export default function Airplane3D() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: x * 30, y: y * 30 });
    };
    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });
    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: 220,
        height: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 800,
        marginLeft: 0,
        marginRight: 0,
        userSelect: 'none',
      }}
    >
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        style={{
          transform: `rotateY(${-tilt.x}deg) rotateX(${tilt.y}deg) scale(1.08)`,
          transition: 'transform 0.2s cubic-bezier(.25,.8,.25,1)',
          filter: 'drop-shadow(0 8px 32px rgba(31,38,135,0.18))',
        }}
      >
        {/* Fuselage */}
        <ellipse cx="90" cy="100" rx="18" ry="60" fill="#fff" stroke="#b0b0b0" strokeWidth="2" />
        {/* Cockpit */}
        <ellipse cx="90" cy="48" rx="10" ry="16" fill="#b2d8f7" stroke="#b0b0b0" strokeWidth="1.5" />
        {/* Left wing */}
        <polygon points="90,100 30,120 38,130 90,110" fill="#ffe082" stroke="#b0b0b0" strokeWidth="2" />
        {/* Right wing */}
        <polygon points="90,100 150,120 142,130 90,110" fill="#ffe082" stroke="#b0b0b0" strokeWidth="2" />
        {/* Tail */}
        <polygon points="90,160 100,170 80,170" fill="#b0c4de" stroke="#b0b0b0" strokeWidth="1.5" />
        {/* Windows */}
        <ellipse cx="90" cy="70" rx="3.5" ry="6" fill="#b2d8f7" />
        <ellipse cx="90" cy="85" rx="3.5" ry="6" fill="#b2d8f7" />
        <ellipse cx="90" cy="100" rx="3.5" ry="6" fill="#b2d8f7" />
        {/* Shadow */}
        <ellipse cx="90" cy="175" rx="38" ry="8" fill="#000" opacity="0.10" />
      </svg>
    </div>
  );
} 