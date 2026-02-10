'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

// Stock company names mapping (same as MarketOverview)
const STOCK_NAMES: { [key: string]: string } = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc. (Class A)',
  'GOOG': 'Alphabet Inc. (Class C)',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'META': 'Meta Platforms Inc.',
  'TSLA': 'Tesla Inc.',
  'AVGO': 'Broadcom Inc.',
  'ORCL': 'Oracle Corporation',
  'CRM': 'Salesforce Inc.',
  'ADBE': 'Adobe Inc.',
  'AMD': 'Advanced Micro Devices',
  'CSCO': 'Cisco Systems Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'V': 'Visa Inc.',
  'MA': 'Mastercard Incorporated',
  'BAC': 'Bank of America Corp',
  'WFC': 'Wells Fargo & Company',
  'JNJ': 'Johnson & Johnson',
  'UNH': 'UnitedHealth Group',
  'PG': 'Procter & Gamble Co.',
  'KO': 'The Coca-Cola Company',
  'WMT': 'Walmart Inc.',
  'DIS': 'The Walt Disney Company',
  'NFLX': 'Netflix Inc.',

};

// Function to get company domain for logo URLs
const getCompanyDomain = (symbol: string): string => {
  const domains: Record<string, string> = {
    'AAPL': 'AAPL',
    'MSFT': 'MSFT',
    'GOOGL': 'GOOGL',
    'GOOG': 'GOOGL',
    'AMZN': 'AMZN',
    'TSLA': 'TSLA',
    'META': 'META',
    'NVDA': 'NVDA',
    'JPM': 'JPM',
    'JNJ': 'JNJ',
    'V': 'V',
    'PG': 'PG',
    'UNH': 'UNH',
  };
  return domains[symbol] || symbol.toUpperCase();
};

// Trending stocks - Popular S&P 500 companies
const TRENDING_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM'];

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingStocks, setTrendingStocks] = useState<StockData[]>([]);
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Fetch trending stocks on mount
  useEffect(() => {
    const fetchTrendingStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch(api.market.quotes(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: TRENDING_STOCKS }),
        });

        if (response.ok) {
          const data = await response.json();
          setTrendingStocks(data);
        }
      } catch (error) {
        console.error('Error fetching trending stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingStocks();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      try {
        setSearching(true);
        const query = searchQuery.toUpperCase();
        
        // Accept any valid ticker symbol (not just SP500)
        // Allow any combination of letters and numbers (1-5 characters is typical)
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

    const timer = setTimeout(performSearch, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const stocksToShow = searchQuery.trim() ? searchResults : trendingStocks;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Stock Search</h1>
          <p className="text-gray-400">Search for stocks or browse trending companies</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by symbol ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
              </div>
            )}
          </div>
          {!searchQuery.trim() && (
            <p className="text-gray-500 text-sm mt-2">
              Showing {TRENDING_STOCKS.length} trending stocks
            </p>
          )}
          {searchQuery.trim() && (
            <p className="text-gray-500 text-sm mt-2">
              Showing {searchResults.length} results
            </p>
          )}
        </div>

        {/* Results Grid */}
        {loading && !searchQuery.trim() ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : stocksToShow.length === 0 && searchQuery.trim() ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No stocks found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stocksToShow.map((stock) => {
              const isPositive = stock.change >= 0;
              const companyName = STOCK_NAMES[stock.symbol] || stock.name;
              const logoUrl = `https://financialmodelingprep.com/image-stock/${getCompanyDomain(stock.symbol)}.png`;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => router.push(`/watchlist?symbol=${stock.symbol}`)}
                  className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:bg-gray-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group"
                >
                  {/* Logo and Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:bg-gray-600 transition">
                      <img
                        src={logoUrl}
                        alt={stock.symbol}
                        className="w-10 h-10 object-contain p-1"
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition">
                        {stock.symbol}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{companyName}</p>
                    </div>
                  </div>

                  {/* Price and Change */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-semibold text-white">
                        ${stock.price.toFixed(2)}
                      </span>
                      <span className={`text-sm font-semibold flex items-center gap-1 ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? '▲' : '▼'}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Vol: {(stock.volume / 1000000).toFixed(1)}M
                    </p>
                  </div>

                  {/* Hover Action */}
                  <div className="mt-4 pt-4 border-t border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-cyan-400 text-center font-medium">
                      View Details →
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
