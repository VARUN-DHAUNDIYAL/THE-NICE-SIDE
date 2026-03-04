import Fuse from 'fuse.js';

let fuseInstance = null;
let airportList = [];

// Lazy load the data to avoid blocking initial render
const getFuseInstance = async () => {
    if (fuseInstance) return fuseInstance;

    // Dynamically import the JSON file to keep bundle size small if not used
    const rawAirports = (await import('../data/airports.json')).default;

    // Convert object dictionary into an array and keep only major/medium airports with IATA
    airportList = Object.values(rawAirports).filter(
        (airport) => airport.iata && airport.iata !== '' && airport.tz && airport.tz !== 'Unknown'
    );

    const options = {
        keys: [
            { name: 'iata', weight: 0.6 },
            { name: 'city', weight: 0.3 },
            { name: 'name', weight: 0.1 },
        ],
        threshold: 0.3, // Allow some typos
        includeScore: true,
    };

    fuseInstance = new Fuse(airportList, options);
    return fuseInstance;
};

export const searchAirports = async (query) => {
    if (!query || query.length < 2) return [];

    const fuse = await getFuseInstance();
    const results = fuse.search(query).slice(0, 10);

    return results.map(result => {
        const item = result.item;
        return {
            id: item.icao || item.iata,
            name: item.name,
            country: item.country,
            lat: item.lat,
            lon: item.lon,
            type: 'airport',
            display_name: `${item.city}, ${item.country}`,
            iata_code: item.iata,
            icao_code: item.icao,
            city: item.city,
        };
    });
};
