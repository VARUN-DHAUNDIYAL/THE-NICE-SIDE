/**
 * WindowMomentTimeline — Phase 8
 *
 * A horizontally scrollable timeline showing every interesting flight event
 * in chronological order: sunrise/sunset, golden hour, city flybys,
 * landmarks, aurora zones, turbulence segments.
 *
 * Each event chip has: icon, label, "at Xh Ym" offset, and optional side badge.
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

// ── Event rendering config ──────────────────────────────────────────────────

const EVENT_CONFIG = {
    sunrise: {
        icon: '🌅', label: 'Sunrise', color: '#FFFF33',
        bg: 'rgba(255,255,51,0.12)', border: 'rgba(255,255,51,0.4)',
    },
    sunset: {
        icon: '🌄', label: 'Sunset', color: '#FFAA00',
        bg: 'rgba(255,170,0,0.12)', border: 'rgba(255,170,0,0.4)',
    },
    golden_hour: {
        icon: '🌇', label: 'Golden Hour', color: '#FFD700',
        bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.4)',
    },
    city: {
        icon: '🌃', label: 'City', color: '#00E5FF',
        bg: 'rgba(0,229,255,0.1)', border: 'rgba(0,229,255,0.35)',
    },
    landmark: {
        icon: '📍', label: 'Landmark', color: '#FFFFFF',
        bg: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.3)',
    },
    aurora: {
        icon: '🌌', label: 'Aurora Zone', color: '#69ff91',
        bg: 'rgba(105,255,145,0.1)', border: 'rgba(105,255,145,0.35)',
    },
    turbulence: {
        icon: '🌪️', label: 'Turbulence', color: '#FF7043',
        bg: 'rgba(255,112,67,0.1)', border: 'rgba(255,112,67,0.35)',
    },
};

function formatMinutes(min) {
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
}

function getConfig(event) {
    // golden_hour subtype
    if (event.type === 'golden_hour') return EVENT_CONFIG.golden_hour;
    return EVENT_CONFIG[event.type] || {
        icon: '✦', label: event.type, color: '#fff',
        bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.25)',
    };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function WindowMomentTimeline({ events = [], flightDurationHours }) {
    const scrollRef = useRef();

    if (!events || events.length === 0) return null;

    const totalMinutes = Math.round(flightDurationHours * 60);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{
                width: '100%',
                maxWidth: 1200,
                margin: '0 auto 32px auto',
                zIndex: 11,
                position: 'relative',
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 12, paddingLeft: 4,
            }}>
                <span style={{ fontSize: 18 }}>🪟</span>
                <span style={{
                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2.2,
                    color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase',
                }}>Window Moment Timeline</span>
                <span style={{
                    fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)',
                    marginLeft: 4, fontWeight: 400,
                }}>· {events.length} events · {formatMinutes(totalMinutes)} flight</span>
            </div>

            {/* Scrollable strip */}
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: 10,
                    paddingTop: 4,
                    paddingLeft: 2,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.18) transparent',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {/* Start cap */}
                <TimelineCap label="Takeoff" icon="✈️" />

                {events.map((evt, i) => {
                    const cfg = getConfig(evt);
                    const minuteOffset = evt.minuteOffset ?? evt.startMinute ?? 0;
                    const name = evt.name || cfg.label;
                    const side = evt.side;
                    const duration = evt.durationMinutes;

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 200, damping: 22 }}
                            style={{
                                flexShrink: 0,
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                borderRadius: 14,
                                padding: '8px 13px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                minWidth: 120,
                                maxWidth: 165,
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                position: 'relative',
                            }}
                        >
                            {/* Connector line */}
                            <div style={{
                                position: 'absolute', top: '50%', left: -6,
                                width: 11, height: 2,
                                background: `${cfg.color}55`,
                                transform: 'translateY(-50%)',
                            }} />

                            {/* Icon + time */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                                <span style={{
                                    fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)',
                                    fontVariantNumeric: 'tabular-nums', fontWeight: 600,
                                }}>
                                    {formatMinutes(minuteOffset)}
                                </span>
                            </div>

                            {/* Label */}
                            <div style={{
                                fontSize: '0.76rem', fontWeight: 700,
                                color: cfg.color, lineHeight: 1.2, wordBreak: 'break-word',
                            }}>
                                {name}
                            </div>

                            {/* Side badge */}
                            {side && (
                                <div style={{
                                    fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)',
                                    fontWeight: 600, letterSpacing: 0.5,
                                }}>
                                    Look {side.toUpperCase()}
                                </div>
                            )}

                            {/* Duration (turbulence / aurora) */}
                            {duration && (
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)' }}>
                                    ~{formatMinutes(duration)}
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {/* End cap */}
                <TimelineCap label="Landing" icon="🛬" />
            </div>
        </motion.div>
    );
}

function TimelineCap({ label, icon }) {
    return (
        <div style={{
            flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4,
            minWidth: 56,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: '8px 10px',
        }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
        </div>
    );
}
