'use client';

import React from 'react';

interface PixelBoxProps {
  children: React.ReactNode;
  className?: string;
}

export default function PixelBox({ children, className = '' }: PixelBoxProps) {
  return (
    <div
      className={`qtip qtip-default cdo-qtips ${className}`}
      style={{
        display: 'block',
        position: 'relative',
      }}
    >
      <div className="qtip-content !p-2 md:!p-3">
        {children}
      </div>
    </div>
  );
}
