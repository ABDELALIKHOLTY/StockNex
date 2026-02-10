'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useHeatmapCache, useStockDetailsCache } from '@/hooks/useCache';
import { useUserTracking } from '@/hooks/useUserTracking';
import { api } from '@/lib/api';
import MarketOverview from "@/components/market/MarketOverview";
import MarketNews from "@/components/market/MarketNews";
import StockChart from "@/components/StockChart";
import AuthModal from "@/components/AuthModal";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  volume?: number;
  marketCap?: number;
  sector?: string;
}

interface StockDetails {
  symbol: string;
  previousClose: number;
  open: number;
  bid: number;
  bidSize: number;
  ask: number;
  askSize: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volume: number;
  averageVolume: number;
  marketCap: number;
  beta: number;
  pe: number;
  eps: number;
  earnings: string | null;
  exDividendDate: string | null;
  forwardDividend: number;
  dividendYield: number;
  oneYearTarget: number;
  description?: string;
  sector?: string;
  industry?: string;
  fullTimeEmployees?: number;
  website?: string;
  fiscalYearEnd?: string;
}

function WatchlistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const symbolFromQuery = searchParams.get('symbol');
  const { addToWatchlist, removeFromWatchlist } = useUserTracking();
  
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showOverview, setShowOverview] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Use cache hooks for optimized data loading
  const { data: cachedStocks } = useHeatmapCache();
  const { data: cachedDetails } = useStockDetailsCache(selectedStock?.symbol || '');



  // Get up-to-date watchlist data by merging with latest cached stocks
  const getUpdatedWatchlist = () => {
    return watchlist.map(watchStock => {
      const cachedStock = stocks.find(s => s.symbol === watchStock.symbol);
      return cachedStock ? { ...watchStock, ...cachedStock } : watchStock;
    });
  };

  // Initialize stocks from cache on component mount AND handle query params
  useEffect(() => {
    const initializeStocks = async () => {
      // Start with cached stocks
      if (cachedStocks && cachedStocks.length > 0) {
        setStocks(cachedStocks);
      }
      
      // If symbol is provided in query params
      if (symbolFromQuery) {
        const upperSymbol = symbolFromQuery.toUpperCase();
        
        // First check if it's in cached stocks
        const stock = cachedStocks?.find((s: Stock) => s.symbol.toUpperCase() === upperSymbol);
        
        if (stock) {
          setSelectedStock(stock);
        } else {
          // If not in cache, fetch it directly from API (supports all yfinance symbols)
          try {
            console.log('📡 Fetching symbol from API:', upperSymbol);
            const response = await fetch(api.market.quotes(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ symbols: [upperSymbol] }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                const fetchedStock = data[0];
                setSelectedStock(fetchedStock);
                // Add it to stocks list so it appears in search/filters
                setStocks((prev) => {
                  const exists = prev.some(s => s.symbol === upperSymbol);
                  return exists ? prev : [...prev, fetchedStock];
                });
              }
            }
          } catch (error) {
            console.error('❌ Error fetching symbol:', upperSymbol, error);
          }
        }
      } else {
        // Otherwise, select the first stock if none is selected
        if (!selectedStock && cachedStocks && cachedStocks.length > 0) {
          setSelectedStock(cachedStocks[0]);
        }
      }
    };

    initializeStocks();
  }, [cachedStocks, symbolFromQuery]);

  // Load watchlist from backend (database) - SEPARATE useEffect
  useEffect(() => {
    const loadWatchlistFromDB = async () => {
      try {
        console.log('📡 loadWatchlistFromDB called');
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('⚠️ No token found');
          return;
        }

        // Get userId from /user/me endpoint (not localStorage!)
        console.log('📡 Fetching /user/me...');
        const userMeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/user/me`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!userMeResponse.ok) {
          console.warn('⚠️ Failed to get user info. Status:', userMeResponse.status);
          return;
        }

        const userData = await userMeResponse.json();
        const userId = userData.id;
        
        console.log('✅ Got userId from /user/me:', userId);
        console.log('📡 Fetching watchlist from:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/users/${userId}/watchlist`);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/users/${userId}/watchlist`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📡 Response data:', JSON.stringify(data, null, 2));
          
          if (data.watchlist && Array.isArray(data.watchlist)) {
            interface WatchlistItem {
              symbol: string;
              companyName?: string;
            }
            const watchlistStocks: Stock[] = data.watchlist.map((item: WatchlistItem) => ({
              symbol: item.symbol,
              name: item.companyName || item.symbol,
              price: 0,
              change: 0,
              changePercent: 0
            }));
            console.log('📚 Watchlist loaded from DB:', watchlistStocks);
            setWatchlist(watchlistStocks);
            
            // ⚡ IMMEDIATELY fetch prices instead of waiting 15 seconds
            if (watchlistStocks.length > 0) {
              const symbols = watchlistStocks.map(s => s.symbol);
              fetch(api.market.quotes(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbols }),
                cache: 'no-store',
              })
                .then(r => r.ok ? r.json() : null)
                .then(quotesData => {
                  if (!quotesData) return;
                  interface Quote {
                    symbol: string;
                    price?: number;
                    change?: number;
                    changePercent?: number;
                  }
                  const quotesMap = new Map(quotesData.map((q: Quote) => [q.symbol, q]));
                  
                  setWatchlist(prev => prev.map(stock => {
                    const updatedData = quotesMap.get(stock.symbol) as Quote | undefined;
                    return updatedData ? {
                      ...stock,
                      price: updatedData.price ?? stock.price,
                      change: updatedData.change ?? stock.change,
                      changePercent: updatedData.changePercent ?? stock.changePercent,
                    } : stock;
                  }));
                })
                .catch(error => console.error('❌ Error fetching prices immediately:', error));
            }
          } else {
            console.warn('⚠️ No watchlist array in response. data.watchlist:', data.watchlist);
          }
        } else {
          const errorText = await response.text();
          console.warn('⚠️ Failed to fetch watchlist. Status:', response.status, 'Error:', errorText);
        }
      } catch (error) {
        console.error('❌ Error loading watchlist from DB:', error);
      }
    };

    loadWatchlistFromDB();
  }, []); // Load ONCE on component mount

  // Search stocks via API in real-time (like header search)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      try {
        const query = searchQuery.toUpperCase().trim();
        
        // First, check local stocks for matches
        const localMatches = stocks.filter(stock => 
          stock.symbol.includes(query) ||
          stock.name.toUpperCase().includes(query)
        );

        // If found in local stocks, use them
        if (localMatches.length > 0) {
          setSearchResults(localMatches);
          return;
        }

        // Otherwise, try to fetch from API for any ticker
        if (/^[A-Z0-9]{1,5}$/.test(query)) {
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
          }
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, stocks]);

  // Refresh watchlist data every 15 seconds
  useEffect(() => {
    if (watchlist.length === 0) return;

    const fetchWatchlistData = async () => {
      try {
        const symbols = watchlist.map(s => s.symbol);
        // Use the same quotes endpoint as Header search for consistent data
        const response = await fetch(api.market.quotes(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols }),
          cache: 'no-store',
        });

        if (response.ok) {
          const quotesData = await response.json();
          // Create a map for quick lookup
          interface Quote {
            symbol: string;
            price?: number;
            change?: number;
            changePercent?: number;
          }
          const quotesMap = new Map(quotesData.map((q: Quote) => [q.symbol, q]));
          
          const updatedWatchlist = watchlist.map(stock => {
            const updatedData = quotesMap.get(stock.symbol) as Quote | undefined;
            return updatedData ? {
              ...stock,
              price: updatedData.price ?? stock.price,
              change: updatedData.change ?? stock.change,
              changePercent: updatedData.changePercent ?? stock.changePercent,
            } : stock;
          });
          
          setWatchlist(updatedWatchlist);
          // Also update selected stock if it's in the watchlist
          if (selectedStock) {
            const updatedSelected = updatedWatchlist.find(s => s.symbol === selectedStock.symbol);
            if (updatedSelected) {
              setSelectedStock(prev => prev ? { ...prev, ...updatedSelected } : null);
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing watchlist:', error);
      }
    };

    const interval = setInterval(fetchWatchlistData, 15000);
    return () => clearInterval(interval);
  }, [watchlist, selectedStock]);

  // Update stock details when cached details change
  useEffect(() => {
    if (cachedDetails) {
      setStockDetails(cachedDetails);
      setShowOverview(false); // Reset overview visibility when stock changes
    }
  }, [cachedDetails]);

  // ⚡ IMMEDIATELY fetch stock details when selected stock changes to get full description
  useEffect(() => {
    if (!selectedStock?.symbol) return;

    const symbol = selectedStock.symbol;
    console.log('⚡ Fetching full stock details for description:', symbol);
    
    fetch(api.market.details(symbol))
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.description) {
          console.log('✅ Stock details with description loaded:', symbol);
          setStockDetails(data);
          setShowOverview(false);
        }
      })
      .catch(error => console.error('Error fetching stock details:', error));
  }, [selectedStock?.symbol]);

  // Add/Remove from watchlist
  const toggleWatchlist = async () => {
    if (!selectedStock) return;

    const token = localStorage.getItem('token');
    
    // Show auth modal if not logged in
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    const exists = watchlist.some(s => s.symbol === selectedStock.symbol);
    
    try {
      // Get userId from backend /user/me endpoint (not localStorage!)
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userResponse.ok) {
        alert('❌ Session expired. Please login again.');
        return;
      }

      const userData = await userResponse.json();
      const userId = userData.id;
      
      console.log('✅ Got userId from backend:', userId);

      if (exists) {
        // Remove from watchlist
        console.log('🗑️ Removing from watchlist:', selectedStock.symbol);
        await removeFromWatchlist(userId, selectedStock.symbol);
        const updated = watchlist.filter(s => s.symbol !== selectedStock.symbol);
        setWatchlist(updated);
        console.log('✅ Removed from watchlist');
      } else {
        // Add to watchlist
        console.log('➕ Adding to watchlist:', selectedStock.symbol);
        await addToWatchlist(userId, selectedStock.symbol, selectedStock.name);
        const updated = [...watchlist, selectedStock];
        setWatchlist(updated);
        console.log('✅ Added to watchlist');
      }
    } catch (error) {
      console.error('❌ Error toggling watchlist:', error);
      alert('❌ Failed to update watchlist. Please try again.');
    }
  };

  // Navigate to prediction page with selected stock
  const handleGetPrediction = () => {
    if (!selectedStock) return;
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    
    router.push(`/prediction?symbol=${selectedStock.symbol}`);
  };

  return (
    <div className="w-full">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Watchlist</h1>
        <p className="text-slate-400 mt-2">Manage your favorite stocks</p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-8">
        {/* Top Section: Stock Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Stock Details and Chart */}
          <div className="lg:col-span-3 space-y-6">
            {selectedStock ? (
              <>
                {/* Stock Header Card */}


                {/* Chart - Company Selected with Custom Chart */}
                <div className="bg-gray-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-6">
                  <StockChart
                    symbol={selectedStock.symbol}
                    height={400}
                    headerAction={
                      <div className="flex gap-3">
                        <button
                          onClick={handleGetPrediction}
                          className="px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          🔮 Get Prediction
                        </button>
                        <button
                          onClick={toggleWatchlist}
                          className={`px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm ${
                            selectedStock && watchlist.some(s => s.symbol === selectedStock.symbol)
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {selectedStock && watchlist.some(s => s.symbol === selectedStock.symbol) ? '✕ Remove' : '✓ Add'}
                        </button>
                      </div>
                    }
                  />
                </div>

                {/* Stock Details Grid */}
                {stockDetails && (
                  <>
                    <div className="bg-gray-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                      <h3 className="text-lg font-semibold mb-6">Stock Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="border-b border-slate-950 pb-3">
                            <p className="text-slate-400 text-sm">Previous Close</p>
                            <p className="text-lg font-semibold">${stockDetails.previousClose?.toFixed(2) || 'N/A'}</p>
                          </div>
                          <div className="border-b border-slate-950 pb-3">
                            <p className="text-slate-400 text-sm">Open</p>
                            <p className="text-lg font-semibold">${stockDetails.open?.toFixed(2) || 'N/A'}</p>
                          </div>
                          <div className="border-b border-slate-950 pb-3">
                            <p className="text-slate-400 text-sm">Bid</p>
                            <p className="text-lg font-semibold">${stockDetails.bid?.toFixed(2) || 'N/A'} x {stockDetails.bidSize || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">Ask</p>
                            <p className="text-lg font-semibold">${stockDetails.ask?.toFixed(2) || 'N/A'} x {stockDetails.askSize || 0}</p>
                          </div>
                        </div>

                        {/* Second Column */}
                        <div className="space-y-4">
                          <div className="border-b border-slate-950 pb-3">
                            <p className="text-slate-400 text-sm">Day's Range</p>
                            <p className="text-lg font-semibold">${stockDetails.dayLow?.toFixed(2) || 'N/A'} - ${stockDetails.dayHigh?.toFixed(2) || 'N/A'}</p>
                          </div>
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">52 Week Range</p>
                            <p className="text-lg font-semibold">${stockDetails.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} - ${stockDetails.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}</p>
                          </div>
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">Volume</p>
                            <p className="text-lg font-semibold">{(stockDetails.volume / 1000000).toFixed(2)}M</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">Avg. Volume</p>
                            <p className="text-lg font-semibold">{(stockDetails.averageVolume / 1000000).toFixed(2)}M</p>
                          </div>
                        </div>

                        {/* Third Column */}
                        <div className="space-y-4">
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">Market Cap (intraday)</p>
                            <p className="text-lg font-semibold">{stockDetails.marketCap >= 1000000000 ? (stockDetails.marketCap / 1000000000).toFixed(2) + 'B' : (stockDetails.marketCap / 1000000).toFixed(2) + 'M'}</p>
                          </div>
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">Beta (5Y Monthly)</p>
                            <p className="text-lg font-semibold">{stockDetails.beta?.toFixed(2) || 'N/A'}</p>
                          </div>
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">PE Ratio (TTM)</p>
                            <p className="text-lg font-semibold">{stockDetails.pe?.toFixed(2) || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">EPS (TTM)</p>
                            <p className="text-lg font-semibold">${stockDetails.eps?.toFixed(2) || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Fourth Column */}
                        <div className="space-y-4">
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">Earnings Date</p>
                            <p className="text-lg font-semibold">{stockDetails.earnings || 'N/A'}</p>
                          </div>
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">Forward Dividend & Yield</p>
                            <p className="text-lg font-semibold">${stockDetails.forwardDividend?.toFixed(2) || 'N/A'} ({(stockDetails.dividendYield * 100)?.toFixed(2) || 'N/A'}%)</p>
                          </div>
                          <div className="border-b border-slate-700 pb-3">
                            <p className="text-slate-400 text-sm">Ex-Dividend Date</p>
                            <p className="text-lg font-semibold">{stockDetails.exDividendDate || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">1y Target Est</p>
                            <p className="text-lg font-semibold">${stockDetails.oneYearTarget?.toFixed(2) || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Overview */}
                    <div className="bg-gray-900 border border-slate-800 rounded-xl p-6 shadow-xl mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{stockDetails.symbol} Overview</h3>
                      </div>
                      
                      {/* Collapsible Description */}
                      {showOverview && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
                            {stockDetails.description || 'No description available for this company.'}
                          </p>
                        </div>
                      )}
                      
                      {/* Always visible company info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                        <div className="space-y-4">
                          {stockDetails.website && (
                            <div>
                              <a 
                                href={stockDetails.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-1"
                              >
                                {stockDetails.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          )}
                          <button 
                            onClick={() => setShowOverview(!showOverview)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition border border-slate-700 w-fit"
                          >
                            {showOverview ? 'Hide description' : `More about ${stockDetails.symbol}`}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <p className="text-slate-400 mb-1 text-xs">Sector</p>
                            <p className="font-semibold text-white">{stockDetails.sector || 'N/A'}</p>
                          </div>
                          {stockDetails.fullTimeEmployees && (
                            <div>
                              <p className="text-slate-400 mb-1 text-xs">Full Time Employees</p>
                              <p className="font-semibold text-white">{stockDetails.fullTimeEmployees.toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-slate-400 mb-1 text-xs">Industry</p>
                            <p className="font-semibold text-white">{stockDetails.industry || 'N/A'}</p>
                          </div>
                          {stockDetails.fiscalYearEnd && (
                            <div>
                              <p className="text-slate-400 mb-1 text-xs">Fiscal Year Ends</p>
                              <p className="font-semibold text-white">{stockDetails.fiscalYearEnd}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="bg-gray-900 border border-slate-800 rounded-xl p-12 flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Watchlist */}
            <div className="bg-gray-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">My Watchlist</h3>
              {watchlist.length > 0 ? (
                <div className="space-y-2 max-h-122 overflow-y-auto">
                  {getUpdatedWatchlist().map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => setSelectedStock(stock)}
                      className={`w-full text-left p-3 rounded-lg transition border ${
                        selectedStock?.symbol === stock.symbol
                          ? 'bg-blue-900/50 border-blue-600'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Image
                          src={`https://financialmodelingprep.com/image-stock/${stock.symbol}.png`}
                          alt={stock.symbol}
                          width={24}
                          height={24}
                          className="rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{stock.symbol}</p>
                          <p className="text-xs text-slate-400 truncate">{stock.name}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>${stock.price.toFixed(2)}</span>
                        <span className={stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-6">No stocks yet</p>
              )}
            </div>

            {/* Browse All Stocks with Search */}
            <div className="bg-gray-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-4">Search & Add Stocks</h3>
                <input
                  type="text"
                  placeholder="Search by symbol or name, or enter any ticker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter') {
                      const query = searchQuery.toUpperCase().trim();
                      // Accept any valid ticker format (1-5 alphanumeric chars)
                      if (/^[A-Z0-9]{1,5}$/.test(query)) {
                        try {
                          // Try to fetch from API
                          const response = await fetch(api.market.quotes(), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ symbols: [query] }),
                          });

                          if (response.ok) {
                            const data = await response.json();
                            if (data && data.length > 0) {
                              const newStock = data[0];
                              setStocks((prev) => {
                                const exists = prev.some(s => s.symbol === query);
                                return exists ? prev : [...prev, newStock];
                              });
                              setSelectedStock(newStock);
                              setSearchQuery('');
                            }
                          }
                        } catch (error) {
                          console.error('Error adding stock:', error);
                        }
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600"
                />
                <p className="text-xs text-slate-400 mt-2">
                  {searchQuery ? `Found ${searchResults.length} result(s)` : 'Type to search or enter any ticker'}
                </p>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedStock(stock);
                        // Add to stocks list if not already there
                        setStocks((prev) => {
                          const exists = prev.some(s => s.symbol === stock.symbol);
                          return exists ? prev : [...prev, stock];
                        });
                        setSearchQuery('');
                      }}
                      className={`w-full text-left p-2 rounded-lg transition border text-sm ${
                        selectedStock?.symbol === stock.symbol
                          ? 'bg-blue-900/50 border-blue-600'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Image
                            src={`https://financialmodelingprep.com/image-stock/${stock.symbol}.png`}
                            alt={stock.symbol}
                            width={20}
                            height={20}
                            className="rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs">{stock.symbol}</p>
                            <p className="text-xs text-slate-400 truncate">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-xs">${stock.price.toFixed(2)}</p>
                          <p className={`text-xs ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.changePercent >= 0 ? '▲' : '▼'} {stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="text-slate-400 text-sm text-center py-6">No stocks found</p>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-6">Search for a stock...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 h-[600px] min-w-0">
            <MarketOverview className="h-full" />
          </div>
          <div className="lg:col-span-2 h-[600px] min-w-0">
            <MarketNews className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Watchlist() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading watchlist...</div>}>
      <WatchlistContent />
    </Suspense>
  );
}
