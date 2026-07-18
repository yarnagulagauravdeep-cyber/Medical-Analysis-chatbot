import React, { useState, useEffect } from 'react';
import { Activity, Sun, Moon } from 'lucide-react';

export default function Navbar({ currentRoute, setCurrentRoute }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 z-20 shadow-sm">
      {/* Branding Logo */}
      <div 
        className="flex items-center gap-2 text-blue-700 font-bold text-xl tracking-tight cursor-pointer" 
        onClick={() => setCurrentRoute('home')}
      >
        <Activity className="h-6 w-6" />
        <span>MedPulse AI</span>
      </div>

      {/* Navigation Routes */}
      <nav className="flex items-center gap-6 text-sm font-medium">
        <button 
          onClick={() => setCurrentRoute('home')} 
          className={`pb-1 transition-all ${
            currentRoute === 'home' 
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Home
        </button>
        <button 
          onClick={() => setCurrentRoute('about')} 
          className={`pb-1 transition-all ${
            currentRoute === 'about' 
              ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          About Us
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition shadow-sm flex items-center justify-center cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </nav>
    </header>
  );
}