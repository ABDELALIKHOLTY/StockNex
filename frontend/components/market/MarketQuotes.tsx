'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SP500_BY_SECTOR } from '@shared/data/sp500-symbols';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketQuotesProps {
  className?: string;
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

const MarketQuotes = ({ className }: MarketQuotesProps) => {
  const router = useRouter();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('Financial');

  const groups = [
    {
      name: 'Financial',
      symbols: SP500_BY_SECTOR.Financial.slice(0, 9),
    },
    {
      name: 'Technology',
      symbols: SP500_BY_SECTOR.Technology.slice(0, 9),
    },
    {
      name: 'Healthcare',
      symbols: SP500_BY_SECTOR.Healthcare.slice(0, 9),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const activeGroupData = groups.find(g => g.name === activeGroup);
        if (!activeGroupData) return;

        const response = await fetch(api.market.quotes(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: activeGroupData.symbols }),
        });

        if (response.ok) {
          const data = await response.json();
          setStocks(data);
        } else {
          console.error('Failed to fetch market quotes:', response.status, response.statusText);
          setStocks([]);
        }
      } catch (error) {
        console.error('Error fetching market quotes:', error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [activeGroup]);

  return (
    <div className={`w-full h-full bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 flex flex-col ${className}`}>
      <h3 className="font-semibold text-2xl text-gray-100 mb-5">Stocks</h3>

      {/* Group Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {groups.map((group) => (
          <button
            key={group.name}
            onClick={() => setActiveGroup(group.name)}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeGroup === group.name
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Stock Table */}
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      ) : stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
          <p className="text-lg mb-2">No data available</p>
          <p className="text-sm">Please ensure the backend server is running on port 4000</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Price</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Change</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Change %</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Volume</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const isPositive = stock.change >= 0;
                const companyName = STOCK_NAMES[stock.symbol] || stock.name;
                const logoUrl = `https://financialmodelingprep.com/image-stock/${getCompanyDomain(stock.symbol)}.png`;
                
                return (
                  <tr
                    key={stock.symbol}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/watchlist?symbol=${stock.symbol}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img
                            src={logoUrl}
                            alt={stock.symbol}
                            className="w-8 h-8 object-contain p-0.5"
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
                        <span className="text-gray-100">{companyName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-medium">{stock.symbol}</td>
                    <td className="py-3 px-4 text-right text-gray-100 font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(stock.price)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? (
                          <span className="font-bold">▲</span>
                        ) : (
                          <span className="font-bold">▼</span>
                        )}
                        {stock.change >= 0 ? '+' : ''}
                        {stock.change.toFixed(2)}
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {stock.volume.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarketQuotes;

