'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHeatmapCache } from '@/hooks/useCache';
import { useUserTracking } from '@/hooks/useUserTracking';
import { api } from '@/lib/api';
import AuthModal from '@/components/AuthModal';
import { ClientOnly } from '@/app/components/ClientOnly';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts';

// SVG Icon Components for restricted icons
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{transformOrigin: 'center'}}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <circle className="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="15.7 47.1" strokeLinecap="round"></circle>
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const Target = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PredictionData {
  current_price: number;
  predictions: number[];
  future_dates: string[];
  accuracy?: number;
  training_completed: boolean;
  days_predicted: number;
}

interface PredictionHistory {
  date: string;
  price?: number;
  prediction?: number;
}

function Prediction() {
  const searchParams = useSearchParams();
  const symbolFromQuery = searchParams.get('symbol');
  
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [daysAhead, setDaysAhead] = useState<number>(10);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const { data: cachedStocks } = useHeatmapCache();
  const { trackPrediction } = useUserTracking();

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
                // Add it to stocks list
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

  // Fetch prediction when stock is selected
  const fetchPrediction = useCallback(async () => {
    if (!selectedStock) {
      setError('Please select a stock');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError('');
    setTrainingProgress(0);
    setPrediction(null);
    setShowResults(false);

    try {
      setTrainingProgress(10);

      const stock = selectedStock;
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev < 70) return prev + Math.random() * 15;
          return prev;
        });
      }, 300);

      // Call the admin prediction API
      let predictionResponse;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

        predictionResponse = await fetch(
          '/admin/models/api/predict',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company: stock.symbol.toLowerCase(),
              days_ahead: daysAhead,
            }),
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearInterval(progressInterval);
        console.error('Fetch error:', fetchError);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout. The prediction is taking too long.');
        }
        throw new Error('Cannot connect to prediction server. Make sure the backend is running on http://localhost:8000');
      }

      clearInterval(progressInterval);

      if (!predictionResponse.ok) {
        let errorMessage = `Failed to get predictions for ${stock.symbol}`;
        
        // Check for specific error codes
        if (predictionResponse.status === 404) {
          throw new Error(`The prediction model for ${stock.symbol} is not available. Please try again later.`);
        } else if (predictionResponse.status === 503) {
          throw new Error('The prediction service is temporarily unavailable. Please try again later.');
        }
        
        try {
          const errorData = await predictionResponse.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        throw new Error(errorMessage);
      }

      setTrainingProgress(85);

      const predictionData = await predictionResponse.json();
      
      // Fetch historical data - same way as StockChart component
      let formattedHistorical: Array<{ date: string; price: number }> = [];
      try {
        const historyResponse = await fetch(
          api.market.historical(stock.symbol, '3mo'),
          { cache: 'no-store' }
        );
        if (historyResponse.ok) {
          const data: { timestamps?: number[]; close?: number[] } = await historyResponse.json();
          
          if (data.timestamps && data.close) {
            formattedHistorical = data.timestamps
              .map((timestamp: number, i: number) => ({
                date: new Date(timestamp * 1000).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: '2-digit'
                }),
                price: (data.close as number[])[i],
              }))
              .filter((d: { date: string; price: number }) => d.price !== null && !isNaN(d.price));
          }
        }
      } catch (e) {
        console.log('Could not fetch historical data:', e);
      }
      
      // Generate future dates for predictions with continuous line
      const today = new Date();
      const lastHistoricalPrice = formattedHistorical.length > 0 
        ? formattedHistorical[formattedHistorical.length - 1].price 
        : stock.price;
      
      const predictionPoints = predictionData.predictions.map((price: number, i: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i + 1);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
          price: undefined,
          prediction: price,
        };
      });
      
      // Create a connecting point - last historical price as the first prediction point
      const connectingPoint = {
        date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        price: lastHistoricalPrice,
        prediction: lastHistoricalPrice,
      };
      
      // Combine historical + connecting point + predictions into a single array
      const combinedData = [
        ...formattedHistorical.map(d => ({ ...d, prediction: undefined })),
        connectingPoint,
        ...predictionPoints,
      ];
      
      setPredictionHistory(combinedData);
      setPrediction({
        current_price: stock.price,
        predictions: predictionData.predictions,
        future_dates: predictionPoints.map((p: { date: string }) => p.date),
        training_completed: true,
        days_predicted: daysAhead,
      });
      
      // Track the prediction in database
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('⚠️ No token for prediction tracking');
          return;
        }

        // Get userId from /user/me endpoint (not localStorage!)
        const userMeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/user/me`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!userMeResponse.ok) {
          console.warn('⚠️ Failed to get user info for prediction tracking');
          return;
        }

        const userData = await userMeResponse.json();
        const userId = userData.id;
        const predictedPrice = predictionData.predictions[predictionData.predictions.length - 1];
        
        console.log('✅ Got userId from /user/me:', userId);
        console.log('📊 Tracking prediction:', { symbol: stock.symbol, name: stock.name, predictedPrice });
        
        await trackPrediction(
          userId,
          stock.symbol,
          stock.name,
          predictedPrice
        );
        console.log('✅ Prediction tracked successfully');
      } catch (error) {
        console.error('❌ Error tracking prediction:', error);
      }
      
      setTrainingProgress(100);
      setShowResults(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prediction');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStock, daysAhead, trackPrediction]);

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
    setPrediction(null);
    setShowResults(false);
    setError('');
  };

  const predictedTrend = prediction && prediction.predictions.length > 0
    ? prediction.predictions[prediction.predictions.length - 1] > (prediction.current_price || 0)
      ? 'up'
      : 'down'
    : null;

  const maxPredicted = prediction ? Math.max(...prediction.predictions, prediction.current_price) : 0;
  const minPredicted = prediction ? Math.min(...prediction.predictions, prediction.current_price) : 0;
  const averagePredicted = prediction && prediction.predictions.length > 0
    ? prediction.predictions.reduce((a, b) => a + b, 0) / prediction.predictions.length
    : 0;

  return (
    <div className="w-full">
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-cyan-400" />
          <h1 className="text-4xl font-bold">Stock Price Prediction</h1>
        </div>
        
        {/* Selected Stock Display */}
        {selectedStock && (
          <div className="mt-4 p-4 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-600/50 rounded-lg">
            <p className="text-sm text-slate-400">Currently Analyzing:</p>
            <p className="text-2xl font-bold text-cyan-400">{selectedStock.symbol}</p>
            <p className="text-slate-300">{selectedStock.name}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Stock Selection */}
        <div className="w-full lg:w-64 lg:sticky lg:top-24">
          <div className="dashboard-card p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Zap className="w-5 h-5 text-cyan-400" />
              Select Stock
            </h2>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search stocks..."
              title="Search for stocks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
            />

            {/* Stock List */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => {
                      handleSelectStock(stock);
                      // Add to stocks list if not already there
                      setStocks((prev) => {
                        const exists = prev.some(s => s.symbol === stock.symbol);
                        return exists ? prev : [...prev, stock];
                      });
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedStock?.symbol === stock.symbol
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'bg-gray-700/30 border-gray-600/30 text-gray-300 hover:border-cyan-400/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-sm text-gray-400">{stock.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${stock.price.toFixed(2)}</p>
                        <p className={`text-sm ${stock.changePercent >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : searchQuery ? (
                <p className="text-gray-400 text-sm text-center py-4">No stocks found</p>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">Search for a stock...</p>
              )}
            </div>

            {/* Days Ahead Selector */}
            <div className="space-y-2 pt-4 border-t border-gray-700/50">
              <label className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Days to Predict
              </label>
              <input
                type="range"
                min="1"
                max="30"
                title="Select number of days to predict"
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1 day</span>
                <span className="text-cyan-400 font-semibold">{daysAhead}</span>
                <span>30 days</span>
              </div>
            </div>

            {/* Predict Button */}
            <button
              onClick={fetchPrediction}
              disabled={loading || !selectedStock}
              className={`w-full mt-4 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                loading || !selectedStock
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-cyan-500/50'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Get Prediction
                </>
              )}
            </button>

            {/* Training Progress */}
            {loading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-700/30 rounded-full h-2 border border-gray-600/50 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-full transition-all"
                    style={{ width: `${trainingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 text-center">Getting prediction... {Math.round(trainingProgress)}%</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {showResults && prediction ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Current Price */}
                <div className="dashboard-card p-4">
                  <p className="text-sm text-gray-400 mb-2">Current Price</p>
                  <p className="text-2xl font-bold text-white">${prediction.current_price.toFixed(2)}</p>
                </div>

                {/* Average Predicted */}
                <div className="dashboard-card p-4">
                  <p className="text-sm text-gray-400 mb-2">Average Predicted</p>
                  <p className="text-2xl font-bold text-cyan-400">${averagePredicted.toFixed(2)}</p>
                </div>

                {/* Highest Predicted */}
                <div className="dashboard-card p-4">
                  <p className="text-sm text-gray-400 mb-2">Highest Predicted</p>
                  <p className="text-2xl font-bold text-cyan-400">${maxPredicted.toFixed(2)}</p>
                </div>

                {/* Lowest Predicted */}
                <div className="dashboard-card p-4">
                  <p className="text-sm text-gray-400 mb-2">Lowest Predicted</p>
                  <p className="text-2xl font-bold text-cyan-400">${minPredicted.toFixed(2)}</p>
                </div>
              </div>

              {/* Prediction Trend Card */}
              <div className="dashboard-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Price Trend Analysis</h3>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    predictedTrend === 'up'
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {predictedTrend === 'up' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      {predictedTrend === 'up' ? 'Uptrend' : 'Downtrend'}
                    </span>
                  </div>
                </div>

                {/* Chart */}
                {predictionHistory.length > 0 && (
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={predictionHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={predictedTrend === 'up' ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={predictedTrend === 'up' ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        orientation="right"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                        dx={10}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name) => {
                          if (typeof value === 'number') {
                            return `$${value.toFixed(2)}`;
                          }
                          return null;
                        }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      {/* Line that connects historical and predictions */}
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke={predictedTrend === 'up' ? '#22c55e' : '#ef4444'} 
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={true}
                        connectNulls={true}
                      />
                      {/* Prediction line in orange */}
                      <Line 
                        type="monotone" 
                        dataKey="prediction" 
                        stroke="#ff8c00" 
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={true}
                        connectNulls={true}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Prediction Details */}
              <div className="dashboard-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Detailed Predictions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {prediction.predictions.map((price, index) => {
                    const isUp = price >= prediction.current_price;
                    const changePercent = Math.abs((price - prediction.current_price) / prediction.current_price * 100);
                    
                    return (
                      <div
                        key={index}
                        className="dashboard-card p-3 text-center hover:bg-gray-700/40 transition"
                      >
                        <p className="text-xs text-gray-400 mb-2">
                          Day {index + 1}
                        </p>
                        <p className="text-lg font-bold text-white mb-2">
                          ${price.toFixed(2)}
                        </p>
                        <div className={`text-xs font-semibold flex items-center justify-center gap-1 ${
                          isUp
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}>
                          {isUp ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 14l5-5 5 5z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 10l5 5 5-5z" />
                            </svg>
                          )}
                          <span>{changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div className="dashboard-card p-12 text-center flex flex-col items-center justify-center">
              <Target className="w-16 h-16 text-cyan-400 opacity-50 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Predict</h3>
              <p className="text-gray-400 max-w-md">
                Select a stock and click "Get Prediction" to view future price forecasts.
              </p>
            </div>
          ) : (
            <div className="dashboard-card p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Getting Prediction</h3>
              <p className="text-gray-400 mb-2">
                Processing data and generating price forecast...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PredictionPage() {
  return (
    <ClientOnly>
      <Prediction />
    </ClientOnly>
  );
}
