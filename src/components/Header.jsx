import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Activity, Share2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_STATS = [
  { label: 'THREATS BLOCKED', value: '2,847' },
  { label: 'SCANS TODAY', value: '139' },
  { label: 'ACCURACY RATE', value: '97.4%' },
];

const Header = () => {
  const [statIdx, setStatIdx] = useState(0);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatIdx(i => (i + 1) % MOCK_STATS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(6, 6, 6, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(16, 255, 177, 0.08)',
      }}
    >
      {/* Top micro-bar */}
      <div
        className="w-full px-6 py-1 flex items-center justify-between text-[10px] font-mono tracking-widest uppercase"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#6b7280' }}
      >
        <span>NEURAL INTEGRITY UNIT · AWS CLOUD (us-east-1)</span>
        <span>{time} UTC+5:30</span>
      </div>

      {/* Main header row */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield
              className="w-8 h-8"
              style={{ color: '#10ffb1', filter: 'drop-shadow(0 0 8px rgba(16,255,177,0.6))' }}
            />
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
              style={{ background: '#10ffb1', boxShadow: '0 0 6px rgba(16,255,177,0.8)', animation: 'pulse 2s infinite' }}
            />
          </div>
          <div className="flex flex-col">
            <span
              className="font-mono font-bold text-xl tracking-tighter leading-none"
              style={{ color: '#e8eaf0', letterSpacing: '-0.02em' }}
            >
              VOX<span style={{ color: '#10ffb1' }}>SENTINEL</span>
            </span>
            <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#6b7280' }}>
              Multi-Modal Deepfake Forensics
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: '/', icon: <Activity className="w-4 h-4" />, label: 'Scan Terminal' },
            { to: '/architecture', icon: <Share2 className="w-4 h-4" />, label: 'Neural Architecture' },
          ].map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'text-[#10ffb1] font-semibold'
                    : 'text-[#6b7280] hover:text-[#e8eaf0]'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(16, 255, 177, 0.06)',
                border: '1px solid rgba(16, 255, 177, 0.15)',
              } : {
                background: 'transparent',
                border: '1px solid transparent',
              }}
            >
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          {/* Rolling stat ticker */}
          <div className="hidden lg:flex flex-col items-end overflow-hidden h-10 justify-center">
            <motion.div
              key={statIdx}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex flex-col items-end"
            >
              <span className="font-mono font-bold text-sm" style={{ color: '#10ffb1' }}>
                {MOCK_STATS[statIdx].value}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#6b7280' }}>
                {MOCK_STATS[statIdx].label}
              </span>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* System status pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs tracking-widest uppercase"
            style={{
              background: 'rgba(16, 255, 177, 0.06)',
              border: '1px solid rgba(16, 255, 177, 0.2)',
              color: '#10ffb1',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: '#10ffb1',
                boxShadow: '0 0 6px rgba(16,255,177,0.9)',
                animation: 'pulse 2s infinite',
              }}
            />
            <Zap className="w-3 h-3" />
            LIVE
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
