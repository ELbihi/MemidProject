import React, { useState, useEffect } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { Button } from './UI';
import { NAV_LINKS } from '../constants';

interface NavigationProps {
  onLoginClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLoginClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-7xl flex items-center justify-between">
        <a href="#" onClick={() => window.scrollTo(0,0)} className="flex items-center gap-2 group">
          <div className="bg-brand-600 p-1.5 rounded-lg group-hover:bg-brand-700 transition-colors">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            MedMemic
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className={`text-sm font-medium hover:text-brand-600 transition-colors ${scrolled ? 'text-slate-600' : 'text-slate-600'}`}
            >
              {link.label}
            </a>
          ))}
          <button 
            onClick={onLoginClick}
            className={`text-sm font-bold transition-colors ${scrolled ? 'text-slate-900 hover:text-brand-600' : 'text-slate-700 hover:text-brand-600'}`}
          >
            Se connecter
          </button>
          <Button size="sm" onClick={() => document.getElementById('pricing')?.scrollIntoView()}>
            Rejoindre la liste
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-lg md:hidden p-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              className="text-base font-medium text-slate-600 py-2 border-b border-slate-50"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button 
            onClick={() => {
              setIsOpen(false);
              onLoginClick();
            }}
            className="text-base font-bold text-slate-900 py-2 text-left"
          >
            Se connecter
          </button>
          <Button fullWidth onClick={() => {
            setIsOpen(false);
            document.getElementById('pricing')?.scrollIntoView();
          }}>
            Rejoindre la liste
          </Button>
        </div>
      )}
    </header>
  );
};