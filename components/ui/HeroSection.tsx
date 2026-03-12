import React from "react";

interface HeroSectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function HeroSection({ title, subtitle, children, className = "" }: HeroSectionProps) {
  return (
    <section className={`w-full py-16 px-4 sm:px-6 lg:px-8 border-b border-primary-light/50 ${className}`} 
             style={{ background: "linear-gradient(135deg, var(--primary-light), #a7f3d0)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            {title && <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">{title}</h1>}
            {subtitle && <p className="text-lg text-foreground/80 max-w-2xl">{subtitle}</p>}
          </div>
          {children && (
            <div className="shrink-0 w-full sm:w-auto">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
