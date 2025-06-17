import React from 'react';
import { Autocomplete, TextField, Typography, InputAdornment } from '@mui/material';

export default function CityAutocomplete({ label, options, loading, onInputChange, onChange, icon, color, sx }) {
  return (
    <div>
      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.13rem', mb: 0.5, ml: 0.5, textAlign: 'left' }}>{label}</Typography>
      <Autocomplete
        freeSolo
        filterOptions={(x) => x}
        options={options}
        loading={loading}
        onInputChange={onInputChange}
        onChange={onChange}
        getOptionLabel={(option) => {
          if (option.type === 'airport') {
            return `${option.name} (${option.iata_code || option.icao_code}), ${option.city}, ${option.country}`;
          } else {
            return `${option.name}, ${option.country}`;
          }
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.type === 'airport' ? (
              <span style={{ marginRight: 8 }} role="img" aria-label="airport">✈️</span>
            ) : (
              <span style={{ marginRight: 8 }} role="img" aria-label="city">🌆</span>
            )}
            <span style={{ fontWeight: 700 }}>{option.name}</span>
            {option.iata_code && <span style={{ color, marginLeft: 8 }}>{option.iata_code}</span>}
            {option.icao_code && <span style={{ color: '#888', marginLeft: 8 }}>{option.icao_code}</span>}
            {option.city && option.type === 'airport' && <span style={{ color: '#90cdf4', marginLeft: 8 }}>{option.city}</span>}
            <span style={{ color: '#888', marginLeft: 8 }}>{option.country}</span>
          </li>
        )}
        renderInput={(paramsInput) => (
          <TextField
            {...paramsInput}
            label=""
            variant="outlined"
            fullWidth
            required
            InputProps={{
              ...paramsInput.InputProps,
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 0.5 }}>
                  {icon}
                </InputAdornment>
              ),
            }}
            sx={sx}
          />
        )}
      />
    </div>
  );
} 