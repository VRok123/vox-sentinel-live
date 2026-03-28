import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Shield, LayoutDashboard, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Header = ({ currentAgent }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 mx-4 mt-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-heading font-black tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
          VOX<span className="text-primary">SENTINEL</span>
        </h1>
      </div>

      <div className="flex bg-gray-200 dark:bg-[var(--color-surface-container-high)] rounded-lg p-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `px-4 py-2 rounded-md font-body font-semibold transition-all duration-300 flex items-center gap-2 ${
              isActive ? 'bg-primary text-[#000] shadow-[0_0_15px_rgba(0,218,243,0.4)]' : 'text-gray-600 dark:text-[#8c90a1] hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          Scanner Terminal
        </NavLink>
        <NavLink 
          to="/architecture" 
          className={({ isActive }) => 
            `px-4 py-2 rounded-md font-body font-semibold transition-all duration-300 flex items-center gap-2 ${
              isActive ? 'bg-primary text-[#000] shadow-[0_0_15px_rgba(0,218,243,0.4)]' : 'text-gray-600 dark:text-[#8c90a1] hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          <Database className="w-4 h-4" />
          System Architecture
        </NavLink>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[#00ff9d] font-heading text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00ff9d] animate-pulse"></span>
          AGENT {currentAgent || "UNKNOWN"}
        </div>
        
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full bg-gray-200 dark:bg-[var(--color-surface-container-high)] border border-gray-300 dark:border-[#424656] text-primary hover:bg-primary hover:text-black transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
};

export default Header;
