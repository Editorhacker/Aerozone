"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

// Navigation items configuration
const NAV_ITEMS = [
  { to: "/", label: "Home", id: "home" },
  { 
    label: "Module 1", 
    id: "module1",
    children: [
      { to: '/data', id: 'DataPage', label: 'Main chart', icon: '🏠' },
      { to: '/data2', id: 'DataPage2', label: 'Planer Checker', icon: '📊' },
      { to: '/pdf-to-json', id: 'PdfJson', label: 'PDF TO JSON', icon: '📈' },
    ]
  },
  { to: "/Module2", label: "Module 2", id: "module2" },
  { to: "/future-module", label: "Future Module", id: "future-module" },
];

// Main Navbar Component
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModule1DropdownOpen, setIsModule1DropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsModule1DropdownOpen(false);
  }, [location.pathname]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsModule1DropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleMobileMenuToggle = useMemo(
    () => () => setIsMobileMenuOpen((prev) => !prev),
    []
  );
  
  const handleModule1DropdownToggle = () => {
    setIsModule1DropdownOpen(!isModule1DropdownOpen);
  };
  
  // Check if any child of Module 1 is active
  const isModule1Active = NAV_ITEMS.find(item => item.id === "module1")?.children?.some(
    child => location.pathname === child.to
  );
  
  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-gray-900/95 backdrop-blur-lg shadow-md py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4" aria-label="Home">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block ml-2">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                AEROSPACE
              </h1>
              <span className="text-xs text-cyan-300/60 font-mono">
                SYSTEMS ONLINE
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              if (item.id === "module1") {
                const isActive = isModule1Active;
                return (
                  <div key={item.id} className="relative" ref={dropdownRef}>
                    <button
                      onClick={handleModule1DropdownToggle}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                        isActive 
                          ? "bg-cyan-500/10 text-cyan-300" 
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      }`}
                      aria-expanded={isModule1DropdownOpen}
                    >
                      {item.label}
                      <svg 
                        className={`ml-1 w-4 h-4 transform transition-transform ${isModule1DropdownOpen ? 'rotate-180' : ''}`} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isModule1DropdownOpen && (
                      <div className="absolute left-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-lg rounded-lg shadow-lg py-2 z-10">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            to={child.to}
                            className={`block px-4 py-2 text-sm flex items-center ${
                              location.pathname === child.to 
                                ? "text-cyan-300 bg-cyan-500/10" 
                                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                            }`}
                            onClick={() => setIsModule1DropdownOpen(false)}
                          >
                            <span className="mr-2">{child.icon}</span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-cyan-500/10 text-cyan-300" 
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              }
            })}
          </nav>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 transition-all duration-200"
            onClick={handleMobileMenuToggle}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="w-6 h-6 relative">
              <span 
                className={`absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1"
                }`} 
              />
              <span 
                className={`absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`} 
              />
              <span 
                className={`absolute block h-0.5 w-full bg-current transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1"
                }`} 
              />
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 bg-gray-900/95 backdrop-blur-lg rounded-b-lg shadow-lg">
          <nav className="px-4 py-3 space-y-1" role="navigation" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => {
              if (item.id === "module1") {
                const isActive = isModule1Active;
                return (
                  <div key={item.id}>
                    <button
                      onClick={handleModule1DropdownToggle}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-between ${
                        isActive 
                          ? "bg-cyan-500/10 text-cyan-300" 
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                      }`}
                      aria-expanded={isModule1DropdownOpen}
                    >
                      {item.label}
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${isModule1DropdownOpen ? 'rotate-180' : ''}`} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isModule1DropdownOpen && (
                      <div className="pl-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            to={child.to}
                            className={`block px-4 py-2 rounded-lg text-sm flex items-center ${
                              location.pathname === child.to 
                                ? "text-cyan-300 bg-cyan-500/10" 
                                : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                            }`}
                          >
                            <span className="mr-2">{child.icon}</span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive 
                        ? "bg-cyan-500/10 text-cyan-300" 
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              }
            })}
          </nav>
        </div>
      )}
      
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
    </header>
  );
};

export default Navbar;