import React from 'react';
import { motion } from 'framer-motion';
import { ArrowBackIosNew, ArrowForwardIos, WbSunny, Cloud, CompareArrows } from '@mui/icons-material';

const iconMap = {
  left: <ArrowBackIosNew style={{ fontSize: 48, color: '#ffe082', marginRight: 16 }} />,
  right: <ArrowForwardIos style={{ fontSize: 48, color: '#90cdf4', marginLeft: 16 }} />,
  equal: <CompareArrows style={{ fontSize: 48, color: '#ffd6e0' }} />,
  none: <Cloud style={{ fontSize: 48, color: '#b0b0b0' }} />,
};
const accentMap = {
  left: 'linear-gradient(90deg, #ffe082 0%, #fffbe6 100%)',
  right: 'linear-gradient(90deg, #90cdf4 0%, #e0e7ef 100%)',
  equal: 'linear-gradient(90deg, #ffd6e0 0%, #e0e7ef 100%)',
  none: 'linear-gradient(90deg, #b0b0b0 0%, #e0e7ef 100%)',
};

export default function RecommendationCard({ rec, detail, type, summary }) {
  return (
    <motion.div
      className="recommendation-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        marginTop: 32,
        background: 'rgba(255,255,255,0.22)',
        borderRadius: 22,
        padding: '2.2rem 2.5rem 2.2rem 2.5rem',
        boxShadow: 'none',
        backdropFilter: 'blur(12px)',
        maxWidth: 520,
        minWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: `2.5px solid #fff4`,
        position: 'relative',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        style={{
          background: accentMap[type] || accentMap.none,
          borderRadius: '50%',
          width: 80,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          boxShadow: 'none',
        }}
      >
        {iconMap[type] || iconMap.none}
      </motion.div>
      <div className="recommendation-title" style={{ fontWeight: 900, fontSize: '2rem', color: '#ffe082', marginBottom: 10, textAlign: 'center', letterSpacing: 1 }}>{rec}</div>
      <div className="recommendation-detail" style={{ fontWeight: 500, fontSize: '1.15rem', color: '#fff', marginBottom: 18, textAlign: 'center' }}>{detail}</div>
      {summary && (
        <div style={{
          background: 'rgba(255,255,255,0.13)',
          borderRadius: 12,
          padding: '0.7rem 1.2rem',
          color: '#fff',
          fontWeight: 500,
          fontSize: '1.05rem',
          marginTop: 6,
          boxShadow: 'none',
          textAlign: 'center',
        }}>
          <span style={{ color: '#ffe082', fontWeight: 700 }}>{summary.source}</span>
          <span style={{ margin: '0 8px', color: '#fff' }}>→</span>
          <span style={{ color: '#90cdf4', fontWeight: 700 }}>{summary.destination}</span>
          <br />
          <span style={{ color: '#fff', fontWeight: 400, fontSize: '0.98rem' }}>
            Departure: <b>{summary.time}</b> &nbsp; | &nbsp; Duration: <b>{summary.duration}h</b>
          </span>
        </div>
      )}
    </motion.div>
  );
} 