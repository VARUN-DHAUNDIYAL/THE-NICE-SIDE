/**
 * flightCompute.js — Central Flight Intelligence Engine
 *
 * Single responsibility: given raw flight params, compute ALL feature data
 * in one optimised pass over the great-circle path points.
 *
 * Returns a clean `flightData` object consumed by ResultPage & FlightGlobe.
 * Add new features here as pure helper functions, then attach to flightData.
 */

import SunCalc from 'suncalc';
import { getGreatCirclePoints, getBearing } from './geo';
import { getMoonPosition } from './sunMath';
import { computeJetLag } from './jetLag';
import { LANDMARKS } from '../data/landmarks';
import { WORLD_CITIES } from '../data/worldCities';
import { TURBULENCE_ZONES } from '../data/turbulenceZones';
import { AIRCRAFT_NOISE } from '../data/aircraftNoise';

// ─── Constants ──────────────────────────────────────────────────────────────

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const EARTH_R_KM = 6371;
// UV amplification factor at cruising altitude (~35,000 ft)
const UV_ALTITUDE_FACTOR = 2.5;
// Max safe direct UV exposure minutes (equivalent to ground SPF-unprotected skin)
const UV_SAFE_MINUTES = 90;
// Golden-hour window (minutes around sunrise/sunset)
const GOLDEN_HOUR_WINDOW_MIN = 40;
// Aurora latitude threshold
const AURORA_LAT_THRESHOLD = 55;
// City lights — max lateral distance (km) to flag a city as a flyby
const CITY_LATERAL_KM = 130;
// Sun altitude threshold for night (degrees) — city lights visible below this
const NIGHT_SUN_ALT_DEG = -6;

// ─── Utility: Haversine distance (km) ───────────────────────────────────────

export function haversineKm(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * DEG2RAD;
    const dLon = (lon2 - lon1) * DEG2RAD;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * Math.sin(dLon / 2) ** 2;
    return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Utility: Cross-track distance (km) — lateral offset from path ───────────
// Returns signed distance: positive = right of track, negative = left of track

function crossTrackDistanceKm(ptLat, ptLon, pathPtLat, pathPtLon, bearingRad) {
    const d13 = haversineKm(pathPtLat, pathPtLon, ptLat, ptLon) / EARTH_R_KM; // angular dist
    const bearing13 = getBearing(
        { lat: pathPtLat, lon: pathPtLon },
        { lat: ptLat, lon: ptLon }
    );
    return Math.asin(Math.sin(d13) * Math.sin(bearing13 - bearingRad)) * EARTH_R_KM;
}

// ─── Utility: Point in bounding box ─────────────────────────────────────────

function pointInBBox(lat, lon, zone) {
    // Handle zones that wrap around the antimeridian (lon 140 → -140 etc.)
    if (zone.minLon > zone.maxLon) {
        return (
            lat >= zone.minLat && lat <= zone.maxLat &&
            (lon >= zone.minLon || lon <= zone.maxLon)
        );
    }
    return (
        lat >= zone.minLat && lat <= zone.maxLat &&
        lon >= zone.minLon && lon <= zone.maxLon
    );
}

// ─── Utility: Sun relative angle → side ─────────────────────────────────────

function getSunSide(bearingRad, sunAzimuthRad) {
    let angle = (sunAzimuthRad - bearingRad) * RAD2DEG;
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    // angle > 0 → sun is to the right; < 0 → left
    return angle > 0 ? 'right' : 'left';
}

// ─── Feature: Sun side + Sunrise/Sunset markers ──────────────────────────────

function computeSunData(pathPoints, departure, flightDurationHours) {
    let leftCount = 0;
    let rightCount = 0;
    let sunExposureMinutes = 0;
    const sunriseSunsetMarkers = [];
    const seenSunriseIdx = new Set();
    const seenSunsetIdx = new Set();

    const totalMinutes = flightDurationHours * 60;
    const minutePerStep = totalMinutes / pathPoints.length;

    for (let i = 0; i < pathPoints.length - 1; i++) {
        const pt = pathPoints[i];
        const nextPt = pathPoints[i + 1];
        const minutesFromStart = minutePerStep * i;
        const timeAtPoint = new Date(departure.getTime() + minutesFromStart * 60000);
        const sun = SunCalc.getPosition(timeAtPoint, pt.lat, pt.lon);
        const times = SunCalc.getTimes(timeAtPoint, pt.lat, pt.lon);

        // Sunrise/sunset marker dedup by 60-min buckets
        const bucketIdx = Math.floor(minutesFromStart / 60);
        if (
            Math.abs(timeAtPoint - times.sunrise) < 30 * 60000 &&
            !seenSunriseIdx.has(bucketIdx)
        ) {
            seenSunriseIdx.add(bucketIdx);
            sunriseSunsetMarkers.push({
                type: 'sunrise', lat: pt.lat, lon: pt.lon,
                minuteOffset: Math.round(minutesFromStart),
                time: timeAtPoint,
            });
        }
        if (
            Math.abs(timeAtPoint - times.sunset) < 30 * 60000 &&
            !seenSunsetIdx.has(bucketIdx)
        ) {
            seenSunsetIdx.add(bucketIdx);
            sunriseSunsetMarkers.push({
                type: 'sunset', lat: pt.lat, lon: pt.lon,
                minuteOffset: Math.round(minutesFromStart),
                time: timeAtPoint,
            });
        }

        if (sun.altitude <= 0) continue;

        const bearing = getBearing(pt, nextPt);
        const side = getSunSide(bearing, sun.azimuth);
        if (side === 'left') leftCount++; else rightCount++;
        sunExposureMinutes += minutePerStep;
    }

    let recommendedSide, rec, detail;
    if (leftCount === 0 && rightCount === 0) {
        recommendedSide = 'none';
        rec = 'No sun visible during your flight.';
        detail = 'The sun will be below the horizon for the entire route.';
    } else if (leftCount > rightCount) {
        recommendedSide = 'left';
        rec = 'Sit on the LEFT side!';
        detail = `You'll enjoy the sun for about ${Math.round((leftCount / pathPoints.length) * totalMinutes)} minutes on the left side.`;
    } else if (rightCount > leftCount) {
        recommendedSide = 'right';
        rec = 'Sit on the RIGHT side!';
        detail = `You'll enjoy the sun for about ${Math.round((rightCount / pathPoints.length) * totalMinutes)} minutes on the right side.`;
    } else {
        recommendedSide = 'equal';
        rec = 'Either side is fine!';
        detail = 'The sun will be visible equally on both sides.';
    }

    // UV exposure on chosen side only
    const exposedMinutes = Math.round(
        (Math.max(leftCount, rightCount) / pathPoints.length) * totalMinutes
    );
    const uvRisk = exposedMinutes * UV_ALTITUDE_FACTOR; // equivalent ground-UV minutes
    const sunburnRisk = uvRisk > UV_SAFE_MINUTES
        ? { level: 'high', exposedMinutes, uvEquivalentMinutes: Math.round(uvRisk) }
        : uvRisk > UV_SAFE_MINUTES * 0.5
            ? { level: 'moderate', exposedMinutes, uvEquivalentMinutes: Math.round(uvRisk) }
            : { level: 'low', exposedMinutes, uvEquivalentMinutes: Math.round(uvRisk) };

    return { recommendedSide, rec, detail, sunriseSunsetMarkers, sunburnRisk, leftCount, rightCount };
}

// ─── Feature: Golden Hour ────────────────────────────────────────────────────

function computeGoldenHour(departureTime, arrivalTime, source, destination) {
    const events = [];
    const depTimes = SunCalc.getTimes(departureTime, source.lat, source.lon);
    const arrTimes = SunCalc.getTimes(arrivalTime, destination.lat, destination.lon);

    const windowMs = GOLDEN_HOUR_WINDOW_MIN * 60000;

    if (Math.abs(departureTime - depTimes.sunriseEnd) < windowMs)
        events.push({ type: 'departure_sunrise', city: source.name || 'Departure', time: depTimes.sunriseEnd });
    if (Math.abs(departureTime - depTimes.sunsetStart) < windowMs)
        events.push({ type: 'departure_golden_hour', city: source.name || 'Departure', time: depTimes.sunsetStart });

    if (Math.abs(arrivalTime - arrTimes.sunriseEnd) < windowMs)
        events.push({ type: 'arrival_sunrise', city: destination.name || 'Destination', time: arrTimes.sunriseEnd });
    if (Math.abs(arrivalTime - arrTimes.sunsetStart) < windowMs)
        events.push({ type: 'arrival_golden_hour', city: destination.name || 'Destination', time: arrTimes.sunsetStart });

    return events;
}

// ─── Feature: City Lights Flyover ────────────────────────────────────────────

function computeCityFlybys(pathPoints, departure, flightDurationHours) {
    const totalMinutes = flightDurationHours * 60;
    const minutePerStep = totalMinutes / pathPoints.length;
    const flybys = [];
    const seenCities = new Set();

    for (let i = 0; i < pathPoints.length - 1; i++) {
        const pt = pathPoints[i];
        const nextPt = pathPoints[i + 1];
        const minutesFromStart = minutePerStep * i;
        const timeAtPoint = new Date(departure.getTime() + minutesFromStart * 60000);

        // Only flag cities at night
        const sun = SunCalc.getPosition(timeAtPoint, pt.lat, pt.lon);
        if (sun.altitude * RAD2DEG > NIGHT_SUN_ALT_DEG) continue;

        const bearing = getBearing(pt, nextPt);

        for (const city of WORLD_CITIES) {
            if (seenCities.has(city.name)) continue;
            const distKm = haversineKm(pt.lat, pt.lon, city.lat, city.lon);
            if (distKm > CITY_LATERAL_KM * 2) continue; // fast pre-cull

            const xtDist = crossTrackDistanceKm(city.lat, city.lon, pt.lat, pt.lon, bearing);
            if (Math.abs(xtDist) <= CITY_LATERAL_KM) {
                seenCities.add(city.name);
                flybys.push({
                    type: 'city',
                    name: city.name,
                    lat: city.lat,
                    lon: city.lon,
                    side: xtDist > 0 ? 'right' : 'left',
                    minuteOffset: Math.round(minutesFromStart),
                    pop: city.pop,
                });
            }
        }
    }

    return flybys.sort((a, b) => a.minuteOffset - b.minuteOffset);
}

// ─── Feature: Landmark Alerts ────────────────────────────────────────────────

function computeLandmarkAlerts(pathPoints, flightDurationHours) {
    const totalMinutes = flightDurationHours * 60;
    const minutePerStep = totalMinutes / pathPoints.length;
    const alerts = [];
    const seenLandmarks = new Set();

    for (let i = 0; i < pathPoints.length - 1; i++) {
        const pt = pathPoints[i];
        const nextPt = pathPoints[i + 1];
        const minutesFromStart = minutePerStep * i;
        const bearing = getBearing(pt, nextPt);

        for (const lm of LANDMARKS) {
            if (seenLandmarks.has(lm.name)) continue;
            const distKm = haversineKm(pt.lat, pt.lon, lm.lat, lm.lon);
            if (distKm > lm.radiusKm * 2) continue;

            const xtDist = crossTrackDistanceKm(lm.lat, lm.lon, pt.lat, pt.lon, bearing);
            if (Math.abs(xtDist) <= lm.radiusKm) {
                seenLandmarks.add(lm.name);
                alerts.push({
                    type: 'landmark',
                    name: lm.name,
                    emoji: lm.emoji,
                    lat: lm.lat,
                    lon: lm.lon,
                    side: xtDist > 0 ? 'right' : 'left',
                    minuteOffset: Math.round(minutesFromStart),
                });
            }
        }
    }

    return alerts.sort((a, b) => a.minuteOffset - b.minuteOffset);
}

// ─── Feature: Aurora Segments ────────────────────────────────────────────────

function computeAuroraSegments(pathPoints, flightDurationHours) {
    const totalMinutes = flightDurationHours * 60;
    const minutePerStep = totalMinutes / pathPoints.length;
    const segments = [];
    let inAurora = false;
    let segStart = null;
    let maxLat = 0;

    for (let i = 0; i < pathPoints.length; i++) {
        const pt = pathPoints[i];
        const abslat = Math.abs(pt.lat);
        if (abslat >= AURORA_LAT_THRESHOLD) {
            if (!inAurora) {
                inAurora = true;
                segStart = { i, minuteOffset: Math.round(minutePerStep * i) };
                maxLat = abslat;
            } else {
                maxLat = Math.max(maxLat, abslat);
            }
        } else if (inAurora) {
            inAurora = false;
            segments.push({
                type: 'aurora',
                startMinute: segStart.minuteOffset,
                endMinute: Math.round(minutePerStep * i),
                durationMinutes: Math.round(minutePerStep * (i - segStart.i)),
                maxLat: Math.round(maxLat * 10) / 10,
                lat: pathPoints[segStart.i].lat,
                lon: pathPoints[segStart.i].lon,
            });
            segStart = null;
            maxLat = 0;
        }
    }
    // Close open segment
    if (inAurora && segStart) {
        const endI = pathPoints.length - 1;
        segments.push({
            type: 'aurora',
            startMinute: segStart.minuteOffset,
            endMinute: Math.round(minutePerStep * endI),
            durationMinutes: Math.round(minutePerStep * (endI - segStart.i)),
            maxLat: Math.round(maxLat * 10) / 10,
            lat: pathPoints[segStart.i].lat,
            lon: pathPoints[segStart.i].lon,
        });
    }

    return segments;
}

// ─── Feature: Turbulence Segments ───────────────────────────────────────────

function computeTurbulenceSegments(pathPoints, flightDurationHours) {
    const totalMinutes = flightDurationHours * 60;
    const minutePerStep = totalMinutes / pathPoints.length;
    const hits = {};

    for (let i = 0; i < pathPoints.length; i++) {
        const pt = pathPoints[i];
        for (const zone of TURBULENCE_ZONES) {
            if (!pointInBBox(pt.lat, pt.lon, zone)) continue;
            if (!hits[zone.name]) hits[zone.name] = { zone, startI: i, endI: i };
            else hits[zone.name].endI = i;
        }
    }

    return Object.values(hits).map(({ zone, startI, endI }) => ({
        type: 'turbulence',
        name: zone.name,
        emoji: zone.emoji,
        severity: zone.severity,
        description: zone.description,
        startMinute: Math.round(minutePerStep * startI),
        endMinute: Math.round(minutePerStep * endI),
        durationMinutes: Math.round(minutePerStep * (endI - startI)),
        lat: pathPoints[Math.round((startI + endI) / 2)].lat,
        lon: pathPoints[Math.round((startI + endI) / 2)].lon,
    })).sort((a, b) => a.startMinute - b.startMinute);
}

// ─── Feature: Moon Side Seat ─────────────────────────────────────────────────
// For night segments, determine which side of the plane faces the moon.

function computeMoonSide(pathPoints, departure, flightDurationHours) {
    const totalMinutes = flightDurationHours * 60;
    const minutePerStep = totalMinutes / pathPoints.length;

    let leftCount = 0, rightCount = 0, nightPoints = 0;
    let moonLat = null, moonLon = null;

    for (let i = 0; i < pathPoints.length - 1; i++) {
        const pt = pathPoints[i];
        const nextPt = pathPoints[i + 1];
        const minutesFromStart = minutePerStep * i;
        const timeAtPoint = new Date(departure.getTime() + minutesFromStart * 60000);

        // Moon is only useful when sun is below horizon
        const sun = SunCalc.getPosition(timeAtPoint, pt.lat, pt.lon);
        if (sun.altitude * RAD2DEG > -6) continue;

        nightPoints++;
        const moon = getMoonPosition(timeAtPoint, pt.lat, pt.lon);
        if (moon.altitude < 0) continue; // moon below horizon

        // Store approximate moon position for globe marker (use midpoint)
        if (moonLat === null) { moonLat = pt.lat; moonLon = pt.lon; }

        const bearing = getBearing(pt, nextPt);
        const side = getSunSide(bearing, moon.azimuth);
        if (side === 'left') leftCount++; else rightCount++;
    }

    if (nightPoints === 0 || (leftCount === 0 && rightCount === 0)) {
        return { moonSide: 'none', moonLat: null, moonLon: null };
    }

    const moonSide = leftCount >= rightCount ? 'left' : 'right';
    return { moonSide, moonLat, moonLon, leftCount, rightCount };
}

// ─── Feature: Noise Zone Recommendation ──────────────────────────────────────

function computeNoiseRecommendation(aircraftType, recommendedSide) {
    const aircraft = AIRCRAFT_NOISE[aircraftType];
    if (!aircraft) return null;

    const quietBand = aircraft.noiseBands[aircraft.quietestBand];
    const hasSun = recommendedSide === 'left' || recommendedSide === 'right';

    return {
        aircraftType,
        label: aircraft.label,
        quietestZone: quietBand.label,
        quietestNote: quietBand.note,
        loudestZone: aircraft.noiseBands[aircraft.loudestBand].label,
        bands: aircraft.noiseBands,
        combined: hasSun
            ? `${quietBand.label} on the ${recommendedSide} side — quietest AND best sun`
            : `${quietBand.label} — quietest section of this aircraft`,
    };
}


/**
 * computeFlightData — the single entry point.
 *
 * @param {object} params
 * @param {object} params.sourceCoords      — { lat, lon }
 * @param {object} params.destinationCoords — { lat, lon }
 * @param {string} params.sourceName        — display name
 * @param {string} params.destinationName   — display name
 * @param {number} params.flightDurationHours
 * @param {Date}   params.departureDateTime
 * @param {'morning'|'neutral'|'night'} [params.chronotype]
 * @param {string}  [params.aircraftType]   — key from AIRCRAFT_NOISE
 *
 * @returns {object} flightData — all computed features
 */
export function computeFlightData({
    sourceCoords,
    destinationCoords,
    sourceName,
    destinationName,
    flightDurationHours,
    departureDateTime,
    chronotype = 'neutral',
    aircraftType = 'unknown',
}) {
    const totalMinutes = flightDurationHours * 60;
    const numPoints = Math.max(2, Math.round(totalMinutes / 10));
    const pathPoints = getGreatCirclePoints(sourceCoords, destinationCoords, numPoints);

    const departure = new Date(departureDateTime);
    const arrival = new Date(departure.getTime() + totalMinutes * 60000);

    const source = { ...sourceCoords, name: sourceName };
    const destination = { ...destinationCoords, name: destinationName };

    // ── Compute all features ──
    const {
        recommendedSide, rec, detail,
        sunriseSunsetMarkers, sunburnRisk,
    } = computeSunData(pathPoints, departure, flightDurationHours);

    const goldenHourEvents = computeGoldenHour(departure, arrival, source, destination);
    const cityFlybys = computeCityFlybys(pathPoints, departure, flightDurationHours);
    const landmarkAlerts = computeLandmarkAlerts(pathPoints, flightDurationHours);
    const auroraSegments = computeAuroraSegments(pathPoints, flightDurationHours);
    const turbulenceSegments = computeTurbulenceSegments(pathPoints, flightDurationHours);
    const { moonSide, moonLat, moonLon } = computeMoonSide(pathPoints, departure, flightDurationHours);
    const noiseRecommendation = computeNoiseRecommendation(aircraftType, recommendedSide);
    const jetLagData = computeJetLag({
        fromLon: sourceCoords.lon,
        toLon: destinationCoords.lon,
        flightDurationHours,
        departureTime: departure,
        chronotype,
    });

    // ── Aggregated timeline ──
    const timelineEvents = [
        ...sunriseSunsetMarkers.map(e => ({ ...e, minuteOffset: e.minuteOffset ?? 0 })),
        ...goldenHourEvents.map(e => ({
            type: 'golden_hour',
            subtype: e.type,
            name: e.city,
            minuteOffset: Math.max(0, Math.round((e.time - departure) / 60000)),
            lat: e.type.startsWith('departure') ? source.lat : destination.lat,
            lon: e.type.startsWith('departure') ? source.lon : destination.lon,
        })),
        ...cityFlybys,
        ...landmarkAlerts,
        ...auroraSegments.map(e => ({ ...e, minuteOffset: e.startMinute })),
        ...turbulenceSegments.map(e => ({ ...e, minuteOffset: e.startMinute })),
    ].sort((a, b) => (a.minuteOffset ?? 0) - (b.minuteOffset ?? 0));

    return {
        pathPoints, source, destination, departureTime: departure, arrivalTime: arrival, flightDurationHours,
        recommendedSide, rec, detail,
        sunriseSunsetMarkers, sunburnRisk,
        goldenHourEvents,
        cityFlybys,
        landmarkAlerts,
        auroraSegments,
        turbulenceSegments,
        timelineEvents,
        moonSide, moonLat, moonLon,
        noiseRecommendation,
        jetLagData,
    };
}
