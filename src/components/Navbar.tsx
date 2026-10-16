'use client';

import React from 'react';

export default function Navbar() {
  return (
    <nav id="navigation-menu" className="fixed top-0 left-0 right-0 z-50">
      <div className="w-11/12 md:w-10/12 max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex flex-col cursor-pointer select-none">
          <span className="invisible text-[10px] text-[#4a5568] hidden sm:inline -mt-1 font-mono">
            [Studio Foto Profil Sadar Karhutla]
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs md:text-base font-bold text-[#2c3e50] pixelbold tracking-wider">
              BUKAN_FILTER.EXE
            </span>
            <span className="inline-block w-2 h-3 bg-[#e74c3c] pixel-blinker"></span>
          </div>
          <span className="invisible text-[10px] text-[#4a5568] hidden sm:inline -mt-1 font-mono">
            [Studio Foto Profil Sadar Karhutla]
          </span>
        </a>
      </div>
    </nav>
  );
}
