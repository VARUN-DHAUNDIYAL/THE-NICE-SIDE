import React, { useEffect } from 'react';
import * as THREE from 'three';

export default function SunburstThreeBackground() {
  useEffect(() => {
    // CONFIGURATION
    const movementSpeed = 0.09; // much slower for subtlety
    const totalStars = 3300; // more stars for denser sprinkle
    const d = 600;
    let renderer, scene, camera, sun, glow, animationId, stars = [];
    let bgDiv = document.getElementById('sunburst-bg-gradient');

    // SCENE SETUP
    scene = new THREE.Scene();
    // Orthographic camera for undistorted sun
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect, d, -d, 1, 2000
    );
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // SUN SPHERE (always a perfect circle)
    const sunGeometry = new THREE.SphereGeometry(80, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.z = 0;
    scene.add(sun);

    // LIGHTING GLOW (soft circular, with radial gradient texture)
    function createRadialGlowTexture(size = 256) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, size * 0.18,
        size / 2, size / 2, size / 2
      );
      gradient.addColorStop(0, 'rgba(255, 236, 180, 0.95)');
      gradient.addColorStop(0.4, 'rgba(255, 200, 120, 0.45)');
      gradient.addColorStop(1, 'rgba(255, 200, 120, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    }
    const glowTexture = createRadialGlowTexture(256);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xFDB813,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(400, 400, 1);
    sun.add(glow);

    // Helper to create stars within current camera bounds
    function getCameraBounds() {
      const aspect = window.innerWidth / window.innerHeight;
      const width = d * aspect * 2;
      const height = d * 2;
      return {
        minX: -d * aspect - 100, // margin
        maxX: d * aspect + 100,
        minY: -d - 100,
        maxY: d + 100
      };
    }
    function createStar(bounds) {
      const geometry = new THREE.SphereGeometry(Math.random() * 0.8 + 0.7, 10, 10);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.18 + 0.10
      });
      const star = new THREE.Mesh(geometry, material);
      // Place randomly within camera bounds
      star.position.x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
      star.position.y = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
      star.position.z = -Math.random() * 400 - 100;
      star.userData = {
        twinkleSpeed: Math.random() * 0.008 + 0.002,
        twinklePhase: Math.random() * Math.PI * 2
      };
      scene.add(star);
      return star;
    }
    function generateStars() {
      // Remove old stars
      stars.forEach(star => scene.remove(star));
      stars = [];
      const bounds = getCameraBounds();
      for (let i = 0; i < totalStars; i++) {
        stars.push(createStar(bounds));
      }
    }
    generateStars();

    // Helper: interpolate between two colors
    function lerpColor(a, b, t) {
      return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t),
      ];
    }
    function rgbToStr([r, g, b]) {
      return `rgb(${r},${g},${b})`;
    }
    // Key colors for the gradient (dawn, sunrise, day, sunset, dusk, night)
    const skyColors = [
      { y: 0.0, color: [10, 18, 38] },      // Night (bottom)
      { y: 0.18, color: [72, 60, 120] },    // Dawn
      { y: 0.32, color: [255, 160, 72] },   // Sunrise
      { y: 0.5, color: [120, 180, 255] },   // Day (zenith)
      { y: 0.68, color: [255, 120, 72] },   // Sunset
      { y: 0.82, color: [72, 60, 120] },    // Dusk
      { y: 1.0, color: [10, 18, 38] },      // Night (top)
    ];
    // Smoothstep function for natural blending
    function smoothstep(t) {
      return t * t * (3 - 2 * t);
    }
    // Interpolate between multiple color stops
    function getSkyColor(normY) {
      for (let i = 1; i < skyColors.length; i++) {
        if (normY <= skyColors[i].y) {
          const prev = skyColors[i - 1];
          const next = skyColors[i];
          const localT = (normY - prev.y) / (next.y - prev.y);
          const t = smoothstep(localT);
          return lerpColor(prev.color, next.color, t);
        }
      }
      return skyColors[skyColors.length - 1].color;
    }

    // ANIMATE
    let sunAngle = 0;
    function render() {
      animationId = requestAnimationFrame(render);
      // Dynamically calculate arc based on camera bounds
      const aspect = window.innerWidth / window.innerHeight;
      const left = -d * aspect;
      const right = d * aspect;
      const top = d;
      const bottom = -d;
      const arcRadius = (right - left) / 2;
      const sunRadius = 80; // matches sunGeometry
      // Set vertical center and arc height so sun stays fully visible
      const margin = sunRadius + 20;
      const centerY = bottom + margin + (top - bottom - 2 * margin) / 2;
      const arcHeight = (top - bottom - 2 * margin) / 2;
      // Sun moves in a smooth arc from left to right and back
      sunAngle += 0.0007;
      const t = (Math.sin(sunAngle) + 1) / 2; // t goes from 0 to 1 and back
      // Parametric equation for arc: x from left to right, y as a downward arc
      sun.position.x = left + t * (right - left);
      sun.position.y = centerY + Math.sin(t * Math.PI) * arcHeight;
      // Calculate sun's normalized screen position (0-1)
      const sunScreenX = (sun.position.x - left) / (right - left);
      const sunScreenY = 1 - (sun.position.y - bottom) / (top - bottom); // invert Y for CSS
      // Radial gradient colors
      const colorNearSun = 'rgba(255, 180, 72, 1)'; // orange/yellow
      const colorMid = 'rgba(120, 40, 120, 0.85)'; // deep reddish-purple
      const colorFar = 'rgba(10, 18, 38, 1)'; // dark blue/black
      // Calculate how close the sun is to the center (0=center, 1=edge)
      const distToCenter = Math.sqrt(Math.pow(sunScreenX - 0.5, 2) + Math.pow(sunScreenY - 0.5, 2)) / 0.7071; // normalized
      // The closer to center, the larger the orange/purple region; at edge, mostly blue/black
      const stop1 = 0.0;
      const stop2 = 18 + 32 * t; // orange radius (18% to 50%)
      const stop3 = 38 + 32 * t; // purple radius (38% to 70%)
      const grad = `radial-gradient(circle at ${sunScreenX * 100}% ${sunScreenY * 100}%, ${colorNearSun} ${stop1}%, ${colorMid} ${stop2}%, ${colorFar} ${stop3}%, ${colorFar} 100%)`;
      if (!bgDiv) bgDiv = document.getElementById('sunburst-bg-gradient');
      if (bgDiv) bgDiv.style.background = grad;
      // Animate stars (twinkle and soft random movement)
      const bounds = getCameraBounds();
      stars.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(performance.now() * star.userData.twinkleSpeed + star.userData.twinklePhase);
        star.material.opacity = 0.10 + 0.18 * twinkle;
        // Minimal movement for subtlety
        star.position.x += (Math.random() - 0.5) * movementSpeed * 0.2;
        star.position.y += (Math.random() - 0.5) * movementSpeed * 0.2;
        // Keep within camera bounds
        if (star.position.x > bounds.maxX) star.position.x = bounds.minX;
        if (star.position.x < bounds.minX) star.position.x = bounds.maxX;
        if (star.position.y > bounds.maxY) star.position.y = bounds.minY;
        if (star.position.y < bounds.minY) star.position.y = bounds.maxY;
      });
      renderer.render(scene, camera);
    }
    render();

    // EVENTS
    function handleResize() {
      const aspect = window.innerWidth / window.innerHeight;
      camera.left = -d * aspect;
      camera.right = d * aspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      generateStars(); // re-generate stars to fill new bounds
    }
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      // Remove all objects from scene
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, []);

  // Add a div for the animated gradient background
  return (
    <>
      <div id="sunburst-bg-gradient" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        transition: 'background 2s',
        pointerEvents: 'none',
      }} />
      <canvas id="bg" className="three-bg-canvas"></canvas>
    </>
  );
} 