'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isScrolledButtonHovered, setIsScrolledButtonHovered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const NavItems = [
    { label: 'Team', href: '/team' },
    { label: 'Agenda', href: '/agenda' },
    { label: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      ref={navRef}
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'top-4 w-auto' 
          : 'top-0 w-full'
      }`}
    >
      <div 
        className={`flex font-bricolage items-center justify-between transition-all duration-500 ease-out ${
          isScrolled 
            ? 'px-6 py-3 bg-white/10 backdrop-blur-md rounded-full' 
            : 'px-8 lg:px-16 py-6 bg-transparent'
        }`}
      >
        <div
          className="text-white font-bold text-3xl mr-6 cursor-pointer"
          onClick={() => (window.location.href = '/')}
        >
          <span className="italic lowercase">gantavya</span>
        </div>

        <div 
          className={`flex items-center gap-4 transition-all duration-150 ${
            isScrolled 
              ? 'opacity-0 w-0 overflow-hidden' 
              : 'opacity-100 w-auto'
          }`}
        >
          {NavItems.map((item, index) => (
            <a
              href={item.href}
              key={index}
              ref={(el) => {
                navItemsRef.current[index] = el;
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className='relative text-white px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-sm font-medium overflow-hidden group'
            >
              <span 
                className={`absolute inset-0 bg-blue-700 rounded-full transition-transform duration-150 ease-out ${
                  hoveredIndex === index 
                    ? 'translate-y-0' 
                    : 'translate-y-full'
                }`}
              />
              <span className='relative z-10'>{item.label}</span>
            </a>
          ))}

          <button 
            onMouseEnter={() => setIsButtonHovered(true)}
            onClick={() => window.location.href = '/register'}
            onMouseLeave={() => setIsButtonHovered(false)}
            className='px-4 py-3 font-semibold rounded-full bg-white text-black hover:border hover:border-neutral-200 hover:bg-blue-600 hover:text-neutral-100 transition-all duration-300 flex items-center gap-2 group hover:cursor-pointer'
          >
            <span className='text-base'>Register</span>
            <span className='w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white transition-transform duration-300'>
              <div className='relative w-10 h-10 flex items-center justify-center'>
                <ArrowUpRight 
                  className={`w-6 h-6 flex items-center justify-center transition-all duration-700 ${
                    isButtonHovered 
                      ? 'opacity-100 rotate-45 bg-neutral-100 rounded-full text-blue-600' 
                      : 'opacity-100 rotate-0'
                  }`}
                />
              </div>
            </span>
          </button>
        </div>
        <button 
          onMouseEnter={() => setIsScrolledButtonHovered(true)}
          onMouseLeave={() => setIsScrolledButtonHovered(false)}
          className={`px-6 py-3 font-semibold rounded-full bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-500 flex items-center gap-2 hover:cursor-pointer ${
            isScrolled 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 absolute pointer-events-none'
          }`}
        >
          <span className='text-base'>Register</span>
          <span className='w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white transition-transform duration-500'>
            <div className='relative w-4 h-4'>
              <ArrowUpRight 
                className={`w-4 h-4 absolute inset-0 transition-all duration-700 ${
                  isScrolledButtonHovered 
                    ? 'opacity-100 rotate-45' 
                    : 'opacity-100 rotate-0'
                }`}
              />
            </div>
          </span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;