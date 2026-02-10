'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, Cell } from 'recharts';

interface StockChartProps {
  symbol: string;
  height?: number;
  headerAction?: React.ReactNode;
}

interface ChartData {
  timestamps: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

interface StockInfo {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume?: number;
}

interface FormattedDataPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: FormattedDataPoint }> }) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload as FormattedDataPoint;
    const isPositive = data.close >= data.open;
    
    // Format date with time
    const date = new Date(data.timestamp * 1000);
    const formattedDate = date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return (
      <div className="bg-gray-900/95 border border-gray-600 rounded-lg p-3 shadow-2xl backdrop-blur-sm">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-8 pb-1.5 border-b border-gray-700">
            <span className="text-gray-300 font-medium">Date:</span>
            <span className="font-mono text-white font-semibold">{formattedDate}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-300 font-medium">Close:</span>
            <span className={`font-mono font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              ${data.close.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-300 font-medium">Open:</span>
            <span className="font-mono text-white">${data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-300 font-medium">High:</span>
            <span className="font-mono text-green-400">${data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-300 font-medium">Low:</span>
            <span className="font-mono text-red-400">${data.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-gray-300 font-medium">Volume:</span>
            <span className="font-mono text-white">
              {data.volume ? (data.volume / 1000000).toFixed(2) + 'M' : 'n/a'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function StockChart({ symbol, height = 400, headerAction }: StockChartProps) {
  const [chartData, setChartData] = useState<FormattedDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1d');

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Fetch historical data
        const histResponse = await fetch(api.market.historical(symbol, period), { cache: 'no-store' });
        if (histResponse.ok) {
          const data: ChartData = await histResponse.json();
          
          // Format data for Recharts - use ALL data points from API
          const formatted: FormattedDataPoint[] = data.timestamps
            .map((timestamp, i) => {
              const dateObj = new Date(timestamp * 1000);
              let dateStr: string;
              
              // Format based on period
              if (period === '1d') {
                // 1-minute data: Show hour and minute
                dateStr = dateObj.toLocaleString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              } else if (period === '5d') {
                // 5-minute data: Show date and hour
                dateStr = dateObj.toLocaleString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  hour12: true
                });
              } else {
                // Daily/Weekly data: Show date only
                dateStr = dateObj.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  ...(period === '1y' || period === '2y' || period === '5y' ? { year: '2-digit' } : {})
                });
              }
              
              return {
                date: dateStr,
                timestamp,
                open: data.open[i],
                high: data.high[i],
                low: data.low[i],
                close: data.close[i],
                volume: data.volume[i]
              };
            })
            .filter(d => d.close !== null && !isNaN(d.close));
          
          setChartData(formatted);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchChartData, 15000);
    return () => clearInterval(interval);
  }, [symbol, period]);

  const periods = [
    { label: '1D', value: '1d' },
    { label: '5D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
  ];

  if (loading && chartData.length === 0) {
    return (
      <div className="w-full bg-gray-900 rounded-lg p-6 flex items-center justify-center" style={{ height: `${height + 150}px` }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const currentData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  
  const change = currentData && previousData ? currentData.close - previousData.close : 0;
  const changePercent = previousData ? ((change / previousData.close) * 100) : 0;
  const isPositive = change >= 0;

  const lineColor = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = `gradient-${symbol}`;

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6">
      {/* Header with Logo and Company Info */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={`https://financialmodelingprep.com/image-stock/${symbol}.png`}
              alt={symbol}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-cyan-400 font-bold text-lg">${symbol.substring(0, 2)}</span>`;
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{symbol}</h3>
            <p className="text-sm text-gray-400">Stock Chart</p>
          </div>
          {headerAction && (
            <div>
              {headerAction}
            </div>
          )}
        </div>

        {/* Price and Change */}
        {currentData && (
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-white">
              ${currentData.close.toFixed(2)}
            </span>
            <span className={`text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        )}


      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-4">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              period === p.value
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10 rounded">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.05)" 
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              stroke="#888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              orientation="right"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              dx={10}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "5 5" }} 
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 6, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-400 mb-2">Volume</div>
        <ResponsiveContainer width="100%" height={80}>
          <ComposedChart data={chartData}>
            <YAxis
              stroke="#888"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              orientation="right"
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              dx={10}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs">
                      <span className="font-mono text-white">{(data.volume / 1000000).toFixed(2)}M</span>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            />
            <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="#22d3ee"
                  opacity={0.4}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
