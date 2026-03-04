/**
 * aircraftNoise.js — Phase 10: Per-Aircraft Noise Zone Data
 *
 * Noise penalty data for common aircraft families.
 * rowBand: 0 = front, 1 = middle, 2 = rear (0-indexed bands)
 *
 * noiseLevels: array of noise scores per row-band (1=quiet, 5=loud)
 * Loudest zones: over-wing (engines + wing flex), very rear (engine exhaust on narrowbodies)
 * Quietest zone: front cabin (first 25% of rows)
 *
 * Source: Cabin acoustics studies, SeatGuru heuristics, aviation forums.
 */
export const AIRCRAFT_NOISE = {
    // Narrowbody — single-aisle
    'A320': {
        label: 'Airbus A320 family (A318/A319/A320/A321)',
        totalRowBands: 5,
        // Band 0=rows 1-6, 1=7-12, 2=13-18 (over-wing), 3=19-24, 4=25-30+
        noiseBands: [
            { band: 0, label: 'Front cabin', score: 2, note: 'Quiet — far from engines' },
            { band: 1, label: 'Mid-front', score: 2, note: 'Comfortable' },
            { band: 2, label: 'Over-wing', score: 4, note: 'Engine roar + wing flex' },
            { band: 3, label: 'Mid-rear', score: 3, note: 'Moderate engine noise' },
            { band: 4, label: 'Rear cabin', score: 5, note: 'Loudest — engine exhaust' },
        ],
        quietestBand: 0,
        loudestBand: 4,
    },
    'B737': {
        label: 'Boeing 737 family (737-700/800/900/MAX)',
        totalRowBands: 5,
        noiseBands: [
            { band: 0, label: 'Front cabin', score: 2, note: 'Quiet — far from engines' },
            { band: 1, label: 'Mid-front', score: 2, note: 'Comfortable' },
            { band: 2, label: 'Over-wing', score: 4, note: 'Engine roar beneath' },
            { band: 3, label: 'Mid-rear', score: 3, note: 'Moderate engine noise' },
            { band: 4, label: 'Rear cabin', score: 5, note: 'Loudest — near engines' },
        ],
        quietestBand: 0,
        loudestBand: 4,
    },

    // Widebody — twin-aisle
    'B777': {
        label: 'Boeing 777 (777-200/300/ER)',
        totalRowBands: 5,
        noiseBands: [
            { band: 0, label: 'Front cabin', score: 1, note: 'Very quiet — thick fuselage insulation' },
            { band: 1, label: 'Mid-front', score: 2, note: 'Comfortable' },
            { band: 2, label: 'Over-wing', score: 3, note: 'Mild engine noise (high-bypass GE90)' },
            { band: 3, label: 'Mid-rear', score: 3, note: 'Moderate' },
            { band: 4, label: 'Rear cabin', score: 4, note: 'Noticeable engine noise' },
        ],
        quietestBand: 0,
        loudestBand: 4,
    },
    'B787': {
        label: 'Boeing 787 Dreamliner (787-8/9/10)',
        totalRowBands: 5,
        noiseBands: [
            { band: 0, label: 'Front cabin', score: 1, note: 'Exceptionally quiet — composite fuselage' },
            { band: 1, label: 'Mid-front', score: 1, note: 'Very quiet' },
            { band: 2, label: 'Over-wing', score: 2, note: 'Still very quiet — GEnx/Trent 1000 are quiet' },
            { band: 3, label: 'Mid-rear', score: 2, note: 'Quiet' },
            { band: 4, label: 'Rear cabin', score: 3, note: 'Slightly more noise — best of any widebody' },
        ],
        quietestBand: 0,
        loudestBand: 4,
    },
    'A350': {
        label: 'Airbus A350 (A350-900/1000)',
        totalRowBands: 5,
        noiseBands: [
            { band: 0, label: 'Front cabin', score: 1, note: 'Extremely quiet — CFRP fuselage' },
            { band: 1, label: 'Mid-front', score: 1, note: 'Very quiet' },
            { band: 2, label: 'Over-wing', score: 2, note: 'Whisper-quiet Trent XWB engines' },
            { band: 3, label: 'Mid-rear', score: 2, note: 'Very comfortable' },
            { band: 4, label: 'Rear cabin', score: 3, note: 'Slightly more engine noise' },
        ],
        quietestBand: 0,
        loudestBand: 4,
    },
    'A380': {
        label: 'Airbus A380',
        totalRowBands: 5,
        noiseBands: [
            { band: 0, label: 'Main deck front', score: 1, note: 'Exceptionally quiet' },
            { band: 1, label: 'Main deck mid', score: 2, note: 'Very quiet' },
            { band: 2, label: 'Over-wing (main deck)', score: 3, note: '4 engines generate more overall noise' },
            { band: 3, label: 'Rear main deck', score: 3, note: 'Moderate' },
            { band: 4, label: 'Upper deck', score: 2, note: 'Upper deck is generally quieter than main' },
        ],
        quietestBand: 0,
        loudestBand: 2,
    },
};

// Ordered list for UI dropdown
export const AIRCRAFT_OPTIONS = [
    { value: 'unknown', label: 'Unknown / Not sure' },
    { value: 'A320', label: 'Airbus A320 family' },
    { value: 'B737', label: 'Boeing 737 family' },
    { value: 'B787', label: 'Boeing 787 Dreamliner' },
    { value: 'A350', label: 'Airbus A350' },
    { value: 'B777', label: 'Boeing 777' },
    { value: 'A380', label: 'Airbus A380' },
];
