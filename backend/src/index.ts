import express from "express";
import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { authenticate, ExpressRequest } from "./middlewares/auth";
import { marketService } from './services/market.service';
import { cacheService } from './services/cache.service';
import { marketDataCache } from './services/market-data-cache';
import usersRouter from './routes/users';
import axios from 'axios';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const app = express();
const prisma = new PrismaClient();
const generateJwt = (user: User): string => {
  return sign({ id: user.id, email: user.email }, "JWT_SECRET");
};

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Admin creation endpoint (secured with secret key)
app.post("/admin/create", async (req, res) => {
  try {
    const { email, username, password, adminSecret } = req.body;
    
    // Simple security check - use environment variable
    const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123";
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ error: "Invalid admin secret" });
    }
    
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        username, 
        password: hashedPassword,
        isAdmin: true  // Create as admin
      },
    });
    const { password: _password, ...userWithoutPassword } = user;
    res.status(201).json({ 
      message: "Admin user created successfully",
      user: userWithoutPassword, 
      token: generateJwt(user) 
    });
  } catch (err: any) {
    console.error("Admin creation error:", err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: "Email or username already exists" });
    }
    res.status(500).json({ error: "An error occurred during admin creation" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        username, 
        password: hashedPassword 
      },
    });
    const { password: _password, ...userWithoutPassword } = user;
    res.status(201).json({ ...userWithoutPassword, token: generateJwt(user) });
  } catch (err: any) {
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
    
    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Email or password are wrong" });
    }
    
    // Update login tracking
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        loginCount: { increment: 1 }
      }
    });

    console.log('📝 Login successful for user:', updatedUser.id, updatedUser.email);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "login",
        details: JSON.stringify({ email })
      }
    });
    
    const { password: _password, ...userWithoutPassword } = updatedUser;
    const token = generateJwt(updatedUser);
    const response = { 
      id: updatedUser.id,
      userId: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin,
      loginCount: updatedUser.loginCount,
      token: token
    };
    console.log('📤 SENDING LOGIN RESPONSE:');
    console.log('   - id:', response.id, 'Type:', typeof response.id);
    console.log('   - userId:', response.userId, 'Type:', typeof response.userId);
    console.log('   - email:', response.email);
    console.log('   - Full response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.get("/user", authenticate, async (req: ExpressRequest, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { password: _password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
});

// Get current user ID (simple endpoint)
app.get("/user/me", authenticate, async (req: ExpressRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ 
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      isAdmin: req.user.isAdmin
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

// Market Data Routes
// Get market overview data (unified cached data)
app.get("/api/market/overview", async (req, res) => {
  try {
    const data = await marketDataCache.getMarketOverview();
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching market overview:", error);
    res.json([]);
  }
});

// Get heatmap data (unified cached data - top 20 per sector)
app.get("/api/market/heatmap", async (req, res) => {
  try {
    const data = await marketDataCache.getHeatmapData();
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    res.json([]);
  }
});

// Get market quotes for specific symbols (unified cached data)
app.post("/api/market/quotes", async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!Array.isArray(symbols)) {
      return res.status(400).json({ error: "Symbols must be an array" });
    }
    const data = await marketDataCache.getStocksBySymbols(symbols);
    // Toujours retourner un tableau, même s'il est vide
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching market quotes:", error);
    // Retourner un tableau vide plutôt qu'une erreur
    res.json([]);
  }
});


// Get detailed stock information with caching
// Sector mapping for better sector data
const SECTOR_MAPPING: { [key: string]: string } = {
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

// Industry descriptions for better fallback descriptions
const INDUSTRY_DESCRIPTIONS: { [key: string]: string } = {
  'Technology': 'a leading technology company specializing in innovative software, hardware, and digital solutions.',
  'Healthcare': 'a prominent healthcare and pharmaceutical company dedicated to advancing global health through innovative medicines and solutions.',
  'Financials': 'a major financial services company providing comprehensive banking, investment management, and financial solutions.',
  'Consumer Discretionary': 'a consumer-focused company offering a wide range of products and services to customers across multiple markets.',
  'Consumer Staples': 'a consumer goods company providing essential products and trusted brands purchased regularly by consumers worldwide.',
  'Industrials': 'an industrial manufacturing company producing equipment, machinery, and solutions for various industrial applications.',
  'Energy': 'an energy company engaged in exploration, production, and distribution of oil, gas, and renewable energy resources.',
  'Utilities': 'a utility company providing essential services including electricity, gas, and water to residential and commercial customers.',
  'Materials': 'a materials and chemicals company producing raw materials and minerals for various industrial applications.',
  'Real Estate': 'a real estate investment company managing a diverse portfolio of commercial and residential properties.',
  'Communication Services': 'a media and communications company providing entertainment, digital content, and telecommunications services.'
};

// Generate description based on sector and company name
function generateDescription(companyName: string, sector: string): string {
  const sectorDesc = INDUSTRY_DESCRIPTIONS[sector] || 'a major publicly traded company in its industry.';
  return `${companyName} is ${sectorDesc}`;
}

app.get("/api/market/details/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();

    // Check cache first
    const cacheKey = `details:${upperSymbol}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for details ${upperSymbol}`);
      return res.json(cached);
    }

    // Helper function to format date
    const formatDate = (date: any) => {
      if (!date) return null;
      try {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return null;
      }
    };

    let details: any = null;

    // Use yahoo-finance2 library with proper error handling
    try {
      console.log(`📊 Fetching detailed data for ${upperSymbol} from Yahoo Finance 2...`);
      const queryOptions = { 
        modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'calendarEvents', 'financialData', 'assetProfile', 'industryTrend'] as any 
      };
      const result: any = await yahooFinance.quoteSummary(upperSymbol, queryOptions);

      if (!result) {
        throw new Error('No data returned from Yahoo Finance');
      }

      const price = result.price || {};
      const summaryDetail = result.summaryDetail || {};
      const keyStats = result.defaultKeyStatistics || {};
      const calendarEvents = result.calendarEvents || {};
      const financialData = result.financialData || {};
      const assetProfile = result.assetProfile || {};

      // Log retrieved data for debugging
      if (assetProfile.sector) {
        console.log(`✅ Got sector from assetProfile: ${assetProfile.sector}`);
      }
      if (assetProfile.longBusinessSummary) {
        console.log(`✅ Got description from assetProfile (length: ${assetProfile.longBusinessSummary.length})`);
      }

      // Build details object with real data
      details = {
        symbol: upperSymbol,
        previousClose: summaryDetail.previousClose || price.regularMarketPreviousClose || 0,
        open: summaryDetail.open || price.regularMarketOpen || 0,
        bid: summaryDetail.bid || 0,
        bidSize: summaryDetail.bidSize || 0,
        ask: summaryDetail.ask || 0,
        askSize: summaryDetail.askSize || 0,
        dayHigh: summaryDetail.dayHigh || price.regularMarketDayHigh || 0,
        dayLow: summaryDetail.dayLow || price.regularMarketDayLow || 0,
        fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow || 0,
        volume: price.regularMarketVolume || summaryDetail.volume || 0,
        averageVolume: summaryDetail.averageVolume || keyStats.averageVolume || 0,
        marketCap: price.marketCap || summaryDetail.marketCap || 0,
        beta: keyStats.beta || summaryDetail.beta || 0,
        pe: summaryDetail.trailingPE || keyStats.trailingPE || 0,
        eps: keyStats.trailingEps || 0,
        earnings: formatDate(calendarEvents.earnings?.earningsDate?.[0]),
        exDividendDate: formatDate(summaryDetail.exDividendDate || calendarEvents.exDividendDate),
        forwardDividend: summaryDetail.dividendRate || 0,
        dividendYield: summaryDetail.dividendYield || summaryDetail.trailingAnnualDividendYield || 0,
        oneYearTarget: financialData.targetMeanPrice || summaryDetail.targetMeanPrice || 0,
        // Company Overview
        description: assetProfile.longBusinessSummary || generateDescription(price.longName || price.shortName || upperSymbol, assetProfile.sector || SECTOR_MAPPING[upperSymbol] || 'Technology'),
        industry: assetProfile.industry || "Industrial",
        sector: assetProfile.sector || SECTOR_MAPPING[upperSymbol] || "Technology",
        website: assetProfile.website || null,
        fullTimeEmployees: assetProfile.fullTimeEmployees || null,
        fiscalYearEnd: keyStats.lastFiscalYearEnd ? formatDate(keyStats.lastFiscalYearEnd) : null,
        country: assetProfile.country || null,
        city: assetProfile.city || null,
        state: assetProfile.state || null
      };

      console.log(`✅ Successfully retrieved detailed data for ${upperSymbol}`);
      
      // Cache the result
      cacheService.set(cacheKey, details);
      res.json(details);
      return;

    } catch (yf2Error: any) {
      // If yahoo-finance2 fails, fallback to chart endpoint + additional data
      console.log(`⚠️ yahoo-finance2 failed for ${upperSymbol}, using fallback: ${yf2Error.message}`);
      
      try {
        const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${upperSymbol}?interval=1d&range=5d`;
        const chartResponse = await axios.get(chartUrl, {
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const chartResult = chartResponse.data?.chart?.result?.[0];
        if (!chartResult) {
          return res.status(404).json({ error: "Stock not found" });
        }

        const meta = chartResult.meta || {};
        const indicators = chartResult.indicators?.quote?.[0] || {};
        const timestamps = chartResult.timestamp || [];
        const latestIndex = timestamps.length - 1;
        const currentPrice = meta.regularMarketPrice || 0;
        const previousClose = meta.previousClose || meta.chartPreviousClose || 0;

        // Estimate market cap with better accuracy
        let estimatedMarketCap = 0;
        if (currentPrice > 200) {
          estimatedMarketCap = currentPrice * 4000000000;
        } else if (currentPrice > 50) {
          estimatedMarketCap = currentPrice * 1000000000;
        } else {
          estimatedMarketCap = currentPrice * 100000000;
        }

        const sectorFromMap = SECTOR_MAPPING[upperSymbol] || "Technology";
        const companyName = meta.longName || meta.symbol || upperSymbol;

        details = {
          symbol: upperSymbol,
          previousClose: previousClose,
          open: indicators.open?.[latestIndex] || meta.regularMarketOpen || currentPrice,
          bid: currentPrice * 0.999,
          bidSize: 100,
          ask: currentPrice * 1.001,
          askSize: 100,
          dayHigh: indicators.high?.[latestIndex] || meta.regularMarketDayHigh || currentPrice,
          dayLow: indicators.low?.[latestIndex] || meta.regularMarketDayLow || currentPrice,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || currentPrice * 1.2,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow || currentPrice * 0.7,
          volume: indicators.volume?.[latestIndex] || meta.regularMarketVolume || 0,
          averageVolume: meta.regularMarketVolume ? meta.regularMarketVolume * 0.9 : 0,
          marketCap: estimatedMarketCap,
          beta: 1.15,
          pe: currentPrice > 0 ? 25.5 : 0,
          eps: currentPrice > 0 ? currentPrice / 25.5 : 0,
          earnings: null,
          exDividendDate: null,
          forwardDividend: currentPrice * 0.005,
          dividendYield: 0.005,
          oneYearTarget: currentPrice * 1.15,
          description: generateDescription(companyName, sectorFromMap),
          sector: sectorFromMap,
          industry: sectorFromMap,
          fullTimeEmployees: null,
          website: null,
          fiscalYearEnd: "December"
        };

        console.log(`✅ Fallback successful for ${upperSymbol} - using sector: ${sectorFromMap}`);
        
        cacheService.set(cacheKey, details);
        res.json(details);

      } catch (fallbackError: any) {
        console.error(`❌ Both yahoo-finance2 and fallback failed for ${upperSymbol}`);
        res.status(500).json({ error: "Failed to fetch stock details" });
      }
    }
  } catch (error: any) {
    console.error(`❌ Error fetching details for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: "Failed to fetch stock details" });
  }
});

// Get historical data for a symbol
app.get("/api/market/historical/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1mo' } = req.query;
    const data = await marketService.getHistoricalData(symbol.toUpperCase(), period as string);
    if (!data) {
      return res.status(404).json({ error: "Historical data not found" });
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

// Get cache stats
app.get("/api/cache/stats", async (req, res) => {
  try {
    const stats = cacheService.getStats();
    res.json({
      ...stats,
      message: "Cache statistics"
    });
  } catch (error) {
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
    const response = await axios.get(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${upperSymbol}`,
      {
        params: {
          modules: 'assetProfile'
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );

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
    
  } catch (error) {
    console.error(`Error fetching logo for ${req.params.symbol}:`, error);
    
    // Return generic fallback
    res.json({
      symbol: req.params.symbol.toUpperCase(),
      logo: `https://logo.clearbit.com/${req.params.symbol.toLowerCase()}.com`
    });
  }
});

// ============ USER TRACKING ENDPOINTS ============

// Track user login
app.post("/users/:userId/login", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        loginCount: { increment: 1 }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "login",
        details: JSON.stringify({ ipAddress: req.ip })
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error tracking login:", error);
    res.status(500).json({ error: "Failed to track login" });
  }
});

// Get user stats (for admin)
app.get("/admin/users/:userId/stats", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requestUser = (req as ExpressRequest).user;

    if (!requestUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if requester is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: requestUser.id }
    });

    if (!adminUser?.isAdmin) {
      return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        watchlistItems: true,
        predictions: true,
        activityLogs: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    // Return in the format expected by frontend
    res.json({
      userId: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      isAdmin: user.isAdmin,
      watchlist: user.watchlistItems,
      predictions: user.predictions,
      watchlistCount: user.watchlistItems.length,
      predictionsCount: user.predictions.length,
      logsCount: user.activityLogs.length
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// Get all users (for admin)
app.get("/admin/users", authenticate, async (req, res) => {
  try {
    const requestUser = (req as ExpressRequest).user;

    if (!requestUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if requester is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: requestUser.id }
    });

    if (!adminUser?.isAdmin) {
      return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        createdAt: true,
        lastLogin: true,
        loginCount: true,
        _count: {
          select: {
            watchlistItems: true,
            predictions: true,
            activityLogs: true
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get specific user details (for admin)
app.get("/admin/users/:userId", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requestUser = (req as ExpressRequest).user;

    if (!requestUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if requester is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: requestUser.id }
    });

    if (!adminUser?.isAdmin) {
      return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        createdAt: true,
        lastLogin: true,
        loginCount: true,
        watchlistItems: true,
        predictions: true,
        activityLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Get watchlist for a user
app.get("/users/:userId/watchlist", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const requestUser = (req as ExpressRequest).user;

    // User can only get their own watchlist
    if (requestUser?.id !== userId) {
      return res.status(403).json({ error: "Can only access your own watchlist" });
    }

    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' }
    });

    res.json({ success: true, watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// Add to watchlist
app.post("/users/:userId/watchlist", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { symbol, companyName } = req.body;

    console.log('➕ Adding to watchlist:', { userId, symbol, companyName });

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const watchlistItem = await prisma.watchlistItem.upsert({
      where: { userId_symbol: { userId, symbol } },
      update: { addedAt: new Date() },
      create: { userId, symbol, companyName }
    });

    console.log('✅ Added to watchlist:', watchlistItem);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "add_watchlist",
        details: JSON.stringify({ symbol, companyName })
      }
    });

    res.json({ success: true, watchlistItem });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// Remove from watchlist
app.delete("/users/:userId/watchlist/:symbol", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const symbol = req.params.symbol;

    await prisma.watchlistItem.delete({
      where: { userId_symbol: { userId, symbol } }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "remove_watchlist",
        details: JSON.stringify({ symbol })
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

// Track prediction view
app.post("/users/:userId/predictions", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { symbol, companyName, predictedPrice } = req.body;

    console.log('📊 Tracking prediction:', { userId, symbol, companyName, predictedPrice });

    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const prediction = await prisma.userPrediction.create({
      data: {
        userId,
        symbol,
        companyName,
        predictedPrice
      }
    });

    console.log('✅ Prediction tracked:', prediction);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "view_prediction",
        details: JSON.stringify({ symbol, companyName, predictedPrice })
      }
    });

    res.json({ success: true, prediction });
  } catch (error) {
    console.error("Error tracking prediction:", error);
    res.status(500).json({ error: "Failed to track prediction" });
  }
});

// Mount user admin routes
app.use('/admin', usersRouter);

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