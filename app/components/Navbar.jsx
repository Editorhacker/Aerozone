"use client";

import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';

// Navigation items configuration
const NAV_ITEMS = [
  { href: '/', label: 'HOME', id: 'home' },
  { href: '/event', label: 'EVENTS', id: 'events' },
  { href: '/pdf-page', label: 'DATABASE', id: 'database' },
  { href: '#contact', label: 'CONTACT', id: 'contact' }
];

// Particle Effect Component
const ParticleEffect = React.memo(() => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles only on client-side to avoid hydration mismatch
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-24 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-float"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  );
});

ParticleEffect.displayName = 'ParticleEffect';

// Logo Component
const NavbarLogo = React.memo(() => (
  <Link href="/" className="group">
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center group-hover:animate-pulse">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
      </div>
      
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 group-hover:from-white group-hover:via-cyan-300 group-hover:to-blue-400 transition-all duration-300">
        AEROSPACE
      </h1>
      
      <div className="hidden lg:block">
        <span className="text-xs text-cyan-300/70 font-mono tracking-wider">
          [SYS_ONLINE]
        </span>
      </div>
    </div>
  </Link>
));

NavbarLogo.displayName = 'NavbarLogo';

// Navigation Links Component
const NavigationLinks = React.memo(() => (
  <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
    {NAV_ITEMS.map((item) => (
      <Link 
        key={item.id}
        href={item.href} 
        className="relative group px-6 py-3 mx-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 rounded"
      >
        {/* Hexagonal background */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <polygon 
              points="15,5 85,5 95,25 85,45 15,45 5,25" 
              fill="rgba(34, 211, 238, 0.1)"
              stroke="currentColor"
              strokeWidth="1"
              className="text-cyan-400"
            />
          </svg>
        </div>
        
        <span className="relative z-10 text-sm font-semibold tracking-wider text-gray-300 group-hover:text-white transition-all duration-300 font-mono">
          {item.label}
        </span>
        
        {/* Animated underline */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-4/5 transition-all duration-300" />
        
        {/* Side glow effects */}
        <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-1 h-0 bg-cyan-400 group-hover:h-6 transition-all duration-300 rounded-full" />
        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-1 h-0 bg-cyan-400 group-hover:h-6 transition-all duration-300 rounded-full" />
      </Link>
    ))}
  </nav>
));

NavigationLinks.displayName = 'NavigationLinks';

// Mobile Menu Button Component
const MobileMenuButton = React.memo(({ isOpen, onToggle }) => (
  <button 
    className="md:hidden relative group p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 rounded"
    onClick={onToggle}
    aria-label="Toggle mobile menu"
    aria-expanded={isOpen}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
    <svg className="relative z-10 w-6 h-6 text-cyan-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
    {/* Corner accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 group-hover:w-3 group-hover:h-3 transition-all duration-300" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 group-hover:w-3 group-hover:h-3 transition-all duration-300" />
  </button>
));

MobileMenuButton.displayName = 'MobileMenuButton';

// Mobile Menu Component
const MobileMenu = React.memo(({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-b-2 border-cyan-400/30 shadow-2xl z-50">
      <nav className="px-4 py-4 space-y-2" role="navigation" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-cyan-400/10 rounded transition-all duration-300 font-mono text-sm tracking-wider"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
});

MobileMenu.displayName = 'MobileMenu';

// Background Effects Component
const BackgroundEffects = React.memo(({ isVisible }) => (
  <>
    {/* Sci-fi ambient glow effect - only when navbar is visible */}
    <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-500/5 via-blue-500/3 to-transparent pointer-events-none transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`} />
    
    {/* Holographic border effect - only when navbar is visible */}
    <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-sm transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`} />
    
    {/* Animated circuit pattern background - only when navbar is visible */}
    <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${
      isVisible ? 'opacity-10' : 'opacity-0'
    }`}>
      <svg className="w-full h-full" viewBox="0 0 1000 100">
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="20" cy="20" r="2" fill="currentColor">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="80" cy="80" r="2" fill="currentColor">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
            </circle>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" className="text-cyan-400"/>
      </svg>
    </div>
    
    {/* Bottom scanning line - only when navbar is visible */}
    <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="h-full w-20 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
    </div>
  </>
));

BackgroundEffects.displayName = 'BackgroundEffects';

// Main Navbar Component
const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useMemo(
    () => () => setIsMobileMenuOpen(prev => !prev),
    []
  );

  const handleMouseEnter = useMemo(
    () => () => setIsHovered(true),
    []
  );

  const handleMouseLeave = useMemo(
    () => () => setIsHovered(false),
    []
  );

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <BackgroundEffects isVisible={isHovered} />
      
      {/* Transparent hover trigger area */}
      <div 
        className="absolute top-0 left-0 w-full h-12 z-10 cursor-pointer"
        onMouseEnter={handleMouseEnter}
      >
        <div className={`w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-30'
        }`} />
      </div>
      
      {/* Main Navbar */}
      <div 
        className={`transition-all duration-500 ease-out transform ${
          isHovered 
            ? 'translate-y-0 opacity-100 scale-100' 
            : '-translate-y-full opacity-0 scale-95'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <header className="relative bg-gray-900/95 backdrop-blur-xl border-b-2 border-cyan-400/30 shadow-2xl">
          <div className="relative max-w-7xl mx-auto flex justify-between items-center py-4 px-8">
            <NavbarLogo />
            <NavigationLinks />
            <MobileMenuButton isOpen={isMobileMenuOpen} onToggle={handleMobileMenuToggle} />
          </div>
        </header>
        
        <MobileMenu isOpen={isMobileMenuOpen} />
      </div>
      
      <ParticleEffect />
      
      {/* Particle effects only show when navbar is visible */}
      {isHovered && <ParticleEffect />}
      
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 1; 
          }
        }
        
        .animate-float {
          animation: float var(--animation-duration, 4s) infinite ease-in-out;
          animation-delay: var(--animation-delay, 0s);
        }
      `}</style>
    </div>
  );
};

export default Navbar;
