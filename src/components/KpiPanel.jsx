import React from 'react';
import { motion } from 'framer-motion';

const GLASS = {
    background: 'rgba(5, 10, 28, 0.72)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
};

export default function KpiPanel({ recommendation }) {
    try {
        if (!recommendation) return null;

        const jl = recommendation.jetLagData || null;
        const jlSeverity = String(jl?.severity || 'low');
        const jlColor = jlSeverity === 'high' ? '#FF5252' : jlSeverity === 'medium' ? '#FFB300' : '#69FF8F';
        const jlShift = jl?.tzShift != null ? `${jl.tzShift > 0 ? '+' : ''}${jl.tzShift}h TZ shift` : null;

        const noise = recommendation.noiseRecommendation || null;
        const noiseZone = noise?.quietestBand?.label ? String(noise.quietestBand.label) : null;
        const noiseType = recommendation.aircraftType ? String(recommendation.aircraftType) : null;

        const moonSide = recommendation.moonSide;
        const hasMoon = moonSide && moonSide !== 'none';

        const uvObj = recommendation.sunburnRisk || null;
        const uvRisk = uvObj?.level ? String(uvObj.level) : null;
        const uvColor = uvRisk === 'high' ? '#FF5252' : uvRisk === 'medium' ? '#FFB300' : '#69FF8F';

        const aurora = Array.isArray(recommendation.auroraSegments) && recommendation.auroraSegments.length > 0;

        const kpis = [];

        if (jl) kpis.push({
            icon: '🧬', label: 'Jet Lag',
            value: jlSeverity.charAt(0).toUpperCase() + jlSeverity.slice(1) + ' impact',
            color: jlColor, sub: jlShift,
        });

        if (uvRisk) kpis.push({
            icon: '🌡️', label: 'UV Risk',
            value: uvRisk.charAt(0).toUpperCase() + uvRisk.slice(1),
            color: uvColor, sub: 'At cruise altitude',
        });

        if (noiseZone) kpis.push({
            icon: '🔇', label: 'Quietest Zone',
            value: noiseZone,
            color: 'rgba(255,255,255,0.88)', sub: noiseType || 'Based on aircraft',
        });

        if (hasMoon) kpis.push({
            icon: '🌙', label: 'Moon Side',
            value: String(moonSide).charAt(0).toUpperCase() + String(moonSide).slice(1) + ' window',
            color: '#C8B0FF', sub: 'For stargazing at night',
        });

        if (aurora) kpis.push({
            icon: '🌌', label: 'Aurora Zone',
            value: 'Detected on route',
            color: '#69ff91', sub: 'Look for northern lights',
        });

        if (kpis.length === 0) return null;

        return (
            <motion.div
                initial={{ opacity: 0, x: 24, y: -8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                style={{
                    ...GLASS,
                    position: 'absolute',
                    top: 20, right: 20,
                    minWidth: 210, maxWidth: 260,
                    zIndex: 30, pointerEvents: 'auto',
                    overflow: 'hidden',
                }}
            >
                <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.28)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                        Flight Intelligence
                    </span>
                </div>

                {kpis.map((k, i) => (
                    <div
                        key={k.label}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 14px',
                            borderBottom: i < kpis.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                    >
                        <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{k.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.32)', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                                {k.label}
                            </div>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: k.color, lineHeight: 1.2, marginTop: 1 }}>
                                {k.value}
                            </div>
                            {k.sub && (
                                <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>{k.sub}</div>
                            )}
                        </div>
                    </div>
                ))}
            </motion.div>
        );
    } catch (err) {
        console.error('KpiPanel error:', err);
        return null;
    }
}
