import React from 'react';
import { motion } from 'framer-motion';
import { Network, Mic, FileText, Eye, Brain, Activity } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const SystemArchitecture = () => {
  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-10 px-4 mb-20">
      <div className="text-center mb-12 max-w-3xl">
        <h2 className="text-4xl font-mono text-accent mb-6 font-bold tracking-tight">System Methodology & Engine Architecture</h2>
        <p className="text-textSecondary text-xl leading-relaxed">
          A transparent breakdown of the mathematical heuristics, neural networks, and digital signal processing (DSP) powering VoxSentinel.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-black/40 border border-accent/30 rounded-2xl overflow-hidden mb-12 shadow-[0_0_30px_rgba(0,242,255,0.1)] relative"
      >
        <div className="bg-accent/10 border-b border-accent/20 p-4 flex items-center gap-3">
          <Network className="text-accent w-6 h-6" />
          <h3 className="font-mono text-lg text-accent uppercase tracking-widest">VoxSentinel AWS Cloud & Edge Architecture</h3>
        </div>
        <div className="p-8 flex justify-center bg-card/50">
          <img src="/architecture_diagram.png" alt="Architecture" className="max-w-full h-auto rounded-xl border border-white/5 shadow-2xl" />
        </div>
      </motion.div>

      <div className="w-full flex flex-col gap-10">
        
        {/* Audio Engine */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="bg-card/80 border-l-4 border-accent rounded-xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute top-8 right-8 text-accent/20"><Mic className="w-32 h-32" /></div>
          <div className="relative z-10 w-full xl:w-5/6">
            <h3 className="text-2xl font-mono text-accent mb-4 flex items-center gap-3">
              <Mic className="w-8 h-8" /> Audio Engine: DSP & Convolutional Neural Networks
            </h3>
            <p className="text-textSecondary text-lg mb-8 leading-relaxed">
              Our audio detection relies on a localized TensorFlow Lite CNN operating in tandem with algorithmic Digital Signal Processing (DSP). Raw <code>.wav</code> waveforms are evaluated dynamically across multiple vectors.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-inner">
                <h4 className="text-lg font-mono text-accent mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Feature Extraction Math
                </h4>
                
                <div className="mb-6">
                  <strong className="block text-accent font-mono mb-2">1. Fast Fourier Transformation (FFT)</strong>
                  <p className="text-textSecondary text-sm mb-3">STFT maps time-domain waveforms into frequency-domain spectrograms.</p>
                  <div className="bg-black p-4 rounded text-center overflow-x-auto"><BlockMath math="X(m, \omega) = \sum_{n=-\infty}^{\infty} x(n) w(n - m) e^{-j\omega n}" /></div>
                </div>

                <div className="mb-6">
                  <strong className="block text-accent font-mono mb-2">2. Mel Scale Transformation</strong>
                  <p className="text-textSecondary text-sm mb-3">Frequencies (<InlineMath math="f" />) are compressed logarithmically.</p>
                  <div className="bg-black p-4 rounded text-center overflow-x-auto"><BlockMath math="m = 2595 \log_{10}\left(1 + \frac{f}{700}\right)" /></div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-inner">
                <h4 className="text-lg font-mono text-accent mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" /> Heuristics & Classification
                </h4>
                
                <div className="mb-6">
                  <strong className="block text-accent font-mono mb-2">3. Pitch Variance (<InlineMath math="\sigma_{F_0}" />)</strong>
                  <p className="text-textSecondary text-sm mb-3">Extract fundamental frequency. Low variance flags AI prosody.</p>
                  <div className="bg-black p-4 rounded text-center overflow-x-auto"><BlockMath math="\sigma_{F_0} = \sqrt{\frac{1}{N} \sum (F_{0,i} - \mu_{F_0})^2}" /></div>
                </div>

                <div className="mb-6">
                  <strong className="block text-accent font-mono mb-2">4. CNN Sigmoid Activation</strong>
                  <p className="text-textSecondary text-sm mb-3">Classification layer outputs normalized probability (<InlineMath math="0 \to 1" />).</p>
                  <div className="bg-black p-4 rounded text-center overflow-x-auto"><BlockMath math="\sigma(x) = \frac{1}{1 + e^{-x}}" /></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-8">
              <div className="bg-black/40 border border-white/10 p-5 rounded-xl flex-1 text-center flex flex-col items-center">
                <span className="font-mono text-success mb-4 block py-1 px-4 border border-success/30 bg-success/10 rounded uppercase text-sm font-bold tracking-widest">✅ REAL: High Variance</span>
                <img src="/spectrogram_real.png" alt="Real Spectrogram" className="w-full max-w-sm rounded border border-white/10 object-cover" style={{aspectRatio: '4/3'}} />
              </div>
              <div className="bg-black/40 border border-white/10 p-5 rounded-xl flex-1 text-center flex flex-col items-center">
                <span className="font-mono text-danger mb-4 block py-1 px-4 border border-danger/30 bg-danger/10 rounded uppercase text-sm font-bold tracking-widest">⚠️ FAKE: Smudged Context</span>
                <img src="/spectrogram_fake.png" alt="Fake Spectrogram" className="w-full max-w-sm rounded border border-white/10 object-cover" style={{aspectRatio: '4/3'}} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text Engine */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="bg-card/80 border-l-4 border-accent rounded-xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute top-8 right-8 text-accent/20"><FileText className="w-32 h-32" /></div>
          <div className="relative z-10 w-full xl:w-5/6">
            <h3 className="text-2xl font-mono text-accent mb-4 flex items-center gap-3">
              <FileText className="w-8 h-8" /> Text Engine: NLP Math & RoBERTa
            </h3>
            <p className="text-textSecondary text-lg mb-8 leading-relaxed">
              Evaluates both statistical properties (Stylometrics) and deep syntactic probability to detect LLM generation patterns.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-inner">
                <h4 className="text-lg font-mono text-accent mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Statistical Heuristics
                </h4>
                
                <div className="mb-6">
                  <strong className="block text-accent font-mono mb-2">1. Burstiness (<InlineMath math="\sigma" />)</strong>
                  <p className="text-textSecondary text-sm mb-3">Std dev of sentence lengths. AI models generate low variance.</p>
                  <div className="bg-black p-4 rounded text-center overflow-x-auto"><BlockMath math="\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (L_i - \mu)^2}" /></div>
                </div>

                <div className="mb-6">
                  <strong className="block text-accent font-mono mb-2">2. Shannon Entropy (<InlineMath math="H" />)</strong>
                  <p className="text-textSecondary text-sm mb-3">Evaluates predictability of sequence tokens.</p>
                  <div className="bg-black p-4 rounded text-center overflow-x-auto"><BlockMath math="H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)" /></div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-inner flex flex-col justify-center">
                <h4 className="text-lg font-mono text-accent mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" /> Neural Engine (RoBERTa)
                </h4>
                
                <div className="mb-6">
                  <strong className="block text-accent font-mono mb-2">3. Scaled Dot-Product Attention</strong>
                  <p className="text-textSecondary text-sm mb-3">Bidirectional self-attention identifying syntactic plasticity.</p>
                  <div className="bg-black p-4 rounded flex items-center justify-center min-h-[140px] text-center overflow-x-auto"><BlockMath math="Attention(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V" /></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vision Engine */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card/80 border-l-4 border-accent rounded-xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute top-8 right-8 text-accent/20"><Eye className="w-32 h-32" /></div>
          <div className="relative z-10 w-full xl:w-5/6">
            <h3 className="text-2xl font-mono text-accent mb-4 flex items-center gap-3">
              <Eye className="w-8 h-8" /> Vision Engine: Hybrid Cloud Temporal Analysis
            </h3>
            <p className="text-textSecondary text-lg mb-8 leading-relaxed">
              VoxSentinel pairs local extraction logic with a scalable Cloud Vision API for deepfake video and image detection. The system focuses on physical logic rather than pixel-level noise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/40 border border-white/10 p-6 rounded-xl">
                <h4 className="font-mono text-accent mb-3 text-lg">Local Extraction (Metadata)</h4>
                <p className="text-textSecondary text-base leading-relaxed">
                  <strong className="text-white">Software Signature Sweeping:</strong> Parses raw EXIF headers before rendering, flagging hidden metadata injected by generators (e.g., <code>Software: Midjourney</code>).
                </p>
              </div>
              <div className="bg-black/40 border border-white/10 p-6 rounded-xl">
                <h4 className="font-mono text-accent mb-3 text-lg">Cloud Analysis (Temporal)</h4>
                <p className="text-textSecondary text-base leading-relaxed mb-4">
                  <strong className="text-white">Structural Shifting:</strong> Analyzes complex background geometry to detect "morphing" characteristic of generative models.
                </p>
                <p className="text-textSecondary text-base leading-relaxed">
                  <strong className="text-white">Kinematic Failures:</strong> Evaluates shadow angles, reflection consistency, and gravity mapping.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SystemArchitecture;
