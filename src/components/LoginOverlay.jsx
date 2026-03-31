import React, { useState, useEffect } from 'react';
import { Shield, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  '> INITIALIZING NEURAL CORE...',
  '> LOADING DSP ENGINE v4.2.1...',
  '> ESTABLISHING SECURE TUNNEL...',
  '> VERIFYING CRYPTOGRAPHIC KEYS...',
  '> PRIMING FORENSIC MODELS...',
  '> AUTHENTICATING OPERATOR...',
];

const LoginOverlay = ({ onLogin }) => {
  const [agentId, setAgentId] = useState('');
  const [bootLines, setBootLines] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < BOOT_LINES.length) {
        setBootLines(prev => [...prev, BOOT_LINES[idx]]);
        idx++;
      } else {
        setReady(true);
        clearInterval(timer);
      }
    }, 320);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agentId.trim().length > 2) {
      onLogin(agentId.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.97)', backdropFilter: 'blur(24px)' }}
    >
      {/* Background hex grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(16,255,177,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,255,177,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* Scan line animation */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: 0.3 }}
      >
        <motion.div
          className="absolute left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #10ffb1, transparent)' }}
          animate={{ y: ['-5vh', '105vh'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
        />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md mx-4 corner-brackets"
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(16, 255, 177, 0.15)',
          borderRadius: '16px',
          boxShadow: '0 0 60px rgba(16,255,177,0.08), 0 40px 80px rgba(0,0,0,0.8)',
          padding: '40px',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-[#10ffb1] opacity-50" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-[#10ffb1] opacity-50" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-[#10ffb1] opacity-50" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-[#10ffb1] opacity-50" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-5">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'rgba(16,255,177,0.1)',
                filter: 'blur(16px)',
                transform: 'scale(1.4)',
              }}
            />
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center"
              style={{ border: '1px solid rgba(16,255,177,0.3)', background: 'rgba(16,255,177,0.05)' }}
            >
              <Shield className="w-8 h-8" style={{ color: '#10ffb1' }} />
            </div>
          </div>

          <h2 className="font-mono font-bold text-2xl uppercase tracking-widest mb-1" style={{ color: '#e8eaf0' }}>
            VOXSENTINEL
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: '#10ffb1' }}>
            Initialize Operator Session
          </p>
        </div>

        {/* Boot terminal */}
        <div
          className="mb-8 rounded-lg overflow-hidden"
          style={{ background: '#060606', border: '1px solid rgba(255,255,255,0.05)', minHeight: '132px' }}
        >
          <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,45,85,0.5)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,184,0,0.5)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(16,255,177,0.5)' }} />
            <span className="font-mono text-[10px] ml-2 uppercase tracking-widest" style={{ color: '#6b7280' }}>
              <Cpu className="w-3 h-3 inline mr-1" />boot.sys
            </span>
          </div>
          <div className="p-3 space-y-1">
            {bootLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-[11px]"
                style={{ color: i === bootLines.length - 1 ? '#10ffb1' : '#374151' }}
              >
                {line}
              </motion.p>
            ))}
            {!ready && (
              <span className="font-mono text-[11px]" style={{ color: '#10ffb1', animation: 'typewriter-blink 0.8s infinite' }}>▌</span>
            )}
            {ready && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[11px]"
                style={{ color: '#10ffb1' }}
              >
                {'> '}
                <span style={{ color: '#e8eaf0' }}>SYSTEM READY. Awaiting operator credentials.</span>
              </motion.p>
            )}
          </div>
        </div>

        {/* Auth form */}
        <AnimatePresence>
          {ready && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>
                  Operator Identifier
                </label>
                <input
                  type="text"
                  placeholder="Enter agent handle or ID..."
                  className="w-full px-4 py-3 font-mono text-sm transition-all duration-200 rounded-lg outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e8eaf0',
                    caretColor: '#10ffb1',
                  }}
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(16,255,177,0.4)';
                    e.target.style.boxShadow = '0 0 20px rgba(16,255,177,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 font-mono font-semibold text-sm uppercase tracking-widest rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(16, 255, 177, 0.08)',
                  border: '1px solid rgba(16, 255, 177, 0.35)',
                  color: '#10ffb1',
                  boxShadow: '0 0 20px rgba(16,255,177,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(16,255,177,0.15)';
                  e.target.style.boxShadow = '0 0 30px rgba(16,255,177,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(16, 255, 177, 0.08)';
                  e.target.style.boxShadow = '0 0 20px rgba(16,255,177,0.06)';
                }}
              >
                Authenticate & Enter →
              </button>

              <p className="text-center font-mono text-[10px] uppercase tracking-widest" style={{ color: '#374151' }}>
                256-bit encrypted · zero-log session
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginOverlay;
