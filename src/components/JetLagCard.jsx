/**
 * JetLagCard — Phase 5
 *
 * Shows jet lag severity, timezone shift direction, and a
 * personalised in-flight sleep/wake schedule with timed events.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_STYLE = {
    none: { color: '#69ff91', bg: 'rgba(105,255,145,0.1)', border: 'rgba(105,255,145,0.3)', label: 'No jet lag' },
    mild: { color: '#FFD700', bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', label: 'Mild' },
    moderate: { color: '#ff9800', bg: 'rgba(255,152,0,0.1)', border: 'rgba(255,152,0,0.3)', label: 'Moderate' },
    severe: { color: '#f44336', bg: 'rgba(244,67,54,0.1)', border: 'rgba(244,67,54,0.3)', label: 'Severe' },
};

function formatHour(h) {
    if (h === 0) return 'Takeoff +0';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return `+${hrs}h${mins ? ` ${mins}m` : ''}`;
}

export default function JetLagCard({ jetLagData }) {
    const [open, setOpen] = useState(false);
    if (!jetLagData || jetLagData.severity === 'none') return null;

    const s = SEVERITY_STYLE[jetLagData.severity] || SEVERITY_STYLE.mild;

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={{
                background: s.bg,
                border: `1.5px solid ${s.border}`,
                borderRadius: 18,
                padding: '16px 20px',
                marginTop: 16,
                width: '100%',
                maxWidth: 520,
                boxSizing: 'border-box',
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Header row */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>😴</span>
                    <div>
                        <div style={{ fontWeight: 700, color: s.color, fontSize: '0.92rem' }}>
                            Jet Lag: {s.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
                            {jetLagData.isEastward ? '→ Eastward' : '← Westward'} · {Math.abs(jetLagData.tzShiftHours).toFixed(1)}h shift
                        </div>
                    </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>▼</span>
            </div>

            {/* Tip */}
            {jetLagData.tip && (
                <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 1.45 }}>
                    {jetLagData.tip}
                </div>
            )}

            {/* Collapsible schedule */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {jetLagData.schedule.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}>
                                            {formatHour(item.atHour)} — {item.action}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{item.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
