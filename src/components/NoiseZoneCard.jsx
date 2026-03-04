/**
 * NoiseZoneCard — Phase 10
 *
 * Visualises per-row-band noise levels for the selected aircraft,
 * recommends the quietest zone, and cross-references it with
 * the sun-side recommendation for a combined optimal seat hint.
 */
import React from 'react';
import { motion } from 'framer-motion';

const SCORE_COLOURS = ['', '#69ff91', '#b5ff6e', '#FFD700', '#ff9800', '#f44336'];
const SCORE_LABELS = ['', 'Quiet', 'Quiet', 'Moderate', 'Loud', 'Very Loud'];

export default function NoiseZoneCard({ noiseRecommendation }) {
    if (!noiseRecommendation) return null;

    const { label, bands, combined, loudestZone, quietestZone } = noiseRecommendation;

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            style={{
                background: 'rgba(0,229,255,0.07)',
                border: '1.5px solid rgba(0,229,255,0.25)',
                borderRadius: 18,
                padding: '16px 20px',
                marginTop: 16,
                width: '100%',
                maxWidth: 520,
                boxSizing: 'border-box',
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>🔇</span>
                <div>
                    <div style={{ fontWeight: 700, color: '#00E5FF', fontSize: '0.92rem' }}>Seat Noise Zones</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{label}</div>
                </div>
            </div>

            {/* Noise bar per band */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {bands.map((band, i) => {
                    const colour = SCORE_COLOURS[band.score];
                    const pct = (band.score / 5) * 100;
                    const isQuietest = band.label === quietestZone;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                fontSize: '0.68rem', color: isQuietest ? '#69ff91' : 'rgba(255,255,255,0.6)',
                                fontWeight: isQuietest ? 700 : 400, width: 95, flexShrink: 0,
                            }}>
                                {isQuietest ? '✓ ' : ''}{band.label}
                            </div>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 6, height: 7 }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: 0.7 + i * 0.07, duration: 0.4 }}
                                    style={{ height: '100%', borderRadius: 6, background: colour }}
                                />
                            </div>
                            <div style={{ fontSize: '0.62rem', color, fontWeight: 600, width: 52, textAlign: 'right' }}>
                                {SCORE_LABELS[band.score]}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Combined tip */}
            <div style={{
                background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
                borderRadius: 10, padding: '8px 12px',
                fontSize: '0.75rem', color: '#00E5FF', fontWeight: 600, lineHeight: 1.45,
            }}>
                🎯 {combined}
            </div>
        </motion.div>
    );
}
