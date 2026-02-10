/**
 * Centralized Market Data Cache
 * Single source of truth for all stock data across the application
 * Ensures consistent prices across heatmap, overview, watchlist, and search
 */

import { marketService, StockData } from './market.service';
import { cacheService } from './cache.service';

class MarketDataCache {
  private allStocksCache: Map<string, StockData> = new Map();
  private lastUpdateTime: number = 0;
  private updateInProgress: boolean = false;
  private TOP_STOCKS_BY_SECTOR = 20;

  /**
   * Get or fetch fresh stock data
   * Returns consistent data across all endpoints
   */
  async getStockData(symbol: string): Promise<StockData | null> {
    // Try cache first
    if (this.allStocksCache.has(symbol)) {
      return this.allStocksCache.get(symbol) || null;
    }

    // Try to fetch fresh data via Yahoo Finance
    try {
      const data = await marketService.getStockData(symbol);
      if (data) {
        this.allStocksCache.set(symbol, data);
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
    }

    return null;
  }

  /**
   * Get multiple stocks with consistent data
   */
  async getStocksBySymbols(symbols: string[]): Promise<StockData[]> {
    return Promise.all(
      symbols.map(symbol => this.getStockData(symbol))
    ).then(results => results.filter((stock): stock is StockData => stock !== null));
  }

  /**
   * Get market overview (popular stocks)
   */
  async getMarketOverview(): Promise<StockData[]> {
    const cacheKey = 'market_overview_unified';
    const cached = cacheService.get<StockData[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];
    const data = await this.getStocksBySymbols(popularSymbols);
    
    cacheService.set(cacheKey, data, 5 * 60 * 1000); // Cache 5 minutes
    return data;
  }

  /**
   * Get heatmap data: Top 20 stocks per sector
   */
  async getHeatmapData(): Promise<StockData[]> {
    const cacheKey = 'heatmap_unified';
    const cached = cacheService.get<StockData[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Popular stocks across sectors
    const sectorStocks = {
      'Technology': ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'AVGO', 'ORCL', 'CRM', 'ADBE', 'AMD', 'CSCO', 'ACN', 'IBM', 'INTU', 'TXN', 'QCOM', 'AMAT', 'MU', 'INTC', 'ADI'],
      'Financials': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'AXP', 'COF', 'USB', 'PNC', 'TFC', 'BK', 'CM', 'BMO', 'TD', 'SCHW', 'ICE', 'CME', 'CBOE', 'PFG'],
      'Healthcare': ['JNJ', 'UNH', 'PFE', 'MRK', 'AZN', 'BMY', 'AMGN', 'ABT', 'GILD', 'BIIB', 'REGN', 'ILMN', 'VRTX', 'EXAS', 'ALGN', 'DXCM', 'VEEV', 'FLWS', 'MTCH', 'HALO'],
      'Consumer Discretionary': ['HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG', 'ABNB', 'CMG', 'MAR', 'HLT', 'ORLY', 'AZO', 'YUM', 'ROST', 'DHI', 'LEN', 'PHM', 'NVR', 'POOL'],
      'Consumer Staples': ['WMT', 'PG', 'COST', 'KO', 'PEP', 'PM', 'MO', 'MDLZ', 'CL', 'KMB', 'GIS', 'KHC', 'HSY', 'K', 'CAG', 'SJM', 'CPB', 'HRL', 'MKC', 'CHD'],
      'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'WMB', 'KMI', 'HES', 'HAL', 'BKR', 'FANG', 'DVN', 'MRO', 'APA', 'CTRA', 'OVV'],
      'Industrials': ['BA', 'CAT', 'MMM', 'RTX', 'GE', 'HON', 'ITW', 'LMT', 'NOC', 'PCAR', 'PWM', 'RSG', 'ROK', 'SNA', 'SWKS', 'DOV', 'EMR', 'ETN', 'GWW', 'IR'],
      'Utilities': ['NEE', 'SO', 'DUK', 'CEG', 'SRE', 'AEP', 'VST', 'D', 'PCG', 'PEG', 'EXC', 'XEL', 'ED', 'WEC', 'ES', 'AWK', 'DTE', 'PPL', 'AEE', 'CMS'],
      'Real Estate': ['AMT', 'PLD', 'EQIX', 'PSA', 'O', 'SPG', 'WELL', 'DLR', 'VTR', 'SBAC', 'WY', 'INVH', 'MAA', 'ESS', 'UDR', 'AVB', 'EQR', 'REG', 'BXP', 'FRT'],
      'Communication Services': ['META', 'GOOGL', 'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA', 'TTWO', 'LYV', 'NWSA', 'NWS', 'FOXA', 'FOX', 'OMC', 'IPG', 'MTCH', 'PARA'],
    };

    const allStocks: StockData[] = [];
    
    for (const [sector, symbols] of Object.entries(sectorStocks)) {
      const stocks = await this.getStocksBySymbols(symbols);
      allStocks.push(...stocks);
    }

    cacheService.set(cacheKey, allStocks, 10 * 60 * 1000); // Cache 10 minutes
    console.log(`✅ Heatmap unified: ${allStocks.length} stocks loaded`);
    return allStocks;
  }

  /**
   * Clear cache to force refresh
   */
  clearCache() {
    this.allStocksCache.clear();
    this.lastUpdateTime = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cachedStocks: this.allStocksCache.size,
      lastUpdate: new Date(this.lastUpdateTime).toISOString(),
    };
  }
}

export const marketDataCache = new MarketDataCache();
