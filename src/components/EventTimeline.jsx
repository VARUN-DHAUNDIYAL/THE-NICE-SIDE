import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const EVENT_COLORS = {
    takeoff: '#00FF88',
    landing: '#FF4081',
    sunrise: '#FFFF33',
    sunset: '#FFB300',
    golden_hour: '#FFD700',
    city: '#00E5FF',
    city_lights: '#00E5FF',
    landmark: '#FFFFFF',
    aurora: '#69ff91',
    turbulence: '#FF7043',
    moon: '#C8B0FF',
};
const EVENT_ICON = {
    takeoff: '✈️',
    landing: '🛬',
    sunrise: '🌅',
    sunset: '🌇',
    golden_hour: '🌟',
    city: '🌃',
    city_lights: '🌃',
    landmark: '📍',
    aurora: '🌌',
    turbulence: '🌪️',
    moon: '🌙',
};

function formatTime(minutes, isTakeoff, isLanding) {
    if (isTakeoff) return 'Takeoff';
    if (isLanding) return 'Land';
    if (minutes == null || isNaN(minutes)) return '';
    const m = Math.round(Number(minutes));
    const absM = Math.abs(m);
    const sign = m < 0 ? '-' : '+';
    const h = Math.floor(absM / 60);
    const rem = absM % 60;
    if (h === 0) return `${sign}${rem}m`;
    return rem > 0 ? `${sign}${h}h ${rem}m` : `${sign}${h}h`;
}

function getMinutes(ev) {
    // Support all field names used by flightCompute events
    const val = ev.minuteOffset ?? ev.minutesFromDeparture ?? ev.minutesMark ?? ev.startMinute ?? null;
    return val != null ? Number(val) : null;
}

function getName(ev) {
    return ev.name || ev.city || ev.label || (ev.type ? ev.type.replace(/_/g, ' ') : '');
}

function getType(ev) {
    return ev.type || ev.kind || 'city';
}

function EventChip({ event, isFirst, isLast }) {
    const type = getType(event);
    const color = EVENT_COLORS[type] || '#aaaaaa';
    const icon = EVENT_ICON[type] || '●';
    const name = getName(event);
    const mins = getMinutes(event);
    const isTakeoff = event._injected && type === 'takeoff';
    const isLanding = event._injected && type === 'landing';
    const timeLabel = formatTime(mins, isTakeoff, isLanding);

    return (
        <div
            title={`${name}${mins != null ? ` — ${timeLabel} into flight` : ''}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                minWidth: 64,
                maxWidth: 80,
                cursor: 'default',
                flexShrink: 0,
            }}
        >
            {/* Icon circle */}
            <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: color + '22',
                border: `1.5px solid ${color}88`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.88rem',
                boxShadow: `0 0 8px ${color}44`,
            }}>
                {icon}
            </div>
            {/* Time */}
            <span style={{ fontSize: '0.58rem', color: color, fontWeight: 700, letterSpacing: 0.3, lineHeight: 1 }}>
                {timeLabel}
            </span>
            {/* Name */}
            <span style={{
                fontSize: '0.6rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500,
                textAlign: 'center', lineHeight: 1.2,
                maxWidth: 72, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
                {name}
            </span>
        </div>
    );
}

export default function EventTimeline({ events = [], flightDurationHours = 1, source, destination }) {
    const scrollRef = useRef();

    // Build a unified, sorted event list
    const allEvents = [];

    // Inject takeoff first
    if (source) {
        allEvents.push({ type: 'takeoff', name: source?.name || 'Takeoff', minuteOffset: 0, _injected: true });
    }

    // Add all real events — normalise to minuteOffset
    events.forEach(ev => {
        const mins = getMinutes(ev);
        allEvents.push({ ...ev, minuteOffset: mins ?? 0 });
    });

    // Inject landing last
    if (destination) {
        allEvents.push({ type: 'landing', name: destination?.name || 'Landing', minuteOffset: Math.round(flightDurationHours * 60), _injected: true });
    }

    // Sort by time, dedupe takeoff/landing collisions
    const sorted = allEvents
        .sort((a, b) => (a.minuteOffset ?? 0) - (b.minuteOffset ?? 0))
        .filter((ev, i, arr) => {
            if (i === 0) return true;
            // Skip if same time and same name as previous
            return !(ev.minuteOffset === arr[i - 1].minuteOffset && getName(ev) === getName(arr[i - 1]));
        });

    if (sorted.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            style={{ flex: 1, minWidth: 0 }}
        >
            <div style={{
                fontSize: '0.52rem', color: 'rgba(255,255,255,0.25)', letterSpacing: 2,
                fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2,
            }}>
                Flight Events · {sorted.length} moments
            </div>

            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: 2,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    position: 'relative',
                }}
            >
                {/* Connecting line (rendered behind everything) */}
                <div style={{
                    position: 'absolute', top: 14,
                    left: 'calc(50% / ' + sorted.length + ')',
                    right: 'calc(50% / ' + sorted.length + ')',
                    height: 1,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.1) 15%, rgba(255,255,255,0.1) 85%, rgba(255,255,255,0.02))',
                    zIndex: 0,
                    pointerEvents: 'none',
                }} />

                {sorted.map((ev, i) => (
                    <div key={ev.id || `${getType(ev)}-${getMinutes(ev)}-${i}`} style={{ zIndex: 1, flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <EventChip
                            event={ev}
                            isFirst={i === 0}
                            isLast={i === sorted.length - 1}
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
