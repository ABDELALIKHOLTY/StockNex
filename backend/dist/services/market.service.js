"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketService = exports.MarketService = void 0;
const axios_1 = __importDefault(require("axios"));
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const sp500_symbols_1 = require("./sp500-symbols");
const cache_service_1 = require("./cache.service");
const yahooFinance = new yahoo_finance2_1.default({ suppressNotices: ['yahooSurvey'] });
// Sector mapping
const SECTOR_MAP = {
    'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'AMZN': 'Consumer Discretionary',
    'NVDA': 'Technology', 'META': 'Communication Services', 'TSLA': 'Consumer Discretionary',
    'BRK.B': 'Financials', 'V': 'Financials', 'JNJ': 'Healthcare', 'WMT': 'Consumer Staples',
    'PG': 'Consumer Staples', 'JPM': 'Financials', 'UNH': 'Healthcare', 'MA': 'Financials',
    'HD': 'Consumer Discretionary', 'LLY': 'Healthcare', 'MRK': 'Healthcare', 'KO': 'Consumer Staples',
    'PEP': 'Consumer Staples', 'COST': 'Consumer Discretionary', 'BAC': 'Financials', 'XOM': 'Energy',
    'GE': 'Industrials', 'CAT': 'Industrials', 'CVX': 'Energy', 'MCD': 'Consumer Discretionary',
    'NKE': 'Consumer Discretionary', 'PFE': 'Healthcare', 'CRM': 'Technology', 'ADBE': 'Technology',
    'AXP': 'Financials', 'IBM': 'Technology', 'ORCL': 'Technology', 'RTX': 'Industrials',
    'TXN': 'Technology', 'AMD': 'Technology', 'INTC': 'Technology', 'CSCO': 'Technology',
    'HON': 'Industrials', 'SLB': 'Energy', 'MPC': 'Energy', 'LOW': 'Consumer Discretionary',
    'HAL': 'Energy', 'PSX': 'Energy', 'EOG': 'Energy', 'SBUX': 'Consumer Discretionary',
    'NFLX': 'Communication Services', 'DIS': 'Communication Services', 'WFC': 'Financials',
    'MS': 'Financials', 'GS': 'Financials', 'TFC': 'Financials', 'BMY': 'Healthcare',
    'ABT': 'Healthcare', 'AMGN': 'Healthcare', 'VRTX': 'Healthcare', 'ABBV': 'Healthcare',
    'DHR': 'Healthcare', 'TMO': 'Healthcare', 'GILD': 'Healthcare', 'BIIB': 'Healthcare',
    'REGN': 'Healthcare', 'ZTS': 'Healthcare', 'MCK': 'Healthcare', 'CAH': 'Healthcare',
    'CI': 'Healthcare', 'MMC': 'Financials', 'AON': 'Financials', 'BLK': 'Financials',
    'SPGI': 'Financials', 'CB': 'Financials', 'PRU': 'Financials', 'MET': 'Financials',
    'LMT': 'Industrials', 'NOC': 'Industrials', 'BA': 'Industrials', 'GD': 'Industrials',
    'DE': 'Industrials', 'UNP': 'Industrials', 'NSC': 'Industrials', 'CSX': 'Industrials',
    'UPS': 'Industrials', 'FDX': 'Industrials', 'WM': 'Industrials', 'NEE': 'Utilities',
    'SO': 'Utilities', 'DUK': 'Utilities', 'AEP': 'Utilities', 'SRE': 'Utilities',
    'VZ': 'Communication Services', 'T': 'Communication Services', 'CMCSA': 'Communication Services',
    'TMUS': 'Communication Services', 'CHTR': 'Communication Services', 'LIN': 'Materials',
    'APD': 'Materials', 'FCX': 'Materials', 'NEM': 'Materials', 'ECL': 'Materials',
    'AMT': 'Real Estate', 'PLD': 'Real Estate', 'EQIX': 'Real Estate', 'PSA': 'Real Estate',
    'O': 'Real Estate', 'SPG': 'Real Estate'
};
// Simple seeded random number generator for consistent mock data
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}
// Generate deterministic but realistic mock data for a stock
function generateMockStockData(symbol) {
    const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);
    const rand = seededRandom(seed);
    const rand2 = seededRandom(seed + 1);
    const rand3 = seededRandom(seed + 2);
    const basePrice = 50 + (rand * 300); // Price between 50-350
    const changePercent = (rand2 - 0.5) * 8; // -4% to +4%
    const change = (basePrice * changePercent) / 100;
    const volume = Math.floor(1000000 + rand3 * 50000000); // 1M to 51M
    const marketCap = basePrice * volume * (1 + rand);
    return {
        symbol,
        name: `${symbol} Inc.`,
        price: parseFloat(basePrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume,
        marketCap,
        pe: 15 + rand * 40,
        sector: SECTOR_MAP[symbol] || 'Other',
        open: parseFloat((basePrice + (rand - 0.5) * 5).toFixed(2)),
        high: parseFloat((basePrice + Math.abs(rand * 10)).toFixed(2)),
        low: parseFloat((basePrice - Math.abs(rand * 10)).toFixed(2)),
        previousClose: parseFloat((basePrice - change).toFixed(2))
    };
}
// Utiliser Yahoo Finance API via un proxy ou yahoo-finance2
// Pour l'instant, utilisons une API REST gratuite
class MarketService {
    // Récupérer les données d'un symbole via Yahoo Finance API (gratuit)
    async getStockData(symbol) {
        try {
            // Check cache first
            const cacheKey = `stock:${symbol}`;
            const cached = cache_service_1.cacheService.get(cacheKey);
            if (cached) {
                console.log(`Cache hit for ${symbol}`);
                return cached;
            }
            // Utiliser Yahoo Finance API (gratuit, pas besoin de clé API)
            const response = await axios_1.default.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const result = response.data.chart.result[0];
            if (!result || !result.meta) {
                return null;
            }
            const meta = result.meta;
            const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
            const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
            // Utiliser les valeurs directement de l'API si disponibles, sinon calculer
            let change = meta.regularMarketChange || (currentPrice - previousClose);
            let changePercent = meta.regularMarketChangePercent;
            // Si changePercent n'est pas disponible, le calculer
            if (changePercent === undefined || changePercent === null) {
                changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
            }
            else {
                // Convertir de décimal à pourcentage si nécessaire (ex: 0.05 -> 5%)
                if (Math.abs(changePercent) < 1) {
                    changePercent = changePercent * 100;
                }
            }
            // Debug pour vérifier les valeurs
            if (symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'TSLA') {
                console.log(`${symbol}: price=${currentPrice}, prevClose=${previousClose}, change=${change}, changePercent=${changePercent.toFixed(2)}%`);
            }
            // Calculer marketCap si non disponible (price * shares outstanding approximatif)
            let marketCap = meta.marketCap;
            if (!marketCap && currentPrice > 0 && meta.regularMarketVolume) {
                // Estimation basée sur le volume et le prix (approximation)
                marketCap = currentPrice * meta.regularMarketVolume * 10; // Estimation grossière
            }
            // Récupérer les valeurs OHLV détaillées
            const quotes = result.indicators?.quote?.[0] || {};
            const open = quotes.open?.[0] || meta.open || currentPrice;
            const high = quotes.high?.[0] || meta.regularMarketPrice || currentPrice;
            const low = quotes.low?.[0] || meta.regularMarketPrice || currentPrice;
            const stockData = {
                symbol: symbol,
                name: meta.longName || meta.shortName || symbol,
                price: currentPrice,
                change: change,
                changePercent: changePercent,
                volume: meta.regularMarketVolume || 0,
                marketCap: marketCap,
                pe: meta.trailingPE,
                sector: meta.sector || 'Other',
                open: open,
                high: high,
                low: low,
                previousClose: previousClose,
            };
            // Cache the result
            cache_service_1.cacheService.set(cacheKey, stockData);
            return stockData;
        }
        catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            return null;
        }
    }
    // Récupérer les données de plusieurs symboles via yahoo-finance2 (plus robuste) avec retry et rate limiting
    async getMultipleStocks(symbols, retryCount = 0) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY = [1000, 3000, 5000]; // Backoff exponentiel in ms
        try {
            const results = await yahooFinance.quote(symbols);
            return results.map((data) => {
                return {
                    symbol: data.symbol,
                    name: data.longName || data.shortName || data.symbol,
                    price: data.regularMarketPrice || 0,
                    change: data.regularMarketChange || 0,
                    changePercent: data.regularMarketChangePercent || 0,
                    volume: data.regularMarketVolume || 0,
                    marketCap: data.marketCap || 0,
                    pe: data.trailingPE,
                    sector: 'Other', // Le frontend gère le secteur
                    open: data.regularMarketOpen,
                    high: data.regularMarketDayHigh,
                    low: data.regularMarketDayLow,
                    previousClose: data.regularMarketPreviousClose
                };
            });
        }
        catch (error) {
            // Retry on rate limit (429) or server errors
            if ((error.message?.includes('429') || error.statusCode === 429) && retryCount < MAX_RETRIES) {
                const delay = RETRY_DELAY[retryCount];
                console.log(`⏳ Rate limited. Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.getMultipleStocks(symbols, retryCount + 1);
            }
            console.error('Error fetching multiple stocks with yahoo-finance2:', error.message);
            return [];
        }
    }
    // Récupérer les données du marché overview (top 20 populaires)
    async getMarketOverview() {
        // Check cache first
        const cacheKey = 'overview';
        const cached = cache_service_1.cacheService.get(cacheKey);
        if (cached) {
            console.log('✅ Cache hit for market overview');
            return cached;
        }
        // Top 20 popular stocks
        const topSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
            'V', 'JNJ', 'WMT', 'JPM', 'PG', 'COST', 'UNH', 'HD', 'MCD', 'NKE', 'KO', 'PEP'];
        const overview = topSymbols.map(symbol => {
            const data = generateMockStockData(symbol);
            return {
                symbol: data.symbol,
                name: data.name,
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
                volume: data.volume,
            };
        });
        // Cache for 10 minutes
        cache_service_1.cacheService.set(cacheKey, overview, 10 * 60 * 1000);
        console.log(`✅ Market overview loaded: ${overview.length} stocks`);
        return overview;
    }
    // Récupérer les données pour le heatmap (ALL S&P 500 stocks)
    async getHeatmapData() {
        // Check cache first
        const cacheKey = 'heatmap';
        const cached = cache_service_1.cacheService.get(cacheKey);
        if (cached) {
            console.log(`✅ Cache hit for heatmap data (${cached.length} stocks)`);
            return cached;
        }
        // Generate mock data for ALL 500 S&P 500 symbols
        console.log(`📊 Generating heatmap data for ${sp500_symbols_1.SP500_SYMBOLS_UNIQUE.length} stocks...`);
        const allResults = sp500_symbols_1.SP500_SYMBOLS_UNIQUE.map(symbol => generateMockStockData(symbol));
        // Cache for 1 hour
        cache_service_1.cacheService.set(cacheKey, allResults, 60 * 60 * 1000);
        console.log(`✅ Heatmap data generated: ${allResults.length} stocks`);
        return allResults;
    }
    // Récupérer les données pour market quotes (search, watchlist)
    async getMarketQuotes(symbols) {
        // Generate mock data for requested symbols
        return symbols.map(symbol => generateMockStockData(symbol));
    }
    // Récupérer les données historiques pour un graphique
    async getHistoricalData(symbol, period = '1mo') {
        try {
            // Check cache first
            const cacheKey = `historical:${symbol}:${period}`;
            const cached = cache_service_1.cacheService.get(cacheKey);
            if (cached) {
                console.log(`Cache hit for historical data ${symbol}`);
                return cached;
            }
            const intervals = {
                '1d': '1m',
                '5d': '5m',
                '1mo': '1d',
                '3mo': '1d',
                '6mo': '1d',
                '1y': '1d',
                '2y': '1wk',
                '5y': '1wk',
            };
            const interval = intervals[period] || '1d';
            const response = await axios_1.default.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${period}`, { timeout: 10000 });
            const result = response.data.chart.result[0];
            if (!result) {
                return null;
            }
            const timestamps = result.timestamp;
            const quotes = result.indicators.quote[0];
            const historicalData = {
                symbol: symbol,
                timestamps: timestamps,
                open: quotes.open,
                high: quotes.high,
                low: quotes.low,
                close: quotes.close,
                volume: quotes.volume,
            };
            // Cache the result
            cache_service_1.cacheService.set(cacheKey, historicalData);
            return historicalData;
        }
        catch (error) {
            console.error(`Error fetching historical data for ${symbol}:`, error);
            return null;
        }
    }
}
exports.MarketService = MarketService;
exports.marketService = new MarketService();
