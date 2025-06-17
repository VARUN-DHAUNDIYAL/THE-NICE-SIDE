import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const sourceIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -36],
});
const destIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -36],
});
const sunriseIcon = new L.DivIcon({
  html: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" fill="#ffe082" stroke="#ff9800" stroke-width="2"/><path d="M7 21h14" stroke="#ff9800" stroke-width="2"/><path d="M14 14v-6" stroke="#ff9800" stroke-width="2"/><path d="M10 18l-3 3" stroke="#ff9800" stroke-width="2"/><path d="M18 18l3 3" stroke="#ff9800" stroke-width="2"/></svg>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});
const sunsetIcon = new L.DivIcon({
  html: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="18" r="8" fill="#ff9800" stroke="#ff512f" stroke-width="2"/><path d="M7 21h14" stroke="#ff512f" stroke-width="2"/><path d="M14 18v-6" stroke="#ff512f" stroke-width="2"/><path d="M10 22l-3 3" stroke="#ff512f" stroke-width="2"/><path d="M18 22l3 3" stroke="#ff512f" stroke-width="2"/></svg>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitBounds({ pathPoints }) {
  const map = useMap();
  useEffect(() => {
    if (pathPoints && pathPoints.length > 1) {
      const bounds = L.latLngBounds(pathPoints.map(pt => [pt.lat, pt.lon]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, pathPoints]);
  return null;
}

function ForceResizeOnMobile() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);
  return null;
}

export default function FlightMap({ pathPoints, source, destination, sunPositions = [], recommendedSide, sunriseSunsetMarkers = [] }) {
  // Debug logs
  console.log('FlightMap pathPoints:', JSON.stringify(pathPoints, null, 2));
  console.log('FlightMap source:', JSON.stringify(source, null, 2));
  console.log('FlightMap destination:', JSON.stringify(destination, null, 2));
  console.log('FlightMap sunriseSunsetMarkers:', JSON.stringify(sunriseSunsetMarkers, null, 2));

  return (
    <div className="map-responsive" style={{
      width: '100%',
      maxWidth: 'none',
      height: 'min(480px, 40vw)',
      minHeight: 220,
      margin: '32px auto 0 auto',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: 'none',
      backdropFilter: 'blur(8px)',
      zIndex: 5,
    }}>
      <MapContainer
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        keyboard={false}
        touchZoom={false}
        boxZoom={false}
        center={pathPoints && pathPoints.length > 0 ? [pathPoints[0].lat, pathPoints[0].lon] : [0,0]}
        zoom={3}
      >
        <ForceResizeOnMobile />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds pathPoints={pathPoints} />
        <Polyline
          positions={pathPoints.map(pt => [pt.lat, pt.lon])}
          pathOptions={{ color: recommendedSide === 'left' ? '#ffe082' : recommendedSide === 'right' ? '#90cdf4' : '#ffb300', weight: 5, opacity: 0.88 }}
        />
        {source && (
          <Marker position={[source.lat, source.lon]} icon={sourceIcon} />
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lon]} icon={destIcon} />
        )}
        {sunPositions && sunPositions.length > 0 && sunPositions.map((pos, i) => (
          <CircleMarker
            key={i}
            center={[pos.lat, pos.lon]}
            radius={6}
            pathOptions={{ color: '#ffd700', fillColor: '#ffe082', fillOpacity: 0.7 }}
          />
        ))}
        {/* Sunrise/sunset markers */}
        {sunriseSunsetMarkers.map((m, i) => (
          <Marker
            key={`ss-${i}`}
            position={[m.lat, m.lon]}
            icon={m.type === 'sunrise' ? sunriseIcon : sunsetIcon}
            eventHandlers={{
              mouseover: (e) => {
                const popup = L.popup()
                  .setLatLng([m.lat, m.lon])
                  .setContent(`<b>${m.type === 'sunrise' ? 'Sunrise' : 'Sunset'}</b><br>${new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
                  .openOn(e.target._map);
              },
              mouseout: (e) => {
                e.target._map.closePopup();
              },
            }}
          />
        ))}
      </MapContainer>
      <style>{`
        @media (max-width: 600px) {
          .map-responsive {
            max-width: 100vw !important;
            min-width: 0 !important;
            height: 220px !important;
          }
        }
      `}</style>
    </div>
  );
} 