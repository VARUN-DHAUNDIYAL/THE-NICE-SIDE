import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { motion } from 'framer-motion';
import SunburstThreeBackground from './components/SunburstThreeBackground';
import FlightDetailsForm from './components/FlightDetailsForm';
import RecommendationCard from './components/RecommendationCard';
import { getGreatCirclePoints, getBearing } from './utils/geo';
import SunCalc from 'suncalc';
import './App.css';
import ResultPage from './components/ResultPage';
import HeroSection from './components/HeroSection';

function getRelativeAngle(bearing, sunAzimuth) {
  // Normalize to [-180, 180] degrees
  let angle = ((sunAzimuth - bearing) * 180) / Math.PI;
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
}

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

  // On form submit, always use great-circle path
  const handleFormSubmit = async (data) => {
    const { sourceCoords, destinationCoords, flightTime, departureDateTime, sourceCity, destinationCity } = data;
    if (sourceCoords && destinationCoords && flightTime && departureDateTime) {
      // Always use great-circle path
        const totalMinutes = parseFloat(flightTime) * 60;
        const numPoints = Math.max(2, Math.round(totalMinutes / 10));
      const pathPoints = getGreatCirclePoints(sourceCoords, destinationCoords, numPoints);

      const departure = new Date(departureDateTime);
      let leftCount = 0, rightCount = 0;
      const sunriseSunsetMarkers = [];
      
      for (let i = 0; i < pathPoints.length - 1; i++) {
        const pt = pathPoints[i];
        const nextPt = pathPoints[i + 1];
        const minutesFromStart = (parseFloat(flightTime) * 60 / pathPoints.length) * i;
        const timeAtPoint = new Date(departure.getTime() + minutesFromStart * 60000);
        const sun = SunCalc.getPosition(timeAtPoint, pt.lat, pt.lon);
        const times = SunCalc.getTimes(timeAtPoint, pt.lat, pt.lon);
        
        // Check if this point is within 30 minutes of sunrise or sunset
        const isNearSunrise = Math.abs(timeAtPoint - times.sunrise) < 30 * 60 * 1000;
        const isNearSunset = Math.abs(timeAtPoint - times.sunset) < 30 * 60 * 1000;
        
        if (isNearSunrise) {
          sunriseSunsetMarkers.push({ type: 'sunrise', lat: pt.lat, lon: pt.lon, idx: i, time: timeAtPoint });
        }
        if (isNearSunset) {
          sunriseSunsetMarkers.push({ type: 'sunset', lat: pt.lat, lon: pt.lon, idx: i, time: timeAtPoint });
        }
        
        if (sun.altitude <= 0) continue;
        const bearing = getBearing(pt, nextPt);
        const relAngle = getRelativeAngle(bearing, sun.azimuth);
        if (relAngle > 90 || relAngle < -90) {
          leftCount++;
        } else {
          rightCount++;
        }
      }

      // Debug log for sunrise/sunset markers
      if (sunriseSunsetMarkers.length > 0) {
        const sunriseCount = sunriseSunsetMarkers.filter(m => m.type === 'sunrise').length;
        const sunsetCount = sunriseSunsetMarkers.filter(m => m.type === 'sunset').length;
        console.log(`Detected ${sunriseCount} sunrise(s) and ${sunsetCount} sunset(s) along the route.`);
      } else {
        console.log('No sunrise or sunset events detected along the route.');
      }

      let rec, detail, type;
      if (leftCount === 0 && rightCount === 0) {
        rec = 'No sun visible during your flight.';
        detail = 'The sun will be below the horizon for the entire route.';
        type = 'none';
      } else if (leftCount > rightCount) {
        rec = 'Sit on the LEFT side!';
        detail = `You'll enjoy the sun for about ${Math.round((leftCount * parseFloat(flightTime) * 60) / pathPoints.length)} minutes on the left side.`;
        type = 'left';
      } else if (rightCount > leftCount) {
        rec = 'Sit on the RIGHT side!';
        detail = `You'll enjoy the sun for about ${Math.round((rightCount * parseFloat(flightTime) * 60) / pathPoints.length)} minutes on the right side.`;
        type = 'right';
      } else {
        rec = 'Either side is fine!';
        detail = 'The sun will be visible equally on both sides during your flight.';
        type = 'equal';
      }

      setRecommendation({
        rec,
        detail,
        type,
        pathPoints,
        source: sourceCoords,
        destination: destinationCoords,
        usedRealRoute: false,
        sunriseSunsetMarkers,
      });

      setSummary({
        source: sourceCity?.display_name || 'Source',
        destination: destinationCity?.display_name || 'Destination',
        time: departure.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        duration: flightTime,
      });

      setPage('result');
    } else {
      setRecommendation(null);
      setSummary(null);
      alert('Missing coordinates, flight time, or departure time.');
    }
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
