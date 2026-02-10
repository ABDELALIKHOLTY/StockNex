"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("./middlewares/auth");
const market_service_1 = require("./services/market.service");
const cache_service_1 = require("./services/cache.service");
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const generateJwt = (user) => {
    return (0, jsonwebtoken_1.sign)({ email: user.email }, "JWT_SECRET");
};
app.use(express_1.default.json());
// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
app.post("/users", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword
            },
        });
        const { password: _password, ...userWithoutPassword } = user;
        res.status(201).json({ ...userWithoutPassword, token: generateJwt(user) });
    }
    catch (err) {
        console.error("Sign-up error:", err);
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Email or username already exists" });
        }
        res.status(500).json({ error: "An error occurred during sign-up" });
    }
});
app.post("/users/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ error: "Email or password are wrong" });
        }
        const isPasswordCorrect = await (0, bcrypt_1.compare)(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Email or password are wrong" });
        }
        const { password: _password, ...userWithoutPassword } = user;
        res.json({ ...userWithoutPassword, token: generateJwt(user) });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "An error occurred during login" });
    }
});
app.get("/user", auth_1.authenticate, async (req, res, next) => {
    try {
        if (!req.user) {
            return res.sendStatus(401);
        }
        const { password: _password, ...userWithoutPassword } = req.user;
        res.json(userWithoutPassword);
    }
    catch (err) {
        next(err);
    }
});
// Market Data Routes
// Get market overview data
app.get("/api/market/overview", async (req, res) => {
    try {
        const data = await market_service_1.marketService.getMarketOverview();
        // Toujours retourner un tableau, même s'il est vide
        res.json(data || []);
    }
    catch (error) {
        console.error("Error fetching market overview:", error);
        // Retourner un tableau vide plutôt qu'une erreur
        res.json([]);
    }
});
// Get heatmap data (S&P 500)
app.get("/api/market/heatmap", async (req, res) => {
    try {
        const data = await market_service_1.marketService.getHeatmapData();
        // Toujours retourner un tableau, même s'il est vide
        res.json(data || []);
    }
    catch (error) {
        console.error("Error fetching heatmap data:", error);
        // Retourner un tableau vide plutôt qu'une erreur
        res.json([]);
    }
});
// Get market quotes for specific symbols
app.post("/api/market/quotes", async (req, res) => {
    try {
        const { symbols } = req.body;
        if (!Array.isArray(symbols)) {
            return res.status(400).json({ error: "Symbols must be an array" });
        }
        const data = await market_service_1.marketService.getMarketQuotes(symbols);
        // Toujours retourner un tableau, même s'il est vide
        res.json(data || []);
    }
    catch (error) {
        console.error("Error fetching market quotes:", error);
        // Retourner un tableau vide plutôt qu'une erreur
        res.json([]);
    }
});
// Get detailed stock information with caching
app.get("/api/market/details/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;
        const upperSymbol = symbol.toUpperCase();
        // Check cache first
        const cacheKey = `details:${upperSymbol}`;
        const cached = cache_service_1.cacheService.get(cacheKey);
        if (cached) {
            console.log(`Cache hit for details ${upperSymbol}`);
            return res.json(cached);
        }
        // Fetch from Yahoo Finance quoteSummary API
        const response = await axios_1.default.get(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${upperSymbol}`, {
            params: {
                modules: 'price,financialData,defaultKeyStatistics'
            },
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const result = response.data?.quoteSummary?.result?.[0];
        if (!result) {
            return res.status(404).json({ error: "Stock not found" });
        }
        const priceData = result.price || {};
        const finData = result.financialData || {};
        const statsData = result.defaultKeyStatistics || {};
        const details = {
            symbol: upperSymbol,
            previousClose: priceData.regularMarketPreviousClose?.raw || 0,
            open: priceData.openPrice?.raw || 0,
            bid: priceData.bid?.raw || 0,
            bidSize: priceData.bidSize?.raw || 0,
            ask: priceData.ask?.raw || 0,
            askSize: priceData.askSize?.raw || 0,
            dayHigh: priceData.regularMarketDayHigh?.raw || 0,
            dayLow: priceData.regularMarketDayLow?.raw || 0,
            fiftyTwoWeekHigh: priceData.fiftyTwoWeekHigh?.raw || 0,
            fiftyTwoWeekLow: priceData.fiftyTwoWeekLow?.raw || 0,
            volume: priceData.regularMarketVolume?.raw || 0,
            averageVolume: finData.averageVolume?.raw || 0,
            marketCap: finData.marketCap?.raw || 0,
            beta: finData.beta?.raw || 0,
            pe: finData.trailingPE?.raw || 0,
            eps: finData.trailingEps?.raw || 0,
            earnings: statsData.earningsDate?.raw ? new Date(statsData.earningsDate.raw * 1000).toLocaleDateString() : null,
            exDividendDate: statsData.exDividendDate?.raw ? new Date(statsData.exDividendDate.raw * 1000).toLocaleDateString() : null,
            forwardDividend: statsData.forwardAnnualDividendRate?.raw || 0,
            dividendYield: statsData.forwardAnnualDividendYield?.raw || 0,
            oneYearTarget: finData.targetMeanPrice?.raw || 0
        };
        // Cache the result
        cache_service_1.cacheService.set(cacheKey, details);
        res.json(details);
    }
    catch (error) {
        console.error(`Error fetching details for ${req.params.symbol}:`, error);
        res.status(500).json({ error: "Failed to fetch stock details" });
    }
});
// Get historical data for a symbol
app.get("/api/market/historical/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;
        const { period = '1mo' } = req.query;
        const data = await market_service_1.marketService.getHistoricalData(symbol.toUpperCase(), period);
        if (!data) {
            return res.status(404).json({ error: "Historical data not found" });
        }
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching historical data:", error);
        res.status(500).json({ error: "Failed to fetch historical data" });
    }
});
// Get cache stats
app.get("/api/cache/stats", async (req, res) => {
    try {
        const stats = cache_service_1.cacheService.getStats();
        res.json({
            ...stats,
            message: "Cache statistics"
        });
    }
    catch (error) {
        console.error("Error getting cache stats:", error);
        res.status(500).json({ error: "Failed to get cache stats" });
    }
});
// Get company logo URL - fetches from Yahoo Finance quoteSummary API
app.get("/api/market/logo/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;
        const upperSymbol = symbol.toUpperCase();
        // Fetch from Yahoo Finance quoteSummary API which has logo_url
        const response = await axios_1.default.get(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${upperSymbol}`, {
            params: {
                modules: 'assetProfile'
            },
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const assetProfile = response.data?.quoteSummary?.result?.[0]?.assetProfile;
        if (assetProfile?.logo) {
            // Return the logo URL directly
            return res.json({
                logo: assetProfile.logo,
                symbol: upperSymbol
            });
        }
        // If no logo from Yahoo, try fallback sources
        const domain = assetProfile?.website?.replace(/https?:\/\//, '').split('/')[0]
            || `${upperSymbol.toLowerCase()}.com`;
        // Fallback to Clearbit
        const fallbackLogo = `https://logo.clearbit.com/${domain}`;
        return res.json({
            logo: fallbackLogo,
            symbol: upperSymbol
        });
    }
    catch (error) {
        console.error(`Error fetching logo for ${req.params.symbol}:`, error);
        // Return generic fallback
        res.json({
            symbol: req.params.symbol.toUpperCase(),
            logo: `https://logo.clearbit.com/${req.params.symbol.toLowerCase()}.com`
        });
    }
});
async function main() {
    app.listen(4000, () => {
        console.info(`Server running at http://localhost:4000`);
    });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
