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
      marginBottom: '1rem',
      position: 'relative',
      zIndex: 3,
    }}>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        style={{
          fontWeight: 900,
          fontSize: '2.5rem',
          color: '#fff',
          letterSpacing: 2,
          textShadow: '0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.3)',
          textAlign: 'center',
          margin: 0,
          marginBottom: '0.25rem',
          fontFamily: '"Inter", sans-serif',
          textTransform: 'uppercase'
        }}
      >
        Flight-Master
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '1rem',
          fontWeight: 500,
          margin: 0,
          letterSpacing: 1,
          textAlign: 'center'
        }}
      >
        Predict Your Perfect Window Seat
      </motion.p>
    </div>
  );
} 