import React, { useRef, useEffect, useState } from 'react';

export default function SunsetRaysBackground() {
  const canvasRef = useRef(null);
  const [dpr, setDpr] = useState(window.devicePixelRatio || 1);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setDpr(window.devicePixelRatio || 1);
    const handleResize = () => setDpr(window.devicePixelRatio || 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function drawRays() {
      const width = window.innerWidth * dpr;
      const height = window.innerHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Soft warm-to-cool gradient overlay
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#f8c390'); // warm
      bgGrad.addColorStop(0.7, '#f7b267');
      bgGrad.addColorStop(1, '#b2d8f7'); // cool
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Sun position (top-left, with parallax)
      const sunX = 0.12 * width + (mouse.x - 0.5) * 60 * dpr;
      const sunY = 0.13 * height + (mouse.y - 0.5) * 40 * dpr;
      const sunRadius = Math.max(width, height) * 0.13;
      const now = Date.now() / 1000;
      const rayCount = 36;
      const baseHue = 32; // softer orange
      const rayLength = Math.max(width, height) * 1.3;

      // Draw rays (softer, more blended)
      for (let i = 0; i < rayCount; i++) {
        const angle = (Math.PI * 2 * i) / rayCount;
        // Animate hue and alpha
        const hue = (baseHue + 8 * Math.sin(now * 0.7 + i * 0.5)) % 360;
        const alpha = 0.07 + 0.06 * Math.sin(now * 0.8 + i);
        const grad = ctx.createLinearGradient(
          sunX,
          sunY,
          sunX + Math.cos(angle) * rayLength,
          sunY + Math.sin(angle) * rayLength
        );
        grad.addColorStop(0, `hsla(${hue}, 98%, 75%, ${alpha})`);
        grad.addColorStop(0.5, `hsla(${hue + 10}, 98%, 65%, ${alpha * 0.6})`);
        grad.addColorStop(1, `hsla(${hue + 20}, 98%, 60%, 0)`);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(
          sunX + Math.cos(angle - 0.025) * rayLength,
          sunY + Math.sin(angle - 0.025) * rayLength
        );
        ctx.lineTo(
          sunX + Math.cos(angle + 0.025) * rayLength,
          sunY + Math.sin(angle + 0.025) * rayLength
        );
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.filter = 'blur(2.5px)';
        ctx.fill();
        ctx.restore();
      }

      // Draw sun (softer, less saturated, more glow)
      const sunGrad = ctx.createRadialGradient(
        sunX,
        sunY,
        sunRadius * 0.2,
        sunX,
        sunY,
        sunRadius
      );
      sunGrad.addColorStop(0, 'rgba(255, 236, 180, 0.95)');
      sunGrad.addColorStop(0.5, 'rgba(255, 200, 120, 0.55)');
      sunGrad.addColorStop(1, 'rgba(255, 200, 120, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = sunGrad;
      ctx.filter = 'blur(2.5px)';
      ctx.fill();
      ctx.restore();

      // Glass overlay
      ctx.save();
      ctx.globalAlpha = 0.13;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      animationFrameId = requestAnimationFrame(drawRays);
    }
    drawRays();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dpr, mouse]);

  return (
    <canvas
      ref={canvasRef}
      className="sunset-rays-bg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #f8c390 0%, #f7b267 100%)',
        transition: 'background 1s',
      }}
    />
  );
} 