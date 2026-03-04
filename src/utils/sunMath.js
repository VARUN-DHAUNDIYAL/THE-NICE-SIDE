// Helper to accurately calculate where the sun is directly overhead at any given UTC time.
// This allows us to plot a realistic 3D sun instead of guessing.

export function getSubsolarPoint(date) {
    if (!date) return { lat: 0, lon: 0 };
    const t = date.getTime();
    const julianDate = t / 86400000 + 2440587.5;
    const n = julianDate - 2451545.0;

    let L = 280.460 + 0.9856474 * n;
    L = L % 360; if (L < 0) L += 360;
    let g = 357.528 + 0.9856003 * n;
    g = g % 360; if (g < 0) g += 360;

    const gRad = g * (Math.PI / 180);
    const LRad = L * (Math.PI / 180);
    const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
    const lambdaRad = lambda * (Math.PI / 180);
    const epsilon = 23.439 - 0.0000004 * n;
    const epsilonRad = epsilon * (Math.PI / 180);

    const decRad = Math.asin(Math.sin(epsilonRad) * Math.sin(lambdaRad));
    const declination = decRad * (180 / Math.PI);

    let RA = Math.atan2(Math.cos(epsilonRad) * Math.sin(lambdaRad), Math.cos(lambdaRad));
    RA = RA * (180 / Math.PI); if (RA < 0) RA += 360;

    let GMST = 280.46061837 + 360.98564736629 * n;
    GMST = GMST % 360; if (GMST < 0) GMST += 360;

    let longitude = RA - GMST;
    while (longitude > 180) longitude -= 360;
    while (longitude <= -180) longitude += 360;

    return { lat: declination, lon: longitude };
}

/**
 * getMoonPosition — Phase 6: simplified lunar ephemeris.
 * Returns { altitude (rad), azimuth (rad) } at a given lat/lon/time.
 * Accuracy: ~1–2° — sufficient for window-side recommendation.
 */
export function getMoonPosition(date, lat, lon) {
    if (!date) return { altitude: -1, azimuth: 0 };

    const DEG = Math.PI / 180;
    const jd = date.getTime() / 86400000 + 2440587.5;
    const n = jd - 2451545.0;

    // Moon's mean elements
    let Lm = (218.316 + 13.176396 * n) % 360; if (Lm < 0) Lm += 360;
    let Mm = (134.963 + 13.064993 * n) % 360; if (Mm < 0) Mm += 360;
    let Fm = (93.272 + 13.229350 * n) % 360; if (Fm < 0) Fm += 360;

    const MmR = Mm * DEG; const FmR = Fm * DEG; const LmR = Lm * DEG;

    // Ecliptic longitude — major perturbations
    const lambdaM = Lm
        + 6.289 * Math.sin(MmR)
        - 1.274 * Math.sin(2 * LmR - MmR)
        + 0.658 * Math.sin(2 * LmR)
        - 0.214 * Math.sin(2 * MmR);

    // Ecliptic latitude
    const betaM = 5.128 * Math.sin(FmR);

    // Ecliptic → equatorial
    const eps = (23.439 - 0.0000004 * n) * DEG;
    const lR = lambdaM * DEG;
    const bR = betaM * DEG;

    const sinDec = Math.sin(bR) * Math.cos(eps) + Math.cos(bR) * Math.sin(eps) * Math.sin(lR);
    const dec = Math.asin(sinDec);

    let RA = Math.atan2(
        Math.cos(bR) * Math.sin(lR) * Math.cos(eps) - Math.sin(bR) * Math.sin(eps),
        Math.cos(bR) * Math.cos(lR)
    ) * (180 / Math.PI);
    if (RA < 0) RA += 360;

    let GMST = (280.46061837 + 360.98564736629 * n) % 360;
    if (GMST < 0) GMST += 360;

    const H = ((GMST + lon - RA) % 360) * DEG;
    const latR = lat * DEG;

    const sinAlt = Math.sin(latR) * Math.sin(dec) + Math.cos(latR) * Math.cos(dec) * Math.cos(H);
    const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

    const cosAz = (Math.sin(dec) - Math.sin(altitude) * Math.sin(latR)) / (Math.cos(altitude) * Math.cos(latR));
    const azimuth = Math.sin(H) > 0
        ? 2 * Math.PI - Math.acos(Math.max(-1, Math.min(1, cosAz)))
        : Math.acos(Math.max(-1, Math.min(1, cosAz)));

    return { altitude, azimuth };
}
