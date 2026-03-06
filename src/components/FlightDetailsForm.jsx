import React, { useState, useRef } from 'react';
import { Autocomplete, TextField, InputAdornment, Slider, createTheme, ThemeProvider } from '@mui/material';
import { FlightTakeoff, FlightLand } from '@mui/icons-material';
import { searchAirports } from '../utils/airportSearch';
import { AIRCRAFT_OPTIONS } from '../data/aircraftNoise';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

// ─────────────────────────────────────────────────────────────────────────────
// Dark MUI theme so Autocomplete dropdown is dark (fixes white bg bug)
// ─────────────────────────────────────────────────────────────────────────────
const darkTheme = createTheme({
  palette: { mode: 'dark' },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          background: 'rgba(8, 18, 48, 0.97)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          marginTop: 4,
          overflow: 'hidden',
        },
        option: {
          padding: '10px 14px !important',
          borderRadius: '8px',
          margin: '2px 4px',
          '&:hover': {
            background: 'rgba(0,229,255,0.08) !important',
          },
          '&[aria-selected="true"]': {
            background: 'rgba(0,229,255,0.12) !important',
          },
        },
        listbox: {
          padding: '6px',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.15)', borderRadius: 2 },
        },
        noOptions: { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '12px 16px' },
        loading: { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', padding: '12px 16px' },
        clearIndicator: { color: 'rgba(255,255,255,0.4)' },
        popupIndicator: { color: 'rgba(255,255,255,0.4)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.92rem',
          transition: 'all 0.2s',
          '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(255,255,255,0.08) !important' },
          '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(255,255,255,0.18) !important' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: '1px solid rgba(0,229,255,0.6) !important',
            boxShadow: '0 0 14px rgba(0,229,255,0.2)',
          },
          '&.Mui-focused': { background: 'rgba(0,229,255,0.05)' },
        },
        input: { padding: '11px 14px !important', color: '#fff' },
      },
    },
  },
});

// Design tokens
const C = {
  glass: 'rgba(6, 12, 30, 0.65)',
  border: 'rgba(255,255,255,0.07)',
  borderFocus: 'rgba(0,229,255,0.6)',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.5)',
  accent: '#00e5ff',
  surface: 'rgba(255,255,255,0.04)',
};

const Label = ({ children, sub }) => (
  <div style={{ marginBottom: 5 }}>
    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {children}
    </span>
    {sub && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', marginLeft: 5 }}>{sub}</span>}
  </div>
);

const CHRONOTYPE_OPTIONS = [
  { value: 'morning', emoji: '🌅', label: 'Early Bird', desc: 'Up by dawn' },
  { value: 'neutral', emoji: '🕐', label: 'Flexible', desc: 'Neutral' },
  { value: 'night', emoji: '🦉', label: 'Night Owl', desc: 'Late nights' },
];

function CityField({ label, icon, accentColor, onSelect }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const timer = useRef(null);

  const handleInput = async (_, value) => {
    if (timer.current) clearTimeout(timer.current);
    if (!value || value.length < 2) { setOptions([]); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      setOptions(await searchAirports(value));
      setLoading(false);
    }, 200);
  };

  const handleChange = (_, value) => {
    setSelected(value);
    if (!value || !value.lat || !value.lon) { onSelect(null); return; }
    const name = value.display_name?.split(',')[0]?.trim() || value.name;
    onSelect({ ...value, display_name: name, lat: parseFloat(value.lat), lon: parseFloat(value.lon) });
  };

  return (
    <div>
      <Label>{label}</Label>
      <ThemeProvider theme={darkTheme}>
        <Autocomplete
          freeSolo
          filterOptions={(x) => x}
          options={options}
          loading={loading}
          onInputChange={handleInput}
          onChange={handleChange}
          getOptionLabel={(opt) =>
            typeof opt === 'string' ? opt
              : opt.type === 'airport'
                ? `${opt.name} (${opt.iata_code || opt.icao_code}), ${opt.city}, ${opt.country}`
                : `${opt.name}, ${opt.country}`
          }
          renderOption={(props, opt) => (
            <li {...props} key={opt.id}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{opt.type === 'airport' ? '✈️' : '🌆'}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {opt.name}
                    {opt.iata_code && <span style={{ color: accentColor, marginLeft: 6, fontSize: '0.72rem' }}>{opt.iata_code}</span>}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {[opt.city, opt.country].filter(Boolean).join(', ')}
                  </div>
                </span>
              </span>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search cities or airports…"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    {React.cloneElement(icon, { style: { color: accentColor, fontSize: '1rem' } })}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </ThemeProvider>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
const FlightDetailsForm = function ({
  onSubmit, onSourceSelect, onDestinationSelect, onFlightTimeChange,
}, ref) {
  const [sourceCity, setSourceCity] = useState(null);
  const [destinationCity, setDestinationCity] = useState(null);
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [flightTime, setFlightTime] = useState(7);
  const [chronotype, setChronotype] = useState('neutral');
  const [aircraftType, setAircraftType] = useState('unknown');

  React.useImperativeHandle(ref, () => ({ scrollIntoView: () => { } }));

  const handleSourceSelect = (data) => { setSourceCity(data); if (onSourceSelect) onSourceSelect(data); };
  const handleDestinationSelect = (data) => { setDestinationCity(data); if (onDestinationSelect) onDestinationSelect(data); };
  const handleSlider = (_, val) => { setFlightTime(val); if (onFlightTimeChange) onFlightTimeChange(val); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sourceCity || !destinationCity || !departureDate || !departureTime) {
      alert('Please fill in all required fields');
      return;
    }
    // Convert 12h time stored as HH:MM (already 24h from TimePicker)
    const departureDateTime = `${departureDate}T${departureTime}`;
    onSubmit({
      sourceCoords: { lat: sourceCity.lat, lon: sourceCity.lon },
      destinationCoords: { lat: destinationCity.lat, lon: destinationCity.lon },
      flightTime,
      departureDateTime,
      sourceCity: { ...sourceCity, display_name: sourceCity.display_name?.split(',')[0]?.trim() },
      destinationCity: { ...destinationCity, display_name: destinationCity.display_name?.split(',')[0]?.trim() },
      chronotype,
      aircraftType,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{
          background: C.glass,
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: `1px solid ${C.border}`,
          borderRadius: '20px',
          overflow: 'visible',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>

          {/* ── Minimal header strip ─────────────────────────────────────── */}
          <div style={{
            padding: '9px 18px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
              ✈  Flight Planner
            </span>
          </div>

          {/* ── Form body ───────────────────────────────────────────────── */}
          <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Row 1: From → To */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 30px 1fr', gap: 8, alignItems: 'end' }}>
              <CityField label="From" icon={<FlightTakeoff />} accentColor="#00ff88" onSelect={handleSourceSelect} />
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: C.surface, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginBottom: 1, flexShrink: 0,
              }}>⇄</div>
              <CityField label="To" icon={<FlightLand />} accentColor="#ff3377" onSelect={handleDestinationSelect} />
            </div>

            {/* Row 2: Date | Time | Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <Label>Date</Label>
                <DatePicker value={departureDate} onChange={setDepartureDate} placeholder="Pick date" />
              </div>
              <div>
                <Label>Time</Label>
                <TimePicker value={departureTime} onChange={setDepartureTime} placeholder="Pick time" />
              </div>
              <div>
                <Label>Duration</Label>
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: '12px', padding: '8px 12px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: C.accent, fontWeight: 800, fontSize: '0.95rem' }}>{flightTime}h</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem' }}>1 – 24h</span>
                  </div>
                  <Slider
                    value={flightTime}
                    min={1} max={24} step={0.5}
                    onChange={handleSlider}
                    sx={{
                      py: 0.4,
                      color: C.accent,
                      '& .MuiSlider-thumb': { width: 12, height: 12, '&:hover': { boxShadow: '0 0 8px rgba(0,229,255,0.5)' } },
                      '& .MuiSlider-rail': { opacity: 0.2 },
                      '& .MuiSlider-valueLabel': { display: 'none' },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Sleep style + Aircraft */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Chronotype */}
              <div>
                <Label sub="sleep type">Style</Label>
                <div style={{ display: 'flex', gap: 5 }}>
                  {CHRONOTYPE_OPTIONS.map(opt => {
                    const active = chronotype === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        type="button"
                        onClick={() => setChronotype(opt.value)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                          flex: 1, padding: '8px 4px 6px',
                          borderRadius: '10px',
                          border: active ? '1px solid rgba(0,229,255,0.5)' : `1px solid ${C.border}`,
                          background: active ? 'rgba(0,229,255,0.1)' : C.surface,
                          boxShadow: active ? '0 0 10px rgba(0,229,255,0.15)' : 'none',
                          color: active ? C.accent : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer', fontFamily: 'inherit',
                          textAlign: 'center', lineHeight: 1.3, transition: 'all 0.18s',
                        }}
                      >
                        <div style={{ fontSize: '1rem', marginBottom: 2 }}>{opt.emoji}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700 }}>{opt.label}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Aircraft */}
              <div>
                <Label sub="optional">Aircraft</Label>
                <select
                  value={aircraftType}
                  onChange={e => setAircraftType(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    height: 40,
                    padding: '0 10px', borderRadius: '10px',
                    background: C.surface, border: `1px solid ${C.border}`,
                    color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                    transition: 'border 0.2s, box-shadow 0.2s', colorScheme: 'dark',
                    appearance: 'none', WebkitAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                  }}
                  onFocus={e => { e.target.style.border = `1px solid ${C.borderFocus}`; e.target.style.boxShadow = '0 0 10px rgba(0,229,255,0.15)'; }}
                  onBlur={e => { e.target.style.border = `1px solid ${C.border}`; e.target.style.boxShadow = 'none'; }}
                >
                  {AIRCRAFT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: '#0d1626', color: '#fff' }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01, boxShadow: '0 8px 32px rgba(0,200,255,0.45)' }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%', padding: '13px 0', borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(90deg, #00C8FF, #a855f7)',
                color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                letterSpacing: '0.03em', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,200,255,0.3)',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ✦ Get My Window Seat
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default React.forwardRef(FlightDetailsForm);
