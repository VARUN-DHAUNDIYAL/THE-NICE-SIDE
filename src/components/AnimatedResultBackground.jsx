import React from 'react';
import { motion } from 'framer-motion';

function lerpColor(a, b, t) {
  // a, b: [r,g,b], t: 0-1
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
function rgbToStr([r, g, b]) {
  return `rgb(${r},${g},${b})`;
}

// Key colors for the gradient
const sunrise = [255, 160, 72]; // orange
const day = [120, 180, 255]; // blue
const sunset = [255, 120, 72]; // orange-red
const night = [10, 18, 38]; // dark blue-black

function getGradient(dayNight) {
  // 0=sunrise, 0.25=day, 0.5=sunset, 0.75=night, 1=sunrise
  let c1, c2, t;
  if (dayNight < 0.25) {
    c1 = sunrise; c2 = day; t = dayNight / 0.25;
  } else if (dayNight < 0.5) {
    c1 = day; c2 = sunset; t = (dayNight - 0.25) / 0.25;
  } else if (dayNight < 0.75) {
    c1 = sunset; c2 = night; t = (dayNight - 0.5) / 0.25;
  } else {
    c1 = night; c2 = sunrise; t = (dayNight - 0.75) / 0.25;
  }
  return `linear-gradient(135deg, ${rgbToStr(lerpColor(c1, c2, t))} 0%, ${rgbToStr(lerpColor(c2, c1, t))} 100%)`;
}

function Cloud({ style, duration = 40, delay = 0, opacity = 0.18, size = 120, top = '20%' }) {
  return (
    <motion.div
      initial={{ x: '-20vw', opacity }}
      animate={{ x: '120vw', opacity }}
      transition={{ repeat: Infinity, duration, delay, ease: 'linear' }}
      style={{
        position: 'absolute',
        top,
        left: 0,
        width: size,
        height: size * 0.6,
        opacity,
        ...style,
        zIndex: 1,
      }}
    >
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`} fill="none">
        <ellipse cx={size * 0.3} cy={size * 0.3} rx={size * 0.22} ry={size * 0.18} fill="#fff" fillOpacity="0.7" />
        <ellipse cx={size * 0.5} cy={size * 0.22} rx={size * 0.18} ry={size * 0.14} fill="#fff" fillOpacity="0.6" />
        <ellipse cx={size * 0.7} cy={size * 0.32} rx={size * 0.22} ry={size * 0.18} fill="#fff" fillOpacity="0.7" />
      </svg>
    </motion.div>
  );
}

export default function AnimatedResultBackground({ dayNight = 0 }) {
  // Sun/moon arc
  const angle = 180 * dayNight; // 0=sunrise (left), 0.5=sunset (right), 1=next sunrise
  const sunX = 50 + 38 * Math.cos((angle - 90) * Math.PI / 180); // percent
  const sunY = 38 + 24 * Math.sin((angle - 90) * Math.PI / 180);
  const moonX = 50 + 38 * Math.cos((angle + 90) * Math.PI / 180);
  const moonY = 38 + 24 * Math.sin((angle + 90) * Math.PI / 180);
  // Opacity
  const sunOpacity = dayNight < 0.5 ? 1 - dayNight * 2 : 0;
  const moonOpacity = dayNight > 0.5 ? (dayNight - 0.5) * 2 : 0;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      background: getGradient(dayNight),
      transition: 'background 2s',
    }}>
      {/* Sun */}
      <motion.div
        initial={false}
        animate={{
          left: `${sunX}%`,
          top: `${sunY}%`,
          opacity: sunOpacity,
          scale: 1 + 0.08 * Math.sin(dayNight * Math.PI * 2),
        }}
        transition={{ duration: 2, type: 'tween' }}
        style={{
          position: 'absolute',
          width: 160,
          height: 160,
          zIndex: 2,
          filter: 'drop-shadow(0 0 120px #ffe08288) drop-shadow(0 0 60px #ffd70066)',
        }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="60" fill="url(#sunGradient)" />
          <defs>
            <radialGradient id="sunGradient" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#fffde4" />
              <stop offset="80%" stopColor="#ffe082" />
              <stop offset="100%" stopColor="#ffd700" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
      {/* Moon */}
      <motion.div
        initial={false}
        animate={{
          left: `${moonX}%`,
          top: `${moonY}%`,
          opacity: moonOpacity,
          scale: 1 + 0.08 * Math.cos(dayNight * Math.PI * 2),
        }}
        transition={{ duration: 2, type: 'tween' }}
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          zIndex: 2,
          filter: 'drop-shadow(0 0 80px #b0c4de88) drop-shadow(0 0 40px #fff4)',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="44" fill="#e0e7ef" />
          <ellipse cx="70" cy="60" rx="32" ry="44" fill="#b0c4de" />
          <ellipse cx="60" cy="60" rx="44" ry="44" fill="#fff" fillOpacity="0.18" />
        </svg>
      </motion.div>
      {/* Clouds */}
      <Cloud top="22%" size={120} duration={38} delay={0} opacity={0.13} />
      <Cloud top="38%" size={180} duration={52} delay={8} opacity={0.18} />
      <Cloud top="60%" size={140} duration={44} delay={3} opacity={0.15} />
      <Cloud top="75%" size={100} duration={36} delay={12} opacity={0.11} />
      <Cloud top="30%" size={90} duration={28} delay={6} opacity={0.09} />
    </div>
  );
} 