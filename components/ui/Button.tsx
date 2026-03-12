import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({ 
  variant = "primary", 
  size = "md", 
  className = "", ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 outline-none";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20",
    secondary: "bg-primary-light text-primary-dark hover:bg-primary-light/80",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-5 py-2.5 rounded-[10px]", // User specified ~10px padding 18px radius 10px approx
    lg: "px-8 py-3.5 text-lg rounded-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {props.children}
    </button>
  );
}
