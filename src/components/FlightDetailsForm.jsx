import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Autocomplete, Slider,
  InputAdornment, CircularProgress, Grid
} from '@mui/material';
import { FlightTakeoff, FlightLand, AccessTime } from '@mui/icons-material';
import CityAutocomplete from './CityAutocomplete';
import DateTimeField from './DateTimeField';

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

  const fetchCities = async (input, setOptions, setLoading) => {
    if (!input || input.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5&extratags=1&featuretype=city`, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await response.json();
      const cities = data.filter(item => item.type === 'city' || item.type === 'town' || item.type === 'village');
      setOptions(cities);
    } catch {
      setOptions([]);
    }
    setLoading(false);
  };

  const handleSourceInputChange = async (event, value) => {
    if (!value || value.length < 2) {
      setSourceOptions([]);
      return;
    }
    setLoadingSource(true);
    let results = [];
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=8&extratags=1`, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await response.json();
      results = data
        .filter(item => ['city', 'town', 'village', 'airport'].includes(item.type))
        .map(item => ({
          id: item.place_id,
          name: item.display_name.split(',')[0],
          country: item.address?.country || '',
          lat: item.lat,
          lon: item.lon,
          type: item.type,
          display_name: item.display_name,
          iata_code: item.extratags?.iata || '',
          icao_code: item.extratags?.icao || '',
          city: item.address?.city || '',
        }));
    } catch (e) {
      results = [];
    }
    setSourceOptions(results);
    setLoadingSource(false);
  };

  const handleDestinationInputChange = async (event, value) => {
    if (!value || value.length < 2) {
      setDestinationOptions([]);
      return;
    }
    setLoadingDestination(true);
    let results = [];
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=8&extratags=1`, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await response.json();
      results = data
        .filter(item => ['city', 'town', 'village', 'airport'].includes(item.type))
        .map(item => ({
          id: item.place_id,
          name: item.display_name.split(',')[0],
          country: item.address?.country || '',
          lat: item.lat,
          lon: item.lon,
          type: item.type,
          display_name: item.display_name,
          iata_code: item.extratags?.iata || '',
          icao_code: item.extratags?.icao || '',
          city: item.address?.city || '',
        }));
    } catch (e) {
      results = [];
    }
    setDestinationOptions(results);
    setLoadingDestination(false);
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
      destinationCity: { ...destinationCity, display_name: destinationCityName }
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
        Flight Details
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
