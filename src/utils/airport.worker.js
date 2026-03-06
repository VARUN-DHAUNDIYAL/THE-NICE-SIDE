import Fuse from 'fuse.js';

let fuseInstance = null;
let airportList = [];

// Lazy load the data to avoid blocking initial render
const initFuse = async () => {
    if (fuseInstance) return fuseInstance;

    // Dynamically import the JSON - Note: This happens in the Web Worker thread now
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

// Handle messages from the main thread
self.onmessage = async (e) => {
    const { id, type, query } = e.data;

    try {
        if (type === 'init') {
            await initFuse();
            self.postMessage({ id, type: 'init_done' });
        } else if (type === 'search') {
            const fuse = await initFuse();
            if (!query || query.length < 2) {
                self.postMessage({ id, results: [] });
                return;
            }
            const results = fuse.search(query).slice(0, 10);
            const formatted = results.map(result => {
                const item = result.item;
                return {
                    id: item.icao || item.iata,
                    name: item.name,
                    country: item.country,
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon),
                    type: 'airport',
                    display_name: `${item.city}, ${item.country}`,
                    iata_code: item.iata,
                    icao_code: item.icao,
                    city: item.city,
                };
            });
            self.postMessage({ id, results: formatted });
        }
    } catch (err) {
        self.postMessage({ id, error: err.message });
    }
};
