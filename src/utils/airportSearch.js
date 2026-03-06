import AirportWorker from './airport.worker?worker';

let worker = null;
const pendingResolves = new Map();
let msgId = 0;

function getWorker() {
    if (!worker) {
        worker = new AirportWorker();
        worker.onmessage = (e) => {
            const { id, results, error, type } = e.data;
            const resolve = pendingResolves.get(id);
            if (resolve) {
                pendingResolves.delete(id);
                if (error) {
                    console.error("Worker error decoding airports:", error);
                    resolve([]); // Return empty on error
                } else if (type !== 'init_done') {
                    resolve(results || []);
                } else {
                    resolve();
                }
            }
        };

        // Pre-warm the index immediately (in background thread)
        // so that typing the first letter is instant!
        const initId = msgId++;
        pendingResolves.set(initId, () => { });
        worker.postMessage({ id: initId, type: 'init' });
    }
    return worker;
}

// Start the worker processing immediately without waiting for a search
// This guarantees the 9MB JSON gets parsed completely in the background
// before the user even clicks the autocomplete box.
getWorker();

export const searchAirports = async (query) => {
    if (!query || query.length < 2) return [];

    const w = getWorker();
    const id = msgId++;

    return new Promise((resolve) => {
        pendingResolves.set(id, resolve);
        w.postMessage({ id, type: 'search', query });
    });
};
