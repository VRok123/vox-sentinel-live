import React, { useState, useRef } from 'react';
import { analyzeAudio, analyzeImage, analyzeVideo, analyzeText } from '../api/apiService';
import { Mic, FileAudio, FileText, FileImage, FileVideo, UploadCloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Results from './Results';

const MODES = [
  { id: 'AUDIO', label: 'Audio', icon: Mic, accept: 'audio/*' },
  { id: 'TEXT', label: 'Text', icon: FileText },
  { id: 'IMAGE', label: 'Image', icon: FileImage, accept: 'image/*' },
  { id: 'VIDEO', label: 'Video', icon: FileVideo, accept: 'video/mp4' }
];

const ScannerView = ({ currentAgent }) => {
  const [mode, setMode] = useState('AUDIO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Ready for input...');
  const [resultData, setResultData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef(null);

  const handleModeChange = (m) => {
    setMode(m);
    setResultData(null);
    setStatusText('Ready for input...');
    setTextInput('');
  };

  const processFile = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    setStatusText('Uploading to AWS & Extracting Features...');
    try {
      let data;
      if (mode === 'AUDIO') {
        data = await analyzeAudio(file, currentAgent);
      } else if (mode === 'IMAGE') {
        data = await analyzeImage(file, currentAgent);
      } else if (mode === 'VIDEO') {
        data = await analyzeVideo(file, currentAgent);
      }
      data.type = mode;
      setStatusText('Processing Complete');
      setResultData(data);
    } catch (err) {
      alert(err.message);
      setStatusText('Error processing file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processText = async () => {
    if (textInput.length < 10) return alert("Enter more text.");
    setIsProcessing(true);
    setStatusText('Analyzing NLP Patterns...');
    try {
      const data = await analyzeText(textInput, currentAgent);
      data.type = 'TEXT';
      data.contentSnippet = textInput.substring(0, 200) + '...';
      setResultData(data);
      setStatusText('Processing Complete');
    } catch (err) {
      alert(err.message);
      setStatusText('Error analyzing text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center max-w-[1200px] mx-auto px-4 mt-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mb-12">
        <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
          An AI-powered, multi-modal forensic system for deepfake detection and digital authenticity verification.
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-4 justify-center mb-10">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-body text-md tracking-wider transition-all duration-300 ${
                isActive 
                  ? 'bg-primary border-primary text-[#000] shadow-[0_0_20px_rgba(0,218,243,0.3)] font-bold' 
                  : 'bg-transparent border-[#424656] text-gray-700 dark:text-[#c2c6d8] hover:bg-[rgba(0,218,243,0.1)] hover:border-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {m.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="glass-panel w-full max-w-[720px] p-10 relative overflow-hidden flex flex-col items-center"
        >
          {isProcessing && (
            <div className="absolute inset-0 z-10 bg-[rgba(16,20,26,0.85)] backdrop-blur-md flex flex-col justify-center items-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-6 drop-shadow-[0_0_15px_rgba(0,218,243,0.8)]" />
              <p className="font-heading text-xl text-primary animate-pulse tracking-widest uppercase">{statusText}</p>
            </div>
          )}

          <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            {mode === 'AUDIO' ? 'Audio Forensic Scanner' : 
             mode === 'TEXT' ? 'Text Forensic Scanner' : 
             mode === 'IMAGE' ? 'Image Forensic Scanner' : 'Video Forensic Scanner'}
          </h2>
          <p className="text-gray-600 dark:text-[#94a3b8] font-body mb-8 text-center">
            {mode === 'AUDIO' ? 'Upload audio or record live to detect AI voice cloning.' : 
             mode === 'TEXT' ? 'Paste text to detect GPT / LLM generation patterns.' : 
             mode === 'IMAGE' ? 'Upload images to detect Deepfakes and Stable Diffusion artifacts.' : 
             'Upload MP4 to detect Deepfake faces and synthetic audio.'}
          </p>

          {mode === 'TEXT' ? (
            <div className="w-full flex flex-col items-center">
              <textarea 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste suspicious text here..." 
                rows="6" 
                className="w-full bg-white dark:bg-[rgba(0,0,0,0.4)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)] rounded-lg p-5 font-body text-lg focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,218,243,0.2)] transition-all resize-y mb-6"
              ></textarea>
              <button 
                onClick={processText}
                className="w-full max-w-sm bg-grad-primary hover:shadow-[0_0_25px_rgba(0,218,243,0.5)] text-[#000] font-heading font-bold uppercase tracking-widest py-4 px-8 rounded-lg transition-all duration-300"
              >
                ANALYZE TEXT
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
               <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-video max-h-[250px] border-2 border-dashed rounded-2xl flex flex-col justify-center items-center cursor-pointer transition-all duration-300 ${
                    dragOver ? 'border-[#00ff9d] bg-[rgba(0,255,157,0.1)] scale-[1.02]' : 'border-primary bg-[rgba(0,218,243,0.02)] hover:bg-[rgba(0,218,243,0.08)]'
                  }`}
               >
                  <UploadCloud className={`w-16 h-16 mb-4 ${dragOver ? 'text-[#00ff9d] animate-bounce' : 'text-primary transition-transform duration-300 transform hover:-translate-y-2'}`} />
                  <p className="font-heading text-lg text-gray-800 dark:text-[#dfe2eb]">Click or Drop {mode.charAt(0) + mode.slice(1).toLowerCase()} File Here</p>
                  <p className="text-sm text-gray-500 dark:text-[#8c90a1] mt-2 font-body">
                     {mode === 'AUDIO' ? 'Supports .wav, .mp3 formats' : 
                      mode === 'IMAGE' ? 'Supports .png, .jpg, .jpeg' : 'Supports .mp4 formats'}
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept={MODES.find(m => m.id === mode).accept}
                    onChange={(e) => processFile(e.target.files[0])} 
                  />
               </div>
               
               {mode === 'AUDIO' && (
                 <p className="mt-6 text-gray-600 dark:text-[#94a3b8] font-heading font-medium tracking-wider text-sm">
                   {statusText}
                 </p>
               )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {resultData && <Results data={resultData} />}
    </div>
  );
};

export default ScannerView;
