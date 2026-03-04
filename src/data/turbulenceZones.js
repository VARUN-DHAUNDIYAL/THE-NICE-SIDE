/**
 * Known turbulence hotspot zones.
 * Represented as bounding boxes { name, minLat, maxLat, minLon, maxLon, severity, description }
 * severity: 'light' | 'moderate' | 'severe'
 *
 * Sources: NOAA/FAA turbulence climatology + aviation knowledge base.
 */
export const TURBULENCE_ZONES = [
    // Mountain Wave Turbulence
    {
        name: 'Rocky Mountains',
        minLat: 35, maxLat: 55, minLon: -120, maxLon: -100,
        severity: 'moderate',
        description: 'Mountain wave turbulence from the Rockies',
        emoji: '🏔️',
    },
    {
        name: 'Alps',
        minLat: 44, maxLat: 48, minLon: 6, maxLon: 16,
        severity: 'moderate',
        description: 'Mountain wave turbulence over the Alps',
        emoji: '🏔️',
    },
    {
        name: 'Himalayas',
        minLat: 25, maxLat: 35, minLon: 72, maxLon: 95,
        severity: 'severe',
        description: 'Strong mountain wave turbulence over the Himalayas',
        emoji: '🏔️',
    },
    {
        name: 'Andes',
        minLat: -55, maxLat: 5, minLon: -80, maxLon: -65,
        severity: 'moderate',
        description: 'Mountain wave turbulence over the Andes',
        emoji: '🏔️',
    },
    {
        name: 'Atlas Mountains',
        minLat: 30, maxLat: 37, minLon: -8, maxLon: 10,
        severity: 'light',
        description: 'Light turbulence over the Atlas range',
        emoji: '🏔️',
    },

    // Jet Stream Crossing Zones
    {
        name: 'North Atlantic Jet Stream',
        minLat: 45, maxLat: 60, minLon: -60, maxLon: -10,
        severity: 'moderate',
        description: 'Clear-air turbulence near the North Atlantic jet stream',
        emoji: '💨',
    },
    {
        name: 'North Pacific Jet Stream',
        minLat: 30, maxLat: 50, minLon: 140, maxLon: -140,
        severity: 'moderate',
        description: 'Clear-air turbulence near the North Pacific jet stream',
        emoji: '💨',
    },
    {
        name: 'Polar Front Jet (Europe)',
        minLat: 50, maxLat: 65, minLon: -20, maxLon: 40,
        severity: 'light',
        description: 'Light clear-air turbulence near the European polar front',
        emoji: '💨',
    },

    // ITCZ — Intertropical Convergence Zone
    {
        name: 'ITCZ (Atlantic)',
        minLat: -5, maxLat: 10, minLon: -60, maxLon: 20,
        severity: 'moderate',
        description: 'Convective turbulence in the Intertropical Convergence Zone',
        emoji: '⛈️',
    },
    {
        name: 'ITCZ (Pacific)',
        minLat: -5, maxLat: 10, minLon: 120, maxLon: -120,
        severity: 'moderate',
        description: 'Convective turbulence in the Pacific ITCZ',
        emoji: '⛈️',
    },
    {
        name: 'ITCZ (Indian Ocean)',
        minLat: -5, maxLat: 10, minLon: 50, maxLon: 100,
        severity: 'moderate',
        description: 'Convective turbulence over the Indian Ocean ITCZ',
        emoji: '⛈️',
    },

    // Monsoon Regions
    {
        name: 'Bay of Bengal Monsoon',
        minLat: 5, maxLat: 25, minLon: 80, maxLon: 100,
        severity: 'moderate',
        description: 'Convective turbulence during monsoon season',
        emoji: '🌧️',
    },
    {
        name: 'Arabian Sea Monsoon',
        minLat: 5, maxLat: 25, minLon: 55, maxLon: 75,
        severity: 'moderate',
        description: 'Convective turbulence during SW monsoon',
        emoji: '🌧️',
    },

    // Thunderstorm Corridors
    {
        name: 'Central Africa Storm Belt',
        minLat: -5, maxLat: 10, minLon: 15, maxLon: 35,
        severity: 'severe',
        description: 'Frequent severe convective turbulence over central Africa',
        emoji: '⛈️',
    },
    {
        name: 'US Midwest Storm Alley',
        minLat: 30, maxLat: 45, minLon: -105, maxLon: -85,
        severity: 'moderate',
        description: 'Convective turbulence over tornado alley',
        emoji: '🌪️',
    },
];
