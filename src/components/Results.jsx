import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Activity, Image as ImageIcon, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const Results = ({ data }) => {
  const [animatedConf, setAnimatedConf] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const target = parseFloat(data.confidence) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setAnimatedConf(progress * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [data.confidence]);

  const isFake = data.verdict === 'FAKE';
  const color = isFake ? 'var(--color-error)' : 'var(--color-secondary-fixed-dim)';

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(0, 40, 100); 
    doc.text("VOXSENTINEL | FORENSIC REPORT", 20, 20);
    doc.setFontSize(16); doc.setTextColor(0, 0, 0); doc.text(`Verdict: ${data.verdict}`, 20, 40);
    doc.setFillColor(isFake ? 255 : 0, isFake ? 0 : 255, 0); doc.rect(18, 45, 170, 2, "F"); 
    let y = 60; doc.setFontSize(12); doc.setFont("helvetica", "normal");
    doc.text(`Scan ID: ${data.scan_id || 'N/A'}`, 20, y); y += 10;
    doc.text(`Type: ${data.type}`, 20, y); y += 10;
    doc.text(`Confidence: ${data.confidence}%`, 20, y); y += 10;
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 20, y); y += 20;
    doc.setFont("helvetica", "bold"); doc.text("Forensics:", 20, y); y += 10;
    doc.setFont("helvetica", "normal");
    if (data.forensics) { data.forensics.forEach(line => { doc.text("- " + line.replace(/[^\x00-\x7F]/g, ""), 20, y); y += 10; }); }
    doc.save('VoxSentinel_Report.pdf');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto"
    >
      <div className="glass-panel p-8 flex flex-col justify-center items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <h3 className="font-heading text-lg tracking-[0.05rem] uppercase text-gray-500 dark:text-[#8c90a1] mb-2">Analysis Verdict</h3>
        <motion.div 
          key={data.verdict}
          initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          className="text-5xl font-black font-heading mb-6 tracking-tight drop-shadow-lg" 
          style={{ color }}
        >
          {data.verdict}
        </motion.div>

        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between font-body text-sm mb-2 text-gray-600 dark:text-[#c2c6d8]">
            <span>AI Probability Score</span>
            <span className="font-heading font-bold">{animatedConf.toFixed(2)}%</span>
          </div>
          <div className="w-full h-3 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-300 shadow-[0_0_10px_currentColor]" 
              style={{ width: `${animatedConf}%`, backgroundColor: color }}
            ></div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 flex flex-col items-start border-[1px] border-[rgba(0,218,243,0.1)]">
        <h3 className="font-heading text-lg tracking-[0.05rem] uppercase text-gray-500 dark:text-[#8c90a1] mb-4 flex items-center gap-2">
          {data.type === 'AUDIO' ? <Activity className="w-5 h-5 text-primary"/> : 
           data.type === 'TEXT' ? <FileText className="w-5 h-5 text-primary"/> : 
           <ImageIcon className="w-5 h-5 text-primary"/>}
          Evidence
        </h3>
        
        {data.type === 'TEXT' ? (
          <div className="bg-gray-100 dark:bg-[rgba(0,0,0,0.3)] border-l-4 border-primary p-4 rounded-r-lg w-full mb-6 max-h-48 overflow-y-auto">
            <p className="font-body text-gray-700 dark:text-[#c2c6d8] italic whitespace-pre-wrap">{data.contentSnippet}</p>
          </div>
        ) : (
          <div className="w-full aspect-video bg-black rounded-lg border border-[rgba(255,255,255,0.1)] overflow-hidden shadow-xl mb-6 relative group">
             {data.image_url ? 
               <img src={data.image_url} alt="Forensic Evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> :
               <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-[#8c90a1] font-heading">Awaiting Spectral Data...</div>
             }
          </div>
        )}

        <div className="w-full mt-auto flex justify-between items-center pt-4 border-t border-[rgba(255,255,255,0.05)]">
           <div className="font-heading text-xs text-gray-500 dark:text-[#8c90a1]">
             SCAN ID: <span className="text-gray-900 dark:text-white">{data.scan_id ? data.scan_id.substring(0,8) : 'UNK'}...</span>
           </div>
           
           <button onClick={handleDownload} className="text-xs flex items-center gap-2 font-heading bg-[rgba(0,218,243,0.1)] text-primary px-3 py-2 rounded-md hover:bg-primary hover:text-black transition-colors">
              <FileDown className="w-4 h-4" /> REPORT
           </button>
        </div>
      </div>

      <div className="glass-panel p-8 md:col-span-2 lg:col-span-1 border-[1px] border-[rgba(0,218,243,0.1)]">
        <h3 className="font-heading text-lg tracking-[0.05rem] uppercase text-gray-500 dark:text-[#8c90a1] mb-6">Indicator Breakdown</h3>
        <ul className="space-y-4">
          {data.forensics && data.forensics.length > 0 ? data.forensics.map((f, i) => {
            const isPos = f.includes('✅');
            return (
              <motion.li 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.15 }}
                key={i} 
                className={`p-4 rounded-lg bg-gray-50 dark:bg-[rgba(0,0,0,0.2)] border-l-4 font-body text-sm leading-relaxed text-gray-800 dark:text-white ${isPos ? 'border-[var(--color-secondary-fixed-dim)]' : 'border-[var(--color-error)]'}`}
              >
                {f}
              </motion.li>
            )
          }) : <li className="text-gray-500 dark:text-[#8c90a1] font-body">No forensic indicators provided.</li>}
        </ul>
      </div>

    </motion.div>
  );
};

export default Results;
