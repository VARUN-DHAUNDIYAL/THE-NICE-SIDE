import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimePicker({ value, onChange, placeholder = 'Pick time' }) {
    const [open, setOpen] = useState(false);
    const [hour, setHour] = useState(null);
    const [minute, setMinute] = useState(null);
    const [ampm, setAmpm] = useState('AM');
    const [phase, setPhase] = useState('hour');
    const ref = useRef(null);

    useEffect(() => {
        if (value && /^\d{2}:\d{2}$/.test(value)) {
            let h = parseInt(value.split(':')[0]);
            const m = parseInt(value.split(':')[1]);
            const ap = h >= 12 ? 'PM' : 'AM';
            if (h > 12) h -= 12;
            if (h === 0) h = 12;
            setHour(h); setMinute(m); setAmpm(ap);
        }
    }, []);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, []);

    const emit = (h, m, ap) => {
        let h24 = h;
        if (ap === 'PM' && h !== 12) h24 = h + 12;
        if (ap === 'AM' && h === 12) h24 = 0;
        onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    };

    const pickHour = (h) => { setHour(h); setPhase('minute'); if (minute !== null) emit(h, minute, ampm); };
    const pickMinute = (m) => { setMinute(m); emit(hour || 12, m, ampm); setOpen(false); };
    const toggleAMPM = (ap) => { setAmpm(ap); if (hour !== null && minute !== null) emit(hour, minute, ap); };

    const displayValue = hour !== null && minute !== null
        ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`
        : '';

    const hours12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    function Dial({ items, onSelect, selected, fmt }) {
        const R = 72;
        const CX = 90, CY = 90;
        return (
            <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', zIndex: 2 }} />
                {selected !== null && (() => {
                    const idx = items.indexOf(selected);
                    const ang = (idx / items.length) * 2 * Math.PI - Math.PI / 2;
                    const ex = CX + R * Math.cos(ang), ey = CY + R * Math.sin(ang);
                    return (
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            <line x1={CX} y1={CY} x2={ex} y2={ey} stroke="rgba(0,229,255,0.35)" strokeWidth="1.5" strokeDasharray="3 3" />
                        </svg>
                    );
                })()}
                {items.map((item, i) => {
                    const ang = (i / items.length) * 2 * Math.PI - Math.PI / 2;
                    const x = CX + R * Math.cos(ang);
                    const y = CY + R * Math.sin(ang);
                    const isActive = selected === item;
                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onSelect(item)}
                            style={{
                                position: 'absolute', left: x, top: y,
                                transform: 'translate(-50%, -50%)',
                                width: 32, height: 32, borderRadius: '50%',
                                background: isActive ? 'linear-gradient(135deg,#00c8ff,#a855f7)' : 'rgba(255,255,255,0.05)',
                                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.09)',
                                color: '#fff', fontWeight: isActive ? 800 : 500, fontSize: '0.72rem',
                                cursor: 'pointer', fontFamily: 'inherit',
                                boxShadow: isActive ? '0 0 12px rgba(0,229,255,0.4)' : 'none',
                                zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                            {fmt ? fmt(item) : item}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
            {/* Trigger — div not button so it can't trigger form submit */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => { setOpen(o => !o); setPhase('hour'); }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setOpen(o => !o); setPhase('hour'); } }}
                style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: open ? 'rgba(0,229,255,0.07)' : 'rgba(255,255,255,0.04)',
                    border: open ? '1px solid rgba(0,229,255,0.55)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: open ? '0 0 12px rgba(0,229,255,0.15)' : 'none',
                    color: displayValue ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontSize: '0.85rem', fontWeight: displayValue ? 600 : 400,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                    transition: 'all 0.2s', fontFamily: 'inherit',
                }}
            >
                <span style={{ opacity: 0.5 }}>🕐</span>
                <span style={{ flex: 1 }}>{displayValue || placeholder}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d={open ? 'M1 7L5 3L9 7' : 'M1 3L5 7L9 3'} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>

            {/* Clock popup — opens UPWARD */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 8px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999,
                            background: 'rgba(7, 14, 38, 0.97)',
                            backdropFilter: 'blur(28px)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: '18px',
                            padding: '16px 16px 14px',
                            boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
                            width: 220,
                            fontFamily: 'inherit',
                        }}
                    >
                        {/* Current selection header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 12 }}>
                            <button type="button" onClick={() => setPhase('hour')} style={{
                                background: phase === 'hour' ? 'rgba(0,229,255,0.14)' : 'transparent',
                                border: phase === 'hour' ? '1px solid rgba(0,229,255,0.45)' : '1px solid transparent',
                                color: '#fff', fontWeight: 800, fontSize: '1.4rem',
                                padding: '2px 8px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                                {hour !== null ? String(hour).padStart(2, '0') : '--'}
                            </button>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', marginTop: -2 }}>:</span>
                            <button type="button" onClick={() => setPhase('minute')} style={{
                                background: phase === 'minute' ? 'rgba(0,229,255,0.14)' : 'transparent',
                                border: phase === 'minute' ? '1px solid rgba(0,229,255,0.45)' : '1px solid transparent',
                                color: '#fff', fontWeight: 800, fontSize: '1.4rem',
                                padding: '2px 8px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                                {minute !== null ? String(minute).padStart(2, '0') : '--'}
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 3 }}>
                                {['AM', 'PM'].map(ap => (
                                    <button type="button" key={ap} onClick={() => toggleAMPM(ap)} style={{
                                        background: ampm === ap ? 'rgba(0,229,255,0.14)' : 'transparent',
                                        border: ampm === ap ? '1px solid rgba(0,229,255,0.45)' : '1px solid rgba(255,255,255,0.08)',
                                        color: ampm === ap ? '#00e5ff' : 'rgba(255,255,255,0.4)',
                                        fontWeight: 700, fontSize: '0.58rem', padding: '2px 5px',
                                        borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit',
                                    }}>{ap}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.6rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                            {phase === 'hour' ? 'Select hour' : 'Select minute'}
                        </div>

                        {/* Dial */}
                        <AnimatePresence mode="wait">
                            <motion.div key={phase}
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.13 }}
                            >
                                {phase === 'hour'
                                    ? <Dial items={hours12} onSelect={pickHour} selected={hour} />
                                    : <Dial items={minutes} onSelect={pickMinute} selected={minute} fmt={m => String(m).padStart(2, '0')} />
                                }
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
