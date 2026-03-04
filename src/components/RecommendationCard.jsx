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

const GOLDEN_HOUR_LABELS = {
  departure_sunrise: { icon: '🌅', label: 'Sunrise at departure' },
  departure_golden_hour: { icon: '🌇', label: 'Golden hour at departure' },
  arrival_sunrise: { icon: '🌅', label: 'Sunrise at arrival' },
  arrival_golden_hour: { icon: '🌇', label: 'Golden hour at arrival' },
};

const UV_COLOURS = { low: '#4caf50', moderate: '#ff9800', high: '#f44336' };

export default function RecommendationCard({ rec, detail, type, summary, goldenHourEvents = [], sunburnRisk }) {
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
        padding: '2.2rem 2.5rem',
        backdropFilter: 'blur(12px)',
        maxWidth: 520,
        minWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '2.5px solid #fff4',
        position: 'relative',
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        style={{
          background: accentMap[type] || accentMap.none,
          borderRadius: '50%',
          width: 80, height: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        {iconMap[type] || iconMap.none}
      </motion.div>

      {/* Headline */}
      <div style={{ fontWeight: 900, fontSize: '2rem', color: '#ffe082', marginBottom: 10, textAlign: 'center', letterSpacing: 1 }}>{rec}</div>
      <div style={{ fontWeight: 500, fontSize: '1.15rem', color: '#fff', marginBottom: 14, textAlign: 'center' }}>{detail}</div>

      {/* ── Phase 1: Golden Hour Badges ── */}
      {goldenHourEvents.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
          {goldenHourEvents.map((evt, i) => {
            const meta = GOLDEN_HOUR_LABELS[evt.type] || { icon: '🌇', label: evt.type };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                style={{
                  background: 'linear-gradient(90deg, rgba(255,213,79,0.22) 0%, rgba(255,152,0,0.18) 100%)',
                  border: '1px solid rgba(255,213,79,0.45)',
                  borderRadius: 20,
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  color: '#ffe082',
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                {evt.city && <span style={{ opacity: 0.7 }}>· {evt.city}</span>}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Phase 4: Sunburn Risk ── */}
      {sunburnRisk && sunburnRisk.level !== 'low' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: `${UV_COLOURS[sunburnRisk.level]}22`,
            border: `1px solid ${UV_COLOURS[sunburnRisk.level]}66`,
            borderRadius: 12,
            padding: '6px 14px',
            fontSize: '0.8rem',
            color: UV_COLOURS[sunburnRisk.level],
            fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 7,
            marginBottom: 10,
          }}
        >
          <span>☀️</span>
          <span>
            UV risk: <b style={{ textTransform: 'capitalize' }}>{sunburnRisk.level}</b>
            {' '}— {sunburnRisk.exposedMinutes} min direct sun ({sunburnRisk.uvEquivalentMinutes} min ground-equivalent at altitude)
          </span>
        </motion.div>
      )}

      {/* Flight summary */}
      {summary && (
        <div style={{
          background: 'rgba(255,255,255,0.13)',
          borderRadius: 12,
          padding: '0.7rem 1.2rem',
          color: '#fff',
          fontWeight: 500,
          fontSize: '1.05rem',
          marginTop: 6,
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