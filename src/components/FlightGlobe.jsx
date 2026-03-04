import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

// ── Marker config ──────────────────────────────────────────────────────────────
const MARKER_CONFIG = {
    departure: { size: 0.65, color: '#00FF88', label: '✈️ Departure', tip: 'Your flight takes off from here.' },
    destination: { size: 0.65, color: '#FF4081', label: '🛬 Destination', tip: 'Your flight lands here.' },
    sunrise: { size: 0.48, color: '#FFFF33', label: '🌅 Sunrise', tip: 'Sunrise — golden light through your window!' },
    sunset: { size: 0.48, color: '#FFB300', label: '🌇 Sunset', tip: 'Sunset — orange skies coming up!' },
    sun: { size: 1.4, color: '#FFD700', label: '☀️ Sun', tip: 'Approximate sun position.' },
    city_lights: { size: 0.28, color: '#00E5FF', label: '🌃 City Lights', tip: (d) => `Near ${d.name || 'a major city'} — look out at night! (${d.side || 'either'} window)` },
    landmark: { size: 0.38, color: '#FFFFFF', label: '📍 Landmark', tip: (d) => `${d.name || 'Landmark'} — visible from your window (${d.side || 'either'} side)` },
    aurora: { size: 0.45, color: '#69FF91', label: '🌌 Aurora', tip: (d) => `Aurora zone ~${d.maxLat || 60}°N — look for northern lights!` },
    turbulence: { size: 0.38, color: '#FF7043', label: '🌪️ Turbulence', tip: (d) => `Turbulence: ${d.name || 'rough air'}. Fasten seatbelt!` },
    moon: { size: 0.75, color: '#C8B0FF', label: '🌙 Moon', tip: 'Moon position during the night portion.' },
};

function getMarkerCfg(d) { return MARKER_CONFIG[d.kind] || { size: 0.2, color: '#fff', label: '', tip: '' }; }
function getTip(d) { const c = getMarkerCfg(d); return typeof c.tip === 'function' ? c.tip(d) : (c.tip || ''); }

// Module-scope stable helpers
function getDistance(la1, lo1, la2, lo2) {
    const R = 6371, r = x => x * Math.PI / 180;
    const a = Math.sin(r(la2 - la1) / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(r(lo2 - lo1) / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildMarkerObj(d) {
    const cfg = getMarkerCfg(d);
    const g = new THREE.Group();
    // Core solid dot
    g.add(new THREE.Mesh(new THREE.SphereGeometry(cfg.size, 24, 24), new THREE.MeshBasicMaterial({ color: cfg.color })));

    // Add glowing multi-layered halos for key points
    if (['departure', 'destination', 'sunrise', 'sunset', 'landmark', 'aurora', 'turbulence'].includes(d.kind)) {
        // Inner intense halo
        g.add(new THREE.Mesh(
            new THREE.RingGeometry(cfg.size * 1.3, cfg.size * 1.8, 32),
            new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }),
        ));
        // Outer soft halo
        g.add(new THREE.Mesh(
            new THREE.RingGeometry(cfg.size * 2.0, cfg.size * 2.8, 32),
            new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide, transparent: true, opacity: 0.2 }),
        ));
        // Subtle burst ring
        g.add(new THREE.Mesh(
            new THREE.RingGeometry(cfg.size * 3.2, cfg.size * 3.4, 32),
            new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide, transparent: true, opacity: 0.08 }),
        ));
    }
    return g;
}

const ALT_MAP = { sun: 1.0, moon: 0.8, sunrise: 0.07, sunset: 0.07, departure: 0.07, destination: 0.07, landmark: 0.06, aurora: 0.06, turbulence: 0.05, city_lights: 0.04 };

export default function FlightGlobe({
    pathPoints, source, destination, recommendedSide,
    sunriseSunsetMarkers, cityFlybys = [], landmarkAlerts = [],
    auroraSegments = [], turbulenceSegments = [], moonLat, moonLon,
    width, height,
}) {
    const globeRef = useRef();
    const tooltipRef = useRef();
    const mousePosRef = useRef({ x: 0, y: 0 });

    const pathsData = useMemo(() =>
        (pathPoints?.length >= 2) ? [{ coords: pathPoints.map(p => [p.lat, p.lon]) }] : [],
        [pathPoints]);

    const customLayerData = useMemo(() => {
        const d = [];
        if (source) d.push({ lat: source.lat, lng: source.lon, kind: 'departure', name: source.name });
        if (destination) d.push({ lat: destination.lat, lng: destination.lon, kind: 'destination', name: destination.name });

        const side = (recommendedSide || '').toLowerCase();
        if (side === 'left' || side === 'right') {
            sunriseSunsetMarkers?.forEach(m => d.push({ lat: m.lat, lng: m.lon, kind: m.type === 'sunrise' ? 'sunrise' : 'sunset' }));
            if (source && destination) {
                const mlat = (source.lat + destination.lat) / 2, mlon = (source.lon + destination.lon) / 2;
                const east = destination.lon >= source.lon;
                const off = Math.max(15, getDistance(source.lat, source.lon, destination.lat, destination.lon) / 100);
                const loff = east ? (side === 'left' ? off : -off) : (side === 'left' ? -off : off);
                d.push({ lat: Math.max(-80, Math.min(80, mlat + loff)), lng: mlon, kind: 'sun' });
            }
        }
        cityFlybys.forEach(c => d.push({ lat: c.lat, lng: c.lon, kind: 'city_lights', name: c.name, side: c.side }));
        landmarkAlerts.forEach(l => d.push({ lat: l.lat, lng: l.lon, kind: 'landmark', name: l.name, side: l.side }));
        auroraSegments.forEach(s => d.push({ lat: s.lat, lng: s.lon, kind: 'aurora', maxLat: s.maxLat }));
        turbulenceSegments.forEach(s => d.push({ lat: s.lat, lng: s.lon, kind: 'turbulence', name: s.name }));
        if (moonLat != null && moonLon != null) d.push({ lat: moonLat, lng: moonLon, kind: 'moon' });
        return d;
    }, [source, destination, sunriseSunsetMarkers, recommendedSide, cityFlybys, landmarkAlerts, auroraSegments, turbulenceSegments, moonLat, moonLon]);

    const updateMarker = useCallback((obj, d) => {
        if (!globeRef.current) return;
        const coords = globeRef.current.getCoords(d.lat, d.lng, ALT_MAP[d.kind] ?? 0.05);
        if (coords) Object.assign(obj.position, coords);
    }, []);

    // DOM tooltip — zero React state
    const showTooltip = useCallback((d) => {
        const el = tooltipRef.current;
        if (!el) return;
        const cfg = getMarkerCfg(d);
        const tip = getTip(d);
        const sideHint = d.side ? `<div style="margin-top:5px;font-size:0.62rem;color:rgba(255,255,255,0.4);font-weight:600">👀 Look ${d.side.toUpperCase()} window</div>` : '';
        el.innerHTML = `
      <div style="font-weight:700;font-size:0.82rem;color:${cfg.color};margin-bottom:4px">
        ${cfg.label}${d.name ? ` <span style="font-weight:400;color:rgba(255,255,255,0.48);font-size:0.7rem">· ${d.name}</span>` : ''}
      </div>
      <div style="font-size:0.72rem;color:rgba(255,255,255,0.68);line-height:1.45">${tip}</div>
      ${sideHint}
    `;
        el.style.borderColor = cfg.color + '55';
        el.style.boxShadow = `0 4px 22px ${cfg.color}25`;
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.left = (mousePosRef.current.x + 16) + 'px';
        el.style.top = (mousePosRef.current.y - 12) + 'px';
    }, []);

    const hideTooltip = useCallback(() => {
        const el = tooltipRef.current;
        if (el) { el.style.opacity = '0'; setTimeout(() => { if (el) el.style.display = 'none'; }, 120); }
    }, []);

    useEffect(() => {
        const onMove = (e) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
            const el = tooltipRef.current;
            if (el && el.style.display !== 'none') {
                el.style.left = (e.clientX + 16) + 'px';
                el.style.top = (e.clientY - 12) + 'px';
            }
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    const handleGlobeMount = useCallback((node) => {
        if (!node || !source || !destination) return;
        globeRef.current = node;
        setTimeout(() => {
            const mid = { lat: (source.lat + destination.lat) / 2, lng: (source.lon + destination.lon) / 2 };
            const dist = getDistance(source.lat, source.lon, destination.lat, destination.lon);
            // For fullscreen, use a tighter altitude for drama
            const alt = Math.min(Math.max(dist / 3000, 0.18), 1.8);
            node.pointOfView({ ...mid, altitude: alt }, 2000);
        }, 800);
    }, [source, destination]);

    // Legend items
    const legendItems = useMemo(() => {
        const items = [{ kind: 'departure', label: 'Departure' }, { kind: 'destination', label: 'Destination' }];
        const side = (recommendedSide || '').toLowerCase();
        if (side === 'left' || side === 'right') {
            if (sunriseSunsetMarkers?.some(m => m.type === 'sunrise')) items.push({ kind: 'sunrise', label: 'Sunrise' });
            if (sunriseSunsetMarkers?.some(m => m.type === 'sunset')) items.push({ kind: 'sunset', label: 'Sunset' });
            items.push({ kind: 'sun', label: 'Sun' });
        }
        if (cityFlybys.length) items.push({ kind: 'city_lights', label: 'City lights' });
        if (landmarkAlerts.length) items.push({ kind: 'landmark', label: 'Landmark' });
        if (auroraSegments.length) items.push({ kind: 'aurora', label: 'Aurora' });
        if (turbulenceSegments.length) items.push({ kind: 'turbulence', label: 'Turbulence' });
        if (moonLat != null) items.push({ kind: 'moon', label: 'Moon' });
        return items;
    }, [recommendedSide, sunriseSunsetMarkers, cityFlybys, landmarkAlerts, auroraSegments, turbulenceSegments, moonLat]);

    return (
        <div style={{ position: 'relative', width: width || '100%', height: height || '100%' }}>
            <Globe
                ref={handleGlobeMount}
                width={width}
                height={height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                atmosphereColor="#4488ff"
                atmosphereAltitude={0.22}
                pathsData={pathsData}
                pathPoints="coords"
                pathPointLat={p => p[0]}
                pathPointLng={p => p[1]}
                pathPointAlt={0.005}
                pathColor={() => ['rgba(0,200,255,1)', 'rgba(255,64,129,1)']}
                pathStroke={7}
                customLayerData={customLayerData}
                customThreeObject={buildMarkerObj}
                customThreeObjectUpdate={updateMarker}
                onCustomLayerHover={(d) => {
                    d ? showTooltip(d) : hideTooltip();
                    if (globeRef.current) {
                        globeRef.current.renderer().domElement.style.cursor = d ? 'pointer' : 'default';
                    }
                }}
                enablePointerInteraction={true}
                rendererConfig={{ preserveDrawingBuffer: true, antialias: true }}
            />

            {/* Compact legend — bottom-left of the globe */}
            <div style={{
                position: 'absolute', bottom: 128, left: 20, zIndex: 10,
                background: 'rgba(5,10,28,0.68)',
                backdropFilter: 'blur(12px)',
                borderRadius: 10, padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexWrap: 'wrap', gap: '5px 14px',
                maxWidth: 280,
            }}>
                {legendItems.map(item => {
                    const cfg = MARKER_CONFIG[item.kind];
                    return (
                        <div key={item.kind} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg?.color, boxShadow: `0 0 4px 1px ${cfg?.color}88`, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: 0.3 }}>{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* DOM tooltip */}
            <div
                ref={tooltipRef}
                style={{
                    position: 'fixed', display: 'none', opacity: 0,
                    background: 'rgba(8,12,32,0.96)',
                    border: '1.5px solid transparent',
                    borderRadius: 12, padding: '9px 13px',
                    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
                    pointerEvents: 'none', maxWidth: 240, zIndex: 9999,
                    transition: 'opacity 0.12s ease', fontFamily: 'inherit',
                }}
            />
        </div>
    );
}
