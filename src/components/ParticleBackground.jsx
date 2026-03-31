import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Premium animated background:
 * - Perspective dot grid that pans slowly
 * - 3 large drifting radial gradient orbs (emerald / crimson / amber)
 * - Subtle vignette overlay
 */
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const DOT_SPACING = 36;
    const DOT_RADIUS = 0.8;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated dot grid
      offset = (offset + 0.15) % DOT_SPACING;

      for (let x = -DOT_SPACING + (offset % DOT_SPACING); x < canvas.width + DOT_SPACING; x += DOT_SPACING) {
        for (let y = -DOT_SPACING + (offset % DOT_SPACING); y < canvas.height + DOT_SPACING; y += DOT_SPACING) {
          // Distance from center for radial fade
          const dx = x - canvas.width / 2;
          const dy = y - canvas.height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2;
          const alpha = Math.max(0, 0.25 - (dist / maxDist) * 0.2);

          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 255, 177, ${alpha})`;
          ctx.fill();
        }
      }

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Dot grid canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* Floating orb — Emerald (top-left) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(16,255,177,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.05, 0.97, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating orb — Crimson (bottom-right) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          bottom: '-8%',
          right: '-8%',
          background: 'radial-gradient(circle, rgba(255,45,85,0.07) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, -30, 25, 0],
          y: [0, 25, -15, 0],
          scale: [1, 0.95, 1.04, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* Floating orb — Amber (center) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 350,
          height: 350,
          top: '40%',
          left: '55%',
          background: 'radial-gradient(circle, rgba(255,184,0,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -10, 14, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Top & bottom edge fade */}
      <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0a0a0a, transparent)' }} />
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />
    </div>
  );
};

export default ParticleBackground;
