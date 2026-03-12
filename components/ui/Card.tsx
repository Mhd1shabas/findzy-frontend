import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  // Uses globals.css values: rounded-xl (~12px), bg-white, soft shadow and 20px padding (p-5)
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[12px] p-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ${onClick ? 'cursor-pointer hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
