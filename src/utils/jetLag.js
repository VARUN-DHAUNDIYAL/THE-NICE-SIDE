/**
 * jetLag.js — Phase 5: Jet Lag Optimizer
 *
 * Simplified circadian rhythm model based on:
 * - Flight direction (eastward = harder on the body)
 * - Flight duration
 * - User chronotype (morning / neutral / night person)
 * - Local departure time
 *
 * Returns a schedule of recommended actions during the flight.
 */

// ── Constants ────────────────────────────────────────────────────────────────

// Eastward adjustment penalty multiplier vs westward
const EAST_PENALTY = 1.35;

// Window after which staying awake helps you adapt (hours into flight)
const ADAPT_SLEEP_THRESHOLD = 4;

/**
 * Compute the longitude difference: how many hours the body clock needs to shift.
 * Positive = eastward travel (harder), Negative = westward travel.
 */
function timezoneShiftHours(fromLon, toLon) {
    let diff = (toLon - fromLon);
    // Normalise to [-180, 180]
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    // Each 15° = 1 hour
    return diff / 15;
}

/**
 * computeJetLag — main export
 *
 * @param {object} params
 * @param {number} params.fromLon          — source longitude
 * @param {number} params.toLon            — destination longitude
 * @param {number} params.flightDurationHours
 * @param {Date}   params.departureTime
 * @param {'morning'|'neutral'|'night'} params.chronotype
 *
 * @returns {object} jetLagData
 */
export function computeJetLag({ fromLon, toLon, flightDurationHours, departureTime, chronotype = 'neutral' }) {
    const tzShift = timezoneShiftHours(fromLon, toLon);
    const isEastward = tzShift > 0;
    const absShift = Math.abs(tzShift);

    // Severity: 0 = none, 1 = mild, 2 = moderate, 3 = severe
    const rawSeverity = absShift < 2 ? 0 : absShift < 4 ? 1 : absShift < 7 ? 2 : 3;
    const severity = ['none', 'mild', 'moderate', 'severe'][rawSeverity];

    // If no meaningful shift, return early
    if (rawSeverity === 0) {
        return { severity, tzShiftHours: Math.round(tzShift * 10) / 10, schedule: [], tip: null };
    }

    const depHour = departureTime.getHours() + departureTime.getMinutes() / 60;
    const schedule = [];

    // ── Strategy ── 
    // Eastward: try to sleep as early as possible during the flight to shift body clock forward
    // Westward: stay awake as long as possible, sleep near the end

    if (isEastward) {
        // Sleep window: start sleeping within first ~2h, sleep for 3-5h
        const sleepStart = Math.min(1.5, flightDurationHours * 0.2);
        const sleepEnd = Math.min(sleepStart + Math.min(5, absShift * 0.6), flightDurationHours - 1);

        if (sleepStart < flightDurationHours - 1) {
            schedule.push({
                icon: '💡', action: 'Stay awake & get bright light',
                atHour: 0, label: 'Departure — fight drowsiness for now',
            });
        }
        if (sleepStart > 0) {
            schedule.push({
                icon: '😴', action: 'Sleep now',
                atHour: Math.round(sleepStart * 10) / 10,
                label: `Sleep ~${Math.round((sleepEnd - sleepStart) * 10) / 10}h to sync your body clock`,
            });
        }
        if (sleepEnd < flightDurationHours - 0.5) {
            schedule.push({
                icon: '☀️', action: 'Wake up & get light',
                atHour: Math.round(sleepEnd * 10) / 10,
                label: 'Avoid screens dimmed — seek the window sun',
            });
        }
        schedule.push({
            icon: '🚫', action: 'Avoid caffeine & alcohol',
            atHour: Math.round(flightDurationHours * 0.5 * 10) / 10,
            label: 'Dehydrates at altitude and disrupts sleep cycles',
        });
    } else {
        // Westward travel: stay awake as long as possible
        const stayAwakeUntil = Math.min(flightDurationHours * 0.65, flightDurationHours - 2);
        const sleepStart = stayAwakeUntil;
        const sleepEnd = flightDurationHours;

        schedule.push({
            icon: '💡', action: 'Stay awake',
            atHour: 0,
            label: `Keep going for ~${Math.round(stayAwakeUntil * 10) / 10}h — you're going "back in time"`,
        });
        if (sleepStart < flightDurationHours) {
            schedule.push({
                icon: '😴', action: 'Sleep now',
                atHour: Math.round(sleepStart * 10) / 10,
                label: 'Sleep through arrival to land feeling fresh',
            });
        }
        schedule.push({
            icon: '🚶', action: 'Walk & stretch',
            atHour: Math.round(flightDurationHours * 0.33 * 10) / 10,
            label: 'Keep circulation going while you stay awake',
        });
    }

    // Chronotype adjustment note
    let chronotipSuffix = '';
    if (chronotype === 'morning' && !isEastward) chronotipSuffix = ' (especially important for early birds going west)';
    if (chronotype === 'night' && isEastward) chronotipSuffix = ' (night owls find eastward travel hardest — follow this closely)';

    const tip = `${isEastward ? 'Eastward' : 'Westward'} flight, ${Math.abs(Math.round(tzShift))}h time zone shift. Recovery usually takes ~${Math.ceil(absShift * (isEastward ? 1 : 0.7))} days.${chronotipSuffix}`;

    return {
        severity,
        tzShiftHours: Math.round(tzShift * 10) / 10,
        isEastward,
        schedule: schedule.sort((a, b) => a.atHour - b.atHour),
        tip,
        chronotype,
    };
}
