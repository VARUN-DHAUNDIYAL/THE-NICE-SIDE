/**
 * Curated dataset of ~80 iconic world landmarks.
 * Each entry: { name, lat, lon, emoji, radiusKm }
 * radiusKm = how close the flight path needs to pass to trigger an alert.
 */
export const LANDMARKS = [
    // Asia
    { name: 'Himalayas', lat: 27.9881, lon: 86.9250, emoji: '🏔️', radiusKm: 250 },
    { name: 'Mount Everest', lat: 27.9881, lon: 86.9250, emoji: '🏔️', radiusKm: 120 },
    { name: 'Taj Mahal', lat: 27.1751, lon: 78.0421, emoji: '🕌', radiusKm: 60 },
    { name: 'Great Wall of China', lat: 40.4319, lon: 116.5704, emoji: '🧱', radiusKm: 150 },
    { name: 'Gobi Desert', lat: 42.5888, lon: 103.0645, emoji: '🏜️', radiusKm: 300 },
    { name: 'Mount Fuji', lat: 35.3606, lon: 138.7274, emoji: '🗻', radiusKm: 80 },
    { name: 'Maldives Atolls', lat: 3.2028, lon: 73.2207, emoji: '🏝️', radiusKm: 120 },
    { name: 'Bosphorus Strait', lat: 41.1122, lon: 29.0563, emoji: '🌊', radiusKm: 60 },
    { name: 'Dead Sea', lat: 31.5590, lon: 35.4732, emoji: '🧂', radiusKm: 60 },
    { name: 'Ganges Delta', lat: 22.7462, lon: 89.5411, emoji: '🌿', radiusKm: 100 },
    { name: 'Arabian Desert', lat: 22.0000, lon: 46.0000, emoji: '🏜️', radiusKm: 300 },
    { name: 'Yangtze River Delta', lat: 31.2304, lon: 121.4737, emoji: '🌊', radiusKm: 100 },

    // Europe
    { name: 'Alps', lat: 46.5197, lon: 9.5657, emoji: '🏔️', radiusKm: 200 },
    { name: 'Eiffel Tower (Paris)', lat: 48.8584, lon: 2.2945, emoji: '🗼', radiusKm: 50 },
    { name: 'Colosseum (Rome)', lat: 41.8902, lon: 12.4922, emoji: '🏛️', radiusKm: 50 },
    { name: 'Santorini', lat: 36.3932, lon: 25.4615, emoji: '🏝️', radiusKm: 50 },
    { name: 'Norwegian Fjords', lat: 61.1895, lon: 6.9977, emoji: '🏔️', radiusKm: 150 },
    { name: 'Scottish Highlands', lat: 57.1204, lon: -4.7128, emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', radiusKm: 100 },
    { name: 'Sahara Desert (North Africa)', lat: 25.0000, lon: 17.0000, emoji: '🏜️', radiusKm: 400 },
    { name: 'Strait of Gibraltar', lat: 35.9872, lon: -5.3613, emoji: '🚢', radiusKm: 60 },
    { name: 'Dolomites', lat: 46.4102, lon: 11.8440, emoji: '🏔️', radiusKm: 80 },

    // Africa
    { name: 'Mount Kilimanjaro', lat: -3.0674, lon: 37.3556, emoji: '🏔️', radiusKm: 100 },
    { name: 'Victoria Falls', lat: -17.9243, lon: 25.8572, emoji: '💧', radiusKm: 80 },
    { name: 'Nile Delta', lat: 30.8025, lon: 31.0289, emoji: '🌿', radiusKm: 150 },
    { name: 'Sahara Desert (Central)', lat: 23.0000, lon: 8.0000, emoji: '🏜️', radiusKm: 500 },
    { name: 'Lake Victoria', lat: -1.2921, lon: 36.8219, emoji: '💧', radiusKm: 150 },
    { name: 'Congo Rainforest', lat: -0.2280, lon: 24.9885, emoji: '🌿', radiusKm: 300 },
    { name: 'Cape of Good Hope', lat: -34.3568, lon: 18.4734, emoji: '⛵', radiusKm: 80 },
    { name: 'Madagascar', lat: -18.7669, lon: 46.8691, emoji: '🦎', radiusKm: 150 },

    // Americas - North
    { name: 'Grand Canyon', lat: 36.1069, lon: -112.1129, emoji: '🏜️', radiusKm: 100 },
    { name: 'Niagara Falls', lat: 43.0962, lon: -79.0377, emoji: '💧', radiusKm: 60 },
    { name: 'Statue of Liberty (NYC)', lat: 40.6892, lon: -74.0445, emoji: '🗽', radiusKm: 50 },
    { name: 'Rocky Mountains', lat: 39.5501, lon: -105.7821, emoji: '🏔️', radiusKm: 250 },
    { name: 'Mississippi Delta', lat: 29.1566, lon: -89.2495, emoji: '🌿', radiusKm: 100 },
    { name: 'Great Lakes', lat: 45.0000, lon: -84.0000, emoji: '💧', radiusKm: 200 },
    { name: 'Alaska Range', lat: 63.0694, lon: -150.4048, emoji: '🏔️', radiusKm: 200 },
    { name: 'Yellowstone', lat: 44.4280, lon: -110.5885, emoji: '🌋', radiusKm: 80 },
    { name: 'Death Valley', lat: 36.5323, lon: -116.9325, emoji: '🏜️', radiusKm: 80 },
    { name: 'Florida Keys', lat: 24.5551, lon: -81.7800, emoji: '🏝️', radiusKm: 80 },
    { name: 'Greenland Ice Sheet', lat: 72.0000, lon: -42.0000, emoji: '🧊', radiusKm: 400 },

    // Americas - South
    { name: 'Amazon Rainforest', lat: -3.4653, lon: -62.2159, emoji: '🌿', radiusKm: 400 },
    { name: 'Andes Mountains', lat: -15.0000, lon: -72.0000, emoji: '🏔️', radiusKm: 300 },
    { name: 'Patagonia', lat: -50.0000, lon: -72.0000, emoji: '🏔️', radiusKm: 250 },
    { name: 'Galápagos Islands', lat: -0.9538, lon: -90.9656, emoji: '🦎', radiusKm: 100 },
    { name: 'Angel Falls', lat: 5.9701, lon: -62.5362, emoji: '💧', radiusKm: 60 },
    { name: 'Atacama Desert', lat: -23.1987, lon: -68.4075, emoji: '🏜️', radiusKm: 200 },

    // Oceania
    { name: 'Great Barrier Reef', lat: -18.2871, lon: 147.6992, emoji: '🐠', radiusKm: 200 },
    { name: 'Uluru', lat: -25.3444, lon: 131.0369, emoji: '🪨', radiusKm: 80 },
    { name: 'New Zealand Fjords', lat: -45.4141, lon: 167.7197, emoji: '🏔️', radiusKm: 100 },
    { name: 'Australian Outback', lat: -25.0000, lon: 134.0000, emoji: '🏜️', radiusKm: 400 },

    // Polar
    { name: 'Arctic Ice Cap', lat: 90.0000, lon: 0.0000, emoji: '🧊', radiusKm: 500 },
    { name: 'Iceland', lat: 64.9631, lon: -19.0208, emoji: '🌋', radiusKm: 150 },
    { name: 'Antarctica', lat: -82.0000, lon: 0.0000, emoji: '🐧', radiusKm: 600 },

    // Oceans
    { name: 'Pacific Ocean (vast)', lat: 0.0000, lon: -150.0000, emoji: '🌊', radiusKm: 1000 },
    { name: 'Mid-Atlantic Ridge', lat: 0.0000, lon: -30.0000, emoji: '🌊', radiusKm: 200 },
    { name: 'Indian Ocean', lat: -10.0000, lon: 70.0000, emoji: '🌊', radiusKm: 500 },

    // Additional iconic
    { name: 'Dubai (Burj Khalifa)', lat: 25.1972, lon: 55.2744, emoji: '🏙️', radiusKm: 60 },
    { name: 'Singapore Strait', lat: 1.3521, lon: 103.8198, emoji: '🚢', radiusKm: 60 },
    { name: 'Hong Kong Harbour', lat: 22.3193, lon: 114.1694, emoji: '🏙️', radiusKm: 60 },
    { name: 'Tokyo Bay', lat: 35.6762, lon: 139.6503, emoji: '🏙️', radiusKm: 60 },
    { name: 'Sydney Harbour', lat: -33.8688, lon: 151.2093, emoji: '🌉', radiusKm: 60 },
    { name: 'Suez Canal', lat: 30.5234, lon: 32.3562, emoji: '🚢', radiusKm: 60 },
    { name: 'Panama Canal', lat: 9.0820, lon: -79.6722, emoji: '🚢', radiusKm: 60 },
];
