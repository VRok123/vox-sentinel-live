import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeAudio, analyzeImage, analyzeVideo, analyzeText } from '../api/apiService';
import { Mic, FileText, Image as ImageIcon, Video, UploadCloud, Activity, Download, Shield, Cpu, Zap, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';

/* ──────────────────────────────────────────────────────────────
   Constants
────────────────────────────────────────────────────────────── */

const MODES = [
  {
    id: 'AUDIO',
    label: 'Voice Analysis',
    sublabel: 'AI Voice Cloning Detection',
    icon: <Mic className="w-5 h-5" />,
    accept: 'audio/*',
    dropType: 'audio',
    uploadCopy: 'Deploy Audio for Neural Voice Authentication',
    subCopy: 'Drop .wav / .mp3 or click to select — encrypted transit, zero retention',
    statusMsg: 'Uploading to AWS Forensic Node...',
  },
  {
    id: 'TEXT',
    label: 'Text Forensics',
    sublabel: 'LLM Signature Extraction',
    icon: <FileText className="w-5 h-5" />,
    accept: null,
    dropType: null,
    uploadCopy: null,
    subCopy: 'Submit corpus for LLM signature extraction and stylometric heuristics',
    statusMsg: 'Cross-referencing language model fingerprints...',
  },
  {
    id: 'IMAGE',
    label: 'Image Analysis',
    sublabel: 'Deepfake Visual Artifact Scan',
    icon: <ImageIcon className="w-5 h-5" />,
    accept: 'image/*',
    dropType: 'image',
    uploadCopy: 'Deploy Image for GAN Artifact Verification',
    subCopy: 'Drop .jpg / .png — EXIF sweep, frequency analysis, texture heuristics',
    statusMsg: 'Scanning metadata & visual frequency artifacts...',
  },
  {
    id: 'VIDEO',
    label: 'Video Forensics',
    sublabel: 'Temporal Deepfake Detection',
    icon: <Video className="w-5 h-5" />,
    accept: 'video/mp4',
    dropType: 'video',
    uploadCopy: 'Deploy MP4 for Temporal Facial Consistency Analysis',
    subCopy: 'Drop .mp4 (max 15MB) — frame extraction, face-swap detection, voice sync',
    statusMsg: 'Extracting frames & audio streams...',
  },
];

const SCANNING_PHRASES = [
  'CROSS-REFERENCING NEURAL SPECTRAL DATABASE...',
  'RUNNING STFT FREQUENCY DECOMPOSITION...',
  'APPLYING SIGMOID CLASSIFICATION LAYER...',
  'EVALUATING TEMPORAL CONSISTENCY VECTORS...',
  'DECODING LATENT SPACE ANOMALIES...',
  'VALIDATING CRYPTOGRAPHIC SCAN HASH...',
];

/* ──────────────────────────────────────────────────────────────
   Sub-components
────────────────────────────────────────────────────────────── */

/** Circular SVG confidence arc */
const ConfidenceArc = ({ value, verdict }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = verdict === 'FAKE' ? '#ff2d55' : verdict === 'SUSPICIOUS' ? '#ffb800' : '#10ffb1';
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <motion.circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono font-bold text-2xl" style={{ color }}>
          {parseFloat(value).toFixed(0)}%
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#6b7280' }}>
          AI score
        </span>
      </div>
    </div>
  );
};

/** System status sidebar widget */
const SystemStatusBar = () => {
  const modules = [
    { name: 'Neural Net', status: 'ACTIVE', color: '#10ffb1' },
    { name: 'DSP Engine', status: 'READY', color: '#10ffb1' },
    { name: 'Cloud Link', status: 'SECURED', color: '#10ffb1' },
    { name: 'Threat DB', status: 'SYNCED', color: '#10ffb1' },
  ];

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{ background: 'rgba(16,255,177,0.02)', border: '1px solid rgba(16,255,177,0.07)' }}
    >
      <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: '#6b7280' }}>
        System Diagnostics
      </p>
      {modules.map(m => (
        <div key={m.name} className="flex items-center justify-between">
          <span className="font-mono text-xs" style={{ color: '#6b7280' }}>{m.name}</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider" style={{ color: m.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 4px ${m.color}` }} />
            {m.status}
          </span>
        </div>
      ))}
    </div>
  );
};

/** Analyzing overlay — shown while isProcessing */
const AnalyzingOverlay = ({ phrase }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-2xl overflow-hidden"
    style={{ background: 'rgba(6, 6, 6, 0.92)', backdropFilter: 'blur(8px)' }}
  >
    {/* Concentric pulse rings */}
    <div className="relative flex items-center justify-center mb-10">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ border: '1px solid rgba(16,255,177,0.4)' }}
          initial={{ width: 80, height: 80, opacity: 0.8 }}
          animate={{ width: [80, 200], height: [80, 200], opacity: [0.6, 0] }}
          transition={{ duration: 2.2, delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* Rotating hex ring */}
      <motion.div
        className="w-20 h-20 rounded-full"
        style={{ border: '2px dashed rgba(16,255,177,0.3)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner solid ring */}
      <motion.div
        className="absolute w-14 h-14 rounded-full"
        style={{ border: '2px solid rgba(16,255,177,0.7)', boxShadow: '0 0 20px rgba(16,255,177,0.3)' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center icon */}
      <div className="absolute">
        <Eye className="w-6 h-6" style={{ color: '#10ffb1', filter: 'drop-shadow(0 0 8px rgba(16,255,177,0.8))' }} />
      </div>
    </div>

    {/* Scanning phrase */}
    <AnimatePresence mode="wait">
      <motion.p
        key={phrase}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.4 }}
        className="font-mono text-sm tracking-widest text-center"
        style={{ color: '#10ffb1' }}
      >
        {phrase}
      </motion.p>
    </AnimatePresence>

    {/* Progress bar */}
    <div className="w-48 h-0.5 mt-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        className="h-full"
        style={{ background: 'linear-gradient(90deg, #10ffb1, rgba(16,255,177,0.3))' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>

    <p className="font-mono text-[10px] uppercase tracking-widest mt-4" style={{ color: '#374151' }}>
      Secure Analysis in Progress · Do Not Close
    </p>
  </motion.div>
);

/* ──────────────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────────────── */

const ScannerTerminal = ({ userId }) => {
  const [activeMode, setActiveMode] = useState('AUDIO');
  const [status, setStatus] = useState('Ready for input...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [scanPhrase, setScanPhrase] = useState(SCANNING_PHRASES[0]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const phraseInterval = useRef(null);

  const currentMode = MODES.find(m => m.id === activeMode);

  // Cycle scanning phrases during processing
  useEffect(() => {
    if (isProcessing) {
      let idx = 0;
      phraseInterval.current = setInterval(() => {
        idx = (idx + 1) % SCANNING_PHRASES.length;
        setScanPhrase(SCANNING_PHRASES[idx]);
      }, 1800);
    } else {
      clearInterval(phraseInterval.current);
      setScanPhrase(SCANNING_PHRASES[0]);
    }
    return () => clearInterval(phraseInterval.current);
  }, [isProcessing]);

  /* ── Handlers (unchanged logic) ── */
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.includes(currentMode.dropType)) {
      handleFileSelected(file);
    } else {
      alert(`Please drop a valid ${currentMode.dropType} file.`);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    if (activeMode === 'AUDIO') processFile(file, analyzeAudio, currentMode.statusMsg, 'AUDIO');
    if (activeMode === 'IMAGE') processFile(file, analyzeImage, currentMode.statusMsg, 'IMAGE');
    if (activeMode === 'VIDEO') {
      if (file.size > 15 * 1024 * 1024) return alert('File too large! Max 15MB for demo.');
      processFile(file, analyzeVideo, currentMode.statusMsg, 'VIDEO');
    }
  };

  const processFile = async (file, apiFunction, statusMsg, type) => {
    setStatus(statusMsg);
    setIsProcessing(true);
    setResult(null);
    try {
      const data = await apiFunction(file, userId);
      setResult({ ...data, type });
    } catch (e) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
      setStatus('Ready for input...');
    }
  };

  const handleAnalyzeText = async () => {
    if (textInput.length < 10) return alert('Enter more text.');
    setStatus('Analyzing patterns...');
    setIsProcessing(true);
    setResult(null);
    try {
      const data = await analyzeText(textInput, userId);
      setResult({ ...data, type: 'TEXT', contentSnippet: textInput.substring(0, 200) + '...' });
    } catch (e) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
      setStatus('Ready for input...');
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(0, 40, 100);
    doc.text('VOXSENTINEL | FORENSIC REPORT', 20, 20);
    doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.text(`Verdict: ${result.verdict}`, 20, 40);
    const color = result.verdict === 'FAKE' ? [255, 0, 0] : [0, 255, 0];
    doc.setFillColor(...color); doc.rect(18, 45, 170, 2, 'F');
    let y = 60; doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text(`Scan ID:      ${result.scan_id || 'N/A'}`, 20, y); y += 10;
    doc.text(`Type:         ${result.type}`, 20, y); y += 10;
    doc.text(`Confidence:   ${result.confidence}%`, 20, y); y += 10;
    doc.text(`Timestamp:    ${new Date().toLocaleString()}`, 20, y); y += 20;
    doc.setFont('helvetica', 'bold'); doc.text('Forensic Indicators:', 20, y); y += 10;
    doc.setFont('helvetica', 'normal');
    if (result.forensics) { result.forensics.forEach(line => { doc.text('- ' + line.replace(/[^\x00-\x7F]/g, ''), 20, y); y += 10; }); }
    doc.save('VoxSentinel_Report.pdf');
  };

  /* ── Verdict styling ── */
  const verdictColor = result?.verdict === 'FAKE' ? '#ff2d55'
    : result?.verdict === 'SUSPICIOUS' ? '#ffb800'
    : '#10ffb1';
  const verdictGlow = result?.verdict === 'FAKE'
    ? '0 0 40px rgba(255,45,85,0.4)'
    : result?.verdict === 'SUSPICIOUS'
    ? '0 0 40px rgba(255,184,0,0.4)'
    : '0 0 40px rgba(16,255,177,0.4)';
  const verdictIcon = result?.verdict === 'FAKE'
    ? <AlertTriangle className="w-6 h-6" style={{ color: '#ff2d55' }} />
    : <CheckCircle className="w-6 h-6" style={{ color: '#10ffb1' }} />;

  /* ── Render ── */
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* ── Hero banner ── */}
      <div className="text-center mb-2">
        <h1
          className="font-mono font-bold text-4xl md:text-5xl tracking-tight mb-3"
          style={{ color: '#e8eaf0', letterSpacing: '-0.02em' }}
        >
          Unmask Digital Forgeries
        </h1>
        <p className="font-sans text-base md:text-lg max-w-xl mx-auto" style={{ color: '#6b7280', lineHeight: 1.7 }}>
          Military-grade AI forensics across voice, text, image, and video. Detect deepfakes
          before they spread.
        </p>
      </div>

      {/* ── Main split-panel layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 relative">

        {/* ─── LEFT PANEL: Mode + Input ─── */}
        <div className="flex flex-col gap-4 lg:w-[42%]">

          {/* Mode tabs */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(12,12,12,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#6b7280' }}>
                Analysis Vector
              </p>
            </div>
            <div className="p-3 flex flex-col gap-1">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setActiveMode(m.id); setResult(null); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group"
                  style={activeMode === m.id ? {
                    background: 'rgba(16,255,177,0.07)',
                    border: '1px solid rgba(16,255,177,0.2)',
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={activeMode === m.id ? {
                      background: 'rgba(16,255,177,0.12)',
                      color: '#10ffb1',
                      boxShadow: '0 0 12px rgba(16,255,177,0.15)',
                    } : {
                      background: 'rgba(255,255,255,0.03)',
                      color: '#6b7280',
                    }}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-sm" style={{ color: activeMode === m.id ? '#e8eaf0' : '#9ca3af' }}>
                      {m.label}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: activeMode === m.id ? '#10ffb1' : '#4b5563' }}>
                      {m.sublabel}
                    </p>
                  </div>
                  {activeMode === m.id && (
                    <motion.div
                      layoutId="mode-indicator"
                      className="ml-auto w-1.5 h-6 rounded-full"
                      style={{ background: '#10ffb1', boxShadow: '0 0 8px rgba(16,255,177,0.7)' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* System status */}
          <SystemStatusBar />

          {/* Scan count */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,184,0,0.03)', border: '1px solid rgba(255,184,0,0.07)' }}
          >
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#6b7280' }}>Operator</p>
              <p className="font-mono text-sm font-bold" style={{ color: '#ffb800' }}>{userId}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#6b7280' }}>Session Scans</p>
              <p className="font-mono text-sm font-bold" style={{ color: '#e8eaf0' }}>
                {result ? '1' : '0'} / ∞
              </p>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: Input + Results ─── */}
        <div className="flex flex-col gap-4 lg:flex-1">

          {/* Input card */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10, 10, 10, 0.85)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Glow top edge */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{
                background: 'linear-gradient(90deg, transparent, rgba(16,255,177,0.3), transparent)'
              }} />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(16,255,177,0.1)', color: '#10ffb1' }}
                  >
                    {currentMode.icon}
                  </div>
                  <div>
                    <h2 className="font-sans font-bold text-base" style={{ color: '#e8eaf0' }}>
                      {currentMode.uploadCopy || currentMode.label}
                    </h2>
                    <p className="font-mono text-[11px]" style={{ color: '#6b7280' }}>{currentMode.subCopy}</p>
                  </div>
                </div>

                {activeMode === 'TEXT' ? (
                  <div className="space-y-4">
                    <textarea
                      className="w-full rounded-xl p-4 font-mono text-sm resize-none outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#e8eaf0',
                        caretColor: '#10ffb1',
                        minHeight: '180px',
                      }}
                      rows="7"
                      placeholder="Submit corpus for LLM signature extraction..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(16,255,177,0.3)';
                        e.target.style.boxShadow = '0 0 20px rgba(16,255,177,0.05)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(255,255,255,0.07)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px]" style={{ color: '#4b5563' }}>
                        {textInput.length} chars · min 10
                      </span>
                      <button
                        onClick={handleAnalyzeText}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono font-semibold text-sm uppercase tracking-wider transition-all duration-200 disabled:opacity-40"
                        style={{
                          background: 'rgba(16,255,177,0.09)',
                          border: '1px solid rgba(16,255,177,0.3)',
                          color: '#10ffb1',
                        }}
                        onMouseEnter={(e) => { if (!isProcessing) { e.currentTarget.style.background = 'rgba(16,255,177,0.16)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(16,255,177,0.15)'; }}}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,255,177,0.09)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <Zap className="w-4 h-4" />
                        {isProcessing ? 'Deep-Scanning...' : 'Initiate Deep-Scan'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
                    style={{
                      minHeight: '200px',
                      border: isDragging
                        ? '2px dashed rgba(16,255,177,0.7)'
                        : '2px dashed rgba(255,255,255,0.08)',
                      background: isDragging
                        ? 'rgba(16,255,177,0.04)'
                        : 'rgba(255,255,255,0.01)',
                      boxShadow: isDragging ? '0 0 30px rgba(16,255,177,0.1)' : 'none',
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={(e) => {
                      if (!isDragging) {
                        e.currentTarget.style.border = '2px dashed rgba(16,255,177,0.3)';
                        e.currentTarget.style.background = 'rgba(16,255,177,0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDragging) {
                        e.currentTarget.style.border = '2px dashed rgba(255,255,255,0.08)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                      }
                    }}
                  >
                    <motion.div
                      animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'rgba(16,255,177,0.06)',
                          border: '1px solid rgba(16,255,177,0.15)',
                        }}
                      >
                        <UploadCloud className="w-8 h-8" style={{ color: '#10ffb1' }} />
                      </div>
                      <div className="text-center">
                        <p className="font-sans font-semibold text-sm mb-1" style={{ color: '#e8eaf0' }}>
                          {isDragging ? 'Release to Deploy' : currentMode.uploadCopy}
                        </p>
                        <p className="font-mono text-[11px]" style={{ color: '#4b5563' }}>
                          {isDragging ? 'Neural processing will begin immediately' : currentMode.subCopy}
                        </p>
                      </div>
                    </motion.div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept={currentMode.accept}
                      onChange={(e) => handleFileSelected(e.target.files[0])}
                    />
                  </div>
                )}

                {/* Status bar */}
                {!isProcessing && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10ffb1', boxShadow: '0 0 4px rgba(16,255,177,0.7)' }} />
                    <p className="font-mono text-xs" style={{ color: '#6b7280' }}>{status}</p>
                  </div>
                )}
              </div>

              {/* Analyzing overlay */}
              <AnimatePresence>
                {isProcessing && <AnalyzingOverlay phrase={scanPhrase} />}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Results area */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col gap-4"
              >
                {/* Verdict + confidence row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Verdict card */}
                  <div
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{
                      background: 'rgba(10,10,10,0.9)',
                      border: `1px solid ${verdictColor}22`,
                      boxShadow: verdictGlow,
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${verdictColor}08 0%, transparent 65%)`
                    }} />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        {verdictIcon}
                        <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>
                          Analysis Verdict
                        </p>
                      </div>
                      <div
                        className="font-mono font-black text-5xl mb-4"
                        style={{
                          color: verdictColor,
                          textShadow: `0 0 30px ${verdictColor}99`,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {result.verdict}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-mono text-xs">
                          <span style={{ color: '#6b7280' }}>AI Signal Strength</span>
                          <span style={{ color: '#e8eaf0' }}>{parseFloat(result.confidence).toFixed(2)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${verdictColor}, ${verdictColor}66)` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence arc */}
                  <div
                    className="rounded-2xl p-6 flex flex-col items-center justify-center"
                    style={{
                      background: 'rgba(10,10,10,0.9)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#6b7280' }}>
                      Signal Integrity
                    </p>
                    <ConfidenceArc value={result.confidence} verdict={result.verdict} />
                  </div>
                </div>

                {/* Evidence / media card */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(10,10,10,0.9)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" style={{ color: '#10ffb1' }} />
                      <h3 className="font-mono text-xs uppercase tracking-widest" style={{ color: '#6b7280' }}>
                        {result.type === 'AUDIO' ? 'Spectral Evidence Map'
                          : result.type === 'TEXT' ? 'Corpus Content Fragment'
                          : 'Visual Evidence Frame'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#4b5563' }}>
                        ID: {String(result.scan_id || 'UNK').substring(0, 8)}...
                      </span>
                      <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-200"
                        style={{
                          background: 'rgba(16,255,177,0.06)',
                          border: '1px solid rgba(16,255,177,0.2)',
                          color: '#10ffb1',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,255,177,0.14)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,255,177,0.06)'; }}
                      >
                        <Download className="w-3 h-3" />
                        Export PDF
                      </button>
                    </div>
                  </div>
                  <div className="p-4 min-h-[160px] flex items-center justify-center">
                    {(result.type === 'AUDIO' || result.type === 'IMAGE' || result.type === 'VIDEO') && result.image_url ? (
                      <img
                        src={result.image_url}
                        alt="Forensic Evidence"
                        className="max-h-64 object-contain rounded-xl"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                    ) : result.type === 'TEXT' ? (
                      <div className="w-full rounded-xl p-4" style={{ background: 'rgba(16,255,177,0.03)', borderLeft: '3px solid rgba(16,255,177,0.3)' }}>
                        <p className="font-mono text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
                          "{result.contentSnippet}"
                        </p>
                      </div>
                    ) : (
                      <p className="font-mono text-xs animate-pulse" style={{ color: '#4b5563' }}>
                        Awaiting evidence data from server...
                      </p>
                    )}
                  </div>
                </div>

                {/* Forensic indicators */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(10,10,10,0.9)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Activity className="w-4 h-4" style={{ color: '#10ffb1' }} />
                    <h3 className="font-mono text-xs uppercase tracking-widest" style={{ color: '#6b7280' }}>
                      Forensic Indicator Breakdown
                    </h3>
                    <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>
                      {result.forensics?.length ?? 0} signals
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                    {result.forensics && Array.isArray(result.forensics) ? result.forensics.map((ind, idx) => {
                      const isOk = ind.includes('✅');
                      const isWarn = ind.includes('⚠️');
                      const borderColor = isOk ? '#10ffb1' : isWarn ? '#ffb800' : '#ff2d55';
                      const bgColor = isOk ? 'rgba(16,255,177,0.03)' : isWarn ? 'rgba(255,184,0,0.03)' : 'rgba(255,45,85,0.03)';
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 + 0.2 }}
                          className="p-3 rounded-lg font-mono text-xs leading-relaxed"
                          style={{
                            background: bgColor,
                            borderLeft: `3px solid ${borderColor}`,
                            color: '#9ca3af',
                          }}
                        >
                          {ind}
                        </motion.div>
                      );
                    }) : (
                      <p className="font-mono text-xs col-span-2" style={{ color: '#4b5563' }}>
                        No detailed forensic data available.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle state — shown when no result */}
          {!result && !isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 rounded-2xl flex flex-col items-center justify-center py-16 gap-4"
              style={{
                border: '1px dashed rgba(255,255,255,0.04)',
                background: 'rgba(255,255,255,0.008)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Shield className="w-8 h-8" style={{ color: '#374151' }} />
              </div>
              <div className="text-center">
                <p className="font-sans font-semibold text-base mb-1" style={{ color: '#374151' }}>
                  Awaiting Deployment
                </p>
                <p className="font-mono text-xs" style={{ color: '#1f2937' }}>
                  Submit media to initiate neural forensic analysis
                </p>
              </div>
              <div className="flex items-center gap-6 mt-4">
                {[
                  { icon: <Mic className="w-4 h-4" />, label: 'Voice' },
                  { icon: <FileText className="w-4 h-4" />, label: 'Text' },
                  { icon: <ImageIcon className="w-4 h-4" />, label: 'Image' },
                  { icon: <Video className="w-4 h-4" />, label: 'Video' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)', color: '#374151' }}>
                      {icon}
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: '#1f2937' }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerTerminal;
