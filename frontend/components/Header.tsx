'use client';

import React, { useContext, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

// Create context for sidebar
export const SidebarContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

// Function to get company logo URL
const getCompanyLogo = (symbol: string): string => {
  // Try multiple sources for logos
  // First, try company-specific domains
 
  
  // Use the same API as MarketQuotes component for consistency with all S&P 500 stocks
  return `https://financialmodelingprep.com/image-stock/${symbol.toUpperCase()}.png`;
};

const Header = () => {
  const sidebarContext = useContext(SidebarContext);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const performSearch = async () => {
      try {
        setSearching(true);
        const query = searchQuery.toUpperCase();
        
        // Accept any symbol that matches the query (not just SP500)
        // Allow any combination of letters and numbers (valid ticker format)
        if (!/^[A-Z0-9]{1,5}$/.test(query)) {
          setSearchResults([]);
          return;
        }

        // Try to fetch the symbol directly from yfinance
        const response = await fetch(api.market.quotes(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: [query] }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setSearchResults(data);
            setShowResults(true);
          } else {
            setSearchResults([]);
          }
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    if (sidebarContext?.isOpen !== undefined && sidebarContext?.setIsOpen) {
      sidebarContext.setIsOpen(!sidebarContext.isOpen)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowResults(false);
    }
  }

  const handleSelectStock = (symbol: string) => {
    router.push(`/watchlist?symbol=${symbol}`);
    setSearchQuery('');
    setShowResults(false);
  }

  return (
    <header className='sticky top-0 z-50 bg-slate-950'> 
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between gap-8'>
          {/* Logo + Menu Toggle */}
          <div className='flex items-center gap-4 shrink-0'>
            <button
              onClick={toggleSidebar}
              className='block md:hidden p-2 rounded-lg hover:bg-gray-700/30 transition-colors text-gray-400 hover:text-cyan-400 cursor-pointer'
              aria-label="Toggle sidebar"
              type="button"
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            
            <Link href='/' className='shrink-0'>
              <Image 
                src="/assets/logo.svg" 
                alt="Stock-nex logo" 
                width={175} 
                height={40} 
                className='h-8 w-auto cursor-pointer'
                priority
              />
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className='flex-1 max-w-2xl mx-auto' ref={searchRef}>
            <form onSubmit={handleSearch} className='relative'>
              <div className='relative flex items-center'>
                <input
                  type="text"
                  placeholder="Search for stocks or browse trending companies"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && searchResults.length > 0 && setShowResults(true)}
                  className='w-full bg-gray-700/50 text-gray-100 placeholder-gray-500 rounded-full py-3 pl-6 pr-14 border border-gray-600/50 focus:outline-none focus:border-cyan-400/50 transition-colors'
                />
                <button
                  type="submit"
                  className='absolute right-2 p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full transition-colors'
                  aria-label="Search"
                >
                  <SearchIcon size={20} />
                </button>
              </div>

              {/* Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className='absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto'>
                  {searchResults.map((stock) => {
                    const isPositive = stock.change >= 0;
                    return (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock.symbol)}
                        className='w-full px-6 py-4 text-left hover:bg-gray-700/50 transition-colors border-b border-gray-700/30 last:border-b-0 flex items-center justify-between gap-4 group'
                        type="button"
                      >
                        <div className='flex items-center gap-3 flex-1'>
                          <div className='w-10 h-10 bg-gray-600 rounded flex items-center justify-center flex-shrink-0 overflow-hidden'>
                            <img 
                              src={getCompanyLogo(stock.symbol)}
                              alt={stock.symbol}
                              className='w-10 h-10 object-contain p-0.5'
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent && !parent.querySelector('.fallback-initials')) {
                                  const fallback = document.createElement('span');
                                  fallback.className = 'fallback-initials text-xs font-bold text-gray-100';
                                  fallback.textContent = stock.symbol.substring(0, 2);
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <div className='font-semibold text-white group-hover:text-emerald-400 transition-colors'>
                              {stock.symbol}
                            </div>
                            <div className='text-sm text-gray-400'>
                              {stock.name}
                            </div>
                          </div>
                        </div>
                        <div className='text-right shrink-0'>
                          <div className='font-semibold text-white'>
                            ${stock.price.toFixed(2)}
                          </div>
                          <div className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </form>
          </div>

          {/* Right spacer for balance */}
          <div className='shrink-0 flex items-center gap-3'>
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => router.push('/sign-in')}
                  className='px-4 py-2 text-white hover:text-cyan-400 transition-colors font-medium'
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/sign-up')}
                  className='px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium'
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className='w-12'></div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


