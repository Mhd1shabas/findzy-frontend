import React from "react";

interface CategoryCardProps {
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({ title, icon, onClick, className = "" }: CategoryCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-6 bg-primary-light/50 rounded-2xl cursor-pointer hover:bg-primary-light hover:shadow-lg transition-all duration-300 border border-primary-light ${className}`}
    >
      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-center">{title}</h3>
    </div>
  );
}
