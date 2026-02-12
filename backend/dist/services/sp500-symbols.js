"use strict";
/**
 * BACKEND: Import from shared source
 * Re-export for compatibility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SP500_SYMBOLS_UNIQUE = exports.SP500_SYMBOLS = void 0;
exports.SP500_SYMBOLS = [
    // Mega Cap Technology
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL',
    // Large Cap Technology
    'CRM', 'ADBE', 'AMD', 'CSCO', 'ACN', 'IBM', 'INTU', 'TXN', 'QCOM', 'AMAT',
    'MU', 'INTC', 'ADI', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MCHP', 'FTNT', 'ANSS',
    'ROP', 'FICO', 'MPWR', 'APH', 'ADSK', 'MSI', 'KEYS', 'ZBRA', 'GDDY', 'PTC',
    'TYL', 'TER', 'TRMB', 'VRSN', 'AKAM', 'JNPR', 'FFIV', 'NTAP', 'STX', 'WDC',
    'HPE', 'HPQ', 'DELL', 'CTSH', 'GLW', 'ANET', 'PANW', 'CRWD', 'NOW', 'WDAY',
    'TEAM', 'DDOG', 'ZS', 'NET', 'OKTA', 'SNOW', 'MDB', 'PLTR',
    // Communication Services
    'NFLX', 'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'EA', 'TTWO', 'LYV',
    'NWSA', 'NWS', 'FOXA', 'FOX', 'OMC', 'IPG', 'MTCH', 'PARA',
    // Consumer Discretionary
    'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG', 'ABNB', 'CMG', 'MAR',
    'GM', 'F', 'HLT', 'ORLY', 'AZO', 'YUM', 'ROST', 'DHI', 'LEN', 'PHM',
    'NVR', 'POOL', 'TSCO', 'ULTA', 'DPZ', 'BBY', 'EBAY', 'ETSY', 'DRI', 'GPC',
    'LKQ', 'AAP', 'RL', 'TPR', 'HAS', 'WHR', 'LVS', 'WYNN', 'MGM', 'CZR',
    'NCLH', 'RCL', 'CCL', 'HRB', 'MHK', 'LEG', 'APTV', 'BWA', 'EXPE', 'TRVG',
    // Consumer Staples
    'WMT', 'PG', 'COST', 'KO', 'PEP', 'PM', 'MO', 'MDLZ', 'CL', 'KMB',
    'GIS', 'KHC', 'HSY', 'K', 'CAG', 'SJM', 'CPB', 'HRL', 'MKC', 'CHD',
    'CLX', 'TSN', 'KR', 'SYY', 'TAP', 'STZ', 'BF.B', 'MNST', 'KDP', 'DG',
    'DLTR', 'WBA', 'CVS', 'EL', 'ADM', 'BG', 'INGR',
    // Energy
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'WMB',
    'KMI', 'HES', 'HAL', 'BKR', 'FANG', 'DVN', 'MRO', 'APA', 'CTRA', 'OVV',
    'EQT', 'TRGP', 'OKE', 'LNG', 'CHRD',
    // Financials
    'BRK.B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'MS', 'GS', 'SPGI', 'BLK',
    'C', 'SCHW', 'AXP', 'CB', 'PGR', 'MMC', 'AON', 'ICE', 'CME', 'MCO',
    'USB', 'PNC', 'TFC', 'COF', 'AIG', 'MET', 'PRU', 'AFL', 'ALL', 'TRV',
    'AJG', 'HIG', 'CINF', 'WRB', 'L', 'GL', 'BRO', 'RJF', 'NTRS', 'STT',
    'BK', 'CFG', 'HBAN', 'RF', 'KEY', 'FITB', 'MTB', 'ZION', 'WTW', 'MKTX',
    'MSCI', 'FDS', 'BEN', 'IVZ', 'TROW', 'JEF', 'SF', 'CBOE', 'FI', 'AMP',
    'ALLY', 'DFS', 'SYF', 'NDAQ', 'LPLA',
    // Healthcare
    'UNH', 'LLY', 'JNJ', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'PFE', 'AMGN',
    'BMY', 'GILD', 'VRTX', 'CI', 'ELV', 'HUM', 'MCK', 'COR', 'CAH', 'ISRG',
    'REGN', 'ZTS', 'BSX', 'SYK', 'MDT', 'EW', 'BDX', 'A', 'IQV', 'IDXX',
    'HCA', 'DXCM', 'RMD', 'ALGN', 'PODD', 'HOLX', 'STE', 'BAX', 'TFX', 'TECH',
    'GEHC', 'SOLV', 'MOH', 'UHS', 'DVA', 'HSIC', 'VTRS', 'OGN', 'ZBH', 'BIIB',
    'MRNA', 'ILMN', 'EXAS', 'INCY', 'NBIX', 'ALNY', 'JAZZ', 'UTHR', 'RARE', 'IONS',
    'BMRN', 'SGEN', 'FOLD', 'BLUE', 'RGNX', 'ARVN', 'ARWR', 'FATE', 'SGMO', 'VCYT',
    // Industrials
    'GE', 'CAT', 'RTX', 'HON', 'UPS', 'BA', 'LMT', 'DE', 'UNP', 'ADP',
    'GD', 'NOC', 'ETN', 'ITW', 'MMM', 'EMR', 'CSX', 'WM', 'NSC', 'TT',
    'PH', 'PCAR', 'CMI', 'FDX', 'RSG', 'CARR', 'OTIS', 'IR', 'PAYX', 'FAST',
    'VRSK', 'ODFL', 'ROK', 'DOV', 'XYL', 'FTV', 'HUBB', 'AME', 'IEX', 'LDOS',
    'CPRT', 'J', 'EXPD', 'JBHT', 'CHRW', 'SNA', 'PNR', 'DAL', 'UAL', 'AAL',
    'LUV', 'ALK', 'GWW', 'WAB', 'TXT', 'ROL', 'AOS', 'GNRC', 'PWR', 'BLDR',
    'VMI', 'MLI', 'ALLE', 'AXON', 'HWM', 'MIDD', 'NDSN', 'AIT', 'RBC', 'CTAS',
    // Materials
    'LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'CTVA', 'DD', 'DOW', 'NUE',
    'VMC', 'MLM', 'PPG', 'STLD', 'ALB', 'CF', 'MOS', 'FMC', 'IFF', 'EMN',
    'CE', 'BALL', 'AVY', 'PKG', 'IP', 'AMCR', 'SEE', 'WRK', 'CLF', 'RS',
    // Real Estate
    'AMT', 'PLD', 'EQIX', 'PSA', 'WELL', 'DLR', 'O', 'SPG', 'VICI', 'CBRE',
    'EXR', 'IRM', 'AVB', 'EQR', 'VTR', 'SBAC', 'WY', 'INVH', 'MAA', 'ESS',
    'ARE', 'DOC', 'UDR', 'CPT', 'HST', 'REG', 'BXP', 'FRT', 'KIM', 'VNO',
    'SUI', 'PEAK', 'CCI', 'GLPI', 'LAMR',
    // Utilities
    'NEE', 'SO', 'DUK', 'CEG', 'SRE', 'AEP', 'VST', 'D', 'PCG', 'PEG',
    'EXC', 'XEL', 'ED', 'WEC', 'ES', 'AWK', 'DTE', 'PPL', 'AEE', 'CMS',
    'EIX', 'FE', 'ETR', 'CNP', 'NI', 'LNT', 'ATO', 'EVRG', 'PNW', 'NRG',
    'AES', 'PAYC',
];
// Vérifier que nous avons au moins 500 symboles uniques
const uniqueSymbols = [...new Set(exports.SP500_SYMBOLS)];
console.log(`Loaded ${uniqueSymbols.length} unique S&P 500 symbols`);
if (uniqueSymbols.length < 500) {
    console.warn(`Only ${uniqueSymbols.length} unique symbols found. Need 500 for full S&P 500.`);
}
exports.SP500_SYMBOLS_UNIQUE = uniqueSymbols;
