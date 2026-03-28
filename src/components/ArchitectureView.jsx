import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Code, Server, Network } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

const ArchitectureView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto px-4 lg:px-8 pb-20"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-heading font-black text-gray-900 dark:text-white mb-4 tracking-tighter drop-shadow-lg">
          System Methodology & Engine Architecture
        </h2>
        <p className="text-gray-600 dark:text-[#94a3b8] font-body text-lg max-w-2xl mx-auto">
          A transparent breakdown of the mathematical heuristics, neural networks, and digital signal processing (DSP) powering VoxSentinel.
        </p>
      </div>

      <div className="glass-panel w-full overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] mb-16 border-[rgba(0,218,243,0.3)] group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,218,243,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="bg-[rgba(0,218,243,0.1)] px-6 py-4 border-b border-[rgba(0,218,243,0.2)] flex items-center gap-3">
           <Network className="w-5 h-5 text-primary" />
           <span className="font-heading font-bold tracking-widest text-primary uppercase">AWS Cloud & Edge Architecture</span>
        </div>
        <img src="/architecture_diagram.png" alt="System Architecture Diagram" 
             className="w-full h-auto max-h-[700px] object-contain bg-gray-900 dark:bg-[rgba(0,0,0,0.4)] dark:mix-blend-screen p-8 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        
        {/* AUDIO ENGINE */}
        <div className="glass-panel p-8 md:col-span-2 border-l-4 border-l-primary flex flex-col items-start hover:shadow-[0_0_30px_rgba(0,218,243,0.15)] transition-shadow">
          <Activity className="w-10 h-10 text-primary mb-6" />
          <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">Audio Engine: DSP & CNN</h3>
          <p className="text-gray-600 dark:text-[#94a3b8] font-body mb-8 leading-relaxed max-w-4xl">
            Our audio detection relies on a localized TensorFlow Lite CNN operating in tandem with algorithmic Digital Signal Processing (DSP). Raw <code>.wav</code> waveforms are evaluated dynamically across multiple vectors.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full opacity-90">
             
             <div className="bg-gray-50 dark:bg-[var(--color-surface-container-high)] border border-gray-200 dark:border-[var(--color-outline-variant)] rounded-lg p-6 hover:border-gray-300 dark:hover:border-[rgba(255,255,255,0.2)] transition-colors">
               <h4 className="font-heading text-primary border-b border-gray-200 dark:border-[rgba(255,255,255,0.05)] pb-3 mb-6">1. Feature Extraction (FFT)</h4>
               <p className="font-body text-sm text-gray-700 dark:text-[#c2c6d8] mb-4">
                 We apply the Short-Time Fourier Transform (STFT) to map time-domain waveforms into frequency-domain spectrograms.
               </p>
               <div className="overflow-x-auto text-[1.1rem] text-gray-800 dark:text-gray-200">
                 <BlockMath math={"X(m, \\omega) = \\sum_{n=-\\infty}^{\\infty} x(n) w(n - m) e^{-j\\omega n}"} />
               </div>
             </div>

             <div className="bg-gray-50 dark:bg-[var(--color-surface-container-high)] border border-gray-200 dark:border-[var(--color-outline-variant)] rounded-lg p-6 hover:border-gray-300 dark:hover:border-[rgba(255,255,255,0.2)] transition-colors">
               <h4 className="font-heading text-primary border-b border-gray-200 dark:border-[rgba(255,255,255,0.05)] pb-3 mb-6">2. Pitch Variance (<InlineMath math="\sigma_{F_0}" />)</h4>
               <p className="font-body text-sm text-gray-700 dark:text-[#c2c6d8] mb-4">
                 Using Probabilistic YIN (pYIN) for fundamental frequency <InlineMath math="F_0" />. Low variance flags monotone AI delivery lacking human prosody.
               </p>
               <div className="overflow-x-auto text-[1.1rem] text-gray-800 dark:text-gray-200">
                 <BlockMath math={"\\sigma_{F_0} = \\sqrt{\\frac{1}{N} \\sum (F_{0,i} - \\mu_{F_0})^2}"} />
               </div>
             </div>

          </div>

          <div className="w-full flex flex-col md:flex-row gap-8 mt-12 bg-gray-100 dark:bg-[#0a0e14] p-6 rounded-xl border border-gray-200 dark:border-[rgba(255,255,255,0.05)]">
             <div className="w-full">
               <span className="font-heading text-[#00ff9d] text-sm block mb-4 border-l-2 border-[#00ff9d] pl-3">✅ REAL: High Variance & Full Freq</span>
               <img src="/spectrogram_real.png" alt="Real Spec" className="w-full rounded bg-black opacity-80" />
             </div>
             <div className="w-full">
               <span className="font-heading text-error text-sm block mb-4 border-l-2 border-error pl-3">⚠️ FAKE: Smudged & 7kHz Cutoff</span>
               <img src="/spectrogram_fake.png" alt="Fake Spec" className="w-full rounded bg-black opacity-80" />
             </div>
          </div>
        </div>

        {/* TEXT ENGINE */}
        <div className="glass-panel p-8 border-gray-200 dark:border-[rgba(255,255,255,0.05)]">
           <Code className="w-8 h-8 text-primary mb-6" />
           <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Text Engine (NLP)</h3>
           <p className="text-gray-600 dark:text-[#94a3b8] font-body text-sm mb-6 pb-6 border-b border-gray-200 dark:border-[rgba(255,255,255,0.05)]">
             Analyzes stylistic standard deviation (Burstiness) and Token Perplexity (Entropy) against an RoBERTa fine-tuned matrix.
           </p>
           
           <h4 className="font-heading text-sm text-primary mb-3 mt-4">Burstiness</h4>
           <div className="overflow-x-auto bg-gray-100 dark:bg-[#0a0e14] p-3 rounded text-sm mb-6 text-gray-800 dark:text-gray-200">
               <BlockMath math={"\\sigma = \\sqrt{\\frac{1}{N} \\sum_{i=1}^{N} (L_i - \\mu)^2}"} />
           </div>

           <h4 className="font-heading text-sm text-primary mb-3">Shannon Entropy</h4>
           <div className="overflow-x-auto bg-gray-100 dark:bg-[#0a0e14] p-3 rounded text-sm text-gray-800 dark:text-gray-200">
               <BlockMath math={"H(X) = -\\sum_{i=1}^{n} P(x_i) \\log_2 P(x_i)"} />
           </div>
        </div>

        {/* VISION ENGINE */}
        <div className="glass-panel p-8 border-gray-200 dark:border-[rgba(255,255,255,0.05)]">
           <Server className="w-8 h-8 text-primary mb-6" />
           <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Vision Engine</h3>
           <p className="text-gray-600 dark:text-[#94a3b8] font-body text-sm mb-6 pb-6 border-b border-gray-200 dark:border-[rgba(255,255,255,0.05)]">
              Scalable Cloud Vision API pairing local EXIF sweeping with temporal kinematics modeling to detect non-Euclidean morphing in generated videos.
           </p>

           <ul className="text-gray-700 dark:text-[#c2c6d8] font-body text-sm space-y-4">
              <li className="flex gap-3 items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                 <div><strong className="text-gray-900 dark:text-white block">Kinematic Mapping</strong> Evaluates shadow angles, reflections, and lighting persistence across frames.</div>
              </li>
              <li className="flex gap-3 items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                 <div><strong className="text-gray-900 dark:text-white block">Software Headers</strong> Sweeps file origin metadata to flag standard injection routines (Midjourney, DALL-E, etc.).</div>
              </li>
           </ul>
        </div>

      </div>
    </motion.div>
  );
};

export default ArchitectureView;
