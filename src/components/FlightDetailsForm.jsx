import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, Slider, Grid
} from '@mui/material';
import { FlightTakeoff, FlightLand } from '@mui/icons-material';
import CityAutocomplete from './CityAutocomplete';
import DateTimeField from './DateTimeField';
import { searchAirports } from '../utils/airportSearch';
import { AIRCRAFT_OPTIONS } from '../data/aircraftNoise';

const textFieldSx = {
  background: 'rgba(255,255,255,0.25)',
  borderRadius: '16px',
  boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.07)',
  input: { color: '#222', fontWeight: 600, fontSize: '1.1rem' },
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: 'none' },
    background: 'rgba(255,255,255,0.35)',
    boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.09)',
  },
};

export default function FlightDetailsForm({ onSubmit }) {
  const [sourceOptions, setSourceOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [sourceCity, setSourceCity] = useState(null);
  const [destinationCity, setDestinationCity] = useState(null);
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [flightTime, setFlightTime] = useState(7);
  const [chronotype, setChronotype] = useState('neutral');
  const [aircraftType, setAircraftType] = useState('unknown');

  const debounceTimerSource = useRef(null);
  const debounceTimerDestination = useRef(null);

  const fetchCities = async (input, setOptions, setLoading) => {
    if (!input || input.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    const results = await searchAirports(input);
    setOptions(results);
    setLoading(false);
  };

  const handleSourceInputChange = async (event, value) => {
    if (debounceTimerSource.current) clearTimeout(debounceTimerSource.current);

    if (!value || value.length < 2) {
      setSourceOptions([]);
      setLoadingSource(false);
      return;
    }
    setLoadingSource(true);

    debounceTimerSource.current = setTimeout(async () => {
      const results = await searchAirports(value);
      setSourceOptions(results);
      setLoadingSource(false);
    }, 200); // Reduced debounce time for local search
  };

  const handleDestinationInputChange = async (event, value) => {
    if (debounceTimerDestination.current) clearTimeout(debounceTimerDestination.current);

    if (!value || value.length < 2) {
      setDestinationOptions([]);
      setLoadingDestination(false);
      return;
    }
    setLoadingDestination(true);

    debounceTimerDestination.current = setTimeout(async () => {
      const results = await searchAirports(value);
      setDestinationOptions(results);
      setLoadingDestination(false);
    }, 200); // Reduced debounce time for local search
  };

  const handleSourceSelect = (event, value) => {
    console.log('Source selected:', value);
    if (!value || !value.lat || !value.lon) {
      setSourceCity(null);
      setSourceCoords(null);
      return;
    }

    // Extract the main city name (first part before comma)
    const cityName = value.display_name.split(',')[0].trim();
    setSourceCity({ ...value, display_name: cityName });
    setSourceCoords({ lat: parseFloat(value.lat), lon: parseFloat(value.lon) });
  };

  const handleDestinationSelect = (event, value) => {
    console.log('Destination selected:', value);
    if (!value || !value.lat || !value.lon) {
      setDestinationCity(null);
      setDestinationCoords(null);
      return;
    }

    // Extract the main city name (first part before comma)
    const cityName = value.display_name.split(',')[0].trim();
    setDestinationCity({ ...value, display_name: cityName });
    setDestinationCoords({ lat: parseFloat(value.lat), lon: parseFloat(value.lon) });
  };

  const handleFlightTimeSlider = (e, value) => setFlightTime(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sourceCity || !destinationCity || !flightTime || !departureDateTime) {
      alert('Please fill in all fields');
      return;
    }

    // Get the main city names for route finding
    const sourceCityName = sourceCity.display_name.split(',')[0].trim();
    const destinationCityName = destinationCity.display_name.split(',')[0].trim();

    onSubmit({
      sourceCoords,
      destinationCoords,
      flightTime,
      departureDateTime,
      sourceCity: { ...sourceCity, display_name: sourceCityName },
      destinationCity: { ...destinationCity, display_name: destinationCityName },
      chronotype,
      aircraftType,
    });
  };

  return (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: '32px',
        padding: { xs: '1.5rem 0.5rem', sm: '2.5rem 2.5rem' },
        maxWidth: 440,
        margin: '2.5rem auto',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.22)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 800, color: '#fff', letterSpacing: 1, mb: 3 }}>
        FLIGHT-MASTER
      </Typography>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Grid container spacing={2} sx={{ mb: 1 }} alignItems="center">
          <Grid item xs={12} sm={6} sx={{ mb: { xs: 2, sm: 0 }, width: '100%' }}>
            <CityAutocomplete label="Source City" options={sourceOptions} loading={loadingSource} onInputChange={handleSourceInputChange} onChange={handleSourceSelect} icon={<FlightTakeoff style={{ color: '#ff512f' }} />} color="#ff512f" sx={{ ...textFieldSx, width: '100%' }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ width: '100%' }}>
            <CityAutocomplete label="Destination City" options={destinationOptions} loading={loadingDestination} onInputChange={handleDestinationInputChange} onChange={handleDestinationSelect} icon={<FlightLand style={{ color: '#dd2476' }} />} color="#dd2476" sx={{ ...textFieldSx, width: '100%' }} fullWidth />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <DateTimeField label="Departure Date" type="date" value={departureDateTime.split('T')[0]} onChange={(e) => setDepartureDateTime(e.target.value + 'T' + departureDateTime.split('T')[1])} sx={textFieldSx} />
          <DateTimeField label="Departure Time" type="time" value={departureDateTime.split('T')[1]} onChange={(e) => setDepartureDateTime(departureDateTime.split('T')[0] + 'T' + e.target.value)} sx={textFieldSx} />
          <Box sx={{ mt: 1.5, mb: 1.5 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.13rem', mb: 1, textAlign: 'left' }}>
              Total Flight Time (hours)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Slider
                value={flightTime}
                min={1}
                max={24}
                step={0.5}
                marks={[{ value: 1, label: '1h' }, { value: 12, label: '12h' }, { value: 24, label: '24h' }]}
                onChange={handleFlightTimeSlider}
                valueLabelDisplay="on"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          {/* Chronotype Selector */}
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', mb: 1, textAlign: 'left' }}>
              Your Sleep Style
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { value: 'morning', label: '🌅 Early Bird' },
                { value: 'neutral', label: '🕐 Neutral' },
                { value: 'night', label: '🦉 Night Owl' },
              ].map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setChronotype(opt.value)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 12,
                    border: chronotype === opt.value ? '2px solid #ffe082' : '2px solid rgba(255,255,255,0.2)',
                    background: chronotype === opt.value ? 'rgba(255,224,130,0.18)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                  }}
                >{opt.label}</button>
              ))}
            </Box>
          </Box>

          {/* Aircraft Type Selector */}
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', mb: 1, textAlign: 'left' }}>
              Aircraft Type <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
            </Typography>
            <select
              value={aircraftType}
              onChange={e => setAircraftType(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.25)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
              }}
            >
              {AIRCRAFT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} style={{ background: '#1a1a2e', color: '#fff' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              fontWeight: 800,
              fontSize: '1.2rem',
              py: 1.5,
              borderRadius: '16px',
              width: '100%',
              mt: 1.5,
              background: 'linear-gradient(90deg, #ff6a00, #ee0979)',
              boxShadow: '0 2px 12px 0 rgba(31,38,135,0.09)',
            }}
          >
            Get Recommendation
          </Button>
        </Box>
      </form>
    </Box>
  );
}
