export const airlineRoutes = [
  {
    source: 'New York',
    destination: 'London',
    waypoints: [
      { lat: 40.6413, lon: -73.7781 }, // JFK
      { lat: 51.4700, lon: -0.4543 }, // LHR
      { lat: 53.4213, lon: -6.2701 }, // DUB (overfly)
      { lat: 52.3086, lon: 4.7639 }, // AMS (overfly)
      { lat: 51.4700, lon: -0.4543 }, // LHR
    ],
  },
  {
    source: 'Paris',
    destination: 'Tokyo',
    waypoints: [
      { lat: 48.8566, lon: 2.3522 }, // Paris
      { lat: 55.7558, lon: 37.6173 }, // Moscow (overfly)
      { lat: 60.1699, lon: 24.9384 }, // Helsinki (overfly)
      { lat: 43.6532, lon: 141.3500 }, // Sapporo (overfly)
      { lat: 35.5494, lon: 139.7798 }, // Tokyo Haneda
    ],
  },
  {
    source: 'Los Angeles',
    destination: 'Sydney',
    waypoints: [
      { lat: 33.9416, lon: -118.4085 }, // LAX
      { lat: 21.3069, lon: -157.8583 }, // Honolulu (overfly)
      { lat: -17.7134, lon: 178.0650 }, // Fiji (overfly)
      { lat: -33.8688, lon: 151.2093 }, // Sydney
    ],
  },
  {
    source: 'Dubai',
    destination: 'Singapore',
    waypoints: [
      { lat: 25.2532, lon: 55.3657 }, // Dubai
      { lat: 19.0760, lon: 72.8777 }, // Mumbai (overfly)
      { lat: 13.7563, lon: 100.5018 }, // Bangkok (overfly)
      { lat: 1.3644, lon: 103.9915 }, // Singapore
    ],
  },
]; 