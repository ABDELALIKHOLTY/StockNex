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

// Stock company names mapping
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
  'ACN': 'Accenture plc',
  'IBM': 'International Business Machines',
  'JPM': 'JPMorgan Chase & Co.',
  'V': 'Visa Inc.',
  'MA': 'Mastercard Incorporated',
  'BAC': 'Bank of America Corp',
  'WFC': 'Wells Fargo & Company',
  'JNJ': 'Johnson & Johnson',
  'UNH': 'UnitedHealth Group',
  'LLY': 'Eli Lilly and Company',
  'PG': 'Procter & Gamble Co.',
  'KO': 'The Coca-Cola Company',
  'WMT': 'Walmart Inc.',
  'PEP': 'PepsiCo Inc.',
  'COST': 'Costco Wholesale Corp.',
  'HD': 'The Home Depot Inc.',
  'MCD': 'McDonald\'s Corporation',
  'NKE': 'Nike Inc.',
  'SBUX': 'Starbucks Corporation',
  'DIS': 'The Walt Disney Company',
  'NFLX': 'Netflix Inc.',
  'VZ': 'Verizon Communications',
  'T': 'AT&T Inc.',
  'XOM': 'Exxon Mobil Corporation',
  'CVX': 'Chevron Corporation',
  'COP': 'ConocoPhillips',
  'MMC': 'Marsh & McLennan Cos.',
  'BRK.B': 'Berkshire Hathaway Inc. (Class B)',
  'INTC': 'Intel Corporation',
  'QCOM': 'Qualcomm Inc.',
  'MU': 'Micron Technology Inc.',
  'TXN': 'Texas Instruments Inc.',
  'INTU': 'Intuit Inc.',
  'TMUS': 'T-Mobile US Inc.',
  'CHTR': 'Charter Communications',
  'EA': 'Electronic Arts Inc.',
  'TTWO': 'Take-Two Interactive',
  'EL': 'The Estée Lauder Cos.',
  'LOW': 'Lowe\'s Companies Inc.',
  'TJX': 'The TJX Companies Inc.',
  'BKKING': 'Booking Holdings Inc.',
  'ABNB': 'Airbnb Inc.',
  'CMG': 'Chipotle Mexican Grill',
  'MAR': 'Marriott International',
  'PM': 'Philip Morris International',
  'MO': 'Altria Group Inc.',
  'MDLZ': 'Mondelēz International',
  'ABT': 'Abbott Laboratories',
  'TMO': 'Thermo Fisher Scientific',
  'DHR': 'Danaher Corporation',
  'MRK': 'Merck & Co. Inc.',
  'PFE': 'Pfizer Inc.',
  'AMGN': 'Amgen Inc.',
  'GIS': 'General Mills Inc.',
  'K': 'Kellogg Company',
  'HSY': 'The Hershey Company',
  'CAG': 'Conagra Brands Inc.',
  'CL': 'Colgate-Palmolive Co.',
  'KMB': 'Kimberly-Clark Corp.',
  'HUM': 'Humana Inc.',
  'CI': 'Cigna Corporation',
  'GILD': 'Gilead Sciences Inc.',
  'VRTX': 'Vertex Pharmaceuticals Inc.',
  'REGN': 'Regeneron Pharmaceuticals',
  'ZTS': 'Zoetis Inc.',
  'BSX': 'Boston Scientific Corp.',
  'SYK': 'Stryker Corporation',
  'MDT': 'Medtronic plc',
  'BDX': 'Becton, Dickinson and Co.',
  'A': 'Avantor Inc.',
  'ABBV': 'AbbVie Inc.',
  'BMY': 'Bristol Myers Squibb',
  'ISRG': 'Intuitive Surgical Inc.',
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
    'HD': 'HD',
    'DIS': 'DIS',
    'XOM': 'XOM',
    'BAC': 'BAC',
    'WFC': 'WFC',
    'MA': 'MA',
  };
  return domains[symbol] || symbol.toUpperCase();
};
``
interface MarketOverviewProps{
  className?:string;
}

const MarketOverview = ({className}: MarketOverviewProps) => {
  const router = useRouter();
 

  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Technology');


  

  useEffect(() => {
    const tabs = [
      { id: 'Technology', symbols: SP500_BY_SECTOR.Technology.slice(0, 6) },
      { id: 'Financial', symbols: SP500_BY_SECTOR.Financial.slice(0, 6) },
      { id: 'Healthcare', symbols: SP500_BY_SECTOR.Healthcare.slice(0, 6) },
      { id: 'Communication Services', symbols: SP500_BY_SECTOR.Communication_Services.slice(0, 6) },
    ];
  

    const fetchData = async () => {
      try {
        setLoading(true);
        const activeTabData = tabs.find(tab => tab.id === activeTab);
        if (!activeTabData) return;

        const response = await fetch(api.market.quotes(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: activeTabData.symbols }),
        });

        if (response.ok) {
          const data = await response.json();
          setStocks(data);
        } else {
          console.error('Failed to fetch market overview:', response.status, response.statusText);
          setStocks([]);
        }
      } catch (error) {
        console.error('Error fetching market overview:', error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }
  ,
   [activeTab]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className={`w-full h-full bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 flex flex-col ${className}`}>
      <h3 className="font-semibold text-2xl text-gray-100 mb-5">Market Overview</h3>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {[
          { id: 'Technology', symbols: SP500_BY_SECTOR.Technology.slice(0, 6) },
          { id: 'Financial', symbols: SP500_BY_SECTOR.Financial.slice(0, 6) },
          { id: 'Healthcare', symbols: SP500_BY_SECTOR.Healthcare.slice(0, 6) },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.id}
          </button>
        ))}
      </div>

      {/* Stock List */}
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
        <div className="space-y-4 flex-1 overflow-y-auto">
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            const companyName = STOCK_NAMES[stock.symbol] || stock.name;
            // Using the same logo source as MarketNews - financialmodelingprep.com
            const logoUrl = `https://financialmodelingprep.com/image-stock/${getCompanyDomain(stock.symbol)}.png`;
            
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/watchlist?symbol=${stock.symbol}`)}
              >
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 relative bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={logoUrl}
                      alt={stock.symbol}
                      className="w-10 h-10 object-contain p-1"
                      onError={(e) => {
                        // Fallback: show initials if logo fails
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
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-lg text-gray-100 truncate">{companyName}</div>
                    <div className="text-xs text-gray-500">{stock.symbol}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-semibold text-gray-100">{formatPrice(stock.price)}</div>
                    <div className="text-xs text-gray-500">Vol: {stock.volume.toLocaleString()}</div>
                  </div>
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? (
                      <span className="font-bold">▲</span>
                    ) : (
                      <span className="font-bold">▼</span>
                    )}
                    <div className="text-right min-w-20">
                      <div className="font-semibold">{formatChange(stock.change)}</div>
                      <div className="text-sm">{formatChangePercent(stock.changePercent)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketOverview;

