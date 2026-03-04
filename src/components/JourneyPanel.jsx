import React from 'react';
import { motion } from 'framer-motion';

const GLASS = {
    background: 'rgba(5, 10, 28, 0.72)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
};

const SIDE_COLOR = { left: '#FFCC00', right: '#00C8FF' };
const SIDE_LABEL = { left: 'LEFT WINDOW', right: 'RIGHT WINDOW' };

export default function JourneyPanel({ recommendation, summary }) {
    try {
        const type = String(recommendation?.type || 'none').toLowerCase();
        const accentColor = SIDE_COLOR[type] || '#aaaaaa';
        const sideLabel = SIDE_LABEL[type] || 'CHOOSE WINDOW';

        const srcName = String(summary?.source || 'Departure');
        const dstName = String(summary?.destination || 'Destination');
        const timeStr = String(summary?.time || '');
        const durStr = String(summary?.duration || '');
        const detailStr = String(recommendation?.detail || 'Enjoy your flight!');

        const uvObj = recommendation?.sunburnRisk;
        const uvRisk = uvObj?.level ? String(uvObj.level) : null;
        const uvColor = uvRisk === 'high' ? '#FF5252' : uvRisk === 'medium' ? '#FFB300' : '#69FF8F';
        const golden = Array.isArray(recommendation?.goldenHourEvents) ? recommendation.goldenHourEvents : [];
        const moonSide = recommendation?.moonSide;
        const hasMoon = moonSide && moonSide !== 'none';

        return (
            <motion.div
                initial={{ opacity: 0, x: -24, y: -8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    ...GLASS,
                    position: 'absolute',
                    top: 20, left: 20,
                    minWidth: 260, maxWidth: 320,
                    padding: '18px 22px',
                    zIndex: 30,
                    pointerEvents: 'auto',
                }}
            >
                {/* Route */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.3 }}>
                        {srcName}
                    </span>
                    <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
                        <path d="M0 5h18M14 1l4 4-4 4" stroke={accentColor} strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.3 }}>
                        {dstName}
                    </span>
                </div>

                {/* Date + duration */}
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', fontWeight: 500, letterSpacing: 0.5, marginBottom: 14 }}>
                    {timeStr}{timeStr && durStr ? ' · ' : ''}{durStr ? `${durStr}h flight` : ''}
                </div>

                {/* Seat recommendation (Elevated & Deep) */}
                <div style={{
                    position: 'relative',
                    background: 'rgba(2, 4, 12, 0.4)',
                    boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
                    borderRadius: 12,
                    padding: '16px 16px',
                    marginBottom: 14,
                    overflow: 'hidden',
                }}>
                    {/* Ambient glow from the accent color */}
                    <div style={{
                        position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%',
                        background: `radial-gradient(ellipse at right, ${accentColor}25 0%, transparent 70%)`,
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '0.52rem', color: accentColor, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
                            Recommended Seat
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1 }}>
                                {sideLabel}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '0.66rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4,
                            borderLeft: `2px solid ${accentColor}50`, paddingLeft: 8
                        }}>
                            {detailStr}
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {uvRisk && (
                        <span style={{ background: uvColor + '20', border: `1px solid ${uvColor}50`, color: uvColor, borderRadius: 20, padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700 }}>
                            ☀️ {String(uvRisk).toUpperCase()} UV
                        </span>
                    )}
                    {golden.length > 0 && (
                        <span style={{ background: '#FFB30020', border: '1px solid #FFB30050', color: '#FFB300', borderRadius: 20, padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700 }}>
                            🌅 GOLDEN HOUR ×{golden.length}
                        </span>
                    )}
                    {hasMoon && (
                        <span style={{ background: '#C8B0FF20', border: '1px solid #C8B0FF50', color: '#C8B0FF', borderRadius: 20, padding: '2px 8px', fontSize: '0.6rem', fontWeight: 700 }}>
                            🌙 MOON {String(moonSide).toUpperCase()}
                        </span>
                    )}
                </div>
            </motion.div>
        );
    } catch (err) {
        console.error('JourneyPanel error:', err);
        return null;
    }
}
