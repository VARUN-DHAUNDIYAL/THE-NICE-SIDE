import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlightGlobe from './FlightGlobe';
import JourneyPanel from './JourneyPanel';
import KpiPanel from './KpiPanel';
import EventTimeline from './EventTimeline';
import FlightStoryCard from './FlightStoryCard';
import html2canvas from 'html2canvas';

// Glassmorphism token
const GLASS = {
  background: 'rgba(5, 10, 28, 0.72)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.10)',
};

export default function ResultPage({ recommendation, summary, onBack }) {
  const [vpSize, setVpSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [showStory, setShowStory] = useState(false);
  const [saving, setSaving] = useState(false);
  const storyRef = useRef();

  // Keep viewport size fresh on resize
  useEffect(() => {
    const fn = () => setVpSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Hide the buttons momentarily
      const btnContainer = document.getElementById('dashboard-actions');
      if (btnContainer) btnContainer.style.opacity = '0';

      await new Promise(r => setTimeout(r, 150));

      // Capture the actual viewport (which includes the WebGL globe because we'll add preserveDrawingBuffer)
      const canvas = await html2canvas(document.body, {
        backgroundColor: '#040810',
        scale: 2,
        useCORS: true
      });

      // Use toBlob instead of toDataURL to prevent URL length limits corrupting the file
      await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Failed to generate image blob'));
          const link = document.createElement('a');
          link.download = `flight-dashboard-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
          resolve();
        }, 'image/png');
      });

      if (btnContainer) btnContainer.style.opacity = '1';
    } catch (e) {
      console.error('Failed to save dashboard screenshot:', e);
      // Ensure buttons reappear even if error occurred
      const btnContainer = document.getElementById('dashboard-actions');
      if (btnContainer) btnContainer.style.opacity = '1';
    } finally {
      setSaving(false);
    }
  };

  if (!recommendation) return null;

  const hasGlobe = recommendation.pathPoints?.length >= 2;
  const timelineEvents = recommendation.timelineEvents || [];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      width: '100vw', height: '100vh',
      overflow: 'hidden',
      background: '#040810',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* ── Full-screen Globe ── */}
      {hasGlobe && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <FlightGlobe
            pathPoints={recommendation.pathPoints}
            source={recommendation.source}
            destination={recommendation.destination}
            recommendedSide={recommendation.type}
            sunriseSunsetMarkers={recommendation.sunriseSunsetMarkers}
            cityFlybys={recommendation.cityFlybys || []}
            landmarkAlerts={recommendation.landmarkAlerts || []}
            auroraSegments={recommendation.auroraSegments || []}
            turbulenceSegments={recommendation.turbulenceSegments || []}
            moonLat={recommendation.moonLat}
            moonLon={recommendation.moonLon}
            width={vpSize.w}
            height={vpSize.h}
          />
        </div>
      )}

      {/* ── Edge vignettes for depth ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(4,8,16,0.7) 100%)',
      }} />

      {/* ── Top-left: Journey Summary ── */}
      <JourneyPanel recommendation={recommendation} summary={summary} />

      {/* ── Top-right: KPI Panel ── */}
      <KpiPanel recommendation={recommendation} />

      {/* ── Bottom HUD bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          zIndex: 30,
          padding: '16px 20px 20px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 16,
          ...GLASS,
          borderRadius: '24px 24px 0 0',
          borderBottom: 'none',
          background: 'rgba(4, 8, 22, 0.80)',
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            flexShrink: 0,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            color: 'rgba(255,255,255,0.7)',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}
        >
          ← New Flight
        </button>

        {/* Event Timeline — always shown, injects takeoff/landing */}
        <EventTimeline
          events={timelineEvents}
          flightDurationHours={parseFloat(summary?.duration || 8)}
          source={recommendation.source}
          destination={recommendation.destination}
        />

        {/* Action buttons */}
        <div id="dashboard-actions" style={{ flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center', transition: 'opacity 0.2s' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            title="Save flight story"
            style={{
              background: saving ? 'rgba(0,200,255,0.1)' : 'rgba(0,200,255,0.12)',
              border: '1px solid rgba(0,200,255,0.3)',
              borderRadius: 10,
              color: '#00C8FF',
              padding: '8px 14px',
              cursor: saving ? 'wait' : 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {saving ? '⏳' : '💾'} {saving ? 'Saving…' : 'Save Story'}
          </button>
        </div>
      </motion.div>

      {/* Hidden story card for export */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: showStory ? 1 : 0, pointerEvents: 'none' }}>
        <div ref={storyRef}>
          <FlightStoryCard recommendation={recommendation} summary={summary} />
        </div>
      </div>
    </div>
  );
}
