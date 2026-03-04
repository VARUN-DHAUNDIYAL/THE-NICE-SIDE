import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SunburstThreeBackground from './components/SunburstThreeBackground';
import FlightDetailsForm from './components/FlightDetailsForm';
import { computeFlightData } from './utils/flightCompute';
import './App.css';
import ResultPage from './components/ResultPage';
import HeroSection from './components/HeroSection';


export default function App() {
  const [page, setPage] = useState('form');
  const [recommendation, setRecommendation] = useState(null);
  const [summary, setSummary] = useState(null);
  // Day-night animation state
  const [dayNight, setDayNight] = useState(0);
  const formRef = React.useRef();

  useEffect(() => {
    let frame;
    let start = Date.now();
    function animate() {
      const elapsed = (Date.now() - start) / 1000;
      setDayNight(((elapsed / 90) % 1)); // 90s for a full cycle
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  // On form submit — delegate ALL computation to flightCompute engine
  const handleFormSubmit = (data) => {
    const { sourceCoords, destinationCoords, flightTime, departureDateTime, sourceCity, destinationCity } = data;
    if (!sourceCoords || !destinationCoords || !flightTime || !departureDateTime) {
      alert('Missing coordinates, flight time, or departure time.');
      return;
    }

    const flightData = computeFlightData({
      sourceCoords,
      destinationCoords,
      sourceName: sourceCity?.display_name || 'Source',
      destinationName: destinationCity?.display_name || 'Destination',
      flightDurationHours: parseFloat(flightTime),
      departureDateTime,
      chronotype: data.chronotype || 'neutral',
      aircraftType: data.aircraftType || 'unknown',
    });

    setRecommendation({
      rec: flightData.rec,
      detail: flightData.detail,
      type: flightData.recommendedSide,
      pathPoints: flightData.pathPoints,
      source: flightData.source,
      destination: flightData.destination,
      sunriseSunsetMarkers: flightData.sunriseSunsetMarkers,
      goldenHourEvents: flightData.goldenHourEvents,
      cityFlybys: flightData.cityFlybys,
      landmarkAlerts: flightData.landmarkAlerts,
      auroraSegments: flightData.auroraSegments,
      turbulenceSegments: flightData.turbulenceSegments,
      timelineEvents: flightData.timelineEvents,
      sunburnRisk: flightData.sunburnRisk,
      // Phase 5-6-10
      moonSide: flightData.moonSide,
      moonLat: flightData.moonLat,
      moonLon: flightData.moonLon,
      noiseRecommendation: flightData.noiseRecommendation,
      jetLagData: flightData.jetLagData,
    });

    const departure = new Date(departureDateTime);
    setSummary({
      source: sourceCity?.display_name || 'Source',
      destination: destinationCity?.display_name || 'Destination',
      time: departure.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      rawTime: departureDateTime,
      duration: flightTime,
    });

    setPage('result');
  };

  const handleBack = () => {
    setPage('form');
  };

  const handleGetStarted = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="app">
      <SunburstThreeBackground dayNight={dayNight} />
      <div style={{ minHeight: '100vh', width: '100vw', padding: 0 }}>
        {page === 'form' && (
          <>
            <HeroSection onGetStarted={handleGetStarted} />
            <FlightDetailsForm onSubmit={handleFormSubmit} ref={formRef} />
          </>
        )}
        {page === 'result' && recommendation && summary && (
          <ResultPage
            recommendation={recommendation}
            summary={summary}
            onBack={handleBack}
            dayNight={dayNight}
          />
        )}
      </div>
    </div>
  );
}
