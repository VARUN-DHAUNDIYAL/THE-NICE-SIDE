import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      position: 'relative',
      zIndex: 3,
    }}>
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
        style={{
          fontWeight: 900,
          fontSize: '2rem',
          color: '#fff',
          letterSpacing: 1,
          textShadow: '0 2px 8px rgba(30,60,114,0.18)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Perfect Sun Set Seat Predictor
      </motion.h1>
    </div>
  );
} 