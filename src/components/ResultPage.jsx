import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import RecommendationCard from './RecommendationCard';
import Confetti from 'react-confetti';
import AnimatedResultBackground from './AnimatedResultBackground';
import FlightMap from './FlightMap';
import html2canvas from 'html2canvas';

export default function ResultPage({ recommendation, summary, onBack, dayNight = 0 }) {
  const resultRef = useRef();
  const [saving, setSaving] = useState(false);

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Determine if confetti should show
  const isPerfect =
    recommendation &&
    (recommendation.type === 'left' || recommendation.type === 'right') &&
    recommendation.detail.includes('80');

  // Share handler
  const handleShare = () => {
    const text = `Flight: ${summary.source} → ${summary.destination}\nDeparture: ${summary.time}\nDuration: ${summary.duration}h\nRecommendation: ${recommendation.rec} - ${recommendation.detail}`;
    if (navigator.share) {
      navigator.share({ title: 'Sun Seat Recommendation', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Recommendation copied to clipboard!');
    }
  };

  // Save as image handler
  const handleSaveImage = async () => {
    if (!resultRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'sun-seat-recommendation.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Failed to save image.');
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={resultRef}
        key="result-page"
        className="result-page-main"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
        style={{
          minHeight: '100vh',
          width: '100vw',
          maxWidth: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          zIndex: 10,
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
          }}
        >
          <AnimatedResultBackground dayNight={dayNight} />
        </div>

        {/* Confetti */}
        {isPerfect && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={180}
            recycle={false}
            gravity={0.18}
          />
        )}

        {/* Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
          style={{
            marginTop: 36,
            marginBottom: 32,
            backgroundColor: 'rgba(255, 255, 255, 0.35)', // more visible
            borderRadius: 18,
            padding: '1.1rem 2.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            zIndex: 12,
            fontWeight: 700,
            fontSize: '1.18rem',
            color: '#fff',
            letterSpacing: 1,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#ffe082', fontWeight: 800, fontSize: '1.25rem' }}>{summary.source}</span>
          <span style={{ fontSize: 22, color: '#fff', margin: '0 8px' }}>→</span>
          <span style={{ color: '#90cdf4', fontWeight: 800, fontSize: '1.25rem' }}>{summary.destination}</span>
          <span
            style={{
              color: '#fff',
              fontWeight: 400,
              fontSize: '1.08rem',
              marginLeft: 18,
            }}
          >
            Departure: <b>{summary.time}</b> &nbsp; | &nbsp; Duration: <b>{summary.duration}h</b>
          </span>
        </motion.div>

        {/* Main Content: Card + Map */}
        <div
          className="result-flex"
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 40,
            width: '100%',
            maxWidth: 1200,
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            zIndex: 11,
          }}
        >
          {/* Recommendation card */}
          <div
            style={{
              flex: 1,
              minWidth: 340,
              maxWidth: 520,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <RecommendationCard
              rec={recommendation.rec}
              detail={recommendation.detail}
              type={recommendation.type}
              summary={summary}
            />
          </div>

          {/* Map */}
          <div
            className="map-container-responsive"
            style={{
              flex: 1,
              minWidth: 340,
              maxWidth: 700,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {recommendation.pathPoints &&
              recommendation.source &&
              recommendation.destination && (
                <FlightMap
                  pathPoints={recommendation.pathPoints}
                  source={recommendation.source}
                  destination={recommendation.destination}
                  recommendedSide={recommendation.type}
                  sunriseSunsetMarkers={recommendation.sunriseSunsetMarkers}
                />
              )}
          </div>
        </div>

        {/* Buttons */}
        <div className="result-buttons" style={{ display: 'flex', gap: 24, marginTop: 36, zIndex: 12 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              borderRadius: 12,
              px: 4,
              boxShadow: '0 2px 12px 0 rgba(221,36,118,0.13)',
            }}
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              borderRadius: 12,
              px: 4,
              border: '2px solid #fff4',
              color: '#fff',
            }}
            onClick={onBack}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            color="success"
            size="large"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              borderRadius: 12,
              px: 4,
              boxShadow: '0 2px 12px 0 rgba(36,221,118,0.13)',
            }}
            onClick={handleSaveImage}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Image'}
          </Button>
        </div>

        {/* Mobile Responsive Styles */}
        <style>{`
          @media (max-width: 900px) {
            .result-flex { flex-direction: column !important; gap: 24px !important; align-items: center !important; }
          }
          @media (max-width: 600px) {
            .map-container-responsive { min-width: 0 !important; width: 100% !important; max-width: 100vw !important; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
