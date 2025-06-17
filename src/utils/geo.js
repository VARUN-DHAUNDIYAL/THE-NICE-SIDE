// Returns an array of { lat, lon } points along the great-circle path
export function getGreatCirclePoints(start, end, numPoints) {
  function toRad(deg) { return (deg * Math.PI) / 180; }
  function toDeg(rad) { return (rad * 180) / Math.PI; }
  const points = [];
  const lat1 = toRad(start.lat);
  const lon1 = toRad(start.lon);
  const lat2 = toRad(end.lat);
  const lon2 = toRad(end.lon);
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const d = 2 * Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
      )
    );
    if (d === 0) {
      points.push({ lat: start.lat, lon: start.lon });
      continue;
    }
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);
    points.push({ lat: toDeg(lat), lon: toDeg(lon) });
  }
  return points;
}

// Returns the initial bearing (azimuth) in radians from start to end
export function getBearing(start, end) {
  function toRad(deg) { return (deg * Math.PI) / 180; }
  const lat1 = toRad(start.lat);
  const lat2 = toRad(end.lat);
  const dLon = toRad(end.lon - start.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return Math.atan2(y, x); // in radians, from north
} 