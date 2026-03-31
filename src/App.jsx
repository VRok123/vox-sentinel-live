import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ParticleBackground from './components/ParticleBackground';
import Header from './components/Header';
import ScannerTerminal from './components/ScannerTerminal';
import SystemArchitecture from './components/SystemArchitecture';
import LoginOverlay from './components/LoginOverlay';

function App() {
  const [userId, setUserId] = useState(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
        <ParticleBackground />
        <Header />

        <main className="flex-1 relative z-10 w-full">
          <Routes>
            <Route path="/" element={<ScannerTerminal userId={userId || '007_AGENT'} />} />
            <Route path="/architecture" element={<SystemArchitecture />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer
          className="relative z-10 w-full py-5 px-6 flex flex-wrap items-center justify-between gap-4"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(6,6,6,0.8)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#374151' }}>
              VOXSENTINEL © 2025
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#374151' }}>
              Multi-Modal Deepfake Forensics Platform
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#374151' }}>
              AWS CLOUD · us-east-1
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#10ffb1', boxShadow: '0 0 4px rgba(16,255,177,0.7)', animation: 'pulse 2s infinite' }}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#10ffb1' }}>
                SECURE CONNECTION ESTABLISHED
              </span>
            </div>
          </div>
        </footer>

        {!userId && <LoginOverlay onLogin={setUserId} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
