import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import './index.css';

import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import ScannerView from './components/ScannerView';
import ArchitectureView from './components/ArchitectureView';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
       <BrowserRouter>
         <div className="flex flex-col min-h-screen">
           <Header currentAgent="774-OMEGA" />
           <main className="flex-1 flex flex-col p-4 z-10">
             <Routes>
               <Route path="/" element={<ScannerView currentAgent="774-OMEGA" />} />
               <Route path="/architecture" element={<ArchitectureView />} />
             </Routes>
           </main>
           
           <footer className="py-6 text-center font-heading text-xs text-[#8c90a1] tracking-widest mt-auto">
             SECURE CONNECTION ESTABLISHED • AWS CLOUD (US-EAST-1)
           </footer>
           
           {/* Dark Mode Background Light Elements */}
           <div className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] bg-[var(--color-primary)] opacity-[0.03] blur-[150px] rounded-full z-0 dark:block hidden"></div>
         </div>
       </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
