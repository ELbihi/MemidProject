import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-brand-600 text-white shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)] hover:shadow-[0_0_25px_-5px_rgba(14,165,233,0.7)] hover:bg-brand-500 border border-transparent",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-brand-200 hover:bg-brand-50/50 shadow-sm",
    outline: "border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm",
    ghost: "text-slate-600 hover:text-brand-600 hover:bg-brand-50/50",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode; dark?: boolean }> = ({ 
  id, 
  className = '', 
  children, 
  dark = false 
}) => {
  return (
    <section 
      id={id} 
      className={`py-24 md:py-32 relative ${dark ? 'bg-slate-950 text-white' : 'bg-transparent text-slate-900'} ${className}`}
    >
      {dark && (
        <div className="absolute inset-0 bg-grid-pattern-dark bg-grid opacity-[0.03] pointer-events-none" />
      )}
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {children}
      </div>
    </section>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-100 ${className}`}>
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ title: React.ReactNode; subtitle?: string; center?: boolean; light?: boolean }> = ({ 
  title, 
  subtitle, 
  center = false,
  light = false
}) => {
  return (
    <div className={`mb-16 ${center ? 'text-center' : ''}`}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.1] ${light ? 'text-white' : 'text-slate-900'}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`text-lg md:text-xl max-w-3xl leading-relaxed ${center ? 'mx-auto' : ''} ${light ? 'text-slate-400' : 'text-slate-600'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export const BentoCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  icon?: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}> = ({ children, className = '', title, icon, delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-brand-100/50 transition-all duration-500 ${className}`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-50/50 rounded-full blur-3xl group-hover:bg-brand-100/50 transition-colors duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        {(icon || title) && (
          <div className="mb-4">
            {icon && <div className="mb-4 inline-flex p-3 rounded-2xl bg-brand-50 text-brand-600">{icon}</div>}
            {title && <h3 className="text-xl font-bold text-slate-900">{title}</h3>}
          </div>
        )}
        <div className="text-slate-600 leading-relaxed flex-grow">
          {children}
        </div>
      </div>
    </motion.div>
  );
};