/**
 * FlightStoryCard — Phase 11
 *
 * A beautiful, shareable summary card that wraps up the entire
 * flight intelligence computed — great for social sharing or screenshots.
 *
 * Shows: route, date, seat side, key highlights (golden hour, aurora, landmark count, etc.)
 * User can download as PNG via html2canvas.
 */
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

const SIDE_EMOJI = { left: '⬅️', right: '➡️', equal: '↔️', none: '🌙' };
const SIDE_COLOUR = { left: '#ffe082', right: '#90cdf4', equal: '#ffd6e0', none: '#b0b0b0' };

function Stat({ icon, label, value, colour = '#fff' }) {
    return (
        <div style={{ textAlign: 'center', minWidth: 60 }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: colour }}>{value}</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', marginTop: 1, fontWeight: 500 }}>{label}</div>
        </div>
    );
}

export default function FlightStoryCard({ recommendation, summary }) {
    const cardRef = useRef();
    const [saving, setSaving] = useState(false);

    if (!recommendation || !summary) return null;

    const {
        type, goldenHourEvents = [], landmarkAlerts = [], cityFlybys = [],
        auroraSegments = [], turbulenceSegments = [], moonSide, sunburnRisk,
    } = recommendation;

    const sideColour = SIDE_COLOUR[type] || '#fff';
    const sideEmoji = SIDE_EMOJI[type] || '🪑';

    const highlights = [
        goldenHourEvents.length > 0 && { icon: '🌇', text: `Golden hour at ${goldenHourEvents[0]?.city || 'route'}` },
        auroraSegments.length > 0 && { icon: '🌌', text: `Aurora zone (~${auroraSegments[0].maxLat}°N)` },
        landmarkAlerts.length > 0 && { icon: '📍', text: `${landmarkAlerts.length} landmark${landmarkAlerts.length > 1 ? 's' : ''}: ${landmarkAlerts.slice(0, 2).map(l => l.name).join(', ')}` },
        cityFlybys.length > 0 && { icon: '🌃', text: `Flies over ${cityFlybys.length} city${cityFlybys.length > 1 ? ' lights' : ''}` },
        moonSide && moonSide !== 'none' && { icon: '🌙', text: `Moon on your ${moonSide} side at night` },
        turbulenceSegments.length > 0 && { icon: '🌪️', text: `${turbulenceSegments.length} turbulence zone${turbulenceSegments.length > 1 ? 's' : ''} ahead` },
        sunburnRisk && sunburnRisk.level !== 'low' && { icon: '☀️', text: `UV risk: ${sunburnRisk.level} — apply sunscreen` },
    ].filter(Boolean);

    const handleDownload = async () => {
        if (!cardRef.current || saving) return;
        setSaving(true);
        try {
            const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
            const link = document.createElement('a');
            link.download = `flight-${summary.source}-to-${summary.destination}.png`.replace(/\s+/g, '-');
            link.href = canvas.toDataURL('image/png');
            link.click();
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            style={{ width: '100%', maxWidth: 520, marginTop: 16 }}
        >
            {/* Downloadable card */}
            <div
                ref={cardRef}
                style={{
                    background: 'linear-gradient(135deg, rgba(15,15,35,0.97) 0%, rgba(25,25,60,0.97) 100%)',
                    borderRadius: 22, padding: '24px 24px 20px', boxSizing: 'border-box',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    position: 'relative', overflow: 'hidden',
                }}
            >
                {/* Glow blob */}
                <div style={{
                    position: 'absolute', width: 220, height: 220, borderRadius: '50%',
                    background: `radial-gradient(circle, ${sideColour}22 0%, transparent 70%)`,
                    top: -60, right: -60, pointerEvents: 'none',
                }} />

                {/* App branding */}
                <div style={{ fontSize: '0.65rem', letterSpacing: 2.5, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 14 }}>
                    The Nice Side · Flight Intelligence
                </div>

                {/* Route */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#ffe082' }}>{summary.source}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem' }}>→</span>
                    <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#90cdf4' }}>{summary.destination}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>
                    {summary.time} · {summary.duration}h flight
                </div>

                {/* Main rec */}
                <div style={{
                    background: `${sideColour}18`, border: `1px solid ${sideColour}44`,
                    borderRadius: 12, padding: '10px 14px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <span style={{ fontSize: 22 }}>{sideEmoji}</span>
                    <div>
                        <div style={{ fontWeight: 800, color: sideColour, fontSize: '1rem' }}>
                            {type === 'left' ? 'Sit LEFT' : type === 'right' ? 'Sit RIGHT' : type === 'equal' ? 'Either side' : 'Night flight'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Best window seat for sun</div>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16, gap: 4 }}>
                    <Stat icon="📍" label="Landmarks" value={landmarkAlerts.length} colour="#FFFFFF" />
                    <Stat icon="🌃" label="City lights" value={cityFlybys.length} colour="#00E5FF" />
                    <Stat icon="🌌" label="Aurora" value={auroraSegments.length > 0 ? 'Yes!' : 'No'} colour="#69ff91" />
                    <Stat icon="🌪️" label="Turb. zones" value={turbulenceSegments.length} colour="#FF7043" />
                </div>

                {/* Highlights */}
                {highlights.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 6 }}>
                        {highlights.map((h, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>
                                <span>{h.icon}</span><span>{h.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: 12, fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: 0.8 }}>
                    theniceside.app · Your smart flight companion ✈️
                </div>
            </div>

            {/* Download button */}
            <button
                onClick={handleDownload}
                disabled={saving}
                style={{
                    marginTop: 10, width: '100%', padding: '10px 0', borderRadius: 14,
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s', opacity: saving ? 0.5 : 1,
                }}
            >
                <span>{saving ? '⏳' : '💾'}</span>
                <span>{saving ? 'Saving…' : 'Save Story Card as Image'}</span>
            </button>
        </motion.div>
    );
}
