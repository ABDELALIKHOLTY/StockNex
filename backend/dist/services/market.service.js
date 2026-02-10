"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketService = exports.MarketService = void 0;
const axios_1 = __importDefault(require("axios"));
const sp500_symbols_1 = require("./sp500-symbols");
const cache_service_1 = require("./cache.service");
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
    // Récupérer les données de plusieurs symboles
    async getMultipleStocks(symbols) {
        // Utiliser Promise.allSettled pour ne pas échouer complètement si une requête échoue
        const promises = symbols.map(symbol => this.getStockData(symbol));
        const results = await Promise.allSettled(promises);
        return results
            .filter((result) => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value)
            .filter((value) => value !== null);
    }
    // Récupérer les données du marché overview (symboles populaires)
    async getMarketOverview() {
        // Check cache first
        const cacheKey = 'overview';
        const cached = cache_service_1.cacheService.get(cacheKey);
        if (cached) {
            console.log('Cache hit for market overview');
            return cached;
        }
        const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];
        const data = await this.getMultipleStocks(popularSymbols);
        const overview = data.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            volume: stock.volume,
        }));
        // Cache the result
        cache_service_1.cacheService.set(cacheKey, overview);
        return overview;
    }
    // Récupérer les données pour le heatmap (S&P 500 - 500 sociétés)
    async getHeatmapData() {
        // Check cache first
        const cacheKey = 'heatmap';
        const cached = cache_service_1.cacheService.get(cacheKey);
        if (cached) {
            console.log('Cache hit for heatmap data');
            return cached;
        }
        // Utiliser tous les 500 symboles du S&P 500
        // Traiter par lots pour éviter les timeouts
        const symbols = sp500_symbols_1.SP500_SYMBOLS_UNIQUE;
        const batchSize = 50; // Traiter 50 symboles à la fois
        const batches = [];
        for (let i = 0; i < symbols.length; i += batchSize) {
            batches.push(symbols.slice(i, i + batchSize));
        }
        // Traiter les lots séquentiellement pour éviter de surcharger l'API
        const allResults = [];
        for (const batch of batches) {
            const batchResults = await this.getMultipleStocks(batch);
            allResults.push(...batchResults);
            // Petit délai entre les lots pour éviter les rate limits
            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        // Cache the result
        cache_service_1.cacheService.set(cacheKey, allResults);
        return allResults;
    }
    // Récupérer les données pour market quotes
    async getMarketQuotes(symbols) {
        return this.getMultipleStocks(symbols);
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
