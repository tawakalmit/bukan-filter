'use client';

import React from 'react';

interface PixelButtonProps {
  title: string;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function PixelButton({
  title,
  onClick,
  href,
  isActive = false,
  disabled = false,
  className = '',
  icon,
}: PixelButtonProps) {
  const content = (
    <button
      type="button"
      id="runButton"
      onClick={onClick}
      disabled={disabled}
      className={`text-xs md:text-sm h-9 md:h-10 flex items-center justify-center gap-2 px-3 md:px-5 transition-all duration-100 ${
        isActive ? 'active' : ''
      } ${className}`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span className="font-bold tracking-wide">{title}</span>
    </button>
  );

  if (href) {
    return (
      <a href={href} className="inline-block text-decoration-none">
        {content}
      </a>
    );
  }

  return content;
}
