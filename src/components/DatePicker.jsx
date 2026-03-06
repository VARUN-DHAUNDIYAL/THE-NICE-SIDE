import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

export default function DatePicker({ value, onChange, placeholder = 'Pick date' }) {
    const today = new Date();
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const ref = useRef(null);

    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, []);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const selectDay = (day) => {
        const mm = String(viewMonth + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        onChange(`${viewYear}-${mm}-${dd}`);
        setOpen(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const displayValue = selectedDate
        ? selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

    return (
        <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
            {/* Trigger — div so it never submits the form */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(o => !o)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o); }}
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
                <span style={{ opacity: 0.5 }}>📅</span>
                <span style={{ flex: 1 }}>{displayValue || placeholder}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d={open ? 'M1 7L5 3L9 7' : 'M1 3L5 7L9 3'} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>

            {/* Calendar — opens UPWARD */}
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
                            left: 0,
                            zIndex: 9999,
                            background: 'rgba(7, 14, 38, 0.97)',
                            backdropFilter: 'blur(28px)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: '16px',
                            padding: '14px 14px 12px',
                            boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
                            width: 248,
                            fontFamily: 'inherit',
                        }}
                    >
                        {/* Month navigation — type=button is critical */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <button type="button" onClick={prevMonth} style={navStyle}>‹</button>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>
                                {MONTHS[viewMonth]} {viewYear}
                            </span>
                            <button type="button" onClick={nextMonth} style={navStyle}>›</button>
                        </div>

                        {/* Day-of-week headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                            {DAYS.map(d => (
                                <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', fontWeight: 700, padding: '2px 0', letterSpacing: '0.04em' }}>{d}</div>
                            ))}
                        </div>

                        {/* Day grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                            {blanks.map((_, i) => <div key={`b${i}`} />)}
                            {days.map(day => {
                                const isSelected = selectedDate &&
                                    selectedDate.getFullYear() === viewYear &&
                                    selectedDate.getMonth() === viewMonth &&
                                    selectedDate.getDate() === day;
                                const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => selectDay(day)}
                                        style={{
                                            padding: '5px 0',
                                            borderRadius: '7px',
                                            border: isToday && !isSelected ? '1px solid rgba(0,229,255,0.35)' : '1px solid transparent',
                                            background: isSelected ? 'linear-gradient(135deg,#00c8ff,#a855f7)' : 'transparent',
                                            color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)',
                                            fontSize: '0.75rem',
                                            fontWeight: isSelected || isToday ? 700 : 400,
                                            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const navStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '7px',
    color: 'rgba(255,255,255,0.6)',
    width: 28, height: 28,
    cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};
