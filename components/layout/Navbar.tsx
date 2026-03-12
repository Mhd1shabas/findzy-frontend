"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check login status on client side after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse-services?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm border-b border-gray-100 transition-all duration-300">
      {/* Left - Logo */}
      <div className="flex-1">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors duration-300">
            Findzy
          </span>
        </Link>
      </div>

      {/* Center - Links */}
      <nav className="hidden md:flex items-center gap-8 text-[15px] font-bold">
        <Link
          href="/browse-services"
          className="text-gray-600 hover:text-emerald-600 transition-colors"
        >
          Browse Services
        </Link>
        {isLoggedIn && (
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-emerald-600 transition-colors"
          >
            Dashboard
          </Link>
        )}
      </nav>

      {/* Right - Search & Auth Actions */}
      <div className="flex-1 flex items-center justify-end gap-4 text-sm font-bold">
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-64 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-normal text-gray-700"
          />
          <button type="submit" className="absolute right-3 text-gray-400 hover:text-emerald-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </form>

        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-emerald-600 transition-colors px-2"
              >
                Log in
              </Link>
              <Link href="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 transition-colors shadow-sm">
                  Sign up
                </Button>
              </Link>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 text-gray-600 transition-colors shadow-sm rounded-full px-6"
            >
              Log out
            </Button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-white border-b border-gray-100 shadow-xl md:hidden flex flex-col p-6 gap-6 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="flex items-center relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-normal text-gray-700"
            />
            <button type="submit" className="absolute right-3 text-gray-400 hover:text-emerald-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>

          <nav className="flex flex-col gap-4 text-base font-bold">
            <Link
              href="/browse-services"
              className="text-gray-700 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Services
            </Link>
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-emerald-600 transition-colors p-2 rounded-lg hover:bg-emerald-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
            {!isLoggedIn ? (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-gray-200 text-gray-700 justify-center py-6 rounded-xl text-base">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-center py-6 rounded-xl text-base">
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-gray-200 text-gray-600 py-6 rounded-xl text-base"
              >
                Log out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
