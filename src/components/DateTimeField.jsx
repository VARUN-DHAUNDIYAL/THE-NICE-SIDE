import React from 'react';
import { TextField, Typography } from '@mui/material';

export default function DateTimeField({ label, type, value, onChange, sx }) {
  return (
    <div>
      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.13rem', mb: 0.5, ml: 0.5, textAlign: 'left' }}>{label}</Typography>
      <TextField
        label=""
        type={type}
        value={value}
        onChange={onChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
        sx={sx}
      />
    </div>
  );
} 