import React from "react";
import { Search } from "lucide-react";
import { Button } from "./Button";

interface SearchBoxProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onSearch?: () => void;
  className?: string;
}

export function SearchBox({ placeholder = "Search for services...", value, onChange, onSearch, className = "" }: SearchBoxProps) {
  return (
    <div className={`flex items-center bg-white rounded-full p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 ${className}`}>
      <div className="pl-4 pr-2 text-gray-400">
        <Search className="w-5 h-5 text-primary" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch()}
        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 py-2 min-w-0"
      />
      <Button 
        size="sm" 
        className="rounded-full px-5 ml-2" 
        onClick={onSearch}
      >
        Search
      </Button>
    </div>
  );
}
