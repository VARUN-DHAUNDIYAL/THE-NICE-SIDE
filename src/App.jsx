import React, { useState } from 'react';
import EntryGlobe from './components/EntryGlobe';
import FlightDetailsForm from './components/FlightDetailsForm';
import { computeFlightData } from './utils/flightCompute';
import './App.css';
import ResultPage from './components/ResultPage';

export default function App() {
  const [page, setPage] = useState('form');
  const [recommendation, setRecommendation] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sourceData, setSourceData] = useState(null);
  const [destinationData, setDestinationData] = useState(null);

  const handleFormSubmit = (data) => {
    const { sourceCoords, destinationCoords, flightTime, departureDateTime, sourceCity, destinationCity } = data;
    if (!sourceCoords || !destinationCoords || !flightTime || !departureDateTime) {
      alert('Missing coordinates, flight time, or departure time.');
      return;
    }
    const flightData = computeFlightData({
      sourceCoords, destinationCoords,
      sourceName: sourceCity?.display_name || 'Source',
      destinationName: destinationCity?.display_name || 'Destination',
      flightDurationHours: parseFloat(flightTime),
      departureDateTime,
      chronotype: data.chronotype || 'neutral',
      aircraftType: data.aircraftType || 'unknown',
    });
    setRecommendation({
      rec: flightData.rec, detail: flightData.detail, type: flightData.recommendedSide,
      pathPoints: flightData.pathPoints, source: flightData.source, destination: flightData.destination,
      sunriseSunsetMarkers: flightData.sunriseSunsetMarkers, goldenHourEvents: flightData.goldenHourEvents,
      cityFlybys: flightData.cityFlybys, landmarkAlerts: flightData.landmarkAlerts,
      auroraSegments: flightData.auroraSegments, turbulenceSegments: flightData.turbulenceSegments,
      timelineEvents: flightData.timelineEvents, sunburnRisk: flightData.sunburnRisk,
      moonSide: flightData.moonSide, moonLat: flightData.moonLat, moonLon: flightData.moonLon,
      noiseRecommendation: flightData.noiseRecommendation, jetLagData: flightData.jetLagData,
    });
    const departure = new Date(departureDateTime);
    setSummary({
      source: sourceCity?.display_name || 'Source',
      destination: destinationCity?.display_name || 'Destination',
      time: departure.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      rawTime: departureDateTime, duration: flightTime,
    });
    setPage('result');
  };

  const handleBack = () => { setPage('form'); setSourceData(null); setDestinationData(null); };

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden', position: 'fixed', top: 0, left: 0,
      background: '#030810', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {/* ── Entry Page ──────────────────────────────────────────────────────── */}
      {page === 'form' && (
        <>
          {/* 3D globe — full screen, true hero element */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <EntryGlobe source={sourceData} destination={destinationData} />
          </div>

          {/* Top: branding — appears above globe with minimal footprint */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            zIndex: 2, textAlign: 'center', padding: '32px 20px 0',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.22em',
              color: 'rgba(0,229,255,0.75)', textTransform: 'uppercase', marginBottom: 10,
            }}>
              ✈ Flight Master
            </div>
            <h1 style={{
              margin: 0, fontWeight: 900,
              fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)',
              color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.12,
              textShadow: '0 2px 40px rgba(0,0,0,0.8)',
            }}>
              Master Your{' '}
              <span style={{
                background: 'linear-gradient(90deg,#00e5ff,#a855f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Sky Journey</span>
            </h1>
            <p style={{
              margin: '8px 0 0', color: 'rgba(255,255,255,0.45)',
              fontSize: '0.85rem', fontWeight: 400,
            }}>
              Flight intelligence · Window seat · Golden hours · City lights
            </p>
          </div>

          {/* Bottom: form panel — sits at the bottom, globe occupies the top 60% */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            zIndex: 2,
            display: 'flex', justifyContent: 'center',
            padding: '0 20px 20px',
          }}>
            <div style={{ width: '100%', maxWidth: 680 }}>
              <FlightDetailsForm
                onSubmit={handleFormSubmit}
                onSourceSelect={setSourceData}
                onDestinationSelect={setDestinationData}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Result Page ─────────────────────────────────────────────────────── */}
      {page === 'result' && recommendation && summary && (
        <ResultPage recommendation={recommendation} summary={summary} onBack={handleBack} dayNight={0} />
      )}
    </div>
  );
}
